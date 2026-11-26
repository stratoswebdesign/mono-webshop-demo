#!/bin/sh
# A weboldal összes renderje egymás után (hosszú futás). Napló: blender/out/render.log
cd "$(dirname "$0")/.."
B=/Applications/Blender.app/Contents/MacOS/Blender
LOG=blender/out/render.log
: > "$LOG"
run() {
  echo "=== $* $(date +%H:%M:%S)" >> "$LOG"
  "$B" -b --factory-startup --python blender/render_scene.py -- "$@" 2>&1 | grep -E "Error|Traceback|line [0-9]+|RENDER KÉSZ" >> "$LOG"
}
for scene in reggel este paros; do
  run "$scene" all --res 2200 --samples 300
done
for scene in reggel este paros; do
  run "$scene" close --samples 256
done
run reggel macro-label --samples 256
run reggel macro-cap --samples 256
run reggel macro-base --samples 256
run este macro-label --samples 256
run este macro-cap --samples 256
echo "=== MINDEN KÉSZ $(date +%H:%M:%S)" >> "$LOG"
