import os,re,json,time,subprocess,tempfile,urllib.request,websocket,pathlib,posixpath,base64,hashlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/'writer-output/DS01_GLOBAL_DATA_SUFFICIENCY_SEED/visual'
SHOTS=OUT/'screenshots'; SHOTS.mkdir(parents=True,exist_ok=True)
os.environ['NO_PROXY']='127.0.0.1,localhost';os.environ['no_proxy']='127.0.0.1,localhost'
ALL_SURFACES=['today','library','learn','rq','results','evidence','reviews','mastery','portfolio','validation','backup','audit','configuration']
_selected=os.environ.get('CEP_DS01_SURFACES','').strip()
SURFACES=[x for x in _selected.split(',') if x] if _selected else ALL_SURFACES
BATCH=os.environ.get('CEP_DS01_BATCH','all')
VIEWPORTS=[(1440,1000),(1024,900)]
DS01='DS01_GLOBAL_ACCEPTANCE_DATA__DETERMINISTIC__RESETTABLE__NON_PRODUCTION__NON_CANONICAL'
pat1=re.compile(r"(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.{1,2}/[^'\"]+)['\"]");pat2=re.compile(r"import\(\s*['\"](\.{1,2}/[^'\"]+)['\"]\s*\)")
sources={};deps={}
def collect(rel):
 if rel in sources:return
 s=(ROOT/'dist'/rel).read_text();sources[rel]=s; arr=[]
 for sp in dict.fromkeys(pat1.findall(s)+pat2.findall(s)):
  rr=posixpath.normpath(posixpath.join(posixpath.dirname(rel),sp));arr.append((sp,rr));collect(rr)
 deps[rel]=arr
collect('main.js');order=[];seen=set()
def visit(r):
 if r in seen:return
 seen.add(r)
 for _,d in deps[r]:visit(d)
 order.append(r)
visit('main.js');collect('surfaces/results/presentation.js');visit('surfaces/results/presentation.js')
mods=[{'rel':r,'source':sources[r],'deps':deps[r]} for r in order]
xterm_source=(ROOT/'dist/vendor/xterm/xterm.mjs').read_text()
bootstrap="""(async()=>{const mods=__MODS__;const xtermSource=__XTERM__;const ds01=globalThis.__CEP_DS01_GLOBAL_ACCEPTANCE__?.enabled===true;const surface=new URL(location.href).searchParams.get('surface');const xtermUrl=URL.createObjectURL(new Blob([xtermSource],{type:'text/javascript'}));const urls={};for(const m of mods){let s=m.source;for(const [sp,d] of m.deps)s=s.split(sp).join(urls[d]);s=s.split('/vendor/xterm/xterm.mjs').join(xtermUrl);if(ds01&&surface==='learn'&&m.rel==='main.js'){s=s.replace("const learnComposition=consumer==='learn'?createLearnRuntimeComposition():null;","const learnComposition=consumer==='learn'?createLearnRuntimeComposition({source:globalThis.__CEP_DS01_LEARN_SOURCE__,allowTestSource:true}):null;");}urls[m.rel]=URL.createObjectURL(new Blob([s],{type:'text/javascript'}));}globalThis.__DS01_MODULE_URLS__=urls;if(ds01&&surface==='learn'){const mod=await import(urls['fixtures/acceptance-data/ds01-global/index.js']);globalThis.__CEP_DS01_LEARN_SOURCE__=mod.createDs01LearnSource();}await import(urls['main.js']);return {modules:Object.keys(urls).length,consumer:globalThis.CEPFoundation?.consumer||null,xtermInjected:true,learnHarnessInjection:ds01&&surface==='learn'};})()""".replace('__MODS__',json.dumps(mods,ensure_ascii=False,separators=(',',':'))).replace('__XTERM__',json.dumps(xterm_source,ensure_ascii=False))
html=(ROOT/'dist/index.html').read_text(); donor=(ROOT/'dist/foundation/donor.css').read_text(); ext=(ROOT/'dist/foundation/extensions.css').read_text();html=re.sub(r'<link rel="stylesheet" href="foundation/donor\.css">',lambda m:'<style>'+donor+'</style>',html,flags=re.I);html=re.sub(r'<link rel="stylesheet" href="foundation/extensions\.css">',lambda m:'<style>'+ext+'</style>',html,flags=re.I);html=re.sub(r'<script type="module" src="main\.js"></script>','',html,flags=re.I)
PORT=int(os.environ.get('CEP_DS01_CDP_PORT','9241'));proc=subprocess.Popen(['/usr/bin/chromium','--headless=new','--no-sandbox','--disable-gpu',f'--remote-debugging-port={PORT}','--remote-allow-origins=*',f'--user-data-dir={tempfile.mkdtemp(prefix="ds01-cdp-")}','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
class CDP:
 def __init__(self):
  for _ in range(120):
   try:json.load(urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json/version',timeout=.2));break
   except:time.sleep(.05)
  req=urllib.request.Request(f'http://127.0.0.1:{PORT}/json/new?about:blank',method='PUT');target=json.load(urllib.request.urlopen(req,timeout=3));self.target_id=target['id'];self.ws=websocket.create_connection(target['webSocketDebuggerUrl'],timeout=30,origin='http://localhost');self.seq=0;self.events=[]
  for m in ['Page.enable','Runtime.enable','Log.enable']:self.cmd(m)
 def close(self):
  try:self.ws.close()
  except:pass
  try:urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json/close/{self.target_id}',timeout=2).read()
  except:pass
 def cmd(self,m,p=None):
  self.seq+=1;i=self.seq;self.ws.send(json.dumps({'id':i,'method':m,'params':p or {}}))
  while True:
   r=json.loads(self.ws.recv())
   if 'method' in r:self.events.append(r)
   if r.get('id')==i:
    if 'error' in r:raise RuntimeError(r['error'])
    return r.get('result',{})
 def ev(self,e):
  r=self.cmd('Runtime.evaluate',{'expression':e,'returnByValue':True,'awaitPromise':True,'timeout':30000})
  if 'exceptionDetails' in r:raise RuntimeError(str(r['exceptionDetails']))
  return r.get('result',{}).get('value')
 def load(self,surface,w,h,seeded):
  self.cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':False});self.cmd('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
  fid=self.cmd('Page.getFrameTree')['frameTree']['frame']['id'];self.cmd('Page.setDocumentContent',{'frameId':fid,'html':html})
  self.ev("history.replaceState({},'',"+json.dumps('about:blank?surface='+surface)+");true")
  if seeded:self.ev("globalThis.__CEP_DS01_GLOBAL_ACCEPTANCE__={enabled:true,classification:"+json.dumps(DS01)+",source:'DS01_BROWSER_HARNESS'};true")
  try:res=self.ev(bootstrap)
  except Exception as e:return {'bootstrapError':repr(e)}
  end=time.time()+6; c=None
  while time.time()<end:
   try:c=self.ev("globalThis.CEPFoundation?.consumer||null")
   except:pass
   if c==surface:break
   time.sleep(.05)
  return {'bootstrap':res,'consumer':c}
 def click_first(self):
  sel="[data-r6-workbench] .m0-row,[data-r6-workbench] tbody tr,#objectList [data-object],#blockList [data-block-id],.treeitem"
  p=self.ev("(()=>{const e=[...document.querySelectorAll("+json.dumps(sel)+")].find(x=>x.offsetParent!==null);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,tag:e.tagName,cls:e.className}})()")
  if not p:return None
  for t in ['mousePressed','mouseReleased']:self.cmd('Input.dispatchMouseEvent',{'type':t,'x':p['x'],'y':p['y'],'button':'left','clickCount':1})
  time.sleep(.08);return p
 def key_tab_enter(self):
  self.cmd('Input.dispatchKeyEvent',{'type':'rawKeyDown','key':'Tab','code':'Tab','windowsVirtualKeyCode':9});self.cmd('Input.dispatchKeyEvent',{'type':'keyUp','key':'Tab','code':'Tab','windowsVirtualKeyCode':9});time.sleep(.03)
 def shot(self,path):
  data=base64.b64decode(self.cmd('Page.captureScreenshot',{'format':'png','fromSurface':True})['data']);path.write_bytes(data);return {'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}

def source_identity():
 code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; const x=await canonicalSourceIdentity(new URL('file://' + process.cwd().replaceAll('\\\\','/') + '/')); console.log(JSON.stringify({sha256:x.sha256,files:x.files}))"
 return json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True).strip())
def targeted_states(c,surface):
 out=[]
 def snap(state):
  fn=f'{surface}__ds01-{state}__1440x1000.png';meta=c.shot(SHOTS/fn);out.append({'surface':surface,'state':state,'classification':DS01,'sourceIdentity':ident,'path':str((SHOTS/fn).relative_to(ROOT)).replace('\\','/'),**meta})
 if surface=='rq':
  c.ev("""(async()=>{const m=CEPFoundation.m0Composition,a=m.adapter,rows=a.records;if(rows.length<2)return {ok:false,reason:'PAIR_MISSING'};const left=rows[0],right=rows[1];const r=a.compare({left,right,workingAnalysisId:'ds01-rq-visual',scope:['claim','provenance']});if(!r.ok)return r;const mod=await import(globalThis.__DS01_MODULE_URLS__['foundation/analytical/compare-host.js']);let host=document.querySelector('[data-ds01-rq-compare-host]');if(!host){host=document.createElement('section');host.dataset.ds01RqCompareHost='true';host.style.minHeight='480px';const wb=document.querySelector('#foundationStage .m0-workbench');if(wb)wb.replaceChildren(host);else document.querySelector('#foundationStage')?.append(host)}new mod.AnalyticalCompareHost(a.compareOwner,{locale:'ar'}).mount(host,'ds01-rq-visual');host.scrollIntoView({block:'center'});return {ok:true,status:r.status,sessionId:r.sessionId,differences:a.project('ds01-rq-visual')?.differences?.length||0}})()""");time.sleep(.08);snap('rq-compare');return out
 if surface=='results':
  c.ev("""(async()=>{const m=CEPFoundation.m0Composition,mod=await import(globalThis.__DS01_MODULE_URLS__['surfaces/results/presentation.js']);const refs=m.domain.records.map(r=>({resultId:r.resultId,revisionId:r.revisionId,manifestDigest:r.manifestDigest}));mod.renderResultsSurface(document.querySelector('#foundationStage'),m.composition,{dir:'rtl',refs});return {rows:refs.length}})()""");time.sleep(.08);snap('results-replay')
  c.ev("document.querySelector('[data-mode=\"aar\"]')?.click();true");time.sleep(.06);snap('results-aar')
  c.ev("document.querySelector('[data-mode=\"compare\"]')?.click();true");time.sleep(.08);snap('results-compare');return out
 if surface=='evidence':
  c.ev("document.querySelector('[data-r6-row=\"ds01-ev-candidate\"]')?.click();true");time.sleep(.05);snap('evidence-candidate')
  c.ev("document.querySelector('[data-r6-row=\"ds01-ev-001\"]')?.click();true");time.sleep(.05);snap('evidence-admitted');return out
 if surface=='reviews':
  c.ev("document.querySelector('[data-r6-row=\"ds01-review-active\"]')?.click();true");time.sleep(.05);snap('reviews-active')
  c.ev("document.querySelector('[data-r6-row=\"ds01-review-closed\"]')?.click();true");time.sleep(.05);snap('reviews-closed-decision');return out
 if surface=='mastery':
  c.ev("document.querySelector('[data-r6-row=\"ds01-mastery-auth\"]')?.click();true");time.sleep(.05);snap('mastery-judgment-freshness');return out
 if surface=='portfolio':
  c.ev("document.querySelector('[data-r6-row]')?.click();true");time.sleep(.05);snap('portfolio-membership-curation');return out
 if surface=='validation':
  c.ev("document.querySelector('[data-validation-findings]')?.click();true");time.sleep(.08);snap('validation-findings');return out
 if surface=='backup':
  c.ev("(async()=>{try{await CEPFoundation.registry.execute('backup.drill',{route:'ds01-targeted'});}catch{} CEPFoundation.m0Composition?.mounted?.render?.();return true})()");time.sleep(.1);snap('backup-drill');return out
 if surface=='audit':
  c.ev("(async()=>{await CEPFoundation.registry.execute('audit.search',{filters:{limit:100},route:'ds01-targeted'});await CEPFoundation.registry.execute('audit.verify',{route:'ds01-targeted'});CEPFoundation.m0Composition?.render?.();return true})()");time.sleep(.1);snap('audit-search-verify');return out
 if surface=='configuration':
  c.ev("(()=>{const m=CEPFoundation.m0Composition,adapter=m.composition?.adapter;adapter?.select?.('runtime.retentionDays');m.mounted?.render?.();return {proposal:adapter?.proposal?.('runtime.retentionDays'),diff:adapter?.diff?.('runtime.retentionDays')}})()");time.sleep(.08);snap('configuration-proposal-diff');return out
 return out

ident=source_identity();rows=[];extras=[];failures=[]
try:
 for surface in SURFACES:
  for seeded in [False,True]:
   for w,h in VIEWPORTS:
    c=CDP()
    try:
     load=c.load(surface,w,h,seeded);time.sleep(.15)
     state=c.ev("(()=>({consumer:globalThis.CEPFoundation?.consumer||null,ds01:document.documentElement.dataset.ds01Acceptance||null,ds01Consumer:document.documentElement.dataset.ds01Consumer||null,text:(document.body.innerText||'').slice(0,5000),rowCount:document.querySelectorAll('[data-r6-workbench] .m0-row,[data-r6-workbench] tbody tr').length,focusable:[...document.querySelectorAll('button,a[href],input,textarea,select,[tabindex]:not([tabindex=\"-1\"])')].filter(e=>!e.disabled&&e.offsetParent!==null).length,dir:document.documentElement.dir,scrollWidth:document.documentElement.scrollWidth,width:innerWidth}))()")
     interaction=c.click_first() if seeded else None
     if seeded:c.key_tab_enter()
     label='ds01-populated' if seeded else 'normal-product-truth';fn=f'{surface}__{label}__{w}x{h}.png';shot=c.shot(SHOTS/fn)
     errors=[];networkLimitations=[]
     for e in c.events:
      if e.get('method')=='Runtime.exceptionThrown':errors.append(e.get('params',{}).get('exceptionDetails',{}).get('text','Runtime.exceptionThrown'))
      if e.get('method')=='Log.entryAdded' and e.get('params',{}).get('entry',{}).get('level')=='error':
       msg=e['params']['entry'].get('text','Log.error')
       if 'ERR_CONNECTION_REFUSED' in msg: networkLimitations.append(msg)
       else: errors.append(msg)
     row={'surface':surface,'seeded':seeded,'classification':DS01 if seeded else 'NORMAL_PRODUCT_TRUTH','viewport':{'width':w,'height':h},'sourceIdentity':ident,'load':load,'state':state,'interaction':interaction,'errors':errors,'networkLimitations':networkLimitations,'screenshot':{'path':str((SHOTS/fn).relative_to(ROOT)).replace('\\','/'),**shot},'renderClass':'NAVIGATION_INDEPENDENT_BROWSER_RENDER__NOT_GENUINE_ROUTE'}
     rows.append(row)
     expected_normal_review_block=(surface=='reviews' and not seeded)
     if seeded and (state.get('consumer')!=surface or state.get('ds01')!=DS01 or errors):failures.append({'surface':surface,'seeded':seeded,'viewport':f'{w}x{h}','errors':errors,'state':state,'load':load})
     if (not seeded) and errors and not expected_normal_review_block:failures.append({'surface':surface,'seeded':seeded,'viewport':f'{w}x{h}','errors':errors,'state':state,'load':load})
     if expected_normal_review_block and not errors:
      networkLimitations.append('D14_002_NOT_OBSERVED_IN_NAVIGATION_INDEPENDENT_EVIDENCE_CLASS')
     if seeded and w==1440:
      fn2=f'{surface}__ds01-selected-active__1440x1000.png';shot2=c.shot(SHOTS/fn2);extras.append({'surface':surface,'state':'selected-active','classification':DS01,'sourceIdentity':ident,'path':str((SHOTS/fn2).relative_to(ROOT)).replace('\\','/'),**shot2})
      try: extras.extend(targeted_states(c,surface))
      except Exception as e: failures.append({'surface':surface,'seeded':True,'viewport':'1440x1000','errors':['TARGETED_STATE:'+repr(e)]})
    except Exception as e:
     failures.append({'surface':surface,'seeded':seeded,'viewport':f'{w}x{h}','errors':[repr(e)]})
    finally:c.close()
 report={'schemaVersion':1,'kind':'DS01_GLOBAL_DATA_SUFFICIENCY_TWO_CAPTURE','classification':'CANDIDATE_EXECUTION_EVIDENCE_NOT_ACCEPTANCE','sourceIdentity':ident,'targetSurfaces':SURFACES,'viewports':['1440x1000','1024x900'],'baseScreenshotCount':len(rows),'extraScreenshotCount':len(extras),'rows':rows,'extras':extras,'failures':failures,'reviewNormalExpectedBlocker':'D14-002','renderClass':'NAVIGATION_INDEPENDENT_BROWSER_RENDER__NOT_GENUINE_ROUTE'}
 OUT.mkdir(parents=True,exist_ok=True);(OUT/f'DS01_VISUAL_CAPTURE_MANIFEST__{BATCH}.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'status':'PASS' if not failures else 'FAIL','base':len(rows),'extras':len(extras),'failures':len(failures),'sourceIdentity':ident},ensure_ascii=False,indent=2));sys.exit(0 if not failures else 1)
finally:
 proc.terminate()
