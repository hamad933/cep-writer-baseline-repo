import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const nav=await import('../dist/foundation/global/shell/navigation.js');
const registryModule=await import('../dist/foundation/global/shell/destination-registry.js');
const {TransientFocusOwner}=await import('../dist/foundation/global/transient-focus.js');
const cssSource=await readFile(path.join(root,'stack/native-typescript/foundation/extensions.css'),'utf8');
const donorCss=await readFile(path.join(root,'dist/foundation/donor.css'),'utf8');
const tests=[];
const check=(id,fn)=>{try{tests.push({id,status:'PASS',detail:fn()});}catch(error){tests.push({id,status:'FAIL',detail:String(error?.message||error)});}};

check('ps01.registry-default-five-current-routes',()=>{
  for(const id of ['library','learn','visualize','runs','enterprise']){
    const route=nav.resolveGlobalShellRoute(`?surface=${id}`);
    assert.equal(route.surface,id); assert.equal(route.fallback,false); assert.equal(route.kind,'product');
  }
  const fallback=nav.resolveGlobalShellRoute('?surface=not-admitted');
  assert.equal(fallback.surface,'library'); assert.equal(fallback.fallback,true);
  const golden=nav.resolveGlobalShellRoute('?surface=golden'); assert.equal(golden.kind,'harness');
  return {defaultCount:registryModule.DEFAULT_SHELL_DESTINATION_REGISTRY.list().length,fallback:fallback.surface};
});

check('ps01.registry-more-than-five-without-shell-mechanics-edit',()=>{
  const base=registryModule.DEFAULT_SHELL_DESTINATION_REGISTRY.list();
  const extra=[
    {id:'fixture-alpha',area:'W04',labels:{ar:'اختبار ألفا',en:'Fixture Alpha'},description:{ar:'وصف اختبار',en:'Fixture-only descriptor'}},
    {id:'fixture-beta',area:'W05',labels:{ar:'اختبار بيتا',en:'Fixture Beta'},description:{ar:'وصف اختبار',en:'Fixture-only descriptor'}}
  ];
  const reg=registryModule.createShellDestinationRegistry([...base,...extra],{defaultId:'library'});
  assert.equal(reg.list().length,7);
  assert.equal(nav.resolveGlobalShellRoute('?surface=fixture-alpha',reg).surface,'fixture-alpha');
  assert.equal(nav.resolveGlobalShellRoute('?surface=fixture-beta',reg).surface,'fixture-beta');
  assert.equal(nav.resolveGlobalShellRoute('?surface=not-admitted',reg).fallback,true);
  return reg.descriptor();
});

check('ps01.registry-rejects-fake-harness-admission',()=>{
  assert.throws(()=>registryModule.createShellDestinationRegistry([{id:'golden',area:'W02',labels:{ar:'x',en:'x'},description:{ar:'x',en:'x'}}]),/GLOBAL_SHELL_DESTINATION_ID_INVALID/);
  return 'golden remains harness-only';
});

check('ps01.transient-rebinds-disconnected-invoker',()=>{
  let focused=false;
  const rebound={tagName:'BUTTON',id:'',isConnected:true,disabled:false,getAttribute:name=>name==='data-foundation-command'?'foundation.settings':null,focus:()=>{focused=true}};
  const stableScope={isConnected:true,querySelector(){return null},querySelectorAll(selector){return selector==='button[data-foundation-command]'?[rebound]:[]},contains:c=>c===rebound,parentElement:null};
  const oldParent={isConnected:false,parentElement:stableScope};
  const invoker={tagName:'BUTTON',id:'',isConnected:true,disabled:false,parentElement:oldParent,getAttribute:name=>name==='data-foundation-command'?'foundation.settings':null,focus(){}};
  const owner=new TransientFocusOwner({document:{querySelector:()=>null,getElementById:()=>null}});
  owner.open('global.settings-center',{invoker,modal:false}); invoker.isConnected=false;
  owner.close('global.settings-center',{restore:true,reason:'escape'});
  assert.equal(focused,true); assert.equal(owner.lastDismissal.restored,true); assert.equal(owner.lastDismissal.focusTargetKind,'invoker-rebound');
  return owner.lastDismissal;
});

check('ps01.sticky-layering-above-pane-reveal',()=>{
  assert.match(cssSource,/body \.stickyhost\{z-index:215\}/);
  const rail=Number((donorCss.match(/\.centerrail\{[^}]*z-index:(\d+)/)||[])[1]);
  assert.equal(rail,214); assert.ok(215>rail && 215<220);
  return {paneRevealStack:rail,stickyHostStack:215,shellStack:220};
});

const report={schemaVersion:1,mission:'PS01_GLOBAL_SHELL_FOCUS_LAYERING_CONVERGENCE',classification:'PS01_TARGETED_MODEL_AND_GENERATED_RUNTIME_PROOF',pass:tests.filter(x=>x.status==='PASS').length,fail:tests.filter(x=>x.status==='FAIL').length,tests};
await writeFile(path.join(root,'assurance/PS01_TARGETED_TEST_RECEIPT.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(report.fail)process.exitCode=1;
