# Writer Acceptance Matrix — catalog spec (Coordinator-owned shared tooling)

Tool: `tools/writer-acceptance-matrix.py` · Applies the packet **zero-loss law**: every obligation row
in `controller/09_writer_forge/<WS>_REQUIREMENTS.csv` lands in `writer-output/<WS>/ACCEPTANCE_MATRIX.csv`
with exactly one status from:

`PASS` · `FAIL` · `BLOCKED` · `NOT_APPLICABLE_WITH_PROOF`

The tool **cannot invent a status**. A row's status is derived from measured proof results or from a
literal rule that must carry a justification (proof of non-applicability / proof of the block).

## Files each Writer authors (inside its own `writer-output/<WS>/`)

### 1. `PROOF_CATALOG.json`

```jsonc
{
  "schemaVersion": 1,
  "workspace": "W01",
  "proofs": [
    {
      "id": "P-SHELL-ROUTE",
      "command": "node tests/surfaces/shell/surface.test.mjs",
      "artifact": "tests/surfaces/shell/surface.test.mjs",
      "kind": "surface_route_test",          // unit|contract|surface_route|browser|checker
      "workspaceScope": "W01",
      "timeout": 600
    }
  ],
  "rules": [
    {
      "id": "R-SHELL-SURFACE",
      "match": { "surface": "shell" },                 // first-match-wins, exactly one rule may match
      "status_mode": "derived_from_proof",
      "proofs": ["P-SHELL-ROUTE"],
      "proof_logic": "all",                            // "all" (default) | "any"
      "justification": "",
      "evidence_ref": "writer-output/W01/EVIDENCE_INDEX.json#shell-route"
    },
    {
      "id": "R-VISUAL-NOT-LAW",
      "match": { "source_layer": "VISUAL_REFERENCE" },
      "status_mode": "literal",
      "status": "NOT_APPLICABLE_WITH_PROOF",
      "justification": "K-05: visual references are presentation inputs only, never domain truth.",
      "proof_ref": "controller/09_writer_forge/W01_writer_packet.md#8",
      "evidence_ref": ""
    }
  ]
}
```

**Match keys** (exact list, or `<key>__contains` for substring/any-of):
`obligation_id`, `surface`, `source_layer`, `dimension`, `authority_class`, `state`, `component`,
`applicability_basis`, `temporal_disposition`, `current_result_relation`, `proof_requirement`,
`reference_binding`, `canonical_owner_or_dependency`, `obligation`, `notes`, `source_key`,
`workspace_sublane`.

Rules must form a **disjoint, total partition** of the requirement rows: a row may match exactly one
rule. Matching 0 rules (zero-loss violation) or more than 1 rule (ambiguous ownership of the row) is a
hard error and the tool prints the offending obligation ids. Operators for writing disjoint rules:
`__contains` (substring / any-of), `__not` (exact exclusion), `__not_contains` (substring exclusion),
e.g. `{"source_layer__not": ["VISUAL_REFERENCE", "AUTHORITY_RECOVERY_ARCHAEOLOGY"]}`.

### 2. `PROOF_RESULTS.json` — **measured, never hand-written**

```bash
python3 tools/writer-acceptance-matrix.py --workspace W01 --run-proofs \
  --candidate "<candidate identity>" --commit "<sha>" --tree "<tree identity>"
```

The tool executes every `proofs[].command` in the repo root and records exit code, status and output
tails with an execution timestamp. Re-run it after any code change.

### 3. `ACCEPTANCE_MATRIX.csv` + `ACCEPTANCE_SUMMARY.json` — produced by the tool.

## Status rules (enforced by the tool)

| status | allowed when |
|---|---|
| `PASS` | every (or any, with `proof_logic:"any"`) named proof **measured** PASS |
| `FAIL` | a named proof **measured** FAIL — report it, do not hide it |
| `BLOCKED` | `status_mode:"literal"` + non-empty `justification` naming the missing authority/evidence |
| `NOT_APPLICABLE_WITH_PROOF` | `status_mode:"literal"` + non-empty `justification` citing the binding rule |

## Aggregate (final five-workspace matrix)

```bash
python3 tools/writer-acceptance-matrix.py --workspace W01 --aggregate
```

## Authoring discipline

- Group rows only where they are genuinely discharged by the *same* proof artifact.
- Do **not** fold `OWNER_DECISION` rows into a passing surface test when the decision is still open —
  those become `BLOCKED` with the open-question id (Q-1…Q-6) in the justification.
- Every `NOT_APPLICABLE_WITH_PROOF` justification must cite a real binding (packet section, decision id,
  or Controller artifact), not a generic phrase.
- `proof_ref` / `evidence_ref` must point at artifacts that actually exist.
