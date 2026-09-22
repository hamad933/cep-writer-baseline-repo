# START HERE — CEP CORR02 C1 Writer

This repository is a **self-contained C1 Writer input**. `cep-writer/**` is Controller-owned read-only mission authority.

1. Checkout the exact candidate branch `writer/presentation-corr02-google-ai-studio` at its current Controller C0 packet HEAD. Do not use `main` as the work branch.
2. Run `python3 cep-writer/tools/verify_repo.py` before Product mutation.
3. Read, in order: `TASK_BINDING.json`, `PARENT_IDENTITY.json`, `CURRENT_MISSION.md`, `authority/AUTHORITY_PACKET.md`, `authority/APPLICABLE_OWNER_DECISIONS.csv`.
4. Read `controller-input/CORR02_PRE_WRITER_DEEP_DEFECT_AUDIT.md`, `references/WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md`, and the exact matrix / visual / interaction references named by `CURRENT_MISSION.md`.
5. Verify Product canonical source is exactly `777d8b24032891b00bf3b61858a3be015b0b77fea710e1d5bd446d182577bb51` / `273` before mutation. C0 changes only Writer authority/input bytes, never Product bytes.
6. Execute **C1 only**: shared EventTarget/carrier/toolbar/context/region correction. Do not begin C2/C3/B3-R.
7. Use local-first build/test/browser discovery. Managed genuine-route/CI proof is a second validation layer, not the primary investigation loop.
8. Never edit `cep-writer/**` as the Writer. Do not mutate governance, accepted successors, `main`, release/deployment state or stack status.
9. Stop at the C1 handoff with `CANDIDATE_ONLY__CONTROLLER_AUDIT_REQUIRED`.
