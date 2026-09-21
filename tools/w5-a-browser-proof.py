#!/usr/bin/env python3
from pathlib import Path
import base64, hashlib, json, posixpath, re, subprocess
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
ASSURANCE=ROOT/'assurance'/'W5_A_BROWSER'
ASSURANCE.mkdir(parents=True,exist_ok=True)

HTML='''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>W5 A StructuredSurfaceHost Browser Proof</title><style>body{font-family:Arial,sans-serif;margin:0;background:#f6f7f9;color:#101828}.bar{position:sticky;top:0;background:#fff;border-bottom:1px solid #d0d5dd;padding:14px 20px;z-index:2}.bar strong{display:block;font-size:18px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:18px}.panel{background:#fff;border:1px solid #d0d5dd;border-radius:12px;padding:16px;min-width:0}.panel h2{margin-top:0}.structured-block{border:1px solid #eaecf0;border-radius:8px;padding:8px;background:#fff}.structured-block.is-selected{outline:2px solid #667085}.structured-block-content{min-height:20px}.structured-children{border-inline-start:2px solid #eaecf0;padding-inline-start:8px}.meta{font-size:12px;color:#475467;margin-bottom:10px}#proofStatus[data-status="PASS"]{color:#067647;font-weight:700}#proofStatus[data-status="FAIL"]{color:#b42318;font-weight:700}</style></head><body><div class="bar"><strong>Wave 5 Lane A · StructuredSurfaceHost</strong><span id="proofStatus">RUNNING</span></div><main class="grid"><section class="panel"><h2>Library consumer</h2><div class="meta">Canonical document KU-D05-0021</div><div id="librarySurface"></div></section><section class="panel"><h2>Learn consumer</h2><div class="meta">Donor-free Learn structured document</div><div id="learnSurface"></div></section></main><script id="w5aBrowserProof" type="application/json"></script></body></html>'''
(DIST/'w5-a-browser.html').write_text(HTML,encoding='utf-8')

MEMO={}
PAT1=re.compile(r"(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.{1,2}/[^'\"]+)['\"]")
PAT2=re.compile(r"import\(\s*['\"](\.{1,2}/[^'\"]+)['\"]\s*\)")
def specs(src): return list(dict.fromkeys(PAT1.findall(src)+PAT2.findall(src)))
def resolve(rel,spec): return posixpath.normpath(posixpath.join(posixpath.dirname(rel),spec))
def module_url(rel):
    rel=posixpath.normpath(rel)
    if rel in MEMO:return MEMO[rel]
    src=(DIST/rel).read_text(encoding='utf-8')
    # Reserve before recursion to make accidental cycles explicit rather than silently loop.
    MEMO[rel]='__RESOLVING__'+rel
    for spec in specs(src):
        dep=resolve(rel,spec)
        if MEMO.get(dep,'').startswith('__RESOLVING__'):
            raise RuntimeError(f'W5_A_BROWSER_ESM_CYCLE:{rel}->{dep}')
        src=src.replace(spec,module_url(dep))
    url='data:text/javascript;base64,'+base64.b64encode(src.encode()).decode()
    MEMO[rel]=url
    return url
def source_with_urls(rel):
    src=(DIST/rel).read_text(encoding='utf-8')
    for spec in specs(src):src=src.replace(spec,module_url(resolve(rel,spec)))
    return src

def source_identity():
    code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; const x=await canonicalSourceIdentity(new URL('file://' + process.cwd().replaceAll('\\\\','/') + '/')); console.log(JSON.stringify({sha256:x.sha256,files:x.files}))"
    out=subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True)
    return json.loads(out.strip())

MAIN=source_with_urls('w5-a-structured-surface-host-browser.js')
errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
    page=context.new_page(); page.set_default_timeout(12000)
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(HTML,wait_until='domcontentloaded')
    page.add_script_tag(type='module',content=MAIN+'\n// W5-A in-memory ESM browser proof')
    page.wait_for_function("()=>globalThis.W5AStructuredSurfaceBrowserProof?.status==='PASS'||globalThis.W5AStructuredSurfaceBrowserProof?.status==='FAIL'",timeout=15000)
    proof=page.evaluate('()=>globalThis.W5AStructuredSurfaceBrowserProof')
    if errors: raise RuntimeError('W5_A_BROWSER_PAGE_ERRORS:'+json.dumps(errors,ensure_ascii=False))
    if not proof or proof.get('status')!='PASS': raise RuntimeError('W5_A_BROWSER_PROOF_FAILED:'+json.dumps((proof or {}).get('errors',[]),ensure_ascii=False))
    screenshot=ASSURANCE/'W5_A_STRUCTURED_SURFACE_HOST.png'; page.screenshot(path=str(screenshot),full_page=True)
    dom=(page.content()+'\n').encode(); dom_path=ASSURANCE/'W5_A_STRUCTURED_SURFACE_HOST_DOM.html'; dom_path.write_bytes(dom)
    context.close(); browser.close()

png=screenshot.read_bytes(); identity=source_identity()
receipt={
  'schemaVersion':1,
  'kind':'W5_A_STRUCTURED_SURFACE_HOST_BROWSER_PROOF',
  'classification':'LANE_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',
  'status':'PASS',
  'sourceCanonicalTreeSha256':identity['sha256'],
  'canonicalSourceFileCount':identity['files'],
  'environment':{'engine':'Python Playwright Chromium','executable':'/usr/bin/chromium','transport':'in-memory-built-esm','viewport':{'width':1440,'height':1000}},
  'proof':proof,
  'pageErrors':errors,
  'artifacts':{
    'screenshot':{'path':'assurance/W5_A_BROWSER/W5_A_STRUCTURED_SURFACE_HOST.png','bytes':len(png),'sha256':hashlib.sha256(png).hexdigest()},
    'dom':{'path':'assurance/W5_A_BROWSER/W5_A_STRUCTURED_SURFACE_HOST_DOM.html','bytes':len(dom),'sha256':hashlib.sha256(dom).hexdigest()}
  }
}
(ASSURANCE/'W5_A_BROWSER_PROOF.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':'PASS','steps':len(proof.get('steps',[])),'executableCases':len((proof.get('executable') or {}).get('cases',[])),'screenshotBytes':len(png),'sourceCanonicalTreeSha256':identity['sha256']},indent=2))
