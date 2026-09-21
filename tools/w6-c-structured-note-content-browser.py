#!/usr/bin/env python3
from pathlib import Path
import base64, hashlib, json, posixpath, re, subprocess
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';ASSURANCE=ROOT/'assurance'/'W6_C_BROWSER';ASSURANCE.mkdir(parents=True,exist_ok=True)
HTML='''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>W6 C StructuredNoteContentAdapter Browser Proof</title><style>body{font-family:Arial,sans-serif;margin:0;background:#f6f7f9;color:#101828}.bar{position:sticky;top:0;z-index:10;background:#fff;border-bottom:1px solid #d0d5dd;padding:14px 20px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;padding:18px}.note-card{background:#fff;border:1px solid #d0d5dd;border-radius:12px;padding:14px;min-height:280px;overflow:auto}.proof-meta{padding:10px;margin-bottom:10px;background:#f2f4f7;border-radius:8px}code{direction:ltr;unicode-bidi:isolate}#proofStatus[data-status="PASS"]{color:#067647;font-weight:700}#proofStatus[data-status="FAIL"]{color:#b42318;font-weight:700}@media(max-width:800px){.grid{grid-template-columns:1fr}}</style></head><body><div class="bar"><strong>Wave 6 Lane C · StructuredNoteContentAdapter</strong> · <span id="proofStatus">RUNNING</span></div><main id="w6cRoot" class="grid"></main></body></html>'''
MEMO={};PAT1=re.compile(r"(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.{1,2}/[^'\"]+)['\"]");PAT2=re.compile(r"import\(\s*['\"](\.{1,2}/[^'\"]+)['\"]\s*\)")
def specs(src): return list(dict.fromkeys(PAT1.findall(src)+PAT2.findall(src)))
def resolve(rel,spec): return posixpath.normpath(posixpath.join(posixpath.dirname(rel),spec))
def module_url(rel):
    rel=posixpath.normpath(rel)
    if rel in MEMO:return MEMO[rel]
    src=(DIST/rel).read_text(encoding='utf-8');MEMO[rel]='__RESOLVING__'+rel
    for spec in specs(src):
        dep=resolve(rel,spec)
        if MEMO.get(dep,'').startswith('__RESOLVING__'): raise RuntimeError(f'W6_C_BROWSER_ESM_CYCLE:{rel}->{dep}')
        src=src.replace(spec,module_url(dep))
    url='data:text/javascript;base64,'+base64.b64encode(src.encode()).decode();MEMO[rel]=url;return url
def source_with_urls(rel):
    src=(DIST/rel).read_text(encoding='utf-8')
    for spec in specs(src):src=src.replace(spec,module_url(resolve(rel,spec)))
    return src
def source_identity():
    code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; const x=await canonicalSourceIdentity(new URL('file://' + process.cwd().replaceAll('\\\\','/') + '/')); console.log(JSON.stringify({sha256:x.sha256,files:x.files}))"
    return json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True).strip())
MAIN=source_with_urls('w6-c-structured-note-content-browser.js');errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);context=browser.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce');page=context.new_page();page.set_default_timeout(15000);page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(HTML,wait_until='domcontentloaded');page.add_script_tag(type='module',content=MAIN+'\n// W6-C exact in-memory ESM browser proof');page.wait_for_function("()=>globalThis.W6CStructuredNoteContentBrowserProof?.status==='PASS'||globalThis.W6CStructuredNoteContentBrowserProof?.status==='FAIL'",timeout=20000);proof=page.evaluate('()=>globalThis.W6CStructuredNoteContentBrowserProof')
    if errors: raise RuntimeError('W6_C_BROWSER_PAGE_ERRORS:'+json.dumps(errors,ensure_ascii=False))
    if not proof or proof.get('status')!='PASS': raise RuntimeError('W6_C_BROWSER_PROOF_FAILED:'+json.dumps((proof or {}).get('errors',[]),ensure_ascii=False))
    screenshot=ASSURANCE/'W6_C_STRUCTURED_NOTE_CONTENT_BROWSER.png';page.screenshot(path=str(screenshot),full_page=True);dom=(page.content()+'\n').encode();dom_path=ASSURANCE/'W6_C_STRUCTURED_NOTE_CONTENT_BROWSER_DOM.html';dom_path.write_bytes(dom);context.close();browser.close()
png=screenshot.read_bytes();identity=source_identity();receipt={'schemaVersion':1,'kind':'W6_C_STRUCTURED_NOTE_CONTENT_BROWSER_PROOF','classification':'W6_C_LANE_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE','status':'PASS','sourceCanonicalTreeSha256':identity['sha256'],'canonicalSourceFileCount':identity['files'],'environment':{'engine':'Python Playwright Chromium','executable':'/usr/bin/chromium','transport':'in-memory-built-esm','viewport':{'width':1440,'height':900}},'proof':proof,'pageErrors':errors,'coverage':{'finalStructuredHostRender':True,'edit':True,'selectionClipboardUndo':True,'bidiTechnicalToken':True,'hideReopenIdentity':True,'twoNoteIsolation':True,'windowGeometryPinContentIsolation':True,'staleBindingContentPreservation':True},'artifacts':{'screenshot':{'path':'assurance/W6_C_BROWSER/W6_C_STRUCTURED_NOTE_CONTENT_BROWSER.png','bytes':len(png),'sha256':hashlib.sha256(png).hexdigest()},'dom':{'path':'assurance/W6_C_BROWSER/W6_C_STRUCTURED_NOTE_CONTENT_BROWSER_DOM.html','bytes':len(dom),'sha256':hashlib.sha256(dom).hexdigest()}}}
(ASSURANCE/'W6_C_BROWSER_PROOF.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({'status':'PASS','steps':len(proof.get('steps',[])),'screenshotBytes':len(png),'sourceCanonicalTreeSha256':identity['sha256']},indent=2))
