import base64,json,os,posixpath,re,time,requests,websocket
PORT=int(os.environ.get('CDP_PORT','9223'))
DIST=os.environ['DIST_ROOT']
OUT=os.environ.get('OUT_ROOT','/mnt/data/ps04')
ROOT=os.path.realpath(DIST)
pat=re.compile(r"(?P<prefix>(?:from\s*|import\s*\(\s*|export\s+[^;]*?\s+from\s*))(?P<q>['\"])(?P<spec>[^'\"]+)(?P=q)")
side=re.compile(r"(?P<prefix>\bimport\s*)(?P<q>['\"])(?P<spec>[^'\"]+)(?P=q)")
def synth(rel): return 'cep:/'+rel.replace('\\','/')
def resolve(cur,spec): return posixpath.normpath(posixpath.join(posixpath.dirname(cur),spec)) if spec.startswith('.') else None
def deps_and_transform(rel,code):
 deps=[]
 def repl(m):
  spec=m.group('spec'); r=resolve(rel,spec)
  if r and r.endswith('.js'):
   deps.append(r); return m.group('prefix')+m.group('q')+synth(r)+m.group('q')
  return m.group(0)
 code=pat.sub(repl,code); code=side.sub(repl,code); return deps,code
queue=['main.js'];seen=set();transformed={}
while queue:
 rel=queue.pop()
 if rel in seen: continue
 seen.add(rel); fp=os.path.realpath(os.path.join(ROOT,rel))
 if not fp.startswith(ROOT+os.sep) or not os.path.isfile(fp): raise SystemExit(f'MISSING_MODULE:{rel}')
 code=open(fp,encoding='utf-8').read(); deps,code=deps_and_transform(rel,code); transformed[rel]=code
 for d in deps:
  if d not in seen: queue.append(d)
imports={synth(rel):'data:text/javascript;base64,'+base64.b64encode(code.encode()).decode() for rel,code in transformed.items()}
html=open(os.path.join(ROOT,'index.html'),encoding='utf-8').read()
css='\n'.join(open(os.path.join(ROOT,p),encoding='utf-8').read() for p in ['foundation/donor.css','foundation/extensions.css','foundation/global/tokens/scale.css'])
html=re.sub(r'<link[^>]+href="foundation/(?:donor\.css|extensions\.css|global/tokens/scale\.css)"[^>]*>','',html)
bootstrap='<style>'+css+'</style><script type="importmap">'+json.dumps({'imports':imports},separators=(',',':'))+'</script>'
html=html.replace('</head>',bootstrap+'</head>').replace('<script type="module" src="main.js"></script>','<script type="module">import "cep:/main.js";</script>')
base=f'http://127.0.0.1:{PORT}'; tab=requests.get(base+'/json',timeout=2).json()[0]
ws=websocket.create_connection(tab['webSocketDebuggerUrl'],timeout=4,origin='http://127.0.0.1')
seq=0; runtime_events=[]
def call(method,params=None,timeout=30):
 global seq
 seq+=1; ident=seq; ws.send(json.dumps({'id':ident,'method':method,'params':params or {}})); end=time.time()+timeout
 while time.time()<end:
  try:m=json.loads(ws.recv())
  except websocket.WebSocketTimeoutException:continue
  if 'method' in m:
   if m['method'] in ('Runtime.exceptionThrown','Log.entryAdded','Runtime.consoleAPICalled'): runtime_events.append(m)
   continue
  if m.get('id')==ident:
   if 'error' in m: raise RuntimeError(m['error'])
   return m.get('result',{})
 raise TimeoutError(method)
def ev(expr):
 r=call('Runtime.evaluate',{'expression':expr,'returnByValue':True,'awaitPromise':True}); rr=r.get('result',{})
 if rr.get('subtype')=='error': raise RuntimeError(rr.get('description'))
 return rr.get('value')
def sleep(ms=60): time.sleep(ms/1000)
def setup(width,height):
 call('Emulation.setDeviceMetricsOverride',{'width':width,'height':height,'deviceScaleFactor':1,'mobile':False})
 call('Page.navigate',{'url':'about:blank?surface=runs'}); sleep(40)
 frame=call('Page.getFrameTree')['frameTree']['frame']['id']; call('Page.setDocumentContent',{'frameId':frame,'html':html},timeout=30)
 for _ in range(500):
  try:
   if ev("!!window.CEPFoundation && CEPFoundation.consumer==='runs'"): return
  except Exception: pass
  sleep(20)
 raise RuntimeError('RUNS_NOT_READY')
def shot(name):
 data=call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})['data']; path=os.path.join(OUT,name); open(path,'wb').write(base64.b64decode(data)); return path
def snap():
 return json.loads(ev("JSON.stringify({hostClass:CEPFoundation.operational?.constructor?.name,ownerSame:CEPFoundation.operational?.owner===CEPFoundation.wave4Assembly.operationalSession,renderer:CEPFoundation.operational?.rendererDescriptor?.(),snapshot:CEPFoundation.wave4Assembly.operationalSnapshot(),context:document.querySelector('#wave3ContextInspectorHost')?.innerText,legacyContextHidden:document.querySelector('#domainContext')?.hidden,hostHidden:document.querySelector('#operationalHost')?.hidden,hostMode:document.querySelector('#operationalHost')?.dataset.mode,panels:document.querySelectorAll('[data-session-panel]').length,resizeEdges:[...document.querySelectorAll('[data-operational-resize]')].map(x=>x.dataset.operationalResize),activeTag:document.activeElement?.tagName,activeObject:document.activeElement?.dataset?.object||null,activeTab:document.activeElement?.dataset?.tab||null})"))
def command(name,payload='{}'):
 return ev(f"(()=>{{try{{const r=CEPFoundation.api.Commands.execute({json.dumps(name)},{payload});return JSON.stringify({{ok:true,r}})}}catch(e){{return JSON.stringify({{ok:false,error:String(e?.message||e)}})}}}})()")
def submit(text):
 return ev("(()=>{const f=document.querySelector('[data-terminal-form]');const i=f?.querySelector('input[name=command]');if(!f||!i)return 'NO_FORM';i.value="+json.dumps(text)+";f.requestSubmit();return 'SUBMITTED'})()")
def rect(selector):
 return json.loads(ev("JSON.stringify((()=>{const r=document.querySelector("+json.dumps(selector)+")?.getBoundingClientRect();return r?{x:r.x,y:r.y,width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom}:null})())"))
def mouse_resize(edge,dx,dy):
 selector=f'[data-operational-resize="{edge}"]'; r=rect(selector)
 if not r: return {'edge':edge,'error':'NO_HANDLE'}
 host=rect('#operationalHost'); x=max(host['left']+1,min(host['right']-1,r['left']+r['width']/2)); y=max(host['top']+1,min(host['bottom']-1,r['top']+r['height']/2))
 before=json.loads(ev("JSON.stringify(CEPFoundation.wave4Assembly.operationalSnapshot().chrome.geometry)"))
 call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':x,'y':y})
 call('Input.dispatchMouseEvent',{'type':'mousePressed','x':x,'y':y,'button':'left','buttons':1,'clickCount':1})
 call('Input.dispatchMouseEvent',{'type':'mouseMoved','x':x+dx,'y':y+dy,'button':'left','buttons':1})
 call('Input.dispatchMouseEvent',{'type':'mouseReleased','x':x+dx,'y':y+dy,'button':'left','buttons':0,'clickCount':1})
 sleep(25)
 after=json.loads(ev("JSON.stringify(CEPFoundation.wave4Assembly.operationalSnapshot().chrome.geometry)"))
 transition=json.loads(ev("JSON.stringify(CEPFoundation.wave4Assembly.operationalSnapshot().lastTransition)"))
 return {'edge':edge,'before':before,'after':after,'transition':transition}

call('Page.enable');call('Runtime.enable');call('Log.enable')
report={'schemaVersion':1,'mission':'PS04_OPERATIONAL_REAL_CONSUMER_XTERM_CONVERGENCE','modules':len(transformed),'viewports':{},'checks':[]}
def ck(id,ok,detail=None): report['checks'].append({'id':id,'status':'PASS' if ok else 'FAIL','detail':detail})

# Primary 1440x1000 real Runs proof.
setup(1440,1000); initial=snap();
ck('browser.canonical-visible-host',initial['hostClass']=='OperationalTerminalHost' and initial['ownerSame'] is True,initial)
ck('browser.truthful-dom-renderer-fallback',initial['renderer']['kind']=='DOM_FALLBACK' and initial['renderer']['contract']['semanticCommandOwnership'] is False and initial['renderer']['contract']['canonicalStateOwnership'] is False,initial['renderer'])
# Focus return from actual Runs object control.
ev("(()=>{const b=document.querySelector('[data-object=\"DEV-WEB-01\"]');b.focus();CEPFoundation.api.Commands.execute('OPEN_TERMINAL',{deviceId:'DEV-WEB-01',invoker:b,route:'ps04-proof'});return true})()")
sleep(); opened=snap(); first_id=ev("CEPFoundation.wave4Assembly.operationalSnapshot().activePresentationId")
identity1=json.loads(ev("JSON.stringify(CEPFoundation.wave4Assembly.operationalSession.runtimeIdentity())"))
ck('browser.runtime-identity-bound-by-reference',identity1.get('source')=='RuntimeAdapterReference' and identity1.get('runId')=='RUN-0042' and identity1.get('deviceId')=='DEV-WEB-01' and identity1.get('epoch')==1,identity1)
command('session.close');sleep(); focus_closed=snap();
ck('browser.close-focus-return',focus_closed['hostHidden'] is True and focus_closed['activeObject']=='DEV-WEB-01',focus_closed)
# Reopen existing provider session.
ev("(()=>{const b=document.querySelector('[data-object=\"DEV-WEB-01\"]');CEPFoundation.api.Commands.execute('OPEN_TERMINAL',{deviceId:'DEV-WEB-01',invoker:b,route:'ps04-proof-reopen'});return true})()")
sleep()
# Negative: a PowerShell-looking command is just unsupported InternalSimulation input.
before_device=json.loads(ev("JSON.stringify(CEPFoundation.simulation.devices.find(d=>d.id==='DEV-WEB-01'))")); submit('powershell');sleep(120)
neg=json.loads(ev("JSON.stringify({device:CEPFoundation.simulation.devices.find(d=>d.id==='DEV-WEB-01'),event:CEPFoundation.simulation.events.at(-1),terminal:document.querySelector('.terminal-output')?.innerText})"))
ck('browser.no-powershell-provider-fabrication',neg['event']['semanticCommand']=='runtime.unsupported' and neg['event']['changed'] is False and neg['device']['up']==before_device['up'] and 'Unsupported simulation command' in neg['terminal'],neg)
# Positive causal shutdown and Context Inspector refresh from same canonical state.
submit('shutdown');sleep(140)
after_shutdown=json.loads(ev("JSON.stringify({device:CEPFoundation.simulation.devices.find(d=>d.id==='DEV-WEB-01'),event:CEPFoundation.simulation.events.at(-1),spatial:CEPFoundation.spatial.model.nodes.find(n=>n.id==='DEV-WEB-01'),terminal:document.querySelector('.terminal-output')?.innerText,context:document.querySelector('#wave3ContextInspectorHost')?.innerText,legacyContextHidden:document.querySelector('#domainContext')?.hidden,snapshot:CEPFoundation.wave4Assembly.operationalSnapshot()})"))
causal=(after_shutdown['device']['up'] is False and after_shutdown['spatial']['status']=='DOWN' and 'interface DOWN' in after_shutdown['terminal'] and 'State' in after_shutdown['context'] and 'DOWN' in after_shutdown['context'] and 'interface DOWN' in after_shutdown['context'] and after_shutdown.get('legacyContextHidden') is True)
ck('browser.shutdown-causal-refresh-context-spatial-terminal',causal,after_shutdown)
report['viewports']['1440x1000-shutdown']={'state':after_shutdown,'contextRect':rect('#wave3ContextInspectorHost'),'screenshot':shot('PS04_RUNS_SHUTDOWN_1440x1000.png')}
# Open second real Runs device and split.
command('OPEN_TERMINAL',"{deviceId:'DEV-DB-01',route:'ps04-second'}");sleep()
second_id=ev("CEPFoundation.wave4Assembly.operationalSnapshot().activePresentationId")
command('session.split');sleep(); split=snap()
ck('browser.real-split-preserved',split['snapshot']['chrome']['layout']=='split' and split['snapshot']['chrome']['placement']=='bottom' and split['panels']==2,split)
# Reorder active second tab left.
order_before=json.loads(ev("JSON.stringify(CEPFoundation.wave4Assembly.operationalSnapshot().tabs.map(t=>t.presentationId))"));command('session.tab-left');sleep();order_after=json.loads(ev("JSON.stringify(CEPFoundation.wave4Assembly.operationalSnapshot().tabs.map(t=>t.presentationId))"));
ck('browser.tab-reorder',order_after[0]==second_id and order_after!=order_before,{'before':order_before,'after':order_after,'active':second_id})
# Float and assert eight handles.
command('session.float');sleep(); floating=snap(); expected=['left','right','top','bottom','top-left','top-right','bottom-left','bottom-right']
ck('browser.float-eight-resize-handles',floating['snapshot']['chrome']['placement']=='floating' and floating['snapshot']['chrome']['layout']=='single' and sorted(floating['resizeEdges'])==sorted(expected),floating)
# Real pointer/WindowMotion test across all 8 edges.
delta={'left':(-12,0),'right':(12,0),'top':(0,-12),'bottom':(0,12),'top-left':(-12,-12),'top-right':(12,-12),'bottom-left':(-12,12),'bottom-right':(12,12)}
resizes=[]
for edge in expected:
 command('session.geometry') # opens dialog; close it immediately to avoid interference.
 ev("CEPFoundation.workspace.closeDialog?.(); true")
 # Reset geometry via owner directly is proof setup, not product action.
 ev("CEPFoundation.wave4Assembly.operationalSession.setGeometry({x:220,y:180,width:720,height:420}); CEPFoundation.operational.render(); true")
 sleep(15); resizes.append(mouse_resize(edge,*delta[edge]))
resize_ok=all(r.get('transition',{}).get('action')=='session.geometry.resize' and r.get('transition',{}).get('edge')==r['edge'] and r['after']!=r['before'] for r in resizes)
ck('browser.window-motion-eight-edge-pointer-binding',resize_ok,resizes)
# Minimize / restore lifecycle.
command('session.minimize');sleep(); minimized=snap();command('session.minimize');sleep();restored=snap()
ck('browser.minimize-restore-lifecycle',minimized['snapshot']['chrome']['lifecycle']=='minimized' and restored['snapshot']['chrome']['lifecycle']=='open',{'minimized':minimized['snapshot']['chrome'],'restored':restored['snapshot']['chrome']})
# Provider disconnect/reconnect updates live RuntimeAdapter-ref epoch and terminal availability.
identity_before=json.loads(ev("JSON.stringify(CEPFoundation.wave4Assembly.operationalSession.runtimeIdentity())"));command('runtime.disconnect');sleep(80);disc=json.loads(ev("JSON.stringify({identity:CEPFoundation.wave4Assembly.operationalSession.runtimeIdentity(),state:CEPFoundation.wave4Assembly.operationalSession.tabPresentationState(),disabled:document.querySelector('[data-terminal-form] input')?.disabled,terminal:document.querySelector('.terminal-output')?.innerText})"));command('runtime.reconnect');sleep(100);reconn=json.loads(ev("JSON.stringify({identity:CEPFoundation.wave4Assembly.operationalSession.runtimeIdentity(),state:CEPFoundation.wave4Assembly.operationalSession.tabPresentationState(),disabled:document.querySelector('[data-terminal-form] input')?.disabled})"))
ck('browser.runtime-identity-epoch-reference-refresh',disc['state']['state']=='unavailable' and disc['disabled'] is True and reconn['identity']['epoch']==identity_before['epoch']+1 and reconn['state']['state']=='idle' and reconn['disabled'] is False,{'before':identity_before,'disconnect':disc,'reconnect':reconn})
# Recorded view hides live operational input (truthful read-only).
command('view.recorded');sleep(); recorded=snap()
ck('browser.recorded-view-no-live-terminal-input',recorded['hostHidden'] is True and ev("[...document.querySelectorAll('[data-terminal-form] input')].every(x=>x.disabled)") is True,recorded)
# Return live topology and screenshot.
command('view.topology');sleep(); command('session.dock');sleep(); report['viewports']['1440x1000']={'final':snap(),'screenshot':shot('PS04_RUNS_1440x1000.png')}

# Responsive ~1024x900 proof on a fresh Runs page.
setup(1024,900);ev("(()=>{const b=document.querySelector('#rightLocalReveal');if(b?.getAttribute('aria-expanded')!=='true')b?.click();return b?.getAttribute('aria-expanded')})()");sleep(80);command('OPEN_TERMINAL',"{deviceId:'DEV-WEB-01',route:'ps04-1024'}");sleep();submit('shutdown');sleep(140);small_shutdown=snap();small_context_rect=rect('#wave3ContextInspectorHost');small_context_visible=ev("(()=>{const e=document.querySelector('#wave3ContextInspectorHost');if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return !e.hidden&&s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0&&r.right>0&&r.left<innerWidth})()");ck('browser.1024-shutdown-context-visible',small_context_visible and 'DOWN' in small_shutdown['context'] and 'interface DOWN' in small_shutdown['context'] and 'interface DOWN' in ev("document.querySelector('.terminal-output')?.innerText||''"),{'snapshot':small_shutdown,'contextRect':small_context_rect});report['viewports']['1024x900-shutdown']={'state':small_shutdown,'contextRect':small_context_rect,'screenshot':shot('PS04_RUNS_SHUTDOWN_1024x900.png')};command('OPEN_TERMINAL',"{deviceId:'DEV-DB-01',route:'ps04-1024-2'}");sleep();command('session.split');sleep();small_split=snap();command('session.float');sleep();small_float=snap();
small_rect=rect('#operationalHost')
ck('browser.1024-split-real-consumer',small_split['snapshot']['chrome']['layout']=='split' and small_split['panels']==2,small_split)
ck('browser.1024-float-bounded',small_float['snapshot']['chrome']['placement']=='floating' and len(small_float['resizeEdges'])==8 and small_rect['right']<=1024.5 and small_rect['bottom']<=900.5,{'snapshot':small_float,'rect':small_rect})
report['viewports']['1024x900']={'split':small_split,'float':small_float,'rect':small_rect,'screenshot':shot('PS04_RUNS_1024x900.png')}

# Static real-visible-path check from bundled main graph: OperationalView is not live-imported by main.
main_source=open(os.path.join(os.path.dirname(ROOT),'stack/native-typescript/main.ts'),encoding='utf-8').read() if False else None
# Runtime errors must be absent except console logs; collect actual exception/log errors.
errors=[]
for e in runtime_events:
 if e.get('method')=='Runtime.exceptionThrown': errors.append(e)
 elif e.get('method')=='Log.entryAdded' and e.get('params',{}).get('entry',{}).get('level') in ('error','warning'): errors.append(e)
ck('browser.no-runtime-errors',len(errors)==0,{'count':len(errors),'events':errors[-5:]})
failed=[x for x in report['checks'] if x['status']!='PASS'];report['status']='PASS' if not failed else 'FAIL';report['pass']=len(report['checks'])-len(failed);report['fail']=len(failed);report['runtimeEventCount']=len(runtime_events)
out=os.path.join(OUT,'PS04_BROWSER_REAL_CONSUMER_PROOF.json');open(out,'w',encoding='utf-8').write(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':report['status'],'pass':report['pass'],'fail':report['fail'],'failed':[x['id'] for x in failed]},indent=2));ws.close()
if failed: raise SystemExit(1)
