#!/usr/bin/env bash
# W03-SCENARIOS evidence pipeline, executed under the shared writer lock so no concurrent
# build can rewrite dist/ while frames are captured. The build step is intentionally omitted
# when the shared build is red (cross-unit syntax error) — dist byte-identity with this unit's
# source is verified separately by verify-dist-sync.mjs.
set -euo pipefail
cd "$(dirname "$0")/../.."

echo "== functional"
node writer-output/W03-SCENARIOS/functional.mjs | tail -2

echo "== carrier"
node writer-output/W03-SCENARIOS/carrier.mjs | tail -2

echo "== geometry"
node writer-output/W03-SCENARIOS/geometry.mjs | grep -E "^===|docFold|heads:|clipped:" | head -30

echo "== micro (L4)"
node writer-output/W03-SCENARIOS/micro.mjs | head -18

echo "== capture"
node writer-output/W03-SCENARIOS/capture.mjs --label evidence --viewports 1505x1045,1440x1000,1280x860,1024x800 | tail -6

echo "== ink"
python3 writer-output/W03-SCENARIOS/ink.py evidence | tail -30

echo "== dist sync"
node writer-output/W03-SCENARIOS/verify-dist-sync.mjs

echo "== report"
node writer-output/W03-SCENARIOS/build-report.mjs
