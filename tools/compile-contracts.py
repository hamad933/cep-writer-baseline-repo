from pathlib import Path
import csv,json,re,hashlib,shutil
import subprocess, sys
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT.parent;P=BASE/'mission/CEP_CHATGPT_WORK_UNIVERSAL_FOUNDATION_FORGE_MISSION_v1.0';CC=BASE/'control_sources/CEP_EXECUTION_CONTROL_CENTER'
_expanded=list((BASE/'expanded').glob('CEP_BIG*/CEP_BIG*')) if (BASE/'expanded').exists() else []
if not (P.exists() and CC.exists() and _expanded):
 # Portable accepted-successor mode: historical compiler inputs are intentionally not required outside the original Controller workspace.
 # Reconcile the bundled current registries/intake from canonical package truth and exit without attempting historical archaeology.
 for tool in ['reconcile-current-owner-registries.py','reconcile-final-foundation-intake.py']:
  tp=ROOT/'tools'/tool
  if tp.exists(): subprocess.run([sys.executable,str(tp)],cwd=ROOT,check=True)
 print(json.dumps({'status':'PASS','mode':'PORTABLE_CURRENT_BUNDLE','historicalExternalInputs':'NOT_REQUIRED','reconciled':['current-owner-registries','final-foundation-intake']}))
 raise SystemExit(0)
B=_expanded[0]
import atexit
def _restore_current_owner_truth():
 subprocess.run([sys.executable, str(ROOT/'tools/reconcile-current-owner-registries.py')], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
atexit.register(_restore_current_owner_truth)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def readcsv(p):return list(csv.DictReader(p.open(encoding='utf-8-sig')))
def js(path,d):p=ROOT/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2))
def cs(path,rows):
 p=ROOT/path;p.parent.mkdir(parents=True,exist_ok=True)
 if not rows:return
 keys=list(dict.fromkeys(k for r in rows for k in r))
 with p.open('w',newline='',encoding='utf-8')as f:
  w=csv.DictWriter(f,keys);w.writeheader();w.writerows({k:json.dumps(v,ensure_ascii=False)if isinstance(v,(list,dict))else v for k,v in r.items()}for r in rows)
for d in ['authority/sources','contracts/schemas','profiles','writer','stack','checkpoints','assurance','archaeology']: (ROOT/d).mkdir(parents=True,exist_ok=True)
for p in (P/'05_SCHEMAS').glob('*'):shutil.copy2(p,ROOT/'contracts/schemas'/p.name)
# Keep original decision bodies, not filenames as authority.
registry=readcsv(P/'01_AUTHORITY/CEP_CANONICAL_SOURCE_AUTHORITY_REGISTRY_v1.0.csv');owner=readcsv(P/'01_AUTHORITY/OWNER_CURRENT_SUPERSESSION_ADDENDUM_v1.0.csv');canonical=readcsv(P/'01_AUTHORITY/CEP_CANONICAL_DECISION_SUPERSESSION_REGISTRY_v1.0.csv')
regby={r['source_name']:r for r in registry};intake=[]
for source_root,label in [(P,'mission'),(CC,'control')]:
 for p in sorted(source_root.rglob('*')):
  if not p.is_file()or'.openai-download-'in p.name:continue
  digest=sha(p);r=regby.get(p.name,{});kind=r.get('canonical_authority_class','MISSION_CURRENT'if label=='mission'else'UNMAPPED_SOURCE_REQUIRES_DISPOSITION')
  texttype=p.suffix.lower()in['.md','.txt','.csv','.json'];record={'source':label+'/'+str(p.relative_to(source_root)),'bytes':p.stat().st_size,'sha256':digest,'authority_class':kind,'inspection':'FULL_BYTES_AND_STRUCTURED_CONTENT'if texttype else'CONTAINER_OR_BINARY_IDENTITY','canonical_registry_match':bool(r)}
  if texttype:
   dest=ROOT/'authority/sources'/label/p.relative_to(source_root);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest);record['preserved_content']=str(dest.relative_to(ROOT));record['text_lines']=len(p.read_text(errors='replace').splitlines())
  intake.append(record)
cs('authority/SOURCE_INTAKE_RECEIPTS.csv',intake)
def foundation_intake(r):
 name=r.get('source_name','');cc=r.get('canonical_authority_class','');cat=r.get('catalog_classification','');norm=r.get('normative_use','');low=(name+' '+cc+' '+cat).lower()
 if name=='CEP_LIBRARY_EDITOR_EXECUTABLE_BLUEPRINT_v1.2.17_ACCEPTED_DESIGN_REFERENCE.html':return 'ACCEPTED_DESIGN_DONOR'
 if 'w03' in low and ('v3.4' in low or 'v34' in low):return 'VALUE_DOMAIN_REQUIREMENT_EVIDENCE_DONOR_ONLY'
 if cc in {'CURRENT_DIRECT_OWNER_RULE','CURRENT_GOVERNED_OWNER_RULE','CURRENT_CONTROLLER_ADJUDICATION'} or cat=='OWNER_GLOBAL_RULE_OR_PROTOCOL':return 'CURRENT_GOVERNANCE_ONLY_NO_IMPLEMENTATION_PROMOTION'
 if 'METHOD' in cc or 'METHOD' in cat or norm in {'PROCESS_ONLY','NO_PRODUCT_DESIGN'}:return 'METHOD_ONLY'
 if any(x in low for x in ['historical_or_candidate_implementation_archive','historical_superseded_control','superseded_control_lineage']):return 'HISTORICAL_ONLY'
 if any(x in low for x in ['traceability_or_assurance','writer_packet_or_handoff','independent_controller_review_evidence','supporting_control_or_evidence','library_traceability_evidence']):return 'SUPPORTING_EVIDENCE_NOT_IMPLEMENTATION_AUTHORITY'
 return 'EXACT_LOOKUP_ONLY'
for r in registry:r.update({'mission_rule':'Current direct Owner supersedes conflicting clauses; acceptance does not transfer from title/version','current_owner_accepted_target':r['source_name']=='CEP_LIBRARY_EDITOR_EXECUTABLE_BLUEPRINT_v1.2.17_ACCEPTED_DESIGN_REFERENCE.html','review_scope':'Source normative/descriptive separation preserved from bundled content registry','foundation_intake_status':foundation_intake(r),'foundation_implementation_authority':'false','foundation_intake_note':'No retained source auto-promotes old Production/GitHub/stack implementation into current Foundation authority.'})
cs('authority/CURRENT_AUTHORITY_REGISTRY.csv',registry);js('authority/CURRENT_AUTHORITY_REGISTRY.json',registry)
conflicts=[{**r,'resolution':'ENFORCE_CURRENT_OWNER','evidence':'01_AUTHORITY/OWNER_CURRENT_SUPERSESSION_ADDENDUM_v1.0.csv#'+r['decision_id'],'implementation_status':'See mechanic/requirement ledger; resolution is not proof of implementation'}for r in owner]
for r in canonical:conflicts.append({**r,'resolution':'ADMIT_UNSUPERSEDED_CONCEPT_ONLY','evidence':'CEP_CANONICAL_DECISION_SUPERSESSION_REGISTRY_v1.0.csv#'+r['decision_id'],'mission_override':'All OWNER-20260910 rows take precedence; physical paths/server/auth claims are not target law'})
cs('authority/SUPERSESSION_AND_CONFLICT_LEDGER.csv',conflicts)
js('authority/OWNER_CURRENT_RULES.json',owner)
# Complete function symbol and source-span coverage. Bodies are preserved in reference; lexical coverage is not behavioral parity.
census=json.loads((P/'02_ACCEPTED_DONOR/CEP_ACCEPTED_LIBRARY_DONOR_CODE_CENSUS_v1.0.json').read_text());source=ROOT/'dist/reference'/census['filename'];assert source.stat().st_size==672893 and sha(source)==census['sha256']
raw=source.read_text();runtime=(ROOT/'dist/foundation/accepted-runtime.js').read_text();structured_runtime=(ROOT/'dist/foundation/structured.js').read_text();categories={f['name']:[]for f in census['functions']}
for category,items in census['function_categories'].items():
 for f in items:categories[f['name']].append(category)
changed={'commandPaletteItems','renderCommandResults','executePaletteCommand','openOverflow','clampPaneWidths','syncPaneCSS','renderBottom','createNote','handlePointerDown','handlePointerMove','handlePointerUp','bindEvents','init'}
domain={'activeFixture','libraryRecord','librarySearchScore','librarySearchResults','fixtureSearchText','switchKU','syncFixtureHeader','findTreePathByKu','relatedLearningProjection','relatedContextProjection','renderCenterProjections','overviewLens','sourceLens','relationLens','labLens','projectLens','evidenceLens','openWorkspace','labState'}
rows=[]
for f in census['functions']:
 name=f['name'];cat=categories[name];pattern=r'(?:function\s+'+re.escape(name)+r'\s*\(|(?:const|let|var)\s+'+re.escape(name)+r'\s*=|\b'+re.escape(name)+r'\s*\([^)]*\)\s*\{)';match=re.search(pattern,runtime);target='dist/foundation/accepted-runtime.js';target_source=runtime
 if not match:
  match=re.search(pattern,structured_runtime);target='dist/foundation/structured.js';target_source=structured_runtime
 assert match,name
 disp='PRESERVE_AND_IMPROVE'if name in changed else'DOMAIN_ONLY'if name in domain else'FAMILY_ENGINE'if any(c in cat for c in['UNIFIED_EDITOR_BLOCK','CLIPBOARD','CODE','SELECTION','HISTORY_RECOVERY','NOTES_STICKY'])else'FOUNDATION_REUSE'
 rows.append({'function':name,'source_line':f['line'],'source_sha256':census['sha256'],'source_line_sha256':hashlib.sha256(raw.splitlines()[f['line']-1].encode()).hexdigest(),'categories':cat,'disposition':disp,'target':target,'target_line':target_source[:match.start()].count('\n')+1,'symbol_present':True,'change_reason':'Extracted/delegated to canonical Structured implementation' if target.endswith('structured.js') else ('Extension seam / shared preference or command delegation' if name in changed else 'Original implementation retained under one module mount'),'parity_evidence':'SOURCE_PRESERVATION_VERIFIED; behavior coverage by assurance receipts, not 330 blanket passes','remaining_work':'Modular separation by family without parity regression; full behavior regression OPEN'})
cs('archaeology/ACCEPTED_LIBRARY_330_FUNCTION_COVERAGE.csv',rows)
coverage=[]
for key in['components','css_variables','css_classes','html_ids','data_attributes','media_queries','event_types']:
 for i,v in enumerate(census[key]):
  disp='PRESERVE_AS_IS';reason='Original CSS/DOM/event grammar retained; component use is shared, not copied per surface'
  if v in['AppShell','W02Nav']:disp='DEFECT_DO_NOT_INHERIT';reason='Visual/navigation composition reopened by current Owner; original stays evidence'
  if v=='FixtureStateLab':disp='DOMAIN_ONLY';reason='Reference diagnostics retained in reference; not universal product behavior'
  coverage.append({'family':key,'index':i+1,'symbol':v,'disposition':disp,'reason':reason,'source':census['filename'],'source_sha256':census['sha256'],'target':'dist/foundation/donor.css + dist/index.html + dist/foundation/accepted-runtime.js','evidence':'Source extraction; visual parity limited to assurance/PARITY_AND_LIMITATIONS.md'})
for i,m in enumerate(re.finditer(r'addEventListener\s*\(',raw)):coverage.append({'family':'event_listener_call','index':i+1,'symbol':raw[m.start():m.start()+100].split('\n')[0],'source_line':raw[:m.start()].count('\n')+1,'disposition':'PRESERVE_AND_IMPROVE','reason':'Retained event owner; pointer hooks delegate note/ops geometry to WindowMotion','source_sha256':census['sha256']})
for name,scope in [('state.surface','workspace effective projection'),('state.preferences','ScopedPreferences bridge'),('state.editor','shared structured working documents'),('state.notes','one NoteWorkingState map'),('state.surface.contextScope/contextLens/contextPin','one inspector scope'),('state.transient.selection/blockSelection','structured selection and bookmarks'),('state.transient.drag','transient transaction'),('state.route','current object and reference origin'),('state.structure','navigation expansion/search'),('state.library','fixture metadata and recents'),('state.documents','working document stores'),('state.recovery','fixture recovery snapshots'),('state.counters','temporary identities'),('StorageAdapter','namespaced fixture storage')]:coverage.append({'family':'state_owner','symbol':name,'disposition':'PRESERVE_AND_IMPROVE','reason':scope,'source_sha256':census['sha256']})
cs('archaeology/ACCEPTED_LIBRARY_DOM_CSS_EVENT_COVERAGE.csv',coverage);js('archaeology/ACCEPTED_LIBRARY_FULL_MECHANIC_CENSUS.json',{**census,'function_dispositions':rows,'coverage':coverage,'not_claimed':'Full behavioral parity or Owner acceptance'});cs('archaeology/ACCEPTED_LIBRARY_FULL_MECHANIC_CENSUS.csv',[{'family':k,'count':len(v)if isinstance(v,(list,dict))else v}for k,v in census.items()if k not in['filename','sha256','authority_note']])
changes=[('DONOR-01','Shell/navigation','DEFECT_DO_NOT_INHERIT','Reopened by OWNER; compact proof nav is candidate only'),('DONOR-02','Fixed RTL/language/theme','PRESERVE_AND_IMPROVE','Scoped defaults; full donor string localization remains OPEN'),('DONOR-03','Pane geometry','PRESERVE_AND_IMPROVE','Preferred widths separated from effective widths'),('DONOR-04','Sticky/editor','FAMILY_ENGINE','Same donor note/editor state reused; anchored compact note presentation OPEN'),('DONOR-05','Palette exits','PRESERVE_AND_IMPROVE','Visible Close added to existing backdrop owner'),('DONOR-06','Settings','PRESERVE_AND_IMPROVE','One scoped registry; broader schema replaces donor settings entry'),('DONOR-07','Simulation save badges','DOMAIN_ONLY','Fixture local persistence only, no durable production claim'),('DONOR-08','Window pointer geometry','PRESERVE_AND_IMPROVE','WindowMotion shared by note and operational windows')]
cs('archaeology/DONOR_PRESERVE_IMPROVE_REJECT_REGISTER.csv',[dict(zip(['id','mechanic','disposition','reason'],r))for r in changes])
# Compile 40 conceptual owners and explicit named executable families.
cores=readcsv(P/'01_AUTHORITY/CEP_REUSABLE_FOUNDATION_CAPABILITY_MATRIX_v1.0.csv');surface_sources=[json.loads(p.read_text())for p in sorted((B/'O05/surfaces').glob('*.json'))];assert len(surface_sources)==23
components=[('WorkspaceFrame','SC-002','dist/foundation/workspace-host.js + dist/foundation/workspace.js','TOP/TOOLBAR/LEFT/CENTER/RIGHT/BOTTOM/TRANSIENT'),('SidePaneShell','SC-003','dist/foundation/workspace-host.js','LEFT/RIGHT'),('WorkspaceToolbar','SC-017','dist/foundation/workspace.js','TOOLBAR'),('CommandPalette','SC-016','dist/foundation/workspace-host.js + dist/foundation/accepted-runtime.js (Library compatibility only)','TRANSIENT'),('ContextActionMenu','SC-017','dist/foundation/workspace.js','TRANSIENT'),('SelectionActionSurface','SC-027','dist/foundation/spatial/relation-interaction.js + dist/foundation/models.js','TRANSIENT'),('InsertionPalette','SC-030','dist/foundation/accepted-runtime.js (Library compatibility only)','TRANSIENT'),('ContextInspector','SC-004','dist/foundation/workspace.js','RIGHT'),('LensHost','SC-004','dist/foundation/accepted-runtime.js (Library compatibility only)','RIGHT'),('BottomShelf','SC-005','dist/foundation/workspace-host.js + dist/foundation/accepted-runtime.js (Library compatibility only)','BOTTOM'),('SettingsCenter','SC-009','dist/foundation/workspace.js','TRANSIENT'),('ScopedPreferencesOwner','SC-008','dist/foundation/models.js','MODEL'),('FocusAndDismissal','SC-019','dist/foundation/workspace-host.js + dist/foundation/workspace.js','TRANSIENT'),('UnifiedEditor','SC-030','dist/foundation/structured.js + dist/foundation/workspace-host.js + dist/foundation/accepted-runtime.js (Library compatibility only)','CENTER/NOTES'),('StickyNotes','SC-038','dist/foundation/accepted-runtime.js (Library compatibility only)','TRANSIENT/RIGHT'),('SpatialInteraction','SC-031','dist/foundation/spatial/interaction-kernel.js + dist/foundation/spatial.js','CENTER'),('OperationalSurface','SC-036','dist/foundation/operational.js','CENTER/BOTTOM/TRANSIENT'),('WindowMotion','SC-006','dist/foundation/window-motion.js','TRANSIENT'),('SemanticCommandBus','SC-016','dist/foundation/models.js','MODEL'),('StatusFeedback','SC-022','dist/foundation/workspace.js','GLOBAL'),('AnalyticalCompare','SC-032',None,'CENTER/BOTTOM')]
comp=[{'component_id':n,'semantic_core':core,'implementation':path,'slots':slot.split('/'),'status':'EXECUTABLE_BOUNDED'if path else'OPEN_NOT_IMPLEMENTED','duplicate_policy':'Consume this owner; no surface-local equivalent'}for n,core,path,slot in components];cs('contracts/COMPONENT_REGISTRY.csv',comp);js('contracts/COMPONENT_REGISTRY.json',comp)
core_paths={c['semantic_core']:c['implementation'] for c in comp if c['implementation']}
for c in cores:c.update({'implementation':core_paths.get(c['foundation_id']),'implementation_status':'PARTIAL_EXECUTABLE_OWNER'if c['foundation_id']in core_paths else'CONCEPT_CONTRACT_ONLY','physical_historical_path_admitted':False})
js('contracts/CORE_OWNER_REGISTRY.json',cores)
base=set(range(1,24))|{25,26,38,40};structured={'library','learn','scenarios','labs'};spatial={'visualize','enterprise','scenarios','labs','runs','results'};analytical={'rq','evidence','reviews','mastery','portfolio','audit','results'};operational={'runs'}
def classification(core,s):
 n=int(core['foundation_id'][3:]);sid=s['surface_id'];name=core['core_or_engine']
 if n==39:return 'NOT_APPLICABLE','Production mapping is evidence only; no production target in bounded foundation'
 if n==1:return 'INHERIT_AND_BIND','Navigation owner shared; Shell composition explicitly reopened'
 if n in base:return 'MANDATORY_INHERIT','Universal presentation/action/state boundary applies; domain supplies content only'
 if name in s['shared_mechanics']:return 'INHERIT_AND_BIND','Explicit shared mechanic in admitted unsuperseded conceptual surface contract'
 if n in[27,28,29,30]:return ('INHERIT_AND_BIND','Editable domain working content uses one structured transaction owner')if sid in structured else('OPTIONAL','For personal annotations or working text only; no new canonical domain mutation')
 if n==31:return ('INHERIT_AND_BIND','Representation family fits domain topology/relationships; semantic adapters stay distinct')if sid in spatial else('NOT_APPLICABLE','Current surface objects/operations do not require spatial workspace; future addition needs contract delta')
 if n==32:return ('INHERIT_AND_BIND','Comparison/analysis projection; no domain decision inference')if sid in analytical else('OPTIONAL','Only if domain supplies typed compare/history projection')
 if n==33:return ('INHERIT_AND_BIND','Provenance/evidence identity bound by domain')if sid in analytical|{'validation','releases','backup'}else('OPTIONAL','Command receipts only; canonical Audit adapter not implied')
 if n==34:return 'INHERIT_AND_BIND','Collection/object browse binds row identity and domain actions'
 if n==35:return ('INHERIT_AND_BIND','Runtime event/replay timeline')if sid in{'runs','results','processing','audit'}else('OPTIONAL','Domain history if justified; never simulated truth')
 if n==36:return ('INHERIT_AND_BIND','Capability/provider-bound live session presentation')if sid in operational else('ADAPT','Inert recorded session renderer; execution commands unavailable')if sid=='results'else('NOT_APPLICABLE','No live runtime owned by this surface')
 if n==37:return ('INHERIT_AND_BIND','Formal decision owner is Reviews only')if sid=='reviews'else('OPTIONAL','Decision read projection only; no formal adjudication write')
 return 'OPTIONAL','Search/filter binds domain source; no fabricated data'
matrix=[];reqindex=[]
for s in surface_sources:
 sid=s['surface_id'];foundation={}
 for c in cores:
  cl,why=classification(c,s);row={'surface':sid,'workspace':s['workspace'],'mechanic':c['foundation_id'],'name':c['core_or_engine'],'classification':cl,'reason':why,'source':'BigBoss/O05/surfaces/'+sid+'.json + current Owner addendum','implementation':c['implementation_status']};matrix.append(row);foundation[c['foundation_id']]={'classification':cl,'reason':why,'owner':c['core_or_engine']}
 for c in comp:
  cl,why=classification(next(x for x in cores if x['foundation_id']==c['semantic_core']),s);foundation[c['component_id']]={'classification':cl,'reason':why,'owner':c['component_id']};matrix.append({'surface':sid,'workspace':s['workspace'],'mechanic':c['component_id'],'name':c['component_id'],'classification':cl,'reason':why,'source':c['semantic_core'],'implementation':c['status']})
 invariants=[x for x in s['invariants']if not(sid=='shell'and('Auth owner'in x or'No sixth'in x))]
 if sid=='shell':invariants+=['PERSONAL_LOCAL_SINGLE_OWNER; no server authorization requirement','Navigation composition REOPENED; destination count not silently frozen']
 profile={'schema_version':1,'surface':sid,'workspace':s['workspace'],'title':s['title'],'foundation':foundation,'family_engines':[n for n,group in [('UnifiedEditor',structured),('SpatialInteraction',spatial),('AnalyticalCompare',analytical),('OperationalSurface',operational)]if sid in group],'slots':{**s['regions'],'TOOLBAR':'Universal action group + domain command binding','TRANSIENT':'Shared focus/dismissal owner; no local duplicate'},'domain_commands':s['command_ids'],'context_lenses':['identity','domain-context','notes'],'bottom_tabs':['history','domain-diagnostics'],'objects':s['objects'],'invariants':invariants,'epistemic':s['epistemic'],'state_dimensions':s['state_dimensions'],'owner_decisions':['OWNER-20260910-001..020'],'deviations':[],'forbidden_duplicates':['pane geometry','palette','settings','focus','context menu','editor','spatial input','session presentation'],'source_status':'CONCEPTUAL_SEMANTICS_RECONCILED_NOT_ACCEPTED_VISUAL_DESIGN','proof_consumer':sid in['library','learn','visualize','runs'],'domain_implementation':'BOUNDED_FIXTURE'if sid in['library','learn','visualize','runs']else'CONTRACT_ONLY','excluded_historical_infrastructure':['HTTP method/server path','401/403 sign-in scaffolding','multi-actor role architecture','Production resources/js physical path']}
 js('profiles/'+sid+'.json',profile)
 original=ROOT/'authority/sources/bigboss/surfaces'/f'{sid}.json';original.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(B/'O05/surfaces'/f'{sid}.json',original)
 for i,inv in enumerate(invariants):reqindex.append({'id':sid+'.INV.'+str(i+1),'surface':sid,'kind':'DOMAIN_INVARIANT','requirement':inv,'source':'bigboss/O05/surfaces/'+sid+'.json','disposition':'ADMIT_UNSUPERSEDED_SEMANTIC','implementation':profile['domain_implementation']})
 for o in s['operations']:reqindex.append({'id':o['command_id'],'surface':sid,'kind':'DOMAIN_COMMAND','requirement':o['oracle'],'source':'bigboss/O05/surfaces/'+sid+'.json','disposition':'PRESERVE_SEMANTICS_REBIND_LOCAL_ADAPTER','implementation':'SEE_RUNTIME_COMMAND_REGISTRY; otherwise CONTRACT_ONLY','before':o['before'],'after':o['after'],'guard':o['guard'],'owner':o['semantic_owner']})
cs('contracts/23_SURFACE_INHERITANCE_MATRIX.csv',matrix);js('contracts/23_SURFACE_INHERITANCE_MATRIX.json',matrix);cs('authority/23_SURFACE_CURRENT_REQUIREMENT_INDEX.csv',reqindex);js('authority/23_SURFACE_CURRENT_REQUIREMENT_INDEX.json',reqindex)
# Preserve every capability atom; no atom omitted by a summary.
atoms=json.loads((B/'O03/capability_atoms.json').read_text());js('authority/BIG_BOSS_468_ATOM_SOURCE.json',atoms)
cs('authority/BIG_BOSS_468_ATOM_DISPOSITION.csv',[{'atom_id':a['atom_id'],'ontology_id':a['ontology_id'],'kind':a['kind'],'owner':a['semantic_owner'],'requirement':a.get('input_record',{}).get('capability_or_contract',a.get('transition',{}).get('oracle','See complete atom source')),'source_ref':a.get('input_record',{}).get('source_ref',a.get('provenance',{})),'disposition':'ADMITTED_CONCEPT_SUBJECT_TO_OWNER_SUPERSESSION','physical_authority':'NONE','implementation':'Explicit 23-profile and runtime binding; atom-level behavioral proof OPEN'}for a in atoms])
vp=B/'INPUT_EVIDENCE/07_POST_V1_1_OWNER_HARDENING/CEP_VISUALIZE_OWNER_DIRECT_REQUIREMENTS_LEDGER_v1.3.json';vis=json.loads(vp.read_text());js('authority/VISUALIZE_OWNER_REQUIREMENTS_SOURCE.json',vis)
visrows=[]
for v in vis['requirements']:
 n=int(v['requirement_id'].split('-')[-1]);status='PARTIAL_BOUNDED_PROOF'if n in[4,5,11,12,14,15,16,19,20,21,22]else'OPEN_OUTSIDE_CURRENT_SLICE';visrows.append({'requirement_id':v['requirement_id'],'requirement':v['requirement'],'acceptance':v['acceptance'],'status':status,'authority':'CURRENT_OWNER_REQUIREMENT_NOT_CANDIDATE_DESIGN_ACCEPTANCE','owner':'SpatialInteraction + WorkspaceFoundation + domain adapter','remaining':'Four specialized editable views, full note presentations, toolbar/remap customization need dedicated parity gate'})
cs('authority/VISUALIZE_REQUIREMENTS_DISPOSITION.csv',visrows)
seed=json.loads(next(CC.rglob('*SECTION_RECONCILIATION_SEED*.json')).read_text());proposal=next((BASE/'expanded').rglob('06_W03_WORLD_CLASS_WORKBENCH_PROPOSAL__HIGH_VALUE_NOT_AUTHORITY.txt'));assert sha(proposal)==seed['source_sha256'];shutil.copy2(proposal,ROOT/'authority/sources'/proposal.name)
pr=[]
for row in seed['sections']:
 n=row['section_number'];row={**row,'current_disposition':'OPEN_MISSING','foundation_value':'Source preserved exactly; proposal value not promoted to design authority','bounded_implementation':''}
 if n in[0,1,2,3,4,5,6]:row.update({'current_disposition':'PRESERVED_WITH_STRONGER_EQUIVALENT'if n in[1,3,4]else'OPEN_MISSING','bounded_implementation':'Shared workspace + separate authored/runtime/recorded stores + session presentation','foundation_value':'Domain runtime does not become Visualize; shared spatial mechanics preserve separate semantics. Full section closure requires remaining operational detail.'})
 pr.append(row)
cs('authority/W03_PROPOSAL_69_SECTION_DISPOSITION.csv',pr)
# Explicit slot constitution implemented by one DOM and module mount.
slots={'TOP':{'selector':'#topBanner','owner':'WorkspaceFrame','binding':'exact domain identity/status'},'TOOLBAR':{'selector':'.toolbar','owner':'WorkspaceToolbar','binding':'fixed universal group; domain group; palette retains all available commands'},'LEFT':{'selector':'#leftPane','owner':'SidePaneShell','binding':'domain object/view navigation'},'CENTER':{'selector':'#centerPane','owner':'WorkspaceFrame','binding':'family engine only'},'RIGHT':{'selector':'#rightPane','owner':'ContextInspector','binding':'selected object/lens; not parallel inspector'},'BOTTOM':{'selector':'#bottomShelf','owner':'BottomShelf','binding':'history/diagnostics; no canonical mutation'},'TRANSIENT':{'selector':'.backdrop,.popover,#notesLayer','owner':'FocusAndDismissal','binding':'shared menus/dialogs/notes/session windows'}}
js('contracts/UNIVERSAL_LAYOUT_SLOT_CONTRACT.json',{'version':1,'slots':slots,'same_mechanic_law':['same layout','same placement grammar','same interaction model','same customization','one semantic owner'],'responsive':'preferred state persists; effective constraints projected; persistent panes never blur-dismiss','exceptions_require':'writer/DEVIATION_REQUEST.json'})
cs('contracts/STATE_OWNERSHIP_REGISTRY.csv',[{'state':st,'owner':own,'persistence':pers,'forbidden_write':forbid}for st,own,pers,forbid in [('presentation preferences','ScopedPreferencesOwner','versioned localStorage/export','domain runtime configuration'),('preferred pane state','ScopedPreferencesOwner','versioned localStorage/export','responsive effective projection'),('effective pane geometry','WorkspacePaneLayoutOwner','derived only','preferred value overwrite'),('global transient/focus lifecycle','TransientFocusOwner','session only','domain family selection/history/session state'),('context inspector content','ContextDescriptorProvider','derived from family/domain canonical state','parallel inspector domain store'),('structured working document','StructuredDocumentDomainAdapter','adapter commit/recovery boundary','published canonical revision'),('Library compatibility editor state','LibraryDomainAdapter + accepted donor compatibility host','Library adapter boundary','shared Structured engine ownership'),('representation nodes/edges/camera','SpatialModel','session memory','canonical relationship mutation'),('provider runtime state','RuntimeAdapter implementation (InternalSimulationAdapter active here)','provider-defined','authored baseline or presentation-owned duplicate truth'),('session identity/output','RuntimeAdapter stable session boundary','provider-defined','renderer-owned duplicate sessions'),('session geometry/tabs','SessionPresentation + WindowMotion','session memory','provider lifecycle inferred from hide/close'),('recorded result','detached snapshot','session memory','live execution'),('learning attempt/progress','LearnAdapter','session fixture','Mastery write'),('canonical domain truth','typed Structured/Relation/Runtime adapters','adapter-defined','shared universal domain store')]])
policies=[('CommandPalette','Esc; visible Close; outside; selection','return invoker; trap tab','existing donor backdrop'),('ContextActionMenu','Esc; visible Close; outside; command','return invoker; arrow/home/end','WorkspaceFoundation menu'),('Dialog','Esc; visible Close; Cancel; safe outside only','trap Tab; return invoker','existing donor backdrop'),('SidePane','internal collapse; external reveal; command; settings','persistent; no blur dismissal','PaneController'),('Focus','same button; exit button; palette; Esc donor route','restore prior pane preference','FocusAndDismissal'),('StickyNote','close; donor keep/discard; reopen','same identity; close is not source deletion','state.notes'),('OperationalSurface','minimize; close presentation; open same capability','same provider session; hide is not disconnect','SessionPresentation'),('Pointer move/resize','pointerup commit; Esc rollback; pointercancel rollback','restore geometry on cancellation','WindowMotion')]
cs('contracts/DISMISSAL_AND_FOCUS_POLICIES.csv',[dict(zip(['component','routes','focus_policy','owner'],r))for r in policies])
js('contracts/BUILD_RECEIPT.json',{'surfaces':23,'conceptual_cores':40,'named_components':len(comp),'matrix_rows':len(matrix),'requirements':len(reqindex),'donor_functions':len(rows),'dom_css_event_rows':len(coverage),'capability_atoms':len(atoms),'proposal_sections':len(pr),'owner_accepted':False})
print(json.dumps({'surfaces':23,'matrix_rows':len(matrix),'functions':len(rows),'intake':len(intake),'requirements':len(reqindex)}))

# Preserve Controller-accepted current owner truth after legacy/base registry generation.
subprocess.run([sys.executable, str(ROOT / 'tools/reconcile-current-owner-registries.py')], check=True)
