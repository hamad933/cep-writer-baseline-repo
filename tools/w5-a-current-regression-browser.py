#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, posixpath, re, subprocess
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'; ASSURANCE=ROOT/'assurance'; ASSURANCE.mkdir(exist_ok=True)
RUNTIME=json.loads((ROOT/'contracts/FOUNDATION_RUNTIME_REGISTRY.json').read_text())
PAT1=re.compile(r"(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.{1,2}/[^'\"]+)['\"]")
PAT2=re.compile(r"import\(\s*['\"](\.{1,2}/[^'\"]+)['\"]\s*\)")
def specs(s): return list(dict.fromkeys(PAT1.findall(s)+PAT2.findall(s)))
def resolve(rel,spec): return posixpath.normpath(posixpath.join(posixpath.dirname(rel),spec))
def browser_module_graph(entry='main.js'):
    seen=set(); order=[]
    def walk(rel):
        if rel in seen:return
        seen.add(rel); source=(DIST/rel).read_text()
        for spec in specs(source):walk(resolve(rel,spec))
        order.append(rel)
    walk(entry)
    return [{'rel':rel,'source':(DIST/rel).read_text(),'deps':[{'spec':spec,'dep':resolve(rel,spec)} for spec in specs((DIST/rel).read_text())]} for rel in order]

def source_identity():
    code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; const x=await canonicalSourceIdentity(new URL('file://' + process.cwd().replaceAll('\\\\','/') + '/')); console.log(JSON.stringify({sha256:x.sha256,files:x.files}))"
    return json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True).strip())

def assert_(cond,msg):
    if not cond: raise AssertionError(msg)

def base_html():
    html=(DIST/'index.html').read_text()
    for href,name in [('foundation/donor.css','donor'),('foundation/extensions.css','extensions'),('foundation/global/tokens/scale.css','scale')]:
        p=DIST/href; css=p.read_text() if p.exists() else ''
        html=re.sub(rf'<link rel="stylesheet" href="{re.escape(href)}">',f'<style data-browser-inline="{name}">{css}</style>',html,flags=re.I)
    return re.sub(r'<script type="module" src="main\.js"></script>','',html,flags=re.I)

HTML=base_html(); MODULES=browser_module_graph('main.js')
flows=[]; screenshots=[]
def capture(page,filename,flow_id,prop):
    p=ASSURANCE/filename; page.screenshot(path=str(p),full_page=False); b=p.read_bytes(); row={'filename':filename,'flowId':flow_id,'property':prop,'viewport':page.viewport_size,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'scope':'EXACT_CURRENT_CANDIDATE_TARGETED_VISUAL_EVIDENCE'};screenshots.append(row);return row

def load(page,surface):
    page.set_content(HTML,wait_until='domcontentloaded')
    page.evaluate("s=>{try{delete globalThis.CEPFoundation}catch{};try{delete globalThis.CEPBlueprint}catch{};history.replaceState({},'',`about:blank?surface=${encodeURIComponent(s)}`)}",surface)
    entry=page.evaluate("""mods=>{const urls={};for(const m of mods){let src=m.source;for(const dep of m.deps)src=src.split(dep.spec).join(urls[dep.dep]);urls[m.rel]=URL.createObjectURL(new Blob([src],{type:'text/javascript'}));}return urls['main.js'];}""",MODULES)
    page.evaluate("url=>import(url)",entry)
    page.wait_for_function("s=>window.CEPFoundation?.consumer===s",arg=surface,timeout=12000)

def run(browser,id,owner,oracle,fn):
    ctx=browser.new_context(viewport={'width':1440,'height':980},reduced_motion='reduce'); errors=[]
    try:
        evidence=fn(ctx,errors); assert_(not errors,'page errors: '+' | '.join(errors)); flows.append({'id':id,'owner':owner,'oracle':oracle,'status':'PASS','evidence':evidence}); print('PASS',id,flush=True)
    except Exception as e:
        flows.append({'id':id,'owner':owner,'oracle':oracle,'status':'FAIL','error':str(e),'pageErrors':errors}); print('FAIL',id,str(e),flush=True)
    finally: ctx.close()

def page_for(ctx,surface,errors):
    page=ctx.new_page(); page.set_default_timeout(5000); page.on('pageerror',lambda e:errors.append(str(e))); load(page,surface); return page

def eligible_pair(page):
    ids=page.evaluate("""()=>{const nodes=CEPFoundation.relations.nodes;for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++)if(CEPFoundation.relations.connectionAvailability([nodes[i].id,nodes[j].id]).enabled)return[nodes[i].id,nodes[j].id];return null}""")
    assert_(ids and len(ids)==2,'no eligible relation pair'); page.locator(f'#objectList [data-object="{ids[0]}"]').click(); page.locator(f'#objectList [data-object="{ids[1]}"]').click(modifiers=['Control']); return ids

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    def f1(ctx,errors):
        page=page_for(ctx,'golden',errors); toggle=page.locator('button[data-foundation-command="foundation.left"]:visible').first; toggle.click(); collapsed=page.locator('#leftPane').get_attribute('data-state'); toggle.click(); restored=page.locator('#leftPane').get_attribute('data-state'); inv=page.locator('button[data-foundation-command="foundation.palette"]').first; inv.click(); assert_(not page.locator('#commandBackdrop').evaluate('n=>n.hidden'),'palette did not open'); page.keyboard.press('Escape'); assert_(page.locator('#commandBackdrop').evaluate('n=>n.hidden'),'Escape did not close'); assert_(inv.evaluate('n=>document.activeElement===n'),'focus not returned'); page.set_viewport_size({'width':900,'height':980}); resp=page.evaluate('()=>CEPFoundation.api.panes.snapshot()'); assert_(collapsed=='collapsed' and restored=='open' and resp['right']['preferred']=='open' and resp['right']['effective']=='collapsed','pane lifecycle mismatch'); capture(page,'browser-workspace-pane-context.png','workspace.transient-and-pane-lifecycle','preferred/effective pane state and shared workspace chrome'); return {'collapsed':collapsed,'restored':restored,'paletteExit':'Escape','focusReturned':True,'responsive':resp}
    run(browser,'workspace.transient-and-pane-lifecycle','WorkspaceHostKernel + WorkspacePaneLayoutOwner + TransientFocusOwner','pane truth changes, transient reverses, focus returns',f1)

    def f2(ctx,errors):
        page=page_for(ctx,'visualize',errors); ids=eligible_pair(page); sel=page.locator('.relation-selection'); assert_(not sel.evaluate('n=>n.hidden') and sel.locator('[data-connect]').is_enabled(),'Connect not available'); capture(page,'browser-selection-connect.png','spatial.selection-connect-canonical-edge','exactly-two central ActionAvailability presentation'); before=page.evaluate('()=>CEPFoundation.relations.records.length'); sel.locator('[data-connect]').click(); comp=page.locator('.relation-composer'); assert_(not comp.evaluate('n=>n.hidden'),'composer missing'); comp.locator('button[type="submit"]').click(); after=page.evaluate('()=>({records:CEPFoundation.relations.records.length,latest:CEPFoundation.relations.records.at(-1),projected:CEPFoundation.spatial.model.edges.at(-1),version:CEPFoundation.relations.version})'); assert_(after['records']==before+1 and after['projected']['canonicalId']==after['latest']['id'] and after['projected']['kind']=='domain-projection','canonical relation projection failed'); return {'selectedIds':ids,'before':before,'after':after['records'],'relationId':after['latest']['id'],'canonicalVersion':after['version']}
    run(browser,'spatial.selection-connect-canonical-edge','ActionAvailabilityCore + RelationInteractionOwner + RelationDomainAdapter','one canonical relation committed and projected',f2)

    def f3(ctx,errors):
        page=page_for(ctx,'visualize',errors); comp=page.locator('.relation-composer'); edge=page.locator('.spatial-canvas [data-edge]').first; line=edge.locator('line').first; label=edge.locator('[data-relation-label]'); line.dblclick(force=True); assert_(comp.evaluate('n=>n.hidden'),'whole edge opened'); label.dblclick(force=True); assert_(not comp.evaluate('n=>n.hidden'),'label did not open'); comp.locator('[data-relation-close]').first.click(); edge.focus(); page.keyboard.press('F2'); assert_(not comp.evaluate('n=>n.hidden'),'F2 did not open'); rec=page.evaluate("()=>CEPFoundation.registry.receipts.filter(x=>x.id==='relation.edit')"); assert_(len(rec)==2 and all(x['owner']=='RelationInteractionOwner' for x in rec),'relation route owner mismatch'); return {'wholeEdgeOpened':False,'convergedReceipts':len(rec),'owners':sorted(set(x['owner'] for x in rec))}
    run(browser,'relation.route-convergence-and-label-scope','RelationInteractionOwner','whole-edge inert; label and F2 converge',f3)

    def f4(ctx,errors):
        ev=[]
        for surf in ['visualize','enterprise']:
            page=page_for(ctx,surf,errors); ids=eligible_pair(page); e=page.evaluate("ids=>({consumer:CEPFoundation.consumer,selectedIds:ids,policyRevision:CEPFoundation.relationUI.policyRevision,availabilityOwner:CEPFoundation.relationUI.actionAvailability.constructor.name,availability:CEPFoundation.relationUI.connectAvailability(),actionOwner:CEPFoundation.registry.commands.get('spatial.connect').owner})",ids); ev.append(e); page.close()
        assert_(all(x['policyRevision']=='RELATION-CENTRAL-04' and x['availabilityOwner']=='ActionAvailabilityCore' and x['actionOwner']=='RelationInteractionOwner' and x['availability']['enabled'] for x in ev),'central reuse mismatch'); return ev
    run(browser,'central-change-reuse','ActionAvailabilityCore + RelationInteractionOwner','same policy/action owner across Visualize and Enterprise',f4)

    def f5(ctx,errors):
        page=page_for(ctx,'runs',errors); page.locator('button[data-foundation-command="OPEN_TERMINAL"]:visible').first.click(); inp=page.locator('#operationalHost form input[name="command"]').first; inp.fill('shutdown'); inp.press('Enter'); state=page.evaluate("()=>{const d=CEPFoundation.simulation.devices.find(x=>x.id==='DEV-WEB-01'),n=CEPFoundation.spatial.model.nodes.find(x=>x.id==='DEV-WEB-01'),e=CEPFoundation.simulation.events.at(-1),r=CEPFoundation.simulation.recorded().devices.find(x=>x.id==='DEV-WEB-01');return{up:d.up,nodeStatus:n.status,semanticCommand:e.semanticCommand,eventOutput:e.output,recordedUp:r.up,provider:CEPFoundation.operational.providerDescriptor.id}}"); text=page.locator('#operationalHost .terminal-output').inner_text(); assert_(state['up'] is False and state['nodeStatus']=='DOWN' and state['recordedUp'] is False and state['semanticCommand']=='device.shutdown' and 'DOWN' in state['eventOutput'] and 'DOWN' in text,'runtime causal mismatch'); capture(page,'browser-operational-shutdown.png','runtime-causal-consequence','provider-neutral terminal and canonical shutdown consequence'); return {**state,'terminalVisibleDown':True}
    run(browser,'runtime-causal-consequence','W03V34RunsAdapter via provider-neutral OperationalView','device/spatial/terminal/event/recorded agree',f5)

    def f6(ctx,errors):
        page=page_for(ctx,'visualize',errors); svg=page.locator('.spatial-canvas'); box=svg.bounding_box(); assert_(box,'no canvas bounds'); start={'x':box['x']+box['width']-130,'y':box['y']+box['height']-120}; page.keyboard.down('Control'); page.mouse.move(start['x'],start['y']); page.mouse.down(button='right'); page.mouse.move(start['x']-70,start['y']-30,steps=5); page.mouse.up(button='right'); page.keyboard.up('Control'); assert_(page.locator('#foundationMenu').evaluate('n=>n.hidden'),'Ctrl+RMB opened menu'); page.mouse.click(start['x']-10,start['y']-10,button='right'); assert_(not page.locator('#foundationMenu').evaluate('n=>n.hidden'),'normal RMB swallowed'); page.keyboard.press('Escape'); page.evaluate("()=>{CEPFoundation.spatial.model.selection.clear();CEPFoundation.spatial.render();document.querySelector('.spatial-canvas [data-node]')?.focus()}"); before=page.evaluate("()=>({focus:document.activeElement?.dataset?.node,selection:[...CEPFoundation.spatial.model.selection],camera:structuredClone(CEPFoundation.spatial.model.camera)})"); page.keyboard.press('ArrowRight'); after=page.evaluate("()=>({focus:document.activeElement?.dataset?.node,selection:[...CEPFoundation.spatial.model.selection]})"); assert_(after['focus'] and after['focus']!=before['focus'] and len(after['selection'])==0,'focus move failed'); page.keyboard.press('Space'); sel=page.evaluate("()=>[...CEPFoundation.spatial.model.selection][0]"); assert_(sel==after['focus'],'space select failed'); before_alt=page.evaluate("()=>({camera:structuredClone(CEPFoundation.spatial.model.camera),node:structuredClone(CEPFoundation.spatial.model.nodes.find(x=>x.id===[...CEPFoundation.spatial.model.selection][0]))})"); page.keyboard.press('Alt+ArrowRight'); after_alt=page.evaluate("()=>({camera:structuredClone(CEPFoundation.spatial.model.camera),node:structuredClone(CEPFoundation.spatial.model.nodes.find(x=>x.id===[...CEPFoundation.spatial.model.selection][0]))})"); assert_(after_alt['camera']['x']!=before_alt['camera']['x'] and after_alt['node']['x']==before_alt['node']['x'],'alt isolation'); page.keyboard.press('Control+ArrowRight'); after_ctrl=page.evaluate("()=>({camera:structuredClone(CEPFoundation.spatial.model.camera),node:structuredClone(CEPFoundation.spatial.model.nodes.find(x=>x.id===[...CEPFoundation.spatial.model.selection][0]))})"); assert_(after_ctrl['camera']['x']==after_alt['camera']['x'] and after_ctrl['node']['x']!=after_alt['node']['x'],'control isolation'); page.close()
        learn=page_for(ctx,'learn',errors); learn.evaluate("()=>{CEPFoundation.preferences.set('locale','en','global');CEPFoundation.workspace.applyPreferences()}"); assert_(learn.locator('html').get_attribute('lang')=='en' and learn.locator('html').get_attribute('dir')=='ltr','locale projection'); isolation=learn.evaluate("()=>({hostKind:CEPFoundation.api.hostKind,domainKind:CEPFoundation.structured.domainKind,libraryState:CEPFoundation.api.state.library,searchCount:document.querySelectorAll('.library-search').length,bdi:[...document.querySelectorAll('bdi[dir=\"ltr\"]')].some(n=>/KU|TCP\\/IP|policy|learn-document/.test(n.textContent)),isolation:CEPFoundation.structured.assertDomainIsolation().ok})"); assert_(isolation['hostKind']=='DONOR_FREE_WORKSPACE_HOST' and isolation['domainKind']=='learn' and isolation['libraryState'] is None and isolation['searchCount']==0 and isolation['isolation'] and isolation['bdi'],'learn isolation/bidi failed'); learn.close()
        lib=page_for(ctx,'library',errors); parity=lib.evaluate("()=>({consumer:CEPFoundation.consumer,activeDocument:CEPFoundation.api.state.route.activeKu,blockCount:CEPFoundation.api.state.editor.blocks.length,editorCore:document.querySelector('#editorDocument')?.dataset.editorCore,donorHost:CEPFoundation.api.hostKind===undefined})"); assert_(parity['activeDocument'] and parity['blockCount']>0 and parity['editorCore']=='UnifiedEditorCore' and parity['donorHost'],'library parity failed'); return {'contextSuppression':'own-event-only','keyboard':{'focusOnly':True,'spaceSelect':True,'altCameraOnly':True,'controlMoveOnly':True},'preference':{'lang':'en','dir':'ltr'},'structured':isolation,'libraryParity':parity}
    run(browser,'spatial-input-bidi-preference-and-structured-isolation','SpatialInteractionKernel + GlobalInputKeymapOwner + ScopedPreferencesOwner + StructuredDocumentDomainAdapter','input semantics distinct; Learn isolated and Bidi-correct',f6)
    browser.close()

identity=source_identity(); summary={'total':len(flows),'pass':sum(x['status']=='PASS' for x in flows),'fail':sum(x['status']=='FAIL' for x in flows)}
report={'schemaVersion':1,'classification':'REPRODUCIBLE_BROWSER_CONFORMANCE_RECEIPT_NOT_OWNER_ACCEPTANCE','command':'python tools/w5-a-current-regression-browser.py','sourceFoundationBaseline':RUNTIME['baselineId'],'sourceCandidate':f"CANONICAL_SOURCE_TREE_SHA256:{identity['sha256']}",'sourceCanonicalTreeSha256':identity['sha256'],'canonicalSourceFileCount':identity['files'],'currentUse':'EXACT_CURRENT_CANONICAL_SOURCE_EXECUTION_RECEIPT','executionStatus':'EXECUTED_PASS' if summary['fail']==0 and summary['total']==6 else 'BLOCKED_OR_FAILED','prerequisite':'SATISFIED: Python Playwright launched /usr/bin/chromium and executed the exact current built ESM graph in-memory because localhost is administratively blocked.','declaredFlows':[x['id'] for x in flows],'environment':{'engine':'Python Playwright Chromium','executable':'/usr/bin/chromium','transport':'in-memory-built-esm','viewport':'1440x980','reducedMotion':True},'summary':summary,'flows':flows,'screenshots':screenshots,'limitations':['Headless Chromium only','Six bounded legacy critical flows; not exhaustive permutation certification','In-memory transport uses the exact built ESM graph because localhost navigation is blocked by administrator']}
(ASSURANCE/'BROWSER_CONFORMANCE_RECEIPT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
(ASSURANCE/'SCREENSHOT_MANIFEST.json').write_text(json.dumps({'schemaVersion':2,'policy':'TARGETED_VISUAL_EVIDENCE_MAX_4','count':len(screenshots),'screenshots':screenshots},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'summary':summary,'source':identity,'screenshots':len(screenshots),'failures':[x for x in flows if x['status']=='FAIL']},ensure_ascii=False,indent=2))
raise SystemExit(1 if summary['fail'] or summary['total']!=6 or len(screenshots)!=3 else 0)
