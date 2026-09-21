# CEP REPRODUCIBLE PACKAGE / CONTAINER IDENTITY ADDENDUM v1.0

CLASSIFICATION: CONTROLLER REUSABLE METHOD / ZERO-LOSS OPERATING KNOWLEDGE / NOT PRODUCT TRUTH / NOT ACCEPTANCE
DATE: 2026-09-09

## Purpose
Prevent a reusable Colab notebook from producing a new ZIP container while incorrectly claiming an older canonical ZIP SHA.

## Identity layers
1. Source identity: source-file universe + source manifest + Git tree.
2. Package logical identity: source plus Controller evidence/metadata members included in the package.
3. Container byte identity: exact ZIP bytes and SHA-256.

A matching source tree/manifest does not imply a matching ZIP SHA.

## Canonical reproduction law
If a workflow asserts an already-established canonical ZIP SHA, it MUST reproduce:
- exact clean predecessor;
- exact admitted source overlay;
- exact package-internal evidence filenames;
- exact internal JSON/text contents and serialization;
- exact package manifest filename/content;
- exact member file modes;
- exact ZIP member order;
- exact ZIP timestamps;
- exact compression algorithm/level/runtime behavior where byte identity depends on it.

If any package-internal metadata is simplified, renamed, reordered, or otherwise changed, the output is a NEW container. It may preserve source identity, but it must receive a new ZIP SHA and must not be silently substituted for the canonical container.

## W01/W02 incident
Canonical proven package:
- size: `3,061,541`
- SHA-256: `bdd7343bc2ca34e5ea0785ddce53eaaf7eff0164b93c78b7851d24b3eb6c4626`
- source tree: `5a5c083594dbc76177e2c5039ac6f55ba69e31c6`
- source manifest: `3f9490517e0d98f0f5bb816d527bf43aa047ea5b78f62eedf728c8397d7063e4`

Clean Notebook v1.0 first packaging attempt:
- size: `3,061,166`
- SHA-256: `d530c9fcc459ba67d8f9b4527e9e97057bbe287b72ac0022c78ebe2010415b73`

The source identity remained the intended successor identity, but internal package metadata had been simplified. Therefore the ZIP mismatch was a notebook-packaging defect, not a Product/C025 regression.

## Reusable stop condition
When canonical container verification fails:
1. do not change the expected canonical SHA merely to make the cell pass;
2. verify source tree and source manifest separately;
3. compare package member universe and package-internal metadata;
4. restore the canonical recipe if canonical reproduction is required;
5. otherwise explicitly mint and govern a new container identity.
