#!/usr/bin/env bash
# CEP Controller bootstrap — deterministic reconstruction from GitHub alone.
# Contract: FETCH -> VERIFY BRANCH -> READ RESUME STATE -> READ GOVERNANCE ->
#           VERIFY LAST CHECKPOINT -> VERIFY WORKTREE -> RECONSTRUCT -> RESUME
#
# This script assumes NOTHING about Codespace, OpenCode session, or chat state.
set -uo pipefail

BRANCH="writer/mi-serial"
ok()   { printf '  [OK]   %s\n' "$1"; }
warn() { printf '  [WARN] %s\n' "$1"; }
fail() { printf '  [FAIL] %s\n' "$1"; FAILED=1; }
FAILED=0

echo "=== CEP CONTROLLER BOOTSTRAP ==="
echo "timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo
echo "--- 1. FETCH ---"
if git fetch origin --prune 2>/dev/null; then ok "git fetch origin --prune"; else warn "fetch failed (offline?) — continuing on local truth"; fi

echo
echo "--- 2. VERIFY BRANCH ---"
CUR="$(git branch --show-current 2>/dev/null)"
if [ "$CUR" = "$BRANCH" ]; then ok "on $BRANCH"; else warn "on '$CUR' — checkout $BRANCH"; fi

LOCAL_HEAD="$(git rev-parse HEAD)"
echo "  LOCAL_HEAD  = $LOCAL_HEAD"

if git ls-remote --heads origin "$BRANCH" | grep -q .; then
  ok "origin/$BRANCH exists"
  REMOTE_HEAD="$(git rev-parse "origin/$BRANCH" 2>/dev/null || echo UNKNOWN)"
  echo "  REMOTE_HEAD = $REMOTE_HEAD"
  if [ "$LOCAL_HEAD" = "$REMOTE_HEAD" ]; then
    ok "local and remote agree"
  else
    AHEAD=$(git rev-list --count "origin/$BRANCH..HEAD" 2>/dev/null)
    BEHIND=$(git rev-list --count "HEAD..origin/$BRANCH" 2>/dev/null)
    warn "divergence: ahead=$AHEAD behind=$BEHIND — reconcile safely, NEVER force-push"
  fi
else
  warn "origin/$BRANCH does NOT exist — push it with: git push -u origin $BRANCH"
fi

echo
echo "--- 3. READ RESUME STATE ---"
for f in controller/state/RESUME_STATE.md controller/state/RESUME_STATE.json controller/state/CHECKPOINTS.json; do
  if [ -f "$f" ]; then ok "$f"; else fail "$f MISSING"; fi
done

echo
echo "--- 4. READ GOVERNANCE ---"
for f in controller/09_writer_forge/VISUAL_EXECUTION_STANDARD.md \
         controller/10_dispatch/PARALLEL_EXECUTION_PLAN.md \
         controller/10_dispatch/SURFACE_DISPATCH_MATRIX.json \
         controller/13_visual_control/CONTROLLER_REGISTERS.md \
         controller/13_visual_control/PREPARATION_GAP_REGISTER.md; do
  if [ -f "$f" ]; then ok "$f"; else fail "$f MISSING"; fi
done

echo
echo "--- 5. SKILLS ---"
for s in visual-surface-composition visual-fidelity-review shared-component-governance professional-ui-ux-composition; do
  if [ -f ".opencode/skills/$s/SKILL.md" ]; then ok "skill $s"; else fail "skill $s MISSING"; fi
done

echo
echo "--- 6. VERIFY LAST CHECKPOINT ---"
if [ -f controller/state/CHECKPOINTS.json ]; then
  python3 - <<'PY'
import json,sys
try:
    d=json.load(open("controller/state/CHECKPOINTS.json"))
    cps=d.get("checkpoints",[])
    if cps:
        c=cps[-1]
        print(f"  [OK]   latest checkpoint: {c.get('checkpoint_id')} @ {c.get('commit_sha')}")
        print(f"         phase={c.get('controller_phase')} wave={c.get('execution_wave')}")
        print(f"         next_action={c.get('next_action')}")
    else:
        print("  [WARN] no checkpoints recorded yet")
except Exception as e:
    print(f"  [FAIL] CHECKPOINTS.json unreadable: {e}")
PY
fi

echo
echo "--- 7. VERIFY WORKTREE ---"
MOD=$(git status --porcelain | grep -c '^ M' || true)
UNT=$(git status --porcelain | grep -c '^??' || true)
echo "  modified=$MOD untracked=$UNT"
if [ "$MOD" -eq 0 ] && [ "$UNT" -eq 0 ]; then
  ok "worktree clean — nothing at risk"
else
  warn "worktree has uncommitted changes — read RESUME_STATE.json -> writers[].uncommittedPathEntries"
  warn "contract §13: no required change may exist ONLY as an uncommitted local modification"
fi

echo
echo "--- 8. VALIDATION SNAPSHOT ---"
if [ -f controller/state/RESUME_STATE.json ]; then
  python3 - <<'PY'
import json
d=json.load(open("controller/state/RESUME_STATE.json"))
s=d.get("surfaces",{})
print(f"  surfaces: total={s.get('total')} reviewed={len(s.get('reviewed',[]))} inProgress={len(s.get('inProgress',[]))} notDispatched={len(s.get('notDispatched',[]))}")
print(f"  reviewed     : {', '.join(s.get('reviewed',[]))}")
print(f"  notDispatched: {', '.join(s.get('notDispatched',[]))}")
print("  next actions :")
for a in d.get("nextActions",[]): print(f"    - {a}")
PY
fi

echo
echo "=== RECOVERY POINT: $(git rev-parse HEAD) ==="
[ "$FAILED" -eq 0 ] && echo "BOOTSTRAP RESULT: READY" || echo "BOOTSTRAP RESULT: ATTENTION REQUIRED"
exit $FAILED
