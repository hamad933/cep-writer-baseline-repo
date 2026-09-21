# CEP W01/W02 COLAB TASK — C025→C026 CUSTODY BRIDGE ADDENDUM v1.0

CLASSIFICATION: CURRENT TASK ADDENDUM / NOT ACCEPTANCE / NOT RUNTIME EVIDENCE

## Why this addendum exists
C025 runtime execution discovered bounded Product/test corrections. Therefore browser evidence may not continue on the disposable mutated v1.1.5.1 source. A new exact successor v1.1.5.2 exists locally but Drive server File-ID custody is still open.

## New mandatory bridge cell
`CELL_02_5_SUCCESSOR_DRIVE_CUSTODY_FRESH_BOOTSTRAP.py`
SHA-256: `798b7668686c2947104bead10bde30d8cab19834f91842fee3128ac2a0eceb79`

It performs only:
1. canonical local v1.1.5.2 SHA/size gate;
2. Drive exact-name reconciliation;
3. server-side create only when exact object absent;
4. bounded retry for Drive rate-limit failures;
5. exact Drive File ID re-download and SHA verification;
6. intended-parent verification;
7. fresh ZIP extraction/CRC;
8. all 592 source-manifest member verification;
9. source-tree verification;
10. execution-only dependency hydration from the already-proven live runtime after lockfile identity checks;
11. fresh frontend build;
12. state update to authorize CELL03 only after every custody/bootstrap gate passes.

## Explicit prohibitions
- no rerun of C025 test waves;
- no browser evidence inside CELL02.5;
- no CELL04 authorization;
- no GitHub mutation;
- no Owner acceptance/freeze/merge/release/deploy.

## Next
After CELL02.5 PASS, run `CELL_03_RUNTIME_BROWSER_CORE.py` only. Review its receipt before CELL04.
