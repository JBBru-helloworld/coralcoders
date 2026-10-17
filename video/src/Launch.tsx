import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { CoralField } from "./components/CoralField";
import { Subtitles } from "./components/Subtitles";
import { beats, sandAmount } from "./lib/beats";
import { type Format, clamp01, colours, layouts, mix } from "./lib/theme";
import { FPS, frames, timeline } from "./lib/timeline";
import { Adults, Ages, EndCard, FirstLessonFree, ItGrows, LoopSprite, StartsSmall, TaughtBy, Wordmark4 } from "./scenes/Scenes";

export type LaunchProps = { format: Format; music: boolean; sfx: boolean };

/*
 * Music level, set against the voice (about -22 LUFS before mastering; the
 * Pixabay track is about -7 LUFS): -20 dB in the open, ducked a further
 * 13 dB while the voice speaks, so it sits roughly 10 to 12 dB under the
 * words as heard (measured on the render).
 * The duck holds through short gaps (no pumping) and lifts only in the long
 * pauses and over the end card, then fades out over the last second.
 */
const MUSIC_DB = -20;
const DUCK_DB = 13;
function musicVolume(frame: number): number {
  const t = frame / FPS;
  const speaking = Math.max(
    0,
    ...timeline.lines.map((l) => {
      const into = clamp01((t - (l.start - 0.3)) / 0.3);
      const outOf = clamp01((l.end + 0.7 - t) / 0.5);
      return Math.min(into, outOf);
    }),
  );
  const db = MUSIC_DB - DUCK_DB * speaking;
  const end = timeline.durationInFrames / FPS;
  const fade = clamp01((end - t) / 1);
  return 10 ** (db / 20) * fade;
}

export function Launch({ format, music, sfx }: LaunchProps) {
  const frame = useCurrentFrame();
  const layout = layouts[format];
  const t = frame / FPS;

  return (
    <AbsoluteFill style={{ backgroundColor: mix(colours.ink, colours.sand, sandAmount(t)) }}>
      {/* Mounted by time, not in a <Sequence>: scenes use absolute cue times. */}
      {t <= beats.toSand.to + 0.05 ? <CoralField layout={layout} mode="hero" /> : null}

      <StartsSmall layout={layout} />
      <LoopSprite layout={layout} />
      <ItGrows layout={layout} />
      <Wordmark4 layout={layout} />
      <Ages layout={layout} />
      <Adults layout={layout} />
      <TaughtBy layout={layout} />
      <FirstLessonFree layout={layout} />
      {t >= beats.endCoralAt - 0.05 ? <EndCard layout={layout} /> : null}

      <Subtitles layout={layout} />

      {timeline.lines.map((l) => (
        <Sequence key={l.n} from={frames(l.start)} layout="none">
          <Audio src={staticFile(l.file)} />
        </Sequence>
      ))}
      {sfx ? (
        <>
          <Sequence from={frames(beats.growAt - 0.35)} layout="none">
            <Audio src={staticFile("vo/sfx-whoosh.wav")} volume={0.8} />
          </Sequence>
          <Sequence from={frames(beats.press)} layout="none">
            <Audio src={staticFile("vo/sfx-click.wav")} volume={0.45} />
          </Sequence>
        </>
      ) : null}
      {music ? <Audio src={staticFile("music/track.mp3")} volume={musicVolume} /> : null}
    </AbsoluteFill>
  );
}
