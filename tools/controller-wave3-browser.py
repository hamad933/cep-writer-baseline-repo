from pathlib import Path
import re, base64, posixpath, json, hashlib, os, subprocess
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
ASSURANCE=ROOT/'assurance'
ASSURANCE.mkdir(exist_ok=True)
MEMO={}
PAT1=re.compile(r"(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.{1,2}/[^'\"]+)['\"]")
PAT2=re.compile(r"import\(\s*['\"](\.{1,2}/[^'\"]+)['\"]\s*\)")

def specs(src): return list(dict.fromkeys(PAT1.findall(src)+PAT2.findall(src)))
def resolve(rel,spec): return posixpath.normpath(posixpath.join(posixpath.dirname(rel),spec))
def module_url(rel):
    rel=posixpath.normpath(rel)
    if rel in MEMO:return MEMO[rel]
    src=(DIST/rel).read_text()
    for spec in specs(src): src=src.replace(spec,module_url(resolve(rel,spec)))
    url='data:text/javascript;base64,'+base64.b64encode(src.encode()).decode(); MEMO[rel]=url; return url

def source_with_urls(rel):
    src=(DIST/rel).read_text()
    for spec in specs(src): src=src.replace(spec,module_url(resolve(rel,spec)))
    return src

def html_in_memory():
    html=(DIST/'index.html').read_text()
    for href,name in [('foundation/donor.css','donor'),('foundation/extensions.css','extensions'),('foundation/global/tokens/scale.css','scale')]:
        css=(DIST/href).read_text() if (DIST/href).exists() else ''
        html=re.sub(rf'<link rel="stylesheet" href="{re.escape(href)}">',f'<style data-browser-inline="{name}">{css}</style>',html,flags=re.I)
    html=re.sub(r'<script type="module" src="main\.js"></script>','',html,flags=re.I)
    return html

HTML=html_in_memory(); MAIN=source_with_urls('main.js')

def source_identity():
    code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; const x=await canonicalSourceIdentity(new URL('file://' + process.cwd().replaceAll('\\\\','/') + '/')); console.log(JSON.stringify({sha256:x.sha256,files:x.files}))"
    out=subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True)
    return json.loads(out.strip())

def assert_(cond,msg):
    if not cond: raise AssertionError(msg)

def load(page,surface):
    page.set_content(HTML,wait_until='domcontentloaded')
    page.evaluate("s=>{try{delete globalThis.CEPFoundation}catch{};history.replaceState({},'',`about:blank?surface=${encodeURIComponent(s)}`)}",surface)
    page.add_script_tag(type='module',content=MAIN+f"\n// controller-wave3:{surface}")
    page.wait_for_function("s=>window.CEPFoundation?.consumer===s", arg=surface, timeout=5000)

def capture(page,filename,flow_id,prop,shots):
    path=ASSURANCE/filename; page.screenshot(path=str(path),full_page=False); b=path.read_bytes(); shots.append({'filename':filename,'flowId':flow_id,'property':prop,'viewport':page.viewport_size,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'scope':'EXACT_CURRENT_CANDIDATE_TARGETED_VISUAL_EVIDENCE'})

def select_pair(page):
    ids=page.evaluate("""()=>{const nodes=CEPFoundation.relations.nodes;for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++)if(CEPFoundation.relations.connectionAvailability([nodes[i].id,nodes[j].id]).enabled)return[nodes[i].id,nodes[j].id];return null}""")
    assert_(ids and len(ids)==2,'no eligible relation endpoint pair')
    page.locator(f'#objectList [data-object="{ids[0]}"]').click()
    page.locator(f'#objectList [data-object="{ids[1]}"]').click(modifiers=['Control'])
    return ids

flows=[]; w3=[]; shots=[]
def run_flow(browser,definition,fn,target=flows):
    ctx=browser.new_context(viewport={'width':1440,'height':980},reduced_motion='reduce'); page=ctx.new_page(); page.set_default_timeout(3000); errs=[]; page.on('pageerror',lambda e:errs.append(str(e))); print('START', definition['id'], flush=True)
    try:
        ev=fn(page); assert_(not errs,'page errors: '+' | '.join(errs)); target.append({**definition,'status':'PASS','evidence':ev}); print('PASS', definition['id'], flush=True)
    except Exception as e:
        target.append({**definition,'status':'FAIL','error':str(e),'pageErrors':errs}); print('FAIL', definition['id'], str(e), flush=True)
    finally: ctx.close()

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    run_flow(browser,{'id':'workspace.transient-and-pane-lifecycle','owner':'WorkspaceHostKernel + WorkspacePaneLayoutOwner + TransientFocusOwner','oracle':'pane truth changes, transient reverses, focus returns'},lambda page:(
        load(page,'golden'),
        (lambda toggle:[toggle.click(), page.locator('#leftPane').get_attribute('data-state'), toggle.click(), page.locator('#leftPane').get_attribute('data-state')])(page.locator('button[data-foundation-command="foundation.left"]:visible').first)
    ),flows)
    # replace first flow with detailed rerun for truthful evidence
    flows.pop()
    def f1(page):
        load(page,'golden'); toggle=page.locator('button[data-foundation-command="foundation.left"]:visible').first; toggle.click(); collapsed=page.locator('#leftPane').get_attribute('data-state'); toggle.click(); restored=page.locator('#leftPane').get_attribute('data-state'); inv=page.locator('button[data-foundation-command="foundation.palette"]').first; inv.click(); assert_(not page.locator('#commandBackdrop').evaluate('n=>n.hidden'),'palette did not open'); page.keyboard.press('Escape'); assert_(page.locator('#commandBackdrop').evaluate('n=>n.hidden'),'Escape did not close palette'); assert_(inv.evaluate('n=>document.activeElement===n'),'focus did not return'); assert_(collapsed=='collapsed' and restored=='open',f'pane mismatch {collapsed}/{restored}'); page.set_viewport_size({'width':900,'height':980}); resp=page.evaluate('()=>CEPFoundation.api.panes.snapshot()'); assert_(resp['right']['preferred']=='open' and resp['right']['effective']=='collapsed',f'responsive mismatch {resp}'); capture(page,'browser-workspace-pane-context.png','workspace.transient-and-pane-lifecycle','preferred/effective pane state and shared workspace chrome',shots); return {'collapsed':collapsed,'restored':restored,'paletteExit':'Escape','focusReturned':True,'responsive':resp}
    run_flow(browser,{'id':'workspace.transient-and-pane-lifecycle','owner':'WorkspaceHostKernel + WorkspacePaneLayoutOwner + TransientFocusOwner','oracle':'pane truth changes, transient reverses, focus returns'},f1)
    def f2(page):
        load(page,'visualize'); ids=select_pair(page); sel=page.locator('.relation-selection'); assert_(not sel.evaluate('n=>n.hidden'),'selection actions hidden'); assert_(sel.locator('[data-connect]').is_enabled(),'connect not enabled'); capture(page,'browser-selection-connect.png','spatial.selection-connect-canonical-edge','exactly-two central ActionAvailability presentation',shots); before=page.evaluate('()=>CEPFoundation.relations.records.length'); sel.locator('[data-connect]').click(); comp=page.locator('.relation-composer'); assert_(not comp.evaluate('n=>n.hidden'),'composer not open'); comp.locator('button[type="submit"]').click(); after=page.evaluate('()=>({records:CEPFoundation.relations.records.length,latest:CEPFoundation.relations.records.at(-1),projected:CEPFoundation.spatial.model.edges.at(-1),version:CEPFoundation.relations.version})'); assert_(after['records']==before+1,'relation count'); assert_(after['projected']['canonicalId']==after['latest']['id'] and after['projected']['kind']=='domain-projection','projection mismatch'); return {'selectedIds':ids,'before':before,'after':after['records'],'relationId':after['latest']['id'],'canonicalVersion':after['version']}
    run_flow(browser,{'id':'spatial.selection-connect-canonical-edge','owner':'ActionAvailabilityCore + RelationInteractionOwner + RelationDomainAdapter','oracle':'one canonical relation committed and projected'},f2)
    def f3(page):
        load(page,'visualize'); comp=page.locator('.relation-composer'); edge=page.locator('.spatial-canvas [data-edge]').first; line=edge.locator('line').first; label=edge.locator('[data-relation-label]'); line.dblclick(force=True); assert_(comp.evaluate('n=>n.hidden'),'whole edge opened'); label.dblclick(force=True); assert_(not comp.evaluate('n=>n.hidden'),'label did not open'); comp.locator('[data-relation-close]').first.click(); edge.focus(); page.keyboard.press('F2'); assert_(not comp.evaluate('n=>n.hidden'),'F2 did not open'); rec=page.evaluate("()=>CEPFoundation.registry.receipts.filter(x=>x.id==='relation.edit')"); assert_(len(rec)==2 and all(x['owner']=='RelationInteractionOwner' for x in rec),f'owner mismatch {rec}'); return {'wholeEdgeOpened':False,'convergedReceipts':len(rec),'owners':sorted(set(x['owner'] for x in rec))}
    run_flow(browser,{'id':'relation.route-convergence-and-label-scope','owner':'RelationInteractionOwner','oracle':'whole-edge inert; label and F2 converge'},f3)
    def f4(page):
        evidence=[]
        for surf in ['visualize','enterprise']:
            load(page,surf); ids=select_pair(page); e=page.evaluate("ids=>({consumer:CEPFoundation.consumer,selectedIds:ids,policyRevision:CEPFoundation.relationUI.policyRevision,availabilityOwner:CEPFoundation.relationUI.actionAvailability.constructor.name,availability:CEPFoundation.relationUI.connectAvailability(),actionOwner:CEPFoundation.registry.commands.get('spatial.connect').owner})",ids); evidence.append(e)
        assert_(all(x['policyRevision']=='RELATION-CENTRAL-04' and x['availabilityOwner']=='ActionAvailabilityCore' and x['actionOwner']=='RelationInteractionOwner' and x['availability']['enabled'] for x in evidence),f'central reuse {evidence}'); return evidence
    run_flow(browser,{'id':'central-change-reuse','owner':'ActionAvailabilityCore + RelationInteractionOwner','oracle':'same policy/action owner across Visualize and Enterprise'},f4)
    def f5(page):
        load(page,'runs'); page.locator('button[data-foundation-command="OPEN_TERMINAL"]:visible').first.click(); inp=page.locator('#operationalHost form input[name="command"]').first; inp.fill('shutdown'); inp.press('Enter'); state=page.evaluate("()=>{const d=CEPFoundation.simulation.devices.find(x=>x.id==='DEV-WEB-01'),n=CEPFoundation.spatial.model.nodes.find(x=>x.id==='DEV-WEB-01'),e=CEPFoundation.simulation.events.at(-1),r=CEPFoundation.simulation.recorded().devices.find(x=>x.id==='DEV-WEB-01');return{up:d.up,nodeStatus:n.status,semanticCommand:e.semanticCommand,eventOutput:e.output,recordedUp:r.up,provider:CEPFoundation.operational.providerDescriptor.id}}") ; text=page.locator('#operationalHost .terminal-output').inner_text(); assert_(state['up'] is False and state['nodeStatus']=='DOWN' and state['recordedUp'] is False,f'causal {state}'); assert_(state['semanticCommand']=='device.shutdown' and 'DOWN' in state['eventOutput'] and 'DOWN' in text,'terminal mismatch'); capture(page,'browser-operational-shutdown.png','runtime-causal-consequence','provider-neutral terminal and canonical shutdown consequence',shots); return {**state,'terminalVisibleDown':True}
    run_flow(browser,{'id':'runtime-causal-consequence','owner':'W03V34RunsAdapter via provider-neutral OperationalView','oracle':'device/spatial/terminal/event/recorded agree'},f5)
    def f6(page):
        load(page,'visualize'); svg=page.locator('.spatial-canvas'); box=svg.bounding_box(); assert_(box,'no canvas box'); start={'x':box['x']+box['width']-130,'y':box['y']+box['height']-120}; page.keyboard.down('Control'); page.mouse.move(start['x'],start['y']); page.mouse.down(button='right'); page.mouse.move(start['x']-70,start['y']-30,steps=5); page.mouse.up(button='right'); page.keyboard.up('Control'); assert_(page.locator('#foundationMenu').evaluate('n=>n.hidden'),'Ctrl+RMB opened menu'); page.mouse.click(start['x']-10,start['y']-10,button='right'); assert_(not page.locator('#foundationMenu').evaluate('n=>n.hidden'),'normal RMB swallowed'); page.keyboard.press('Escape'); page.evaluate("()=>{CEPFoundation.spatial.model.selection.clear();CEPFoundation.spatial.render();document.querySelector('.spatial-canvas [data-node]')?.focus()}"); before=page.evaluate("()=>({focus:document.activeElement?.dataset?.node,selection:[...CEPFoundation.spatial.model.selection],camera:structuredClone(CEPFoundation.spatial.model.camera)})"); page.keyboard.press('ArrowRight'); after=page.evaluate("()=>({focus:document.activeElement?.dataset?.node,selection:[...CEPFoundation.spatial.model.selection]})"); assert_(after['focus'] and after['focus']!=before['focus'] and len(after['selection'])==0,'focus move failed'); page.keyboard.press('Space'); sel=page.evaluate("()=>[...CEPFoundation.spatial.model.selection][0]"); assert_(sel==after['focus'],'space select failed'); before_alt=page.evaluate("()=>({camera:structuredClone(CEPFoundation.spatial.model.camera),node:structuredClone(CEPFoundation.spatial.model.nodes.find(x=>x.id===[...CEPFoundation.spatial.model.selection][0]))})"); page.keyboard.press('Alt+ArrowRight'); after_alt=page.evaluate("()=>({camera:structuredClone(CEPFoundation.spatial.model.camera),node:structuredClone(CEPFoundation.spatial.model.nodes.find(x=>x.id===[...CEPFoundation.spatial.model.selection][0]))})"); assert_(after_alt['camera']['x']!=before_alt['camera']['x'] and after_alt['node']['x']==before_alt['node']['x'],'alt isolation'); page.keyboard.press('Control+ArrowRight'); after_ctrl=page.evaluate("()=>({camera:structuredClone(CEPFoundation.spatial.model.camera),node:structuredClone(CEPFoundation.spatial.model.nodes.find(x=>x.id===[...CEPFoundation.spatial.model.selection][0]))})"); assert_(after_ctrl['camera']['x']==after_alt['camera']['x'] and after_ctrl['node']['x']!=after_alt['node']['x'],'ctrl isolation'); load(page,'learn'); page.evaluate("()=>{CEPFoundation.preferences.set('locale','en','global');CEPFoundation.workspace.applyPreferences()}"); assert_(page.locator('html').get_attribute('lang')=='en' and page.locator('html').get_attribute('dir')=='ltr','locale'); isolation=page.evaluate("()=>({hostKind:CEPFoundation.api.hostKind,domainKind:CEPFoundation.structured.domainKind,libraryState:CEPFoundation.api.state.library,searchCount:document.querySelectorAll('.library-search').length,bdi:[...document.querySelectorAll('bdi[dir=\"ltr\"]')].some(n=>/KU|TCP\/IP|policy|learn-document/.test(n.textContent)),isolation:CEPFoundation.structured.assertDomainIsolation().ok})"); assert_(isolation['hostKind']=='DONOR_FREE_WORKSPACE_HOST' and isolation['domainKind']=='learn' and isolation['libraryState'] is None and isolation['searchCount']==0 and isolation['isolation'],'learn isolation'); assert_(isolation['bdi'],'bidi'); load(page,'library'); lib=page.evaluate("()=>({consumer:CEPFoundation.consumer,activeDocument:CEPFoundation.api.state.route.activeKu,blockCount:CEPFoundation.api.state.editor.blocks.length,editorCore:document.querySelector('#editorDocument')?.dataset.editorCore,donorHost:CEPFoundation.api.hostKind===undefined})"); assert_(lib['activeDocument'] and lib['blockCount']>0 and lib['editorCore']=='UnifiedEditorCore' and lib['donorHost'],f'library parity {lib}'); return {'contextSuppression':'own-event-only','keyboard':{'focusOnly':True,'spaceSelect':True,'altCameraOnly':True,'controlMoveOnly':True},'preference':{'lang':'en','dir':'ltr'},'structured':isolation,'libraryParity':lib}
    run_flow(browser,{'id':'spatial-input-bidi-preference-and-structured-isolation','owner':'SpatialInteractionKernel + GlobalInputKeymapOwner + ScopedPreferencesOwner + StructuredDocumentDomainAdapter','oracle':'input semantics distinct; Learn isolated and Bidi-correct'},f6)

    # Wave 3 integration flows
    def w1(page):
        load(page,'golden'); page.locator('#centerPane button:visible').first.focus(); before=page.evaluate("()=>({id:document.activeElement?.id,insideCenter:document.querySelector('#centerPane')?.contains(document.activeElement)})"); page.keyboard.press('F6'); snap=page.evaluate("()=>({active:document.activeElement?.closest?.('#rightPane,#leftPane,#centerPane,#bottomShelf')?.id||document.activeElement?.id,receipt:CEPFoundation.wave3Assembly.inputOwner.regionCycle.lastReceipt,owner:CEPFoundation.wave3Assembly.inputOwner.owner})"); assert_(snap['receipt'] and snap['receipt']['from']=='CENTER' and snap['receipt']['to'] in ['RIGHT','BOTTOM','TOP','TOOLBAR','LEFT'],'F6 receipt false'); return {'before':before,**snap}
    run_flow(browser,{'id':'wave3.input-f6-receipt','owner':'GlobalInputKeymapOwner','oracle':'F6 moves by declared regions and receipt tells source/destination truth'},w1,w3)
    def w2(page):
        load(page,'golden'); result=page.evaluate("()=>{const p=CEPFoundation.workspace.status('Controller feedback pass','success');const s=CEPFoundation.feedbackOwner.snapshot();const legacy=document.querySelector('#foundationStatus');return{accepted:p.accepted,owner:p.owner,eventOwner:p.event?.owner,active:s.activeCount,legacyLive:legacy?.getAttribute('aria-live'),projector:!!document.querySelector('[data-cep-accessibility-feedback-owner=\"AccessibilityFeedbackOwner\"]')}}"); assert_(result['accepted'] and result['owner']=='AccessibilityFeedbackOwner' and result['projector'] and result['legacyLive'] is None,f'feedback {result}'); return result
    run_flow(browser,{'id':'wave3.feedback-single-owner','owner':'AccessibilityFeedbackOwner','oracle':'generic status is projected by one accessibility owner without duplicate legacy live region'},w2,w3)
    def w3f(page):
        load(page,'library'); lib=page.evaluate("()=>({provider:CEPFoundation.wave3Assembly.contextInspector.snapshot().activeProviderId,open:CEPFoundation.wave3Assembly.contextInspector.snapshot().open,rendered:document.querySelector('#wave3ContextInspectorHost [data-context-inspector-owner=\"ContextInspectorHost\"]')!==null})"); assert_(lib['provider']=='library-structured-context' and lib['open'] and lib['rendered'],f'library context {lib}'); load(page,'visualize'); page.locator('#objectList [data-object]').first.click(); page.evaluate('()=>CEPFoundation.wave3Assembly.refreshContext()'); sp=page.evaluate("()=>({provider:CEPFoundation.wave3Assembly.contextInspector.snapshot().activeProviderId,open:CEPFoundation.wave3Assembly.contextInspector.snapshot().open,rendered:document.querySelector('#wave3ContextInspectorHost [data-context-provider=\"spatial-context\"]')!==null})"); assert_(sp['provider']=='spatial-context' and sp['open'] and sp['rendered'],f'spatial context {sp}'); return {'library':lib,'spatial':sp}
    run_flow(browser,{'id':'wave3.context-two-provider-host','owner':'ContextInspectorHost','oracle':'Library and Spatial descriptors use the same presentation host'},w3f,w3)
    def w4(page):
        load(page,'library'); before=page.evaluate("()=>CEPFoundation.wave3Assembly.bottomOwner.snapshot()"); page.locator('#bottomToggle').click(); after=page.evaluate("()=>({snap:CEPFoundation.wave3Assembly.bottomOwner.snapshot(),hidden:document.querySelector('#bottomContent').hidden,inert:document.querySelector('#bottomContent').inert,source:CEPFoundation.wave3Assembly.bottomOwner.readActiveProvider().sourceOwner})"); assert_(not before['open'] and after['snap']['open'] and not after['hidden'] and not after['inert'] and after['source']=='StructuredTransactionHistoryRecoveryOwner',f'bottom structured {after}'); load(page,'runs'); page.locator('#bottomToggle').click(); run=page.evaluate("()=>({snap:CEPFoundation.wave3Assembly.bottomOwner.snapshot(),source:CEPFoundation.wave3Assembly.bottomOwner.readActiveProvider().sourceOwner})"); assert_(run['snap']['open'] and run['snap']['activeProvider']['family']=='operational',f'bottom operational {run}'); return {'structured':after,'operational':run}
    run_flow(browser,{'id':'wave3.bottom-provider-convergence','owner':'BottomDeepWorkOwner','oracle':'Structured and Operational providers project through one bottom lifecycle owner'},w4,w3)
    def w5(page):
        load(page,'visualize'); before=page.evaluate("()=>({camera:structuredClone(CEPFoundation.spatial.model.camera),pane:CEPFoundation.api.panes.snapshot(),docZoom:document.querySelector('#editorDocument')?.style.zoom||''})"); result=page.evaluate("()=>{CEPFoundation.preferences.set('scale',2,'global');CEPFoundation.workspace.applyPreferences();const app=document.querySelector('.app');return{scale:CEPFoundation.wave3Assembly.uiScale.projection().scale,data:app.dataset.cepUiScale,foundationScale:getComputedStyle(document.documentElement).getPropertyValue('--foundation-scale').trim(),control:getComputedStyle(app).getPropertyValue('--cep-ui-control-height').trim(),camera:structuredClone(CEPFoundation.spatial.model.camera),pane:CEPFoundation.api.panes.snapshot(),zoom:document.querySelector('#editorDocument')?.style.zoom||''}}") ; assert_(result['scale']==2 and result['data']=='2' and result['foundationScale']=='2' and result['control']=='64px','scale projection'); assert_(result['camera']==before['camera'] and result['pane']['responsiveBand']==before['pane']['responsiveBand'] and result['zoom']==before['docZoom'],'scale leaked semantics'); return result
    run_flow(browser,{'id':'wave3.ui-scale-central-projection','owner':'UIScalePolicyOwner','oracle':'application chrome scale projects centrally without document/camera/responsive ownership changes'},w5,w3)
    browser.close()

identity=source_identity(); runtime=json.loads((ROOT/'contracts/FOUNDATION_RUNTIME_REGISTRY.json').read_text())
summary={'total':len(flows),'pass':sum(x['status']=='PASS' for x in flows),'fail':sum(x['status']=='FAIL' for x in flows)}
w3summary={'total':len(w3),'pass':sum(x['status']=='PASS' for x in w3),'fail':sum(x['status']=='FAIL' for x in w3)}
report={'schemaVersion':1,'classification':'REPRODUCIBLE_BROWSER_CONFORMANCE_RECEIPT_NOT_OWNER_ACCEPTANCE','command':'python tools/controller-wave3-browser.py','sourceFoundationBaseline':runtime['baselineId'],'sourceCandidate':f"CANONICAL_SOURCE_TREE_SHA256:{identity['sha256']}",'sourceCanonicalTreeSha256':identity['sha256'],'canonicalSourceFileCount':identity['files'],'currentUse':'EXACT_CURRENT_CANONICAL_SOURCE_EXECUTION_RECEIPT','executionStatus':'EXECUTED_PASS' if summary['fail']==0 and summary['total']==6 else 'BLOCKED_OR_FAILED','prerequisite':'SATISFIED: Python Playwright launched /usr/bin/chromium and executed in-memory built ESM graph because localhost navigation is administratively blocked.','declaredFlows':[x['id'] for x in flows],'environment':{'engine':'Python Playwright Chromium','executable':'/usr/bin/chromium','transport':'in-memory-built-esm','viewport':'1440x980','reducedMotion':True},'summary':summary,'flows':flows,'screenshots':shots,'limitations':['Headless Chromium only','Six bounded legacy critical flows; not exhaustive permutation certification','In-memory transport uses the exact built ESM graph because localhost is blocked by administrator']}
(ASSURANCE/'BROWSER_CONFORMANCE_RECEIPT.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
(ASSURANCE/'SCREENSHOT_MANIFEST.json').write_text(json.dumps({'schemaVersion':2,'policy':'TARGETED_VISUAL_EVIDENCE_MAX_4','count':len(shots),'screenshots':shots},indent=2,ensure_ascii=False)+'\n')
w3report={'schemaVersion':1,'kind':'W3_CONTROLLER_ASSEMBLY_BROWSER_PROOF','sourceCanonicalTreeSha256':identity['sha256'],'summary':w3summary,'flows':w3,'status':'PASS' if w3summary['fail']==0 and w3summary['total']==5 else 'FAIL'}
(ASSURANCE/'W3_CONTROLLER_ASSEMBLY_BROWSER_PROOF.json').write_text(json.dumps(w3report,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'legacy':summary,'wave3':w3summary,'source':identity,'legacyFailures':[x for x in flows if x['status']=='FAIL'],'wave3Failures':[x for x in w3 if x['status']=='FAIL']},indent=2,ensure_ascii=False))
raise SystemExit(1 if summary['fail'] or w3summary['fail'] else 0)
