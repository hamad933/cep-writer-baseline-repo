#!/usr/bin/env python3
from pathlib import Path
import base64, hashlib, json, posixpath, re, subprocess
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
ASSURANCE=ROOT/'assurance'/'W6_A_BROWSER'
ASSURANCE.mkdir(parents=True,exist_ok=True)

HTML='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>W6 A StickyNoteWindowOwner Browser Proof</title><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;font-family:Arial,sans-serif;background:#eef2f6;color:#172033}#w6a-root{position:relative;width:100%;height:100%}#reopenButton{position:absolute;left:18px;top:18px;z-index:2}.sticky{position:absolute;display:flex;flex-direction:column;box-sizing:border-box;border:1px solid #8a94a6;border-radius:10px;background:#fff;box-shadow:0 12px 36px rgba(0,0,0,.18);overflow:hidden}.sticky:focus{outline:3px solid #4b77d1;outline-offset:2px}.title{height:44px;min-height:44px;display:flex;align-items:center;gap:8px;padding:0 12px;background:#fff8cf;border-bottom:1px solid #d8cc8b;cursor:move;box-sizing:border-box}.title strong{flex:1}.scroll{min-height:0;overflow:auto;flex:1}.content{height:900px;padding:14px;box-sizing:border-box;background:linear-gradient(#fff,#f8fafc)}.toolbar,.status{height:42px;display:flex;align-items:center;padding:0 12px;box-sizing:border-box;border-top:1px solid #d7dce3;background:#f8fafc}.status{height:34px;background:#f2f4f7}.handle{position:absolute;z-index:3;background:transparent}.handle[data-edge=left]{left:-4px;top:10px;bottom:10px;width:8px;cursor:ew-resize}.handle[data-edge=right]{right:-4px;top:10px;bottom:10px;width:8px;cursor:ew-resize}.handle[data-edge=top]{top:-4px;left:10px;right:10px;height:8px;cursor:ns-resize}.handle[data-edge=bottom]{bottom:-4px;left:10px;right:10px;height:8px;cursor:ns-resize}.handle[data-edge=top-left]{left:-5px;top:-5px;width:14px;height:14px;cursor:nwse-resize}.handle[data-edge=top-right]{right:-5px;top:-5px;width:14px;height:14px;cursor:nesw-resize}.handle[data-edge=bottom-left]{left:-5px;bottom:-5px;width:14px;height:14px;cursor:nesw-resize}.handle[data-edge=bottom-right]{right:-5px;bottom:-5px;width:14px;height:14px;cursor:nwse-resize}#stateOut{position:absolute;right:8px;top:8px;max-width:38vw;font:11px monospace;white-space:pre-wrap;opacity:.55;pointer-events:none}</style></head><body><div id="w6a-root"><button id="reopenButton">Reopen note</button><section id="stickyWindow" class="sticky" tabindex="0" aria-label="Sticky note window"><header id="titleBar" class="title" data-drag><strong>Sticky Note · browser proof</strong><button id="hideButton" type="button">Hide</button></header><div id="noteScroll" class="scroll"><div id="longContent" class="content">Long note content used to prove internal scrolling and bottom-region reachability.</div><div id="bottomToolbar" class="toolbar">Formatting toolbar</div><footer id="bottomStatus" class="status">Status region</footer></div><span class="handle" data-edge="left"></span><span class="handle" data-edge="right"></span><span class="handle" data-edge="top"></span><span class="handle" data-edge="bottom"></span><span class="handle" data-edge="top-left"></span><span class="handle" data-edge="top-right"></span><span class="handle" data-edge="bottom-left"></span><span class="handle" data-edge="bottom-right"></span></section><pre id="stateOut"></pre></div></body></html>'''

MEMO={}
PAT1=re.compile(r"(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.{1,2}/[^'\"]+)['\"]")
PAT2=re.compile(r"import\(\s*['\"](\.{1,2}/[^'\"]+)['\"]\s*\)")
def specs(src): return list(dict.fromkeys(PAT1.findall(src)+PAT2.findall(src)))
def resolve(rel,spec): return posixpath.normpath(posixpath.join(posixpath.dirname(rel),spec))
def module_url(rel):
    rel=posixpath.normpath(rel)
    if rel in MEMO:return MEMO[rel]
    src=(DIST/rel).read_text(encoding='utf-8');MEMO[rel]='__RESOLVING__'+rel
    for spec in specs(src):
        dep=resolve(rel,spec)
        if MEMO.get(dep,'').startswith('__RESOLVING__'):raise RuntimeError(f'W6_A_BROWSER_ESM_CYCLE:{rel}->{dep}')
        src=src.replace(spec,module_url(dep))
    url='data:text/javascript;base64,'+base64.b64encode(src.encode()).decode();MEMO[rel]=url;return url
def source_with_urls(rel):
    src=(DIST/rel).read_text(encoding='utf-8')
    for spec in specs(src):src=src.replace(spec,module_url(resolve(rel,spec)))
    return src

def source_identity():
    code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; const x=await canonicalSourceIdentity(new URL('file://' + process.cwd().replaceAll('\\\\','/') + '/')); console.log(JSON.stringify({sha256:x.sha256,files:x.files}))"
    return json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True).strip())

def geom(page): return page.evaluate("()=>W6AStickyWindowBrowser.owner.window('browser-note').geometry")
def exact(a,b): return all(abs(float(a[k])-float(b[k]))<0.001 for k in ('x','y','width','height'))

MAIN=source_with_urls('w6-a-sticky-note-window-browser.js')
errors=[];steps=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1200,'height':800},reduced_motion='reduce')
    page=context.new_page();page.set_default_timeout(12000);page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(HTML,wait_until='domcontentloaded');page.add_script_tag(type='module',content=MAIN+'\n// W6-A in-memory browser proof')
    page.wait_for_function("()=>globalThis.W6AStickyWindowBrowser?.owner")

    before=geom(page);box=page.locator('#titleBar').bounding_box();page.mouse.move(box['x']+80,box['y']+20);page.mouse.down();page.mouse.move(box['x']+130,box['y']+50,steps=4);page.mouse.up();after=geom(page)
    if not (after['x']>before['x'] and after['y']>before['y']):raise RuntimeError('POINTER_MOVE_FAILED')
    steps.append({'id':'pointer-move','status':'PASS','before':before,'after':after})

    before_cancel=geom(page);box=page.locator('#titleBar').bounding_box();page.mouse.move(box['x']+90,box['y']+20);page.mouse.down();page.mouse.move(box['x']+170,box['y']+70,steps=3);mid=geom(page)
    if exact(mid,before_cancel):raise RuntimeError('POINTER_CANCEL_NO_PREVIEW_CHANGE')
    page.keyboard.press('Escape');page.mouse.up();after_cancel=geom(page)
    if not exact(after_cancel,before_cancel):raise RuntimeError(f'POINTER_CANCEL_ROLLBACK_FAILED:{before_cancel}:{after_cancel}')
    steps.append({'id':'pointer-cancel-escape','status':'PASS','before':before_cancel,'preview':mid,'after':after_cancel})

    page.locator('#stickyWindow').focus();kbd_before=geom(page);page.keyboard.press('Alt+ArrowRight');kbd_move=geom(page)
    if not kbd_move['x']>kbd_before['x']:raise RuntimeError('KEYBOARD_MOVE_FAILED')
    page.keyboard.press('Alt+Shift+ArrowDown');kbd_resize=geom(page)
    if not kbd_resize['height']>kbd_move['height']:raise RuntimeError('KEYBOARD_RESIZE_FAILED')
    steps.append({'id':'keyboard-move-resize','status':'PASS','before':kbd_before,'afterMove':kbd_move,'afterResize':kbd_resize})

    page.set_viewport_size({'width':500,'height':360});page.wait_for_timeout(80);small=page.evaluate("()=>({g:W6AStickyWindowBrowser.owner.window('browser-note').geometry,v:W6AStickyWindowBrowser.owner.window('browser-note').viewport})")
    g,v=small['g'],small['v']
    if not (g['x']>=v['left'] and g['y']>=v['top'] and g['x']+g['width']<=v['right']+.01 and g['y']+g['height']<=v['bottom']+.01):raise RuntimeError('VIEWPORT_RECLAMP_FAILED')
    steps.append({'id':'viewport-shrink-reachable','status':'PASS','geometry':g,'viewport':v})

    overflow=page.evaluate("()=>W6AStickyWindowBrowser.overflow()")
    page.evaluate("()=>{const s=document.getElementById('noteScroll');s.scrollTop=s.scrollHeight}");page.wait_for_timeout(30)
    reach=page.evaluate("()=>{const s=document.getElementById('noteScroll').getBoundingClientRect(),t=document.getElementById('bottomToolbar').getBoundingClientRect(),f=document.getElementById('bottomStatus').getBoundingClientRect();return {scrollTop:document.getElementById('noteScroll').scrollTop,scrollHeight:document.getElementById('noteScroll').scrollHeight,clientHeight:document.getElementById('noteScroll').clientHeight,toolbarVisible:t.bottom<=s.bottom+1&&t.top>=s.top-1,statusVisible:f.bottom<=s.bottom+1&&f.top>=s.top-1}}")
    if not (overflow['internalScrollRequired'] and reach['scrollTop']>0 and reach['toolbarVisible'] and reach['statusVisible']):raise RuntimeError('BOTTOM_REGION_REACHABILITY_FAILED:'+json.dumps({'overflow':overflow,'reach':reach}))
    steps.append({'id':'overflow-bottom-regions-reachable','status':'PASS','projection':overflow,'dom':reach})

    page.locator('#hideButton').click();page.wait_for_timeout(20);focus_hide=page.evaluate("()=>({active:document.activeElement?.id,lifecycle:W6AStickyWindowBrowser.owner.window('browser-note').lifecycle})")
    if focus_hide!={'active':'reopenButton','lifecycle':'hidden'}:raise RuntimeError('HIDE_FOCUS_RETURN_FAILED:'+json.dumps(focus_hide))
    identity_before=page.evaluate("()=>W6AStickyWindowBrowser.owner.window('browser-note').presentationId")
    page.locator('#reopenButton').click();page.wait_for_timeout(20);focus_open=page.evaluate("()=>({active:document.activeElement?.id,lifecycle:W6AStickyWindowBrowser.owner.window('browser-note').lifecycle,presentationId:W6AStickyWindowBrowser.owner.window('browser-note').presentationId})")
    if not (focus_open['active']=='stickyWindow' and focus_open['lifecycle']=='open' and focus_open['presentationId']==identity_before):raise RuntimeError('REOPEN_FOCUS_IDENTITY_FAILED:'+json.dumps(focus_open))
    steps.append({'id':'hide-reopen-focus-identity','status':'PASS','afterHide':focus_hide,'afterReopen':focus_open})

    receipt=page.evaluate("()=>({cancel:W6AStickyWindowBrowser.owner.receipts.findLast(x=>x.action==='window.pointer.cancel'),actions:W6AStickyWindowBrowser.owner.accessibleActions('browser-note')})")
    if not receipt['cancel']['rollbackExact']:raise RuntimeError('CANCEL_RECEIPT_NOT_EXACT')
    screenshot=ASSURANCE/'W6_A_STICKY_NOTE_WINDOW_BROWSER.png';page.screenshot(path=str(screenshot),full_page=True)
    dom=(page.content()+'\n').encode();dom_path=ASSURANCE/'W6_A_STICKY_NOTE_WINDOW_BROWSER_DOM.html';dom_path.write_bytes(dom)
    context.close();browser.close()

if errors:raise RuntimeError('W6_A_BROWSER_PAGE_ERRORS:'+json.dumps(errors,ensure_ascii=False))
identity=source_identity();png=screenshot.read_bytes()
proof={'schemaVersion':1,'kind':'W6_A_STICKY_NOTE_WINDOW_BROWSER_PROOF','classification':'LANE_A_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE','status':'PASS','sourceCanonicalTreeSha256':identity['sha256'],'canonicalSourceFileCount':identity['files'],'environment':{'engine':'Python Playwright Chromium','executable':'/usr/bin/chromium','transport':'in-memory-built-esm','initialViewport':{'width':1200,'height':800},'shrinkViewport':{'width':500,'height':360}},'steps':steps,'pageErrors':errors,'cancelReceipt':receipt['cancel'],'accessibleActions':receipt['actions'],'artifacts':{'screenshot':{'path':'assurance/W6_A_BROWSER/W6_A_STICKY_NOTE_WINDOW_BROWSER.png','bytes':len(png),'sha256':hashlib.sha256(png).hexdigest()},'dom':{'path':'assurance/W6_A_BROWSER/W6_A_STICKY_NOTE_WINDOW_BROWSER_DOM.html','bytes':len(dom),'sha256':hashlib.sha256(dom).hexdigest()}}}
(ASSURANCE/'W6_A_BROWSER_PROOF.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':'PASS','steps':len(steps),'sourceCanonicalTreeSha256':identity['sha256'],'sourceFiles':identity['files'],'screenshotBytes':len(png)},indent=2))
