import os,re,json,time,subprocess,tempfile,urllib.request,websocket,pathlib,posixpath,base64,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'assurance/PS01_BROWSER_EVIDENCE';OUT.mkdir(parents=True,exist_ok=True)
os.environ['NO_PROXY']='127.0.0.1,localhost';os.environ['no_proxy']='127.0.0.1,localhost'
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
visit('main.js')
mods=[{'rel':r,'source':sources[r],'deps':deps[r]} for r in order]
xterm_source=(ROOT/'dist/vendor/xterm/xterm.mjs').read_text()
bootstrap="""(async()=>{const mods=__MODS__;const xtermSource=__XTERM__;const xtermUrl=URL.createObjectURL(new Blob([xtermSource],{type:'text/javascript'}));const urls={};for(const m of mods){let s=m.source;for(const [sp,d] of m.deps)s=s.split(sp).join(urls[d]);s=s.split('/vendor/xterm/xterm.mjs').join(xtermUrl);urls[m.rel]=URL.createObjectURL(new Blob([s],{type:'text/javascript'}));}await import(urls['main.js']);return {modules:Object.keys(urls).length,consumer:globalThis.CEPFoundation?.consumer||null,xtermInjected:true};})()""".replace('__MODS__',json.dumps(mods,ensure_ascii=False,separators=(',',':'))).replace('__XTERM__',json.dumps(xterm_source,ensure_ascii=False))
html=(ROOT/'dist/index.html').read_text(); donor=(ROOT/'dist/foundation/donor.css').read_text(); ext=(ROOT/'dist/foundation/extensions.css').read_text();html=re.sub(r'<link rel="stylesheet" href="foundation/donor\.css">',lambda m:'<style>'+donor+'</style>',html,flags=re.I);html=re.sub(r'<link rel="stylesheet" href="foundation/extensions\.css">',lambda m:'<style>'+ext+'</style>',html,flags=re.I);html=re.sub(r'<script type="module" src="main\.js"></script>','',html,flags=re.I)
PORT=9232;proc=subprocess.Popen(['/usr/bin/chromium','--headless=new','--no-sandbox','--disable-gpu',f'--remote-debugging-port={PORT}','--remote-allow-origins=*',f'--user-data-dir={tempfile.mkdtemp(prefix="ps01-cdp-")}','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
class CDP:
 def __init__(self):
  for _ in range(100):
   try: json.load(urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json/version',timeout=.2));break
   except: time.sleep(.05)
  req=urllib.request.Request(f'http://127.0.0.1:{PORT}/json/new?about:blank',method='PUT')
  target=json.load(urllib.request.urlopen(req,timeout=3))
  self.target_id=target['id']
  self.ws=websocket.create_connection(target['webSocketDebuggerUrl'],timeout=30,origin='http://localhost');self.seq=0;self.cmd('Page.enable');self.cmd('Runtime.enable')
 def close(self):
  try:self.ws.close()
  except:pass
  try:urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json/close/{self.target_id}',timeout=2).read()
  except:pass
 def cmd(self,m,p=None):
  self.seq+=1;i=self.seq;self.ws.send(json.dumps({'id':i,'method':m,'params':p or {}}))
  while True:
   r=json.loads(self.ws.recv())
   if r.get('id')==i:
    if 'error' in r: raise RuntimeError(r['error'])
    return r.get('result',{})
 def ev(self,e):
  r=self.cmd('Runtime.evaluate',{'expression':e,'returnByValue':True,'awaitPromise':True,'timeout':30000})
  if 'exceptionDetails' in r: raise RuntimeError(str(r['exceptionDetails']))
  return r.get('result',{}).get('value')
 def load(self,surface,w,h):
  # Each CDP instance owns a fresh Chromium target. This resets window/global
  # singleton state between route/viewport proofs and prevents false duplicate-owner
  # evidence caused by Page.setDocumentContent on a reused execution context.
  self.cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':False})
  self.cmd('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
  fid=self.cmd('Page.getFrameTree')['frameTree']['frame']['id']
  self.cmd('Page.setDocumentContent',{'frameId':fid,'html':html})
  self.ev("history.replaceState({},'',"+json.dumps('about:blank?surface='+surface)+");true")
  res=self.ev(bootstrap)
  end=time.time()+5
  c=None
  while time.time()<end:
   c=self.ev("globalThis.CEPFoundation?.consumer||null")
   if c==surface:return res
   time.sleep(.05)
  raise RuntimeError(f'consumer not ready {surface}: {c}')
 def key(self,key,code=None,mods=0):
  self.cmd('Page.bringToFront');code=code or key;vk={'Enter':13,'Escape':27,'ArrowRight':39,'ArrowLeft':37,'ArrowUp':38,'ArrowDown':40,'Space':32,'F2':113}.get(key,0)
  down={'type':'rawKeyDown','key':key,'code':code,'windowsVirtualKeyCode':vk,'nativeVirtualKeyCode':vk,'modifiers':mods}
  if key=='Enter':down.update({'text':'\r','unmodifiedText':'\r'})
  self.cmd('Input.dispatchKeyEvent',down);self.cmd('Input.dispatchKeyEvent',{'type':'keyUp','key':key,'code':code,'windowsVirtualKeyCode':vk,'nativeVirtualKeyCode':vk,'modifiers':mods})
 def click(self,x,y,button='left'):
  for t in ['mousePressed','mouseReleased']:self.cmd('Input.dispatchMouseEvent',{'type':t,'x':x,'y':y,'button':button,'clickCount':1})
 def shot(self,name):
  data=base64.b64decode(self.cmd('Page.captureScreenshot',{'format':'png','fromSurface':True})['data']);p=OUT/name;p.write_bytes(data);return {'filename':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}

import sys
ASSURANCE=ROOT/'assurance'; ASSURANCE.mkdir(exist_ok=True)
# Add helpers for visible element geometry and mouse double-click.
def center(selector):
    js="""sel=>{const es=[...document.querySelectorAll(sel)],e=es.find(x=>x.offsetParent!==null);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height}}"""
    return cdp.ev(f"({js})({json.dumps(selector)})")
def click_selector(selector,mods=0):
    p=center(selector)
    if not p: raise AssertionError('no visible element: '+selector)
    for t in ['mousePressed','mouseReleased']:
        cdp.cmd('Input.dispatchMouseEvent',{'type':t,'x':p['x'],'y':p['y'],'button':'left','clickCount':1,'modifiers':mods})
    time.sleep(.06)
    return p
def right_click(x,y,mods=0):
    for t in ['mousePressed','mouseReleased']:
        cdp.cmd('Input.dispatchMouseEvent',{'type':t,'x':x,'y':y,'button':'right','clickCount':1,'modifiers':mods})
    time.sleep(.05)
def dblclick_selector(selector):
    p=center(selector)
    if not p: raise AssertionError('no visible element: '+selector)
    for count in [1,2]:
        cdp.cmd('Input.dispatchMouseEvent',{'type':'mousePressed','x':p['x'],'y':p['y'],'button':'left','clickCount':count})
        cdp.cmd('Input.dispatchMouseEvent',{'type':'mouseReleased','x':p['x'],'y':p['y'],'button':'left','clickCount':count})
    time.sleep(.07)
    return p
def key_mod(key,mods=0):
    if key=='Space':
        cdp.cmd('Input.dispatchKeyEvent',{'type':'rawKeyDown','key':' ','code':'Space','windowsVirtualKeyCode':32,'nativeVirtualKeyCode':32,'modifiers':mods,'text':' ','unmodifiedText':' '})
        cdp.cmd('Input.dispatchKeyEvent',{'type':'keyUp','key':' ','code':'Space','windowsVirtualKeyCode':32,'nativeVirtualKeyCode':32,'modifiers':mods})
    else:
        cdp.key(key,mods=mods)
    time.sleep(.06)
def set_view(w,h):
    cdp.cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':False});time.sleep(.04)
def screenshot(name,flow_id,prop):
    s=cdp.shot(name); (ASSURANCE/name).write_bytes((OUT/name).read_bytes()); s.update({'flowId':flow_id,'property':prop,'viewport':cdp.ev("({width:innerWidth,height:innerHeight})"),'scope':'EXACT_CURRENT_CANDIDATE_TARGETED_VISUAL_EVIDENCE'});return s

def source_identity():
    code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; const x=await canonicalSourceIdentity(new URL('file://' + process.cwd().replaceAll('\\\\','/') + '/')); console.log(JSON.stringify({sha256:x.sha256,files:x.files}))"
    return json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True).strip())

def select_pair():
    ids=cdp.ev("(()=>{const nodes=CEPFoundation.relations.nodes;for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++)if(CEPFoundation.relations.connectionAvailability([nodes[i].id,nodes[j].id]).enabled)return[nodes[i].id,nodes[j].id];return null})()")
    if not ids or len(ids)!=2: raise AssertionError('no eligible relation pair')
    for k,id_ in enumerate(ids):
        p=cdp.ev(f"(()=>{{const e=document.querySelector('#objectList [data-object={json.dumps(id_)}]');if(!e)return null;const r=e.getBoundingClientRect();return {{x:r.x+r.width/2,y:r.y+r.height/2,visible:e.offsetParent!==null}}}})()")
        if not p or not p['visible']: raise AssertionError(f'object not visible {id_}: {p}')
        for t in ['mousePressed','mouseReleased']:
            cdp.cmd('Input.dispatchMouseEvent',{'type':t,'x':p['x'],'y':p['y'],'button':'left','clickCount':1,'modifiers':2 if k else 0})
        time.sleep(.05)
    return ids

cdp=None
SURFACES=['shell','today','library','learn','rq','visualize','enterprise','labs','results','runs','scenarios','evidence','mastery','portfolio','reviews','configuration','manual_ai','releases','backup','health','processing','audit','validation']
OUTR=ROOT/'assurance/R6_OD057_BROWSER';OUTR.mkdir(parents=True,exist_ok=True)
results=[];shots=[];failures=[];state_union=set()
markers={
 'shell':'.m0-home','today':'[data-r6-workbench]','library':'#editorDocument','learn':'#blockList','rq':'[data-r6-workbench]','visualize':'.spatial-canvas','enterprise':'.spatial-canvas','labs':'[data-m0-structured-studio="true"]','results':'[data-r6-workbench]','runs':'.spatial-canvas','scenarios':'[data-m0-structured-studio="true"]',
 'evidence':'[data-r6-workbench]','mastery':'[data-r6-workbench]','portfolio':'[data-r6-workbench]','reviews':'[data-r6-workbench]','configuration':'[data-r6-workbench]','manual_ai':'[data-r6-workbench]','releases':'[data-r6-workbench]','backup':'[data-w05-surface="backup"]','health':'[data-w05-surface="health"]','processing':'[data-w05-surface="processing"]','audit':'[data-w05-surface="audit"]','validation':'.validation-product'}
def shot_route(surface,w,h):
    data=base64.b64decode(cdp.cmd('Page.captureScreenshot',{'format':'png','fromSurface':True})['data'])
    name=f'{surface}-{w}x{h}.png';p=OUTR/name;p.write_bytes(data)
    return {'surface':surface,'viewport':{'width':w,'height':h},'path':f'assurance/R6_OD057_BROWSER/{name}','bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
def audit(surface,w,h):
    cdp.load(surface,w,h);time.sleep(.12)
    expr="""(()=>{const m=CEPFoundation.m0Composition||{};const bodyText=document.body.innerText||'';const states=[...new Set([...document.querySelectorAll('[data-state]')].map(n=>n.getAttribute('data-state')).filter(Boolean))];const marker=%s;return {consumer:CEPFoundation.consumer,family:CEPFoundation.family,routeCount:CEPFoundation.shellNavigation?.descriptor?.().registeredSurfaceCount||0,shellOwner:document.body.dataset.globalShellOwner||null,m0Keys:Object.keys(m),m0Fallback:m.composition==='NO_ADDITIONAL_CONTROLLER_COMPOSITION_REQUIRED',marker:!!document.querySelector(marker),diagnostics:!!document.querySelector('#foundationDiagnostics'),proofText:bodyText.includes('Proof state'),genericToken:bodyText.includes('renderTruthStage'),width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyScrollWidth:document.body.scrollWidth,dir:document.documentElement.dir,lang:document.documentElement.lang,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,states,sharedCompare:CEPFoundation.sharedOwners?.analyticalCompareOwner?.owner||null,sharedTimeline:CEPFoundation.sharedOwners?.timelineReplayOwner?.owner||null,windowsFalseClaim:bodyText.includes('WINDOWS_TARGET_PASS')||bodyText.includes('STACK_FROZEN'),commandCount:CEPFoundation.registry?.commands?.size||0};})()""" % json.dumps(markers[surface])
    x=cdp.ev(expr)
    errs=[]
    if x['consumer']!=surface: errs.append(f'consumer:{x["consumer"]}')
    if x['routeCount']!=23: errs.append(f'routeCount:{x["routeCount"]}')
    if x['shellOwner']!='GlobalShellNavigationOwner': errs.append(f'shellOwner:{x["shellOwner"]}')
    if x['m0Fallback']: errs.append('generic-m0-fallback')
    if not x['marker']: errs.append('missing-genuine-route-marker:'+markers[surface])
    if x['diagnostics'] or x['proofText'] or x['genericToken']: errs.append('debug-or-generic-proof-ui-visible')
    if max(x['scrollWidth'],x['bodyScrollWidth'])>x['width']+8: errs.append(f'page-horizontal-overflow:{max(x["scrollWidth"],x["bodyScrollWidth"])}>{x["width"]}')
    if not x['reduced']: errs.append('reduced-motion-not-active')
    if x['sharedCompare']!='AnalyticalCompareOwner' or x['sharedTimeline']!='TimelineReplayOwner': errs.append('shared-owner-missing')
    if x['windowsFalseClaim']: errs.append('false-windows-or-stack-claim')
    for s in x['states']: state_union.add(s)
    return x,errs
try:
    for surface in SURFACES:
        row={'surface':surface,'viewports':[],'status':'PASS'}
        for w,h in [(1440,1000),(1024,900)]:
            cdp=CDP()
            try:
                data,errs=audit(surface,w,h);sh=shot_route(surface,w,h);shots.append(sh);row['viewports'].append({'viewport':{'width':w,'height':h},'evidence':data,'screenshot':sh,'errors':errs})
                if errs: row['status']='FAIL';failures.append({'surface':surface,'viewport':f'{w}x{h}','errors':errs})
            except Exception as e:
                row['status']='FAIL';row['viewports'].append({'viewport':{'width':w,'height':h},'error':repr(e)});failures.append({'surface':surface,'viewport':f'{w}x{h}','errors':[repr(e)]})
            finally:
                cdp.close()
        results.append(row);print(row['status'],surface,flush=True)
    ident=source_identity();summary={'surfaces':len(results),'pass':sum(r['status']=='PASS' for r in results),'fail':sum(r['status']=='FAIL' for r in results),'screenshots':len(shots)}
    report={'schemaVersion':1,'kind':'R6_OD057_23_SURFACE_GENUINE_ROUTE_BROWSER_AUDIT','classification':'EXACT_CURRENT_CANDIDATE_EXECUTION_EVIDENCE_NOT_OWNER_ACCEPTANCE','status':'PASS' if not failures and summary['surfaces']==23 and len(shots)==46 else 'FAIL','sourceCanonicalTreeSha256':ident['sha256'],'canonicalSourceFileCount':ident['files'],'environment':{'engine':'Chromium CDP','transport':'in-memory-built-esm-blob-urls','xtermAsset':'exact dist/vendor/xterm/xterm.mjs injected for opaque-origin proof','reducedMotion':True},'viewports':['1440x1000','1024x900'],'summary':summary,'statesObserved':sorted(state_union),'checks':['23 route identity','genuine route marker','no generic M0 fallback','no proof/debug internals','no page-level horizontal overflow','reduced-motion media active','central AnalyticalCompare/TimelineReplay owners','no WINDOWS_TARGET_PASS or STACK_FROZEN claim'],'results':results,'failures':failures,'screenshots':shots}
    (OUTR/'R6_23_SURFACE_BROWSER_AUDIT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    (OUTR/'R6_23_SURFACE_SCREENSHOT_MANIFEST.json').write_text(json.dumps({'schemaVersion':1,'count':len(shots),'screenshots':shots},ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'status':report['status'],'summary':summary,'statesObserved':sorted(state_union),'failureCount':len(failures),'failures':failures[:20]},ensure_ascii=False,indent=2))
    raise SystemExit(0 if report['status']=='PASS' else 1)
finally:
    proc.terminate()
