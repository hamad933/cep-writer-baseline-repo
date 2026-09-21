#!/usr/bin/env python3
from pathlib import Path
import json, sys
ROOT=Path(__file__).resolve().parents[1]
A=ROOT/'assurance'
owner=json.loads((A/'W5_A_EXECUTABLE_OWNER_PROOF.json').read_text())
browser=json.loads((A/'W5_A_BROWSER/W5_A_BROWSER_PROOF.json').read_text())
ids=[
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
case_map={x.get('id'):x for x in owner.get('cases',[])}
steps={x.get('id'):x for x in browser.get('proof',{}).get('steps',[])}
browser_ids=[
'browser.read-mode-keyboard-reorder-zero-mutation',
'browser.read-mode-pointer-drag-zero-mutation',
'browser.edit-drag-switch-read-commit-zero-mutation',
]
checks={i:(case_map.get(i,{}).get('status')=='PASS') for i in ids}
browser_checks={i:(steps.get(i,{}).get('status')=='PASS') for i in browser_ids}
source=owner.get('sourceCanonicalTreeSha256')
coherent=(browser.get('sourceCanonicalTreeSha256')==source)
receipt={
 'schemaVersion':1,
 'kind':'W5_A_CONTROLLER_CORRECTION_PROOF',
 'classification':'LANE_BOUNDED_CORRECTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',
 'status':'PASS' if all(checks.values()) and all(browser_checks.values()) and coherent else 'FAIL',
 'sourceCanonicalTreeSha256':source,
 'canonicalSourceFileCount':owner.get('canonicalSourceFileCount'),
 'controllerCases':[case_map.get(i,{'id':i,'status':'MISSING'}) for i in ids],
 'browserMutationCases':[steps.get(i,{'id':i,'status':'MISSING'}) for i in browser_ids],
 'checks':{
   'allTwelveControllerCasesPass':all(checks.values()),
   'allThreeBrowserMutationCasesPass':all(browser_checks.values()),
   'browserAndExecutableBoundToSameSource':coherent,
 },
 'statusCeiling':'CANDIDATE_READY_FOR_CONTROLLER_REVIEW_ONLY_NO_SELF_PROMOTION'
}
out=A/'W5_A_CONTROLLER_CORRECTION_PROOF.json'
out.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':receipt['status'],'controllerCases':len(ids),'browserCases':len(browser_ids),'source':source},indent=2))
sys.exit(0 if receipt['status']=='PASS' else 1)
