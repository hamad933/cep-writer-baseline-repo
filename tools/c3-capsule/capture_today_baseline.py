#!/usr/bin/env python3
import hashlib, json, os, pathlib, subprocess, time, urllib.request
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/'.capsule-c3-output'; SHOTS=OUT/'screenshots'; PORT=43183
EXPECTED_SHA='760578213b3f3e352dd2b08dd05fab183c3ffad9625844a1d0ea82e30cc9e454'; EXPECTED_FILES=273
OUT.mkdir(exist_ok=True); SHOTS.mkdir(parents=True,exist_ok=True)
for p in SHOTS.glob('*.png'): p.unlink()
# exact Product identity, same canonical algorithm via repository Node helper
node_code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; console.log(JSON.stringify(await canonicalSourceIdentity(new URL('file://' + process.cwd() + '/'))));"
prod=json.loads(subprocess.check_output(['node','--input-type=module','-e',node_code],cwd=ROOT,text=True))
if prod['sha256']!=EXPECTED_SHA or prod['files']!=EXPECTED_FILES: raise SystemExit(f"C3_BOOTSTRAP_PRODUCT_IDENTITY_MISMATCH:{prod['sha256']}/{prod['files']}")
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(); tree=subprocess.check_output(['git','rev-parse','HEAD^{tree}'],cwd=ROOT,text=True).strip()
server=subprocess.Popen(['node','tools/serve.mjs','--port',str(PORT)],cwd=ROOT,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
def wait_server():
    for _ in range(120):
        try:
            with urllib.request.urlopen(f'http://127.0.0.1:{PORT}/',timeout=.3) as r:
                if r.status==200:return
        except Exception: time.sleep(.1)
    raise RuntimeError('C3_BOOTSTRAP_SERVER_DID_NOT_START')
def sha256(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
records=[]
def capture(page,name,state,viewport):
    path=SHOTS/name; page.screenshot(path=str(path),full_page=False)
    probe=page.evaluate("""() => { const text=(document.body?.innerText||'').replace(/\\s+/g,' ').trim(); const buttons=[...document.querySelectorAll('[data-today-action]')].map(n=>({action:n.getAttribute('data-today-action'),itemId:n.getAttribute('data-item-id'),disabled:!!n.disabled,label:(n.textContent||'').trim()})); const sourceLines=[...document.querySelectorAll('.today-source')].map(n=>(n.textContent||'').trim()); return {consumer:globalThis.CEPFoundation?.consumer||null,buttons,sourceLines,flags:{localAcceptance:text.includes('LOCAL_ACCEPTANCE_PROJECTION_ONLY'),resumeVisible:buttons.some(x=>x.action==='resume'),resumeEnabled:buttons.some(x=>x.action==='resume'&&!x.disabled),whyEnabled:buttons.some(x=>x.action==='why'&&!x.disabled),resolvable:text.includes('RESOLVABLE')},regions:{left:document.querySelector('#leftPane')?.innerText?.slice(0,1200)||'',center:document.querySelector('#centerPane')?.innerText?.slice(0,2600)||'',right:document.querySelector('#rightPane')?.innerText?.slice(0,1200)||'',bottom:document.querySelector('#bottomShelf')?.innerText?.slice(0,1200)||''}} }""")
    records.append({'surface':'today','state':state,'viewport':viewport,'file':name,'bytes':path.stat().st_size,'sha256':sha256(path),'probe':probe})
try:
    wait_server()
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        for vp in ({'width':1440,'height':1000},{'width':1024,'height':900}):
            ctx=browser.new_context(viewport=vp,reduced_motion='reduce'); page=ctx.new_page(); page.goto(f'http://127.0.0.1:{PORT}/?surface=today',wait_until='networkidle'); page.wait_for_function("globalThis.CEPFoundation?.consumer==='today'")
            capture(page,f"today-default-{vp['width']}x{vp['height']}.png",'default',vp)
            if vp['width']==1024:
                t=page.locator('[data-pane-toggle="right"]').first
                if t.count(): t.click(); page.wait_for_timeout(120); capture(page,'today-right-revealed-1024x900.png','right-revealed',vp)
            ctx.close()
        ctx=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce'); page=ctx.new_page(); page.goto(f'http://127.0.0.1:{PORT}/?surface=today',wait_until='networkidle'); page.wait_for_function("globalThis.CEPFoundation?.consumer==='today'")
        rec=page.locator('#todayRecommendationCard').first
        if rec.count(): rec.scroll_into_view_if_needed(); page.wait_for_timeout(100)
        capture(page,'today-recommendation-1440x1000.png','recommendation-visible',{'width':1440,'height':1000}); ctx.close(); browser.close()
finally:
    server.terminate()
    try: server.wait(timeout=3)
    except: server.kill()
log=''
try: log=server.stdout.read()[-4000:] if server.stdout else ''
except: pass
receipt={'schemaVersion':2,'classification':'C3_CONTROLLER_PREPARED_BASELINE__TRACKED_ACCEPTED_RUNTIME_ARTIFACT__BOOTSTRAP_ONLY__NOT_ACCEPTANCE','mission':'CORR02_C3_TODAY_PROVIDER_EPISTEMIC_CONTINUATION_TRUTH','productParentCommit':'1acf9d691b27b1a271f149139e055110971b1fa0','capsuleTransportCommit':head,'capsuleTransportTree':tree,'productSource':{'sha256':prod['sha256'],'files':prod['files']},'browserExecutable':'/usr/bin/chromium','route':'GENUINE_LOCALHOST__TRACKED_ACCEPTED_DIST__NO_DEPENDENCY_FETCH','viewports':[{'width':1440,'height':1000},{'width':1024,'height':900}],'records':records,'serverLog':log}
(OUT/'c3-today-baseline-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'verdict':'PASS','screenshots':len(records),'productSource':receipt['productSource'],'head':head,'tree':tree,'runtimeSource':receipt['route']}))
