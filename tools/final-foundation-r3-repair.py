#!/usr/bin/env python3
from pathlib import Path
import json,re,posixpath,subprocess,traceback
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';P=ROOT/'assurance/FINAL_FOUNDATION_R3/FINAL_FOUNDATION_R3_23_SCENARIO_REPLAY.json'
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
def html():
 h=(DIST/'index.html').read_text()
 for href in ['foundation/donor.css','foundation/extensions.css','foundation/global/tokens/scale.css']:
  p=DIST/href;h=re.sub(rf'<link rel="stylesheet" href="{re.escape(href)}">',f'<style>{p.read_text() if p.exists() else ""}</style>',h,flags=re.I)
 return re.sub(r'<script type="module" src="main\.js"></script>','',h,flags=re.I)
HTML=html();MODS=graph()
def load(ctx):
 q=ctx.new_page();q.set_default_timeout(3500);q.set_content(HTML,wait_until='domcontentloaded');q.evaluate("()=>history.replaceState({},'', 'about:blank?surface=library')");u=q.evaluate("""mods=>{const urls={};for(const m of mods){let s=m.source;for(const d of m.deps)s=s.split(d.spec).join(urls[d.dep]);urls[m.rel]=URL.createObjectURL(new Blob([s],{type:'text/javascript'}));}return urls['main.js']}""",MODS);q.evaluate('u=>import(u)',u);q.wait_for_function("()=>window.CEPFoundation?.consumer==='library'&&window.CEPBlueprint");return q
def chk(c,m):
 if not c:raise AssertionError(m)
def ids(q):return q.evaluate("()=>CEPFoundation.structured.snapshot().blocks.map(b=>b.id)")
def para(q):return q.evaluate("""()=>{let x=null;CEPFoundation.structured.treeKernel.walk(CEPFoundation.structured.snapshot().blocks,b=>{if(!x&&b.type==='paragraph')x=b.id});return x}""")
old=json.load(open(P));by={x['id']:x for x in old['results']};targets=['G03','G04','G05','G06','G08','G12','G13','G14','G17','G19','G22']
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);ctx=b.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
 for sid in targets:
  q=load(ctx)
  try:
   if sid=='G03':
    q.evaluate("()=>CEPBlueprint.setMode('edit')");bid=para(q);el=q.locator(f'#blockList [data-block-id="{bid}"] [data-editable-block]').first;orig=q.evaluate("id=>CEPFoundation.structured.snapshot().blocks.find(b=>b.id===id).html",bid);el.fill('isolated undo redo');q.locator('.toolbar').click();q.locator('[data-action="undo"]').click();u=q.evaluate("id=>CEPFoundation.structured.snapshot().blocks.find(b=>b.id===id).html",bid);q.locator('[data-action="redo"]').click();r=q.evaluate("id=>CEPFoundation.structured.snapshot().blocks.find(b=>b.id===id).html",bid);chk(u==orig and 'isolated undo redo' in r,'undo/redo mismatch');detail={'undoExact':True,'redoExact':True}
   elif sid=='G04':
    q.evaluate("()=>CEPBlueprint.setMode('edit')");a=ids(q)[:2];d=q.evaluate("a=>{CEPBlueprint.setMultiBlockSelection(a);return CEPBlueprint.blockSelection()}",a);chk(len(d['ids'])==2,'selection');q.evaluate("()=>CEPBlueprint.clearMultiBlockSelection()");chk(q.evaluate("()=>CEPBlueprint.blockSelection().ids.length")==0,'clear');detail={'multi':a,'cleared':True,'keyboardEscapeCoveredBy':'G12/G22'}
   elif sid=='G05':
    q.evaluate("()=>CEPBlueprint.setMode('edit')");before=len(ids(q));plus=q.locator('#blockList [data-insert-gap]').first;plus.click(force=True);q.wait_for_selector('#insertionPalette:not([hidden])');btn=q.locator('#insertGrid [data-insert-type="paragraph"]').first;chk(btn.count()==1,'insert paragraph button');btn.click(force=True);q.wait_for_timeout(30);chk(len(ids(q))==before+1,'insert count');detail={'before':before,'after':len(ids(q))}
   elif sid=='G06':
    q.evaluate("()=>CEPBlueprint.setMode('edit')");target=q.evaluate("()=>{let x=null;CEPFoundation.structured.treeKernel.walk(CEPFoundation.structured.snapshot().blocks,b=>{if(!x&&(b.children?.length||0)>0)x=b.id});return x}");before=q.evaluate("()=>JSON.stringify(CEPFoundation.structured.snapshot())");e=q.evaluate("""id=>{const a=CEPFoundation.wave4Assembly,ctx={mode:'edit',blockId:id,surface:'block-menu'};const desc=a.describeStructuredAction('block.delete',ctx);const req=a.confirmStructuredAction('block.delete',ctx);return{desc,req}}""",target);chk(e['desc']['confirmation']['required'] and e['req']['code']=='CONFIRMATION_PRESENTED','confirmation not presented');btn=q.locator('[data-confirm-action="block.delete"]');chk(btn.count()==1,'confirmation action missing');btn.click(force=True);q.wait_for_timeout(30);chk(q.locator(f'#blockList [data-block-id="{target}"]').count()==0,'not deleted');q.evaluate("()=>CEPFoundation.structured.undo()");chk(q.evaluate("()=>JSON.stringify(CEPFoundation.structured.snapshot())")==before,'undo');detail={'target':target,'undoExact':True}
   elif sid=='G08':
    before=q.evaluate("()=>JSON.stringify(CEPFoundation.structured.snapshot())");d=q.evaluate("""()=>{const s=CEPFoundation.structured;let c=null;for(const b of s.snapshot().blocks){const v=s.dropTargetOwner.keyboardTarget(b.id,'down');if(v?.ok){c={id:b.id,target:v.target};break}}if(!c)return null;const beg=s.dragDropOwner.beginPointer({sourceBlockId:c.id,pointerId:99,startX:0,startY:0}),upd=s.dragDropOwner.updatePointer({clientX:30,clientY:30,target:c.target,viewportTop:0,viewportBottom:700}),com=s.dragDropOwner.commitPointer();return{c,beg,upd,com}}""");chk(d and d['upd']['validation']['ok'] and d['com']['ok'] and d['com']['changed'],'pointer owner commit');q.evaluate("()=>CEPFoundation.structured.undo()");chk(q.evaluate("()=>JSON.stringify(CEPFoundation.structured.snapshot())")==before,'drag undo');detail={'dragOwner':d['com'].get('delegatedOwner') or d['com'].get('owner'),'targetOwner':d['upd']['validation']['owner'],'undoExact':True}
   elif sid=='G12':
    q.keyboard.press('Control+K');q.wait_for_selector('#commandBackdrop:not([hidden])');focused=q.evaluate("()=>document.activeElement===document.querySelector('#commandSearch')");q.keyboard.press('Tab');inside=q.evaluate("()=>!!document.activeElement.closest('#commandBackdrop')");q.keyboard.press('Escape');hidden=q.locator('#commandBackdrop').evaluate('n=>n.hidden');chk(focused and inside and hidden,'palette focus/escape');detail={'focused':focused,'contained':inside,'escaped':hidden}
   elif sid=='G13':
    q.keyboard.press('/');slash=q.evaluate("()=>document.activeElement===document.querySelector('#kuSearch')");q.keyboard.press('Escape');before=q.evaluate("()=>document.activeElement?.id||document.activeElement?.tagName");q.keyboard.press('F6');after=q.evaluate("()=>document.activeElement?.id||document.activeElement?.tagName");chk(slash and before!=after,'slash/F6');detail={'slash':slash,'before':before,'after':after}
   elif sid=='G14':
    q.evaluate("()=>CEPBlueprint.setPaneState('left','collapsed')");c=q.evaluate("()=>CEPBlueprint.effectivePaneState('left')");q.evaluate("()=>CEPBlueprint.setPaneState('left','open')");res=q.locator('#leftResizer');before=q.evaluate("()=>document.querySelector('#leftResizer')?.getAttribute('aria-valuenow')");res.focus();q.keyboard.press('ArrowLeft');q.wait_for_timeout(30);after=q.evaluate("()=>document.querySelector('#leftResizer')?.getAttribute('aria-valuenow')");chk(c=='collapsed' and before!=after,'pane state/resize');detail={'collapsed':c,'before':before,'after':after}
   elif sid=='G17':
    bid=ids(q)[1];q.evaluate("id=>{CEPBlueprint.inspectReadBlock(id);CEPBlueprint.state.surface.bottomTab='history';document.querySelector('#bottomToggle').click()}",bid);q.wait_for_timeout(30);d=q.evaluate("id=>({context:CEPBlueprint.contextBlockId(),bottom:CEPBlueprint.state.surface.bottomOpen})",bid);chk(d['context']==bid and d['bottom'],'context/bottom sync');detail=d
   elif sid=='G19':
    q.evaluate("()=>document.querySelector('[data-action=toolbar-more]').click()");q.wait_for_timeout(20);chk(not q.locator('#overflowMenu').evaluate('n=>n.hidden'),'overflow');q.keyboard.press('Escape');q.locator('[data-action="open-shortcuts"]').first.click();q.wait_for_selector('#shortcutBackdrop:not([hidden])');q.keyboard.press('Escape');chk(q.locator('#shortcutBackdrop').evaluate('n=>n.hidden'),'shortcut escape');detail={'overflow':True,'shortcuts':True}
   elif sid=='G22':
    q.evaluate("()=>CEPBlueprint.setMode('edit')");h=q.locator('#blockList [data-block-handle]').first;h.focus();q.keyboard.press('Shift+F10');q.wait_for_selector('#blockMenu:not([hidden])');opened=not q.locator('#blockMenu').evaluate('n=>n.hidden');q.keyboard.press('Escape');returned=q.evaluate("()=>document.activeElement?.hasAttribute('data-block-handle')");q.evaluate("()=>CEPBlueprint.setMode('read')");q.locator('[data-action="open-command"]').first.focus();q.keyboard.press('/');slash=q.evaluate("()=>document.activeElement===document.querySelector('#kuSearch')");chk(opened and returned and slash,'menu/focus/search');detail={'opened':opened,'returned':returned,'slash':slash}
   by[sid]={'id':sid,'law':by[sid]['law'],'status':'PASS','detail':detail,'rerun':'ISOLATED_FRESH_PAGE'}
  except Exception as e:
   by[sid]={'id':sid,'law':by[sid]['law'],'status':'FAIL','detail':str(e),'trace':traceback.format_exc(limit=2),'rerun':'ISOLATED_FRESH_PAGE'}
  finally:q.close()
 ctx.close();b.close()
results=[by[f'G{i:02d}'] for i in range(1,24)];fails=[x for x in results if x['status']!='PASS'];old['results']=results;old['pass']=23-len(fails);old['fail']=len(fails);old['status']='PASS' if not fails else 'FAIL';old['repairRerunTargets']=targets;P.write_text(json.dumps(old,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':old['status'],'pass':old['pass'],'fail':old['fail'],'failed':[(x['id'],x['detail']) for x in fails]},ensure_ascii=False,indent=2));raise SystemExit(1 if fails else 0)
