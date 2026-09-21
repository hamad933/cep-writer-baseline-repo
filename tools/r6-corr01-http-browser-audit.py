import os,json,time,subprocess,tempfile,urllib.request,websocket,pathlib,base64,hashlib,datetime,sys,signal
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'assurance/R6_CORR01_HTTP_BROWSER'; SHOTS=OUT/'screenshots'; OUT.mkdir(parents=True,exist_ok=True); SHOTS.mkdir(parents=True,exist_ok=True)
os.environ['NO_PROXY']='127.0.0.1,localhost'; os.environ['no_proxy']='127.0.0.1,localhost'
STATIC_PORT=4173; RUNTIME_PORT=4174; CDP_PORT=9237
SURFACES=['shell','today','library','learn','rq','visualize','enterprise','labs','results','runs','scenarios','evidence','mastery','portfolio','reviews','configuration','manual_ai','releases','backup','health','processing','audit','validation']
MARKERS={'shell':'.m0-home','today':'[data-r6-workbench]','library':'#editorDocument','learn':'#blockList','rq':'[data-r6-workbench]','visualize':'.spatial-canvas','enterprise':'.spatial-canvas','labs':'[data-m0-structured-studio="true"]','results':'[data-r6-workbench]','runs':'.spatial-canvas','scenarios':'[data-m0-structured-studio="true"]','evidence':'[data-r6-workbench]','mastery':'[data-r6-workbench]','portfolio':'[data-r6-workbench]','reviews':'[data-r6-workbench]','configuration':'[data-r6-workbench]','manual_ai':'[data-r6-workbench]','releases':'[data-r6-workbench]','backup':'[data-w05-surface="backup"]','health':'[data-w05-surface="health"]','processing':'[data-w05-surface="processing"]','audit':'[data-w05-surface="audit"]','validation':'.validation-product'}
BLOCKED_NORMAL_TOKENS=['Governed typed product workbench','Domain owner:','Provider truth:','Analytical compare owner:','Canonical owner:','Proof state','renderTruthStage']

def wait_http(url,seconds=10):
 end=time.time()+seconds
 while time.time()<end:
  try:
   with urllib.request.urlopen(url,timeout=.5) as r:
    if r.status<500:return
  except Exception:time.sleep(.08)
 raise RuntimeError('server unavailable '+url)

def source_identity():
 code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; const x=await canonicalSourceIdentity(new URL('file://' + process.cwd().replaceAll('\\\\','/') + '/')); console.log(JSON.stringify({sha256:x.sha256,files:x.files}))"
 return json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True).strip())

class CDP:
 def __init__(self):
  self.events=[]; self.seq=0
  for _ in range(150):
   try:json.load(urllib.request.urlopen(f'http://127.0.0.1:{CDP_PORT}/json/version',timeout=.2));break
   except Exception:time.sleep(.05)
  else:raise RuntimeError('CDP unavailable')
  req=urllib.request.Request(f'http://127.0.0.1:{CDP_PORT}/json/new?about:blank',method='PUT'); target=json.load(urllib.request.urlopen(req,timeout=3)); self.target_id=target['id']; self.ws=websocket.create_connection(target['webSocketDebuggerUrl'],timeout=30,origin='http://localhost')
  for m in ['Page.enable','Runtime.enable','Network.enable','Log.enable']:self.cmd(m)
  hook="""(()=>{window.__cepAuditErrors=[];window.addEventListener('error',e=>window.__cepAuditErrors.push({kind:'error',message:String(e.message||e.error||'error'),source:e.filename||'',line:e.lineno||0}));window.addEventListener('unhandledrejection',e=>window.__cepAuditErrors.push({kind:'unhandledrejection',message:String(e.reason?.stack||e.reason||'rejection')}));const ce=console.error.bind(console);console.error=(...a)=>{window.__cepAuditErrors.push({kind:'console.error',message:a.map(x=>String(x)).join(' ')});return ce(...a)};})();"""
  self.cmd('Page.addScriptToEvaluateOnNewDocument',{'source':hook})
 def close(self):
  try:self.ws.close()
  except Exception:pass
  try:urllib.request.urlopen(f'http://127.0.0.1:{CDP_PORT}/json/close/{self.target_id}',timeout=2).read()
  except Exception:pass
 def cmd(self,m,p=None):
  self.seq+=1; i=self.seq; self.ws.send(json.dumps({'id':i,'method':m,'params':p or {}}))
  while True:
   r=json.loads(self.ws.recv())
   if 'method' in r:self.events.append(r)
   if r.get('id')==i:
    if 'error' in r:raise RuntimeError(r['error'])
    return r.get('result',{})
 def ev(self,e):
  r=self.cmd('Runtime.evaluate',{'expression':e,'returnByValue':True,'awaitPromise':True,'timeout':30000});
  if 'exceptionDetails' in r:raise RuntimeError(str(r['exceptionDetails']))
  return r.get('result',{}).get('value')
 def metrics(self,w,h):
  self.cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':False});self.cmd('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
 def navigate(self,url,expected,w,h):
  self.metrics(w,h); self.events=[]; self.cmd('Page.navigate',{'url':url})
  end=time.time()+12; last=None
  while time.time()<end:
   try:last=self.ev("({ready:document.readyState,consumer:globalThis.CEPFoundation?.consumer||null})")
   except Exception:last=None
   if last and last.get('ready') in ('interactive','complete') and last.get('consumer')==expected:time.sleep(.25);self.ev('true');return last
   time.sleep(.06)
  try: debug=self.ev("({errors:window.__cepAuditErrors||[],text:(document.body?.innerText||'').slice(0,2000),href:location.href})")
  except Exception as e: debug={'evalError':str(e)}
  tail=[{'method':e.get('method'),'params':e.get('params',{})} for e in self.events[-30:]]
  raise RuntimeError(f'route not ready {expected}: {last} debug={debug} events={tail}')
 def shot(self,path):
  data=base64.b64decode(self.cmd('Page.captureScreenshot',{'format':'png','fromSurface':True})['data']);path.write_bytes(data);return {'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
 def key(self,key,code=None,mods=0):
  code=code or key; vk={'Enter':13,'Escape':27,'ArrowRight':39,'ArrowLeft':37,'ArrowUp':38,'ArrowDown':40,'Home':36,'End':35}.get(key,0)
  self.cmd('Input.dispatchKeyEvent',{'type':'rawKeyDown','key':key,'code':code,'windowsVirtualKeyCode':vk,'nativeVirtualKeyCode':vk,'modifiers':mods});self.cmd('Input.dispatchKeyEvent',{'type':'keyUp','key':key,'code':code,'windowsVirtualKeyCode':vk,'nativeVirtualKeyCode':vk,'modifiers':mods})

def event_errors(events):
 out=[]
 for e in events:
  m=e.get('method');p=e.get('params',{})
  if m=='Runtime.exceptionThrown':out.append({'kind':'Runtime.exceptionThrown','detail':p.get('exceptionDetails',{}).get('text','')})
  elif m=='Log.entryAdded' and p.get('entry',{}).get('level')=='error':out.append({'kind':'Log.error','detail':p['entry'].get('text','')})
  elif m=='Network.loadingFailed' and not p.get('canceled'):out.append({'kind':'Network.loadingFailed','detail':p.get('errorText',''),'requestId':p.get('requestId')})
 return out

def response_statuses(events):
 out=[]
 for e in events:
  if e.get('method')=='Network.responseReceived':
   r=e.get('params',{}).get('response',{});u=r.get('url','')
   if u.startswith(f'http://127.0.0.1:{STATIC_PORT}/') or u.startswith(f'http://127.0.0.1:{RUNTIME_PORT}/'):out.append({'url':u,'status':int(r.get('status',0)),'mimeType':r.get('mimeType','')})
 return out

def route_audit(surface,w,h,ident):
 c=CDP()
 try:
  url=f'http://127.0.0.1:{STATIC_PORT}/?surface={surface}&persistencePort={RUNTIME_PORT}'
  c.navigate(url,surface,w,h)
  marker=MARKERS[surface]
  data=c.ev("""(()=>{const text=document.body.innerText||'';const active=document.activeElement;const focusables=[...document.querySelectorAll('button,a[href],input,textarea,select,[tabindex]:not([tabindex="-1"])')].filter(e=>!e.disabled&&e.offsetParent!==null);const bidis=[...document.querySelectorAll('bdi,[dir="rtl"],[dir="ltr"]')];return {consumer:CEPFoundation.consumer,routeCount:CEPFoundation.shellNavigation?.descriptor?.().registeredSurfaceCount||0,shellOwner:document.body.dataset.globalShellOwner||null,marker:%s,diagnostics:!!document.querySelector('#foundationDiagnostics'),width:innerWidth,height:innerHeight,docScrollWidth:document.documentElement.scrollWidth,bodyScrollWidth:document.body.scrollWidth,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,focusableCount:focusables.length,bidiCount:bidis.length,stateTokens:[...new Set([...document.querySelectorAll('[data-state]')].map(x=>x.getAttribute('data-state')).filter(Boolean))],blocked:%s.filter(t=>text.includes(t)),errors:window.__cepAuditErrors||[],selectedCount:document.querySelectorAll('[aria-selected="true"],[aria-current="page"]').length,expandedCount:document.querySelectorAll('[aria-expanded="true"]').length};})()"""%(json.dumps('!!document.querySelector('+json.dumps(marker)+')'),json.dumps(BLOCKED_NORMAL_TOKENS)))
  # Above marker expression is serialized string; compute accurately in a second expression.
  data['marker']=bool(c.ev(f"!!document.querySelector({json.dumps(marker)})"))
  # keyboard shell navigation: focus current primary destination then ArrowRight/Left should move focus without navigation.
  kb=c.ev("""(()=>{const x=document.querySelector('.global-shell-destinations [data-shell-destination]');if(!x)return {ok:false};x.focus();return {ok:true,before:x.dataset.shellDestination,dir:getComputedStyle(document.documentElement).direction}})()""")
  if kb and kb.get('ok'):
   c.key('ArrowRight');time.sleep(.05);kb['after']=c.ev("document.activeElement?.dataset?.shellDestination||null");kb['moved']=kb.get('after')!=kb.get('before')
  else:kb={'ok':False,'moved':False}
  # actual HTTP xterm artifact proof (not Blob/in-memory).
  xterm=c.ev(f"fetch('http://127.0.0.1:{STATIC_PORT}/vendor/xterm/xterm.mjs',{{cache:'no-store'}}).then(async r=>({{ok:r.ok,status:r.status,bytes:(await r.text()).length,url:r.url}}))")
  after_events=event_errors(c.events); responses=response_statuses(c.events)
  path=SHOTS/f'{surface}__{w}x{h}.png';shot=c.shot(path)
  issues=[]
  if data['consumer']!=surface:issues.append('ROUTE_IDENTITY')
  if data['routeCount']!=23:issues.append('ROUTE_COUNT')
  if data['shellOwner']!='GlobalShellNavigationOwner':issues.append('SHELL_OWNER')
  if not data['marker']:issues.append('MISSING_ROUTE_MARKER')
  if data['diagnostics'] or data['blocked']:issues.append('NORMAL_UI_DIAGNOSTIC_LEAK')
  if max(data['docScrollWidth'],data['bodyScrollWidth'])>w+8:issues.append('HORIZONTAL_OVERFLOW')
  if not data['reduced']:issues.append('REDUCED_MOTION')
  if data['focusableCount']<1 or not kb.get('moved'):issues.append('KEYBOARD_FOCUS')
  if data['errors'] or after_events:issues.append('CONSOLE_RUNTIME_ERROR')
  if not xterm or not xterm.get('ok') or xterm.get('status')!=200 or xterm.get('bytes',0)<1000:issues.append('XTERM_HTTP_ROUTE')
  timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
  screenshot={'surface':surface,'route':f'?surface={surface}','viewport':{'width':w,'height':h},'state':'default-genuine-route','imageFilename':path.name,'relativePath':str(path.relative_to(ROOT)).replace('\\','/'),'sha256':shot['sha256'],'bytes':shot['bytes'],'captureTimestamp':timestamp,'candidateSourceIdentity':ident['sha256']}
  return {'surface':surface,'viewport':{'width':w,'height':h},'status':'PASS' if not issues else 'FAIL','issues':issues,'data':data,'keyboard':kb,'xtermHttp':xterm,'networkErrors':after_events,'networkResponses':responses,'screenshot':screenshot}
 finally:c.close()

def cross_route_navigation(ident):
 c=CDP()
 try:
  base=f'http://127.0.0.1:{STATIC_PORT}/?surface=library&persistencePort={RUNTIME_PORT}'
  c.navigate(base,'library',1440,1000)
  prep=c.ev("""(()=>{CEPFoundation.api.switchKU('KU-D03-0011');CEPFoundation.api.selectBlock?.('main','blk-d03-h1',false,'browser-nav-proof');const sc=document.querySelector('#docScroll');if(sc)sc.scrollTop=Math.min(180,Math.max(0,sc.scrollHeight-sc.clientHeight));const b=document.querySelector('[data-block-id="blk-d03-h1"] [data-editable-block], [data-block-id="blk-d03-h1"] button');b?.focus();CEPFoundation.api.setPaneState?.('right','open');return {surface:CEPFoundation.consumer,ku:CEPFoundation.api.state.route.activeKu,selected:CEPFoundation.api.state.editor.selectedBlock,scroll:sc?.scrollTop||0,right:CEPFoundation.api.effectivePaneState?.('right'),focusId:document.activeElement?.closest?.('[data-block-id]')?.dataset?.blockId||document.activeElement?.id||null};})()""")
  # click actual product shell route to Learn
  c.ev("document.querySelector('[data-shell-destination=\"learn\"]')?.click();true")
  end=time.time()+10
  while time.time()<end:
   try:
    if c.ev("CEPFoundation?.consumer")=='learn':break
   except Exception:pass
   time.sleep(.08)
  on_learn=c.ev("({surface:CEPFoundation.consumer,href:location.href})")
  c.ev('history.back();true');end=time.time()+10
  while time.time()<end:
   try:
    if c.ev("CEPFoundation?.consumer")=='library' and c.ev("document.querySelector('[data-global-shell-owner]')?.dataset?.contextRestoreStatus||document.querySelector('#globalShell')?.dataset?.contextRestoreStatus||''") in ('restored','unresolved',''):break
   except Exception:pass
   time.sleep(.08)
  time.sleep(.4)
  back=c.ev("""(()=>{const sc=document.querySelector('#docScroll');return {surface:CEPFoundation.consumer,ku:CEPFoundation.api.state.route.activeKu,selected:CEPFoundation.api.state.editor.selectedBlock,scroll:sc?.scrollTop||0,right:CEPFoundation.api.effectivePaneState?.('right'),focusId:document.activeElement?.closest?.('[data-block-id]')?.dataset?.blockId||document.activeElement?.id||null,shellStatus:CEPFoundation.shellNavigation?.host?.dataset?.contextRestoreStatus||null};})()""")
  c.ev('history.forward();true');end=time.time()+10
  while time.time()<end:
   try:
    if c.ev("CEPFoundation?.consumer")=='learn':break
   except Exception:pass
   time.sleep(.08)
  time.sleep(.25);forward=c.ev("({surface:CEPFoundation.consumer,href:location.href,focus:document.activeElement?.dataset?.shellDestination||document.activeElement?.id||null})")
  passed=(prep.get('surface')=='library' and prep.get('ku')=='KU-D03-0011' and on_learn.get('surface')=='learn' and back.get('surface')=='library' and back.get('ku')=='KU-D03-0011' and forward.get('surface')=='learn')
  return {'status':'PASS' if passed else 'FAIL','sourceIdentity':ident['sha256'],'path':['library','learn','Back→library','Forward→learn'],'prepared':prep,'learn':on_learn,'back':back,'forward':forward,'realBrowserHistory':True,'manualRestoreFunctionInvoked':False}
 finally:c.close()

runtime_dir=pathlib.Path(tempfile.mkdtemp(prefix='cep-b6-browser-')); db=runtime_dir/'balanced6-acceptance.sqlite'
subprocess.check_call(['node',str(ROOT/'stack/local-runtime/persistence/acceptance-seed/balanced6/seed.mjs'),'--db',str(db),'--reset'],cwd=ROOT,stdout=subprocess.DEVNULL)
static=subprocess.Popen(['node','tools/serve.mjs','--port',str(STATIC_PORT)],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
env=os.environ.copy();env.update({'CEP_LOCAL_RUNTIME_PORT':str(RUNTIME_PORT),'CEP_SQLITE_PATH':str(db),'CEP_LOCAL_RUNTIME_ROOT':str(runtime_dir)})
runtime=subprocess.Popen(['node','stack/local-runtime/server.mjs'],cwd=ROOT,env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
chrome_tmp=tempfile.mkdtemp(prefix='cep-http-cdp-');chrome=subprocess.Popen(['/usr/bin/chromium','--headless=new','--no-sandbox','--disable-gpu',f'--remote-debugging-port={CDP_PORT}','--remote-allow-origins=*',f'--user-data-dir={chrome_tmp}','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 wait_http(f'http://127.0.0.1:{STATIC_PORT}/');wait_http(f'http://127.0.0.1:{RUNTIME_PORT}/v1/persistence/health');ident=source_identity();results=[];screens=[]
 selected=os.environ.get('CEP_BROWSER_SURFACES','').strip();surfaces=[x for x in selected.split(',') if x] if selected else SURFACES
 for s in surfaces:
  for w,h in [(1440,1000),(1024,900)]:
   r=route_audit(s,w,h,ident);results.append(r);screens.append(r['screenshot']);print(r['status'],s,w,h,','.join(r['issues']),flush=True)
 nav=cross_route_navigation(ident) if not selected else {'status':'SKIPPED_FILTERED_RUN'}
 status='PASS' if all(r['status']=='PASS' for r in results) and (selected or nav['status']=='PASS') and (selected or len(screens)>=46) else 'FAIL'
 report={'schemaVersion':1,'kind':'R6_CORR01_GENUINE_HTTP_BROWSER_AUDIT','classification':'CANDIDATE_EVIDENCE_NOT_OWNER_ACCEPTANCE','status':status,'transport':'http://127.0.0.1 built Product routes','candidateSourceIdentity':ident['sha256'],'canonicalSourceFileCount':ident['files'],'runtimeDbClassification':'LOCAL_DEV_ACCEPTANCE_SEED__DETERMINISTIC__RESETTABLE__NON_PRODUCTION','summary':{'routeViewportCases':len(results),'pass':sum(x['status']=='PASS' for x in results),'fail':sum(x['status']=='FAIL' for x in results),'screenshots':len(screens)},'navigationProof':nav,'results':results}
 (OUT/'BROWSER_AUDIT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 (OUT/'SCREENSHOT_MANIFEST.json').write_text(json.dumps({'schemaVersion':1,'count':len(screens),'candidateSourceIdentity':ident['sha256'],'screenshots':screens},ensure_ascii=False,indent=2)+'\n')
 (OUT/'CONSOLE_ERROR_CENSUS.json').write_text(json.dumps({'schemaVersion':1,'candidateSourceIdentity':ident['sha256'],'cases':[{'surface':r['surface'],'viewport':r['viewport'],'errors':r['data']['errors']+r['networkErrors']} for r in results],'errorCount':sum(len(r['data']['errors'])+len(r['networkErrors']) for r in results)},ensure_ascii=False,indent=2)+'\n')
 (OUT/'NAVIGATION_BACK_FORWARD_PROOF.json').write_text(json.dumps(nav,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'status':status,'summary':report['summary'],'navigation':nav['status'],'source':ident},ensure_ascii=False))
 sys.exit(0 if status=='PASS' else 1)
finally:
 for p in [chrome,runtime,static]:
  try:p.terminate();p.wait(timeout=3)
  except Exception:
   try:p.kill()
   except Exception:pass
