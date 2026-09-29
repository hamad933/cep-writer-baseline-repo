#!/usr/bin/env bash
# writer-serial.sh — serialize ONLY the commands that write repo-wide derived outputs.
#
# Parallel Writers are allowed to edit disjoint source trees concurrently. The single
# genuinely conflicting resource is the shared derived output written by:
#   node tools/build-runtime.mjs   -> dist/**
#   npm test                       -> assurance/MODEL_TEST_RESULTS.json
#   npm run check                  -> assurance/CONTRACT_TEST_RESULTS.json (+ others)
#   npm run browser:test           -> assurance/BROWSER_CONFORMANCE_RECEIPT.json + png
#
# Wrap any such command in this script to take an exclusive lock:
#     tools/writer-serial.sh node tools/build-runtime.mjs
#     tools/writer-serial.sh npm run check
#     tools/writer-serial.sh bash -c 'npm test && npm run check'
#
# Do NOT use this to hold a lock while you think/edit — only around the mutating command.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK_DIR="$REPO_ROOT/writer-output/_coordinator"
mkdir -p "$LOCK_DIR"
if [ "$#" -eq 0 ]; then
  echo "usage: writer-serial.sh <command> [args...]" >&2
  exit 2
fi
exec flock -w 2400 "$LOCK_DIR/.writer-serial.lock" "$@"
