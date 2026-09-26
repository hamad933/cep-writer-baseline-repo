import {ReviewAuditFamilyHost} from '../../foundation/review/family-host.js';
import {createValidationConsumerAdapter,VALIDATION_RULESET_IDENTITY,VALIDATION_VALIDATOR_IDENTITY} from '../../adapters/validation.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const sample=JSON.stringify({artifactRef:'artifact-local-001',artifactDigest:'a'.repeat(64),ruleset:VALIDATION_RULESET_IDENTITY,validator:VALIDATION_VALIDATOR_IDENTITY,payload:{note:'تحقق TCP/IP من العربية'}},null,2);
const statusTone=status=>status==='TECHNICALLY_VALID'?'valid':status==='TECHNICALLY_INVALID'?'invalid':status==='ERROR'?'error':status==='UNAVAILABLE'?'unavailable':status==='RUNNING'?'running':'neutral';

export function mountValidationSurface({stage,registry,workspace,adapter=createValidationConsumerAdapter()}={}){
  if(!stage||!registry)throw Error('VALIDATION_PRODUCT_COMPOSITION_REQUIRED');
  let host=null;
  const ui={inspection:null,findings:null};
  const shell=document.createElement('section');
  shell.className='validation-product';
  shell.innerHTML=`<style>
    .validation-product{display:grid;gap:14px;min-height:100%;background:#08111d;color:#eaf2ff;padding:16px;box-sizing:border-box}.validation-runner,.validation-panel{display:grid;gap:11px;padding:16px;border:1px solid #26364c;border-radius:16px;background:#0c1523;box-sizing:border-box}.validation-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}.validation-head h1{margin:0;font-size:22px}.validation-head p{margin:4px 0 0;max-width:76ch;color:#afc0d4}.validation-truth{display:flex;gap:7px;flex-wrap:wrap}.validation-chip{border:1px solid #34506f;border-radius:999px;padding:5px 9px;font-size:11px;color:#bdd0e7;background:#0a192a}.validation-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr);gap:12px}.validation-editor{display:grid;gap:9px}.validation-runner textarea{width:100%;min-height:230px;resize:vertical;border:1px solid #38506d;border-radius:10px;background:#07101b;color:inherit;padding:12px;font:13px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace;box-sizing:border-box}.validation-actions{display:flex;gap:8px;flex-wrap:wrap}.validation-runner button{border:1px solid #365276;border-radius:10px;background:#12253f;color:inherit;padding:9px 13px;cursor:pointer}.validation-runner button:hover{background:#173150}.validation-runner button:focus-visible,.validation-runner textarea:focus-visible{outline:3px solid #79b8ff;outline-offset:2px}.validation-state{display:flex;align-items:center;gap:8px;min-height:34px;border:1px solid #26364c;border-radius:10px;padding:7px 10px;font-size:12px;background:#081421}.validation-state[data-tone="valid"]{border-color:#2e705a}.validation-state[data-tone="invalid"],.validation-state[data-tone="error"]{border-color:#7a3f49}.validation-state[data-tone="unavailable"]{border-color:#80652d}.validation-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.validation-metric{padding:10px;border:1px solid #26364c;border-radius:10px;background:#091624}.validation-metric strong{display:block;font-size:20px}.validation-metric span{font-size:11px;color:#a9bad0}.validation-identity{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;font-size:12px}.validation-identity>div,.validation-inspection{padding:9px;border:1px solid #26364c;border-radius:9px;min-width:0;background:#091624}.validation-identity bdi,.validation-identity small,.validation-inspection bdi{display:block;max-width:100%;overflow-wrap:anywhere;word-break:break-all}.validation-identity small{font-size:10px;line-height:1.35;color:#9eb2ca}.validation-boundary{padding:12px;border:1px solid #635532;border-radius:12px;background:#1b180c;color:#e8dba8}.validation-boundary strong{display:block;margin-bottom:4px}.technical-findings{display:grid;gap:8px}.technical-finding{padding:10px;border:1px solid #5b3d44;border-radius:10px;background:#201117}.technical-finding bdi{font-family:ui-monospace,monospace}.technical-finding dl{display:grid;grid-template-columns:max-content 1fr;gap:3px 8px;margin:7px 0 0;font-size:11px}.technical-finding dt{color:#a9bad0}.technical-finding dd{margin:0;overflow-wrap:anywhere}.validation-family-host{min-height:0}.validation-list{display:grid;gap:8px}.validation-list article{border:1px solid #26364c;border-radius:9px;padding:9px;background:#091624}.validation-list p{margin:3px 0}.validation-muted{color:#9fb3ca;font-size:11px}
    @media(max-width:1050px){.validation-product{padding:10px}.validation-grid,.validation-identity{grid-template-columns:1fr}.validation-runner,.validation-panel{padding:12px}}
  </style>
  <section class="validation-runner" aria-labelledby="validation-runner-title">
    <header class="validation-head"><div><h1 id="validation-runner-title">Technical Validation Workbench</h1><p>Validation is bound to exact artifact, ruleset, and validator identities. Technical findings remain W05 technical truth and never become W04 formal Review truth.</p></div><div class="validation-truth" aria-label="Validation truth boundaries"><span class="validation-chip" data-truth-classification>LOCAL / NON-CANONICAL</span><span class="validation-chip">Provider authority: none</span><span class="validation-chip">Persistence authority: none</span></div></header>
    <div class="validation-grid"><div class="validation-editor"><label for="validationInput"><strong>Validation input</strong></label><textarea id="validationInput" dir="auto" aria-label="Validation JSON input">${escape(sample)}</textarea><div class="validation-actions"><button type="button" data-validation-run>Run technical validation</button><button type="button" data-validation-inspect>Inspect current identity</button><button type="button" data-validation-findings>Technical findings</button></div><output class="validation-state" data-tone="neutral" aria-live="polite">No validation run yet.</output></div><aside class="validation-metrics" aria-label="Validation metrics"><div class="validation-metric"><strong data-metric-state>NOT_RUN</strong><span>Current state</span></div><div class="validation-metric"><strong data-metric-requests>0</strong><span>Validation requests</span></div><div class="validation-metric"><strong data-metric-results>0</strong><span>Validation results</span></div><div class="validation-metric"><strong data-metric-findings>0</strong><span>Technical findings</span></div></aside></div>
    <section><h2>Exact validation identity</h2><div class="validation-identity" data-validation-identity></div></section>
    <section><h2>Current inspection</h2><div class="validation-inspection" data-validation-inspection>No result has been inspected against the current editor input.</div></section>
    <aside class="validation-boundary"><strong>Authority boundary</strong><span>TECHNICALLY_VALID means technical conformance only. This surface cannot admit Evidence, create a W04 Review Finding or Decision, infer Mastery, or accept the Product.</span></aside>
    <section><h2>Technical findings</h2><div class="technical-findings" aria-label="Technical findings"></div></section>
  </section>
  <section class="validation-panel"><div class="validation-family-host" data-validation-family-host></div></section>`;
  stage.replaceChildren(shell);

  const familyRoot=shell.querySelector('[data-validation-family-host]');
  const stateNode=shell.querySelector('.validation-state');
  const identityNode=shell.querySelector('[data-validation-identity]');
  const inspectionNode=shell.querySelector('[data-validation-inspection]');
  const findingNode=shell.querySelector('.technical-findings');
  const runButton=shell.querySelector('[data-validation-run]');
  const inspectButton=shell.querySelector('[data-validation-inspect]');
  const findingsButton=shell.querySelector('[data-validation-findings]');
  const input=shell.querySelector('#validationInput');
  const truthClassification=shell.querySelector('[data-truth-classification]');
  const metricState=shell.querySelector('[data-metric-state]');
  const metricRequests=shell.querySelector('[data-metric-requests]');
  const metricResults=shell.querySelector('[data-metric-results]');
  const metricFindings=shell.querySelector('[data-metric-findings]');

  const renderFindings=findings=>findings.length?findings.map(f=>`<article class="technical-finding" data-technical-finding="${escape(f.id)}"><strong>${escape(f.message)}</strong><div><bdi dir="ltr">${escape(f.code)}</bdi> · <bdi dir="ltr">${escape(f.ruleId||'')}</bdi></div><dl><dt>Locator</dt><dd><bdi dir="ltr">${escape(f.locator||'—')}</bdi></dd><dt>Observed</dt><dd>${escape(f.observed??'—')}</dd><dt>Expected</dt><dd>${escape(f.expected??'—')}</dd></dl><small>TechnicalFinding only · formalReviewFinding=false</small></article>`).join(''):'<p class="validation-muted">No TechnicalFindings.</p>';

  const render=()=>{
    adapter.refresh();
    const typed=adapter.snapshot();
    const run=adapter.state.last;
    const truth=adapter.truth();
    const findings=ui.findings?.technicalFindings||run?.technicalFindings||[];
    const visibleState=ui.inspection?.code==='STALE_FOR_CURRENT_ARTIFACT'?'STALE_FOR_CURRENT_ARTIFACT':typed.state;
    stateNode.textContent=adapter.state.processing?'RUNNING · technical validation in progress':run?`${visibleState} · ${run.resultId||run.requestId}`:'NOT_RUN · no validation result';
    stateNode.dataset.tone=statusTone(visibleState);
    metricState.textContent=visibleState;
    metricRequests.textContent=String(typed.requests.length);
    metricResults.textContent=String(typed.results.length);
    metricFindings.textContent=String(findings.length);
    const classification=truth.dataClassification||{};
    truthClassification.textContent=classification.testOnly?'TEST_ONLY / DETERMINISTIC / RESETTABLE / NON_PRODUCTION / NON_CANONICAL':'LOCAL / NON-PRODUCTION / NON-CANONICAL';
    identityNode.innerHTML=run?.identity?`<div><strong>Artifact</strong><br><bdi dir="ltr">${escape(run.identity.artifact.ref)}</bdi><br><small><bdi dir="ltr">${escape(run.identity.artifact.digest)}</bdi></small></div><div><strong>Ruleset</strong><br><bdi dir="ltr">${escape(run.identity.ruleset.id)}@${escape(run.identity.ruleset.revision)}</bdi><br><small><bdi dir="ltr">${escape(run.identity.ruleset.digest)}</bdi></small></div><div><strong>Validator</strong><br><bdi dir="ltr">${escape(run.identity.validator.id)}@${escape(run.identity.validator.version)}</bdi><br><small><bdi dir="ltr">${escape(run.identity.validator.digest)}</bdi></small></div>`:'<div>No exact input identity yet.</div>';
    inspectionNode.innerHTML=ui.inspection?.ok?`<strong>${escape(ui.inspection.code)}</strong><br><span>Current identity matches result: <bdi dir="ltr">${escape(String(ui.inspection.currentIdentityMatches))}</bdi></span><br><span>Acceptance: <bdi dir="ltr">null</bdi> · Formal Review authority: false · Mastery authority: false</span>`:'No result has been inspected against the current editor input.';
    findingNode.innerHTML=renderFindings(findings);
    if(!host){
      host=new ReviewAuditFamilyHost({consumer:adapter.consumerInput||adapter.consumer,onRefresh:async()=>{adapter.refresh();render()}});
      host.mount(familyRoot,{provenanceCore:adapter.provenance,reviewSnapshot:adapter.reviewSnapshot(),title:'Validation · Audit/Provenance inspection',summary:'Actual validation runs feed shared provenance inspection. Formal review findings remain a separate W04 governed domain.'});
    }else host.update({provenanceCore:adapter.provenance,reviewSnapshot:adapter.reviewSnapshot()});
    workspace?.status?.(run?`Validation ${visibleState}`:'Validation ready','info');
    const requestHtml=typed.requests.length?`<section class="validation-list"><h2>ValidationRequest</h2>${typed.requests.map(req=>`<article><strong><bdi dir="ltr">${escape(req.requestId)}</bdi></strong><p>${escape(req.status)}</p><p class="validation-muted"><bdi dir="ltr">${escape(req.inputDigest)}</bdi></p></article>`).join('')}</section>`:'<p>No ValidationRequest has been observed yet.</p>';
    const selected=typed.results.at(-1);
    const resultHtml=selected?`<section class="validation-list"><h2>ValidationResult</h2><article><strong><bdi dir="ltr">${escape(selected.resultId)}</bdi></strong><p>${escape(selected.status)}</p><p class="validation-muted">Exact artifact/ruleset/validator identity retained. Acceptance=null.</p></article></section>`:'<p>No ValidationResult exists yet.</p>';
    const historyHtml=typed.history.length?`<section class="validation-list"><h2>Validation lifecycle</h2>${typed.history.map(entry=>`<article><bdi dir="ltr">${escape(entry.requestId)}</bdi><p>${escape(entry.status)}</p><p class="validation-muted">${escape(entry.at||'')}</p></article>`).join('')}</section>`:'<p>No lifecycle history yet.</p>';
    workspace?.region?.('LEFT',{html:requestHtml,label:'Validation requests'});
    workspace?.region?.('RIGHT',{html:resultHtml,label:'Validation result identity and context'});
    workspace?.region?.('BOTTOM',{html:historyHtml,label:'Validation lifecycle',summary:'Shared BOTTOM deep-work content only; no per-Surface BottomDeepWorkOwner workaround.'});
    workspace?.refreshToolbar?.();
  };

  const run=async payload=>{
    runButton.disabled=true;
    ui.inspection=null;
    ui.findings=null;
    stateNode.textContent='RUNNING · technical validation in progress';
    stateNode.dataset.tone='running';
    try{return await adapter.validate(payload?.raw??input.value)}finally{runButton.disabled=false;render()}
  };
  registry.register('validation.validate','ValidationConsumerAdapter','Validate exact artifact',run,()=>!adapter.state.processing||'Validation already processing');
  registry.register('validation.inspect','ValidationConsumerAdapter','Inspect validation result',payload=>{ui.inspection=adapter.inspect({...payload,currentRaw:input.value});render();return ui.inspection},()=>adapter.state.last?true:'No validation result');
  registry.register('validation.findings','ValidationConsumerAdapter','Inspect TechnicalFindings',payload=>{ui.findings=adapter.findings(payload||{});render();return ui.findings},()=>adapter.state.last?true:'No validation result');
  registry.register('validation.run','ValidationConsumerAdapter','Legacy alias · validate exact artifact',run,()=>!adapter.state.processing||'Validation already processing');
  runButton.addEventListener('click',()=>Promise.resolve(registry.execute('validation.validate',{raw:input.value,route:'validation-validate-button'})).catch(error=>{stateNode.textContent=`ERROR · ${String(error?.message||error)}`;stateNode.dataset.tone='error'}));
  inspectButton.addEventListener('click',()=>registry.execute('validation.inspect',{route:'validation-inspect-button'}));
  findingsButton.addEventListener('click',()=>registry.execute('validation.findings',{route:'validation-findings-button'}));
  input.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();Promise.resolve(registry.execute('validation.validate',{raw:input.value,route:'validation-keyboard-shortcut'})).catch(error=>{stateNode.textContent=`ERROR · ${String(error?.message||error)}`;stateNode.dataset.tone='error'})}});
  stage.dataset.surfaceComposition='validation-technical-workbench';
  render();
  workspace?.toolbar?.(['validation.validate','validation.inspect','validation.findings','foundation.settings']);
  return Object.freeze({owner:'ValidationProductComposition',adapter,host:()=>host,render,realProductConsumer:true,slots:{CENTER:'TechnicalValidationWorkbench',LEFT:'ValidationRequest collection',RIGHT:'ValidationResult identity/context',BOTTOM:'shared BottomDeepWorkOwner content'}});
}
