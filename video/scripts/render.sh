#!/bin/sh
# Render, master and review the launch advert. Run from video/:
#
#   sh scripts/render.sh draft   9:16 main render + contact sheet (gate 2)
#   sh scripts/render.sh final   every version: 9:16, 9:16 no music, 4:5, poster
#
# Masters each render to -14 LUFS integrated, -1 dBTP true peak (two-pass
# loudnorm, video stream copied untouched) and prints the measured values.
set -e
cd "$(dirname "$0")/.."
mode=${1:-draft}
mkdir -p out/raw

render() { # composition id, output name
  pnpm exec remotion render src/index.ts "$1" "out/raw/$2" \
    --codec=h264 --crf=18 --pixel-format=yuv420p \
    --audio-codec=aac --audio-bitrate=320k --sample-rate=48000 --log=info
  master "out/raw/$2" "out/$2"
}

master() { # in, out
  stats=$(ffmpeg -hide_banner -nostats -i "$1" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  get() { printf '%s' "$stats" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s)['$1']))"; }
  ffmpeg -v error -y -i "$1" -c:v copy \
    -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000" \
    -c:a aac -b:a 320k -ar 48000 -movflags +faststart "$2"
  measured=$(ffmpeg -hide_banner -nostats -i "$2" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary:/,$p')
  printf '%s: %s LUFS integrated, %s dBTP true peak\n' "$2" \
    "$(printf '%s' "$measured" | awk '/^ *I:/ {print $2}')" \
    "$(printf '%s' "$measured" | awk '/^ *Peak:/ {print $2}')"
}

sheet() { # video, output png: the first and last frames plus the middle of every scene
  frames=$(node -e '
    const t = require("./src/timeline.json");
    const mid = (l) => Math.round(((l.start + l.end) / 2) * t.fps);
    const picks = [0, ...t.lines.map(mid), t.durationInFrames - 1];
    console.log(picks.map((n) => "eq(n\\," + n + ")").join("+"));
  ')
  count=$(printf '%s' "$frames" | awk -F+ '{print NF}')
  cols=4
  rows=$(( (count + cols - 1) / cols ))
  ffmpeg -v error -y -i "$1" \
    -vf "select='$frames',scale=360:-1,tile=${cols}x${rows}:padding=8:margin=8:color=0x333333" \
    -frames:v 1 -fps_mode vfr "$2"
  echo "$2 ($count frames)"
}

render Launch-9x16 coral-coders-launch-9x16.mp4
sheet out/raw/coral-coders-launch-9x16.mp4 out/review-sheet.png

if [ "$mode" = final ]; then
  render Launch-9x16-NoMusic coral-coders-launch-9x16-no-music.mp4
  render Launch-4x5 coral-coders-launch-4x5.mp4
  # Reel cover: the first frame with every particle settled (the assembly
  # starts 0.08 s before "it" and takes 1.6 s), with "it grows." still up.
  poster=$(node -e 't=require("./src/timeline.json");const it=t.lines[2].words.find(w=>w.text==="it").start;console.log(Math.ceil((it-0.08+1.62)*t.fps))')
  pnpm exec remotion still src/index.ts Launch-9x16 out/coral-coders-launch-poster.jpg --frame="$poster" --image-format=jpeg --jpeg-quality=95
fi

for f in out/coral-coders-launch*.mp4; do
  ffprobe -v error -show_entries format=duration,size:stream=width,height,codec_name,pix_fmt,sample_rate -of compact=p=0:nk=1 "$f" | tr '\n' ' '
  echo " $f"
done
