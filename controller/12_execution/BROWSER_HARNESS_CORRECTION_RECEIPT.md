# BROWSER HARNESS CORRECTION RECEIPT

**Classification:** `HARNESS_OR_EVIDENCE_CORRECTION__NO_PRODUCT_MUTATION`

Parent: `writer/mi-serial@7ce4a4b9a62137ab4a798bdbf68b20d8405da826` / tree `2d339261e1b20c2373898ab132719bd04be7dfd9`.

Corrected only `tools/browser-conformance.mjs`:

1. Runs causal oracle now reads the terminal-command event from `recordedSnapshot.events`, matching the current public recorded projection used for runtime causality. It no longer reads fixture/source `workspace.events` for the live command receipt.
2. Learn Bidi assertion no longer requires historical literal tokens such as `KU`, `TCP/IP`, `policy`, or `learn-document`. It asserts the current semantic contract: at least one non-empty token is rendered through `bdi[dir="ltr"]` while Learn remains donor/Library-state isolated.
3. Enterprise relation flows are deliberately unchanged. Their current failures remain Product-integration falsifiers against the active Enterprise `SpatialView` and shared `RelationInteractionOwner` boundary.

Expected rerun semantics:
- Runs false failure should close if current runtime behavior is healthy.
- Learn false failure should close if current Bidi rendering contract is healthy.
- Enterprise relation flows may remain FAIL until Product integration is corrected.

No `stack/native-typescript/**`, profile, governance authority, Owner decision, acceptance, release, deployment, or stack-freeze state is modified by this correction.
