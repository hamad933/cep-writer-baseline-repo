#!/usr/bin/env python3
"""owner-qa-closure-register — shared OWNER_QA_DEEP_AUDIT closure register.

Ruling (Pro critical review, 2026-09-29, mission §27 escalation):
    OWNER_QA_DEEP_AUDIT rows are individual audit findings. Per-finding closure proof is
    mandatory; granularity is the finding id (`component`). "Matched-executable-consumer proof
    not held" is a legitimate block reason but only stated per finding.

    Findings are replicated across workspace row sets (e.g. A3-GUI-001 appears in W01 and
    W04). Closure is therefore a GLOBAL FACT: one shared register, every workspace matrix cites
    it, and (finding id) must yield an identical status in every matrix.

This script regenerates `writer-output/_coordinator/OWNER_QA_CLOSURE_REGISTER.csv` from the
five requirement CSVs. Writers fill `closure_proof` + `measured_status`; the Coordinator's
`--aggregate` cross-matrix consistency check enforces agreement.

  python3 tools/owner-qa-closure-register.py            # regenerate
  python3 tools/owner-qa-closure-register.py --check    # verify all findings covered
"""

from __future__ import annotations

import csv
import os
import sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REQ_DIR = os.path.join(ROOT, "controller", "09_writer_forge")
OUT = os.path.join(ROOT, "writer-output", "_coordinator", "OWNER_QA_CLOSURE_REGISTER.csv")
WORKSPACES = ["W01", "W02", "W03", "W04", "W05"]

# surface -> owning workspace (from 02_parallel_dispatch.md §4)
SURFACE_OWNER = {
    "shell": "W01", "today": "W01",
    "library": "W02", "learn": "W02", "rq": "W02", "visualize": "W02",
    "enterprise": "W03", "scenarios": "W03", "labs": "W03", "runs": "W03", "results": "W03",
    "evidence": "W04", "reviews": "W04", "mastery": "W04", "portfolio": "W04",
    "health": "W05", "processing": "W05", "validation": "W05", "manual_ai": "W05",
    "backup": "W05", "audit": "W05", "releases": "W05", "configuration": "W05",
}

FIELDS = [
    "finding_id", "directive", "proof_requirement", "negative_falsification_test",
    "present_in_workspaces", "present_on_surfaces", "owner_workspace",
    "closure_proof", "measured_status", "verified_by_workspace", "notes",
]


def collect():
    findings = defaultdict(lambda: {"ws": set(), "surfaces": set(), "directive": set(),
                                    "proof": set(), "negative": set()})
    for ws in WORKSPACES:
        path = os.path.join(REQ_DIR, f"{ws}_REQUIREMENTS.csv")
        if not os.path.exists(path):
            print(f"owner-qa-closure-register: missing {path}", file=sys.stderr)
            sys.exit(2)
        with open(path, newline="", encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                if row.get("source_layer") != "OWNER_QA_DEEP_AUDIT":
                    continue
                fid = (row.get("component") or "").strip()
                if not fid:
                    continue
                f = findings[fid]
                f["ws"].add(ws)
                if row.get("surface"):
                    f["surfaces"].add(row["surface"])
                if row.get("directive"):
                    f["directive"].add(row["directive"])
                if row.get("proof_requirement"):
                    f["proof"].add(row["proof_requirement"])
                if row.get("negative_falsification_test"):
                    f["negative"].add(row["negative_falsification_test"])
    return findings


def owner_of(f) -> str:
    owners = sorted({SURFACE_OWNER.get(s, "?") for s in f["surfaces"]})
    owners = [o for o in owners if o != "?"]
    return owners[0] if len(owners) == 1 else ("|".join(owners) if owners else "UNASSIGNED")


def main() -> int:
    findings = collect()
    if "--check" in sys.argv:
        if not os.path.exists(OUT):
            print(f"owner-qa-closure-register: MISSING {os.path.relpath(OUT, ROOT)}")
            return 3
        with open(OUT, newline="", encoding="utf-8") as fh:
            have = {r["finding_id"] for r in csv.DictReader(fh)}
        missing = sorted(set(findings) - have)
        print(f"register rows: {len(have)}  findings in requirements: {len(findings)}")
        if missing:
            print(f"MISSING from register ({len(missing)}): {missing}")
            return 3
        print("OK: every OWNER_QA_DEEP_AUDIT finding id is registered")
        return 0

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    preserved = {}
    if os.path.exists(OUT):
        with open(OUT, newline="", encoding="utf-8") as fh:
            for r in csv.DictReader(fh):
                preserved[r["finding_id"]] = r

    with open(OUT, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=FIELDS)
        w.writeheader()
        for fid in sorted(findings):
            f = findings[fid]
            prev = preserved.get(fid, {})
            w.writerow({
                "finding_id": fid,
                "directive": "; ".join(sorted(f["directive"])),
                "proof_requirement": "; ".join(sorted(f["proof"])),
                "negative_falsification_test": "; ".join(sorted(f["negative"])),
                "present_in_workspaces": "|".join(sorted(f["ws"])),
                "present_on_surfaces": "|".join(sorted(f["surfaces"])),
                "owner_workspace": owner_of(f),
                "closure_proof": prev.get("closure_proof", ""),
                "measured_status": prev.get("measured_status", "BLOCKED"),
                "verified_by_workspace": prev.get("verified_by_workspace", ""),
                "notes": prev.get("notes", ""),
            })
    print(f"wrote {os.path.relpath(OUT, ROOT)}  ({len(findings)} findings, "
          f"{sum(1 for f in findings.values() if len(f['ws']) > 1)} replicated across >1 workspace)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
