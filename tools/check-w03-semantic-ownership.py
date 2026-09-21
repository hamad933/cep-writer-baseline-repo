#!/usr/bin/env python3
from __future__ import annotations
import csv, hashlib, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAP = ROOT / 'authority/controller/07_W03_69_REQUIREMENT_REUSE_MAP.csv'
RECEIPT = ROOT / 'assurance/W03_SEMANTIC_OWNERSHIP_CORRECTION_RECEIPT.json'
POLICY = ROOT / 'authority/W03_WORK_ADMISSION_INTERPRETATION_POLICY.json'
OUT = ROOT / 'assurance/W03_SEMANTIC_OWNER_VALIDATION.json'

def sha256_file(p: Path) -> str: return hashlib.sha256(p.read_bytes()).hexdigest()
def digest(values: list[str]) -> str: return hashlib.sha256('\n'.join(values).encode()).hexdigest()

rows=list(csv.DictReader(MAP.open(encoding='utf-8-sig',newline='')))
receipt=json.loads(RECEIPT.read_text())
policy=json.loads(POLICY.read_text())
by={r['SOURCE_ATOM_ID']:r for r in rows}
checks=[]
def check(name,ok,detail=''): checks.append({'id':name,'status':'PASS' if ok else 'FAIL','detail':detail})

atom_ids=[r['SOURCE_ATOM_ID'] for r in rows]; sections={r['SECTION_ID'] for r in rows}
req_sigs=sorted('\t'.join([r['SOURCE_ATOM_ID'],r['REQUIREMENT_ID'],r['SECTION_ID']]) for r in rows)
work_sigs=sorted('\t'.join([r['SOURCE_ATOM_ID'],r['WORK_ADMISSION'],r['ADMITTED_TASK_ID']]) for r in rows)
identity=receipt.get('identityPreservation',{}); corrected=receipt['controllerCompilationIdentity']['correctedCompilation']
check('traceability.rows-318',len(rows)==318,f'rows={len(rows)}')
check('traceability.sections-69',len(sections)==69,f'sections={len(sections)}')
check('traceability.unique-atoms-318',len(set(atom_ids))==318,f'unique={len(set(atom_ids))}')
check('identity.map-hash',sha256_file(MAP)==corrected['sha256'],sha256_file(MAP))
check('identity.atom-set-preserved',identity.get('atomIdentityPreserved') is True and digest(sorted(atom_ids))==identity.get('baselineAtomIdSetSha256')==identity.get('correctedAtomIdSetSha256'))
check('identity.requirements-preserved',identity.get('requirementIdentityPreserved') is True and digest(req_sigs)==identity.get('baselineRequirementIdentitySha256')==identity.get('correctedRequirementIdentitySha256'))
check('identity.historical-work-admission-preserved',identity.get('workAdmissionAndTaskIdsPreserved') is True and digest(work_sigs)==identity.get('baselineWorkAdmissionSha256')==identity.get('correctedWorkAdmissionSha256'))
check('receipt.bounded-review',receipt.get('rowsReviewed')==318 and receipt.get('rowsChanged',0)>0 and receipt.get('reviewCorrectionCount')==len(receipt.get('independentControllerReviewPatch',{}).get('changes',[])))
check('receipt.no-reatomization',receipt.get('noReatomization') is True)
check('policy.work-admission-is-provenance',policy.get('notCurrentBacklog') is True and policy.get('workAdmissionSemantics')=='HISTORICAL_PRE_V0_2_1_CONTROLLER_ADMISSION_PROVENANCE_ONLY' and policy.get('currentActiveDeferredTruth')=='assurance/HIGH_VALUE_DEFERRED_LEDGER.json')

expected={
'W03-PROP-00-A000':('FUTURE_WRITER_INPUT','Product-Thesis'),
'W03-PROP-00-A001':('FUTURE_WRITER_INPUT','Product-Thesis'),
'W03-PROP-01-A002':('DOMAIN_ADAPTER','RuntimeAdapter'),
'W03-PROP-01-A007':('DOMAIN_ADAPTER','ScenarioDomainAdapter'),
'W03-PROP-01-A011':('REVIEW_AUDIT_FAMILY','ReplayContext'),
'W03-PROP-02-A000':('GLOBAL_FOUNDATION','StateOwnershipRegistry'),
'W03-PROP-03-A003':('SPATIAL_FAMILY','SpatialModel'),
'W03-PROP-08-A000':('GLOBAL_FOUNDATION','SemanticCommandRegistry'),
'W03-PROP-08-A001':('GLOBAL_FOUNDATION','ActionSurfaceRegistry'),
'W03-PROP-11-A001':('DOMAIN_ADAPTER','InternalSimulationAdapter'),
'W03-PROP-11-A002':('DOMAIN_ADAPTER','InternalSimulationAdapter'),
'W03-PROP-14-A000':('DOMAIN_ADAPTER','EnterpriseTopologyDomainAdapter'),
'W03-PROP-14-A001':('DOMAIN_ADAPTER','EnterpriseTopologyDomainAdapter'),
'W03-PROP-14-A005':('DOMAIN_ADAPTER','EnterpriseTopologyDomainAdapter'),
'W03-PROP-17-A000':('DOMAIN_ADAPTER','ScenarioDomainAdapter'),
'W03-PROP-17-A001':('DOMAIN_ADAPTER','ScenarioDomainAdapter'),
'W03-PROP-19-A000':('DOMAIN_ADAPTER','ScenarioDomainAdapter'),
'W03-PROP-25-A000':('GLOBAL_FOUNDATION','ActionAvailabilityCore'),
'W03-PROP-27-A000':('SPATIAL_FAMILY','Spatial link representation'),
'W03-PROP-44-A000':('GLOBAL_FOUNDATION','ActionSurfaceRegistry'),
'W03-PROP-51-A032':('DOMAIN_ADAPTER','ScenarioDomainAdapter'),
'W03-PROP-51-A040':('GLOBAL_FOUNDATION','BidiLocalizationPreferences'),
'W03-PROP-52-A000':('FUTURE_WRITER_INPUT','VisualDesignQualityGuidance'),
'W03-PROP-54-A000':('SPATIAL_FAMILY','Spatial link representation'),
'W03-PROP-56-A000':('GLOBAL_FOUNDATION','SearchQuickNavigation'),
'W03-PROP-64-A001':('GLOBAL_FOUNDATION','WorkspaceFoundation'),
'W03-PROP-64-A002':('SPATIAL_FAMILY','Spatial'),
'W03-PROP-64-A003':('OPERATIONAL_FAMILY','Operational'),
'W03-PROP-64-A004':('OPERATIONAL_FAMILY','OperationalSessionModel'),
'W03-PROP-64-A005':('OPERATIONAL_FAMILY','SessionShelf'),
'W03-PROP-64-A006':('GLOBAL_FOUNDATION','SemanticCommandRegistry'),
'W03-PROP-64-A007':('GLOBAL_FOUNDATION','KeymapManager'),
'W03-PROP-64-A008':('GLOBAL_FOUNDATION','PaneLayoutController'),
'W03-PROP-64-A009':('GLOBAL_FOUNDATION','ScopedPreferences'),
'W03-PROP-64-A010':('GLOBAL_FOUNDATION','Context'),
'W03-PROP-64-A011':('DOMAIN_ADAPTER','RunDomainAdapter'),
'W03-PROP-64-A012':('REVIEW_AUDIT_FAMILY','Replay'),
'W03-PROP-64-A013':('GLOBAL_FOUNDATION','Accessibility'),
'W03-PROP-64-A014':('GLOBAL_FOUNDATION','Bidi'),
'W03-PROP-64-A015':('OPERATIONAL_FAMILY','RuntimeAdapter'),
'W03-PROP-64-A016':('GLOBAL_FOUNDATION','StatusFeedback'),
'W03-PROP-64-A017':('GLOBAL_FOUNDATION','SearchQuickNavigation'),
}
for aid,(layer,tok) in expected.items():
    r=by.get(aid); val=(r['REUSABLE_MECHANIC_OR_DOMAIN_OWNER'] if r else '')
    check('semantic.atom.'+aid,bool(r) and r['CONTROLLER_OWNERSHIP_LAYER']==layer and tok.lower() in val.lower(),f"{r['CONTROLLER_OWNERSHIP_LAYER'] if r else 'missing'} | {val}")

# Known category errors must remain absent from the confirmed review set.
for aid in ['W03-PROP-17-A000','W03-PROP-17-A001','W03-PROP-19-A000','W03-PROP-01-A007','W03-PROP-51-A032']:
    r=by[aid]; check('semantic.no-lab-misroute.'+aid,'labdomainadapter' not in r['REUSABLE_MECHANIC_OR_DOMAIN_OWNER'].lower(),r['REUSABLE_MECHANIC_OR_DOMAIN_OWNER'])
for aid in ['W03-PROP-25-A000','W03-PROP-44-A000']:
    r=by[aid]; check('semantic.no-responsive-misroute.'+aid,'responsivelayoutstate' not in r['REUSABLE_MECHANIC_OR_DOMAIN_OWNER'].lower(),r['REUSABLE_MECHANIC_OR_DOMAIN_OWNER'])
check('semantic.visual-guidance-not-runtime-owner',by['W03-PROP-52-A000']['CONTROLLER_OWNERSHIP_LAYER']=='FUTURE_WRITER_INPUT')

failed=[x for x in checks if x['status']=='FAIL']
out={'schemaVersion':2,'map':'authority/controller/07_W03_69_REQUIREMENT_REUSE_MAP.csv','semanticReceipt':'assurance/W03_SEMANTIC_OWNERSHIP_CORRECTION_RECEIPT.json','workAdmissionPolicy':'authority/W03_WORK_ADMISSION_INTERPRETATION_POLICY.json','status':'PASS' if not failed else 'FAIL','summary':{'passed':len(checks)-len(failed),'failed':len(failed),'total':len(checks),'sections':len(sections),'atoms':len(rows),'rowsChanged':receipt.get('rowsChanged'),'independentReviewCorrections':receipt.get('reviewCorrectionCount')},'checks':checks,'truthCeiling':'Bounded high-risk semantic-owner validation of the existing 318-row compilation. Remaining rows retain SEMANTIC_ADJUDICATION_PARTIAL and are re-adjudicated only when relevant to a future family/surface.'}
OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(f"W03_SEMANTIC_OWNER_VALIDATION: {out['status']} {out['summary']['passed']}/{out['summary']['total']} (69/318; cumulativeChanged={receipt.get('rowsChanged')}; reviewPatch={receipt.get('reviewCorrectionCount')})")
if failed:
    for x in failed: print('FAIL',x['id'],x.get('detail',''))
    raise SystemExit(1)
