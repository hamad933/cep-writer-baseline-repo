# CEP Writer — C2 Start Here

1. Verify the Capsule before any mutation.
2. Materialize the local workspace from `repo.bundle`.
3. Verify exact accepted Product parent `ac888c7e622fdefdc4f958771b21db485e33f9fc` is an ancestor of the Capsule transport HEAD and verify Product source identity `5885c32a... / 273`.
4. Read `cep-writer/C2_MISSION.md`, `TASK_BINDING.json`, `PARENT_IDENTITY.json`, applicable Owner decisions, C1 Controller acceptance, C2 defect ledger, W04 profiles/oracle, and Capsule method.
5. Open the prebuilt `visual-bootstrap/VISUAL_BOOTSTRAP_MANIFEST.json` and baseline screenshots before generating another baseline.
6. Execute C2 locally. Do not use GitHub Actions as the correction loop.
7. Never edit `cep-writer/**`; it is Controller-owned task authority.
8. Stop on identity/hash mismatch. Do not silently refetch or substitute.
