import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
const app=http.createServer((req,res)=>{const u=new URL(req.url,'http://x');let f=path.join(process.cwd(),'dist',decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));
 if(!fs.existsSync(f)){res.writeHead(404);return res.end('nf');}res.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
await new Promise(r=>app.listen(4281,r));
const staticHtml = fs.readFileSync('dist/index.html','utf-8');
const ALL_SURFACES=['shell','today','library','learn','rq','visualize','enterprise','labs','results','runs','scenarios','evidence','mastery','portfolio','reviews','configuration','manual_ai','releases','backup','health','processing','audit','validation'];
const surfaces=(process.env.CENSUS_SURFACES||'').trim()?process.env.CENSUS_SURFACES.split(',').filter(Boolean):ALL_SURFACES;
const MODE=process.env.CENSUS_LOCALE==='ar'?'ar':'en';
const OUT=process.env.CENSUS_OUT||'EN_CENSUS_AFTER';
const b=await chromium.launch();
const records=[];
for(const s of surfaces){
  const p=await b.newPage({viewport:{width:1440,height:1000}});
  await p.addInitScript(()=>{ try{ localStorage.setItem('cep:locale','en'); }catch(e){} });
  await p.goto(`http://127.0.0.1:4281/index.html?surface=${s}`,{waitUntil:'domcontentloaded',timeout:15000});
  await p.waitForTimeout(1200);
  // force EN via document lang probe: record actual lang; also try the product's locale switch if present
  if(MODE==='ar'){
    try{
      await p.evaluate(()=>document.querySelector('[data-foundation-command="foundation.settings"]')?.click());
      await p.waitForSelector('[data-settings-preference="locale"]',{timeout:6000});
      await p.evaluate(()=>{const b=[...document.querySelectorAll('[data-settings-preference="locale"]')].find(x=>x.dataset.settingsValue==='ar');if(b)b.click();});
      await p.waitForTimeout(500);
      await p.keyboard.press('Escape'); await p.waitForTimeout(450);
    }catch(e){ console.error('AR flip failed on surface', s, e.message); }
  }
  const info = await p.evaluate(() => {
    const AR=/[؀-ۿ]/;
    const out=[];
    const walk=(el)=>{
      for(const child of el.childNodes){
        if(child.nodeType===3){
          const txt=child.textContent||'';
          if(AR.test(txt) && txt.trim()){
            const r=el.getBoundingClientRect();
            const cs=getComputedStyle(el);
            const visible=r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)>0;
            out.push({kind:'text', text:txt.trim().slice(0,80), tag:el.tagName, cls:String(el.className||'').slice(0,80), visible, rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]});
          }
        } else if(child.nodeType===1){
          for(const attr of ['aria-label','title','placeholder','alt']){
            const v=child.getAttribute&&child.getAttribute(attr);
            if(v&&AR.test(v)){
              const r=child.getBoundingClientRect(); const cs=getComputedStyle(child);
              const visible=r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden';
              out.push({kind:'attr', attr, text:v.trim().slice(0,80), tag:child.tagName, cls:String(child.className||'').slice(0,80), visible, rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]});
            }
          }
          walk(child);
        }
      }
    };
    walk(document.body);
    return {lang:document.documentElement.lang, dir:document.documentElement.dir, entries:out};
  });
  const visibleAr = info.entries.filter(e=>e.visible);
  // attribution: static if the text appears in dist/index.html source
  for(const e of info.entries){
    e.staticInIndex = staticHtml.includes(e.text.slice(0,40));
    e.surface=s;
  }
  records.push({surface:s, lang:info.lang, dir:info.dir, totalAr:info.entries.length, visibleAr:visibleAr.length, entries:info.entries});
  await p.close();
}
await b.close(); app.close();
const summary = records.map(r=>({surface:r.surface, lang:r.lang, dir:r.dir, totalAr:r.totalAr, visibleAr:r.visibleAr}));
const visibleAll = records.flatMap(r=>r.entries.filter(e=>e.visible).map(e=>({surface:r.surface, ...e})));
console.log(JSON.stringify({summary, visibleCount:visibleAll.length, visibleBySurface:Object.fromEntries(records.map(r=>[r.surface, r.entries.filter(e=>e.visible).length]))},null,1));
fs.writeFileSync(`writer-output/_coordinator/closure-T3/${OUT}.json`, JSON.stringify({kind:`LIVE_ARABIC_CENSUS_${MODE.toUpperCase()}`, mode:MODE, capturedAt:new Date().toISOString(), surfaces:surfaces.length, records}, null, 1));
console.log('census written');
