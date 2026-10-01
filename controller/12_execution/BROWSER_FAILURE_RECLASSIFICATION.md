# BROWSER CONFORMANCE FAILURE RECLASSIFICATION — CONTROLLER

Basis: writer/mi-serial@f66337313c2ab3da2cae3a25855be03b0430e1f0 / tree b04514f2c787768433e8e5f7c80c7cf40265fa51.
Prior exact browser receipt: 6 flows = 2 PASS / 4 FAIL.

- relation.route-convergence-and-label-scope: PRODUCT_INTEGRATION_DEFECT. Purpose-built Enterprise mounts its own SpatialView but does not bind that active view to the shared RelationInteractionOwner relation callback. Label/F2 routes therefore do not converge on the shared relation composer.
- central-change-reuse: PRODUCT_INTEGRATION_DEFECT. CEPFoundation.spatial resolves to the purpose-built Enterprise SpatialView while CEPFoundation.relationUI.spatial remains the earlier/global SpatialView.
- runtime-causal-consequence: HARNESS_ORACLE_DEFECT. The harness read W03RunDomain.workspace().events, which projects source/observed fixture events; the live terminal command receipt is in recordedSnapshot.events from InternalSimulationAdapter.recorded().
- spatial-input-bidi-preference-and-structured-isolation: HARNESS_ASSERTION_DEFECT. Learn already emits technical tokens through bdi dir=ltr; the harness required historical literal tokens that are not guaranteed in the current source-unavailable Learn state.

Harness correction may close the Runs and Learn false failures and must make the Enterprise failures explicit against the active SpatialView. No Product mutation is authorized by this record.

Enterprise shared-relation correction is not admitted as a direct Controller Product patch here because the correct fix must preserve W03 Enterprise lifecycle/dirty-state semantics while rebinding the shared relation-interaction presentation owner across a shared seam.

Expected truthful rerun: at least Runs and Learn no longer fail for stale oracle/assertion reasons; Enterprise remains FAIL until separately corrected. Browser evidence is not Product acceptance.
