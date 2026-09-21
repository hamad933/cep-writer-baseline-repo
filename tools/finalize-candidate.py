#!/usr/bin/env python3
"""Finalize CEP Foundation v0.2.1c browser-evidence truthfulness correction."""
from __future__ import annotations
import csv,hashlib,json,sys,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASELINE_ID='CEP-FOUNDATION-0.2.1c-BROWSER-TRUTHFULNESS-CORRECTED-CANDIDATE'
ARCHIVE_ROOT='CEP_FOUNDATION_FORGE_v0.2.1c'
OUTPUT_NAME='CEP_FOUNDATION_FORGE_v0.2.1c_CONTROLLER_SUCCESSION_READY_CANDIDATE.zip'
LINEAGE={'filename':'CEP_FOUNDATION_FORGE_v0.2.1b_CONTROLLER_REVIEW_CORRECTED_CANDIDATE.zip','bytes':3593683,'sha256':'787d886903099fc0cc0cb66c2ca9299217f9b19363e632f2a5ed8c2193d514aa','candidate_id':'5cb323107f2c826cfb61abe56901a6ea0347357c6b702968db5d935b2a71854d'}
DONOR={'bytes':672893,'sha256':'ea66b58ef122bf2f8ca23fd0aa9e461b07da11ea7390c451902e4b1592d396fd'}
W03_SHA='23b66696a9cc72cb343c74e70f380ccb248e1fbc378d8ce7839ba74111a3d716'
GENERATED={'DELIVERY_MANIFEST.json','assurance/CANDIDATE_IDENTITY.json','assurance/INDEPENDENT_REVIEW_CHANGED_FILE_REGISTER.json'}

def sha_bytes(b): return hashlib.sha256(b).hexdigest()
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for c in iter(lambda:f.read(1024*1024),b''): h.update(c)
 return h.hexdigest()
def load(rel): return json.loads((ROOT/rel).read_text())
def info(p): return {'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)}
def source_files():
 return sorted((p for p in ROOT.rglob('*') if p.is_file() and p.relative_to(ROOT).as_posix() not in GENERATED and 'node_modules' not in p.parts and '__pycache__' not in p.parts),key=lambda p:p.relative_to(ROOT).as_posix())
def tree_hash(rows): return sha_bytes(''.join(f"{r['path']}\0{r['bytes']}\0{r['sha256']}\n" for r in rows).encode())
def gate(ok,msg):
 if not ok: raise SystemExit('STOP: '+msg)

# Exact immutable inputs / current gates.
donor=ROOT/'dist/reference/CEP_LIBRARY_EDITOR_EXECUTABLE_BLUEPRINT_v1.2.17_ACCEPTED_DESIGN_REFERENCE.html'
gate((donor.stat().st_size,sha(donor))==(DONOR['bytes'],DONOR['sha256']),'accepted Library donor identity mismatch')
runtime=load('contracts/FOUNDATION_RUNTIME_REGISTRY.json'); gate(runtime.get('baselineId')==BASELINE_ID and runtime.get('status')=='INDEPENDENT_REVIEW_REQUIRED' and runtime.get('stackStatus')=='STACK_NOT_FROZEN','runtime baseline/status mismatch')
gate(runtime['w03Baseline']['sha256']==W03_SHA and runtime['w03Baseline']['authority']=='W03_V3_4_SAME_LINEAGE_VALUE_DOMAIN_REQUIREMENT_EVIDENCE_DONOR_NOT_AUTHORITY','W03 donor authority mismatch')
review=load('assurance/INDEPENDENT_BROWSER_TRUTHFULNESS_PATCH.json'); gate(review['lineageBaseline']['bytes']==LINEAGE['bytes'] and review['lineageBaseline']['sha256']==LINEAGE['sha256'] and review['lineageBaseline']['candidateId']==LINEAGE['candidate_id'],'v0.2.1b lineage identity mismatch')
model=load('assurance/MODEL_TEST_RESULTS.json'); gate(model.get('pass')==58 and model.get('fail')==0,'model gate')
contract=load('assurance/CONTRACT_TEST_RESULTS.json'); gate(contract.get('pass')>=151 and contract.get('fail')==0,'contract gate')
scaffold=load('assurance/WRITER_SCAFFOLD_TEST_RESULTS.json'); gate(scaffold.get('pass')==38 and scaffold.get('fail')==0,'writer scaffold gate')
w03=load('assurance/W03_SEMANTIC_OWNER_VALIDATION.json'); gate(w03.get('status')=='PASS' and w03['summary']['passed']>=60 and w03['summary']['failed']==0 and w03['summary']['sections']==69 and w03['summary']['atoms']==318 and w03['summary']['independentReviewCorrections']==24,'W03 high-risk semantic gate')
policy=load('authority/W03_WORK_ADMISSION_INTERPRETATION_POLICY.json'); gate(policy.get('notCurrentBacklog') is True and policy.get('currentActiveDeferredTruth')=='assurance/HIGH_VALUE_DEFERRED_LEDGER.json','W03 historical admission semantics gate')
deferred=load('assurance/HIGH_VALUE_DEFERRED_LEDGER.json'); gate(len(deferred.get('items',[]))==10 and all(x.get('activeFutureObligation') for x in deferred['items']),'high-value deferred set gate')
dropped=load('assurance/DROPPED_SUPERSEDED_LOW_VALUE_TRACEABILITY.json'); gate(len(dropped.get('items',[]))==15 and all(not x.get('activeFutureObligation') for x in dropped['items']),'dropped/superseded set gate')
auth=load('assurance/CURRENT_AUTHORITY_ISOLATION_RECEIPT.json'); gate(auth.get('pass')==5 and auth.get('fail')==0,'authority isolation gate')
dup=load('assurance/DUPLICATE_MECHANIC_SCAN.json'); gate(dup.get('status')=='PASS' and not dup.get('findings'),'duplicate mechanic gate')
vers=load('contracts/FOUNDATION_CONTRACT_VERSIONS.json'); av=[x for x in vers['contracts'] if x['id']=='ActionAvailability']; gate(av and av[0]['version']=='1.2.1','ActionAvailability 1.2.1 gate')
browser_review=load('assurance/INDEPENDENT_BROWSER_REVALIDATION.json'); gate(browser_review.get('status')=='LINEAGE_BROWSER_EVIDENCE_PRESERVED_CURRENT_CLAIM_TRUTHFUL' and browser_review.get('currentCandidate')==BASELINE_ID and browser_review['lineageResult']=={'total':6,'pass':6,'fail':0,'sourceCandidate':'v0.2.1a'} and browser_review['independentCurrentEnvironment']['fullBrowserRerun']=='NOT_EXECUTED','browser truthfulness gate')
stack=load('stack/MEASURED_COMPARISON.json'); gate(stack.get('identical_model_results') is True and stack['A']['model_pass']==58 and stack['B']['model_pass']==58 and stack['A']['model_fail']==0 and stack['B']['model_fail']==0,'stack parity gate')

# No new profile semantics in this small review correction: compare to extracted exact v0.2.1a sibling if available.
base_dir=Path('/mnt/data/verify_v021b/CEP_FOUNDATION_FORGE_v0.2.1b')
if base_dir.exists():
 for p in (ROOT/'profiles').glob('*.json'):
  bp=base_dir/'profiles'/p.name; gate(bp.exists() and sha(bp)==sha(p),f'profile mutation not admitted: {p.name}')

# Active exact old-authority poison forbidden outside historical before/after receipt.
old='SOLE_SAME_LINEAGE_'+'IMPLEMENTATION_VALUE_BASELINE_NOT_ACCEPTED'; bad=[]
for p in source_files():
 if p.suffix.lower() in {'.png','.jpg','.jpeg','.zip'}: continue
 try: txt=p.read_text()
 except UnicodeDecodeError: continue
 if old in txt and p.relative_to(ROOT).as_posix()!='assurance/AUTHORITY_BEFORE_AFTER_REGISTER.json': bad.append(p.relative_to(ROOT).as_posix())
gate(not bad,f'active old W03 authority token remains: {bad}')

# Create final independent review receipt before content identity.
final_review={
 'schemaVersion':1,'status':'PASS_READY_FOR_CONTROLLER_SUCCESSION_INPUT','baselineId':BASELINE_ID,
 'lineageBaseline':LINEAGE,
 'independentGates':{'model':{'pass':58,'fail':0},'contract':{'pass':contract['pass'],'fail':0},'writerScaffold':{'pass':38,'fail':0},'w03Semantic':w03['summary'],'authority':{'pass':5,'fail':0},'duplicateMechanics':'PASS_ZERO_FINDINGS','stackParity':'58/58_JS_AND_58/58_TS_PROOF_IDENTICAL'},
 'browserTruth':{'lineageV0_2_1a':'6/6 PASS','freshV0_2_1cFullRerun':False,'currentDelta':'receipt provenance + check semantics only; no runtime/UI behavior changed','currentDeltaValidation':'model/contract/scaffold/W03/authority/deferred/stack gates PASS','reason':'review environment lacks package-local Node Playwright and offline npm cache; no false fresh-browser claim'},
 'semanticTruthCeiling':'SEMANTIC_ADJUDICATION_PARTIAL',
 'highValueDeferredItems':10,'droppedSupersededItems':15,
 'architectureStatus':['GLOBAL_EXECUTABLE_FOUNDATION','SURFACE_FAMILY_ENGINE','THIN_DOMAIN_ADAPTER','SURFACE_COMPOSITION'],
 'stackStatus':'STACK_NOT_FROZEN','ownerAccepted':False,'foundationFrozen':False,
 'controllerSuccessionRecommendation':'READY: use this truthfulness-corrected candidate as the exact current Foundation succession input, not as Owner-accepted/frozen product truth. New Controller must independently verify identity and preserve stated truth ceilings.'
}
(ROOT/'assurance/INDEPENDENT_FINAL_REVIEW.json').write_text(json.dumps(final_review,ensure_ascii=False,indent=2)+'\n')

# Delta register vs exact extracted v0.2.1a, excluding recursive generated files.
if base_dir.exists():
 def tree(root): return {p.relative_to(root).as_posix():p for p in root.rglob('*') if p.is_file() and p.relative_to(root).as_posix() not in GENERATED and 'node_modules' not in p.parts and '__pycache__' not in p.parts}
 a,b=tree(base_dir),tree(ROOT); delta=[]
 for rel in sorted(set(a)|set(b)):
  if rel not in a: delta.append({'path':rel,'change':'ADDED','after':{'bytes':b[rel].stat().st_size,'sha256':sha(b[rel])}})
  elif rel not in b: delta.append({'path':rel,'change':'REMOVED','before':{'bytes':a[rel].stat().st_size,'sha256':sha(a[rel])}})
  elif sha(a[rel])!=sha(b[rel]): delta.append({'path':rel,'change':'MODIFIED','before':{'bytes':a[rel].stat().st_size,'sha256':sha(a[rel])},'after':{'bytes':b[rel].stat().st_size,'sha256':sha(b[rel])}})
 reg={'schemaVersion':1,'lineageBaseline':LINEAGE,'scope':'v0.2.1b -> v0.2.1c browser-evidence truthfulness correction','summary':{'changedOrAdded':len(delta),'added':sum(x['change']=='ADDED' for x in delta),'modified':sum(x['change']=='MODIFIED' for x in delta),'removed':sum(x['change']=='REMOVED' for x in delta)},'files':delta}
 (ROOT/'assurance/INDEPENDENT_REVIEW_CHANGED_FILE_REGISTER.json').write_text(json.dumps(reg,ensure_ascii=False,indent=2)+'\n')
 gate(not any(x['path'].startswith('profiles/') for x in delta),'profile mutation detected in review delta')

# Content identity excludes generated identity+manifest+delta register only; delta register is separately hash-bound in manifest.
content_rows=[info(p) for p in source_files()]
content_tree=tree_hash(content_rows)
identity_material={'baselineId':BASELINE_ID,'contentTree':content_tree,'lineage':LINEAGE,'donor':DONOR['sha256'],'w03':W03_SHA,'model':58,'contract':contract['pass'],'w03SemanticPassed':w03['summary']['passed'],'w03RowsChanged':w03['summary']['rowsChanged'],'reviewCorrections':24,'deferred':10,'dropped':15,'actionAvailability':'1.2.1','browserTruth':'LINEAGE_6_6_FRESH_C_NOT_RERUN_TRUTHFUL_GATE','stack':'STACK_NOT_FROZEN'}
candidate_id=sha_bytes(json.dumps(identity_material,sort_keys=True,separators=(',',':')).encode())
identity={'schemaVersion':4,'baseline':BASELINE_ID,'candidate_id':candidate_id,'content_tree_sha256':content_tree,'content_file_count':len(content_rows),'lineageBaseline':{**LINEAGE,'verified':True},'acceptedDonor':{'path':'dist/reference/CEP_LIBRARY_EDITOR_EXECUTABLE_BLUEPRINT_v1.2.17_ACCEPTED_DESIGN_REFERENCE.html',**DONOR,'verified':True},'w03Baseline':{'sha256':W03_SHA,'classification':'W03_V3_4_SAME_LINEAGE_VALUE_DOMAIN_REQUIREMENT_EVIDENCE_DONOR_NOT_AUTHORITY'},'proof':final_review['independentGates'],'browserTruth':final_review['browserTruth'],'semanticTruthCeiling':'SEMANTIC_ADJUDICATION_PARTIAL','highValueDeferredItems':10,'droppedSupersededItems':15,'owner_accepted':False,'stack_frozen':False,'deployed':False,'released':False,'identityScope':'All current content except generated CANDIDATE_IDENTITY, DELIVERY_MANIFEST and delta-register recursion exclusions; manifest hash-lists the delta register.'}
(ROOT/'assurance/CANDIDATE_IDENTITY.json').write_text(json.dumps(identity,ensure_ascii=False,indent=2)+'\n')

# Manifest lists every file except itself; candidate identity and delta register are included.
delivery=[]
for p in sorted((p for p in ROOT.rglob('*') if p.is_file() and p.name!='DELIVERY_MANIFEST.json' and 'node_modules' not in p.parts and '__pycache__' not in p.parts),key=lambda p:p.relative_to(ROOT).as_posix()): delivery.append(info(p))
manifest={'schemaVersion':4,'classification':'CONTROLLER_REVIEW_CORRECTED_BOUNDED_FOUNDATION_CANDIDATE','baseline':BASELINE_ID,'lineage':LINEAGE,'status':'READY_FOR_CONTROLLER_SUCCESSION_INPUT_NOT_OWNER_ACCEPTED_NOT_FROZEN','candidate_id':candidate_id,'file_count':len(delivery),'archive_file_count':len(delivery)+1,'manifest_policy':'Every archive file except DELIVERY_MANIFEST.json itself is hash-listed; manifest presence is counted separately.','total_uncompressed_bytes':sum(x['bytes'] for x in delivery),'files':delivery,'browserTruth':final_review['browserTruth'],'semanticTruthCeiling':'SEMANTIC_ADJUDICATION_PARTIAL','owner_accepted':False,'stack_frozen':False,'deployed':False,'released':False}
(ROOT/'DELIVERY_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')

# Build deterministic ZIP.
out=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else ROOT.parent/OUTPUT_NAME
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted((p for p in ROOT.rglob('*') if p.is_file() and 'node_modules' not in p.parts and '__pycache__' not in p.parts),key=lambda p:p.relative_to(ROOT).as_posix()):
  zi=zipfile.ZipInfo(ARCHIVE_ROOT+'/'+p.relative_to(ROOT).as_posix(),date_time=(2026,9,11,0,0,0)); zi.compress_type=zipfile.ZIP_DEFLATED; zi.external_attr=0o100644<<16; z.writestr(zi,p.read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
with zipfile.ZipFile(out) as z: gate(z.testzip() is None,'built ZIP integrity')
print(json.dumps({'candidate_id':candidate_id,'content_tree_sha256':content_tree,'zip':str(out),'zip_bytes':out.stat().st_size,'zip_sha256':sha(out),'manifest_file_count':len(delivery),'archive_file_count':len(delivery)+1},indent=2))
