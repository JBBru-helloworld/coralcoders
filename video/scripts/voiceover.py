"""
Voiceover pipeline: the owner's recordings to a cleaned voice, word timings,
src/timeline.json (which every scene reads) and the SRT.

1. Clean each recordings/line-N.m4a with ffmpeg into public/vo/line-N.wav:
   48 kHz, high-pass at 80 Hz, leading and trailing silence trimmed to 50 ms,
   gentle compression, light de-essing. No reverb, no noise reduction (the
   recordings' noise floor is about -65 dB).
2. Word timings from faster-whisper (medium.en, primed with the script so
   it spells "SQL" and "1:1" consistently), cross-checked against a second
   model (small.en); any word whose start differs by more than 80 ms is
   reported.
3. Both transcripts are matched against the script. The second model is not
   primed, so it is the honest check for a misread or clipped word.
4. Word starts after a pause are snapped to the audio's own onset (energy
   rising out of silence) when either model is within 150 ms of it, so cuts
   land on the sound, not on a model's estimate.
5. Lines are laid end to end with each line's `pause` before it.

Cached: a line is re-cleaned only when its recording or the chain changes,
and re-transcribed only when its cleaned audio changes.

Run from video/:  .venv/bin/python scripts/voiceover.py
"""

import difflib
import hashlib
import json
import math
import re
import subprocess
from pathlib import Path

import numpy as np

from vo_script import LINES, subtitle

ROOT = Path(__file__).resolve().parent.parent
RECORDINGS = ROOT / "recordings"
VO = ROOT / "public" / "vo"
CACHE = VO / "cache.json"
TIMELINE = ROOT / "src" / "timeline.json"
SRT = ROOT / "out" / "coral-coders-launch.srt"

FPS = 30
END_HOLD = 1.5
PRIMARY_MODEL = "medium.en"
CHECK_MODEL = "small.en"
DISAGREE = 0.08
SNAP = 0.15

_trim = "silenceremove=start_periods=1:start_duration=0.03:start_threshold=-48dB:start_silence=0.05:detection=rms"
CHAIN = ",".join(
    [
        "highpass=f=80",
        _trim,
        "areverse",
        _trim,
        "areverse",
        "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=140:knee=4",
        "deesser=i=0.2:m=0.5:f=0.5",
        "aresample=48000",
    ]
)


def sha(*parts: bytes | str) -> str:
    h = hashlib.sha256()
    for part in parts:
        h.update(part if isinstance(part, bytes) else part.encode())
    return h.hexdigest()[:16]


def recording(n: int) -> Path:
    found = sorted(RECORDINGS.glob(f"line-{n}.*"))
    if not found:
        raise SystemExit(f"Missing recording for line {n}: {RECORDINGS}/line-{n}.m4a")
    return found[0]


def clean(src: Path, dst: Path) -> None:
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(src), "-af", CHAIN, "-ac", "1", "-ar", "48000", "-c:a", "pcm_s24le", str(dst)],
        check=True,
    )


def load16k(path: Path) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(raw, np.float32)


def duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True,
        text=True,
        check=True,
    ).stdout
    return float(out)


def transcribe(model, audio: np.ndarray, prompt: str | None) -> list[dict]:
    segments, _ = model.transcribe(audio, beam_size=5, word_timestamps=True, initial_prompt=prompt, language="en")
    return [{"word": w.word.strip(), "start": w.start, "end": w.end} for s in segments for w in s.words]


# Spoken-form normalisation, so "1:1", "one-to-one", "S.Q.L.", "sequel" and
# "coralcoders.com" all compare equal to the script's spoken words.
ALIASES = {"1:1": "one to one", "1": "one", "6": "six", "9": "nine", "12": "twelve", "ai": "a i", "sql": "s q l", "coralcoders": "coral coders"}
for _line in LINES.values():
    for _, spoken in _line["words"]:
        first, *others = spoken.split("|")
        for other in others:
            ALIASES[other] = first


def normalise(text: str) -> list[str]:
    text = text.lower()
    text = re.sub(r"\.com\b", " dot com", text)
    text = re.sub(r"\b([a-z])\.(?=[a-z]\.)", r"\1 ", text)  # a.i. -> a i
    if text.strip(" .,:;!?") in ALIASES:
        text = ALIASES[text.strip(" .,:;!?")]
    text = text.replace("-", " ")
    tokens = []
    for token in re.sub(r"[^a-z0-9: ]", " ", text).split():
        tokens.extend(ALIASES.get(token, token).split())
    return tokens


def align(n: int, words: list[dict]) -> tuple[list[dict], list[str]]:
    """Subtitle words with times (seconds into the cleaned line), and problems found."""
    expected: list[str] = []
    owner: list[int] = []  # subtitle word index of each expected token
    for i, (_, spoken) in enumerate(LINES[n]["words"]):
        for token in normalise(spoken.split("|")[0]):
            expected.append(token)
            owner.append(i)
    heard: list[str] = []
    span: list[tuple[float, float]] = []
    for w in words:
        tokens = normalise(w["word"]) or []
        step = (w["end"] - w["start"]) / max(1, len(tokens))
        for k, token in enumerate(tokens):
            heard.append(token)
            span.append((w["start"] + k * step, w["start"] + (k + 1) * step))

    matcher = difflib.SequenceMatcher(None, expected, heard, autojunk=False)
    hit: dict[int, int] = {}
    for block in matcher.get_matching_blocks():
        for k in range(block.size):
            hit[block.a + k] = block.b + k

    problems = []
    for tag, a0, a1, b0, b1 in matcher.get_opcodes():
        if tag != "equal":
            problems.append(f"expected '{' '.join(expected[a0:a1])}', heard '{' '.join(heard[b0:b1])}'")

    out = []
    total = len(LINES[n]["words"])
    for i, (text, _) in enumerate(LINES[n]["words"]):
        idx = [hit[j] for j, o in enumerate(owner) if o == i and j in hit]
        out.append({"text": text, "start": span[idx[0]][0] if idx else None, "end": span[idx[-1]][1] if idx else None})
    # Unheard words: share the gap between their heard neighbours.
    for i, w in enumerate(out):
        if w["start"] is None:
            prev = next((out[j]["end"] for j in range(i - 1, -1, -1) if out[j]["end"] is not None), 0.0)
            nxt = next((out[j]["start"] for j in range(i + 1, total) if out[j]["start"] is not None), prev + 0.3)
            w["start"], w["end"] = prev, max(prev + 0.05, nxt)
    return out, problems


def onsets(path: Path) -> list[float]:
    """Times where speech rises out of at least 60 ms of silence (20 ms frames)."""
    audio = load16k(path)
    hop = 320
    level = [
        20 * math.log10(math.sqrt(float(np.mean(audio[i : i + hop] ** 2))) + 1e-9)
        for i in range(0, len(audio) - hop, hop)
    ]
    found, quiet = [], 3
    for k, db in enumerate(level):
        if db < -45:
            quiet += 1
        elif db > -35:
            if quiet >= 3:
                found.append(k * hop / 16000)
            quiet = 0
    return found


def snap(words: list[dict], check: list[dict], marks: list[float]) -> list[str]:
    """
    Move word starts onto nearby onsets; returns what moved. An onset goes to
    the word whose estimates (either model) are nearest to it, and words stay
    in order, so two words never share an onset.
    """

    def distance(i: int, m: float) -> float:
        return min(abs(m - words[i]["start"]), abs(m - check[i]["start"]))

    moved = []
    floor = -1.0
    for i, w in enumerate(words):
        candidates = [
            m
            for m in marks
            if m > floor + 0.08
            and distance(i, m) <= SNAP
            and (i + 1 == len(words) or distance(i, m) <= distance(i + 1, m))
        ]
        if not candidates:
            floor = max(floor, w["start"])
            continue
        m = min(candidates, key=lambda m: distance(i, m))
        floor = m
        if abs(m - w["start"]) < 0.02:
            continue
        before = w["start"]
        w["start"] = m
        if i > 0:
            words[i - 1]["end"] = min(words[i - 1]["end"], m)
        w["end"] = max(w["end"], m + 0.05)
        moved.append(f"'{w['text']}' {(m - before) * 1000:+.0f} ms")
    return moved


def main() -> None:
    from faster_whisper import WhisperModel

    VO.mkdir(parents=True, exist_ok=True)
    SRT.parent.mkdir(parents=True, exist_ok=True)
    cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}
    models = {}

    def model(name: str):
        if name not in models:
            models[name] = WhisperModel(name, device="cpu", compute_type="int8")
        return models[name]

    report = []
    lines = []
    t = 0.0
    for n in sorted(LINES):
        src = recording(n)
        dst = VO / f"line-{n}.wav"
        key = sha(src.read_bytes(), CHAIN)
        entry = cache.get(str(n), {})
        if entry.get("clean") != key or not dst.exists():
            clean(src, dst)
            entry = {"clean": key}
        audio_key = sha(dst.read_bytes())
        if entry.get("audio") != audio_key:
            audio = load16k(dst)
            prompt = subtitle(n)
            entry = {
                "clean": key,
                "audio": audio_key,
                PRIMARY_MODEL: transcribe(model(PRIMARY_MODEL), audio, prompt),
                CHECK_MODEL: transcribe(model(CHECK_MODEL), audio, None),
            }
        cache[str(n)] = entry

        words, problems = align(n, entry[PRIMARY_MODEL])
        check, check_problems = align(n, entry[CHECK_MODEL])
        problems += [f"{p} ({CHECK_MODEL})" for p in check_problems]
        disagreements = [
            f"'{a['text']}' {abs(a['start'] - b['start']) * 1000:.0f} ms"
            for a, b in zip(words, check)
            if abs(a["start"] - b["start"]) > DISAGREE
        ]
        snapped = snap(words, check, onsets(dst))
        length = duration(dst)
        t += LINES[n]["pause"]
        lines.append(
            {
                "n": n,
                "file": f"vo/line-{n}.wav",
                "start": round(t, 3),
                "end": round(t + length, 3),
                "subtitle": subtitle(n),
                "kinetic": LINES[n]["kinetic"],
                "words": [
                    {"text": w["text"], "start": round(t + w["start"], 3), "end": round(t + w["end"], 3)} for w in words
                ],
            }
        )
        report.append(
            {
                "n": n,
                "heard": " ".join(w["word"] for w in entry[CHECK_MODEL]),
                "problems": problems,
                "disagreements": disagreements,
                "snapped": snapped,
                "length": length,
            }
        )
        t += length

    CACHE.write_text(json.dumps(cache, indent=1))
    voice_end = t
    total = voice_end + END_HOLD
    TIMELINE.write_text(
        json.dumps(
            {
                "fps": FPS,
                "voiceEnd": round(voice_end, 3),
                "durationInFrames": math.ceil(total * FPS),
                "lines": lines,
            },
            indent=2,
        )
        + "\n"
    )

    def stamp(s: float) -> str:
        ms = round(s * 1000)
        return f"{ms // 3_600_000:02}:{ms // 60_000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"

    SRT.write_text(
        "\n".join(
            f"{i}\n{stamp(line['words'][0]['start'])} --> {stamp(line['words'][-1]['end'] + 0.25)}\n{line['subtitle']}\n"
            for i, line in enumerate(lines, 1)
        )
    )

    for r, line in zip(report, lines):
        status = "ok" if not r["problems"] else "CHECK: " + "; ".join(r["problems"])
        print(f"line {r['n']}  {line['start']:6.2f} to {line['end']:6.2f}s  ({r['length']:.2f}s)  {status}")
        print(f"         heard: {r['heard']}")
        if r["disagreements"]:
            print(f"         timing disagreements over 80 ms: {', '.join(r['disagreements'])}")
        if r["snapped"]:
            print(f"         snapped to onset: {', '.join(r['snapped'])}")
    print(f"voice ends {voice_end:.2f}s, total {total:.2f}s ({math.ceil(total * FPS)} frames)")


if __name__ == "__main__":
    main()
