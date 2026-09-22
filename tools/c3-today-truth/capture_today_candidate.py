#!/usr/bin/env python3
import base64, hashlib, json, pathlib, re, subprocess
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[2]
DIST=(ROOT/'dist').resolve(); OUT=ROOT/'.c3-today-candidate-evidence'; SHOTS=OUT/'screenshots'
OUT.mkdir(exist_ok=True); SHOTS.mkdir(parents=True,exist_ok=True)
for p in SHOTS.glob('*.png'): p.unlink()
node_code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; console.log(JSON.stringify(await canonicalSourceIdentity(new URL('file://' + process.cwd() + '/'))));"
prod=json.loads(subprocess.check_output(['node','--input-type=module','-e',node_code],cwd=ROOT,text=True))
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(); tree=subprocess.check_output(['git','rev-parse','HEAD^{tree}'],cwd=ROOT,text=True).strip()
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
    if any(s.startswith('.') for s in specs(src)): raise SystemExit(f'C3_CANDIDATE_UNRESOLVED_IMPORT:{rel}')
    if rel.as_posix()=='main.js':
        src=src.replace("canonicalizeGlobalShellRoute(location.search,location.href,CEP_PRODUCT_DESTINATION_REGISTRY)","canonicalizeGlobalShellRoute('?surface=today','http://offline.local/?surface=today',CEP_PRODUCT_DESTINATION_REGISTRY)")
    imports[bare(rel)]='data:text/javascript;base64,'+base64.b64encode(src.encode()).decode()
index=(DIST/'index.html').read_text(encoding='utf-8')
for css in ['foundation/donor.css','foundation/extensions.css','foundation/global/tokens/scale.css']:
    index=index.replace(f'<link rel="stylesheet" href="{css}">','<style>'+(DIST/css).read_text(encoding='utf-8')+'</style>')
index=re.sub(r'<script type="module" src="main\.js"></script>','',index)
def sha256(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
records=[]
def probe(page):
    return page.evaluate(r"""() => {
      const text=(document.body?.innerText||'').replace(/\s+/g,' ').trim();
      const buttons=[...document.querySelectorAll('[data-today-action]')].map(n=>({action:n.getAttribute('data-today-action'),itemId:n.getAttribute('data-item-id'),disabled:!!n.disabled,label:(n.textContent||'').trim()}));
      const providers=[...document.querySelectorAll('.today-provider-row')].map(n=>({state:n.getAttribute('data-state'),text:(n.textContent||'').replace(/\s+/g,' ').trim()}));
      const active=document.activeElement;
      return {consumer:globalThis.CEPFoundation?.consumer||null,buttons,providers,projectionState:document.querySelector('#todayWorkbench')?.getAttribute('data-projection-state')||null,
       flags:{balanced6CurrentLooking:/SQL Injection|EVD-0042|RUN-0048|7\/10/.test(text),localAcceptance:text.includes('LOCAL_ACCEPTANCE_PROJECTION_ONLY'),resumeEnabled:buttons.some(x=>x.action==='resume'&&!x.disabled),whyEnabled:buttons.some(x=>x.action==='why'&&!x.disabled),providerUnavailable:providers.some(x=>x.state==='UNAVAILABLE')},
       focus:{tag:active?.tagName||null,id:active?.id||null,action:active?.getAttribute?.('data-today-action')||null,filter:active?.getAttribute?.('data-filter')||null},
       selectedFilters:[...document.querySelectorAll('[data-today-action=\"filter\"][aria-pressed=\"true\"]')].map(n=>n.getAttribute('data-filter')),
       geometry:{innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyScrollWidth:document.body?.scrollWidth||0},
       regions:{left:!!document.querySelector('#leftPane'),center:!!document.querySelector('#centerPane'),right:!!document.querySelector('#rightPane'),bottom:!!document.querySelector('#bottomShelf'),toolbar:!!document.querySelector('.toolbar')}};
    }""")
def capture(page,name,state,viewport,interaction=None):
    path=SHOTS/name; page.screenshot(path=str(path),full_page=False); records.append({'state':state,'viewport':viewport,'file':name,'bytes':path.stat().st_size,'sha256':sha256(path),'probe':probe(page),'interaction':interaction or {}})
def boot_product(browser,viewport):
    ctx=browser.new_context(viewport=viewport,reduced_motion='reduce'); page=ctx.new_page(); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(index,wait_until='domcontentloaded',timeout=20000)
    page.evaluate("m=>{const s=document.createElement('script');s.type='importmap';s.textContent=JSON.stringify({imports:m});document.head.appendChild(s)}",imports)
    page.evaluate("()=>{const s=document.createElement('script');s.type='module';s.textContent='import \"@cep/main.js\";';document.body.appendChild(s)}")
    page.wait_for_function("globalThis.CEPFoundation?.consumer==='today'",timeout=25000)
    if errors: raise RuntimeError('C3_PRODUCT_RENDER_ERRORS:'+json.dumps(errors))
    return ctx,page
def boot_state(browser,viewport,state):
    ctx=browser.new_context(viewport=viewport,reduced_motion='reduce'); page=ctx.new_page(); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    html='<!doctype html><html lang="en"><head></head><body style="margin:0;background:#020b16"><main id="host" style="min-height:100vh"></main></body></html>'
    page.set_content(html,wait_until='domcontentloaded')
    page.evaluate("m=>{const s=document.createElement('script');s.type='importmap';s.textContent=JSON.stringify({imports:m});document.head.appendChild(s)}",imports)
    if state=='error-retained':
        module="""import {TodayProjectionDomainAdapter} from '@cep/adapters/today/domain.js';import {renderTodayOrchestrationProjection} from '@cep/surfaces/today/presentation.js';let fail=false;const p={id:'current.today.provider',descriptor:()=>({authority:'CURRENT_PROVIDER_BROWSER_EVIDENCE'}),read:()=>{if(fail)throw Error('hidden');return {providerId:'current.today.provider',state:'AVAILABLE_DATA',observedAt:'2026-09-22T05:30:00Z',items:[{id:'ctx-1',kind:'RECENT_CONTEXT',title:'Bound current context'}]}}};const a=new TodayProjectionDomainAdapter({providers:[p]});a.project();fail=true;const projection=a.refresh();renderTodayOrchestrationProjection({host:document.querySelector('#host'),projection,adapter:a,lang:'en'});globalThis.__c3StateReady=true;"""
    else:
        module="""import {TodayProjectionDomainAdapter} from '@cep/adapters/today/domain.js';import {renderTodayOrchestrationProjection} from '@cep/surfaces/today/presentation.js';const ps=[{id:'stale.provider',descriptor:()=>({authority:'CURRENT_PROVIDER_BROWSER_EVIDENCE'}),read:()=>({providerId:'stale.provider',state:'STALE',observedAt:'2026-09-21T08:00:00Z',items:[{id:'ctx-stale',kind:'RECENT_CONTEXT',title:'Stale observed context'}]})},{id:'unavailable.provider',descriptor:()=>({authority:'CURRENT_PROVIDER_BROWSER_EVIDENCE'}),read:()=>({providerId:'unavailable.provider',state:'UNAVAILABLE',observedAt:'2026-09-22T05:20:00Z',reason:'AUTH_UNAVAILABLE',items:[]})}];const a=new TodayProjectionDomainAdapter({providers:ps});const projection=a.project();renderTodayOrchestrationProjection({host:document.querySelector('#host'),projection,adapter:a,lang:'en'});globalThis.__c3StateReady=true;"""
    page.evaluate("code=>{const s=document.createElement('script');s.type='module';s.textContent=code;document.body.appendChild(s)}",module)
    page.wait_for_function('globalThis.__c3StateReady===true',timeout=15000)
    if errors: raise RuntimeError('C3_STATE_RENDER_ERRORS:'+json.dumps(errors))
    return ctx,page
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for vp in ({'width':1440,'height':1000},{'width':1024,'height':900}):
        ctx,page=boot_product(browser,vp)
        page.locator('#todayWorkbench').focus(); page.keyboard.press('Tab'); page.wait_for_timeout(80)
        session_filter=page.locator('[data-today-action="filter"][data-filter="CONTINUE_SESSION"]')
        if session_filter.count(): session_filter.focus(); page.keyboard.press('Enter'); page.wait_for_timeout(80)
        keyboard_ok=page.locator('[data-today-action="filter"][data-filter="CONTINUE_SESSION"]').get_attribute('aria-pressed')=='true' and page.evaluate("document.activeElement?.dataset?.filter==='CONTINUE_SESSION'")
        all_filter=page.locator('[data-today-action="filter"][data-filter="ALL"]')
        if all_filter.count(): all_filter.click(); page.wait_for_timeout(80)
        pointer_ok=all_filter.get_attribute('aria-pressed')=='true' and page.evaluate("document.activeElement?.dataset?.filter==='ALL'")
        refresh=page.locator('#todayRefreshBtn');
        if refresh.count(): refresh.click(); page.wait_for_timeout(80)
        refresh_focus=page.evaluate("document.activeElement?.id==='todayRefreshBtn'")
        interaction={'keyboardFilterFocusRetained':keyboard_ok,'pointerFilterFocusRetained':pointer_ok,'refreshFocusRetained':refresh_focus}
        capture(page,f"today-provider-unbound-{vp['width']}x{vp['height']}.png",'provider-unbound',vp,interaction)
        if vp['width']==1024:
            toggle=page.locator('[data-pane-toggle="right"]').first
            if toggle.count(): toggle.click(); page.wait_for_timeout(100); capture(page,'today-provider-unbound-right-revealed-1024x900.png','provider-unbound-right-revealed',vp)
        ctx.close()
    vp={'width':1440,'height':1000}
    for state in ('stale-unavailable','error-retained'):
        ctx,page=boot_state(browser,vp,state); capture(page,f'today-{state}-1440x1000.png',state,vp); ctx.close()
    browser.close()
receipt={'schemaVersion':1,'classification':'C3_WRITER_LOCAL_CANDIDATE_VISUAL_EVIDENCE__NOT_ACCEPTANCE','mission':'CORR02_C3_TODAY_PROVIDER_EPISTEMIC_CONTINUATION_TRUTH','headAtCapture':head,'treeAtCapture':tree,'productSource':prod,'browserExecutable':'/usr/bin/chromium','viewports':[{'width':1440,'height':1000},{'width':1024,'height':900}],'records':records}
(OUT/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'verdict':'PASS','screenshots':len(records),'productSource':prod,'records':[{'state':r['state'],'viewport':r['viewport'],'sha256':r['sha256'],'probe':r['probe']} for r in records]},indent=2))
