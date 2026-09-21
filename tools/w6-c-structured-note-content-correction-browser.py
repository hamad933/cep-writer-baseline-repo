#!/usr/bin/env python3
from pathlib import Path
import base64, hashlib, json, posixpath, re, subprocess
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';ASSURANCE=ROOT/'assurance'/'W6_C_CORRECTION_BROWSER';ASSURANCE.mkdir(parents=True,exist_ok=True)
HTML='''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>W6 C Bounded Correction Browser Proof</title><style>body{font-family:Arial,sans-serif;background:#f6f7f9;color:#101828;margin:0}.bar{background:#fff;border-bottom:1px solid #ddd;padding:14px}.root{padding:18px}.root section{background:#fff;border:1px solid #ddd;border-radius:10px;padding:12px}#proofStatus[data-status="PASS"]{color:#067647;font-weight:700}#proofStatus[data-status="FAIL"]{color:#b42318;font-weight:700}</style></head><body><div class="bar">W6 C correction · <span id="proofStatus">RUNNING</span></div><main id="w6cCorrectionRoot" class="root"></main></body></html>'''
MEMO={};PAT1=re.compile(r"(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.{1,2}/[^'\"]+)['\"]");PAT2=re.compile(r"import\(\s*['\"](\.{1,2}/[^'\"]+)['\"]\s*\)")
def specs(src):return list(dict.fromkeys(PAT1.findall(src)+PAT2.findall(src)))
def resolve(rel,spec):return posixpath.normpath(posixpath.join(posixpath.dirname(rel),spec))
def module_url(rel):
    rel=posixpath.normpath(rel)
    if rel in MEMO:return MEMO[rel]
    src=(DIST/rel).read_text(encoding='utf-8');MEMO[rel]='__RESOLVING__'+rel
    for spec in specs(src):
        dep=resolve(rel,spec)
        if MEMO.get(dep,'').startswith('__RESOLVING__'):raise RuntimeError(f'W6_C_CORRECTION_BROWSER_ESM_CYCLE:{rel}->{dep}')
        src=src.replace(spec,module_url(dep))
    url='data:text/javascript;base64,'+base64.b64encode(src.encode()).decode();MEMO[rel]=url;return url
def source_with_urls(rel):
    src=(DIST/rel).read_text(encoding='utf-8')
    for spec in specs(src):src=src.replace(spec,module_url(resolve(rel,spec)))
    return src
def source_identity():
    code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; const x=await canonicalSourceIdentity(new URL('file://' + process.cwd().replaceAll('\\\\','/') + '/')); console.log(JSON.stringify({sha256:x.sha256,files:x.files}))"
    return json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True).strip())
MAIN=source_with_urls('w6-c-structured-note-content-correction-browser.js');errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);context=browser.new_context(viewport={'width':1280,'height':800},reduced_motion='reduce');page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.set_content(HTML,wait_until='domcontentloaded');page.add_script_tag(type='module',content=MAIN);page.wait_for_function("()=>globalThis.W6CStructuredNoteContentCorrectionBrowserProof?.status==='PASS'||globalThis.W6CStructuredNoteContentCorrectionBrowserProof?.status==='FAIL'",timeout=20000);proof=page.evaluate('()=>globalThis.W6CStructuredNoteContentCorrectionBrowserProof')
    if errors:raise RuntimeError('W6_C_CORRECTION_BROWSER_PAGE_ERRORS:'+json.dumps(errors))
    if not proof or proof.get('status')!='PASS':raise RuntimeError('W6_C_CORRECTION_BROWSER_FAILED:'+json.dumps((proof or {}).get('errors',[])))
    shot=ASSURANCE/'W6_C_STRUCTURED_NOTE_CONTENT_CORRECTION_BROWSER.png';page.screenshot(path=str(shot),full_page=True);context.close();browser.close()
identity=source_identity();png=shot.read_bytes();receipt={'schemaVersion':1,'kind':'W6_C_STRUCTURED_NOTE_CONTENT_BOUNDED_CORRECTION_BROWSER_PROOF','classification':'W6_C_CORRECTION_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE','status':'PASS','sourceCanonicalTreeSha256':identity['sha256'],'canonicalSourceFileCount':identity['files'],'proof':proof,'pageErrors':errors,'screenshot':{'path':'assurance/W6_C_CORRECTION_BROWSER/W6_C_STRUCTURED_NOTE_CONTENT_CORRECTION_BROWSER.png','bytes':len(png),'sha256':hashlib.sha256(png).hexdigest()}}
(ASSURANCE/'W6_C_CORRECTION_BROWSER_PROOF.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({'status':'PASS','steps':len(proof['steps']),'sourceCanonicalTreeSha256':identity['sha256']},indent=2))
