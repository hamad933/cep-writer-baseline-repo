export const BACKUP_COMMANDS=Object.freeze(['backup.plan','backup.preview','backup.stage','backup.drill','backup.activationRequest']);

const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const token=value=>`<bdi dir="ltr" class="s18-backup__token">${safe(value)}</bdi>`;
const observed=(value,fallback='NOT_OBSERVED')=>value===undefined||value===null||value===''?fallback:value;
const bool=value=>value===true?'true':value===false?'false':'NOT_OBSERVED';

export function backupAttemptProjection(adapter){
  const snapshot=adapter?.snapshot?.()||{};
  const durable=Array.isArray(snapshot.durableAttempts)?snapshot.durableAttempts:null;
  return Object.freeze({source:durable?'PROVIDER_DURABLE_ATTEMPT_JOURNAL':'CURRENT_UI_SESSION',durable:!!durable,rows:structuredClone(durable||snapshot.attemptHistory||[])});
}

function packageIdentityRows(pkg){
  if(!pkg)return '<p class="s18-backup__muted">No verified package is selected.</p>';
  return `<dl class="s18-backup__facts">
    <div><dt>Package ID</dt><dd>${token(observed(pkg.packageId))}</dd></div>
    <div><dt>Manifest</dt><dd>${token(observed(pkg.manifestSha256))}</dd></div>
    <div><dt>Snapshot</dt><dd>${token(observed(pkg.snapshotSha256))}</dd></div>
    <div><dt>Schema artifact</dt><dd>${token(observed(pkg.schemaArtifactSha256))}</dd></div>
  </dl>`;
}

function attemptDetail(row){
  const error=row?.originalError??row?.error??row?.providerError??null;
  const errorCode=typeof error==='string'?error:(error?.code??row?.errorCode??row?.code??null);
  const compensation=row?.compensation??row?.compensationResult??row?.compensationStatus??null;
  const compensationText=typeof compensation==='string'?compensation:(compensation?.status??compensation?.code??null);
  const bits=[];
  if(errorCode)bits.push(`error ${token(errorCode)}`);
  if(compensationText)bits.push(`compensation ${token(compensationText)}`);
  return bits.length?`<span class="s18-backup__attempt-detail">${bits.join(' · ')}</span>`:'';
}

const STYLE=`
.s18-backup{display:grid;gap:14px;min-width:0}.s18-backup *{box-sizing:border-box}.s18-backup__banner,.s18-backup__card{border:1px solid var(--border,#2b3441);border-radius:12px;background:var(--panel,#111821);min-width:0}.s18-backup__banner{padding:15px}.s18-backup__banner h2{margin:0 0 6px;font-size:19px}.s18-backup__banner p{margin:5px 0;color:var(--muted,#9ba7b8);line-height:1.55}.s18-backup__warning{border-inline-start:3px solid #c69245;padding-inline-start:10px}.s18-backup__flow{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}.s18-backup__step{border:1px solid var(--border,#2b3441);border-radius:11px;padding:10px;background:#0e151e;min-width:0}.s18-backup__step h3{margin:0 0 5px;font-size:12px}.s18-backup__step p{margin:0;color:var(--muted,#9ba7b8);font-size:11px;line-height:1.35;overflow-wrap:anywhere}.s18-backup__card{padding:14px}.s18-backup__card h3{margin:0 0 9px;font-size:14px}.s18-backup__card h4{margin:13px 0 6px;font-size:12px}.s18-backup__muted{color:var(--muted,#9ba7b8)}.s18-backup__token{unicode-bidi:isolate;overflow-wrap:anywhere;word-break:break-word}.s18-backup__facts{display:grid;gap:7px;margin:0}.s18-backup__facts>div{display:grid;grid-template-columns:minmax(118px,.32fr) minmax(0,1fr);gap:10px;border-top:1px solid color-mix(in srgb,var(--border,#2b3441) 70%,transparent);padding-top:7px}.s18-backup__facts>div:first-child{border-top:0;padding-top:0}.s18-backup__facts dt{color:var(--muted,#9ba7b8);font-size:11px}.s18-backup__facts dd{margin:0;min-width:0;font-size:12px}.s18-backup__package-list{display:grid;gap:7px}.s18-backup__package{display:grid;gap:4px;width:100%;text-align:start;border:1px solid var(--border,#2b3441);border-radius:9px;background:#101925;color:inherit;padding:9px;cursor:pointer}.s18-backup__package[aria-pressed="true"]{outline:2px solid color-mix(in srgb,currentColor 55%,transparent);outline-offset:1px}.s18-backup__package:focus-visible,.s18-backup button:focus-visible{outline:2px solid currentColor;outline-offset:2px}.s18-backup__package small{color:var(--muted,#9ba7b8)}.s18-backup__command{margin-top:10px}.s18-backup button{border:1px solid var(--border,#2b3441);border-radius:9px;background:#182231;color:inherit;padding:8px 10px;cursor:pointer}.s18-backup button:disabled{opacity:.45;cursor:not-allowed}.s18-backup__lifecycle{display:grid;gap:12px}.s18-backup__lifecycle-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.s18-backup__phase{border:1px solid var(--border,#2b3441);border-radius:10px;padding:10px;background:#0e151e;min-width:0}.s18-backup__phase h4{margin:0 0 7px}.s18-backup__phase p{margin:4px 0;font-size:12px;line-height:1.45;overflow-wrap:anywhere}.s18-backup__truth-grid{display:grid;gap:7px}.s18-backup__truth-row{display:flex;justify-content:space-between;gap:12px;border-top:1px solid color-mix(in srgb,var(--border,#2b3441) 70%,transparent);padding-top:7px}.s18-backup__truth-row:first-child{border-top:0;padding-top:0}.s18-backup__truth-row>span:first-child{color:var(--muted,#9ba7b8);font-size:11px}.s18-backup__attempts{display:grid;gap:7px;max-height:240px;overflow:auto}.s18-backup__attempt{border:1px solid var(--border,#2b3441);border-radius:9px;padding:9px;background:#0e151e;min-width:0}.s18-backup__attempt p{margin:3px 0;font-size:11px;overflow-wrap:anywhere}.s18-backup__attempt-detail{display:block;margin-top:4px;color:var(--muted,#9ba7b8)}.s18-backup__source{margin:0 0 8px;color:var(--muted,#9ba7b8);font-size:11px}.s18-backup__ceiling{font-weight:600}.s18-backup__sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:1180px){.s18-backup__flow{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:760px){.s18-backup__flow,.s18-backup__lifecycle-grid{grid-template-columns:1fr}.s18-backup__facts>div{grid-template-columns:1fr;gap:3px}.s18-backup__truth-row{display:grid;gap:3px}}
`;

export function mountBackupSurface({stage,registry,workspace,button,adapter}={}){
  if(!stage||!registry||!adapter)throw Error('BACKUP_PRODUCT_COMPOSITION_REQUIRED');
  const exec=(id,fn)=>async()=>{const result=await fn();workspace?.status?.(result?.ok?`${id} completed truthfully`:`${id} unavailable/failed · ${result?.code||'UNKNOWN'}`,result?.ok?'info':'error');render();return result;};
  registry.register('backup.package',adapter.owner,'Create verified BackupPackage',exec('backup.package',()=>adapter.createPackage()));
  registry.register('backup.plan',adapter.owner,'Plan restore drill',exec('backup.plan',()=>adapter.plan()),()=>adapter.availability('backup.plan'));
  registry.register('backup.preview',adapter.owner,'Preview exact package/plan',exec('backup.preview',()=>adapter.preview()),()=>adapter.availability('backup.preview'));
  registry.register('backup.stage',adapter.owner,'Stage isolated drill intent',exec('backup.stage',()=>adapter.stage()),()=>adapter.availability('backup.stage'));
  registry.register('backup.drill',adapter.owner,'Run isolated restore drill',exec('backup.drill',()=>adapter.drill()),()=>adapter.availability('backup.drill'));
  registry.register('backup.activationRequest',adapter.owner,'Request activation authority',exec('backup.activationRequest',()=>adapter.requestActivation()),()=>adapter.availability('backup.activationRequest'));
  const cmd=(id,label)=>typeof button==='function'?button(id,label):`<button type="button" data-command="${safe(id)}">${safe(label)}</button>`;

  const render=()=>{
    const s=adapter.snapshot(),pkg=s.packages.find(row=>row.packageId===s.selectedPackageId)||s.packages.at(-1)||null,truth=adapter.truth(),attempts=backupAttemptProjection(adapter);
    const steps=[
      ['Package',pkg?.status||'NO_VERIFIED_PACKAGE'],
      ['Plan',s.plan?.state||'NOT_PLANNED'],
      ['Preview',s.preview?.state||'NOT_PREVIEWED'],
      ['Stage',s.stage?.state||'NOT_STAGED'],
      ['Drill',s.lastDrill?.status||'NOT_RUN'],
      ['Activation',s.lastActivation?.status||'NOT_REQUESTED']
    ];
    const packages=s.packages.length?s.packages.slice().reverse().map(row=>`<button type="button" class="s18-backup__package" data-backup-package-id="${safe(row.packageId)}" aria-pressed="${String(row.packageId===pkg?.packageId)}"><span>${token(observed(row.packageId))}</span><small>${safe(observed(row.status,'STATUS_NOT_OBSERVED'))}</small></button>`).join(''):'<p class="s18-backup__muted">No BackupPackage has been observed in this state.</p>';
    const latestAttempt=attempts.rows.at(-1)||null;
    stage.innerHTML=`<section class="s18-backup" data-w05-surface="backup" data-domain-owner="${safe(adapter.owner)}"><style>${STYLE}</style>
      <header class="s18-backup__banner"><h2>Recovery Safety Workbench</h2><p>Verified package → exact restore plan → preview → isolated stage → restore drill → activation request.</p><p class="s18-backup__warning"><span class="s18-backup__ceiling">Truth ceiling:</span> ${token('STAGED_AND_VERIFIED != LIVE_RESTORED')}. This surface has no production-restore authority and does not mutate persistence ownership.</p></header>
      <div class="s18-backup__flow" aria-label="Backup and restore lifecycle">${steps.map(([label,state])=>`<article class="s18-backup__step"><h3>${safe(label)}</h3><p>${token(state)}</p></article>`).join('')}</div>
      <article class="s18-backup__card s18-backup__lifecycle" data-backup-center><h3>Exact recovery binding</h3>${packageIdentityRows(pkg)}<div class="s18-backup__lifecycle-grid">
        <section class="s18-backup__phase"><h4>Plan + preview</h4><p>Plan ${token(observed(s.plan?.planId,'NOT_PLANNED'))}</p><p>Package binding ${token(observed(s.plan?.packageId,'NOT_BOUND'))}</p><p>Preview ${token(observed(s.preview?.schemaComparison?.status??s.preview?.state,'NOT_PREVIEWED'))}</p><p>Provider preview ${token(observed(s.providerPreview?.status??truth.providerPreviewStatus,'NOT_OBSERVED'))}</p></section>
        <section class="s18-backup__phase"><h4>Stage + drill</h4><p>Stage ${token(observed(s.stage?.status??s.stage?.state,'NOT_STAGED'))}</p><p>Target ${token(observed(s.stage?.target?.kind,'ISOLATED_RESTORE_DRILL'))}</p><p>Drill ${token(observed(s.lastDrill?.drillId,'NOT_RUN'))}</p><p>Drill status ${token(observed(s.lastDrill?.status,'NOT_RUN'))}</p></section>
        <section class="s18-backup__phase"><h4>Activation boundary</h4><p>Request ${token(observed(s.lastActivation?.requestId,'NOT_REQUESTED'))}</p><p>Status ${token(observed(s.lastActivation?.status,'NOT_REQUESTED'))}</p><p>Authority ${token(observed(truth.activationAuthority,'NOT_REQUESTED'))}</p></section>
        <section class="s18-backup__phase"><h4>Non-effects asserted by evidence</h4><p>Live restored ${token(bool(truth.drillLiveRestored))}</p><p>Production DB mutated ${token(bool(truth.productionDatabaseMutated))}</p><p>Persistence owner mutated ${token(bool(truth.persistenceOwnerMutated))}</p></section>
      </div></article>
      <article class="s18-backup__card" data-backup-left><h3>BackupPackage custody</h3><div class="s18-backup__package-list">${packages}</div><div class="s18-backup__command">${cmd('backup.package','Create verified package')}</div></article>
      <article class="s18-backup__card" data-backup-right><h3>Provider / runtime truth</h3><div class="s18-backup__truth-grid">
        <div class="s18-backup__truth-row"><span>Attempt source</span><span>${token(attempts.source)}</span></div>
        <div class="s18-backup__truth-row"><span>Provider preview</span><span>${token(observed(truth.providerPreviewStatus,'NOT_OBSERVED'))}</span></div>
        <div class="s18-backup__truth-row"><span>Provider stage</span><span>${token(observed(truth.providerStageStatus,'NOT_OBSERVED'))}</span></div>
        <div class="s18-backup__truth-row"><span>Durable failure / compensation</span><span>${token(observed(truth.durableFailureCompensationHistory,'UNAVAILABLE'))}</span></div>
        <div class="s18-backup__truth-row"><span>Live restored</span><span>${token(bool(truth.drillLiveRestored))}</span></div>
        <div class="s18-backup__truth-row"><span>Production DB mutated</span><span>${token(bool(truth.productionDatabaseMutated))}</span></div>
      </div>${latestAttempt?`<h4>Latest observed attempt</h4><p>${token(observed(latestAttempt.attemptId,'ATTEMPT_ID_NOT_OBSERVED'))} · ${token(observed(latestAttempt.operation))} · ${token(observed(latestAttempt.status))}</p>${attemptDetail(latestAttempt)}`:'<p class="s18-backup__muted">No provider or session attempt has been observed.</p>'}</article>
      <article class="s18-backup__card" data-backup-history><h3>Attempt history</h3><p class="s18-backup__source">Source: ${token(attempts.source)}${attempts.durable?' · provider-owned durable projection':' · local UI-session projection only'}</p><div class="s18-backup__attempts">${attempts.rows.length?attempts.rows.slice().reverse().map(row=>`<article class="s18-backup__attempt"><p>${token(observed(row.attemptId,'ATTEMPT_ID_NOT_OBSERVED'))} · ${token(observed(row.operation))} · ${token(observed(row.status))}</p><p class="s18-backup__muted">${token(observed(row.at,'TIME_NOT_OBSERVED'))}</p>${attemptDetail(row)}</article>`).join(''):'<p class="s18-backup__muted">No attempts yet.</p>'}</div></article>
    </section>`;

    for(const packageButton of stage.querySelectorAll('[data-backup-package-id]'))packageButton.addEventListener('click',()=>{const result=adapter.selectPackage(packageButton.getAttribute('data-backup-package-id'));workspace?.status?.(result?.ok?'Exact BackupPackage selected':`Package selection failed · ${result?.code||'UNKNOWN'}`,result?.ok?'info':'error');render();});
    const left=stage.querySelector('[data-backup-left]'),right=stage.querySelector('[data-backup-right]'),history=stage.querySelector('[data-backup-history]');
    if(left)workspace?.region?.('LEFT',{node:left,label:'BackupPackage custody'});
    if(right)workspace?.region?.('RIGHT',{node:right,label:'Provider / runtime truth'});
    if(history)workspace?.region?.('BOTTOM',{node:history,label:'Backup attempt history',summary:`${attempts.source}; stage/drill receipts do not imply production restore.`});
    workspace?.refreshToolbar?.();
  };

  stage.dataset.surfaceComposition='backup-recovery-safety-workbench';
  render();
  workspace?.toolbar?.(['backup.package',...BACKUP_COMMANDS,'foundation.settings']);
  return Object.freeze({owner:'RecoverySafetyWorkbench',render,adapter,slots:{CENTER:'RecoverySafetyWorkbench',LEFT:'BackupPackage custody projection',RIGHT:'provider/runtime truth projection',BOTTOM:'attempt-history projection'}});
}
