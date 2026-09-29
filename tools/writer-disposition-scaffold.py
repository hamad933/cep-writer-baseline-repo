#!/usr/bin/env python3
"""writer-disposition-scaffold — generate a P1-P6 compliant starter PROOF_CATALOG.json.

The unified disposition policy (controller/12_execution/06_unified_disposition_policy.md) requires
OWNER_DECISION and OWNER_QA_DEEP_AUDIT rows to be dispositioned **per subject** (decision id /
finding id). That is ~150 rules per workspace; authoring them by hand is where errors creep in.

This scaffolder emits rules that are already **honest by default**:

  * P1 open-question rows  -> literal BLOCKED naming the Q-id
  * P2 non-law rows        -> literal NOT_APPLICABLE_WITH_PROOF citing the binding
  * P3 OWNER_DECISION      -> literal BLOCKED, justification names the exact missing artifact
  * P4 OWNER_QA_DEEP_AUDIT -> literal BLOCKED, "no matched executable consumer closure proof"
  * P5 ZL01                -> literal BLOCKED, pinned per finding id

The Writer's job is to **upgrade** a rule to `derived_from_proof` ONLY where a real subject-matched
closure proof exists, and to replace the justification where it can name a better fact. A high PASS
count is not the goal; a defensible disposition is.

  python3 tools/writer-disposition-scaffold.py --workspace W04 > writer-output/W04/PROOF_CATALOG.json
  python3 tools/writer-disposition-scaffold.py --workspace W04 --proofs P-REVIEWS-SURFACE=... --print
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REQ = os.path.join(ROOT, "controller", "09_writer_forge", "{ws}_REQUIREMENTS.csv")

Q_SUBJECTS = [
    ("Q-1", ["destinationCountFrozen"]),
    ("Q-2", ["Today provider owner"]),
    ("Q-3", ["REVIEWED_FINAL_CANDIDATE"]),
    ("Q-4", ["TimelineReplayOwner"]),
    ("Q-5", ["grouping authority", "Portfolio grouping"]),
    ("Q-6", ["Manual-AI provenance", "manual ai provenance", "provenance mechanism"]),
]

NONLAW = {
    "VISUAL_REFERENCE": (
        "NOT_APPLICABLE_WITH_PROOF",
        "K-05: visual references are presentation inputs only, never domain/data/provider truth.",
    ),
    "AUTHORITY_RECOVERY_ARCHAEOLOGY": (
        "NOT_APPLICABLE_WITH_PROOF",
        "dispatch_manifest: historical archives are evidence, not the execution specification; "
        "packet §17 conflict rule keeps them provenance only.",
    ),
}


def slug(text: str) -> str:
    return re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-")[:60]


def q_of(row) -> str | None:
    blob = " ".join([
        row.get("obligation", ""), row.get("reference_binding", ""),
        row.get("proof_requirement", ""), row.get("notes", ""), row.get("source_excerpt", ""),
    ])
    for qid, needles in Q_SUBJECTS:
        if any(n in blob for n in needles):
            return qid
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--workspace", required=True)
    ap.add_argument("--print", action="store_true", help="print to stdout (default)")
    args = ap.parse_args()
    ws = args.workspace.upper()

    path = REQ.format(ws=ws)
    if not os.path.exists(path):
        print(f"writer-disposition-scaffold: no requirements CSV for {ws}", file=sys.stderr)
        return 2
    with open(path, newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))

    # partition rows (P1 has highest precedence and applies to EVERY source_layer)
    p1, p2, p3, p4, p5 = [], [], defaultdict(list), defaultdict(list), defaultdict(list)
    reserved = set()
    for r in rows:
        layer = r.get("source_layer", "")
        q = q_of(r)
        if q:
            p1.append((q, r))
            reserved.add(r["obligation_id"])
            continue
        if layer in NONLAW or r.get("temporal_disposition") == "HISTORICAL_DURABLE_GUARDRAIL":
            p2.append(r)
            reserved.add(r["obligation_id"])
            continue
        if layer == "OWNER_DECISION":
            p3[r.get("component") or r["obligation_id"]].append(r)
            continue
        if layer == "OWNER_QA_DEEP_AUDIT":
            p4[r.get("component") or r["obligation_id"]].append(r)
            continue
        p5[(layer, r.get("proof_requirement", ""))].append(r)

    # rows claimed by the higher-precedence P1/P2 rules must never also match a P3/P4/P5 rule
    not_reserved = sorted(reserved)

    rules, proofs = [], []

    # P1
    for qid, r in p1:
        rules.append({
            "id": f"P1-{qid}-{slug(r['obligation_id'])}",
            "match": {"obligation_id": r["obligation_id"]},
            "status_mode": "literal",
            "status": "BLOCKED",
            "justification": (
                f"{qid} is an explicit open question; this obligation cannot be decided by a Writer. "
                f"Bound per controller/03_historical/open_questions.md standing rule (stop and report)."
            ),
            "proof_ref": f"{qid} @ controller/03_historical/open_questions.md",
            "evidence_ref": "",
        })

    # P2
    for r in p2:
        layer = r.get("source_layer", "")
        if r.get("temporal_disposition") == "HISTORICAL_DURABLE_GUARDRAIL":
            status, why = "NOT_APPLICABLE_WITH_PROOF", (
                "controller_conflict_flag=HISTORICAL_GUARDRAIL_NOT_CURRENT_LAW; packet §5 records "
                "guardrails as history, not law."
            )
            key = "HIST-GUARDRAIL"
        else:
            status, why = NONLAW.get(layer, (
                "NOT_APPLICABLE_WITH_PROOF",
                "non-law input row; cited binding is the row's own reference_binding.",
            ))
            key = slug(layer)
        rules.append({
            "id": f"P2-{key}-{slug(r['obligation_id'])}",
            "match": {"obligation_id": r["obligation_id"]},
            "status_mode": "literal",
            "status": status,
            "justification": why,
            "proof_ref": (r.get("reference_binding") or "")[:200],
            "evidence_ref": "",
        })

    # P3 — one rule per decision id
    for component in sorted(p3):
        sample = p3[component][0]
        ids = [r["obligation_id"] for r in p3[component]]
        rule = {
            "id": f"P3-DEC-{slug(component)}",
            "match": {"component": component, "source_layer": "OWNER_DECISION",
                      "obligation_id__not": not_reserved},
            "status_mode": "literal",
            "status": "BLOCKED",
            "justification": (
                f"no subject-matched implementation closure proof exists for decision {component} "
                f"in this workspace's evidence set (required proof shape: "
                f"{(sample.get('proof_requirement') or 'unspecified')[:120]})."
            ),
            "proof_ref": f"{component} @ cep-writer/authority/APPLICABLE_OWNER_DECISIONS.csv",
            "evidence_ref": "",
            "_rows": ids,
            "_upgrade": (
                "UPGRADE to derived_from_proof only when BOTH hold: "
                "(a) tools/owner-decision-binding-check.py --decision <component> --cite … passes, AND "
                "(b) a proof whose subject is this decision's mechanism measured PASS."
            ),
        }
        rules.append(rule)

    # P4 — one rule per finding id
    for component in sorted(p4):
        sample = p4[component][0]
        ids = [r["obligation_id"] for r in p4[component]]
        rules.append({
            "id": f"P4-FIND-{slug(component)}",
            "match": {"component": component, "source_layer": "OWNER_QA_DEEP_AUDIT",
                      "obligation_id__not": not_reserved},
            "status_mode": "literal",
            "status": "BLOCKED",
            "justification": (
                f"finding {component}: no matched executable consumer closure proof in this "
                f"workspace's evidence set (directive {sample.get('directive','?')}; "
                f"required {(sample.get('proof_requirement') or '')[:100]})."
            ),
            "proof_ref": "writer-output/_coordinator/OWNER_QA_CLOSURE_REGISTER.csv#" + component,
            "evidence_ref": "",
            "_rows": ids,
            "_upgrade": (
                "UPGRADE to derived_from_proof only if a closure suite has a NAMED SUBTEST for this "
                "finding id and it measured PASS. Closure is a global fact: the same finding must "
                "resolve to the same status in every workspace."
            ),
        })

    # P5 — remaining ZL01 rows, keyed per finding where they carry an id, else lane+proof_requirement
    for (layer, proof_req), group in sorted(p5.items(), key=lambda kv: (kv[0][0], kv[0][1])):
        comps = defaultdict(list)
        for r in group:
            comps[r.get("component") or r["obligation_id"]].append(r)
        for component in sorted(comps):
            g = comps[component]
            ids = [r["obligation_id"] for r in g]
            surfaces = sorted({r.get("surface", "") for r in g})
            openish = any(
                tok in (g[0].get("obligation", "") + g[0].get("notes", ""))
                for tok in ("OPEN", "BLOCKING", "CURRENT_BLOCKER", "PLATFORM_GATED",
                            "PARITY_NOT_PROVEN", "NOT_IMPLEMENTED", "UNRESOLVED")
            )
            rules.append({
                "id": f"P5-{slug(layer)}-{slug(component)}",
                "match": {"component": component, "source_layer": layer,
                          "proof_requirement": proof_req,
                          "obligation_id__not": not_reserved},
                "status_mode": "literal",
                "status": "BLOCKED" if openish else "NOT_APPLICABLE_WITH_PROOF",
                "justification": (
                    f"{layer} finding {component} ({'/'.join(surfaces)}): "
                    + ("carries an OPEN/BLOCKING/CURRENT_BLOCKER marker; no closure proof measured."
                       if openish else
                       "not a current-law obligation for this workspace; no positive proof required.")
                ),
                "proof_ref": (proof_req or "")[:200],
                "evidence_ref": "",
                "_rows": ids,
                "_upgrade": (
                    "UPGRADE to derived_from_proof when the lane proof named by proof_requirement "
                    "measured PASS and its subject is this component's lane."
                ),
            })

    # strip helper keys the engine must not see
    clean = []
    for r in rules:
        clean.append({k: v for k, v in r.items() if not k.startswith("_")})

    catalog = {
        "schemaVersion": 1,
        "workspace": ws,
        "generator": "tools/writer-disposition-scaffold.py",
        "policy": "controller/12_execution/06_unified_disposition_policy.md (P1-P6)",
        "note": (
            "Rules are honest-by-default BLOCKED/NOT_APPLICABLE. Upgrade a rule to "
            "derived_from_proof ONLY where a real subject-matched closure proof exists. "
            "Add the needed entries under 'proofs' first, then reference them from the rule."
        ),
        "proofs": proofs,
        "rules": clean,
    }
    print(json.dumps(catalog, indent=2))
    by_class = defaultdict(int)
    for r in clean:
        by_class[r["id"].split("-", 1)[0]] += 1
    print(
        f"\nwriter-disposition-scaffold: {ws} generated {len(clean)} rules "
        f"(P1={by_class['P1']} P2={by_class['P2']} P3={by_class['P3']} "
        f"P4={by_class['P4']} P5={by_class['P5']}), covering {len(rows)} rows",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
