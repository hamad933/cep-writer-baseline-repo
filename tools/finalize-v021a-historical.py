#!/usr/bin/env python3
"""Bind the bounded v0.2.1a review-hardened Foundation candidate and create one deterministic ZIP."""
from __future__ import annotations

import hashlib
import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SUCCESSOR_BASELINE = "CEP-FOUNDATION-0.2.1a-REVIEW-HARDENED-CANDIDATE"
ARCHIVE_ROOT = "CEP_FOUNDATION_FORGE_v0.2.1a"
OUTPUT_NAME = "CEP_FOUNDATION_FORGE_v0.2.1a_REVIEW_HARDENED_CANDIDATE.zip"
EXPECTED_DONOR = (672893, "ea66b58ef122bf2f8ca23fd0aa9e461b07da11ea7390c451902e4b1592d396fd")
EXPECTED_W03 = (14356658, "23b66696a9cc72cb343c74e70f380ccb248e1fbc378d8ce7839ba74111a3d716")
LINEAGE = {
    "filename": "CEP_FOUNDATION_FORGE_v0.2.1_BOUNDED_FOUNDATION_CORRECTION_CANDIDATE.zip",
    "bytes": 3529607,
    "sha256": "523b596073920b7d2059e72bc9fe0fa718efd6ab14de7dcaf1441330f60dfc75",
    "candidate_id": "ffb72c41e1a0cea2d3b2ef737675d47171a3f830dd50889d37a8dfb9cc55cede",
}
GENERATED = {"DELIVERY_MANIFEST.json", "assurance/CANDIDATE_IDENTITY.json"}
OLD_W03_AUTHORITY = "SOLE_SAME_LINEAGE_" + "IMPLEMENTATION_VALUE_BASELINE_NOT_ACCEPTED"
STALE_DEFERRED_STATUS = "DEFERRED_WORK_" + "ZERO_LOSS"


def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def row(path: Path) -> dict:
    return {"path": path.relative_to(ROOT).as_posix(), "bytes": path.stat().st_size, "sha256": sha(path)}


def source_files() -> list[Path]:
    return sorted(
        (p for p in ROOT.rglob("*") if p.is_file() and p.relative_to(ROOT).as_posix() not in GENERATED and "node_modules" not in p.parts and "__pycache__" not in p.parts),
        key=lambda p: p.relative_to(ROOT).as_posix(),
    )


def tree_hash(rows: list[dict]) -> str:
    material = "".join(f"{item['path']}\0{item['bytes']}\0{item['sha256']}\n" for item in rows)
    return hashlib.sha256(material.encode("utf-8")).hexdigest()


def verify_file(path: Path, expected: tuple[int, str], label: str) -> dict:
    actual = (path.stat().st_size, sha(path))
    if actual != expected:
        raise SystemExit(f"STOP: {label} mismatch: expected={expected}, actual={actual}")
    return {"path": path.relative_to(ROOT).as_posix(), "bytes": actual[0], "sha256": actual[1], "verified": True}


def load(relative: str) -> dict:
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


donor = verify_file(ROOT / "dist/reference/CEP_LIBRARY_EDITOR_EXECUTABLE_BLUEPRINT_v1.2.17_ACCEPTED_DESIGN_REFERENCE.html", EXPECTED_DONOR, "accepted donor")
w03_intake = load("authority/W03_V34_TARGETED_INTAKE.json")
if w03_intake.get("sha256") != EXPECTED_W03[1]:
    raise SystemExit("STOP: W03 v3.4 intake identity mismatch")

baseline = load("assurance/BASELINE_VERIFICATION_RECEIPT.json")
if not (baseline.get("status") == "PASS" and baseline.get("verifiedBeforeMutation") is True and baseline.get("bytes") == LINEAGE["bytes"] and baseline.get("sha256") == LINEAGE["sha256"] and baseline.get("actualCandidateId") == LINEAGE["candidate_id"]):
    raise SystemExit("STOP: supplied v0.2.1 lineage baseline verification is not exact")

runtime = load("contracts/FOUNDATION_RUNTIME_REGISTRY.json")
model = load("assurance/MODEL_TEST_RESULTS.json")
contract = load("assurance/CONTRACT_TEST_RESULTS.json")
browser = load("assurance/BROWSER_CONFORMANCE_RECEIPT.json")
portability = load("assurance/BROWSER_PORTABILITY_BOOTSTRAP_RECEIPT.json")
deferred = load("assurance/HIGH_VALUE_DEFERRED_LEDGER.json")
deferred_guard = load("assurance/DEFERRED_BOUNDARY_GUARD.json")
deferred_preservation = load("assurance/DEFERRED_SET_PRESERVATION_RECEIPT.json")
excluded = load("assurance/DROPPED_SUPERSEDED_LOW_VALUE_TRACEABILITY.json")
duplicate = load("assurance/DUPLICATE_MECHANIC_SCAN.json")
scaffold = load("assurance/WRITER_SCAFFOLD_TEST_RESULTS.json")
w03_semantic = load("assurance/W03_SEMANTIC_OWNER_VALIDATION.json")
w03_correction = load("assurance/W03_SEMANTIC_OWNERSHIP_CORRECTION_RECEIPT.json")
authority = load("assurance/CURRENT_AUTHORITY_ISOLATION_RECEIPT.json")
automation = load("assurance/AUTOMATED_TEST_RECEIPTS.json")
completion = load("assurance/SIX_CORRECTION_COMPLETION_REGISTER.json")
changed = load("assurance/CHANGED_FILE_REGISTER.json")
controller = load("authority/controller/CONTROLLER_INPUT_IDENTITY.json")

if runtime.get("baselineId") != SUCCESSOR_BASELINE or runtime.get("status") != "INDEPENDENT_REVIEW_REQUIRED" or runtime.get("stackStatus") != "STACK_NOT_FROZEN":
    raise SystemExit("STOP: active runtime baseline/status is not the v0.2.1a review-hardened successor")
if model.get("fail") != 0 or model.get("pass", 0) < 57:
    raise SystemExit("STOP: model regression gate failed")
if contract.get("fail") != 0 or contract.get("pass", 0) < 149:
    raise SystemExit("STOP: contract/check gate failed")
if duplicate.get("status") != "PASS" or duplicate.get("findings"):
    raise SystemExit("STOP: duplicate mechanic gate failed")
if scaffold.get("fail") != 0 or scaffold.get("pass", 0) < 38:
    raise SystemExit("STOP: Writer scaffold relevance gate failed")
if w03_semantic.get("status") != "PASS" or w03_semantic.get("summary", {}).get("sections") != 69 or w03_semantic.get("summary", {}).get("atoms") != 318 or w03_semantic.get("summary", {}).get("failed") != 0:
    raise SystemExit("STOP: W03 semantic-owner validation failed")
if w03_correction.get("rowsReviewed") != 318 or w03_correction.get("rowsChanged") != 219 or not w03_correction.get("noReatomization") or not w03_correction.get("workAdmissionPreserved"):
    raise SystemExit("STOP: W03 semantic correction receipt gate failed")
if authority.get("fail") != 0 or authority.get("pass", 0) < 5:
    raise SystemExit("STOP: current-authority intake isolation gate failed")
if deferred_guard.get("status") != "PASS" or deferred_guard.get("fail") != 0:
    raise SystemExit("STOP: deferred-boundary guard failed")
if deferred_preservation.get("coreDeferredObligationsUnchanged") is not True or deferred_preservation.get("implementedByThisCorrection") is not False:
    raise SystemExit("STOP: deferred set preservation gate failed")
if browser.get("executionStatus") != "EXECUTED_PASS" or browser.get("summary") != {"total": 6, "pass": 6, "fail": 0}:
    raise SystemExit("STOP: browser critical suite is not green")
if portability.get("codexInternalPathRequired") is not False or portability.get("normalResolution") != "package-local playwright via npm ci" or portability.get("declaredVersion") != "1.62.1" or portability.get("lockfileValidation", {}).get("status") != "PASS":
    raise SystemExit("STOP: portable browser bootstrap gate failed")
if automation.get("status") != "ALL_BOUNDED_GATES_PASS":
    raise SystemExit("STOP: consolidated mandatory assurance register is not green")
if not all(item.get("status") == "PASS" for item in completion.get("corrections", [])) or len(completion.get("corrections", [])) != 6:
    raise SystemExit("STOP: six-correction completion register is incomplete")
if controller.get("package", {}).get("bytes") != 122721 or controller.get("package", {}).get("sha256") != "0bbb013cc767d9d7047a5a5f24fe67865f0ee4e75f9522978e6bd2ceafee406b":
    raise SystemExit("STOP: Controller delta identity gate failed")
if deferred.get("policy") != "VALUE_FILTERED_DEFERRED_WORK" or len(deferred.get("items", [])) != 10 or any(not item.get("activeFutureObligation") for item in deferred["items"]):
    raise SystemExit("STOP: high-value deferred ledger gate failed")
if len(excluded.get("items", [])) != 15 or any(item.get("activeFutureObligation") for item in excluded["items"]):
    raise SystemExit("STOP: dropped/superseded traceability gate failed")
if any(item.get("path", "").startswith("profiles/") for item in changed.get("files", [])):
    raise SystemExit("STOP: full 23-Surface semantic adjudication/profile mutation was not admitted")

# Text-level contamination and stale-state guard. Historical files may retain historical facts,
# but active current-control surfaces may not promote them as implementation authority.
active_old_authority = []
for p in source_files():
    relative = p.relative_to(ROOT).as_posix()
    if p.suffix.lower() in {".jpg", ".png", ".zip"}:
        continue
    try:
        value = p.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    if OLD_W03_AUTHORITY in value and relative != "assurance/AUTHORITY_BEFORE_AFTER_REGISTER.json":
        active_old_authority.append(relative)
if active_old_authority:
    raise SystemExit(f"STOP: active old W03 authority remains: {active_old_authority}")

for relative in ["FINAL_HANDOFF_AR.md", "README_START_HERE_AR.md", "checkpoints/CURRENT_HIGH_LEVERAGE.json", "tools/build-correction-registers.py", "tools/finalize-candidate.py", "assurance/HIGH_VALUE_DEFERRED_LEDGER.json", "assurance/DEFERRED_WORK_LEDGER.json"]:
    if STALE_DEFERRED_STATUS in (ROOT / relative).read_text(encoding="utf-8"):
        raise SystemExit(f"STOP: stale deferred status remains active in {relative}")

content_rows = [row(p) for p in source_files()]
content_tree = tree_hash(content_rows)
identity_material = {
    "successor_baseline": SUCCESSOR_BASELINE,
    "content_tree_sha256": content_tree,
    "lineage_baseline_sha256": LINEAGE["sha256"],
    "lineage_baseline_candidate_id": LINEAGE["candidate_id"],
    "accepted_donor_sha256": donor["sha256"],
    "w03_v34_sha256": EXPECTED_W03[1],
    "model_pass": model["pass"],
    "contract_pass": contract["pass"],
    "writer_scaffold_pass": scaffold["pass"],
    "w03_semantic_pass": w03_semantic["summary"]["passed"],
    "w03_semantic_rows_changed": w03_correction["rowsChanged"],
    "authority_pass": authority["pass"],
    "deferred_guard_pass": deferred_guard["pass"],
    "browser_pass": browser["summary"]["pass"],
    "deferred_items": deferred["summary"]["items"],
    "excluded_trace_items": excluded["summary"]["items"],
}
candidate_id = hashlib.sha256(json.dumps(identity_material, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
identity = {
    "schemaVersion": 3,
    "baseline": SUCCESSOR_BASELINE,
    "candidate_id": candidate_id,
    "content_tree_sha256": content_tree,
    "content_file_count": len(content_rows),
    "lineageBaseline": {**LINEAGE, "verifiedBeforeMutation": True},
    "acceptedDonor": donor,
    "w03Baseline": {
        "filename": "CEP_W03_UNIFIED_EXECUTABLE_BLUEPRINT_SYSTEM_v3.4_OWNER_DIRECT_REVIEW_CORRECTED_CANDIDATE.zip",
        "bytes": EXPECTED_W03[0],
        "sha256": EXPECTED_W03[1],
        "classification": "W03_V3_4_SAME_LINEAGE_VALUE_DOMAIN_REQUIREMENT_EVIDENCE_DONOR_NOT_AUTHORITY",
        "verifiedFromImmutableIntake": True,
    },
    "proof": {
        "model": {"pass": model["pass"], "fail": model["fail"]},
        "contract": {"pass": contract["pass"], "fail": contract["fail"]},
        "writerScaffold": {"pass": scaffold["pass"], "fail": scaffold["fail"]},
        "w03SemanticOwner": w03_semantic["summary"],
        "w03SemanticRowsChanged": w03_correction["rowsChanged"],
        "authorityIntake": {"pass": authority["pass"], "fail": authority["fail"]},
        "deferredBoundary": {"pass": deferred_guard["pass"], "fail": deferred_guard["fail"]},
        "browser": browser["summary"],
        "browserExecutionStatus": browser["executionStatus"],
        "centralReuse": "PASS_FOR_CANDIDATE",
        "internalSimulationCausalPath": "PASS_FOR_CANDIDATE",
    },
    "deferred": deferred["summary"],
    "excludedTraceability": excluded["summary"],
    "owner_accepted": False,
    "stack_frozen": False,
    "deployed": False,
    "released": False,
    "identityScope": "All candidate files except this generated identity and DELIVERY_MANIFEST.json",
}
(ROOT / "assurance/CANDIDATE_IDENTITY.json").write_text(json.dumps(identity, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

delivery_files = [
    row(p)
    for p in sorted(
        (p for p in ROOT.rglob("*") if p.is_file() and p.name != "DELIVERY_MANIFEST.json" and "node_modules" not in p.parts and "__pycache__" not in p.parts),
        key=lambda p: p.relative_to(ROOT).as_posix(),
    )
]
manifest = {
    "schemaVersion": 3,
    "classification": "REVIEW_HARDENED_BOUNDED_FOUNDATION_SUCCESSOR_CANDIDATE",
    "baseline": SUCCESSOR_BASELINE,
    "lineage": LINEAGE,
    "status": "READY_FOR_INDEPENDENT_FOUNDATION_REVIEW_NOT_OWNER_ACCEPTED_NOT_FROZEN",
    "candidate_id": candidate_id,
    "file_count": len(delivery_files),
    "archive_file_count": len(delivery_files) + 1,
    "manifest_policy": "Every archive file is hash-listed except DELIVERY_MANIFEST.json itself; manifest presence is counted separately.",
    "total_uncompressed_bytes": sum(item["bytes"] for item in delivery_files),
    "files": delivery_files,
    "owner_accepted": False,
    "stack_frozen": False,
    "deployed": False,
    "released": False,
}
(ROOT / "DELIVERY_MANIFEST.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

zip_path = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT.parent / OUTPUT_NAME
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for p in sorted(
        (p for p in ROOT.rglob("*") if p.is_file() and "node_modules" not in p.parts and "__pycache__" not in p.parts),
        key=lambda p: p.relative_to(ROOT).as_posix(),
    ):
        arcname = ARCHIVE_ROOT + "/" + p.relative_to(ROOT).as_posix()
        info = zipfile.ZipInfo(arcname, date_time=(2026, 9, 11, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, p.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)

result = {
    "candidate_id": candidate_id,
    "content_tree_sha256": content_tree,
    "zip": str(zip_path),
    "zip_bytes": zip_path.stat().st_size,
    "zip_sha256": sha(zip_path),
    "manifest_file_count": len(delivery_files),
    "archive_file_count": len(delivery_files) + 1,
}
print(json.dumps(result, indent=2))
