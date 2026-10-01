# CHECKPOINT PROTOCOL

A **checkpoint** is a verified recovery point on GitHub. It is not a commit alone.

## 1. What a checkpoint consists of

1. durable project changes
2. durable Controller state (`controller/state/**`)
3. durable Writer state (reports + status)
4. relevant evidence/lineage metadata
5. validation status
6. git commit
7. git push
8. **recorded remote commit SHA — verified on GitHub**

> A checkpoint is **NOT complete until the commit is verified on GitHub.**

## 2. The protocol

```
MEANINGFUL CHANGE
  -> VALIDATE
  -> CHECKPOINT (update controller/state/**)
  -> COMMIT
  -> PUSH
  -> VERIFY REMOTE SHA
  -> RECORD THE REMOTE SHA IN CHECKPOINTS.json + RESUME_STATE.json
  -> COMMIT THE UPDATED STATE
  -> PUSH AGAIN IF NECESSARY
```

Required commands:

```sh
git status
git diff
git add <explicit paths>
git commit
git push
git fetch origin
git rev-parse HEAD
git rev-parse origin/writer/mi-serial
git branch -vv
```

Final state after a checkpoint must be:

```
LOCAL VALIDATED STATE  ==  COMMITTED STATE  ==  REMOTE GITHUB STATE
```

for **all durable information**.

## 3. Checkpoint frequency — bounded, never spam

Do **not** create meaningless commits per command. Do **not** generate artificial commits to defeat inactivity.

**MANDATORY** checkpoint + push after:

- initial durable-state setup
- governance changes
- skill creation or change
- Writer packet changes
- dispatch changes
- a meaningful Writer milestone
- Writer completion
- integration of a significant Writer result
- shared-component modification
- a major remediation batch
- a test/validation milestone
- **before** a risky architectural operation
- **after** a risky architectural operation
- before ending a major execution wave
- before declaring a phase complete

**Periodic:** if meaningful durable work continues for 10–15 minutes with material changes worth preserving, checkpoint. Never for activity alone.

## 4. Checkpoint metadata (every checkpoint)

| field | meaning |
|---|---|
| `checkpoint_id` | monotonic id, e.g. `CP-2026-09-30-001` |
| `timestamp` | UTC ISO-8601 |
| `branch` | `writer/mi-serial` |
| `commit_sha` | the pushed commit |
| `parent_sha` | previous checkpoint commit |
| `controller_phase` | current phase |
| `execution_wave` | current wave |
| `active_writers` | units still running |
| `completed_surfaces` | reviewed/accepted surfaces |
| `in_progress_surfaces` | surfaces with live work |
| `blocked_surfaces` | surfaces blocked |
| `changed_areas` | areas touched |
| `validation_status` | tests/checks result |
| `next_action` | what the next Controller does |
| `rollback_reference` | prior safe recovery point |

The **latest checkpoint must be trivially identifiable** — it is the last entry in `CHECKPOINTS.json`.

## 5. Writer integration safety

The Controller owns the durable shared branch. Writers do **not** push.

```
WRITER -> isolated work -> report
       -> Controller integration
       -> Controller validation
       -> shared branch checkpoint
       -> push
```

- Writers must not run `git add` / `git commit` / `git push` (git index is a shared resource; concurrent commits race).
- Never lose a Writer's committed work.
- Never silently overwrite another Writer's commit.
- If a Writer-specific branch is created, record it in `RESUME_STATE.json` with its latest commit and integration status.

## 6. History policy

**Append-only.** Never force-push. Never rewrite shared checkpoint history. Never squash away recovery points. Never delete checkpoint commits.

## 7. Recovery safety check — run at every checkpoint

- [ ] no required change exists only as an uncommitted local modification
- [ ] important Writer results are committed
- [ ] Controller state is committed
- [ ] critical evidence metadata is committed
- [ ] branch is pushed
- [ ] remote SHA verified
- [ ] `RESUME_STATE.json` updated
- [ ] updated state committed
- [ ] pushed again if necessary

## 8. What must NOT be committed or pushed

Secrets: API keys, tokens, OAuth refresh tokens, private secrets, `.env` with secrets, Codespaces secrets, temporary auth material.

Junk: `node_modules`, runtime caches, temporary files, OS junk, transient terminal buffers, ephemeral session dumps (unless explicitly designated durable evidence), duplicated generated junk, arbitrary heartbeat output.

Use `.gitignore` appropriately. Do not turn Git into a dumping ground.


## 9. Checkpoint identity semantics

Never overload one SHA with three meanings. Record separately:
1. **checkpoint payload commit** — commit containing the durable payload;
2. **verification/state-record commit** — later commit recording verification;
3. **actual observed remote HEAD** — fetched from the remote at recovery/check time.

A state-record commit cannot contain its own future SHA. A stored verified payload SHA may therefore be one ancestor behind a later append-only recording commit without being false. Recovery must fetch the actual remote first and reconcile ancestry.
