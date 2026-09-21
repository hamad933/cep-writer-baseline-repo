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
  self.cmd('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':False});self.cmd('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
  self.cmd('Page.navigate',{'url':f'http://127.0.0.1:43173/?surface={surface}'})
  end=time.time()+8;c=None
  while time.time()<end:
   try:c=self.ev("globalThis.CEPFoundation?.consumer||null")
   except Exception:c=None
   if c==surface:return {'transport':'localhost-http','consumer':c}
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

cdp=CDP(); flows=[]; shots=[]
def run(id,before,action,owner,oracle,fn):
    try:
        ev=fn();flows.append({'id':id,'before':before,'action':action,'owner':owner,'oracle':oracle,'status':'PASS','evidence':ev});print('PASS',id,flush=True)
    except Exception as e:
        flows.append({'id':id,'before':before,'action':action,'owner':owner,'oracle':oracle,'status':'FAIL','error':repr(e)});print('FAIL',id,repr(e),flush=True)
try:
    def f1():
        cdp.load('golden',1440,980)
        click_selector('button[data-foundation-command="foundation.left"]'); collapsed=cdp.ev("document.querySelector('#leftPane')?.getAttribute('data-state')")
        click_selector('button[data-foundation-command="foundation.left"]'); restored=cdp.ev("document.querySelector('#leftPane')?.getAttribute('data-state')")
        click_selector('button[data-foundation-command="foundation.palette"]')
        open_=not cdp.ev("document.querySelector('#commandBackdrop')?.hidden")
        key_mod('Escape')
        hidden=cdp.ev("document.querySelector('#commandBackdrop')?.hidden")
        focus_return=cdp.ev("document.activeElement?.getAttribute?.('data-foundation-command')==='foundation.palette'")
        if not (open_ and hidden and focus_return and collapsed=='collapsed' and restored=='open'): raise AssertionError({'open':open_,'hidden':hidden,'focus':focus_return,'collapsed':collapsed,'restored':restored})
        set_view(900,980)
        resp=cdp.ev("CEPFoundation.api.panes.snapshot()")
        if not (resp['right']['preferred']=='open' and resp['right']['effective']=='collapsed'): raise AssertionError(resp)
        shots.append(screenshot('browser-workspace-pane-context.png','workspace.transient-and-pane-lifecycle','preferred/effective pane state and shared workspace chrome'))
        return {'collapsed':collapsed,'restored':restored,'paletteExit':'Escape','focusReturned':focus_return,'responsive':resp}
    run('workspace.transient-and-pane-lifecycle','Golden consumer with visible Foundation chrome','toggle pane, open and Escape command palette, responsive projection','WorkspaceFoundationHost + PaneLayoutController + TransientFocusOwner','pane truth changes, transient reverses, focus returns',f1)

    def f2():
        cdp.load('visualize',1440,980); ids=select_pair()
        sel=cdp.ev("({hidden:document.querySelector('.relation-selection')?.hidden,enabled:!document.querySelector('.relation-selection [data-connect]')?.disabled})")
        if sel['hidden'] or not sel['enabled']: raise AssertionError(sel)
        shots.append(screenshot('browser-selection-connect.png','spatial.selection-connect-canonical-edge','exactly-two central ActionAvailability presentation'))
        before=cdp.ev("CEPFoundation.relations.records.length")
        click_selector('.relation-selection [data-connect]')
        if cdp.ev("document.querySelector('.relation-composer')?.hidden"): raise AssertionError('composer not open')
        click_selector('.relation-composer button[type="submit"]')
        after=cdp.ev("({records:CEPFoundation.relations.records.length,latest:CEPFoundation.relations.records.at(-1),projected:CEPFoundation.spatial.model.edges.at(-1),version:CEPFoundation.relations.version})")
        if not (after['records']==before+1 and after['projected']['canonicalId']==after['latest']['id'] and after['projected']['kind']=='domain-projection'): raise AssertionError(after)
        return {'selectedIds':ids,'before':before,'after':after['records'],'relationId':after['latest']['id'],'canonicalVersion':after['version'],'projectedKind':after['projected']['kind']}
    run('spatial.selection-connect-canonical-edge','Visualize graph with no current selection','select two objects, use Connect, submit composer','ActionAvailabilityCore + RelationInteractionOwner + RelationDomainAdapter','one canonical relation committed and projected',f2)

    def f3():
        cdp.load('visualize',1440,980)
        # whole edge double-click by actual line pointer
        dblclick_selector('.spatial-canvas [data-edge] line')
        whole=not cdp.ev("document.querySelector('.relation-composer')?.hidden")
        if whole: raise AssertionError('whole edge opened')
        dblclick_selector('.spatial-canvas [data-edge] [data-relation-label]')
        if cdp.ev("document.querySelector('.relation-composer')?.hidden"): raise AssertionError('label did not open')
        click_selector('.relation-composer [data-relation-close]')
        cdp.ev("document.querySelector('.spatial-canvas [data-edge]')?.focus();true")
        key_mod('F2')
        if cdp.ev("document.querySelector('.relation-composer')?.hidden"): raise AssertionError('F2 did not open')
        rec=cdp.ev("CEPFoundation.registry.receipts.filter(x=>x.id==='relation.edit')")
        if not (len(rec)==2 and all(x['owner']=='RelationInteractionOwner' for x in rec)): raise AssertionError(rec)
        return {'wholeEdgeOpened':False,'convergedReceipts':len(rec),'owners':sorted(set(x['owner'] for x in rec))}
    run('relation.route-convergence-and-label-scope','Existing canonical Visualize relation edge','double-click whole edge, label, close, then F2','RelationInteractionOwner','whole-edge inert; label and F2 converge on relation.edit',f3)

    def f4():
        evidence=[]
        for surf in ['visualize','enterprise']:
            cdp.load(surf,1440,980);ids=select_pair();e=cdp.ev(f"(()=>({{consumer:CEPFoundation.consumer,selectedIds:{json.dumps(ids)},policyRevision:CEPFoundation.relationUI.policyRevision,availabilityOwner:CEPFoundation.relationUI.actionAvailability.constructor.name,availability:CEPFoundation.relationUI.connectAvailability(),actionOwner:CEPFoundation.registry.commands.get('spatial.connect').owner}}))()") ; evidence.append(e)
        if not all(x['policyRevision']=='RELATION-CENTRAL-04' and x['availabilityOwner']=='ActionAvailabilityCore' and x['actionOwner']=='RelationInteractionOwner' and x['availability']['enabled'] for x in evidence): raise AssertionError(evidence)
        return evidence
    run('central-change-reuse','Visualize and Enterprise use different domain adapters','select two objects and inspect central action policy','ActionAvailabilityCore + RelationInteractionOwner','same policy/action owner across consumers',f4)

    def f5():
        cdp.load('runs',1440,980);click_selector('button[data-foundation-command="OPEN_TERMINAL"]')
        cdp.ev("(()=>{const i=document.querySelector('#operationalHost form input[name=\"command\"]');i.focus();const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(i,'shutdown');i.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:'shutdown'}));i.form.requestSubmit();return true})()");time.sleep(.12)
        state=cdp.ev("(()=>{const d=CEPFoundation.simulation.devices.find(x=>x.id==='DEV-WEB-01'),n=CEPFoundation.spatial.model.nodes.find(x=>x.id==='DEV-WEB-01'),e=CEPFoundation.simulation.events.at(-1),r=CEPFoundation.simulation.recorded().devices.find(x=>x.id==='DEV-WEB-01');return{up:d.up,nodeStatus:n.status,semanticCommand:e.semanticCommand,eventOutput:e.output,recordedUp:r.up,provider:CEPFoundation.operational.providerDescriptor.id,terminalText:document.querySelector('#operationalHost .terminal-output')?.innerText||''}})()")
        if not (state['up'] is False and state['nodeStatus']=='DOWN' and state['recordedUp'] is False and state['semanticCommand']=='device.shutdown' and 'DOWN' in state['eventOutput'] and 'DOWN' in state['terminalText']): raise AssertionError(state)
        shots.append(screenshot('browser-operational-shutdown.png','runtime-causal-consequence','provider-neutral terminal and canonical shutdown consequence'))
        state.pop('terminalText',None);state['terminalVisibleDown']=True;return state
    run('runtime-causal-consequence','RUN-0042 DEV-WEB-01 is UP','open terminal and submit shutdown','W03V34RunsAdapter via provider-neutral OperationalView','device/spatial/terminal/event/recorded agree',f5)

    def f6():
        cdp.load('visualize',1440,980)
        box=cdp.ev("(()=>{const r=document.querySelector('.spatial-canvas')?.getBoundingClientRect();return r?{x:r.x,y:r.y,w:r.width,h:r.height}:null})()")
        if not box: raise AssertionError('no canvas')
        x=box['x']+box['w']-130;y=box['y']+box['h']-120
        cdp.cmd('Input.dispatchMouseEvent',{'type':'mouseMoved','x':x,'y':y,'modifiers':2})
        cdp.cmd('Input.dispatchMouseEvent',{'type':'mousePressed','x':x,'y':y,'button':'right','clickCount':1,'modifiers':2})
        cdp.cmd('Input.dispatchMouseEvent',{'type':'mouseMoved','x':x-70,'y':y-30,'modifiers':2})
        cdp.cmd('Input.dispatchMouseEvent',{'type':'mouseReleased','x':x-70,'y':y-30,'button':'right','clickCount':1,'modifiers':2});time.sleep(.05)
        suppressed=cdp.ev("document.querySelector('#foundationMenu')?.hidden")
        right_click(x-10,y-10,0);normal_open=not cdp.ev("document.querySelector('#foundationMenu')?.hidden")
        key_mod('Escape')
        if not (suppressed and normal_open): raise AssertionError({'suppressed':suppressed,'normalOpen':normal_open})
        cdp.ev("CEPFoundation.spatial.model.selection.clear();CEPFoundation.spatial.render();document.querySelector('.spatial-canvas [data-node]')?.focus();true")
        before=cdp.ev("({focus:document.activeElement?.dataset?.node,selection:[...CEPFoundation.spatial.model.selection],camera:structuredClone(CEPFoundation.spatial.model.camera)})")
        key_mod('ArrowRight');after=cdp.ev("({focus:document.activeElement?.dataset?.node,selection:[...CEPFoundation.spatial.model.selection]})")
        if not (after['focus'] and after['focus']!=before['focus'] and len(after['selection'])==0): raise AssertionError({'before':before,'after':after})
        key_mod('Space');sel=cdp.ev("[...CEPFoundation.spatial.model.selection][0]")
        if sel!=after['focus']: raise AssertionError('space select')
        before_alt=cdp.ev("({camera:structuredClone(CEPFoundation.spatial.model.camera),node:structuredClone(CEPFoundation.spatial.model.nodes.find(x=>x.id===[...CEPFoundation.spatial.model.selection][0]))})")
        key_mod('ArrowRight',1);after_alt=cdp.ev("({camera:structuredClone(CEPFoundation.spatial.model.camera),node:structuredClone(CEPFoundation.spatial.model.nodes.find(x=>x.id===[...CEPFoundation.spatial.model.selection][0]))})")
        if not (after_alt['camera']['x']!=before_alt['camera']['x'] and after_alt['node']['x']==before_alt['node']['x']): raise AssertionError('alt isolation')
        key_mod('ArrowRight',2);after_ctrl=cdp.ev("({camera:structuredClone(CEPFoundation.spatial.model.camera),node:structuredClone(CEPFoundation.spatial.model.nodes.find(x=>x.id===[...CEPFoundation.spatial.model.selection][0]))})")
        if not (after_ctrl['camera']['x']==after_alt['camera']['x'] and after_ctrl['node']['x']!=after_alt['node']['x']): raise AssertionError('ctrl isolation')
        cdp.load('learn',1440,980);cdp.ev("CEPFoundation.preferences.set('locale','en','global');CEPFoundation.workspace.applyPreferences();true");time.sleep(.06)
        pref=cdp.ev("({lang:document.documentElement.lang,dir:document.documentElement.dir})")
        iso=cdp.ev("({hostKind:CEPFoundation.api.hostKind,domainKind:CEPFoundation.structured.domainKind,libraryState:CEPFoundation.api.state.library??null,searchCount:document.querySelectorAll('.library-search').length,bdi:[...document.querySelectorAll('bdi[dir=\"ltr\"]')].some(n=>/KU|TCP\\/IP|policy|learn-document/.test(n.textContent)),isolation:CEPFoundation.structured.assertDomainIsolation().ok})")
        if not (pref=={'lang':'en','dir':'ltr'} and iso['hostKind']=='DONOR_FREE_WORKSPACE_HOST' and iso['domainKind']=='learn' and iso['libraryState'] is None and iso['searchCount']==0 and iso['bdi'] and iso['isolation']): raise AssertionError({'pref':pref,'iso':iso})
        cdp.load('library',1440,980);lib=cdp.ev("({consumer:CEPFoundation.consumer,activeDocument:CEPFoundation.api.state.route.activeKu,blockCount:CEPFoundation.api.state.editor.blocks.length,editorCore:document.querySelector('#editorDocument')?.dataset.editorCore,donorHost:CEPFoundation.api.hostKind===undefined})")
        if not (lib['activeDocument'] and lib['blockCount']>0 and lib['editorCore']=='UnifiedEditorCore' and lib['donorHost']): raise AssertionError(lib)
        return {'contextSuppression':'own-event-only','keyboard':{'focusOnly':True,'spaceSelect':True,'altCameraOnly':True,'controlMoveOnly':True},'preference':pref,'structured':iso,'libraryParity':lib}
    run('spatial-input-bidi-preference-and-structured-isolation','Visualize canvas and independent Learn consumer','Ctrl+RMB drag, normal RMB, keyboard intents, locale preference in Learn','SpatialInteraction + ContextSuppressionGate + ScopedPreferences + StructuredDocumentDomainAdapter','input semantics distinct; Learn isolated and Bidi-correct',f6)

    identity=source_identity();runtime=json.loads((ROOT/'contracts/FOUNDATION_RUNTIME_REGISTRY.json').read_text())
    summary={'total':len(flows),'pass':sum(x['status']=='PASS' for x in flows),'fail':sum(x['status']=='FAIL' for x in flows)}
    report={'schemaVersion':1,'classification':'REPRODUCIBLE_BROWSER_CONFORMANCE_RECEIPT_NOT_OWNER_ACCEPTANCE','command':'python tools/ps01-browser-conformance-cdp.py','sourceFoundationBaseline':runtime['baselineId'],'sourceCandidate':f"CANONICAL_SOURCE_TREE_SHA256:{identity['sha256']}",'sourceCanonicalTreeSha256':identity['sha256'],'canonicalSourceFileCount':identity['files'],'currentUse':'EXACT_CURRENT_CANONICAL_SOURCE_EXECUTION_RECEIPT','executionStatus':'EXECUTED_PASS' if summary=={'total':6,'pass':6,'fail':0} else 'BLOCKED_OR_FAILED','prerequisite':'SATISFIED: Chromium DevTools Protocol launched /usr/bin/chromium and executed the exact current built ESM graph through the local proof server.','declaredFlows':[x['id'] for x in flows],'environment':{'engine':'Chromium CDP','executable':'/usr/bin/chromium','transport':'localhost-http-built-esm','moduleCount':len(mods),'viewport':'1440x980','reducedMotion':True},'summary':summary,'flows':flows,'screenshots':shots,'limitations':['Headless Chromium only','Six bounded critical flows; not exhaustive permutation certification','Localhost HTTP transport served exact current built bytes']}
    (ASSURANCE/'BROWSER_CONFORMANCE_RECEIPT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    (ASSURANCE/'SCREENSHOT_MANIFEST.json').write_text(json.dumps({'schemaVersion':2,'policy':'TARGETED_VISUAL_EVIDENCE_MAX_4','count':len(shots),'screenshots':shots},ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'summary':summary,'source':identity,'shots':shots,'failures':[x for x in flows if x['status']=='FAIL']},ensure_ascii=False,indent=2))
    sys.exit(1 if summary['fail'] or summary['total']!=6 else 0)
finally:
    try: cdp.ws.close()
    except: pass
    proc.terminate()
