from pathlib import Path
import hashlib, json, os, re, shutil, subprocess, tempfile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[5]
EVIDENCE = Path(__file__).resolve().parent / 'evidence'
EVIDENCE.mkdir(parents=True, exist_ok=True)
BROWSER = os.environ.get('CEP_BROWSER_EXECUTABLE','/usr/bin/chromium')

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def build_runtime():
    temp=Path(tempfile.mkdtemp(prefix='cep-cg1-od054-runtime-'))
    runtime=temp/'dist'
    shutil.copytree(ROOT/'dist',runtime)
    script=f"import {{buildRuntime}} from {json.dumps((ROOT/'tools/build-runtime.mjs').as_uri())}; console.log(JSON.stringify(buildRuntime({{sourceRoot:{json.dumps(str(ROOT/'stack/native-typescript'))},destinationRoot:{json.dumps(str(runtime))}}})));"
    cp=subprocess.run(['node','--input-type=module','-e',script],cwd=ROOT,text=True,capture_output=True,check=True)
    return temp,runtime,json.loads(cp.stdout.strip())

def setup_page(browser,runtime,width,height):
    html=(runtime/'index.html').read_text(encoding='utf-8')
    html=re.sub(r'<script type="module" src="main\.js"></script>','',html,flags=re.I).replace('<head>','<head><base href="http://cep.local/">',1)
    context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
    page=context.new_page(); errors=[]
    page.on('pageerror',lambda e: errors.append('page:'+str(e)))
    page.on('console',lambda m: errors.append('console:'+m.text) if m.type=='error' and 'ERR_CONNECTION_REFUSED' not in m.text and 'Failed to load resource' not in m.text else None)
    def handler(route):
        relative=route.request.url.split('http://cep.local/',1)[-1].split('?',1)[0] or 'index.html'
        f=runtime/relative
        if not f.exists(): route.fulfill(status=404,body='not found'); return
        ctype={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'}.get(f.suffix,'application/octet-stream')
        route.fulfill(status=200,body=f.read_bytes(),content_type=ctype)
    page.route('http://cep.local/**',handler)
    page.set_content(html,wait_until='domcontentloaded')
    page.evaluate("()=>history.replaceState({},'',`about:blank?surface=library`)")
    page.add_script_tag(type='module',url='http://cep.local/main.js')
    page.wait_for_function("()=>globalThis.CEPFoundation?.consumer==='library'&&globalThis.CEPBlueprint",timeout=30000)
    page.wait_for_function("()=>document.querySelector('#blockList')?.dataset.presentationState==='ready'",timeout=30000)
    page.evaluate("""()=>{window.__cg1Contexts=[];document.addEventListener('contextmenu',e=>{const gap=e.target?.closest?.('.gap');if(gap)window.__cg1Contexts.push({surface:gap.dataset.surface||null,index:Number(gap.dataset.index),depth:Number(gap.dataset.depth),defaultPrevented:e.defaultPrevented,interactive:gap.dataset.interactive,targetTag:e.target?.tagName||null});});}""")
    return context,page,errors

def choose_gap(page,scope):
    return page.evaluate("""scope=>{const root=scope==='main'?document.querySelector('#blockList'):document.querySelector(`[data-note-id="${CSS.escape(scope)}"] .noteeditor`);const gaps=[...root.querySelectorAll('.gap[data-interactive="true"]')];const g=gaps.find(x=>x.dataset.depth==='0'&&x.dataset.afterBlockId&&x.dataset.beforeBlockId)||gaps.find(x=>x.dataset.depth==='0')||gaps[0];if(!g)return null;const all=[...root.querySelectorAll('.gap[data-interactive="true"]')];return {ordinal:all.indexOf(g),surface:g.dataset.surface,index:Number(g.dataset.index),depth:Number(g.dataset.depth),parentId:g.dataset.parentId||null,afterBlockId:g.dataset.afterBlockId||null,beforeBlockId:g.dataset.beforeBlockId||null};}""",scope)

def gap_plus(page,scope,ordinal):
    root='#blockList' if scope=='main' else f'[data-note-id="{scope}"] .noteeditor'
    return page.locator(f'{root} .gap[data-interactive="true"] [data-insert-gap]').nth(ordinal)

def main_snapshot(page):
    return page.evaluate("()=>({doc:structuredClone(CEPFoundation.structured.snapshot()),tx:structuredClone(CEPFoundation.structured.transactionDescriptor()),selected:CEPBlueprint.state.editor.selectedBlock,paletteHidden:document.querySelector('#insertionPalette').hidden})")

def note_snapshot(page,note_id):
    return page.evaluate("id=>({doc:structuredClone(CEPFoundation.noteRuntime.snapshot(id)),tx:structuredClone(CEPFoundation.noteRuntime.transactionDescriptor(id)),selected:CEPBlueprint.state.notes[id].working.selectedBlock,paletteHidden:document.querySelector('#insertionPalette').hidden})",note_id)

def verify_exact_gap(before,after,target):
    assert target['parentId'] is None, 'proof harness intentionally selects a root gap'
    i=target['index']; blocks=after['doc']['blocks']; prior=before['doc']['blocks']
    assert len(blocks)==len(prior)+1, 'one contextmenu must insert exactly one block'
    inserted=blocks[i]
    assert inserted['type']=='paragraph', 'secondary route must insert Paragraph'
    if target['afterBlockId']:
        assert blocks[i-1]['id']==target['afterBlockId'], 'afterBlockId exact placement drift'
    if target['beforeBlockId']:
        assert blocks[i+1]['id']==target['beforeBlockId'], 'beforeBlockId exact placement drift'
    return inserted

def full_1440(page,errors):
    steps=[]
    page.evaluate("()=>CEPBlueprint.setMode('edit')"); page.wait_for_timeout(60)
    target=choose_gap(page,'main'); assert target
    plus=gap_plus(page,'main',target['ordinal'])

    # PRIMARY: chooser only, no mutation; closing chooser must return focus to invoker.
    before=main_snapshot(page); plus.dispatch_event('click',{'button':0,'bubbles':True,'cancelable':True}); page.wait_for_timeout(30); after=main_snapshot(page)
    assert not after['paletteHidden'] and before['doc']==after['doc'] and before['tx']['historyLength']==after['tx']['historyLength']
    chooser_shot=EVIDENCE/'CG1_CORR01_OD054_1440x1000_CHOOSER.png'; page.screenshot(path=chooser_shot,full_page=True)
    page.evaluate("()=>CEPBlueprint.closeInsertion()"); page.wait_for_timeout(20)
    assert plus.evaluate("el=>document.activeElement===el")
    steps.append({'id':'primary-left-click-chooser-no-direct-insert','status':'PASS'})

    # KEYBOARD Enter and Space: same chooser, no mutation, invoker return.
    for key in ['Enter','Space']:
        before=main_snapshot(page); plus.focus(); plus.dispatch_event('keydown',{'key':'Enter' if key=='Enter' else ' ','code':'Enter' if key=='Enter' else 'Space','bubbles':True,'cancelable':True}); page.wait_for_timeout(20); after=main_snapshot(page)
        assert not after['paletteHidden'] and before['doc']==after['doc'] and before['tx']['historyLength']==after['tx']['historyLength']
        page.evaluate("()=>CEPBlueprint.closeInsertion()"); page.wait_for_timeout(20)
        assert plus.evaluate("el=>document.activeElement===el")
        steps.append({'id':f'keyboard-{key.lower()}-chooser-no-direct-insert','status':'PASS'})

    # SECONDARY: actual contextmenu, exact one Paragraph, canonical transaction, no chooser.
    before=main_snapshot(page); target=choose_gap(page,'main'); plus=gap_plus(page,'main',target['ordinal'])
    plus.dispatch_event('contextmenu',{'button':2,'buttons':2,'bubbles':True,'cancelable':True}); page.wait_for_timeout(80); after=main_snapshot(page)
    inserted=verify_exact_gap(before,after,target)
    assert after['tx']['historyLength']==before['tx']['historyLength']+1
    assert after['tx']['workingRevision']==before['tx']['workingRevision']+1
    assert after['tx']['dirty'] is True and after['paletteHidden'] is True
    probe=page.evaluate("()=>window.__cg1Contexts.at(-1)"); assert probe['defaultPrevented'] is True
    page.wait_for_timeout(30)
    focus=page.evaluate("id=>({selected:CEPBlueprint.state.editor.selectedBlock,activeId:document.activeElement?.closest?.('.block')?.dataset.blockId||null})",inserted['id'])
    assert focus['selected']==inserted['id'] and focus['activeId']==inserted['id']
    page.evaluate("()=>CEPBlueprint.undo('main')"); page.wait_for_timeout(30); undone=main_snapshot(page)
    assert undone['doc']==before['doc']
    page.evaluate("()=>CEPBlueprint.redo('main')"); page.wait_for_timeout(30); redone=main_snapshot(page)
    assert redone['doc']['blocks'][target['index']]['id']==inserted['id'] and redone['doc']['blocks'][target['index']]['type']=='paragraph'
    steps.append({'id':'secondary-contextmenu-main-exact-one-paragraph-undo-redo','status':'PASS','insertedBlockId':inserted['id'],'target':target,'contextmenu':probe})

    # UNAVAILABLE/NON-EDITABLE main gap: real read-mode gap rail receives native menu and must not mutate.
    page.evaluate("()=>CEPBlueprint.setMode('read')"); page.wait_for_timeout(40)
    assert page.locator('#blockList [data-insert-gap]').count()==0
    before_read=main_snapshot(page)
    rail=page.locator('#blockList .gap').first
    rail.dispatch_event('contextmenu',{'button':2,'buttons':2,'bubbles':True,'cancelable':True}); page.wait_for_timeout(30)
    after_read=main_snapshot(page); probe_read=page.evaluate("()=>window.__cg1Contexts.at(-1)")
    assert before_read['doc']==after_read['doc'] and before_read['tx']['historyLength']==after_read['tx']['historyLength']
    assert probe_read['defaultPrevented'] is False and probe_read['interactive']=='false'
    steps.append({'id':'noneditable-gap-no-mutation-native-contextmenu-preserved','status':'PASS','contextmenu':probe_read})

    # STICKY: main remains read, note stays editable; same canonical Structured secondary route.
    note_id=page.evaluate("()=>CEPBlueprint.createNote(document.querySelector('#workspaceViewButton'))")
    page.wait_for_function("id=>!!document.querySelector(`[data-note-id=\"${CSS.escape(id)}\"] .noteeditor .gap[data-interactive=\"true\"] [data-insert-gap]`)",arg=note_id,timeout=10000)
    target_note=choose_gap(page,note_id); nplus=gap_plus(page,note_id,target_note['ordinal']); nbefore=note_snapshot(page,note_id)
    nplus.dispatch_event('contextmenu',{'button':2,'buttons':2,'bubbles':True,'cancelable':True}); page.wait_for_timeout(80); nafter=note_snapshot(page,note_id)
    ninserted=verify_exact_gap(nbefore,nafter,target_note)
    assert nafter['tx']['historyLength']==nbefore['tx']['historyLength']+1 and nafter['paletteHidden'] is True
    nprobe=page.evaluate("()=>window.__cg1Contexts.at(-1)"); assert nprobe['defaultPrevented'] is True
    page.evaluate("id=>CEPBlueprint.undo('note:'+id)",note_id); page.wait_for_timeout(30); nundo=note_snapshot(page,note_id); assert nundo['doc']==nbefore['doc']
    page.evaluate("id=>CEPBlueprint.redo('note:'+id)",note_id); page.wait_for_timeout(30); nredo=note_snapshot(page,note_id); assert nredo['doc']['blocks'][target_note['index']]['id']==ninserted['id']
    steps.append({'id':'sticky-main-read-note-always-editable-secondary-exact-one-paragraph','status':'PASS','noteId':note_id,'insertedBlockId':ninserted['id'],'target':target_note,'contextmenu':nprobe})

    shot=EVIDENCE/'CG1_CORR01_OD054_1440x1000_PRODUCT_ROUTE.png'; page.screenshot(path=shot,full_page=True)
    assert errors==[], errors
    return steps,[{'file':chooser_shot.name,'sha256':sha(chooser_shot),'viewport':'1440x1000','state':'canonical-chooser-open-after-primary-click'},{'file':shot.name,'sha256':sha(shot),'viewport':'1440x1000','state':'product-route-post-falsification'}]

def compact_1024(page,errors):
    page.evaluate("()=>CEPBlueprint.setMode('edit')"); page.wait_for_timeout(60)
    target=choose_gap(page,'main'); before=main_snapshot(page); plus=gap_plus(page,'main',target['ordinal']); plus.dispatch_event('contextmenu',{'button':2,'buttons':2,'bubbles':True,'cancelable':True}); page.wait_for_timeout(80); after=main_snapshot(page)
    inserted=verify_exact_gap(before,after,target); probe=page.evaluate("()=>window.__cg1Contexts.at(-1)")
    assert probe['defaultPrevented'] is True and after['paletteHidden'] is True
    note_id=page.evaluate("()=>CEPBlueprint.createNote(document.querySelector('#workspaceViewButton'))")
    page.wait_for_function("id=>!!document.querySelector(`[data-note-id=\"${CSS.escape(id)}\"] .noteeditor .gap[data-interactive=\"true\"] [data-insert-gap]`)",arg=note_id,timeout=10000)
    nt=choose_gap(page,note_id); nb=note_snapshot(page,note_id); np=gap_plus(page,note_id,nt['ordinal']); np.dispatch_event('contextmenu',{'button':2,'buttons':2,'bubbles':True,'cancelable':True}); page.wait_for_timeout(80); na=note_snapshot(page,note_id); ni=verify_exact_gap(nb,na,nt)
    nprobe=page.evaluate("()=>window.__cg1Contexts.at(-1)"); assert nprobe['defaultPrevented'] is True and na['paletteHidden'] is True
    shot=EVIDENCE/'CG1_CORR01_OD054_1024x900_PRODUCT_ROUTE.png'; page.screenshot(path=shot,full_page=True)
    assert errors==[], errors
    return [{'id':'1024-main-contextmenu-exact-one-paragraph','status':'PASS','insertedBlockId':inserted['id'],'target':target,'contextmenu':probe},{'id':'1024-sticky-contextmenu-exact-one-paragraph','status':'PASS','insertedBlockId':ni['id'],'target':nt,'contextmenu':nprobe}],{'file':shot.name,'sha256':sha(shot),'viewport':'1024x900'}

def main():
    temp,runtime,build=build_runtime(); results=[]; screenshots=[]
    try:
      with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path=BROWSER,args=['--no-sandbox'])
        for width,height,runner in [(1440,1000,full_1440),(1024,900,compact_1024)]:
            context,page,errors=setup_page(browser,runtime,width,height)
            try:
                steps,shot=runner(page,errors); results.extend(steps); screenshots.extend(shot if isinstance(shot,list) else [shot])
            finally: context.close()
        browser.close()
    finally:
      shutil.rmtree(temp,ignore_errors=True)
    receipt={'schemaVersion':1,'mission':'MISSION_CG1_CORR01_OD054_ACCEPTED_RUNTIME_SECONDARY_ROUTE','classification':'CANDIDATE_ONLY__REAL_PRODUCT_ACCEPTED_RUNTIME_ROUTE__NO_PROMOTION','browserExecutable':BROWSER,'runtimeBuild':build,'summary':{'total':len(results),'pass':sum(r['status']=='PASS' for r in results),'fail':sum(r['status']!='PASS' for r in results)},'results':results,'screenshots':screenshots,'unresolvedDependencies':['R6 whole-surface detach/final routing','R6 Library real-consumer final cutover','OE-001 Windows InputDirection','HWND / OS topmost','ConPTY / real terminal target proof']}
    out=EVIDENCE/'CG1_CORR01_OD054_BROWSER_PRODUCT_ROUTE_PROOF.json'; out.write_text(json.dumps(receipt,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print(json.dumps({'summary':receipt['summary'],'screenshots':screenshots},ensure_ascii=False))
    if receipt['summary']['fail']: raise SystemExit(1)

if __name__=='__main__': main()
