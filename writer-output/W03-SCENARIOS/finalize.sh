#!/usr/bin/env bash
# W03-SCENARIOS final evidence pipeline (all builds serialized through writer-serial.sh).
set -euo pipefail
cd "$(dirname "$0")/../.."

echo "== build (serialized)"
tools/writer-serial.sh npm run build:runtime >/tmp/opencode/final-build.log 2>&1
echo "build ok"

echo "== functional"
node writer-output/W03-SCENARIOS/functional.mjs | tail -3

echo "== carrier"
node writer-output/W03-SCENARIOS/carrier.mjs | tail -3

echo "== geometry"
node writer-output/W03-SCENARIOS/geometry.mjs | grep -E "^===|docFold|heads:" | head -24

echo "== micro (L4)"
node writer-output/W03-SCENARIOS/micro.mjs | head -20

echo "== capture"
node writer-output/W03-SCENARIOS/capture.mjs --label evidence --viewports 1505x1045,1440x1000,1280x860,1024x800 | tail -6

echo "== ink"
python3 writer-output/W03-SCENARIOS/ink.py evidence | tail -40

echo "== report"
node writer-output/W03-SCENARIOS/build-report.mjs
