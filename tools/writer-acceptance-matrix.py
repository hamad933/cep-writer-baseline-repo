#!/usr/bin/env python3
"""writer-acceptance-matrix — zero-loss obligation disposition engine (Coordinator-owned).

Purpose
-------
Turn the Controller's per-workspace obligation CSV (`controller/09_writer_forge/W0x_REQUIREMENTS.csv`)
into a row-addressable ACCEPTANCE_MATRIX.csv in which EVERY row carries exactly one disposition:

    PASS | FAIL | BLOCKED | NOT_APPLICABLE_WITH_PROOF

The engine never invents a status. A row's status is *derived*:

  * rule.status_mode = "derived_from_proof"
        the rule names one or more proof artifacts; each proof has a MEASURED result
        (from PROOF_RESULTS.json, produced by actually running the command in
         `writer-output/W0x/PROOF_RESULTS.json`). PASS requires every named proof PASS.
  * rule.status_mode = "literal"
        the rule fixes the status and MUST carry a non-empty `justification`
        (used only for NOT_APPLICABLE_WITH_PROOF and BLOCKED, which by law require proof).

Any row that matches no rule is a hard error: the writer must author a rule for it.
This is the mechanical enforcer of the packet's "zero-loss law".

Inputs
------
  controller/09_writer_forge/<WS>_REQUIREMENTS.csv
  writer-output/<WS>/PROOF_CATALOG.json     (writer-authored rules + proof definitions)
  writer-output/<WS>/PROOF_RESULTS.json     (measured proof results)

Outputs
-------
  writer-output/<WS>/ACCEPTANCE_MATRIX.csv
  writer-output/<WS>/ACCEPTANCE_SUMMARY.json

Run proofs first with:
  python3 tools/writer-acceptance-matrix.py --workspace W01 --run-proofs
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import subprocess
import sys
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REQUIREMENTS = os.path.join(ROOT, "controller", "09_writer_forge", "{ws}_REQUIREMENTS.csv")
VALID = ("PASS", "FAIL", "BLOCKED", "NOT_APPLICABLE_WITH_PROOF")

MATCH_KEYS = (
    "obligation_id",
    "surface",
    "source_layer",
    "dimension",
    "authority_class",
    "state",
    "component",
    "applicability_basis",
    "temporal_disposition",
    "current_result_relation",
    "proof_requirement",
    "reference_binding",
    "canonical_owner_or_dependency",
    "obligation",
    "notes",
    "source_key",
    "workspace_sublane",
)


def fail(msg: str) -> None:
    print(f"writer-acceptance-matrix: ERROR: {msg}", file=sys.stderr)
    sys.exit(2)


def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def load_json(path: str, what: str):
    if not os.path.exists(path):
        fail(f"missing {what}: {os.path.relpath(path, ROOT)}")
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def row_matches(rule_match: dict, row: dict) -> bool:
    for key, expected in rule_match.items():
        if key.endswith("__contains") or key.endswith("__not_contains"):
            negate = key.endswith("__not_contains")
            base = key[: -len("__contains" if not negate else "__not_contains")]
            if base not in row:
                return False
            haystack = row.get(base) or ""
            needles = expected if isinstance(expected, list) else [expected]
            hit = any(n in haystack for n in needles)
            if hit == negate:
                return False
            continue
        if key.endswith("__not"):
            base = key[: -len("__not")]
            if base not in row:
                return False
            accepted = expected if isinstance(expected, list) else [expected]
            if (row.get(base) or "") in accepted:
                return False
            continue
        if key not in MATCH_KEYS:
            fail(
                f"unknown match key {key!r} (allowed: {', '.join(MATCH_KEYS)}; "
                f"operators: __contains, __not, __not_contains)"
            )
        actual = row.get(key) or ""
        accepted = expected if isinstance(expected, list) else [expected]
        if actual not in accepted:
            return False
    return True


def run_proofs(catalog: dict, results_path: str, workspace: str) -> dict:
    """Execute every proof command declared in the catalog; record MEASURED results."""
    results = {}
    proofs = catalog.get("proofs", [])
    for proof in proofs:
        pid = proof.get("id")
        if not pid:
            fail("every catalog proof needs an id")
        command = proof.get("command")
        if not command:
            fail(f"proof {pid} has no command (measured results only; no assumed outcomes)")
        timeout = int(proof.get("timeout", 600))
        started = datetime.now(timezone.utc).isoformat()
        try:
            proc = subprocess.run(
                command,
                shell=True,
                cwd=ROOT,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
            exit_code, stdout, stderr, timed_out = proc.returncode, proc.stdout, proc.stderr, False
        except subprocess.TimeoutExpired as exc:
            exit_code, stdout, stderr, timed_out = -1, exc.stdout or "", exc.stderr or "", True
        ok = (exit_code == 0) and not timed_out
        results[pid] = {
            "id": pid,
            "command": command,
            "artifact": proof.get("artifact"),
            "kind": proof.get("kind", "unit_or_contract_test"),
            "workspaceScope": proof.get("workspaceScope", workspace),
            "executedAt": started,
            "exitCode": exit_code,
            "timedOut": timed_out,
            "status": "PASS" if ok else "FAIL",
            "stdoutTail": (stdout or "")[-4000:],
            "stderrTail": (stderr or "")[-4000:],
        }
        print(f"  proof {pid}: {results[pid]['status']} (exit {exit_code}) :: {command}")
    payload = {
        "schemaVersion": 1,
        "workspace": workspace,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "runner": f"python3 tools/writer-acceptance-matrix.py --workspace {workspace} --run-proofs",
        "proofs": results,
    }
    with open(results_path, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2)
        fh.write("\n")
    return payload


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--workspace", required=True, help="W01..W05")
    ap.add_argument("--run-proofs", action="store_true", help="execute catalog proof commands now")
    ap.add_argument("--candidate", default="", help="candidate identity string to bind on every row")
    ap.add_argument("--commit", default="", help="commit sha to bind on every row")
    ap.add_argument("--tree", default="", help="tree identity to bind on every row")
    ap.add_argument("--aggregate", action="store_true", help="aggregate W01..W05 matrices")
    args = ap.parse_args()

    if args.aggregate:
        return aggregate(args)

    ws = args.workspace.upper()
    req_path = REQUIREMENTS.format(ws=ws)
    if not os.path.exists(req_path):
        fail(f"no requirements CSV for {ws}")
    out_dir = os.path.join(ROOT, "writer-output", ws)
    os.makedirs(out_dir, exist_ok=True)
    catalog_path = os.path.join(out_dir, "PROOF_CATALOG.json")
    results_path = os.path.join(out_dir, "PROOF_RESULTS.json")
    matrix_path = os.path.join(out_dir, "ACCEPTANCE_MATRIX.csv")
    summary_path = os.path.join(out_dir, "ACCEPTANCE_SUMMARY.json")

    catalog = load_json(catalog_path, f"{ws} proof catalog")
    if catalog.get("workspace", ws).upper() != ws:
        fail(f"catalog workspace {catalog.get('workspace')} != {ws}")

    if args.run_proofs:
        run_proofs(catalog, results_path, ws)
    results = load_json(results_path, f"{ws} proof results")
    proof_map = results.get("proofs", {})

    rules = catalog.get("rules", [])
    if not rules:
        fail(f"{ws} catalog has no rules")
    for rule in rules:
        if not rule.get("id"):
            fail("every rule needs an id")
        mode = rule.get("status_mode")
        if mode not in ("derived_from_proof", "literal"):
            fail(f"rule {rule['id']}: status_mode must be derived_from_proof|literal")
        if mode == "derived_from_proof":
            for pid in rule.get("proofs", []):
                if pid not in proof_map:
                    fail(f"rule {rule['id']} references unknown/never-run proof {pid!r}")
            # --- P6 proof hygiene (Pro critical review, mission §27) ---
            cmds = [proof_map[p]["command"] for p in rule.get("proofs", [])]
            self_ref = [c for c in cmds if "writer-acceptance-matrix" in c]
            if self_ref:
                fail(
                    f"rule {rule['id']}: SELF_REFERENTIAL_PROOF forbidden - the matrix generator "
                    f"cannot prove the matrix ({self_ref[0]!r}). Use a subject-matched proof."
                )
            non_discharge = ("build-runtime", "npm test", "test-models")
            usable = [c for c in cmds if not any(b in c for b in non_discharge)]
            if not usable:
                fail(
                    f"rule {rule['id']}: NO_SUBJECT_MATCHED_DISCHARGE - build steps and model/test "
                    f"suites are preconditions only and cannot be the sole basis for PASS. "
                    f"Add a proof whose subject is this rule's rows."
                )
        else:
            if rule.get("status") not in VALID:
                fail(f"rule {rule['id']}: literal status must be one of {VALID}")
            if not (rule.get("justification") or "").strip():
                fail(f"rule {rule['id']}: literal status requires a non-empty justification (proof of N/A or block)")

    with open(req_path, newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    if not rows:
        fail(f"{ws} requirements CSV is empty")

    unmatched, multi = [], []
    out_rows = []
    for row in rows:
        hits = [r for r in rules if row_matches(r.get("match", {}), row)]
        if not hits:
            unmatched.append(row["obligation_id"])
            continue
        if len(hits) > 1:
            multi.append((row["obligation_id"], [h["id"] for h in hits]))
            continue
        rule = hits[0]
        # --- P6 granularity guard (Pro critical review, mission §27) ---
        # OWNER_DECISION / OWNER_QA_DEEP_AUDIT rows carry a per-subject truth (decision id /
        # finding id). Sweeping them from a surface-wide or layer-wide rule is a manufactured
        # PASS: the disposition must be keyed on the row's subject.
        if row.get("source_layer") in ("OWNER_DECISION", "OWNER_QA_DEEP_AUDIT"):
            subject_keys = {"component", "component__contains", "obligation_id",
                            "obligation_id__contains", "source_key", "source_key__contains"}
            if not (subject_keys & set(rule.get("match", {}))):
                fail(
                    f"rule {rule['id']}: INSUFFICIENT_GRANULARITY - it matches "
                    f"{row.get('source_layer')} row {row['obligation_id']} without keying on the "
                    f"row subject. Match on 'component' (decision id / finding id) or "
                    f"'obligation_id', per the unified disposition policy P3/P4."
                )
        if rule["status_mode"] == "literal":
            status = rule["status"]
            justification = rule["justification"]
            proof_ref = rule.get("proof_ref", "")
            evidence_ref = rule.get("evidence_ref", "")
        else:
            named = rule.get("proofs", [])
            if not named:
                fail(f"rule {rule['id']}: derived_from_proof requires a non-empty proofs list")
            measured = [proof_map[p] for p in named]
            logic = rule.get("proof_logic", "all")
            if logic not in ("all", "any"):
                fail(f"rule {rule['id']}: proof_logic must be all|any")
            passed = [p["status"] == "PASS" for p in measured]
            status = "PASS" if (all(passed) if logic == "all" else any(passed)) else "FAIL"
            justification = rule.get("justification", "")
            proof_ref = " ".join(
                f"{p['id']}[{p['status']}]={p.get('artifact') or p['command']}" for p in measured
            )
            evidence_ref = rule.get("evidence_ref", "")
        out_rows.append(
            {
                "obligation_id": row["obligation_id"],
                "workspace": ws,
                "surface": row.get("surface", ""),
                "source_layer": row.get("source_layer", ""),
                "dimension": row.get("dimension", ""),
                "component": row.get("component", ""),
                "state": row.get("state", ""),
                "obligation": row.get("obligation", ""),
                "proof_requirement": row.get("proof_requirement", ""),
                "rule_id": rule["id"],
                "status": status,
                "proof_ref": proof_ref,
                "evidence_ref": evidence_ref,
                "justification": justification,
                "candidate": args.candidate,
                "commit": args.commit,
                "tree": args.tree,
                "dispositioned_at": datetime.now(timezone.utc).isoformat(),
            }
        )

    if unmatched:
        fail(
            f"{len(unmatched)} row(s) matched no rule (zero-loss law): "
            + ", ".join(unmatched[:20])
            + (" ..." if len(unmatched) > 20 else "")
        )
    if multi:
        fail(f"{len(multi)} row(s) matched >1 rule: {multi[:10]}")

    fields = list(out_rows[0].keys())
    with open(matrix_path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        writer.writerows(out_rows)

    counts = {}
    for r in out_rows:
        counts[r["status"]] = counts.get(r["status"], 0) + 1
    per_surface = {}
    for r in out_rows:
        s = per_surface.setdefault(r["surface"], {})
        s[r["status"]] = s.get(r["status"], 0) + 1
    per_layer = {}
    for r in out_rows:
        s = per_layer.setdefault(r["source_layer"], {})
        s[r["status"]] = s.get(r["status"], 0) + 1

    summary = {
        "schemaVersion": 1,
        "workspace": ws,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "requirements_csv": os.path.relpath(req_path, ROOT),
        "requirements_rows": len(rows),
        "rows_dispositioned": len(out_rows),
        "zero_loss": len(out_rows) == len(rows),
        "candidate": args.candidate,
        "commit": args.commit,
        "tree": args.tree,
        "requirements_sha256": sha256_file(req_path),
        "counts": counts,
        "per_surface": per_surface,
        "per_source_layer": per_layer,
        "proofs_used": sorted({p for r in rules for p in r.get("proofs", [])}),
        "matrix": os.path.relpath(matrix_path, ROOT),
        "matrix_sha256": sha256_file(matrix_path),
    }
    with open(summary_path, "w", encoding="utf-8") as fh:
        json.dump(summary, fh, indent=2)
        fh.write("\n")

    print(json.dumps({k: summary[k] for k in ("workspace", "requirements_rows", "rows_dispositioned", "zero_loss", "counts")}, indent=2))
    return 0


def aggregate(args) -> int:
    per_ws = {}
    total = 0
    grand = {}
    subject_status = {}
    conflicts = []
    for i in range(1, 6):
        ws = f"W0{i}"
        path = os.path.join(ROOT, "writer-output", ws, "ACCEPTANCE_SUMMARY.json")
        if not os.path.exists(path):
            per_ws[ws] = {"status": "NOT_STARTED"}
            continue
        s = load_json(path, f"{ws} summary")
        per_ws[ws] = {
            "status": "COMPLETE" if s.get("zero_loss") else "INCOMPLETE",
            "obligations": s["requirements_rows"],
            "dispositioned": s["rows_dispositioned"],
            "counts": s["counts"],
            "candidate": s.get("candidate"),
            "commit": s.get("commit"),
            "matrix_sha256": s.get("matrix_sha256"),
        }
        total += s["requirements_rows"]
        for k, v in s["counts"].items():
            grand[k] = grand.get(k, 0) + v

        # --- cross-matrix consistency (Pro critical review, mission §27) ---
        # Findings and decisions are replicated across workspace row sets, so closure is a
        # GLOBAL fact: the same (component, proof_requirement) must resolve to the same status
        # in every workspace matrix.
        matrix = os.path.join(ROOT, "writer-output", ws, "ACCEPTANCE_MATRIX.csv")
        if os.path.exists(matrix):
            with open(matrix, newline="", encoding="utf-8") as fh:
                for r in csv.DictReader(fh):
                    if r.get("source_layer") not in ("OWNER_DECISION", "OWNER_QA_DEEP_AUDIT"):
                        continue
                    key = (r.get("component", ""), r.get("proof_requirement", ""))
                    if not key[0]:
                        continue
                    seen = subject_status.setdefault(key, {})
                    seen.setdefault(r["status"], []).append(f"{ws}:{r['obligation_id']}")
            for key, seen in subject_status.items():
                if len(seen) > 1:
                    conflicts.append({
                        "component": key[0],
                        "proof_requirement": key[1][:120],
                        "statuses": {k: v[:4] for k, v in seen.items()},
                    })
    # dedupe conflicts (subject_status is cumulative across workspaces)
    uniq = {}
    for c in conflicts:
        uniq[(c["component"], c["proof_requirement"])] = c
    conflicts = sorted(uniq.values(), key=lambda c: c["component"])

    out = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "total_obligations": total,
        "grand_counts": grand,
        "workspaces": per_ws,
        "cross_matrix_consistency": {
            "subjects_checked": len(subject_status),
            "conflicts": len(conflicts),
            "detail": conflicts[:40],
        },
    }
    print(json.dumps(out, indent=2))
    if conflicts:
        print(
            f"\nCROSS_MATRIX_INCONSISTENCY: {len(conflicts)} subject(s) resolve to different "
            f"statuses in different workspaces. Closure is a global fact - regenerate the "
            f"outlier matrices so every workspace agrees.",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
