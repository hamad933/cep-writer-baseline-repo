#!/usr/bin/env python3
import base64, hashlib, json, pathlib, re, subprocess
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[2]
DIST=(ROOT/'dist').resolve(); OUT=ROOT/'.capsule-c3-output'; SHOTS=OUT/'screenshots'
EXPECTED_SHA='760578213b3f3e352dd2b08dd05fab183c3ffad9625844a1d0ea82e30cc9e454'; EXPECTED_FILES=273
OUT.mkdir(exist_ok=True); SHOTS.mkdir(parents=True,exist_ok=True)
for p in SHOTS.glob('*.png'): p.unlink()
node_code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; console.log(JSON.stringify(await canonicalSourceIdentity(new URL('file://' + process.cwd() + '/'))));"
prod=json.loads(subprocess.check_output(['node','--input-type=module','-e',node_code],cwd=ROOT,text=True))
if prod['sha256']!=EXPECTED_SHA or prod['files']!=EXPECTED_FILES: raise SystemExit(f"C3_BOOTSTRAP_PRODUCT_IDENTITY_MISMATCH:{prod['sha256']}/{prod['files']}")
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(); tree=subprocess.check_output(['git','rev-parse','HEAD^{tree}'],cwd=ROOT,text=True).strip()
# Build a navigation-independent offline ESM execution graph from exact generated dist bytes.
static_from=re.compile(r'(^\s*(?:import|export)\b(?:(?!;).)*?\bfrom\s*)([\'\"])([^\'\"]+)(\2)',re.M|re.S)
static_side=re.compile(r'(^\s*import\s*)([\'\"])([^\'\"]+)(\2)',re.M)
dynamic=re.compile(r'(\bimport\(\s*)([\'\"])([^\'\"]+)(\2)(\s*\))')
def specs(src): return [m.group(3) for pat in (static_from,static_side,dynamic) for m in pat.finditer(src)]
def resolve(rel,spec): return ((DIST/rel).parent/spec).resolve().relative_to(DIST) if spec.startswith('.') else None
reachable=set(); queue=[pathlib.Path('main.js')]
while queue:
    rel=queue.pop()
    if rel in reachable: continue
    reachable.add(rel); src=(DIST/rel).read_text(encoding='utf-8')
    for spec in specs(src):
        dep=resolve(rel,spec)
        if dep: queue.append(dep)
def bare(rel): return '@cep/'+rel.as_posix()
imports={}
for rel in sorted(reachable,key=lambda p:p.as_posix()):
    src=(DIST/rel).read_text(encoding='utf-8')
    def sf(m):
        pre,q,spec,_=m.groups(); dep=resolve(rel,spec); return pre+q+(bare(dep) if dep else spec)+q
    src=static_from.sub(sf,src); src=static_side.sub(sf,src)
    def sd(m):
        pre,q,spec,_,post=m.groups(); dep=resolve(rel,spec); return pre+q+(bare(dep) if dep else spec)+q+post
    src=dynamic.sub(sd,src)
    if any(s.startswith('.') for s in specs(src)): raise SystemExit(f'C3_OFFLINE_BUNDLE_UNRESOLVED_IMPORT:{rel}')
    if rel.as_posix()=='main.js':
        src=src.replace("canonicalizeGlobalShellRoute(location.search,location.href,CEP_PRODUCT_DESTINATION_REGISTRY)","canonicalizeGlobalShellRoute('?surface=today','http://offline.local/?surface=today',CEP_PRODUCT_DESTINATION_REGISTRY)")
    imports[bare(rel)]='data:text/javascript;base64,'+base64.b64encode(src.encode()).decode()
index=(DIST/'index.html').read_text(encoding='utf-8')
for css in ['foundation/donor.css','foundation/extensions.css','foundation/global/tokens/scale.css']:
    index=index.replace(f'<link rel="stylesheet" href="{css}">','<style>'+(DIST/css).read_text(encoding='utf-8')+'</style>')
index=re.sub(r'<script type="module" src="main\.js"></script>','',index)
def sha256(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
records=[]
def capture(page,name,state,viewport):
    path=SHOTS/name; page.screenshot(path=str(path),full_page=False)
    probe=page.evaluate("""() => { const text=(document.body?.innerText||'').replace(/\\s+/g,' ').trim(); const buttons=[...document.querySelectorAll('[data-today-action]')].map(n=>({action:n.getAttribute('data-today-action'),itemId:n.getAttribute('data-item-id'),disabled:!!n.disabled,label:(n.textContent||'').trim()})); const sourceLines=[...document.querySelectorAll('.today-source')].map(n=>(n.textContent||'').trim()); return {consumer:globalThis.CEPFoundation?.consumer||null,buttons,sourceLines,flags:{localAcceptance:text.includes('LOCAL_ACCEPTANCE_PROJECTION_ONLY'),resumeVisible:buttons.some(x=>x.action==='resume'),resumeEnabled:buttons.some(x=>x.action==='resume'&&!x.disabled),whyEnabled:buttons.some(x=>x.action==='why'&&!x.disabled),resolvable:text.includes('RESOLVABLE')},regions:{left:document.querySelector('#leftPane')?.innerText?.slice(0,1200)||'',center:document.querySelector('#centerPane')?.innerText?.slice(0,2600)||'',right:document.querySelector('#rightPane')?.innerText?.slice(0,1200)||'',bottom:document.querySelector('#bottomShelf')?.innerText?.slice(0,1200)||''}} }""")
    records.append({'surface':'today','state':state,'viewport':viewport,'file':name,'bytes':path.stat().st_size,'sha256':sha256(path),'probe':probe})
def boot_page(browser,viewport):
    ctx=browser.new_context(viewport=viewport,reduced_motion='reduce'); page=ctx.new_page(); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(index,wait_until='domcontentloaded',timeout=20000)
    page.evaluate("m=>{const s=document.createElement('script');s.type='importmap';s.textContent=JSON.stringify({imports:m});document.head.appendChild(s)}",imports)
    page.evaluate("()=>{const s=document.createElement('script');s.type='module';s.textContent='import \"@cep/main.js\";';document.body.appendChild(s)}")
    page.wait_for_function("globalThis.CEPFoundation?.consumer==='today'",timeout=25000)
    if errors: raise RuntimeError('C3_OFFLINE_RENDER_PAGE_ERRORS:'+json.dumps(errors))
    return ctx,page
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for vp in ({'width':1440,'height':1000},{'width':1024,'height':900}):
        ctx,page=boot_page(browser,vp); capture(page,f"today-default-{vp['width']}x{vp['height']}.png",'default',vp)
        if vp['width']==1024:
            toggle=page.locator('[data-pane-toggle="right"]').first
            if toggle.count(): toggle.click(); page.wait_for_timeout(120); capture(page,'today-right-revealed-1024x900.png','right-revealed',vp)
        ctx.close()
    vp={'width':1440,'height':1000}; ctx,page=boot_page(browser,vp); rec=page.locator('#todayRecommendationCard').first
    if rec.count(): rec.scroll_into_view_if_needed(); page.wait_for_timeout(100)
    capture(page,'today-recommendation-1440x1000.png','recommendation-visible',vp); ctx.close(); browser.close()
receipt={'schemaVersion':3,'classification':'C3_CONTROLLER_PREPARED_BASELINE__BOOTSTRAP_ONLY__NOT_ACCEPTANCE','mission':'CORR02_C3_TODAY_PROVIDER_EPISTEMIC_CONTINUATION_TRUTH','productParentCommit':'1acf9d691b27b1a271f149139e055110971b1fa0','capsuleTransportCommit':head,'capsuleTransportTree':tree,'productSource':{'sha256':prod['sha256'],'files':prod['files']},'browserExecutable':'/usr/bin/chromium','route':'NAVIGATION_INDEPENDENT_EXACT_CANDIDATE_BROWSER_RENDER__NOT_GENUINE_ROUTE','runtimeBuild':'LOCAL_SOURCE_TO_DIST__EXTRACT_DONOR_PLUS_BUILD_RUNTIME_MJS__NO_EXTERNAL_DEPENDENCY_FETCH','offlineModuleGraphFiles':len(reachable),'viewports':[{'width':1440,'height':1000},{'width':1024,'height':900}],'records':records}
(OUT/'c3-today-baseline-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'verdict':'PASS','screenshots':len(records),'productSource':receipt['productSource'],'head':head,'tree':tree,'route':receipt['route'],'moduleFiles':len(reachable)}))
