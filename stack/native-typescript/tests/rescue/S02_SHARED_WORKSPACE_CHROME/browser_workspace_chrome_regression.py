from pathlib import Path
import json, os, re, shutil, subprocess, tempfile, hashlib
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[5]
EVIDENCE = ROOT / "assurance/POST_M0_RESCUE/S02_SHARED_WORKSPACE_CHROME"
EVIDENCE.mkdir(parents=True, exist_ok=True)

def build_runtime():
    temp = Path(tempfile.mkdtemp(prefix="cep-s02-runtime-"))
    runtime = temp / "dist"
    shutil.copytree(ROOT / "dist", runtime)
    script = f"import {{buildRuntime}} from {json.dumps((ROOT/'tools/build-runtime.mjs').as_uri())}; console.log(JSON.stringify(buildRuntime({{sourceRoot:{json.dumps(str(ROOT/'stack/native-typescript'))},destinationRoot:{json.dumps(str(runtime))}}})));"
    cp = subprocess.run(["node","--input-type=module","-e",script],cwd=ROOT,text=True,capture_output=True,check=True)
    return temp, runtime, cp.stdout.strip()

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def main():
    temp, runtime, build_receipt = build_runtime()
    html=(runtime/'index.html').read_text(encoding='utf-8')
    html=re.sub(r'<script type="module" src="main\.js"></script>','',html,flags=re.I).replace('<head>','<head><base href="http://cep.local/">',1)
    results=[]; screenshots=[]
    try:
      with sync_playwright() as p:
        browser=p.chromium.launch(headless=True, executable_path=os.environ.get('CEP_BROWSER_EXECUTABLE','/usr/bin/chromium'), args=['--no-sandbox'])
        for surface in ['learn','visualize','runs']:
          context=browser.new_context(viewport={'width':1440,'height':1000}, reduced_motion='reduce')
          page=context.new_page(); errors=[]
          page.on('pageerror',lambda e: errors.append('page:'+str(e)))
          page.on('console',lambda m: errors.append('console:'+m.text) if m.type=='error' and 'ERR_CONNECTION_REFUSED' not in m.text else None)
          def handler(route):
            relative=route.request.url.split('http://cep.local/',1)[-1].split('?',1)[0] or 'index.html'
            f=runtime/relative
            if not f.exists(): route.fulfill(status=404,body='not found'); return
            ctype={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'}.get(f.suffix,'application/octet-stream')
            route.fulfill(status=200,body=f.read_bytes(),content_type=ctype)
          page.route('http://cep.local/**',handler)
          page.set_content(html,wait_until='domcontentloaded')
          page.evaluate("s=>history.replaceState({},'',`about:blank?surface=${s}`)",surface)
          page.add_script_tag(type='module',url='http://cep.local/main.js')
          page.wait_for_function("s=>globalThis.CEPFoundation?.consumer===s", arg=surface, timeout=20000)

          initial=page.evaluate("""()=>{const p=CEPFoundation.api.inspect().panes; const left=document.querySelector('#leftPane'),right=document.querySelector('#rightPane'); return {band:p.responsiveBand,left:p.left,right:p.right,roles:{leftInternal:left.querySelector('[data-pane-toggle=left]')?.dataset.paneControlRole,leftExternal:document.querySelector('#leftLocalReveal')?.dataset.paneControlRole,rightInternal:right.querySelector('[data-pane-toggle=right]')?.dataset.paneControlRole,rightExternal:document.querySelector('#rightLocalReveal')?.dataset.paneControlRole},rightAria:{min:document.querySelector('#rightResizer')?.getAttribute('aria-valuemin'),max:document.querySelector('#rightResizer')?.getAttribute('aria-valuemax'),now:document.querySelector('#rightResizer')?.getAttribute('aria-valuenow')}}}""")
          assert initial['band']=='wide' and initial['left']['effectiveState']=='open' and initial['right']['effectiveState']=='open'
          assert set(initial['roles'].values())=={'collapse','reveal-toggle'}
          assert int(initial['rightAria']['max'])==round(initial['right']['resizeLimits']['max'])
          assert int(initial['rightAria']['now'])==round(initial['right']['effectiveWidth'])
          if surface=='learn':
            f=EVIDENCE/'S02_LEARN_1440x1000.png'; page.screenshot(path=f); screenshots.append({'surface':surface,'viewport':'1440x1000','file':f.name,'sha256':sha(f)})

          # Keyboard collapse from separator must return focus to an external reveal/toggle, never hidden pane chrome.
          page.locator('#rightResizer').focus(); page.locator('#rightResizer').press('Home')
          key=page.evaluate("""()=>({pane:CEPFoundation.api.inspect().panes.right,active:document.activeElement?.id||'',role:document.activeElement?.dataset?.paneControlRole||''})""")
          assert key['pane']['effectiveState']=='collapsed' and key['role']=='reveal-toggle'
          page.locator('#rightLocalReveal').click();
          assert page.evaluate("()=>CEPFoundation.api.inspect().panes.right.effectiveState")=='open'

          # Responsive suppression must preserve preference and return focus if breakpoint collapses focused pane.
          page.locator('#rightPane').evaluate("el=>{el.tabIndex=-1;el.focus()}")
          page.set_viewport_size({'width':1024,'height':900}); page.wait_for_timeout(80)
          medium=page.evaluate("""()=>({p:CEPFoundation.api.inspect().panes,rightFocusRole:document.activeElement?.dataset?.paneControlRole||'',externalDisabled:document.querySelector('#rightLocalReveal')?.getAttribute('aria-disabled')})""")
          assert medium['p']['responsiveBand']=='medium' and medium['p']['right']['effectiveState']=='collapsed' and medium['p']['right']['preferredState']=='open'
          assert medium['rightFocusRole']=='reveal-toggle'
          page.locator('#rightLocalReveal').click(); page.wait_for_timeout(20)
          opened=page.evaluate("()=>CEPFoundation.api.inspect().panes.right")
          assert opened['effectiveState']=='open' and opened['mode']=='overlay' and opened['preferredState']=='open'
          if surface=='learn':
            f=EVIDENCE/'S02_LEARN_1024x900_RIGHT_OVERLAY.png'; page.screenshot(path=f); screenshots.append({'surface':surface,'viewport':'1024x900','file':f.name,'sha256':sha(f)})

          # Internal pane control is collapse-only. It must not rewrite responsive preferred truth.
          internal=page.locator('#rightPane [data-pane-toggle=right]').first
          internal.focus(); internal.click(); page.wait_for_timeout(20)
          collapsed=page.evaluate("""()=>({pane:CEPFoundation.api.inspect().panes.right,activeRole:document.activeElement?.dataset?.paneControlRole||''})""")
          assert collapsed['pane']['effectiveState']=='collapsed' and collapsed['pane']['preferredState']=='open' and collapsed['activeRole']=='reveal-toggle'

          # Focus mode suppresses pane controls truthfully; pane preferences survive the round trip.
          before_focus=page.evaluate("()=>CEPFoundation.api.inspect().panes")
          page.evaluate("()=>CEPFoundation.api.toggleFocus()")
          during=page.evaluate("""()=>({p:CEPFoundation.api.inspect().panes,disabled:[...document.querySelectorAll('[data-pane-toggle]')].every(b=>b.getAttribute('aria-disabled')==='true')})""")
          assert during['p']['focusMode'] and during['p']['left']['effectiveState']=='collapsed' and during['p']['right']['effectiveState']=='collapsed' and during['disabled']
          page.evaluate("()=>CEPFoundation.api.toggleFocus()")
          after_focus=page.evaluate("()=>CEPFoundation.api.inspect().panes")
          assert not after_focus['focusMode'] and after_focus['left']['preferredState']==before_focus['left']['preferredState'] and after_focus['right']['preferredState']==before_focus['right']['preferredState']
          assert errors==[], errors
          results.append({'surface':surface,'status':'PASS','initial':initial,'keyboardCollapse':key,'medium':medium,'responsiveInternalCollapse':collapsed,'focusMode':during})
          context.close()
        browser.close()
    finally:
      shutil.rmtree(temp,ignore_errors=True)
    receipt={'schemaVersion':1,'mission':'MISSION_S02_SHARED_WORKSPACE_PANES_TOOLBAR_CONTEXT','classification':'STAGE_A_SPECIALIST_DIRECT_BROWSER_EVIDENCE__CANDIDATE_ONLY__NO_SELF_PROMOTION','runtimeBuild':build_receipt,'summary':{'total':len(results),'pass':sum(r['status']=='PASS' for r in results),'fail':sum(r['status']!='PASS' for r in results)},'results':results,'screenshots':screenshots}
    (EVIDENCE/'S02_BROWSER_WORKSPACE_CHROME_PROOF.json').write_text(json.dumps(receipt,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print(json.dumps(receipt['summary']))
    if receipt['summary']['fail']: raise SystemExit(1)

if __name__=='__main__': main()
