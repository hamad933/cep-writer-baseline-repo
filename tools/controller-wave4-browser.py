from pathlib import Path
import re, base64, posixpath, json, hashlib, subprocess
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'; ASSURANCE=ROOT/'assurance'; ASSURANCE.mkdir(exist_ok=True)
MEMO={}
PAT1=re.compile(r"(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.{1,2}/[^'\"]+)['\"]")
PAT2=re.compile(r"import\(\s*['\"](\.{1,2}/[^'\"]+)['\"]\s*\)")
def specs(src): return list(dict.fromkeys(PAT1.findall(src)+PAT2.findall(src)))
def resolve(rel,spec): return posixpath.normpath(posixpath.join(posixpath.dirname(rel),spec))
def module_url(rel):
    rel=posixpath.normpath(rel)
    if rel in MEMO:return MEMO[rel]
    src=(DIST/rel).read_text()
    for spec in specs(src): src=src.replace(spec,module_url(resolve(rel,spec)))
    url='data:text/javascript;base64,'+base64.b64encode(src.encode()).decode();MEMO[rel]=url;return url
def source_with_urls(rel):
    src=(DIST/rel).read_text()
    for spec in specs(src):src=src.replace(spec,module_url(resolve(rel,spec)))
    return src
def html_in_memory():
    html=(DIST/'index.html').read_text()
    for href,name in [('foundation/donor.css','donor'),('foundation/extensions.css','extensions'),('foundation/global/tokens/scale.css','scale')]:
        css=(DIST/href).read_text() if (DIST/href).exists() else ''
        html=re.sub(rf'<link rel="stylesheet" href="{re.escape(href)}">',f'<style data-browser-inline="{name}">{css}</style>',html,flags=re.I)
    return re.sub(r'<script type="module" src="main\.js"></script>','',html,flags=re.I)
HTML=html_in_memory(); MAIN=source_with_urls('main.js')
def source_identity():
    code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; const x=await canonicalSourceIdentity(new URL('file://' + process.cwd().replaceAll('\\\\','/') + '/')); console.log(JSON.stringify({sha256:x.sha256,files:x.files}))"
    out=subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True)
    return json.loads(out.strip())
def assert_(cond,msg):
    if not cond: raise AssertionError(msg)
def load(page,surface):
    page.set_content(HTML,wait_until='domcontentloaded')
    page.evaluate("s=>{try{delete globalThis.CEPFoundation}catch{};try{delete globalThis.CEPBlueprint}catch{};history.replaceState({},'',`about:blank?surface=${encodeURIComponent(s)}`)}",surface)
    page.add_script_tag(type='module',content=MAIN+f"\n// controller-wave4:{surface}")
    page.wait_for_function("s=>window.CEPFoundation?.consumer===s&&window.CEPFoundation?.wave4Assembly",arg=surface,timeout=6000)

flows=[]
def run(browser,id,owner,oracle,fn):
    ctx=browser.new_context(viewport={'width':1440,'height':980},reduced_motion='reduce');page=ctx.new_page();page.set_default_timeout(4000);errs=[];page.on('pageerror',lambda e:errs.append(str(e)));print('START',id,flush=True)
    try:
        evidence=fn(page);assert_(not errs,'page errors: '+' | '.join(errs));flows.append({'id':id,'owner':owner,'oracle':oracle,'status':'PASS','evidence':evidence});print('PASS',id,flush=True)
    except Exception as e:
        flows.append({'id':id,'owner':owner,'oracle':oracle,'status':'FAIL','error':str(e),'pageErrors':errs});print('FAIL',id,str(e),flush=True)
    finally:ctx.close()

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    def f1(page):
        load(page,'library');page.evaluate("()=>CEPBlueprint.setMode('edit')")
        target=page.evaluate("""()=>{const s=CEPFoundation.structured.snapshot();let found=null;const walk=bs=>{for(const b of bs){if(!found&&['paragraph','h2','h3','quote','callout'].includes(b.type))found=b;if(b.children)walk(b.children)}};walk(s.blocks);return found&&{id:found.id,type:found.type}}""")
        assert_(target,'no splittable block')
        loc=page.locator(f'[data-editor-surface="main"] [data-block-id="{target["id"]}"] .blockbody[data-editable-block]').first
        loc.focus();page.evaluate("el=>{const r=document.createRange();r.selectNodeContents(el);r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r)}",loc.element_handle())
        before=page.evaluate("()=>({blocks:(()=>{let n=0;CEPFoundation.structured.treeKernel.walk(CEPFoundation.structured.snapshot().blocks,()=>n++);return n})(),history:CEPFoundation.structured.transactionDescriptor().historyLength,receipts:CEPFoundation.wave4Assembly.structuredInput.receipts.length})")
        page.keyboard.press('Enter')
        after=page.evaluate("()=>({blocks:(()=>{let n=0;CEPFoundation.structured.treeKernel.walk(CEPFoundation.structured.snapshot().blocks,()=>n++);return n})(),history:CEPFoundation.structured.transactionDescriptor().historyLength,receipt:CEPFoundation.wave4Assembly.structuredInput.receipts.at(-1),classification:CEPFoundation.classification})")
        assert_(after['blocks']==before['blocks']+1,f'block delta {before}/{after}')
        assert_(after['history']==before['history']+1,f'history delta {before}/{after}')
        assert_(after['receipt'] and after['receipt']['owner']=='StructuredInputKeymapOwner' and after['receipt']['kind']=='enter',f'input owner receipt {after}')
        return {'target':target,'before':before,'after':after}
    run(browser,'wave4.structured-keyboard-owner','StructuredInputKeymapOwner','real Library keydown produces exactly one canonical history frame and owner receipt',f1)

    def f2(page):
        load(page,'learn');inv=page.locator('button[data-foundation-command="foundation.settings"]').first;inv.click();host=page.locator('[data-wave4-settings="SettingsCenterOwner"] [data-settings-center-owner="SettingsCenterOwner"]');assert_(host.count()==1,'settings owner host missing');structured=page.evaluate("()=>({owner:CEPFoundation.wave4Assembly.settings.owner,editorGroup:document.querySelector('[data-settings-group=\"editor-shortcuts\"]')!==null,top:CEPFoundation.transientOwner.top()?.id||null})");assert_(structured['editorGroup'] and structured['top']=='global.settings-center',f'structured settings {structured}');page.keyboard.press('Escape');page.wait_for_timeout(50);assert_(page.locator('[data-wave4-settings="SettingsCenterOwner"]').count()==0,'settings DOM ghost after Escape');load(page,'visualize');page.locator('button[data-foundation-command="foundation.settings"]').first.click();non=page.evaluate("()=>({editorGroup:document.querySelector('[data-settings-group=\"editor-shortcuts\"]')!==null,family:CEPFoundation.family,owner:CEPFoundation.wave4Assembly.settings.owner})");assert_(not non['editorGroup'] and non['family']=='spatial',f'non-structured leakage {non}');return {'structured':structured,'nonStructured':non,'escapeRemovedDom':True}
    run(browser,'wave4.settings-applicability-and-escape','SettingsCenterOwner + TransientFocusOwner','Structured-only settings apply only to Structured and Escape leaves no ghost transient/DOM',f2)

    def f3(page):
        load(page,'library')
        evidence=page.evaluate("""()=>{const a=CEPFoundation.wave4Assembly,d=a.resolveDirection({fallbackDirection:'bogus',content:'',surface:'structured'}),san=a.sanitizeRichInline('<strong onclick="x()">ok</strong><script>alert(1)</script>');const doc=CEPFoundation.structured.snapshot();let target=null;CEPFoundation.structured.treeKernel.walk(doc.blocks,b=>{if(!target&&(b.children?.length||0)>0)target=b.id});if(!target)return{d,san,target:null};const desc=a.describeStructuredAction('block.delete',{mode:'edit',blockId:target,surface:'block-menu'});const before=CEPFoundation.structured.transactionDescriptor().historyLength;const req=a.confirmStructuredAction('block.delete',{mode:'edit',blockId:target,surface:'block-menu'});return{d,san,target,desc,request:req,before,pending:a.confirmationHost.snapshot().pendingCount}}""")
        assert_(evidence['d']['source']=='POLICY_FALLBACK','direction provenance');assert_(evidence['san']['safe'] and '<script' not in evidence['san']['html'].lower() and 'onclick' not in evidence['san']['html'].lower(),'sanitizer');assert_(evidence['target'] and evidence['desc']['confirmation']['required'],'no subtree confirmation target');assert_(evidence['request']['code']=='CONFIRMATION_PRESENTED' and evidence['pending']==1,'confirmation not presented');page.locator('[data-confirm-action="block.delete"]').click();after=page.evaluate("()=>({history:CEPFoundation.structured.transactionDescriptor().historyLength,pending:CEPFoundation.wave4Assembly.confirmationHost.snapshot().pendingCount,receipts:CEPFoundation.wave4Assembly.confirmationHost.receipts.slice(-2)})");assert_(after['history']==evidence['before']+1 and after['pending']==0,f'confirmation execute {after}');return {'before':evidence,'after':after}
    run(browser,'wave4.direction-rich-confirmation-convergence','InputDirectionResolver + StructuredRichContentOwner + StructuredActionDescriptorOwner + ConfirmationSafetyHost','truthful direction provenance, safe rich sanitization and explicit risk confirmation before one canonical mutation',f3)

    def f4(page):
        load(page,'library');result=page.evaluate("""()=>{const s=CEPFoundation.structured,a=CEPFoundation.wave4Assembly,doc=s.snapshot();let candidate=null;const roots=doc.blocks;for(const b of roots){const v=s.dropTargetOwner.keyboardTarget(b.id,'down');if(v?.ok){candidate={id:b.id,target:v.target};break}}if(!candidate)return{candidate:null};const before=s.transactionDescriptor().historyLength;const beg=a.beginDrag({sourceBlockId:candidate.id,pointerId:7,startX:10,startY:10});const upd=a.updateDrag({clientX:30,clientY:30,target:candidate.target,viewportTop:0,viewportBottom:500});const commit=a.commitDrag({target:candidate.target,transactionLabel:'Controller Wave4 pointer convergence'});return{candidate,before,after:s.transactionDescriptor().historyLength,beg,upd,commit,receipts:s.dragDropOwner.receipts().slice(-3)}}""")
        assert_(result['candidate'],'no movable block');assert_(result['upd']['active'] and result['upd']['validation']['ok'],'drag validation');assert_(result['commit']['ok'] and result['commit']['historyFrameDelta']==1 and result['after']==result['before']+1,f'drag atomicity {result}');return result
    run(browser,'wave4.dragdrop-canonical-route','StructuredDragDropOwner + StructuredDropTargetPolicyOwner','one canonical target policy and exactly one history frame for pointer reorder',f4)

    def f5(page):
        load(page,'runs');page.locator('button[data-foundation-command="OPEN_TERMINAL"]:visible').first.click();ops=page.evaluate("""()=>({session:CEPFoundation.wave4Assembly.operationalSnapshot(),maturity:CEPFoundation.wave4Assembly.snapshot().operationalMaturity,bottomProviders:CEPFoundation.wave3Assembly.bottomOwner.providerDescriptors().map(x=>x.id),runtimeEvents:CEPFoundation.simulation.events.length})""");assert_(ops['session'] and ops['session']['tabs'] and len(ops['session']['tabs'])>=1,'session not attached');assert_(ops['maturity']=='BOUNDED_BELOW_M6_SECOND_REAL_PROVIDER_NOT_PROVEN','false M6');assert_('operational.session-presentation' in ops['bottomProviders'],'session bottom provider absent');epi=page.evaluate("""()=>{const a=CEPFoundation.wave4Assembly;let rejected=null;try{a.validateEpistemic({state:'ERROR',domain:{id:'runs',owner:'RuntimeAdapter',family:'operational'},cause:{code:'RUNS.ERROR'},meaning:{code:'RUNS_ERROR',summary:'runtime error'},copy:{title:'Run error',message:'Runtime failed'},retry:{available:false},canonicalTruth:{owner:'RuntimeAdapter',state:'ERROR',feedbackSourceTruth:{ok:true,status:'SAVED'}}})}catch(e){rejected=String(e.message||e)}return{rejected,maturity:a.snapshot().operationalMaturity}}""");assert_(epi['rejected'] and 'EPISTEMIC_TRUTH_CONFLICT' in epi['rejected'],f'epistemic contradiction passed {epi}');return {'operational':ops,'epistemic':epi}
    run(browser,'wave4.operational-and-epistemic-boundaries','OperationalSessionOwner + EpistemicStateContract','real Runs session attaches below M6 and contradictory epistemic truth is refused',f5)
    browser.close()

identity=source_identity();summary={'total':len(flows),'pass':sum(x['status']=='PASS' for x in flows),'fail':sum(x['status']=='FAIL' for x in flows)}
report={'schemaVersion':1,'kind':'W4_CONTROLLER_CONVERGENCE_BROWSER_PROOF','classification':'CONTROLLER_EXECUTION_EVIDENCE_NOT_OWNER_ACCEPTANCE','sourceCanonicalTreeSha256':identity['sha256'],'canonicalSourceFileCount':identity['files'],'environment':{'engine':'Python Playwright Chromium','executable':'/usr/bin/chromium','transport':'in-memory-built-esm','viewport':'1440x980'},'summary':summary,'flows':flows,'status':'PASS' if summary['fail']==0 and summary['total']==5 else 'FAIL','limits':['Five bounded Wave4 convergence flows; not final Surface certification','OperationalSessionOwner remains explicitly below M6 until a second genuine provider exists']}
(ASSURANCE/'W4_CONTROLLER_CONVERGENCE_BROWSER_PROOF.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'summary':summary,'source':identity,'failures':[x for x in flows if x['status']=='FAIL']},indent=2,ensure_ascii=False))
raise SystemExit(1 if summary['fail'] else 0)
