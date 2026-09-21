from pathlib import Path
import re, base64, posixpath, json, subprocess
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]; DIST=ROOT/'dist'; ASSURANCE=ROOT/'assurance'; ASSURANCE.mkdir(exist_ok=True)
MEMO={}; PAT1=re.compile(r"(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.{1,2}/[^'\"]+)['\"]"); PAT2=re.compile(r"import\(\s*['\"](\.{1,2}/[^'\"]+)['\"]\s*\)")
def specs(src): return list(dict.fromkeys(PAT1.findall(src)+PAT2.findall(src)))
def resolve(rel,spec): return posixpath.normpath(posixpath.join(posixpath.dirname(rel),spec))
def module_url(rel):
    rel=posixpath.normpath(rel)
    if rel in MEMO:return MEMO[rel]
    src=(DIST/rel).read_text()
    for spec in specs(src):src=src.replace(spec,module_url(resolve(rel,spec)))
    url='data:text/javascript;base64,'+base64.b64encode(src.encode()).decode();MEMO[rel]=url;return url
def source_with_urls(rel):
    src=(DIST/rel).read_text()
    for spec in specs(src):src=src.replace(spec,module_url(resolve(rel,spec)))
    return src
def source_identity():
    code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; const x=await canonicalSourceIdentity(new URL('file://' + process.cwd().replaceAll('\\\\','/') + '/')); console.log(JSON.stringify({sha256:x.sha256,files:x.files}))"
    return json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True).strip())
def assert_(condition,message):
    if not condition: raise AssertionError(message)
HTML='''<!doctype html><html><body><button id="outsideFocus">Outside focus sentinel</button><div id="writerEditor" contenteditable="true">Writer editor sentinel</div><main id="descriptorHarness"></main></body></html>'''
SCRIPT=source_with_urls('w5-b-structured-navigation-browser-harness.js')
flows=[]
def run(browser,id,oracle,fn):
    ctx=browser.new_context(viewport={'width':1200,'height':800},reduced_motion='reduce');page=ctx.new_page();errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
    try:
        page.set_content(HTML,wait_until='domcontentloaded');page.add_script_tag(type='module',content=SCRIPT);page.wait_for_function("()=>window.CEPW5BNavigationHarness?.owners?.library");evidence=fn(page);assert_(not errs,'page errors: '+' | '.join(errs));flows.append({'id':id,'status':'PASS','oracle':oracle,'evidence':evidence})
    except Exception as e: flows.append({'id':id,'status':'FAIL','oracle':oracle,'error':str(e),'pageErrors':errs})
    finally:ctx.close()
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    def f1(page):
        data=page.evaluate("""()=>{const h=CEPW5BNavigationHarness,l=h.owners.library.outline(),n=h.owners.learn.outline();return{library:{count:l.count,ids:l.entries.map(x=>x.target.blockId),owner:l.owner},learn:{count:n.count,ids:n.entries.map(x=>x.target.blockId),owner:n.owner},domIds:[...document.querySelectorAll('[data-canonical-block]')].slice(0,3).map(x=>x.id)}}""")
        assert_(data['library']['owner']=='StructuredNavigationDescriptorOwner' and data['learn']['owner']=='StructuredNavigationDescriptorOwner','owner mismatch');assert_('blk-d05-h1' in data['library']['ids'] and 'learn-h1' in data['learn']['ids'],'real consumer headings missing');assert_(all(x.startswith('dom-outline-') for x in data['domIds']),'harness DOM identities missing');return data
    run(browser,'w5b.browser.real-library-learn-outline','thin presentation harness renders both real Structured consumer descriptors while DOM ids remain presentation-only',f1)
    def f2(page):
        page.locator('#outsideFocus').focus();data=page.evaluate("""()=>{const h=CEPW5BNavigationHarness,before=document.activeElement?.id,d=h.inspect('library','blk-d05-p1'),after=document.activeElement?.id;return{before,after,descriptor:d,selection:h.consumers.library.selection.descriptor(),scrollCalls:h.state.scrollCalls}}""")
        assert_(data['before']=='outsideFocus' and data['after']=='outsideFocus','descriptor captured focus');assert_(data['descriptor']['behavior']['activatesEditSelection'] is False and data['descriptor']['behavior']['capturesWriterFocus'] is False,'descriptor behavior false');assert_(data['selection']['count']==0,'read inspection activated edit selection');assert_(data['scrollCalls']==0,'read inspection caused DOM scroll');return {'focusBefore':data['before'],'focusAfter':data['after'],'selectionCount':data['selection']['count'],'scrollCalls':data['scrollCalls'],'target':data['descriptor']['target']}
    run(browser,'w5b.browser.read-inspection-side-effect-free','read inspection derivation does not focus Writer/editor, activate selection, or scroll DOM',f2)
    def f3(page):
        data=page.evaluate("""()=>{const h=CEPW5BNavigationHarness,q=h.owners.library.quickJump(),item=q.items.find(x=>x.target.blockId==='blk-d05-t2-n1'),button=document.querySelector('[data-quick-canonical="blk-d05-t2-n1"]');button?.click();return{target:item?.target,request:h.state.lastQuickJumpRequest,buttonDomId:button?.id,scrollCalls:h.state.scrollCalls,q:{domIdentityCanonical:q.domIdentityCanonical,performsDomScroll:q.performsDomScroll}}}""")
        assert_(data['target']['blockId']=='blk-d05-t2-n1' and data['target']['documentId']=='KU-D05-0021','canonical quick jump identity false');assert_(data['buttonDomId']!='blk-d05-t2-n1','DOM id accidentally canonical');assert_(data['request']['target']==data['target'],'presentation request did not preserve canonical target');assert_(data['scrollCalls']==0 and data['q']['performsDomScroll'] is False,'Lane B owned DOM scroll');return data
    run(browser,'w5b.browser.quick-jump-canonical-request-no-scroll','quick-jump uses canonical document/block target and emits no DOM-scroll ownership',f3)
    browser.close()
identity=source_identity();summary={'total':len(flows),'pass':sum(x['status']=='PASS' for x in flows),'fail':sum(x['status']=='FAIL' for x in flows)};report={'schemaVersion':1,'kind':'W5_B_STRUCTURED_NAVIGATION_BROWSER_PROOF','classification':'LANE_B_THIN_PRESENTATION_HARNESS_NOT_FINAL_INTEGRATION','sourceCanonicalTreeSha256':identity['sha256'],'canonicalSourceFileCount':identity['files'],'environment':{'engine':'Python Playwright Chromium','executable':'/usr/bin/chromium','transport':'in-memory-built-esm','sharedIndexModified':False,'sharedCssModified':False},'summary':summary,'flows':flows,'status':'PASS' if summary['fail']==0 and summary['total']==3 else 'FAIL','limits':['Thin Lane-owned descriptor presentation harness only. Final transient lifecycle and DOM scrolling remain Controller integration responsibilities.']};(ASSURANCE/'W5_B_STRUCTURED_NAVIGATION_BROWSER_PROOF.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n');print(json.dumps({'summary':summary,'source':identity,'failures':[x for x in flows if x['status']=='FAIL']},indent=2,ensure_ascii=False));raise SystemExit(1 if summary['fail'] else 0)
