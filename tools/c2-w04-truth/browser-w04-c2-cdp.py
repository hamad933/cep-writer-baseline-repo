import os,re,json,time,subprocess,tempfile,urllib.request,websocket,pathlib,posixpath,base64,hashlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=pathlib.Path(os.environ.get('CEP_C2_W04_OUT','/mnt/data/c2-w04-final-evidence'))
SHOTS=OUT/'screenshots'; OUT.mkdir(parents=True,exist_ok=True); SHOTS.mkdir(parents=True,exist_ok=True)
CDP_PORT=9238
SURFACES=['evidence','reviews','mastery','portfolio']; VIEWPORTS=[(1440,1000),(1024,900)]
EXPECTED={
 'evidence':['evidence.inspect','evidence.import','evidence.amend','evidence.admit','evidence.sourceChoice'],
 'reviews':['reviews.review','reviews.finding','reviews.compare','reviews.supersede'],
 'mastery':['mastery.inspect','mastery.explain','mastery.reevaluate'],
 'portfolio':['portfolio.filter','portfolio.export','portfolio.curate','portfolio.group'],
}
EMPTY={
 'evidence':'No current Candidate or admitted Evidence is bound.',
 'reviews':'No formal Evidence Review is bound.',
 'mastery':'NOT_EVALUATED · No authorized Mastery provider/evaluator is bound.',
 'portfolio':'No canonical Portfolio memberships are bound.',
}
BANNED=['rescue-base','SYNTHETIC_DEMO_SEED','sha256:3333333333333333','Workbench finding','INCONCLUSIVE']

def source_identity():
 code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs'; const x=await canonicalSourceIdentity(new URL('file://' + process.cwd().replaceAll('\\\\','/') + '/')); console.log(JSON.stringify({sha256:x.sha256,files:x.files}))"
 return json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True).strip())
def git(*args): return subprocess.check_output(['git',*args],cwd=ROOT,text=True).strip()

# Exact built Product, with imports rewritten only for local in-memory browser execution.
pat1=re.compile(r"(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.{1,2}/[^'\"]+)['\"]")
pat2=re.compile(r"import\(\s*['\"](\.{1,2}/[^'\"]+)['\"]\s*\)")
sources={}; deps={}
def collect(rel):
 if rel in sources:return
 src=(ROOT/'dist'/rel).read_text(); sources[rel]=src; arr=[]
 for sp in dict.fromkeys(pat1.findall(src)+pat2.findall(src)):
  rr=posixpath.normpath(posixpath.join(posixpath.dirname(rel),sp)); arr.append((sp,rr)); collect(rr)
 deps[rel]=arr
collect('main.js')
order=[]; seen=set()
def visit(rel):
 if rel in seen:return
 seen.add(rel)
 for _,d in deps[rel]:visit(d)
 order.append(rel)
visit('main.js')
mods=[{'rel':r,'source':sources[r],'deps':deps[r]} for r in order]
xterm_source=(ROOT/'dist/vendor/xterm/xterm.mjs').read_text()
bootstrap="""(async()=>{const mods=__MODS__;const xtermSource=__XTERM__;const xtermUrl=URL.createObjectURL(new Blob([xtermSource],{type:'text/javascript'}));const urls={};for(const m of mods){let s=m.source;for(const [sp,d] of m.deps)s=s.split(sp).join(urls[d]);s=s.split('/vendor/xterm/xterm.mjs').join(xtermUrl);urls[m.rel]=URL.createObjectURL(new Blob([s],{type:'text/javascript'}));}await import(urls['main.js']);return {modules:Object.keys(urls).length,consumer:globalThis.CEPFoundation?.consumer||null};})()""".replace('__MODS__',json.dumps(mods,ensure_ascii=False,separators=(',',':'))).replace('__XTERM__',json.dumps(xterm_source,ensure_ascii=False))
html=(ROOT/'dist/index.html').read_text(); donor=(ROOT/'dist/foundation/donor.css').read_text(); ext=(ROOT/'dist/foundation/extensions.css').read_text()
html=re.sub(r'<link rel="stylesheet" href="foundation/donor\.css">',lambda m:'<style>'+donor+'</style>',html,flags=re.I)
html=re.sub(r'<link rel="stylesheet" href="foundation/extensions\.css">',lambda m:'<style>'+ext+'</style>',html,flags=re.I)
html=re.sub(r'<link rel="stylesheet" href="foundation/global/tokens/scale\.css">',lambda m:'',html,flags=re.I)
html=re.sub(r'<script type="module" src="main\.js"></script>','',html,flags=re.I)

class CDP:
 def __init__(self):
  self.seq=0; self.events=[]; self.target_id=None; self.ws=None
  for _ in range(160):
   try:json.load(urllib.request.urlopen(f'http://127.0.0.1:{CDP_PORT}/json/version',timeout=.2));break
   except Exception:time.sleep(.05)
  else:raise RuntimeError('C2_CDP_UNAVAILABLE')
 def new_target(self):
  self.close_target(); req=urllib.request.Request(f'http://127.0.0.1:{CDP_PORT}/json/new?about:blank',method='PUT')
  target=json.load(urllib.request.urlopen(req,timeout=3)); self.target_id=target['id']; self.seq=0; self.events=[]
  self.ws=websocket.create_connection(target['webSocketDebuggerUrl'],timeout=30,origin='http://localhost')
  for m in ['Page.enable','Runtime.enable','Log.enable']:self.cmd(m)
 def close_target(self):
  try:
   if self.ws:self.ws.close()
  except Exception:pass
  if self.target_id:
   try:urllib.request.urlopen(f'http://127.0.0.1:{CDP_PORT}/json/close/{self.target_id}',timeout=2).read()
   except Exception:pass
  self.ws=None; self.target_id=None
 def close(self):self.close_target()
 def cmd(self,m,p=None):
  self.seq+=1;i=self.seq;self.ws.send(json.dumps({'id':i,'method':m,'params':p or {}}))
  while True:
   r=json.loads(self.ws.recv())
   if 'method' in r:self.events.append(r)
   if r.get('id')==i:
    if 'error' in r:raise RuntimeError(str(r['error']))
    return r.get('result',{})
 def ev(self,e):
  r=self.cmd('Runtime.evaluate',{'expression':e,'returnByValue':True,'awaitPromise':True,'timeout':30000})
  if 'exceptionDetails' in r:raise RuntimeError(str(r['exceptionDetails']))
  return r.get('result',{}).get('value')
 def load(self,surface,w,h):
  self.new_target(); self.cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':False}); self.cmd('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
  fid=self.cmd('Page.getFrameTree')['frameTree']['frame']['id']; self.cmd('Page.setDocumentContent',{'frameId':fid,'html':html})
  self.ev("window.__c2Errors=[];window.addEventListener('error',e=>window.__c2Errors.push({kind:'error',message:String(e.message||e.error||'error')}));window.addEventListener('unhandledrejection',e=>window.__c2Errors.push({kind:'unhandledrejection',message:String(e.reason||'rejection')}));true")
  self.ev("history.replaceState({},'',"+json.dumps('about:blank?surface='+surface)+");true")
  result=self.ev(bootstrap); end=time.time()+7; consumer=None
  while time.time()<end:
   consumer=self.ev("globalThis.CEPFoundation?.consumer||null")
   if consumer==surface:time.sleep(.12);return result
   time.sleep(.04)
  raise RuntimeError(f'C2_IN_MEMORY_ROUTE_NOT_READY:{surface}:{consumer}')
 def key(self,key,code=None):
  code=code or key; vk={'Enter':13,'Space':32}.get(code,0); text='\r' if key=='Enter' else (' ' if code=='Space' else '')
  down={'type':'rawKeyDown','key':key,'code':code,'windowsVirtualKeyCode':vk,'nativeVirtualKeyCode':vk}
  if text:down.update({'text':text,'unmodifiedText':text})
  self.cmd('Input.dispatchKeyEvent',down); self.cmd('Input.dispatchKeyEvent',{'type':'keyUp','key':key,'code':code,'windowsVirtualKeyCode':vk,'nativeVirtualKeyCode':vk})
 def click_selector(self,selector):
  p=self.ev(f"(()=>{{const e=[...document.querySelectorAll({json.dumps(selector)})].find(x=>x.offsetParent!==null);if(!e)return null;const r=e.getBoundingClientRect();return {{x:r.x+r.width/2,y:r.y+r.height/2}}}})()")
  if not p:raise RuntimeError('C2_VISIBLE_ELEMENT_MISSING:'+selector)
  for t in ['mousePressed','mouseReleased']:self.cmd('Input.dispatchMouseEvent',{'type':t,'x':p['x'],'y':p['y'],'button':'left','clickCount':1})
  time.sleep(.08)
 def shot(self,name):
  data=base64.b64decode(self.cmd('Page.captureScreenshot',{'format':'png','fromSurface':True})['data']); p=SHOTS/name;p.write_bytes(data);return {'file':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}

def event_errors(events):
 out=[]
 for e in events:
  m=e.get('method');p=e.get('params',{})
  if m=='Runtime.exceptionThrown':out.append({'kind':m,'detail':p.get('exceptionDetails',{}).get('text','')})
  elif m=='Log.entryAdded' and p.get('entry',{}).get('level')=='error':out.append({'kind':'Log.error','detail':p['entry'].get('text','')})
 return out

def probe(c,surface):
 return c.ev(f"""(()=>{{const text=document.body?.innerText||'';const ids=[...new Set([...document.querySelectorAll('[data-foundation-command]')].map(n=>n.getAttribute('data-foundation-command')).filter(id=>id&&id.startsWith({json.dumps(surface+'.')})))];const states=Object.fromEntries(ids.map(id=>{{const nodes=[...document.querySelectorAll('[data-foundation-command="'+CSS.escape(id)+'"]')].filter(n=>n.offsetParent!==null);return [id,nodes.length?nodes.every(n=>n.disabled):null]}}));const region=id=>{{const e=document.querySelector(id);if(!e)return null;const r=e.getBoundingClientRect();return {{state:e.dataset.state||null,hidden:e.hidden,display:getComputedStyle(e).display,width:r.width,height:r.height}}}};return {{text,ids,states,errors:window.__c2Errors||[],overflow:Math.max(document.documentElement.scrollWidth,document.body?.scrollWidth||0)-innerWidth,regions:{{left:region('#leftPane'),center:region('#centerPane'),right:region('#rightPane'),bottom:region('#bottomShelf')}}}}}})()""")
def assertion(ok,code,detail=None):return {'id':code,'pass':bool(ok),'detail':detail}

chrome=subprocess.Popen(['/usr/bin/chromium','--headless=new','--no-sandbox','--disable-gpu',f'--remote-debugging-port={CDP_PORT}','--remote-allow-origins=*',f'--user-data-dir={tempfile.mkdtemp(prefix="c2-w04-cdp-")}','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
c=CDP();records=[];checks=[]
try:
 ident=source_identity(); head=git('rev-parse','HEAD')
 for surface in SURFACES:
  for w,h in VIEWPORTS:
   c.load(surface,w,h); p=probe(c,surface); errors=event_errors(c.events)+p['errors']
   checks += [assertion(set(p['ids'])==set(EXPECTED[surface]),f'{surface}.{w}.command-inventory',{'actual':p['ids'],'expected':EXPECTED[surface]}),assertion(EMPTY[surface] in p['text'],f'{surface}.{w}.truthful-empty',EMPTY[surface]),assertion(not any(x in p['text'] for x in BANNED),f'{surface}.{w}.no-synthetic-truth',[x for x in BANNED if x in p['text']]),assertion(all(p['regions'].get(k) is not None for k in ['left','center','right','bottom']),f'{surface}.{w}.c1-regions-present',p['regions']),assertion(p['overflow']<=2,f'{surface}.{w}.responsive-overflow',p['overflow']),assertion(len(errors)==0,f'{surface}.{w}.browser-errors',errors)]
   shot=c.shot(f'{surface}-{w}x{h}.png');records.append({'surface':surface,'state':'default-empty','viewport':{'width':w,'height':h},**shot,'probe':{'commands':p['ids'],'commandDisabled':p['states'],'overflow':p['overflow'],'regions':p['regions']},'errors':errors})

 c.load('evidence',1440,1000); c.ev("(()=>{const d=[...document.querySelectorAll('details')].find(x=>x.textContent.includes('Import candidate evidence'));if(!d)return false;d.open=true;d.scrollIntoView({block:'center'});return true})()");time.sleep(.08)
 form=c.ev("(()=>({text:[...document.querySelectorAll('details')].find(x=>x.textContent.includes('Import candidate evidence'))?.innerText||'',values:Object.fromEntries([...document.querySelectorAll('[data-evidence-id],[data-evidence-revision],[data-evidence-source],[data-evidence-source-revision],[data-evidence-title],[data-evidence-subject],[data-evidence-purpose],[data-evidence-claim]')].map(n=>[n.getAttributeNames().find(x=>x.startsWith('data-evidence-')),n.value]))}))()")
 checks += [assertion('UNVERIFIED / UNAVAILABLE' in form['text'],'evidence.import-open.disclosure',form['text'][:500]),assertion(not any(x in json.dumps(form) for x in ['sha256:3333333333333333','owner:local','sourceBytesAvailable','schemaValid']),'evidence.import-open.no-fabricated-verifier-input',form['values'])]
 shot=c.shot('evidence-import-open-1440x1000.png');records.append({'surface':'evidence','state':'import-open','viewport':{'width':1440,'height':1000},**shot,'probe':form,'errors':event_errors(c.events)})
 c.ev("""(()=>{const set=(sel,v)=>{const n=document.querySelector(sel);n.value=v;n.dispatchEvent(new Event('input',{bubbles:true}))};set('[data-evidence-subject]','subject:c2-local');set('[data-evidence-purpose]','C2 local candidate truth test');return true})()""");before=probe(c,'evidence');c.click_selector('[data-evidence-import-submit]');time.sleep(.15);after=probe(c,'evidence')
 checks += [assertion('Imported candidate evidence' in after['text'],'evidence.import.candidate-visible',after['text'][:1000]),assertion(after['states'].get('evidence.inspect') is False,'evidence.context.inspect-enabled-after-selection',{'before':before['states'],'after':after['states']}),assertion(after['states'].get('evidence.admit') is True and after['states'].get('evidence.amend') is True and after['states'].get('evidence.sourceChoice') is True,'evidence.context.gated-actions-remain-disabled',after['states']),assertion(not any(x in after['text'] for x in BANNED),'evidence.import.no-synthetic-truth-after-import',[x for x in BANNED if x in after['text']])]
 c.click_selector('[data-r6-row]');c.ev("document.querySelector('[data-r6-row]')?.focus();true");c.key('Enter');time.sleep(.1);keyprobe=probe(c,'evidence');errs=event_errors(c.events)+keyprobe['errors'];checks += [assertion(len(errs)==0,'evidence.selection.pointer-keyboard-clean',errs),assertion(keyprobe['states'].get('evidence.inspect') is False,'evidence.selection.context-persists',keyprobe['states'])]
 shot=c.shot('evidence-candidate-selected-1440x1000.png');records.append({'surface':'evidence','state':'candidate-selected','viewport':{'width':1440,'height':1000},**shot,'probe':{'commandDisabled':keyprobe['states'],'overflow':keyprobe['overflow']},'errors':errs})

 c.load('reviews',1440,1000);c.ev("(()=>{const d=[...document.querySelectorAll('details')].find(x=>x.textContent.includes('Governed Review input'));if(!d)return false;d.open=true;d.scrollIntoView({block:'center'});return true})()");time.sleep(.08)
 review_form=c.ev("(()=>({text:[...document.querySelectorAll('details')].find(x=>x.textContent.includes('Governed Review input'))?.innerText||'',findingText:document.querySelector('[data-review-finding-text]')?.value||'',findingId:document.querySelector('[data-review-finding-id]')?.value||'',decisionId:document.querySelector('[data-review-decision-id]')?.value||'',decisionReason:document.querySelector('[data-review-decision-reason]')?.value||'',findingOutcome:document.querySelector('[data-review-finding-state]')?.value||'',decisionOutcome:document.querySelector('[data-review-decision-outcome]')?.value||'',outcomes:[...document.querySelectorAll('[data-review-decision-outcome] option')].map(x=>x.value).filter(Boolean)}))()")
 allowed=['ACCEPT','ACCEPT_WITH_LIMITATIONS','MORE_EVIDENCE_REQUIRED','REJECT'];checks += [assertion(review_form['findingText']==review_form['findingId']==review_form['decisionId']==review_form['decisionReason']=='','reviews.input.explicit-content-empty',review_form),assertion(review_form['outcomes']==allowed,'reviews.input.allowed-decision-vocabulary',review_form['outcomes']),assertion(review_form['findingOutcome']=='' and review_form['decisionOutcome']=='','reviews.input.outcome-requires-explicit-selection',{'finding':review_form['findingOutcome'],'decision':review_form['decisionOutcome']}),assertion('Workbench finding' not in review_form['text'] and 'INCONCLUSIVE' not in review_form['text'],'reviews.input.no-manufactured-semantics',review_form['text'][:800])]
 shot=c.shot('reviews-governed-input-open-1440x1000.png');records.append({'surface':'reviews','state':'governed-input-open','viewport':{'width':1440,'height':1000},**shot,'probe':review_form,'errors':event_errors(c.events)})

 all_pass=all(x['pass'] for x in checks); receipt={'schemaVersion':1,'mission':'CORR02_C2_W04_PRODUCT_DATA_ACTION_TRUTH','classification':'CANDIDATE_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE','transport':'LOCAL_CHROMIUM_CDP__IN_MEMORY_EXACT_BUILT_PRODUCT','environment':{'httpLocalhost':'BLOCKED_BY_ADMINISTRATOR','replacement':'PACKAGED_IN_MEMORY_RENDERER_PATTERN'},'head':head,'productSource':ident,'viewports':[{'width':w,'height':h} for w,h in VIEWPORTS],'expectedCommandInventory':EXPECTED,'records':records,'checks':checks,'summary':{'checks':len(checks),'pass':sum(x['pass'] for x in checks),'fail':sum(not x['pass'] for x in checks),'screenshots':len(records)},'pass':all_pass}
 (OUT/'C2_W04_BROWSER_RECEIPT.json').write_text(json.dumps(receipt,indent=2,ensure_ascii=False)+'\n');(OUT/'C2_W04_SCREENSHOT_MANIFEST.json').write_text(json.dumps({'schemaVersion':1,'mission':receipt['mission'],'productSource':ident,'count':len(records),'screenshots':[{k:r[k] for k in ['surface','state','viewport','file','bytes','sha256']} for r in records]},indent=2,ensure_ascii=False)+'\n')
 print(json.dumps({'pass':all_pass,'summary':receipt['summary'],'productSource':ident,'head':head},ensure_ascii=False));sys.exit(0 if all_pass else 1)
finally:
 c.close()
 try:chrome.terminate();chrome.wait(timeout=3)
 except Exception:
  try:chrome.kill()
  except Exception:pass
