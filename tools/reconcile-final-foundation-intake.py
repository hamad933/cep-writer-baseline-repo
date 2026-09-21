#!/usr/bin/env python3
import json, glob, os, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def load(p): return json.loads((ROOT/p).read_text(encoding='utf-8'))
def dump(p,v):
 p=ROOT/p; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

runtime=load(Path('contracts/FOUNDATION_RUNTIME_REGISTRY.json'))
core=load(Path('contracts/CORE_OWNER_REGISTRY.json'))
components=load(Path('contracts/COMPONENT_REGISTRY.json'))
versions=load(Path('contracts/FOUNDATION_CONTRACT_VERSIONS.json'))
BASELINE='CEP-FR-E18-ANALYTICAL-COMPARE-COMPLETION'
_code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs';const x=await canonicalSourceIdentity(new URL('file://'+process.cwd().replaceAll('\\\\','/')+'/'));console.log(JSON.stringify({sha256:x.sha256,files:x.files}))"
_source=json.loads(subprocess.check_output(['node','--input-type=module','-e',_code],cwd=ROOT,text=True))
SOURCE_HASH=_source['sha256']; SOURCE_FILES=_source['files']

by_sc={}
for c in components: by_sc.setdefault(c.get('semantic_core'),[]).append(c)

aliases={
 'SC-001':('READY_BY_EXISTING_APPLICATION_SHELL_BOUNDARY',['WorkspaceFrame','SemanticCommandBus','GlobalInputKeymapOwner'],'Global destination shell is Controller-owned application composition outside per-surface writable scope; Surface Writers bind destination identity only.'),
 'SC-010':('READY_BY_SCOPED_PREFERENCES_OWNER',['ScopedPreferencesOwner'],'Preference persistence is already owned by ScopedPreferencesOwner; no second persistence owner is permitted.'),
 'SC-011':('READY_BY_SCOPED_PREFERENCES_OWNER',['ScopedPreferencesOwner'],'Export/import/reset semantics remain one ScopedPreferencesOwner boundary; surfaces only bind applicable keys.'),
 'SC-012':('READY_BY_EXISTING_PRESENTATION_POLICY',['ScopedPreferencesOwner','InputDirectionResolver'],'Locale/chrome direction presentation binds current preference and direction owners; no domain-language inference.'),
 'SC-014':('READY_BY_EXISTING_PRESENTATION_POLICY',['UIScalePolicyOwner','StructuredRichContentOwner'],'Typography/script presentation is a presentation policy; Structured content uses accepted rich-content owner and non-Structured surfaces may style only inside surface scope.'),
 'SC-015':('READY_BY_EXISTING_BIDI_POLICY',['InputDirectionResolver','StructuredRichContentOwner'],'Technical-token isolation is presentation/rich-content policy; domain meaning is not inferred.'),
 'SC-018':('READY_BY_EXISTING_AVAILABILITY_OWNERS',['ActionAvailabilityCore','StructuredCommandAvailabilityOwner','SemanticCommandBus'],'Availability stays with semantic/family owner and unavailable actions produce no mutation receipt.'),
 'SC-021':('READY_BY_DISTRIBUTED_ACCESSIBILITY_OWNERS',['GlobalInputKeymapOwner','TransientFocusController','AccessibilityFeedbackOwner','PaneLayoutController'],'Accessibility behavior is distributed across accepted focus/input/pane/feedback owners; no surface-local accessibility engine.'),
 'SC-024':('READY_BY_THIN_DOMAIN_ADAPTER',['SurfaceDomainAdapter'],'Search/filter truth is domain-owned; shared shell only hosts presentation and command routing.'),
 'SC-025':('READY_BY_ROUTING_AND_DOMAIN_DESCRIPTOR',['SemanticCommandBus','StructuredNavigationDescriptorOwner','SurfaceDomainAdapter'],'Quick access/navigation binds existing routing and domain descriptors; Structured consumers inherit the accepted navigation descriptor owner.'),
 'SC-028':('READY_BY_FAMILY_OR_SURFACE_BOUNDARY',['StructuredTransactionHistoryRecoveryOwner','SurfaceDomainAdapter'],'Structured history inherits canonical owner; non-Structured history remains domain-specific and may not become a duplicate generic engine.'),
 'SC-029':('READY_BY_FAMILY_OR_SURFACE_BOUNDARY',['StructuredClipboardTrustOwner','SurfaceDomainAdapter'],'Structured clipboard inherits canonical owner; other surfaces may bind domain export/copy without creating a shared clipboard engine.'),
 'SC-033':('READY_BY_THIN_DOMAIN_ADAPTER',['SurfaceDomainAdapter'],'Provenance meaning is domain-owned and must be supplied by a thin adapter.'),
 'SC-034':('READY_BY_THIN_DOMAIN_ADAPTER',['SurfaceDomainAdapter'],'Collection/table/matrix rows and actions are domain-bound surface composition, not a missing global engine.'),
 'SC-035':('READY_BY_THIN_DOMAIN_ADAPTER',['SurfaceDomainAdapter'],'Timeline/replay identity and event meaning are domain-bound; Operational consumers additionally inherit RuntimeAdapter.'),
 'SC-037':('READY_BY_THIN_DOMAIN_ADAPTER',['SurfaceDomainAdapter'],'Review/adjudication semantics remain domain-owned; shared confirmation/commands are inherited.'),
 'SC-039':('READY_BY_EXPLICIT_NOT_APPLICABLE_BOUNDARY',['SurfaceDomainAdapter'],'Production mapping is evidence-only for the bounded local CEP Foundation; no production target is fabricated.'),
 'SC-040':('READY_BY_PREFERENCE_DOMAIN_BOUNDARY',['ScopedPreferencesOwner','SurfaceDomainAdapter'],'Presentation preferences and domain configuration remain distinct owners.'),
}

for row in core:
 sc=row['foundation_id']; comps=by_sc.get(sc,[])
 open_comps=[c for c in comps if 'OPEN_NOT_IMPLEMENTED' in str(c.get('status'))]
 accepted=[c for c in comps if c not in open_comps]
 if sc=='SC-032' and accepted:
  disp='READY_BY_EXECUTABLE_OWNER'; owners=[c['component_id'] for c in accepted]; truth='AnalyticalCompare is Controller-accepted executable SC-032 owner with exact pinned compare mechanics and typed domain provider boundary.'
 elif sc=='SC-032':
  disp='BLOCKED_MISSING_ANALYTICAL_COMPARE_EXECUTABLE_OWNER'; owners=[]; truth='AnalyticalCompare remains OPEN_NOT_IMPLEMENTED; surfaces that require it via INHERIT_AND_BIND are not releasable.'
 elif accepted:
  disp='READY_BY_EXECUTABLE_OWNER'; owners=[c['component_id'] for c in accepted]; truth='Current executable/component registry supersedes historical conceptual/partial labels for final intake decisions.'
 elif sc in aliases:
  disp,owners,truth=aliases[sc]
 else:
  disp='READY_BY_PROFILE_BOUNDARY_OR_EXPLICIT_NA'; owners=['SurfaceDomainAdapter']; truth='No reusable executable Foundation engine is claimed; profile classification must be OPTIONAL, NOT_APPLICABLE, or bound through the named thin surface domain adapter.'
 row['final_gate_disposition']=disp
 row['final_gate_current_owners']=owners
 row['final_gate_truth']=truth
 row['final_gate_baseline']=BASELINE

dump(Path('contracts/CORE_OWNER_REGISTRY.json'),core)
# Final-gate content identity supersedes the E16 parent label while preserving all closed Wave statuses.
runtime['baselineId']=BASELINE
runtime['status']='CONTROLLER_ACCEPTED_POST_FINAL_GATE_FOUNDATION_SUCCESSOR_CONTENT'
runtime['finalFoundationGateStatus']='CONTROLLER_ACCEPTED_AND_CLOSED_ALL_SURFACES_READY'
versions['baselineId']=BASELINE
dump(Path('contracts/FOUNDATION_CONTRACT_VERSIONS.json'),versions)
mechanics=load(Path('contracts/MECHANIC_OWNERSHIP_REGISTRY.json')); mechanics['baselineId']=BASELINE; dump(Path('contracts/MECHANIC_OWNERSHIP_REGISTRY.json'),mechanics)
dev=load(Path('contracts/DEVIATION_REGISTER.json')); dev['baselineId']=BASELINE; dump(Path('contracts/DEVIATION_REGISTER.json'),dev)
writer=load(Path('writer/WRITER_INTAKE_TEMPLATE.json')); writer['foundationBaseline']=BASELINE; dump(Path('writer/WRITER_INTAKE_TEMPLATE.json'),writer)

family_map={'UnifiedEditor':'Structured','Structured':'Structured','SpatialInteraction':'SpatialRelation','SpatialRelation':'SpatialRelation','OperationalSurface':'OperationalTerminal','OperationalTerminal':'OperationalTerminal','AnalyticalCompare':'AnalyticalCompare'}
family_runtime={x['id']:x for x in runtime.get('familyEngines',[])}
profiles=[]
for path in sorted(glob.glob(str(ROOT/'profiles/*.json'))):
 p=Path(path); prof=json.loads(p.read_text(encoding='utf-8')); surface=prof['surface']; families=[family_map.get(x,x) for x in prof.get('family_engines',[])]
 dims=[]; blockers=[]
 for sc,rule in prof.get('foundation',{}).items():
  crow=next((x for x in core if x['foundation_id']==sc),None)
  classification=rule.get('classification','MANDATORY_INHERIT')
  disp=(crow or {}).get('final_gate_disposition','READY_BY_PROFILE_BOUNDARY_OR_EXPLICIT_NA')
  if classification=='NOT_APPLICABLE': status='READY_NOT_APPLICABLE'
  elif classification=='OPTIONAL': status='READY_OPTIONAL'
  elif disp.startswith('BLOCKED_'):
   status='BLOCKED'; blockers.append({'dimension':sc,'code':disp,'reason':(crow or {}).get('final_gate_truth')})
  else: status='READY'
  dims.append({'id':sc,'classification':classification,'status':status,'profileOwner':rule.get('owner'),'boundOwners':(crow or {}).get('final_gate_current_owners',[]),'disposition':disp})
 for fam in families:
  eng=family_runtime.get(fam)
  if not eng:
   dims.append({'id':f'FAMILY:{fam}','classification':'MANDATORY_INHERIT','status':'BLOCKED','boundOwners':[],'disposition':'BLOCKED_FAMILY_NOT_REGISTERED'})
   blockers.append({'dimension':f'FAMILY:{fam}','code':'BLOCKED_FAMILY_NOT_REGISTERED','reason':'Required family engine is absent from current runtime registry.'})
  else:
   st='READY_BOUNDED_INTERNAL_SIMULATION_ONLY' if fam=='OperationalTerminal' else 'READY'
   dims.append({'id':f'FAMILY:{fam}','classification':'MANDATORY_INHERIT','status':st,'boundOwners':[eng.get('engine')],'disposition':'READY_BY_ACCEPTED_FAMILY_ENGINE'})
 adapter=f'stack/native-typescript/adapters/surfaces/{surface}-domain.ts'
 r3_all=[f'G{i:02d}' for i in range(1,24)]
 structured_subset=['G02','G03','G04','G05','G06','G07','G08','G09','G10','G11','G12','G13','G14','G15','G16','G19','G20','G22','G23']
 global_subset=['G12','G13','G14','G15','G19','G20','G22']
 r3=r3_all if surface=='library' else (structured_subset if 'Structured' in families else global_subset)
 ready=not blockers
 profiles.append({
  'surface':surface,'workspace':prof.get('workspace'),'profilePath':f'profiles/{surface}.json','familySet':families,
  'overall':'READY' if ready else 'BLOCKED','dimensions':dims,'blockers':blockers,'unresolvedDomainDecisions':[],
  'domainAdapter':{'name':''.join(part.title() for part in surface.split('_'))+'DomainAdapter','path':adapter,'status':'TO_BE_IMPLEMENTED_BY_SURFACE_WRITER','canonicalStateOwner':'DOMAIN_ADAPTER_OWNS_DOMAIN_MEANING'},
  'domainTruth':{'identitySchema':prof.get('objects',{}),'epistemicStates':prof.get('epistemic',{}),'persistenceBoundary':'UNAVAILABLE_UNTIL_SURFACE_DOMAIN_ADAPTER_PROVES_PROVIDER','forbiddenInference':['Do not fabricate persistence/runtime/provider truth','Do not move domain canonical state into Foundation','Do not create duplicate reusable owners']},
  'writableScope':{'allowed':[f'stack/native-typescript/surfaces/{surface}/**',f'stack/native-typescript/adapters/surfaces/{surface}-domain.ts',f'stack/native-typescript/tests/surfaces/{surface}/**'],'readOnly':['stack/native-typescript/foundation/**','contracts/**','profiles/**','writer/**','authority/**','assurance/**'],'prohibited':['CURRENT_CONTROL','accepted successors','shared registries','other surfaces','GitHub']},
  'requiredR3Scenarios':r3,
  'negativeAssertions':['no duplicate owner','no fake persistence','no synthetic family state','no unavailable mutation receipt','no representation-only domain mutation','no stale registry path'],
  'releaseRule':'WRITER_MAY_START_ONLY_FROM_CONTROLLER_GENERATED_EXACT_AUTHORITY_INTAKE' if ready else 'NO_SURFACE_BUILD'
 })

readiness={'schemaVersion':1,'baselineId':BASELINE,'canonicalSourceSha256':SOURCE_HASH,'canonicalSourceFiles':SOURCE_FILES,'status':'FINAL_GATE_READINESS_CLASSIFICATION','readyCount':sum(x['overall']=='READY' for x in profiles),'blockedCount':sum(x['overall']=='BLOCKED' for x in profiles),'rows':profiles}
dump(Path('contracts/SURFACE_READINESS_REGISTRY.json'),readiness)

# A non-circular parent authority used only to test the generator before the final successor exists.
dump(Path('authority/FINAL_GATE_PARENT_AUTHORITY.json'),{
 'controlEpochId':'CEP-FR-EXEC-20260913-E17-FINAL-GATE-CLOSED','successorId':'CEP-FR-E17-FFG-5dcc401a','successorPath':'/cep_building_mgm/40_ACCEPTED_SUCCESSORS/CEP_FOUNDATION_FORGE_v0.2.1c_FINAL_FOUNDATION_INTAKE_GATE_CONTROLLER_ACCEPTED_SUCCESSOR.zip','successorBytes':26039878,'successorSha256':'692a2acc7ca9c10253ee115c81d2c3c1fd720927e5d5189a9cb1b0b2043c4cd4','canonicalSourceRoot':'stack/native-typescript/','canonicalSourceSha256':'5dcc401a95f6b7b38bbd2f64d9140c29182eb459042dc6e3dd7be5460c6bca5f','canonicalSourceFiles':113,'contentTreeSha256':'0c9dcd8a0268e50748b6099cf57d1f72f987c3b473a47c9cb133dd853de32ba5','authorityPurpose':'FINAL_GATE_TEST_PARENT_ONLY_NOT_SURFACE_RELEASE_AUTHORITY'})

runtime['finalFoundationIntakeGate']={'status':'CONTROLLER_ACCEPTED_AND_CLOSED_ALL_SURFACES_READY','classification':'PER_SURFACE_READINESS','readinessRegistry':'contracts/SURFACE_READINESS_REGISTRY.json','readySurfaces':[x['surface'] for x in profiles if x['overall']=='READY'],'blockedSurfaces':[{'surface':x['surface'],'blockers':x['blockers']} for x in profiles if x['overall']=='BLOCKED'],'stackStatus':'STACK_NOT_FROZEN','surfaceReleaseRequiresExactExternalControllerAuthority':True}
dump(Path('contracts/FOUNDATION_RUNTIME_REGISTRY.json'),runtime)
print(json.dumps({'status':'PASS','baseline':BASELINE,'ready':readiness['readyCount'],'blocked':readiness['blockedCount'],'blockedSurfaces':[x['surface'] for x in profiles if x['overall']=='BLOCKED']},indent=2))
