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
bootstrap="""(async()=>{const mods=__MODS__;const urls={};for(const m of mods){let s=m.source;for(const [sp,d] of m.deps)s=s.split(sp).join(urls[d]);urls[m.rel]=URL.createObjectURL(new Blob([s],{type:'text/javascript'}));}await import(urls['main.js']);return {modules:Object.keys(urls).length,consumer:globalThis.CEPFoundation?.consumer||null};})()""".replace('__MODS__',json.dumps(mods,ensure_ascii=False,separators=(',',':')))
html=(ROOT/'dist/index.html').read_text(); donor=(ROOT/'dist/foundation/donor.css').read_text(); ext=(ROOT/'dist/foundation/extensions.css').read_text();html=re.sub(r'<link rel="stylesheet" href="foundation/donor\.css">',lambda m:'<style>'+donor+'</style>',html,flags=re.I);html=re.sub(r'<link rel="stylesheet" href="foundation/extensions\.css">',lambda m:'<style>'+ext+'</style>',html,flags=re.I);html=re.sub(r'<script type="module" src="main\.js"></script>','',html,flags=re.I)
PORT=9232;proc=subprocess.Popen(['/usr/bin/chromium','--headless=new','--no-sandbox','--disable-gpu',f'--remote-debugging-port={PORT}','--remote-allow-origins=*',f'--user-data-dir={tempfile.mkdtemp(prefix="ps01-cdp-")}','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
class CDP:
 def __init__(self):
  for _ in range(100):
   try: json.load(urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json/version',timeout=.2));break
   except: time.sleep(.05)
  self.ws=websocket.create_connection(json.load(urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json'))[0]['webSocketDebuggerUrl'],timeout=30,origin='http://localhost');self.seq=0;self.cmd('Page.enable');self.cmd('Runtime.enable')
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
  self.cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':False});self.cmd('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]});self.cmd('Page.navigate',{'url':'about:blank'});time.sleep(.05);fid=self.cmd('Page.getFrameTree')['frameTree']['frame']['id'];self.cmd('Page.setDocumentContent',{'frameId':fid,'html':html});self.ev("history.replaceState({},'',"+json.dumps('about:blank?surface='+surface)+");true");res=self.ev(bootstrap)
  end=time.time()+5
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
cdp=CDP();report={'schemaVersion':1,'mission':'PS01_GLOBAL_SHELL_FOCUS_LAYERING_CONVERGENCE','transport':'CHROMIUM_CDP_IN_MEMORY_EXACT_BUILT_ESM_GRAPH','moduleCount':len(mods),'settings':{},'sticky':{},'screenshots':[],'tests':[]}
def add(id,ok,detail):report['tests'].append({'id':id,'status':'PASS' if ok else 'FAIL','detail':detail});return ok
try:
 for surface,w,h in [('library',1440,1000),('learn',1024,900)]:
  cdp.load(surface,w,h)
  # scale + locale/direction/no-overflow matrix
  matrix=[]
  for locale in ['ar','en']:
   cdp.ev(f"CEPFoundation.preferences.set('locale',{json.dumps(locale)},'global');CEPFoundation.workspace.applyPreferences();true");time.sleep(.06)
   for scale in [0.8,1.25,2]:
    cdp.ev(f"CEPFoundation.preferences.set('scale',{scale},'global');CEPFoundation.workspace.applyPreferences();true");time.sleep(.04)
    matrix.append(cdp.ev("({locale:CEPFoundation.preferences.resolve('locale').preferredValue,scale:CEPFoundation.preferences.resolve('scale').preferredValue,lang:document.documentElement.lang,dir:document.documentElement.dir,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,shellCount:Number(document.querySelector('.global-shell-destinations')?.dataset.shellDestinationCount),shellOwner:document.body.dataset.globalShellOwner,motion:getComputedStyle(document.documentElement).getPropertyValue('--motion')||document.body.dataset.motion})"))
  add(f'{surface}.rtl-ltr-scale-no-overflow',all(not x['overflow'] and x['shellCount']==5 and x['lang']==x['locale'] and x['dir']==('rtl' if x['locale']=='ar' else 'ltr') for x in matrix),matrix)
  # Restore Arabic so settings locale mutation forces shell rerender.
  opened=cdp.ev("(()=>{CEPFoundation.preferences.set('locale','ar','global');CEPFoundation.workspace.applyPreferences();const b=document.querySelector('.global-shell-settings');b.focus();CEPFoundation.api.Commands.execute('foundation.settings',{route:'keyboard'});return {focusedBeforeOpen:document.activeElement===b,transient:CEPFoundation.transientOwner.record('global.settings-center')?.id||null,backdrop:!!document.querySelector('[data-wave4-settings=\"SettingsCenterOwner\"]')}})()");time.sleep(.08)
  if cdp.ev("document.querySelector('[data-wave4-settings=\"SettingsCenterOwner\"] [data-settings-disclosure=\"preferences.appearance\"]')?.getAttribute('aria-expanded')")!='true':cdp.ev("document.querySelector('[data-wave4-settings=\"SettingsCenterOwner\"] [data-settings-disclosure=\"preferences.appearance\"]')?.click();true");time.sleep(.04)
  cdp.ev("document.querySelector('[data-wave4-settings=\"SettingsCenterOwner\"] [data-settings-preference=\"locale\"][data-settings-value=\"en\"]')?.click();true");time.sleep(.12)
  before=cdp.ev("({connected:CEPFoundation.transientOwner.record('global.settings-center')?.invoker?.isConnected??null,active:document.activeElement?.tagName,body:document.activeElement===document.body,newInvoker:!!document.querySelector('.global-shell-settings')})")
  cdp.key('Escape');time.sleep(.08)
  after=cdp.ev("({body:document.activeElement===document.body,active:document.activeElement?.tagName,cmd:document.activeElement?.getAttribute?.('data-foundation-command')||null,isCurrentShellInvoker:document.activeElement===document.querySelector('.global-shell-settings'),dismissal:CEPFoundation.transientOwner.lastDismissal})")
  detail={'open':opened,'beforeEscape':before,'afterEscape':after,'matrix':matrix};report['settings'][surface]=detail
  add(f'{surface}.settings-locale-rerender-focus-return',before['connected'] is False and after['body'] is False and after['isCurrentShellInvoker'] and after['dismissal']['restored'] and after['dismissal']['focusTargetKind']=='invoker-rebound',detail)
  if surface=='learn':report['screenshots'].append(cdp.shot('ps01_learn_settings_focus_return_1024x900.png'))
 # Sticky hit-test and close semantics at two viewports
 for w,h in [(1440,1000),(1024,900)]:
  cdp.load('library',w,h)
  # Visible command creates note in real Library consumer, retaining L02 overlap geometry.
  center=cdp.ev("(()=>{const e=[...document.querySelectorAll('button[data-foundation-command=\"foundation.note\"]')].find(x=>x.offsetParent!==null);const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()")
  cdp.click(center['x'],center['y']);time.sleep(.08)
  hit=cdp.ev("(()=>{const e=document.querySelector('.stickynote:not([hidden]) [data-note-action=\"close\"]');const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,h=document.elementFromPoint(x,y);return {x,y,noteId:e.closest('.stickynote').dataset.noteId,hitId:h?.id||null,hitAction:h?.closest?.('[data-note-action]')?.dataset.noteAction||null,reveal:h?.closest?.('#leftLocalReveal,#rightLocalReveal')?.id||null,hostZ:getComputedStyle(document.querySelector('#stickyNoteHost')).zIndex,railZ:getComputedStyle(document.querySelector('.centerrail')).zIndex,shellZ:getComputedStyle(document.querySelector('.foundation-shell')).zIndex,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}})()")
  report['screenshots'].append(cdp.shot(f'ps01_library_sticky_{w}x{h}.png'))
  # Hide dirty temporary note through its canonical discard path so reveal can be checked unobstructed.
  cdp.click(hit['x'],hit['y']);time.sleep(.05)
  choice=cdp.ev("(()=>{const e=document.querySelector('[data-note-close-choice=\"discard\"]');if(!e||e.offsetParent===null)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()")
  if choice:cdp.click(choice['x'],choice['y']);time.sleep(.06)
  reveal=cdp.ev("(()=>{const e=document.querySelector('#leftLocalReveal');if(!e)return {exists:false};const r=e.getBoundingClientRect(),pts=[[r.x+r.width/2,r.y+r.height/2],[r.x+Math.max(1,r.width*.15),r.y+r.height/2],[r.x+r.width*.85,r.y+r.height/2]];const hits=pts.map(([x,y])=>{const h=document.elementFromPoint(x,y);return {x,y,id:h?.closest?.('#leftLocalReveal')?.id||null}});return {exists:true,rect:{x:r.x,y:r.y,w:r.width,h:r.height},hits}})()")
  # Open known clean canonical fixture note and real pointer-close it.
  noteId=cdp.ev("(()=>{const ids=Object.keys(CEPFoundation.api.state.notes);const clean=ids.find(id=>CEPFoundation.api.state.notes[id]?.working?.dirty===false)||null;if(clean)CEPFoundation.api.Commands.execute('note.open',{noteId:clean});return clean})()")
  time.sleep(.06)
  closeSemantic=None
  if noteId:
   before=cdp.ev(f"(()=>{{const n=CEPFoundation.api.state.notes[{json.dumps(noteId)}],e=document.querySelector('[data-note-id=\"'+CSS.escape({json.dumps(noteId)})+'\"] [data-note-action=\"close\"]');if(!e)return null;const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,h=document.elementFromPoint(x,y);return {{id:{json.dumps(noteId)},x,y,dirty:n.working.dirty,hitAction:h?.closest?.('[data-note-action]')?.dataset.noteAction||null,runtimeHas:CEPFoundation.noteRuntime.descriptor().notes.includes({json.dumps(noteId)}),binding:JSON.stringify(n.binding),content:JSON.stringify(n.working.blocks)}}}})()")
   cdp.click(before['x'],before['y']);time.sleep(.06)
   aft=cdp.ev(f"(()=>{{const n=CEPFoundation.api.state.notes[{json.dumps(noteId)}];return {{visible:!!document.querySelector('[data-note-id=\"'+CSS.escape({json.dumps(noteId)})+'\"]:not([hidden])'),stateExists:!!n,runtimeHas:CEPFoundation.noteRuntime.descriptor().notes.includes({json.dumps(noteId)}),binding:JSON.stringify(n.binding),content:JSON.stringify(n.working.blocks)}}}})()")
   closeSemantic={'before':before,'after':aft}
  detail={'hit':hit,'paneReveal':reveal,'cleanClose':closeSemantic};report['sticky'][f'{w}x{h}']=detail
  revealReachable=not reveal.get('exists') or any(x['id']=='leftLocalReveal' for x in reveal.get('hits',[]))
  cleanOkay=bool(closeSemantic and closeSemantic['before']['hitAction']=='close' and not closeSemantic['after']['visible'] and closeSemantic['after']['stateExists'] and closeSemantic['after']['runtimeHas'] and closeSemantic['before']['binding']==closeSemantic['after']['binding'] and closeSemantic['before']['content']==closeSemantic['after']['content'])
  add(f'library.sticky-pointer-layering-{w}x{h}',hit['hitAction']=='close' and hit['reveal'] is None and int(hit['hostZ'])>int(hit['railZ']) and int(hit['hostZ'])<int(hit['shellZ']) and not hit['overflow'] and revealReachable and cleanOkay,detail)
 # Fixed >5 mechanics proven in rendered owner with explicit fixture registry is covered by model test; real current routes all remain canonical.
 cdp.load('visualize',1440,1000);routes=cdp.ev("({surface:CEPFoundation.shellNavigation.surface,count:CEPFoundation.shellNavigation.descriptor().destinationCount,dest:CEPFoundation.shellNavigation.descriptor().destinations.map(x=>x.id),route:CEPFoundation.shellRoute})")
 add('shell.current-route-canonicalization',routes['surface']=='visualize' and routes['count']==5 and routes['dest']==['library','learn','visualize','runs','enterprise'] and routes['route']['fallback'] is False,routes)
 report['pass']=sum(x['status']=='PASS' for x in report['tests']);report['fail']=sum(x['status']=='FAIL' for x in report['tests']);(OUT/'PS01_BROWSER_RUNTIME_RECEIPT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'pass':report['pass'],'fail':report['fail'],'tests':report['tests'],'screenshots':report['screenshots']},ensure_ascii=False,indent=2));
 if report['fail']:raise SystemExit(1)
finally:
 try:cdp.ws.close()
 except:pass
 proc.terminate()
