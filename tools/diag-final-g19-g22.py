#!/usr/bin/env python3
from pathlib import Path
import re,posixpath,json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist'
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
MODS=graph();HTML=html()
def load(ctx):
 q=ctx.new_page();q.set_default_timeout(5000);q.set_content(HTML,wait_until='domcontentloaded');q.evaluate("()=>history.replaceState({},'', 'about:blank?surface=library')");u=q.evaluate("""mods=>{const urls={};for(const m of mods){let s=m.source;for(const d of m.deps)s=s.split(d.spec).join(urls[d.dep]);urls[m.rel]=URL.createObjectURL(new Blob([s],{type:'text/javascript'}));}return urls['main.js']}""",MODS);q.evaluate('u=>import(u)',u);q.wait_for_function("()=>window.CEPFoundation?.consumer==='library'&&window.CEPFoundation.wave4Assembly&&window.CEPBlueprint");return q
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);ctx=b.new_context(viewport={'width':1440,'height':1000})
 q=load(ctx)
 print('before G19',q.evaluate("()=>({wave4:!!CEPFoundation.wave4Assembly,open:CEPFoundation.wave4Assembly.settings.presentation.open,buttons:[...document.querySelectorAll('[data-action=toolbar-more]')].map(x=>({tag:x.tagName,hidden:x.hidden,display:getComputedStyle(x).display,txt:x.textContent}))})"))
 q.locator('[data-action="toolbar-more"]').first.evaluate('el=>el.click()');q.wait_for_timeout(100)
 print('after click G19',q.evaluate("()=>({open:CEPFoundation.wave4Assembly.settings.presentation.open,settingsDom:document.querySelectorAll('[data-wave4-settings]').length,settingsOwnerDom:document.querySelectorAll('[data-settings-center-owner]').length,workspaceDialog:document.querySelectorAll('.backdrop').length,active:document.activeElement?.outerHTML?.slice(0,300),top:CEPFoundation.transientOwner.top?.()})"))
 direct=q.evaluate("()=>CEPBlueprint.openOverflow(document.querySelector('[data-action=toolbar-more]'))")
 q.wait_for_timeout(50)
 print('after direct',q.evaluate("()=>({directOwner:CEPFoundation.wave4Assembly.settings.owner,open:CEPFoundation.wave4Assembly.settings.presentation.open,settingsDom:document.querySelectorAll('[data-wave4-settings]').length,settingsOwnerDom:document.querySelectorAll('[data-settings-center-owner]').length,top:CEPFoundation.transientOwner.top?.()})"))
 q.close()
 q=load(ctx);q.evaluate("()=>CEPBlueprint.setMode('edit')");h=q.locator('#blockList [data-block-handle]').first; bid=h.evaluate("el=>el.closest('[data-block-id]')?.dataset.blockId");h.focus();print('before menu',bid,q.evaluate("()=>({active:document.activeElement?.outerHTML?.slice(0,250),connected:document.activeElement?.isConnected})"));q.keyboard.press('Shift+F10');q.wait_for_timeout(50);print('after open',q.evaluate("()=>({menuHidden:document.querySelector('#blockMenu').hidden,active:document.activeElement?.outerHTML?.slice(0,250),stored:{id:CEPBlueprint.state.transient.blockMenu?.id,surface:CEPBlueprint.state.transient.blockMenu?.surfaceKey,invConnected:CEPBlueprint.state.transient.blockMenu?.invoker?.isConnected}})"));q.keyboard.press('/');q.wait_for_timeout(20);q.evaluate("()=>{window.__escEvents=[];document.addEventListener('keydown',e=>{if(e.key==='Escape')window.__escEvents.push({phase:'capture',target:e.target.outerHTML?.slice(0,120)})},true);document.activeElement?.addEventListener('keydown',e=>{if(e.key==='Escape')window.__escEvents.push({phase:'target',target:e.target.outerHTML?.slice(0,120)})})}");print('after slash',q.evaluate("()=>({active:document.activeElement?.outerHTML?.slice(0,250),isSearch:document.activeElement?.matches?.('[data-block-menu-search]')})"));q.evaluate("()=>document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true,cancelable:true}))");q.wait_for_timeout(50);print('esc events',q.evaluate('()=>window.__escEvents'));print('after escape',q.evaluate("id=>({menuHidden:document.querySelector('#blockMenu').hidden,active:document.activeElement?.outerHTML?.slice(0,350),activeBlock:document.activeElement?.closest?.('[data-block-id]')?.dataset?.blockId,handle:document.activeElement?.hasAttribute?.('data-block-handle'),expectedExists:!!document.querySelector(`[data-editor-surface=\"main\"] [data-block-id=\"${CSS.escape(id)}\"] [data-block-handle]`)})",bid));q.close();ctx.close();b.close()
