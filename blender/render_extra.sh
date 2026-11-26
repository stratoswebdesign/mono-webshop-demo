#!/bin/sh
# Kiegészítő renderek: egyes képek újrarenderelése a teljes kör nélkül.
#   sh blender/render_extra.sh "reggel macro-label" "este macro-label"
cd "$(dirname "$0")/.."
B=/Applications/Blender.app/Contents/MacOS/Blender
LOG=blender/out/render-extra.log
: > "$LOG"
for job in "$@"; do
  echo "=== $job $(date +%H:%M:%S)" >> "$LOG"
  # shellcheck disable=SC2086
  "$B" -b --factory-startup --python blender/render_scene.py -- $job 2>&1 | grep -E "Error|Traceback|line [0-9]+|RENDER KÉSZ" >> "$LOG"
done
node blender/publish.mjs >> "$LOG" 2>&1
echo "=== MINDEN KÉSZ $(date +%H:%M:%S)" >> "$LOG"
