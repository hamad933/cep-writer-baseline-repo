# RESUME — how to recover this execution from GitHub alone

**Read this first if you are a NEW Controller in a NEW Codespace.**

> **THE CODESPACE IS A WORKER. GITHUB IS THE DURABLE MEMORY.**

## The three things you must NOT assume

- **DO NOT assume Codespace state.** The filesystem may be gone, stale, or a different machine.
- **DO NOT assume OpenCode session state.** Prior session memory is not authority.
- **DO NOT assume previous chat state.** Nothing in a transcript is durable.

Only the GitHub remote branch is durable truth.

---

## 1. Recovery procedure (brand-new Codespace)

```sh
# 1. clone / open
git clone https://github.com/hamad933/cep-writer-baseline-repo
cd cep-writer-baseline-repo

# 2. fetch and verify the durable branch
git fetch origin --prune
git branch -vv
git ls-remote --heads origin writer/mi-serial

# 3. checkout the durable checkpoint branch
git checkout writer/mi-serial
git rev-parse HEAD          # this is your recovery point

# 4. install runtime deps
npm ci
```

## 2. Reconstruct the execution

```sh
# 5. read durable state (human + machine)
cat controller/state/RESUME_STATE.md
cat controller/state/RESUME_STATE.json

# 6. identify the latest checkpoint
cat controller/state/CHECKPOINTS.json

# 7. read current governance
cat controller/09_writer_forge/VISUAL_EXECUTION_STANDARD.md   # binding standard
cat controller/10_dispatch/PARALLEL_EXECUTION_PLAN.md          # waves + coverage matrix
cat controller/10_dispatch/SURFACE_DISPATCH_MATRIX.json        # 23 units, ownership, references

# 8. read registers
cat controller/13_visual_control/PREPARATION_GAP_REGISTER.md
cat controller/13_visual_control/CONTROLLER_REGISTERS.md

# 9. verify the tree still builds and tests green
npm run build:runtime
npm test          # expect 210/0
node tools/check-build-authority.mjs   # expect pass=true, parity true
```

## 3. Reconstruct active work

1. Identify active Writers: `RESUME_STATE.json` → `activeWriterSessions` and `writers`.
2. Identify each surface's status: `surfaces.reviewed` / `surfaces.inProgress` / `surfaces.notDispatched`.
3. Inspect blockers: `RESUME_STATE.json` → `knownBlockers`.
4. Inspect pending integration seams: `RESUME_STATE.json` → `pendingIntegrationSeams`.
5. Inspect governance version and skills: `RESUME_STATE.json` → `controller`.
6. Inspect last validation: `RESUME_STATE.json` → `validation`.
7. **Resume from the recorded `nextActions` list.** Do not invent a new plan.

## 4. Restarting Writers

Each Writer unit is defined by its packet:

```
controller/09_writer_forge/surface_units/<UNIT>_SURFACE_PACKET.md
```

A restarted Writer must be told:
- its writable roots (from the packet),
- what already exists on disk (see `writer-output/<UNIT>/` and `RESUME_STATE.json` → `writers[unit].uncommittedPathEntries`),
- **preserve existing work — do not restart, do not revert** (contract §17: no reset),
- the binding standard `controller/09_writer_forge/VISUAL_EXECUTION_STANDARD.md`,
- the four skills: `visual-surface-composition`, `visual-fidelity-review`, `shared-component-governance`, `professional-ui-ux-composition`.

Writer model: `xiaomi-token-plan-sgp/mimo-v2.6-flash`. Controller model: `xiaomi-token-plan-sgp/mimo-v2.6-pro`.

## 5. Never do these

- Do **not** `git push --force`. History is append-only (§17).
- Do **not** squash or delete checkpoint commits.
- Do **not** mark a surface complete because a Writer said "PASS". Sole Controller review is required.
- Do **not** commit secrets, credentials, tokens, `.env`, or `node_modules`.
- Do **not** re-derive work already recorded in a Writer's `VISUAL_EXECUTION_REPORT.json` — inherit it.

## 6. Bootstrap script

A deterministic bootstrap is provided:

```sh
./controller/state/bootstrap.sh
```

It performs FETCH → VERIFY BRANCH → READ RESUME STATE → VERIFY LAST CHECKPOINT → VERIFY WORKTREE → REPORT, and prints the exact recovery point without needing any prior transcript.
