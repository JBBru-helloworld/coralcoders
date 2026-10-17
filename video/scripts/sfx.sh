#!/bin/sh
# Sound design, synthesised with ffmpeg (no samples, so no licence to track).
# Writes public/vo/sfx-whoosh.wav and public/vo/sfx-click.wav (gitignored).
# Run from video/:  sh scripts/sfx.sh
set -e
out=public/vo
mkdir -p "$out"

# A soft, airy whoosh: band-limited pink noise with a slow swell and release,
# a touch of stereo width from two decorrelated noise sources.
ffmpeg -v error -y \
  -f lavfi -i "anoisesrc=color=pink:duration=1.9:amplitude=0.6:seed=7:sample_rate=48000" \
  -f lavfi -i "anoisesrc=color=pink:duration=1.9:amplitude=0.6:seed=11:sample_rate=48000" \
  -filter_complex "[0][1]join=inputs=2:channel_layout=stereo,highpass=f=350,lowpass=f=3200,afade=t=in:d=0.95:curve=qsin,afade=t=out:st=0.95:d=0.95:curve=qsin,volume=-6dB" \
  -c:a pcm_s24le "$out/sfx-whoosh.wav"

# A gentle click: a short, damped high tick over a soft low tap.
ffmpeg -v error -y \
  -f lavfi -i "aevalsrc='0.35*sin(2*PI*1600*t)*exp(-t*220)+0.45*sin(2*PI*180*t)*exp(-t*55)':d=0.14:s=48000" \
  -af "lowpass=f=6000,afade=t=out:st=0.1:d=0.04" \
  -ac 2 -c:a pcm_s24le "$out/sfx-click.wav"

echo "$out/sfx-whoosh.wav $out/sfx-click.wav"
