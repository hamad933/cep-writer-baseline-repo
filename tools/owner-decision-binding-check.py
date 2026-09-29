#!/usr/bin/env python3
"""owner-decision-binding-check — shared proof artifact for OWNER_DECISION obligations.

Ruling (Pro critical review, 2026-09-29, mission §27 escalation):
    An OWNER_DECISION obligation is discharged by
      (a) citing the RATIFIED decision binding, and
      (b) a subject-matched measured implementation proof.
    It is NOT discharged by runtime proof alone, and it is NOT a class-wide BLOCKED.

This script is proof (a). It exits 0 only when the decision id it is given is genuinely
ratified in the decision register. Pair it with a subject-matched implementation proof.

Usage
-----
  # single decision, asserting the citation is present in the rule's evidence_ref
  python3 tools/owner-decision-binding-check.py \
      --decision OWNER-20260910-001 \
      --cite "OWNER-20260910-001 @ cep-writer/authority/APPLICABLE_OWNER_DECISIONS.csv"

  # dump the ratified decision table (for authoring rules)
  python3 tools/owner-decision-binding-check.py --list

Exit codes: 0 = ratified + cited, 2 = usage, 3 = unknown decision, 4 = not ratified,
            5 = citation does not contain the decision id.
"""

from __future__ import annotations

import argparse
import csv
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGISTERS = [
    os.path.join(ROOT, "cep-writer", "authority", "APPLICABLE_OWNER_DECISIONS.csv"),
    os.path.join(ROOT, "controller", "03_historical", "decision_ledger.csv"),
]

# A decision is "ratified" when its status is one of these and its implication binds writers.
RATIFIED_STATUSES = {"ACTIVE", "ACTIVE_PLATFORM_GATED"}


def load_registers():
    rows = {}
    for path in REGISTERS:
        if not os.path.exists(path):
            continue
        with open(path, newline="", encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                did = (row.get("decision_id") or "").strip()
                if not did:
                    continue
                entry = rows.setdefault(
                    did,
                    {"decision_id": did, "sources": [], "status": set(), "verification": set(),
                     "family": set(), "implication": set(), "priority": set()},
                )
                entry["sources"].append(os.path.relpath(path, ROOT))
                if row.get("status"):
                    entry["status"].add(row["status"].strip())
                if row.get("verification"):
                    entry["verification"].add(row["verification"].strip())
                if row.get("family"):
                    entry["family"].add(row["family"].strip())
                if row.get("current_implication"):
                    entry["implication"].add(row["current_implication"].strip())
                if row.get("priority"):
                    entry["priority"].add(row["priority"].strip())
    return rows


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--decision", help="decision id, e.g. OWNER-20260910-001")
    ap.add_argument("--cite", default="", help="the evidence_ref text the writer cites; must contain the decision id")
    ap.add_argument("--list", action="store_true", help="dump the ratified decision table")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    rows = load_registers()
    if not rows:
        print("owner-decision-binding-check: ERROR: no decision register found", file=sys.stderr)
        return 3

    if args.list:
        for did in sorted(rows):
            e = rows[did]
            mark = "RATIFIED" if (e["status"] & RATIFIED_STATUSES) else "NOT_RATIFIED"
            print(f"{mark:13} {did:24} status={','.join(sorted(e['status'])) or '-'} "
                  f"verification={','.join(sorted(e['verification'])) or '-'}")
        return 0

    if not args.decision:
        print("usage: owner-decision-binding-check.py --decision <id> [--cite <text>] | --list", file=sys.stderr)
        return 2

    did = args.decision.strip()
    entry = rows.get(did)
    if entry is None:
        print(f"owner-decision-binding-check: UNKNOWN_DECISION:{did}", file=sys.stderr)
        return 3

    ratified = bool(entry["status"] & RATIFIED_STATUSES)
    cited = (did in args.cite) if args.cite else True

    receipt = {
        "check": "owner-decision-binding",
        "decision_id": did,
        "status": sorted(entry["status"]),
        "ratified": ratified,
        "cited_in_evidence_ref": cited,
        "verification_shape": sorted(entry["verification"]),
        "family": sorted(entry["family"]),
        "priority": sorted(entry["priority"]),
        "current_implication": sorted(entry["implication"]),
        "register_sources": entry["sources"],
    }
    if args.json:
        import json

        print(json.dumps(receipt, indent=2))
    else:
        print(f"decision {did}: ratified={ratified} cited={cited} "
              f"status={','.join(sorted(entry['status']))} "
              f"verification={','.join(sorted(entry['verification']))}")

    if not ratified:
        print(f"owner-decision-binding-check: NOT_RATIFIED:{did}", file=sys.stderr)
        return 4
    if not cited:
        print(f"owner-decision-binding-check: CITATION_MISSING:{did}", file=sys.stderr)
        return 5
    return 0


if __name__ == "__main__":
    sys.exit(main())
