# CEP SELF_CONTAINED_WRITER_WORKSPACE_CAPSULE v1.1

Purpose: give a CEP Writer one Controller-prepared, exact, locally usable inbound workspace artifact instead of connector-driven repository assembly or Writer-owned environment preparation.

Core lifecycle:

`Controller exact parent + task packet + governed harness/visual bootstrap binding -> capsule branch -> workflow captures bounded exact-parent bootstrap evidence -> one artifact -> local materialization -> compare/fix/recapture loop -> bounded final handoff`.

## Controller-owned preparation

The Writer does **not** build the capsule, assemble the repository, choose the initial harness, or manufacture the first baseline merely to begin work.

Before handoff the Controller binds:
- exact Product/source parent and candidate branch;
- complete mission-bound authority/reference inputs;
- writable/read-only/prohibited scope and Stop Gate;
- the applicable capture harness for presentation-heavy work;
- a bounded initial Visual Bootstrap Pack when material and technically available.

## Built capsule contents

A built capsule contains:
- `repo.bundle`: exact Git bundle for local clone-equivalent materialization.
- `CAPSULE_BINDING.json`: Controller mission/source/scope/custody binding.
- `CAPSULE_MANIFEST.json`: source/tree/payload identity and hashes.
- `SHA256SUMS.txt`: payload checksums.
- `bootstrap.sh` / `bootstrap.ps1`: one-command local materialization.
- `verify_capsule.py`: offline integrity/source verifier.
- `README_FIRST.md`: generated task-local start instructions.
- `visual-bootstrap/`: Controller-prepared bootstrap pack.

When enabled, `visual-bootstrap/` contains:
- `VISUAL_BOOTSTRAP_MANIFEST.json`;
- `VISUAL_BOOTSTRAP_CONFIG.json`;
- `baseline-current/`: bounded screenshots from the exact capsule source parent;
- `raw-receipts/`: source-bound capture/harness receipts;
- task-specific reference bindings and comparison plan in the manifest.

The bootstrap screenshots are **BOOTSTRAP ONLY**, not final acceptance evidence. Their purpose is to let the Writer compare immediately against the governed reference and start correcting the Product.

## Writer first action

The intended first Writer sequence is:

`download one artifact -> verify -> materialize -> inspect prebuilt baseline/reference mapping -> compare -> diagnose -> fix -> recapture locally -> compare again`.

If the bootstrap pack is partial/unavailable or a needed state is missing, the Writer uses the already-packaged harness/method to capture the missing state locally. The Writer does not rebuild the capsule or silently fetch substitute source bytes.

## Evidence locality

Intermediate screenshots/crops/diffs/videos/logs/build outputs produced during correction stay local under OD-073. Only final representative evidence is promoted when materially required.

GitHub remains Product source/delta + small receipt transport. Heavy final generated custody goes to Google Drive for CHATGPT_WRITER when required.

## Authority ceiling

The capsule and bootstrap pack are transport/execution accelerators only. Workflow PASS, screenshots, artifact presence, or harness output never create Product, mission, Owner-decision, acceptance, merge, release, or readiness authority.

## C1 grandfathering

CORR02 C1 remains bound to its already prepared pre-capsule packet. The first downstream mission launched after Controller-clean C1 uses this v1.1 method or an explicitly accepted successor.
