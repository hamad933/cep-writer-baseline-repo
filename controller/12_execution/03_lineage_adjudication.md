# 12_execution / 03_lineage_adjudication — candidate identity under parallel execution

Timestamp: 2026-09-29T04:05Z · Class: **LINEAGE** · Raised by: W01 Writer · Adjudicated by: Writer Coordinator

## 1. The issue (W01's report, preserved verbatim in substance)

Owner-directed parallel execution put W02/W03/W04/W05 into the same worktree while W01 was measuring.
`stack/native-typescript/**` modified paths went **3 → 14** during W01's run, including one file that
appeared inside a 60-second window in which W01 ran no command. Consequently the dispatch-declared
worktree candidate `WORKTREE_VARIANT:c82cec63…cb5f / 287 files` **no longer recomputes** (measured
`ac424340…` at W01's capture, `d174ec0f…` at this adjudication — same file count, different content).

W01 recorded this honestly as `DRIFT_RECORDED__CONCURRENT_SIBLING_WORKSPACE_EDITS` in its receipt,
conformance output, evidence index and handoff. It did **not** suppress the observation, did **not**
fail its own proofs against a candidate it could not hold, and did **not** rewrite evidence. This is
the correct behaviour and is accepted.

## 2. Classification

| Aspect | Class | Reason |
|---|---|---|
| Receipt binding to a whole-worktree hash | **LINEAGE** | `browser_contract.md` §2: "A receipt whose candidate binding cannot be matched to the executed source is LINEAGE" |
| Underlying product behaviour | **NOT PRODUCT** | nothing in the product changed identity; only sibling workspaces' in-flight files moved |
| W01 evidence integrity | **VALID** | every artifact is bound to a real measured execution and hash-bound |

**No repair loop is opened.** Per mission §20: classify → preserve evidence → determine ownership →
repair only if packet-authorized → re-run the minimal flow. The ownership here is the Coordinator's
identity model, not any Writer's product.

## 3. Adjudication

The whole-worktree digest is **not a valid per-writer candidate identity when Writers run in parallel**.
It was valid at dispatch because exactly one writer was assumed. That assumption changed by Owner
authority (`02_parallel_dispatch.md`), so the identity model must change with it — otherwise every
later workspace would produce a self-inflicted LINEAGE failure.

**New binding rule (adopted for W01 and all later Writers):**

| Layer | Identity | Stability | Use |
|---|---|---|---|
| L1 | `CANONICAL_SOURCE_TREE_SHA256:480dbe9d…cc9641` / 273 | immutable | product-source binding, unchanged from the packets |
| L2 | `commit = git rev-parse HEAD` + `tree = HEAD^{tree}` at capture time | fixed per commit | evidence-contract lineage model |
| L3 | `OWNED_PARTITION_SHA256:<digest>` over exactly the Writer's writable roots | **stable under sibling edits** | **the per-writer candidate binding** |
| L4 | `WORKTREE_VARIANT:<digest>` | **moving** | explicitly `INFORMATIONAL_MOVING`; never a candidate binding |

Implemented in `tools/writer-candidate-identity.mjs`, whose `PARTITIONS` map is the executable form of
`02_parallel_dispatch.md` §4 (single source of truth for writable roots).

## 4. W01 re-binding

W01's proofs were measured at commit `3763d13` against the worktree content that is byte-identical to
the content committed by the W01 checkpoint below (W01 made no further edits after its capture).
The Coordinator recomputed the W01 owned partition at the moment of that commit:

```
workspace   W01
commit      3763d13b27df6505a309c3b51299e70a9bf56d3c
tree        1faf6df1b71e9f528b6001ce4dfe0b34376352fd
owned       OWNED_PARTITION_SHA256:08e4cd8e6850809b9f140d0465f43718b7b045eeb39e498320133eedf9b89934  (14 files)
roots       surfaces/{shell,today}, foundation/global/shell, foundation/global/bottom-shelf.ts,
            foundation/workspace.ts, adapters/today, tests/surfaces/{shell,today}, tools/c3-today-truth
```

Independent Coordinator re-verification at this commit: `tools/w01-conformance.mjs` 21/21 PASS,
`tests/surfaces/shell` + `tests/surfaces/today` PASS, acceptance-matrix replay `zero_loss: true`
(711/711, matrix sha256 `e95694c4…`), protected canonical deltas byte-identical
(`main.ts` 578 / `extensions.css` 2 / `xterm-renderer.ts` 4 — exactly the pre-existing delta),
no secret material in any W01 artifact.

W01's original receipts are **preserved unchanged** (evidence is immutable). This file is the
lineage rebind record, not a rewrite of them.

## 5. Instruction to in-flight and later Writers

Do not treat a whole-worktree hash as your candidate. Use:

```
node tools/writer-candidate-identity.mjs --workspace <WS> --json
```

and bind your receipts to `ownedPartition.identity` + `commit` + `tree`. If your receipt already
records a whole-worktree hash, leave it as captured and let the Coordinator rebind — never edit a
captured receipt to make it match.
