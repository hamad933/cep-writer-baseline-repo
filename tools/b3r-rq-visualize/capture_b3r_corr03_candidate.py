#!/usr/bin/env python3
import argparse, base64, hashlib, json, pathlib, re, subprocess
from playwright.sync_api import sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[2]
DIST=(ROOT/'dist').resolve(); OUT=ROOT/'.b3r-corr03-candidate-output'; SHOTS=OUT/'screenshots'
PARENT='f21212b18f3b54a07b43516b50149219c0b15533'
VIEWS=('TREE','PATH','GRAPH','CANVAS')
parser=argparse.ArgumentParser()
parser.add_argument('--expected-head');parser.add_argument('--expected-tree');parser.add_argument('--expected-product-sha');parser.add_argument('--expected-product-files',type=int,default=273)
args=parser.parse_args()
OUT.mkdir(exist_ok=True);SHOTS.mkdir(parents=True,exist_ok=True)
for p in SHOTS.glob('*.png'):p.unlink()

def sh(*parts):return subprocess.check_output(parts,cwd=ROOT,text=True).strip()
node_code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; console.log(JSON.stringify(await canonicalSourceIdentity(new URL('file://' + process.cwd() + '/'))));"
prod=json.loads(subprocess.check_output(['node','--input-type=module','-e',node_code],cwd=ROOT,text=True))
head=sh('git','rev-parse','HEAD');tree=sh('git','rev-parse','HEAD^{tree}')
if subprocess.run(['git','merge-base','--is-ancestor',PARENT,head],cwd=ROOT).returncode:raise SystemExit('CORR03_PARENT_NOT_ANCESTOR')
if args.expected_head and head!=args.expected_head:raise SystemExit(f'HEAD_MISMATCH:{head}')
if args.expected_tree and tree!=args.expected_tree:raise SystemExit(f'TREE_MISMATCH:{tree}')
if args.expected_product_sha and (prod['sha256']!=args.expected_product_sha or prod['files']!=args.expected_product_files):raise SystemExit(f'PRODUCT_IDENTITY_MISMATCH:{prod}')

static_from=re.compile(r'(^\s*(?:import|export)\b(?:(?!;).)*?\bfrom\s*)([\'\"])([^\'\"]+)(\2)',re.M|re.S);static_side=re.compile(r'(^\s*import\s*)([\'\"])([^\'\"]+)(\2)',re.M);dynamic=re.compile(r'(\bimport\(\s*)([\'\"])([^\'\"]+)(\2)(\s*\))')
def specs(src):return [m.group(3) for pat in (static_from,static_side,dynamic) for m in pat.finditer(src)]
def resolve(rel,spec):return ((DIST/rel).parent/spec).resolve().relative_to(DIST) if spec.startswith('.') else None
def bare(rel):return '@cep/'+rel.as_posix()
reachable=set();queue=[pathlib.Path('main.js')]
while queue:
    rel=queue.pop()
    if rel in reachable:continue
    reachable.add(rel);src=(DIST/rel).read_text(encoding='utf-8')
    for spec in specs(src):
        dep=resolve(rel,spec)
        if dep:queue.append(dep)
_IMPORT_CACHE={}
def make_imports(surface):
    if surface in _IMPORT_CACHE:return _IMPORT_CACHE[surface]
    imports={}
    for rel in sorted(reachable,key=lambda p:p.as_posix()):
        src=(DIST/rel).read_text(encoding='utf-8')
        def sf(m):
            pre,q,spec,_=m.groups();dep=resolve(rel,spec);return pre+q+(bare(dep) if dep else spec)+q
        src=static_from.sub(sf,src);src=static_side.sub(sf,src)
        def sd(m):
            pre,q,spec,_,post=m.groups();dep=resolve(rel,spec);return pre+q+(bare(dep) if dep else spec)+q+post
        src=dynamic.sub(sd,src)
        if any(s.startswith('.') for s in specs(src)):raise SystemExit(f'UNRESOLVED_IMPORT:{rel}')
        if rel.as_posix()=='main.js':src=src.replace("canonicalizeGlobalShellRoute(location.search,location.href,CEP_PRODUCT_DESTINATION_REGISTRY)",f"canonicalizeGlobalShellRoute('?surface={surface}','http://offline.local/?surface={surface}',CEP_PRODUCT_DESTINATION_REGISTRY)")
        imports[bare(rel)]='data:text/javascript;base64,'+base64.b64encode(src.encode()).decode()
    _IMPORT_CACHE[surface]=imports
    return imports
index=(DIST/'index.html').read_text(encoding='utf-8')
for css in ['foundation/donor.css','foundation/extensions.css','foundation/global/tokens/scale.css']:
    index=index.replace(f'<link rel="stylesheet" href="{css}">','<style>'+(DIST/css).read_text(encoding='utf-8')+'</style>')
index=re.sub(r'<script type="module" src="main\.js"></script>','',index)
def sha256(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def boot(browser,surface,viewport):
    print('BOOT_START',surface,viewport,flush=True);imports=make_imports(surface);print('IMPORTS_READY',surface,len(imports),flush=True);ctx=browser.new_context(viewport=viewport,reduced_motion='reduce');page=ctx.new_page();page.set_default_timeout(5000);errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
    page.set_content(index,wait_until='domcontentloaded',timeout=20000);print('CONTENT_SET',surface,flush=True);page.evaluate("m=>{const s=document.createElement('script');s.type='importmap';s.textContent=JSON.stringify({imports:m});document.head.appendChild(s)}",imports);page.evaluate("()=>{const s=document.createElement('script');s.type='module';s.textContent='import \"@cep/main.js\";';document.body.appendChild(s)}")
    page.wait_for_function(f"globalThis.CEPFoundation?.consumer==='{surface}'",timeout=25000);print('FOUNDATION_READY',surface,flush=True);page.wait_for_timeout(120)
    if errs:raise RuntimeError('RENDER_ERRORS:'+json.dumps(errs))
    return ctx,page

def active(page):return page.evaluate("()=>globalThis.CEPFoundation?.m0Composition?.binding?.activeView?.()||null")
def selection(page):return page.evaluate("()=>[...(globalThis.CEPFoundation?.m0Composition?.adapter?.model?.selection||[])]")
def choose_view(page,mode,keyboard=False):
    tab=page.locator(f'[data-visualize-view-tab="{mode}"]').first
    if keyboard:tab.focus();page.keyboard.press('Enter')
    else:tab.click()
    page.wait_for_function(f"globalThis.CEPFoundation?.m0Composition?.binding?.activeView?.()==='{mode}'",timeout=5000);page.wait_for_timeout(80)
def select_first(page,mode,keyboard=False):
    if mode=='TREE':
        aux=page.locator('#domainView details.visualize-tree-aux').first
        if aux.count():aux.evaluate('e=>e.open=true')
        item=page.locator('#domainView [data-visualize-select]').first
    elif mode=='PATH':item=page.locator('#domainView [data-visualize-select]').first
    else:item=page.locator('#spatialHost [data-node]').first
    if keyboard:item.focus();page.keyboard.press('Space')
    else:item.click(position={'x':8,'y':8})
    page.wait_for_function("globalThis.CEPFoundation?.m0Composition?.adapter?.model?.selection?.size===1",timeout=5000);page.wait_for_timeout(80)
def prepare_view(page,mode,keyboard=False):
    choose_view(page,'TREE',keyboard=keyboard)
    select_first(page,'TREE',keyboard=keyboard)
    prior=selection(page)
    if mode!='TREE':choose_view(page,mode,keyboard=keyboard)
    after=selection(page)
    if prior!=after:raise AssertionError(f'SELECTION_LOST_ON_VIEW_SWITCH:{mode}:{prior}->{after}')
    return prior

def probe(page):
    return page.evaluate(r"""()=>{const f=globalThis.CEPFoundation,c=f?.m0Composition,a=c?.adapter,b=c?.binding,r=f?.registry,mode=b?.activeView?.()||null,sel=[...(a?.model?.selection||[])],text=(document.body?.innerText||'').replace(/\s+/g,' ').trim();const avail={};for(const id of ['visualize.select','visualize.move','visualize.viewport','visualize.link','visualize.edit','spatial.connect','spatial.relation.commit','relation.edit','relation.undo','relation.redo']){try{avail[id]=r?.availability(id,{representationIds:sel,dx:10,dy:5,action:'fit',width:f?.spatial?.svg?.clientWidth||800,height:f?.spatial?.svg?.clientHeight||600})||null}catch(e){avail[id]={error:String(e)}}}const tabs=[...document.querySelectorAll('[data-visualize-view-tab]')].map(n=>({mode:n.dataset.visualizeViewTab,selected:n.getAttribute('aria-selected'),pressed:n.getAttribute('aria-pressed'),tabIndex:n.tabIndex}));const right=f?.workspace?.regionHosts?.get?.('RIGHT');return {consumer:f?.consumer||null,mode,selection:sel,sameSpatialModel:c?.adapter?.model===f?.spatial?.model,sharedSpatialViewId:c?.sharedSpatialViewId||null,spatialInstanceId:f?.spatial?.instanceId||null,spatialOwner:a?.model?.interactionKernel?.ownerId||null,provider:a?.providerTruth?.()||null,views:a?.viewDescriptors?.()||[],availability:avail,tabs,stageDataset:{active:document.querySelector('#centerPane .domain-stage')?.dataset?.visualizeActiveView||document.querySelector('.domain-stage')?.dataset?.visualizeActiveView||null,owner:document.querySelector('.domain-stage')?.dataset?.visualizeSharedSpatialOwner||null},flags:{canonicalLegacy:/Canonical relationship workspace|Canonical relationships/.test(text),readOnly:/READ_ONLY|read only/i.test(text),allViewTabs:['TREE','PATH','GRAPH','CANVAS'].every(v=>tabs.some(t=>t.mode===v)),legacyTopologyObjectsHistory:/Topology/i.test(text)&&/Objects/i.test(text)&&/History/i.test(text),balanced6:/LOCAL_DEV_ACCEPTANCE_SEED|B09/.test(text)},rightText:(right?.innerText||'').replace(/\s+/g,' ').trim(),selectionTruth:a?.selectionTruth?.(mode)||null,hierarchy:a?.hierarchyProjection?.()||null,canonicalInvariant:a?.canonicalInvariantSnapshot?.()||null,representations:a?.representationRecords?.()||[],canvasLinks:(a?.model?.edges||[]).filter(e=>e?.kind==='canvas-presentation'),geometry:{innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyScrollWidth:document.body?.scrollWidth||0,dir:document.documentElement.dir||null},horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2,bidi:{bdiCount:document.querySelectorAll('bdi').length}}}""")
def assert_visualize(p,mode):
    assert p['consumer']=='visualize' and p['mode']==mode and len(p['selection'])==1
    assert p['sameSpatialModel'] is True and p['sharedSpatialViewId']==p['spatialInstanceId']
    assert p['spatialOwner']=='SpatialInteractionKernel';assert p['provider']['authority']=='LOCAL_ACCEPTANCE_PROJECTION_ONLY';assert p['provider']['canonical'] is False;assert p['provider']['editability']=='READ_ONLY'
    assert p['flags']['allViewTabs'] is True and p['flags']['canonicalLegacy'] is False and p['flags']['legacyTopologyObjectsHistory'] is False and p['flags']['balanced6'] is False,p['flags']
    assert p['geometry']['scrollWidth']<=p['geometry']['innerWidth']+2 and p['geometry']['dir']=='rtl' and p['bidi']['bdiCount']>0
    active_tabs=[t for t in p['tabs'] if t['selected']=='true'];assert len(active_tabs)==1 and active_tabs[0]['mode']==mode and active_tabs[0]['tabIndex']==0
    assert p['availability']['visualize.link']['enabled'] is False and p['availability']['visualize.edit']['enabled'] is False
    for relation_id in ('spatial.connect','spatial.relation.commit','relation.edit','relation.undo','relation.redo'):
        relation_avail=p['availability'][relation_id];assert 'error' not in relation_avail and relation_avail['enabled'] is False
    if mode=='CANVAS':assert p['availability']['visualize.move']['enabled'] is True
    else:assert p['availability']['visualize.move']['enabled'] is False
    if mode in ('GRAPH','CANVAS'):assert p['availability']['visualize.viewport']['enabled'] is True
    else:assert p['availability']['visualize.viewport']['enabled'] is False

def reveal_right(page):
    before=(active(page),selection(page));toggle=page.locator('[data-pane-toggle="right"]').first
    if not toggle.count():raise AssertionError('RIGHT_TOGGLE_MISSING')
    toggle.click();page.wait_for_timeout(120);after=(active(page),selection(page))
    if before!=after:raise AssertionError(f'RIGHT_TOGGLE_LOST_CONTEXT:{before}->{after}')

def capture(page,mode,name,state,vp,records):
    p=SHOTS/name;page.screenshot(path=str(p),full_page=False);pr=probe(page);assert_visualize(pr,mode);records.append({'surface':'visualize','mode':mode,'state':state,'viewport':vp,'file':name,'bytes':p.stat().st_size,'sha256':sha256(p),'probe':pr})

records=[];continuity=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for vp,keyboard in (({'width':1440,'height':1000},False),({'width':1024,'height':900},True)):
        ctx,page=boot(browser,'visualize',vp)
        choose_view(page,'TREE',keyboard=keyboard);select_first(page,'TREE',keyboard=keyboard);baseline=selection(page)
        for mode in VIEWS:
            if mode!='TREE':choose_view(page,mode,keyboard=keyboard)
            current=selection(page)
            if current!=baseline:raise AssertionError(f'SELECTION_LOST_ON_VIEW_SWITCH:{mode}:{baseline}->{current}')
            continuity.append({'mode':mode,'viewport':vp,'input':'keyboard' if keyboard else 'pointer','selection':current})
            capture(page,mode,f'visualize-{mode.lower()}-selected-{vp["width"]}x{vp["height"]}.png','selected-context',vp,records)
            if vp['width']==1024:
                reveal_right(page);capture(page,mode,f'visualize-{mode.lower()}-selected-right-revealed-1024x900.png','selected-context-right-revealed',vp,records)
                page.locator('[data-pane-toggle="right"]').first.click();page.wait_for_timeout(80)
        ctx.close()
    # Correction03 Canvas lifecycle / interaction-depth proof on exact candidate.
    browser.close();browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    ctx,page=boot(browser,'visualize',{'width':1440,'height':1000})
    choose_view(page,'CANVAS');first_canvas=page.evaluate("()=>globalThis.CEPFoundation.m0Composition.adapter.view('CANVAS').representationIds()[0]");page.evaluate("id=>{globalThis.CEPFoundation.registry.execute('visualize.select',{representationIds:[id],action:'replace',route:'capture-lifecycle'});globalThis.CEPFoundation.m0Composition.presentation.refresh()}",first_canvas);page.wait_for_timeout(80);print('LIFECYCLE_SINGLE_READY',flush=True)
    canonicalInvariant=page.evaluate("()=>globalThis.CEPFoundation.m0Composition.adapter.canonicalInvariantSnapshot()")
    original=selection(page)[0];print('LIFECYCLE_ORIGINAL',original,flush=True)
    lifecycle=[]
    def state(label):
        pr=probe(page);lifecycle.append({'label':label,'probe':pr});return pr
    single=state('single-selection');assert single['selectionTruth']['state']=='SINGLE' and single['selectionTruth']['primaryRepresentationId']==original
    p=SHOTS/'canvas-lifecycle-single-1440x1000.png';page.screenshot(path=str(p),full_page=False);records.append({'surface':'visualize','mode':'CANVAS','state':'canvas-lifecycle-single','viewport':{'width':1440,'height':1000},'file':p.name,'bytes':p.stat().st_size,'sha256':sha256(p),'probe':single})
    nodes=page.locator('#spatialHost [data-node]');assert nodes.count()>=2;print('LIFECYCLE_NODES',nodes.count(),flush=True)
    second_canvas=page.evaluate("()=>globalThis.CEPFoundation.m0Composition.adapter.view('CANVAS').representationIds()[1]");page.evaluate("id=>{globalThis.CEPFoundation.registry.execute('visualize.select',{representationIds:[id],action:'add',route:'capture-multi'});globalThis.CEPFoundation.m0Composition.presentation.refresh()}",second_canvas);page.wait_for_function("globalThis.CEPFoundation.m0Composition.adapter.model.selection.size===2",timeout=5000);page.wait_for_timeout(80)
    multi=state('multi-selection');assert multi['selectionTruth']['state']=='MULTI' and len(multi['selectionTruth']['selectedIds'])==2 and multi['selectionTruth']['primaryRepresentationId']
    p=SHOTS/'canvas-lifecycle-multi-1440x1000.png';page.screenshot(path=str(p),full_page=False);records.append({'surface':'visualize','mode':'CANVAS','state':'canvas-lifecycle-multi','viewport':{'width':1440,'height':1000},'file':p.name,'bytes':p.stat().st_size,'sha256':sha256(p),'probe':multi})
    # Return to one source representation, then exercise pointer toolbar and keyboard against the same semantic duplicate command.
    page.evaluate("id=>globalThis.CEPFoundation.registry.execute('visualize.select',{representationIds:[id],action:'replace',route:'capture-reset'})",original);page.evaluate("()=>globalThis.CEPFoundation.m0Composition.presentation.refresh()")
    before_count=page.evaluate("()=>globalThis.CEPFoundation.m0Composition.adapter.representationRecords().length")
    toolbar_dup=page.locator('[data-foundation-command="visualize.duplicateRepresentation"]').first;assert toolbar_dup.count() and toolbar_dup.is_enabled();toolbar_dup.click();page.wait_for_function(f"globalThis.CEPFoundation.m0Composition.adapter.representationRecords().length==={before_count+1}",timeout=5000);page.wait_for_timeout(80)
    pointer_dup=selection(page)[0];assert pointer_dup!=original;print('LIFECYCLE_POINTER_DUP',pointer_dup,flush=True)
    pointer_receipt=page.evaluate("()=>globalThis.CEPFoundation.registry.receipts.at(-1)")
    page.evaluate("()=>globalThis.CEPFoundation.registry.execute('visualize.undoPresentation',{route:'capture-pointer-undo'})");page.evaluate("()=>globalThis.CEPFoundation.m0Composition.presentation.refresh()")
    page.wait_for_function(f"globalThis.CEPFoundation.m0Composition.adapter.representationRecords().length==={before_count}",timeout=5000)
    page.evaluate("id=>globalThis.CEPFoundation.registry.execute('visualize.select',{representationIds:[id],action:'replace',route:'capture-keyboard-reset'})",original);page.locator('#spatialHost svg.spatial-canvas').focus();page.keyboard.press('Control+d');page.wait_for_function(f"globalThis.CEPFoundation.m0Composition.adapter.representationRecords().length==={before_count+1}",timeout=5000);page.wait_for_timeout(80)
    keyboard_dup=selection(page)[0];print('LIFECYCLE_KEYBOARD_DUP',keyboard_dup,flush=True);keyboard_receipt=page.evaluate("()=>globalThis.CEPFoundation.registry.receipts.at(-1)");assert keyboard_dup!=original
    pointerKeyboard={'pointerRepresentation':pointer_dup,'keyboardRepresentation':keyboard_dup,'pointerCommand':pointer_receipt.get('commandId') or pointer_receipt.get('id'),'keyboardCommand':keyboard_receipt.get('commandId') or keyboard_receipt.get('id'),'sameOwner':pointer_receipt.get('owner')==keyboard_receipt.get('owner')}
    assert pointerKeyboard['pointerCommand']==keyboard_receipt.get('commandId') or pointerKeyboard['pointerCommand']==keyboard_receipt.get('id')
    dup=keyboard_dup
    dup_before=page.evaluate("id=>globalThis.CEPFoundation.m0Composition.adapter.representationRecord(id)",dup);orig_before=page.evaluate("id=>globalThis.CEPFoundation.m0Composition.adapter.representationRecord(id)",original)
    page.locator(f'#spatialHost [data-node="{dup}"]').focus();page.keyboard.press('Control+ArrowRight');page.keyboard.press('Control+ArrowDown');page.evaluate("()=>globalThis.CEPFoundation.m0Composition.presentation.refresh()");page.wait_for_timeout(80)
    dup_after=page.evaluate("id=>globalThis.CEPFoundation.m0Composition.adapter.representationRecord(id)",dup);orig_after=page.evaluate("id=>globalThis.CEPFoundation.m0Composition.adapter.representationRecord(id)",original);assert (dup_after['x'],dup_after['y'])!=(dup_before['x'],dup_before['y']) and (orig_after['x'],orig_after['y'])==(orig_before['x'],orig_before['y'])
    page.evaluate("ids=>{const r=globalThis.CEPFoundation.registry;r.execute('visualize.select',{representationIds:[ids[0]],action:'replace',route:'capture-link'});r.execute('visualize.select',{representationIds:[ids[1]],action:'add',route:'capture-link'});r.execute('visualize.canvasLink',{route:'capture-link'});globalThis.CEPFoundation.m0Composition.presentation.refresh()}",[original,dup]);page.wait_for_timeout(80)
    print('LIFECYCLE_LINK_EXECUTED',flush=True);linked=state('canvas-only-link');assert len(linked['canvasLinks'])==1 and linked['canonicalInvariant']==canonicalInvariant
    p=SHOTS/'canvas-lifecycle-duplicate-move-link-1440x1000.png';page.screenshot(path=str(p),full_page=False);records.append({'surface':'visualize','mode':'CANVAS','state':'canvas-lifecycle-duplicate-move-link','viewport':{'width':1440,'height':1000},'file':p.name,'bytes':p.stat().st_size,'sha256':sha256(p),'probe':linked})
    # Representation-aware RIGHT inspector.
    right=workspace_right=page.locator('#rightPane').first
    if page.locator('[data-pane-toggle="right"]').count() and not right.is_visible():page.locator('[data-pane-toggle="right"]').first.click();page.wait_for_timeout(100)
    print('LIFECYCLE_RIGHT_CHECK',flush=True);right_text=right.inner_text();assert 'Representation ID' in right_text and 'Canonical object ID' in right_text and 'Canvas-local coordinates' in right_text and 'presentation' in right_text.lower()
    p=SHOTS/'canvas-lifecycle-representation-inspector-1440x1000.png';page.screenshot(path=str(p),full_page=False);records.append({'surface':'visualize','mode':'CANVAS','state':'representation-aware-right','viewport':{'width':1440,'height':1000},'file':p.name,'bytes':p.stat().st_size,'sha256':sha256(p),'probe':probe(page)})
    # Context-menu pointer / keyboard parity.
    print('LIFECYCLE_CONTEXT_START',flush=True);target=page.locator(f'#spatialHost [data-node="{dup}"]').first;target.dispatch_event('contextmenu', {'button':2,'clientX':420,'clientY':360});page.wait_for_timeout(80)
    pointer_items=page.evaluate("()=>[...document.querySelectorAll('#foundationMenu [data-foundation-command]')].map(x=>x.dataset.foundationCommand)")
    page.keyboard.press('Escape');target.focus();page.keyboard.press('Shift+F10');page.wait_for_timeout(80)
    keyboard_items=page.evaluate("()=>[...document.querySelectorAll('#foundationMenu [data-foundation-command]')].map(x=>x.dataset.foundationCommand)")
    contextParity={'pointer':pointer_items,'keyboard':keyboard_items,'equal':pointer_items==keyboard_items};assert contextParity['equal'] and 'visualize.removeRepresentation' in pointer_items
    page.keyboard.press('Escape')
    # Remove / undo / redo through keyboard routes with deterministic focus fallback.
    print('LIFECYCLE_REMOVE_START',flush=True);page.evaluate("id=>globalThis.CEPFoundation.registry.execute('visualize.select',{representationIds:[id],action:'replace',route:'capture-remove'})",dup);page.locator('#spatialHost svg.spatial-canvas').focus();page.keyboard.press('Delete');page.wait_for_function(f"!globalThis.CEPFoundation.m0Composition.adapter.representationRecord('{dup}')",timeout=5000);removed=state('remove');assert removed['selectionTruth']['primaryRepresentationId']==original and removed['canonicalInvariant']==canonicalInvariant
    page.keyboard.press('Control+z');page.wait_for_function(f"!!globalThis.CEPFoundation.m0Composition.adapter.representationRecord('{dup}')",timeout=5000);undone=state('undo-remove');assert undone['selectionTruth']['primaryRepresentationId']==dup and undone['canonicalInvariant']==canonicalInvariant
    page.keyboard.press('Control+Shift+z');page.wait_for_function(f"!globalThis.CEPFoundation.m0Composition.adapter.representationRecord('{dup}')",timeout=5000);redone=state('redo-remove');assert redone['selectionTruth']['primaryRepresentationId']==original and redone['canonicalInvariant']==canonicalInvariant
    p=SHOTS/'canvas-lifecycle-remove-redo-1440x1000.png';page.screenshot(path=str(p),full_page=False);records.append({'surface':'visualize','mode':'CANVAS','state':'canvas-lifecycle-remove-redo','viewport':{'width':1440,'height':1000},'file':p.name,'bytes':p.stat().st_size,'sha256':sha256(p),'probe':redone})
    negativeCanonicalProof={'before':canonicalInvariant,'after':redone['canonicalInvariant'],'unchanged':canonicalInvariant==redone['canonicalInvariant']};assert negativeCanonicalProof['unchanged']
    horizontalOverflow=all(not r.get('probe',{}).get('horizontalOverflow',False) for r in records if r['surface']=='visualize')
    responsiveRight=any(r['state']=='selected-context-right-revealed' and r['viewport']['width']==1024 for r in records)
    # Tree hierarchy-unavailable truth was rendered in both viewports by the matrix.
    hierarchy_records=[r for r in records if r['surface']=='visualize' and r['mode']=='TREE'];assert hierarchy_records and all(r['probe']['hierarchy']['status']=='VISUALIZE_HIERARCHY_UNAVAILABLE_NOT_OBSERVED' for r in hierarchy_records)
    hierarchyUnavailable=True
    ctx.close();browser.close();browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    ctx,page=boot(browser,'rq',{'width':1440,'height':1000});rp=page.evaluate(r"""()=>{const f=globalThis.CEPFoundation,text=(document.body?.innerText||'').replace(/\s+/g,' ');return {consumer:f?.consumer,search:f?.registry?.availability('rq.search',{}),records:f?.m0Composition?.adapter?.records?.length,balanced6:/Balanced6|LOCAL_DEV_ACCEPTANCE_SEED|B09/.test(text)}}""");assert rp['consumer']=='rq' and rp['search']['enabled'] is False and rp['records']==0 and rp['balanced6'] is False
    rqshot=SHOTS/'rq-regression-1440x1000.png';page.screenshot(path=str(rqshot),full_page=False);records.append({'surface':'rq','state':'regression','viewport':{'width':1440,'height':1000},'file':rqshot.name,'bytes':rqshot.stat().st_size,'sha256':sha256(rqshot),'probe':rp});ctx.close();browser.close()
receipt={'schemaVersion':3,'classification':'B3R_CORRECTION03_CANDIDATE_VISUAL_EVIDENCE__NAVIGATION_INDEPENDENT__NOT_GENUINE_ROUTE','mission':'CORR02_B3R_CORRECTION03_CANVAS_REPRESENTATION_AND_TREE_TRUTH','correction03Parent':PARENT,'candidateHead':head,'candidateTree':tree,'productSource':prod,'browserExecutable':'/usr/bin/chromium','route':'NAVIGATION_INDEPENDENT_EXACT_CANDIDATE_BROWSER_RENDER__NOT_GENUINE_ROUTE','continuityChecks':continuity,'records':records,'summary':{'visualizeScreenshots':len([r for r in records if r['surface']=='visualize']),'rqRegressionScreenshots':len([r for r in records if r['surface']=='rq']),'views':list(VIEWS),'viewports':['1440x1000','1024x900'],'rightRevealPerView':True,'pointerAndKeyboard':True,'sharedSpatialModelAsserted':True,'canvas-lifecycle':lifecycle,'hierarchy-unavailable':hierarchyUnavailable,'canonicalInvariant':negativeCanonicalProof,'pointerKeyboard':pointerKeyboard,'contextParity':contextParity,'responsiveRight':responsiveRight,'horizontalOverflow':horizontalOverflow}}
(OUT/'b3r-corr03-candidate-visual-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'verdict':'PASS','candidateHead':head,'candidateTree':tree,'productSource':prod,'visualizeScreenshots':receipt['summary']['visualizeScreenshots'],'rqRegressionScreenshots':1,'views':list(VIEWS),'receipt':str((OUT/'b3r-corr03-candidate-visual-receipt.json').relative_to(ROOT))},indent=2))
