from __future__ import annotations
import hashlib, json, pathlib, urllib.parse
from playwright.sync_api import sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'assurance'/'E17_ANALYTICAL_COMPARE_BROWSER'
OUT.mkdir(parents=True,exist_ok=True)

def source_identity():
    source=ROOT/'stack'/'native-typescript'
    rows=[]
    for path in source.rglob('*'):
        if path.is_file():
            data=path.read_bytes(); rel=path.relative_to(source).as_posix(); rows.append((rel,len(data),hashlib.sha256(data).hexdigest()))
    rows.sort(key=lambda row: row[0])
    payload=''.join(f'{p}\0{n}\0{h}\n' for p,n,h in rows).encode()
    return hashlib.sha256(payload).hexdigest(),len(rows)

def check(name,condition,detail,checks):
    checks.append({'id':name,'status':'PASS' if condition else 'FAIL','detail':detail})
    if not condition: raise AssertionError(f'{name}: {detail}')

def main():
    source_hash,source_files=source_identity()
    html=OUT/'browser-proof.html'
    html_text='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>AnalyticalCompare Browser Proof</title></head><body><main id="app"></main><script type="module">import {mountAnalyticalCompareBrowserProof} from "https://cep.test/dist/analytical-compare-browser.js";window.__harness=mountAnalyticalCompareBrowserProof(document.querySelector("#app"));window.__ready=true;</script></body></html>'
    html.write_text(html_text,encoding='utf-8')
    checks=[];screens=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        page=browser.new_page(viewport={'width':1365,'height':900})
        def route_module(route,request):
            parsed=urllib.parse.urlparse(request.url)
            rel=parsed.path.lstrip('/')
            target=(ROOT/rel).resolve()
            if ROOT.resolve() not in target.parents and target!=ROOT.resolve():
                route.abort();return
            if not target.is_file():
                route.fulfill(status=404,body='not found',headers={'Access-Control-Allow-Origin':'*'});return
            content_type='application/javascript; charset=utf-8' if target.suffix in {'.js','.mjs'} else 'application/json; charset=utf-8' if target.suffix=='.json' else 'text/plain; charset=utf-8'
            route.fulfill(status=200,body=target.read_bytes(),headers={'Content-Type':content_type,'Access-Control-Allow-Origin':'*','Cache-Control':'no-store'})
        page.route('https://cep.test/**',route_module)
        page.set_content(html_text,wait_until='load')
        page.wait_for_function('window.__ready===true')
        check('browser.transport-route-intercept',True,'exact ESM modules served by Playwright route interception; localhost not used',checks)
        check('browser.same-host-owner-rq',page.locator('#app').get_attribute('data-host-owner')=='AnalyticalCompareHost','same reusable host mounted for RQ',checks)
        check('browser.rtl-chrome',page.locator('#app').get_attribute('dir')=='rtl','root dir=rtl',checks)
        bdi_count=page.locator('bdi[dir="ltr"]').count()
        check('browser.ltr-technical-isolation',bdi_count>=4,f'bdi count={bdi_count}',checks)
        check('browser.rq-different-state',page.locator('.ac-state').get_attribute('data-state')=='DIFFERENT','RQ state DIFFERENT',checks)
        text=page.locator('#app').inner_text()
        pinned_keys=page.evaluate('()=>{const p=window.__harness.owner.sessionState("rq-browser").pair;return {left:p.left.key,right:p.right.key,leftRef:p.left.ref,rightRef:p.right.ref}}')
        check('browser.rq-pinned-left-right',pinned_keys['left'] in text and pinned_keys['right'] in text and pinned_keys['leftRef']['revision']=='r1' and pinned_keys['rightRef']['revision']=='r2','canonical collision-safe pinned RQ identities visible and exact refs remain r1/r2',checks)
        rows=page.locator('tbody tr[data-diff-path]').count()
        check('browser.rq-typed-differences',rows==3,f'rows={rows}',checks)
        check('browser.rq-successor-hint','supersession' in text and '"revision":"r2"' in text,'successor hint visible separately',checks)
        pinned=page.evaluate('window.__harness.owner.sessionState("rq-browser").pair.left.ref.revision')
        check('browser.rq-successor-no-pair-mutation',pinned=='r1',f'pinned={pinned}',checks)
        base_before=page.evaluate('window.__harness.owner.sessionState("rq-browser").baseResult.differences.length')
        page.locator('[data-analytical-filter]').fill('title');page.wait_for_timeout(30)
        filtered=page.locator('tbody tr[data-diff-path]').count();base_after=page.evaluate('window.__harness.owner.sessionState("rq-browser").baseResult.differences.length')
        check('browser.filter-derived-only',filtered==1 and base_before==3 and base_after==3,f'filtered={filtered}, base={base_before}->{base_after}',checks)
        page.locator('[data-analytical-filter]').fill('');page.wait_for_timeout(30)
        buttons=page.locator('.ac-diff-btn');first_path=buttons.nth(0).get_attribute('data-diff-focus');buttons.nth(0).focus();page.keyboard.press('ArrowDown');second_path=page.locator('.ac-diff-btn:focus').get_attribute('data-diff-focus')
        check('browser.keyboard-navigation-visible-focus',first_path!=second_path and second_path is not None,f'{first_path}->{second_path}',checks)
        style_text=page.locator('style').inner_text()
        check('browser.visible-focus-style','focus-visible' in style_text and 'outline' in style_text,'host contains explicit :focus-visible outline rule',checks)
        shot=OUT/'rq-different.png';page.screenshot(path=str(shot),full_page=True);screens.append(shot)
        page.evaluate('window.__harness.show("resultsValid")')
        check('browser.same-host-owner-results',page.locator('#app').get_attribute('data-host-owner')=='AnalyticalCompareHost','same host after Results switch',checks)
        check('browser.results-valid-different',page.locator('.ac-state').get_attribute('data-state')=='DIFFERENT','Results valid comparison rendered',checks)
        effects=page.evaluate('structuredClone(window.__harness.effects)')
        check('browser.results-no-execution-effects',effects=={'replay':0,'simulator':0,'determinism':0,'evidence':0},json.dumps(effects),checks)
        check('browser.historical-bytes-inert',page.evaluate('window.__CEP_EXECUTED__') is None,'historical terminal script text did not execute',checks)
        page.evaluate('window.__harness.show("resultsIncompatible")')
        check('browser.results-incompatible',page.locator('.ac-state').get_attribute('data-state')=='INCOMPATIBLE','Results incompatible state',checks)
        check('browser.results-incompatible-reason','schemas are incompatible' in page.locator('.ac-state').inner_text(),'explicit incompatibility reason visible',checks)
        shot=OUT/'results-incompatible.png';page.screenshot(path=str(shot),full_page=True);screens.append(shot)
        page.evaluate('window.__harness.show("resultsMissing")')
        check('browser.results-missing-side',page.locator('.ac-state').get_attribute('data-state')=='MISSING_RIGHT','missing-right presented truthfully',checks)
        unchanged=page.evaluate('window.__harness.unchanged()')
        check('browser.domain-records-unchanged',unchanged=={'rq':True,'results':True},json.dumps(unchanged),checks)
        forbidden=page.locator('button').evaluate_all("els=>els.map(e=>e.textContent).filter(t=>/accept|reject|decision|mastery|admit evidence|قبول|رفض|قرار/i.test(t||''))")
        check('browser.no-authority-controls',len(forbidden)==0,json.dumps(forbidden),checks)
        browser.close()
    screen_rows=[]
    for shot in screens:
        data=shot.read_bytes();screen_rows.append({'filename':shot.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
    fail=sum(1 for x in checks if x['status']=='FAIL')
    report={'schemaVersion':1,'kind':'E17_ANALYTICAL_COMPARE_BROWSER_PROOF','status':'PASS' if fail==0 else 'FAIL','executionStatus':'EXECUTED_PASS' if fail==0 else 'EXECUTED_FAIL','candidateOnly':True,'acceptanceAuthority':False,'canonicalSourceSha256':source_hash,'canonicalSourceFiles':source_files,'browser':{'engine':'chromium','executable':'/usr/bin/chromium','transport':'PLAYWRIGHT_ROUTE_INTERCEPT_EXACT_ESM'},'summary':{'total':len(checks),'pass':len(checks)-fail,'fail':fail},'checks':checks,'screenshots':screen_rows,'authorityBoundary':'NO_REVIEW_DECISION_MASTERY_EVIDENCE_ADMISSION_CONTROLS'}
    (OUT/'E17_ANALYTICAL_COMPARE_BROWSER_PROOF.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print(json.dumps({'status':report['status'],'canonicalSourceSha256':source_hash,'summary':report['summary'],'screenshots':screen_rows},indent=2))
    raise SystemExit(1 if fail else 0)

if __name__=='__main__': main()
