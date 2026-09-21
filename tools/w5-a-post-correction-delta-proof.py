#!/usr/bin/env python3
from pathlib import Path
import json, sys
ROOT=Path(__file__).resolve().parents[1]
A=ROOT/'assurance'
owner=json.loads((A/'W5_A_EXECUTABLE_OWNER_PROOF.json').read_text())
browser=json.loads((A/'W5_A_BROWSER/W5_A_BROWSER_PROOF.json').read_text())
previous=json.loads((A/'W5_A_CONTROLLER_CORRECTION_PROOF.json').read_text()) if (A/'W5_A_CONTROLLER_CORRECTION_PROOF.json').exists() else None

delta_ids=[
'w5a.delta.global-owner-different-command-bus-fail-atomic',
'w5a.delta.fake-same-name-global-owner-rejected',
'w5a.delta.fake-same-name-semantic-command-bus-rejected',
'w5a.delta.action-owner-post-construction-drift-rejected-before-effect',
'w5a.delta.drag-owner-post-construction-drift-rejected-before-effect',
'w5a.delta.selection-owner-post-construction-drift-rejected-before-effect',
'w5a.delta.fake-same-name-rich-owner-cannot-inject-projection',
'w5a.delta.fake-same-name-tree-kernel-cannot-alter-path-truth',
'w5a.delta.shared-command-binding-drift-rejected-before-execution',
'w5a.delta.invalid-bridge-constructor-fail-atomic',
'w5a.delta.invalid-mode-constructor-fail-atomic',
'w5a.delta.paragraph-open-wrong-type-inapplicable-rejected-before-transaction',
'w5a.delta.paragraph-codeText-inapplicable-rejected-before-transaction',
'w5a.delta.content-field-applicability-type-matrix',
'w5a.delta.toggle-titleHtml-safe-rich-projection-and-plain-fallback',
'w5a.delta.renderer-policy-runtime-types-reject-atomically',
]
previous_ids=[
'w5a.controller.read-mode-keyboard-reorder-zero-mutation',
'w5a.controller.read-mode-pointer-drag-zero-mutation',
'w5a.controller.edit-drag-switch-read-commit-zero-mutation',
'w5a.controller.input-owner-exact-instance-reuse',
'w5a.controller.input-owner-command-global-mismatch-rejected',
'w5a.controller.fake-input-owner-rejected',
'w5a.controller.renderer-policy-failed-update-atomic',
'w5a.controller.fake-presentation-bridge-rejected',
'w5a.controller.no-op-content-update-truthful',
'w5a.controller.generic-format-update-cannot-bypass-availability',
'w5a.controller.closed-toggle-hides-presented-children',
'w5a.controller.align-background-projection-both-consumers-exact-revert',
]
original_ids=[
'w5a.owner-graph-composition','w5a.nested-render-canonical-identity','w5a.read-edit-projection-no-second-state','w5a.content-update-transaction-only',
'w5a.pointer-selection-canonical-owner','w5a.keyboard-input-command-transaction-convergence','w5a.clipboard-canonical-owner','w5a.action-canonical-owner',
'w5a.drag-pointer-canonical-owner','w5a.drag-keyboard-canonical-owner','w5a.direction-rich-content-accepted-owners','w5a.real-library-learn-consumer-parity',
'w5a.central-renderer-change-both-consumers-exact-revert','w5a.duplicate-command-owner-negative-fixture'
]
case_map={x.get('id'):x for x in owner.get('cases',[])}
browser_case_map={x.get('id'):x for x in (browser.get('proof',{}).get('executable') or {}).get('cases',[])}
source=owner.get('sourceCanonicalTreeSha256')
source_coherent=(browser.get('sourceCanonicalTreeSha256')==source)
delta_pass=all(case_map.get(i,{}).get('status')=='PASS' for i in delta_ids)
browser_delta_pass=all(browser_case_map.get(i,{}).get('status')=='PASS' for i in delta_ids)
previous_pass=all(case_map.get(i,{}).get('status')=='PASS' for i in previous_ids)
original_pass=all(case_map.get(i,{}).get('status')=='PASS' for i in original_ids)
previous_receipt_pass=(previous is None or previous.get('status')=='PASS')
receipt={
 'schemaVersion':1,
 'kind':'W5_A_POST_CORRECTION_DELTA_PROOF',
 'classification':'LANE_POST_CORRECTION_DELTA_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',
 'status':'PASS' if delta_pass and browser_delta_pass and previous_pass and original_pass and previous_receipt_pass and source_coherent else 'FAIL',
 'sourceCanonicalTreeSha256':source,
 'canonicalSourceFileCount':owner.get('canonicalSourceFileCount'),
 'deltaCases':[case_map.get(i,{'id':i,'status':'MISSING'}) for i in delta_ids],
 'browserExecutableDeltaCases':[browser_case_map.get(i,{'id':i,'status':'MISSING'}) for i in delta_ids],
 'preservedPreviousCorrectionCases':[case_map.get(i,{'id':i,'status':'MISSING'}) for i in previous_ids],
 'preservedOriginalLaneCases':[case_map.get(i,{'id':i,'status':'MISSING'}) for i in original_ids],
 'checks':{
   'allSixteenDeltaCasesPass':delta_pass,
   'allSixteenDeltaCasesPassInsideBrowserProof':browser_delta_pass,
   'allPreviousTwelveCorrectionCasesRemainPass':previous_pass,
   'previousCorrectionReceiptRemainsPass':previous_receipt_pass,
   'allOriginalFourteenLaneCasesRemainPass':original_pass,
   'browserAndExecutableBoundToSameSource':source_coherent,
   'fullLaneExecutablePass':owner.get('status')=='PASS' and owner.get('failCount')==0 and owner.get('caseCount')==42,
 },
 'statusCeiling':'CANDIDATE_READY_FOR_CONTROLLER_REVIEW_ONLY_NO_SELF_PROMOTION'
}
out=A/'W5_A_POST_CORRECTION_DELTA_PROOF.json'
out.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':receipt['status'],'deltaCases':len(delta_ids),'browserDeltaCases':len(delta_ids),'previousCases':len(previous_ids),'originalCases':len(original_ids),'source':source},indent=2))
sys.exit(0 if receipt['status']=='PASS' else 1)
