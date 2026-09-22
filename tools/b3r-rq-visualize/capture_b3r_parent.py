#!/usr/bin/env python3
import base64, hashlib, json, pathlib, re, subprocess
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[2]
DIST=(ROOT/'dist').resolve(); OUT=ROOT/'.capsule-b3r-output'; SHOTS=OUT/'screenshots'
EXPECTED_SHA='e3951754ae79016603456b14dc71856671428e0d0811ec119388fbd79093890c'; EXPECTED_FILES=273
OUT.mkdir(exist_ok=True); SHOTS.mkdir(parents=True,exist_ok=True)
for p in SHOTS.glob('*.png'): p.unlink()
node_code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; console.log(JSON.stringify(await canonicalSourceIdentity(new URL('file://' + process.cwd() + '/'))));"
prod=json.loads(subprocess.check_output(['node','--input-type=module','-e',node_code],cwd=ROOT,text=True))
if prod['sha256']!=EXPECTED_SHA or prod['files']!=EXPECTED_FILES: raise SystemExit(f"B3R_BOOTSTRAP_PRODUCT_IDENTITY_MISMATCH:{prod['sha256']}/{prod['files']}")
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(); tree=subprocess.check_output(['git','rev-parse','HEAD^{tree}'],cwd=ROOT,text=True).strip()
static_from=re.compile(r'(^\s*(?:import|export)\b(?:(?!;).)*?\bfrom\s*)([\'\"])([^\'\"]+)(\2)',re.M|re.S); static_side=re.compile(r'(^\s*import\s*)([\'\"])([^\'\"]+)(\2)',re.M); dynamic=re.compile(r'(\bimport\(\s*)([\'\"])([^\'\"]+)(\2)(\s*\))')
def specs(src): return [m.group(3) for pat in (static_from,static_side,dynamic) for m in pat.finditer(src)]
def resolve(rel,spec): return ((DIST/rel).parent/spec).resolve().relative_to(DIST) if spec.startswith('.') else None
def bare(rel): return '@cep/'+rel.as_posix()
reachable=set(); queue=[pathlib.Path('main.js')]
while queue:
    rel=queue.pop()
    if rel in reachable: continue
    reachable.add(rel); src=(DIST/rel).read_text(encoding='utf-8')
    for spec in specs(src):
        dep=resolve(rel,spec)
        if dep: queue.append(dep)
def make_imports(surface):
    imports={}
    for rel in sorted(reachable,key=lambda p:p.as_posix()):
        src=(DIST/rel).read_text(encoding='utf-8')
        def sf(m):
            pre,q,spec,_=m.groups(); dep=resolve(rel,spec); return pre+q+(bare(dep) if dep else spec)+q
        src=static_from.sub(sf,src); src=static_side.sub(sf,src)
        def sd(m):
            pre,q,spec,_,post=m.groups(); dep=resolve(rel,spec); return pre+q+(bare(dep) if dep else spec)+q+post
        src=dynamic.sub(sd,src)
        if any(s.startswith('.') for s in specs(src)): raise SystemExit(f'B3R_UNRESOLVED_IMPORT:{rel}')
        if rel.as_posix()=='main.js': src=src.replace("canonicalizeGlobalShellRoute(location.search,location.href,CEP_PRODUCT_DESTINATION_REGISTRY)",f"canonicalizeGlobalShellRoute('?surface={surface}','http://offline.local/?surface={surface}',CEP_PRODUCT_DESTINATION_REGISTRY)")
        imports[bare(rel)]='data:text/javascript;base64,'+base64.b64encode(src.encode()).decode()
    return imports
index=(DIST/'index.html').read_text(encoding='utf-8')
for css in ['foundation/donor.css','foundation/extensions.css','foundation/global/tokens/scale.css']:
    index=index.replace(f'<link rel="stylesheet" href="{css}">','<style>'+(DIST/css).read_text(encoding='utf-8')+'</style>')
index=re.sub(r'<script type="module" src="main\.js"></script>','',index)
def sha256(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
records=[]
def boot(browser,surface,viewport):
    imports=make_imports(surface); ctx=browser.new_context(viewport=viewport,reduced_motion='reduce'); page=ctx.new_page(); errs=[]; page.on('pageerror',lambda e:errs.append(str(e)))
    page.set_content(index,wait_until='domcontentloaded',timeout=20000); page.evaluate("m=>{const s=document.createElement('script');s.type='importmap';s.textContent=JSON.stringify({imports:m});document.head.appendChild(s)}",imports); page.evaluate("()=>{const s=document.createElement('script');s.type='module';s.textContent='import \"@cep/main.js\";';document.body.appendChild(s)}")
    page.wait_for_function(f"globalThis.CEPFoundation?.consumer==='{surface}'",timeout=25000)
    if errs: raise RuntimeError('B3R_RENDER_ERRORS:'+json.dumps(errs))
    return ctx,page
def probe(page,surface):
    return page.evaluate("""surface=>{const text=(document.body?.innerText||'').replace(/\s+/g,' ').trim(); const cmds=[...document.querySelectorAll('[data-foundation-command]')].map(n=>({id:n.dataset.foundationCommand,disabled:!!n.disabled,label:(n.textContent||'').trim()})); return {consumer:globalThis.CEPFoundation?.consumer||null,commands:cmds,flags:{balanced6:/Balanced6|LOCAL_DEV_ACCEPTANCE_SEED|B09/.test(text),nonProduction:/NON_PRODUCTION|LOCAL_ACCEPTANCE_PROJECTION_ONLY|local acceptance projection/i.test(text),canonicalCopy:/Canonical relationship workspace|Canonical relationships/.test(text),readOnly:/READ_ONLY|read only/i.test(text)},geometry:{innerWidth,scrollWidth:document.documentElement.scrollWidth},regions:{left:(document.querySelector('#leftPane')?.innerText||'').slice(0,1600),center:(document.querySelector('#centerPane')?.innerText||'').slice(0,3000),right:(document.querySelector('#rightPane')?.innerText||'').slice(0,1800),bottom:(document.querySelector('#bottomShelf')?.innerText||'').slice(0,1200)}}} """,surface)
def capture(page,surface,name,state,vp):
    p=SHOTS/name; page.screenshot(path=str(p),full_page=False); records.append({'surface':surface,'state':state,'viewport':vp,'file':name,'bytes':p.stat().st_size,'sha256':sha256(p),'probe':probe(page,surface)})
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for surface in ('rq','visualize'):
        for vp in ({'width':1440,'height':1000},{'width':1024,'height':900}):
            ctx,page=boot(browser,surface,vp); capture(page,surface,f'{surface}-default-{vp["width"]}x{vp["height"]}.png','default',vp)
            if vp['width']==1024:
                toggle=page.locator('[data-pane-toggle="right"]').first
                if toggle.count(): toggle.click(); page.wait_for_timeout(120); capture(page,surface,f'{surface}-right-revealed-1024x900.png','right-revealed',vp)
            ctx.close()
    browser.close()
receipt={'schemaVersion':1,'classification':'B3R_CONTROLLER_PREPARED_PARENT_BASELINE__BOOTSTRAP_ONLY__NOT_ACCEPTANCE','mission':'CORR02_B3R_RQ_VISUALIZE_TRUTH_CONVERGENCE','productParentCommit':'fec137df4b06111db160cdcbd25d7c725dfec286','capsuleTransportCommit':head,'capsuleTransportTree':tree,'productSource':prod,'browserExecutable':'/usr/bin/chromium','route':'NAVIGATION_INDEPENDENT_EXACT_CANDIDATE_BROWSER_RENDER__NOT_GENUINE_ROUTE','runtimeBuild':'LOCAL_SOURCE_TO_DIST__EXTRACT_DONOR_PLUS_BUILD_RUNTIME_MJS','records':records}
(OUT/'b3r-parent-baseline-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'verdict':'PASS','screenshots':len(records),'head':head,'tree':tree,'productSource':prod,'records':[{'surface':r['surface'],'state':r['state'],'viewport':r['viewport'],'sha256':r['sha256'],'flags':r['probe']['flags']} for r in records]},indent=2))
