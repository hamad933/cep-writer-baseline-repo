from pathlib import Path
import re, base64, posixpath, json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]; DIST=ROOT/'dist'; MEMO={}
PAT1=re.compile(r"(?:import|export)\s+(?:[^'\"]+?\s+from\s+)?['\"](\.{1,2}/[^'\"]+)['\"]"); PAT2=re.compile(r"import\(\s*['\"](\.{1,2}/[^'\"]+)['\"]\s*\)")
def specs(src): return list(dict.fromkeys(PAT1.findall(src)+PAT2.findall(src)))
def resolve(rel,spec): return posixpath.normpath(posixpath.join(posixpath.dirname(rel),spec))
def module_url(rel):
  rel=posixpath.normpath(rel)
  if rel in MEMO:return MEMO[rel]
  src=(DIST/rel).read_text()
  for sp in specs(src): src=src.replace(sp,module_url(resolve(rel,sp)))
  u='data:text/javascript;base64,'+base64.b64encode(src.encode()).decode(); MEMO[rel]=u; return u
def source_with_urls(rel):
  src=(DIST/rel).read_text()
  for sp in specs(src): src=src.replace(sp,module_url(resolve(rel,sp)))
  return src
html=(DIST/'index.html').read_text()
for href in ['foundation/donor.css','foundation/extensions.css','foundation/global/tokens/scale.css']:
  css=(DIST/href).read_text() if (DIST/href).exists() else ''
  html=re.sub(rf'<link rel="stylesheet" href="{re.escape(href)}">',f'<style>{css}</style>',html,flags=re.I)
html=re.sub(r'<script type="module" src="main\.js"></script>','',html,flags=re.I); main=source_with_urls('main.js')
def load(page,s):
  page.set_content(html,wait_until='domcontentloaded'); page.evaluate("s=>{try{delete globalThis.CEPFoundation}catch{};history.replaceState({},'',`about:blank?surface=${encodeURIComponent(s)}`)}",s); page.add_script_tag(type='module',content=main); page.wait_for_function("s=>window.CEPFoundation?.consumer===s",arg=s,timeout=5000)
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']); pg=b.new_page(); pg.set_default_timeout(3000)
 load(pg,'golden')
 print('regions',json.dumps(pg.evaluate("()=>CEPFoundation.wave3Assembly.inputOwner.regionCycle.snapshot?.() || {active:CEPFoundation.wave3Assembly.inputOwner.regionCycle.activeRegionId,last:CEPFoundation.wave3Assembly.inputOwner.regionCycle.lastReceipt}"),indent=2))
 print('focusables',pg.evaluate("()=>[...document.querySelectorAll('#centerPane *')].filter(n=>n.tabIndex>=0).slice(0,10).map(n=>({id:n.id,tag:n.tagName,tab:n.tabIndex,cls:n.className}))"))
 pg.locator('#editorDocument').focus(); print('before',pg.evaluate("()=>({active:document.activeElement?.id,region:CEPFoundation.wave3Assembly.inputOwner.regionCycle.resolveRegionForElement?.(document.activeElement)??null,last:CEPFoundation.wave3Assembly.inputOwner.regionCycle.lastReceipt})")); pg.keyboard.press('F6'); print('after',json.dumps(pg.evaluate("()=>({active:document.activeElement?.id,closest:document.activeElement?.closest?.('#rightPane,#leftPane,#centerPane,#bottomShelf')?.id,last:CEPFoundation.wave3Assembly.inputOwner.regionCycle.lastReceipt})"),indent=2))
 load(pg,'library');
 print('bottom cmds',pg.evaluate("()=>[...document.querySelectorAll('[data-foundation-command]')].map(n=>({cmd:n.dataset.foundationCommand,hidden:n.hidden,display:getComputedStyle(n).display,vis:!!(n.offsetWidth||n.offsetHeight||n.getClientRects().length)})).filter(x=>x.cmd?.includes('bottom'))"))
 print('registry bottom',pg.evaluate("()=>({has:CEPFoundation.registry.commands.has('foundation.bottom'),avail:CEPFoundation.registry.availability('foundation.bottom'),snap:CEPFoundation.wave3Assembly.bottomOwner.snapshot(),surface:CEPFoundation.consumer})"))
 print('toolbar html',pg.locator('#toolbar').inner_html()[:3000] if pg.locator('#toolbar').count() else 'NO#toolbar')
 b.close()
