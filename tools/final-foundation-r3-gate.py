#!/usr/bin/env python3
from pathlib import Path
import json,re,posixpath,subprocess,hashlib,traceback,os
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';OUT=ROOT/'assurance'/'FINAL_FOUNDATION_R3';OUT.mkdir(parents=True,exist_ok=True)
PAT1=re.compile(r"(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.{1,2}/[^'\"]+)['\"]");PAT2=re.compile(r"import\(\s*['\"](\.{1,2}/[^'\"]+)['\"]\s*\)")
def specs(s):return list(dict.fromkeys(PAT1.findall(s)+PAT2.findall(s)))
def resolve(rel,spec):return posixpath.normpath(posixpath.join(posixpath.dirname(rel),spec))
def graph(entry='main.js'):
 seen=set();order=[]
 def walk(rel):
  if rel in seen:return
  seen.add(rel);src=(DIST/rel).read_text()
  for sp in specs(src):walk(resolve(rel,sp))
  order.append(rel)
 walk(entry);return [{'rel':r,'source':(DIST/r).read_text(),'deps':[{'spec':sp,'dep':resolve(r,sp)} for sp in specs((DIST/r).read_text())]} for r in order]
def source_identity():
 code="import {canonicalSourceIdentity} from './tools/source-tree-identity.mjs';const x=await canonicalSourceIdentity(new URL('file://'+process.cwd().replaceAll('\\\\','/')+'/'));console.log(JSON.stringify(x))"
 return json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=ROOT,text=True))
def html():
 h=(DIST/'index.html').read_text()
 for href,name in [('foundation/donor.css','donor'),('foundation/extensions.css','extensions'),('foundation/global/tokens/scale.css','scale')]:
  p=DIST/href;css=p.read_text() if p.exists() else '';h=re.sub(rf'<link rel="stylesheet" href="{re.escape(href)}">',f'<style data-inline="{name}">{css}</style>',h,flags=re.I)
 return re.sub(r'<script type="module" src="main\.js"></script>','',h,flags=re.I)
HTML=html();MODULES=graph();results=[];shots=[]
def assert_(c,m):
 if not c:raise AssertionError(m)
def record(id,law,detail):results.append({'id':id,'law':law,'status':'PASS','detail':detail})
def fresh(ctx,viewport=None):
 page=ctx.new_page();page.set_default_timeout(2500)
 if viewport: page.set_viewport_size(viewport)
 errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
 page.set_content(HTML,wait_until='domcontentloaded');page.evaluate("()=>history.replaceState({},'', 'about:blank?surface=library')")
 entry=page.evaluate("""mods=>{const urls={};for(const m of mods){let src=m.source;for(const d of m.deps)src=src.split(d.spec).join(urls[d.dep]);urls[m.rel]=URL.createObjectURL(new Blob([src],{type:'text/javascript'}));}return urls['main.js']}""",MODULES);page.evaluate("u=>import(u)",entry);page.wait_for_function("()=>window.CEPFoundation?.consumer==='library'&&window.CEPBlueprint");page.evaluate("()=>window.__R3_ERRORS=[]")
 return page,errs
def ids(page):return page.evaluate("()=>CEPFoundation.structured.snapshot().blocks.map(b=>b.id)")
def first_id(page):return page.evaluate("()=>CEPFoundation.structured.snapshot().blocks[0].id")
def first_para(page):return page.evaluate("()=>{let x=null;CEPFoundation.structured.treeKernel.walk(CEPFoundation.structured.snapshot().blocks,b=>{if(!x&&b.type==='paragraph')x=b.id});return x}")
def screenshot(page,name):
 p=OUT/name;page.screenshot(path=str(p),full_page=False);shots.append({'path':str(p.relative_to(ROOT)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})

ONLY=set(filter(None,os.environ.get('R3_ONLY','').split(',')))
def run(ctx,id,law,fn,viewport=None):
 if ONLY and id not in ONLY:return
 page,errors=fresh(ctx,viewport)
 try:
  detail=fn(page);assert_(not errors,'page errors: '+repr(errors));record(id,law,detail)
 except Exception as e:
  results.append({'id':id,'law':law,'status':'FAIL','detail':str(e),'trace':traceback.format_exc(limit=3)})
 finally:
  page.close()

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);ctx=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
 run(ctx,'G01','GL-01/GL-12',lambda q:(lambda d:(assert_(d['mode']=='read' and d['band']=='wide' and d['blocks']>0 and d['editables']==0 and d['left']!='hidden' and d['right']!='hidden','shell/read geometry truth failed'),screenshot(q,'G01_final_1440x1000.png'),d)[2])(q.evaluate("""()=>({mode:CEPBlueprint.state.surface.mode,band:document.body.dataset.responsiveBand,blocks:document.querySelectorAll('#blockList .block').length,editables:document.querySelectorAll('#blockList [contenteditable=true]').length,left:CEPBlueprint.effectivePaneState('left'),right:CEPBlueprint.effectivePaneState('right'),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth})""")))
 def g02(q):
  q.evaluate("()=>CEPBlueprint.setMode('edit')");bid=first_para(q);el=q.locator(f'#blockList [data-block-id="{bid}"] [data-editable-block]').first;before=q.evaluate("()=>CEPFoundation.structured.transactionDescriptor().workingRevision");el.fill('Final gate edit TCP/IP');q.locator('.toolbar').click();q.wait_for_timeout(50);d=q.evaluate("id=>({html:CEPFoundation.structured.snapshot().blocks.find(b=>b.id===id)?.html,tx:CEPFoundation.structured.transactionDescriptor(),selected:CEPBlueprint.state.editor.selectedBlock})",bid);assert_('Final gate edit' in (d['html'] or '') and d['tx']['workingRevision']>before,'edit did not commit canonical history');return d
 run(ctx,'G02','GL-02',g02)
 def g03(q):
  q.evaluate("()=>CEPBlueprint.setMode('edit')");bid=first_para(q);el=q.locator(f'#blockList [data-block-id="{bid}"] [data-editable-block]').first;before=el.inner_text();el.fill('R3 undo redo proof');q.locator('.toolbar').click();q.evaluate("()=>CEPBlueprint.undo('main')");u=q.evaluate("id=>CEPFoundation.structured.snapshot().blocks.find(b=>b.id===id)?.html",bid);q.evaluate("()=>CEPBlueprint.redo('main')");r=q.evaluate("id=>CEPFoundation.structured.snapshot().blocks.find(b=>b.id===id)?.html",bid);assert_('R3 undo redo proof' not in (u or '') and 'R3 undo redo proof' in (r or ''),'undo/redo canonical failure');return {'undo':u,'redo':r,'before':before}
 run(ctx,'G03','GL-02/GL-04',g03)
 def g04(q):
  q.evaluate("()=>CEPBlueprint.setMode('edit')");arr=ids(q)[:2];d=q.evaluate("a=>{CEPBlueprint.setMultiBlockSelection(a);return CEPBlueprint.blockSelection()}",arr);assert_(len(d['ids'])==2,'multi selection not canonical');src=(ROOT/'stack/native-typescript/foundation/accepted-runtime.ts').read_text();assert_("if(e.key==='Escape')" in src and 'clearMultiBlockSelection()' in src,'Escape selection-clear route missing');q.evaluate("()=>CEPBlueprint.clearMultiBlockSelection()");after=q.evaluate("()=>CEPBlueprint.blockSelection().ids.length");assert_(after==0,'canonical selection clear failed');return {'selected':arr,'cleared':True,'escapeBindingStatic':True}
 run(ctx,'G04','GL-03',g04)
 def g05(q):
  q.evaluate("()=>CEPBlueprint.setMode('edit')");before=len(ids(q));plus=q.locator('#blockList [data-insert-gap]').first;plus.evaluate('e=>e.click()');q.wait_for_selector('#insertionPalette:not([hidden])');btn=q.locator('#insertGrid [data-insert-type="paragraph"]').first
  if btn.count()==0: btn=q.locator('#insertGrid [data-insert-type]').first
  assert_(btn.count()==1,'insertion command missing');btn.evaluate('e=>e.click()');q.wait_for_timeout(40);after=len(ids(q));assert_(after==before+1,'insertion did not create exactly one block');return {'before':before,'after':after,'owner':q.evaluate("()=>CEPFoundation.registry.receipts.at(-1)?.owner")}
 run(ctx,'G05','GL-04',g05)
 def g06(q):
  q.evaluate("()=>CEPBlueprint.setMode('edit')");target=q.evaluate("()=>{let x=null;CEPFoundation.structured.treeKernel.walk(CEPFoundation.structured.snapshot().blocks,b=>{if(!x&&(b.children?.length||0)>0)x=b.id});return x}");assert_(target,'no subtree target');before=q.evaluate("()=>JSON.stringify(CEPFoundation.structured.snapshot())");h=q.locator(f'#blockList [data-block-id="{target}"] [data-block-handle]').first;h.focus();q.keyboard.press('Shift+F10');q.wait_for_selector('#blockMenu:not([hidden])');dele=q.locator('#blockMenu [data-menu-cmd="delete"]').first;assert_(dele.count()==1,'delete command missing');dele.evaluate('e=>e.click()');q.wait_for_timeout(20);confirm=q.locator('[data-delete-confirm="confirm"]:visible,[data-confirm-action="block.delete"]:visible').first;assert_(confirm.count()==1,'visible delete confirmation missing');confirm.evaluate('e=>e.click()');q.wait_for_timeout(30);assert_(q.locator(f'#blockList [data-block-id="{target}"]').count()==0,'subtree target still visible');q.evaluate("()=>CEPBlueprint.undo('main')");after=q.evaluate("()=>JSON.stringify(CEPFoundation.structured.snapshot())");assert_(after==before,'delete undo not exact');return {'target':target,'undoExact':True,'confirmed':True}
 run(ctx,'G06','GL-04',g06)
 def g07(q):
  q.evaluate("()=>CEPBlueprint.setMode('edit')");before=ids(q);res=q.evaluate("""()=>{const s=CEPFoundation.structured;for(const b of s.snapshot().blocks){const v=s.dropTargetOwner.keyboardTarget(b.id,'down');if(v?.ok)return s.dragDropOwner.reorderKeyboard(b.id,'down')}return null}""");assert_(res and res['ok'] and res['changed'],'keyboard reorder failed');after=ids(q);assert_(after!=before,'reorder no-op');q.evaluate("()=>CEPBlueprint.undo('main')");assert_(ids(q)==before,'reorder undo failed');return {'owner':res.get('delegatedOwner'),'undoExact':True}
 run(ctx,'G07','GL-04',g07)
 def g08(q):
  q.evaluate("()=>CEPBlueprint.setMode('edit')");before=ids(q);d=q.evaluate("""()=>{const s=CEPFoundation.structured, blocks=s.snapshot().blocks;let src=null,v=null;for(const b of blocks){v=s.dropTargetOwner.keyboardTarget(b.id,'down');if(v?.ok){src=b.id;break}}if(!src)return null;const begin=s.dragDropOwner.beginPointer({sourceBlockId:src,pointerId:77,startX:10,startY:10});const upd=s.dragDropOwner.updatePointer({clientX:30,clientY:30,target:v.target,viewportTop:0,viewportBottom:800});const pre=JSON.stringify(s.snapshot());const commit=s.dragDropOwner.commitPointer({target:v.target,transactionLabel:'R3 pointer reorder'});return {src,begin,upd,commit,pre,post:JSON.stringify(s.snapshot())}}""");assert_(d and d['begin']['ok'] and d['upd']['active'] and d['commit']['ok'] and d['commit']['changed'],'canonical pointer drag/drop failed');after=ids(q);assert_(after!=before and d['pre']!=d['post'],'drop did not commit');q.evaluate("()=>CEPBlueprint.undo('main')");assert_(ids(q)==before,'drag undo failed');return {'commitOnDrop':True,'indicator':d['upd']['indicator'],'undoExact':True,'owner':d['commit']['owner']}
 run(ctx,'G08','GL-04',g08)
 def g09(q):
  q.evaluate("()=>CEPBlueprint.setMode('edit')");bid=first_para(q);d=q.evaluate("""id=>{const el=document.querySelector(`#blockList [data-block-id="${id}"] [data-editable-block]`);const t=el.firstChild||el;const r=document.createRange();r.selectNodeContents(el);window.getSelection().removeAllRanges();window.getSelection().addRange(r);CEPBlueprint.updateSelectionToolbar();const c=CEPBlueprint.state.transient.selection;return {text:window.getSelection().toString(),selection:!!c,toolbar:!document.querySelector('#selectionToolbar').hidden}}""",bid);assert_(d['selection'] and d['toolbar'] and len(d['text'])>0,'real text selection not captured');return d
 run(ctx,'G09','GL-03/GL-05',g09)
 def g10(q):
  q.evaluate("()=>CEPBlueprint.setMode('edit')");bid=first_para(q);before=len(ids(q));d=q.evaluate("""async id=>{const old=CEPBlueprint.ClipboardService.writePayload;CEPBlueprint.ClipboardService.writePayload=async p=>({ok:true,types:['text/plain']});try{return await CEPBlueprint.cutBlock('main',id)}finally{CEPBlueprint.ClipboardService.writePayload=old}}""",bid);q.wait_for_timeout(30);after=len(ids(q));assert_(after==before-1,'successful cut did not atomically delete once');q.evaluate("()=>CEPBlueprint.undo('main')");assert_(len(ids(q))==before,'cut undo failed');return {'before':before,'after':after,'result':d,'undoExact':True}
 run(ctx,'G10','GL-05',g10)
 def g11(q):
  d=q.evaluate("""()=>CEPFoundation.wave4Assembly.sanitizeRichInline('<strong onclick="x()">ok</strong><script>alert(1)</script><a href="javascript:bad">x</a>')""");assert_(d['safe'] and '<script' not in d['html'].lower() and 'onclick' not in d['html'].lower() and 'javascript:' not in d['html'].lower(),'sanitizer unsafe');return d
 run(ctx,'G11','GL-06',g11)
 def g12(q):
  q.keyboard.press('Control+K');q.wait_for_selector('#commandBackdrop:not([hidden])');before=q.locator('#commandSearch').evaluate('e=>e===document.activeElement');q.keyboard.press('Tab');inside=q.evaluate("()=>!!document.activeElement.closest('#commandBackdrop')");q.keyboard.press('Escape');hidden=q.locator('#commandBackdrop').evaluate('n=>n.hidden');assert_(before and inside and hidden,'palette focus trap/Escape failed');screenshot(q,'G12_final_command_palette.png');return {'searchFocused':before,'tabContained':inside,'escaped':hidden}
 run(ctx,'G12','GL-07',g12)
 def g13(q):
  q.keyboard.press('/');slash=q.locator('#kuSearch').evaluate('e=>e===document.activeElement');q.keyboard.press('Escape');before=q.evaluate('()=>document.activeElement?.id||document.activeElement?.dataset?.region||document.activeElement?.tagName');q.keyboard.press('F6');after=q.evaluate('()=>document.activeElement?.id||document.activeElement?.dataset?.region||document.activeElement?.tagName');assert_(slash and before!=after,'slash search or F6 region cycle failed');return {'slashFocusedSearch':slash,'before':before,'afterF6':after}
 run(ctx,'G13','GL-07',g13)
 def g14(q):
  q.evaluate("()=>CEPBlueprint.setPaneState('left','collapsed')");collapsed=q.evaluate("()=>CEPBlueprint.effectivePaneState('left')");q.evaluate("()=>CEPBlueprint.setPaneState('left','open')");res=q.locator('#leftResizer');before=res.get_attribute('aria-valuenow');res.focus();q.keyboard.press('ArrowRight');after=res.get_attribute('aria-valuenow');assert_(collapsed=='collapsed' and before!=after,'pane collapse/keyboard resize failed');return {'collapsed':collapsed,'resizeBefore':before,'resizeAfter':after}
 run(ctx,'G14','GL-08',g14)
 def g15(q):
  before=q.evaluate("()=>({left:CEPBlueprint.effectivePaneState('left'),right:CEPBlueprint.effectivePaneState('right')})");q.evaluate("()=>CEPBlueprint.toggleFocus()");focus=q.evaluate("()=>document.body.dataset.focusMode||CEPBlueprint.state.surface.focusMode");q.evaluate("()=>CEPBlueprint.toggleFocus()");after=q.evaluate("()=>({left:CEPBlueprint.effectivePaneState('left'),right:CEPBlueprint.effectivePaneState('right')})");assert_(after==before,'focus mode did not restore pane preferences');screenshot(q,'G15_final_focus.png');return {'focusState':focus,'restored':True}
 run(ctx,'G15','GL-08',g15)
 def g16(q):
  q.evaluate("()=>CEPBlueprint.setMode('edit')");bid=first_para(q);before=q.evaluate("id=>CEPFoundation.structured.snapshot().blocks.find(b=>b.id===id)?.dir",bid);auto=q.evaluate("()=>({ar:CEPBlueprint.firstStrongDirection('مرحبا TCP/IP'),en:CEPBlueprint.firstStrongDirection('TCP/IP مرحبا')})");res=q.evaluate("id=>CEPFoundation.structured.executeSharedCommand('block.direction',{mode:'edit',blockId:id,value:'ltr',route:'r3-final'})",bid);mid=q.evaluate("id=>CEPFoundation.structured.snapshot().blocks.find(b=>b.id===id)?.dir",bid);q.evaluate("()=>CEPBlueprint.undo('main')");end=q.evaluate("id=>CEPFoundation.structured.snapshot().blocks.find(b=>b.id===id)?.dir",bid);assert_(auto['ar']=='rtl' and auto['en']=='ltr' and res['ok'] and mid=='ltr' and end==before,'bidi explicit/auto/undo failed');return {'auto':auto,'before':before,'mid':mid,'undo':end}
 run(ctx,'G16','GL-09',g16)
 def g17(q):
  bid=first_id(q);q.evaluate("id=>CEPBlueprint.selectBlock('main',id,false,'r3-final')",bid);q.evaluate("()=>{CEPBlueprint.state.surface.bottomTab='history';document.querySelector('#bottomToggle').click()}");q.wait_for_timeout(30);d=q.evaluate("id=>({selected:CEPBlueprint.state.editor.selectedBlock,context:CEPBlueprint.contextBlockId(),bottom:CEPBlueprint.state.surface.bottomOpen})",bid);assert_(d['selected']==bid and d['context']==bid and d['bottom'],'tree/editor/context/bottom sync failed');return d
 run(ctx,'G17','GL-10',g17)
 def g18(q):
  s=q.locator('#kuSearch');s.fill('NO_MATCH_FINAL_GATE_zzzz');q.wait_for_timeout(60);d=q.evaluate("()=>({count:document.querySelectorAll('#structureTree [data-ku]').length,text:document.querySelector('#structureTree')?.textContent||'',empty:!!document.querySelector('#structureTree [data-empty],#structureTree .empty')})");assert_(d['count']==0 or d['empty'] or len(d['text'].strip())<20,'explicit empty search state missing');s.fill('');q.wait_for_timeout(30);assert_(q.locator('#structureTree [data-ku]').count()>0 or len(q.locator('#structureTree').inner_text())>0,'search recovery failed');return {'emptyProjection':d,'recovered':True}
 run(ctx,'G18','GL-11',g18)
 def g19(q):
  more=q.locator('[data-action="toolbar-more"]').first;assert_(more.count()==1,'toolbar-more missing');more.evaluate('e=>e.click()');q.wait_for_selector('[data-settings-center-owner]');settings=q.locator('[data-settings-center-owner]');search=q.locator('[data-settings-search]');focused=search.evaluate('e=>e===document.activeElement');assert_(settings.count()==1 and focused,'SettingsCenter did not open/focus');src=(ROOT/'stack/native-typescript/foundation/wave4-assembly.ts').read_text();assert_("event.key==='Escape'" in src and "closeSettings('escape')" in src,'SettingsCenter Escape binding missing');closed=q.evaluate("()=>CEPFoundation.wave4Assembly.closeSettings('r3-escape-route')");q.wait_for_timeout(20);assert_(closed and q.locator('[data-settings-center-owner]').count()==0,'SettingsCenter canonical close route failed');short=q.locator('[data-action="open-shortcuts"]').first;assert_(short.count()==1,'shortcut trigger missing');short.evaluate('e=>e.click()');q.wait_for_selector('#shortcutBackdrop:not([hidden])');q.keyboard.press('Tab');inside=q.evaluate("()=>!!document.activeElement.closest('#shortcutBackdrop')");closed2=q.evaluate('()=>CEPBlueprint.topEscape()');hidden=q.locator('#shortcutBackdrop').evaluate('n=>n.hidden');assert_(inside and closed2 and hidden,'shortcut focus containment/canonical Escape route failed');return {'settingsOwner':'SettingsCenterOwner','settingsFocused':focused,'settingsEscapeBindingStatic':True,'shortcutFocusContained':inside,'canonicalEscapeRoute':True}
 run(ctx,'G19','GL-07/GL-11',g19)
 def g20(q):
  q.set_viewport_size({'width':1100,'height':800});q.wait_for_timeout(60);mid=q.evaluate("()=>({band:document.body.dataset.responsiveBand,overlay:document.body.dataset.overlayPane||'',w:document.documentElement.scrollWidth,c:document.documentElement.clientWidth})");q.set_viewport_size({'width':720,'height':800});q.wait_for_timeout(80);small=q.evaluate("()=>({band:document.body.dataset.responsiveBand,overlay:document.body.dataset.overlayPane||'',w:document.documentElement.scrollWidth,c:document.documentElement.clientWidth,left:CEPBlueprint.effectivePaneState('left'),right:CEPBlueprint.effectivePaneState('right')})");assert_(mid['band']!=small['band'] and small['w']<=small['c']+2,'responsive bands/horizontal overflow failed');screenshot(q,'G20_final_responsive.png');q.set_viewport_size({'width':1440,'height':1000});q.wait_for_timeout(50);return {'mid':mid,'small':small}
 run(ctx,'G20','GL-12',g20,{'width':1440,'height':900})
 def g21(q):
  hidden=q.locator('#stateLab').evaluate('n=>n.hidden');q.evaluate("()=>{CEPBlueprint.state.surface.bottomTab='recovery';document.querySelector('#bottomToggle').click()}");q.wait_for_timeout(30);txt=q.locator('#bottomContent').inner_text();assert_(hidden and len(txt)>0,'StateLab hidden/recovery surface failed');return {'stateLabHidden':hidden,'recoveryVisible':True}
 run(ctx,'G21','GL-11',g21)
 def g22(q):
  h=q.locator('#blockList [data-block-handle]').first;h.focus();h.press('Shift+F10');q.wait_for_selector('#blockMenu:not([hidden])');q.wait_for_timeout(30);opened=not q.locator('#blockMenu').evaluate('n=>n.hidden');search=q.locator('[data-block-menu-search]');assert_(search.count()==1,'block menu search missing');src=(ROOT/'stack/native-typescript/foundation/accepted-runtime.ts').read_text();assert_("e.target.closest('#blockMenu')&&e.key==='/'" in src and "if(e.key==='Escape')" in src and 'topEscape()' in src,'menu keyboard bindings missing');search.focus();slash=search.evaluate('e=>e===document.activeElement');assert_(opened and slash,'keyboard block menu/search focus failed');closed=q.evaluate('()=>CEPBlueprint.topEscape()');q.wait_for_timeout(20);hidden=q.locator('#blockMenu').evaluate('n=>n.hidden');returned=q.locator('#blockList [data-block-handle]').first.evaluate('e=>e===document.activeElement');assert_(closed and hidden and returned,'canonical Escape route/focus return failed');return {'menuOpened':opened,'slashBindingStatic':True,'menuSearchFocused':slash,'canonicalEscapeRoute':True,'focusReturned':returned}
 run(ctx,'G22','GL-07',g22)
 def g23(q):
  q.evaluate("()=>CEPBlueprint.setMode('edit')");bid=first_para(q);before=q.evaluate("()=>JSON.stringify(CEPFoundation.structured.snapshot())");d=q.evaluate("""async id=>{const old=CEPBlueprint.ClipboardService.writePayload;CEPBlueprint.ClipboardService.writePayload=async()=>{throw new Error('R3_CLIPBOARD_UNAVAILABLE')};try{try{await CEPBlueprint.cutBlock('main',id);return {threw:false}}catch(e){return {threw:true,msg:String(e)}}}finally{CEPBlueprint.ClipboardService.writePayload=old}}""",bid);after=q.evaluate("()=>JSON.stringify(CEPFoundation.structured.snapshot())");assert_(before==after,'clipboard failure mutated document');return {'failureObserved':d,'unchanged':True}
 run(ctx,'G23','GL-05',g23)
 ctx.close();browser.close()
identity=source_identity();failed=[x for x in results if x['status']!='PASS'];laws=sorted(set(x['law'] for x in results if x['status']=='PASS'))
receipt={'schemaVersion':1,'kind':'FINAL_FOUNDATION_R3_23_SCENARIO_REPLAY','classification':'CONTROLLER_FINAL_FOUNDATION_GATE_EVIDENCE','status':'PASS' if not failed and len(results)==23 else 'FAIL','sourceCanonicalTreeSha256':identity['sha256'],'canonicalSourceFileCount':identity['files'],'scenarioCount':len(results),'pass':len(results)-len(failed),'fail':len(failed),'results':results,'screenshots':shots,'r3LawCoverage':laws}
target=OUT/(f"FINAL_FOUNDATION_R3_CHUNK_{os.environ.get('R3_CHUNK','ALL')}.json" if ONLY else 'FINAL_FOUNDATION_R3_23_SCENARIO_REPLAY.json')
expected=len(ONLY) if ONLY else 23
receipt['status']='PASS' if not failed and len(results)==expected else 'FAIL'
target.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':receipt['status'],'pass':receipt['pass'],'fail':receipt['fail'],'failed':[x['id'] for x in failed],'source':identity,'file':str(target)},ensure_ascii=False,indent=2));raise SystemExit(1 if failed or len(results)!=expected else 0)
