import {SpatialView} from '../../foundation/spatial.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bdi=v=>`<bdi dir="ltr">${esc(v??'—')}</bdi>`;
const stateTone=s=>s==='PUBLISHED'||s==='BOUND'||s==='AVAILABLE'?'success':s==='BASELINE_STALE'||s==='STALE'?'stale':s==='DETACHED'||s==='UNAVAILABLE'?'error':'neutral';
const commandButton=(id,label,composition,payload={})=>{const a=composition.bus.availability(id,payload);return `<button class="btn" type="button" data-command="${id}" aria-disabled="${!a.enabled}" ${a.enabled?'':`disabled title="${esc(a.reason)}"`}>${esc(label)}</button>`};

const STYLE=`
.enterprise-studio{height:100%;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;background:var(--bg0);color:var(--text);direction:inherit}
.enterprise-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 12px;border-bottom:1px solid var(--line);background:var(--bg1)}
.enterprise-top .enterprise-identity{display:flex;gap:8px;align-items:center;margin-inline-end:auto;min-width:220px}.enterprise-top .enterprise-identity strong{font-size:14px}
.enterprise-workbench{min-height:0;display:grid;grid-template-columns:minmax(190px,230px) minmax(380px,1fr) minmax(220px,280px);direction:ltr}
[dir=rtl] .enterprise-left,[dir=rtl] .enterprise-right,[dir=rtl] .enterprise-center{direction:rtl}[dir=ltr] .enterprise-left,[dir=ltr] .enterprise-right,[dir=ltr] .enterprise-center{direction:ltr}
.enterprise-left,.enterprise-right{min-width:0;overflow:auto;background:var(--bg1)}.enterprise-left{border-inline-end:1px solid var(--line)}.enterprise-right{border-inline-start:1px solid var(--line)}
.enterprise-left h2,.enterprise-right h2{font-size:13px;margin:0;padding:10px 12px;border-bottom:1px solid var(--line);color:var(--text2)}
.enterprise-group{padding:8px 10px;border-bottom:1px solid var(--line)}.enterprise-group h3{font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--text3);margin:0 0 6px}
.enterprise-tree-button{display:flex;width:100%;min-height:32px;align-items:center;gap:8px;text-align:start;padding:6px 8px;margin:2px 0;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--text);font:inherit}.enterprise-tree-button:hover,.enterprise-tree-button[aria-current=true]{background:var(--bg2);border-color:var(--line2)}
.enterprise-center{min-width:0;min-height:0;display:flex;flex-direction:column}.enterprise-modebar{display:flex;gap:4px;padding:7px 10px;border-bottom:1px solid var(--line);background:var(--bg1);overflow:auto}.enterprise-modebar .btn[aria-pressed=true]{background:var(--as);color:var(--accent2)}
.enterprise-main{position:relative;min-height:0;flex:1;display:flex;flex-direction:column}.enterprise-main .spatial-host{flex:1;min-height:260px}.enterprise-panel{padding:16px;overflow:auto;min-height:0;flex:1}.enterprise-summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}.enterprise-summary-card{border:1px solid var(--line);border-radius:8px;padding:12px;background:var(--bg1)}.enterprise-summary-card h3{margin:0 0 8px;font-size:13px}.enterprise-summary-card p{margin:5px 0;color:var(--text2);font-size:12px}
.enterprise-context{padding:12px}.enterprise-context .context-block{padding:10px 0;border-bottom:1px solid var(--line)}.enterprise-context h3{margin:0 0 7px;font-size:13px}.enterprise-context dl{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;margin:0;font-size:12px}.enterprise-context dt{color:var(--text3)}.enterprise-context dd{margin:0;overflow-wrap:anywhere}
.enterprise-bottom{border-top:1px solid var(--line);background:var(--bg1)}.enterprise-bottom>summary{cursor:pointer;padding:9px 12px;font-weight:600}.enterprise-bottom-body{max-height:190px;overflow:auto;padding:0 12px 12px}.enterprise-bottom pre{white-space:pre-wrap;font:11px/1.5 var(--mono);color:var(--text2)}
.enterprise-status{position:absolute;inset-inline:12px;inset-block-end:10px;z-index:5;width:max-content;max-width:calc(100% - 24px);padding:7px 10px;border:1px solid var(--line2);border-radius:7px;background:color-mix(in srgb,var(--bg1) 92%,transparent);font-size:11px}.enterprise-status:empty{display:none}
.enterprise-classification{display:inline-flex;align-items:center;gap:5px;font-size:10px;padding:2px 6px;border-radius:999px;border:1px solid var(--line2);color:var(--text2)}
.enterprise-truth-warning{margin:8px 10px;padding:8px 10px;border:1px solid var(--warn);border-radius:7px;color:var(--text2);font-size:11px}
.enterprise-edit-form{display:grid;grid-template-columns:1fr 1fr;gap:8px}.enterprise-edit-form label{font-size:11px;color:var(--text3)}.enterprise-edit-form select{width:100%;margin-top:4px;background:var(--bg0);border:1px solid var(--line2);color:var(--text);border-radius:5px;padding:6px}.enterprise-edit-form .full{grid-column:1/-1}.enterprise-edit-form button{justify-self:start}
@media(max-width:1100px){.enterprise-workbench{grid-template-columns:190px minmax(320px,1fr) 230px}}
@media(max-width:820px){.enterprise-workbench{grid-template-columns:minmax(0,1fr)}.enterprise-left,.enterprise-right{display:none}.enterprise-center{min-height:520px}}
@media(prefers-reduced-motion:reduce){.enterprise-studio *{scroll-behavior:auto!important}}
`;

export function createEnterprisePresentationBinding(composition){
  if(!composition?.domain||!composition?.bus)throw Error('ENTERPRISE_PRESENTATION_COMPOSITION_REQUIRED');
  return Object.freeze({
    owner:'EnterpriseSurfacePresentation',
    workspaceInteraction:'WORKSPACE_FIRST',
    globalReadEditMode:false,
    domainOwner:composition.domain.owner,
    sharedOwners:composition.ownerBindings,
    regionContract:Object.freeze({TOP:'command binding only',LEFT:'typed structure content',CENTER:'shared Spatial presentation + typed state views',RIGHT:'selection context only',BOTTOM:'temporary deep work content only'})
  });
}

export function renderEnterpriseSurface(root,composition,{dir='ltr',spatialView=null}={}){
  if(!root||!composition)throw Error('ENTERPRISE_PRESENTATION_INPUT_REQUIRED');
  createEnterprisePresentationBinding(composition);
  root.dir=dir;root.dataset.surface='enterprise';root.dataset.workspaceInteraction='WORKSPACE_FIRST';delete root.dataset.readonly;
  let spatial=spatialView,mode='topology',status='Ready.';

  const nodeOptions=()=>composition.domain.relations.nodes||[];
  const relationPayloadFromForm=form=>{const source=form.elements.source.value,target=form.elements.target.value,type=form.elements.type.value;const payload={source,target,type,direction:'directed',expectedVersion:composition.domain.relations.version};if(type==='CONNECTS_TO'){payload.sourcePin=`${source}:eth0`;payload.targetPin=`${target}:eth0`;}return payload};
  const setStatus=(message,tone='neutral')=>{status=String(message||'');const node=root.querySelector('[data-enterprise-status]');if(node){node.textContent=status;node.dataset.tone=tone;node.focus?.({preventScroll:true})}};
  const execute=(id,payload={})=>{const result=composition.bus.execute(id,{...payload,route:'enterprise-presentation'});if(result?.ok===false){setStatus(`${result.code}: ${result.reason}`,'error');return result}setStatus(`${id} completed.`,'success');draw({preserveSpatial:true});return result};

  const centerPanel=s=>{
    if(mode==='topology')return `<div data-enterprise-spatial class="spatial-host" aria-label="Enterprise topology model"></div>`;
    if(mode==='twins')return `<div class="enterprise-panel"><div class="enterprise-summary-grid"><section class="enterprise-summary-card"><h3>Digital Twin</h3><p>${bdi(s.twinId||'No Twin')}</p><p>Binding: ${esc(s.twinBinding)}</p><p>Enterprise and Twin remain distinct identities.</p></section><section class="enterprise-summary-card"><h3>Overlay classification</h3><p>Enterprise-backed: ${s.objects.filter(x=>x.classification==='ENTERPRISE_BACKED').length}</p><p>Simulation-local: ${s.objects.filter(x=>x.classification==='SIMULATION_LOCAL').length}</p><p>Rebase cannot promote Simulation-local objects.</p></section></div></div>`;
    if(mode==='revisions')return `<div class="enterprise-panel"><table class="domain-table"><thead><tr><th>Revision</th><th>State</th><th>Lineage</th><th>Baseline digest</th></tr></thead><tbody><tr><td>${bdi(s.revisionId)}</td><td>${esc(s.authoring)}</td><td>${s.lineage.length?bdi(s.lineage.at(-1).sourceRevisionId):'Current working root'}</td><td>${bdi(s.baseline.digest)}</td></tr>${s.publishedRevisions.map(r=>`<tr><td>${bdi(r.revisionId)}</td><td>PUBLISHED</td><td>Immutable source</td><td>${bdi(r.baselineDigest)}</td></tr>`).join('')}</tbody></table></div>`;
    if(mode==='baselines')return `<div class="enterprise-panel"><table class="domain-table"><thead><tr><th>Baseline</th><th>Revision</th><th>Status</th><th>Digest</th></tr></thead><tbody>${s.baselines.map(b=>`<tr><td>${bdi(b.id)}</td><td>${bdi(b.revision)}</td><td>${esc(b.status)}</td><td>${bdi(b.digest)}</td></tr>`).join('')}</tbody></table><p class="enterprise-truth-warning">Baselines are immutable references. Rebinding a Twin selects another exact Baseline; it does not mutate a published Baseline in place.</p></div>`;
    return `<div class="enterprise-panel"><div class="enterprise-summary-grid"><section class="enterprise-summary-card"><h3>State</h3><p>Authoring: ${esc(s.authoring)}</p><p>Twin binding: ${esc(s.twinBinding)}</p></section><section class="enterprise-summary-card"><h3>Validation</h3><p>Typed relation writes are validated by the shared RelationDomainAdapter before commit.</p><p>Geometry changes remain representation-only.</p></section><section class="enterprise-summary-card"><h3>Behavior</h3><p>Simulation-local overlays remain explicitly classified and cannot become Enterprise inventory during rebase.</p></section></div></div>`;
  };

  const rightContext=s=>{const sel=s.selection;if(!sel?.id)return `<div class="enterprise-context"><div class="context-block"><h3>No selection</h3><p>Choose an Enterprise object or relation. Previous selection context is cleared.</p></div><div class="context-block"><h3>Source truth</h3><dl><dt>Classification</dt><dd>${esc(s.sourceTruth.classification)}</dd><dt>Canonical product truth</dt><dd>${String(s.sourceTruth.canonicalProductTruth)}</dd></dl></div></div>`;const node=sel.object;return `<div class="enterprise-context"><div class="context-block"><h3>${esc(node?.name||sel.id)}</h3><span class="enterprise-classification">${esc(sel.classification||sel.kind)}</span><dl><dt>ID</dt><dd>${bdi(sel.id)}</dd><dt>Type</dt><dd>${esc(node?.type||sel.kind)}</dd><dt>Source</dt><dd>${esc(node?.source||'Canonical relation projection')}</dd><dt>Revision</dt><dd>${bdi(s.revisionId)}</dd></dl></div>${node?`<div class="context-block"><h3>Capabilities</h3><p>${(node.capabilities||[]).map(esc).join(' · ')||'No capability projection'}</p></div><div class="context-block"><h3>Validation / impact</h3><p>${esc(node.validation||'No validation projection')}</p><p>Lifecycle: ${esc(node.lifecycle||'—')}</p></div>`:''}</div>`};

  const leftStructure=s=>`<div class="enterprise-group"><h3>Enterprise Model</h3>${s.objects.filter(x=>x.classification==='ENTERPRISE_BACKED').map(o=>`<button type="button" class="enterprise-tree-button" data-object="${esc(o.id)}" aria-current="${s.selection.id===o.id}"><span>${esc(o.name||o.label||o.id)}</span><span class="enterprise-classification">Enterprise-backed</span></button>`).join('')}</div><div class="enterprise-group"><h3>Digital Twins</h3><button type="button" class="enterprise-tree-button" data-mode-target="twins">${bdi(s.twinId||'No Twin')} · ${esc(s.twinBinding)}</button>${s.objects.filter(x=>x.classification==='SIMULATION_LOCAL').map(o=>`<button type="button" class="enterprise-tree-button" data-object="${esc(o.id)}" aria-current="${s.selection.id===o.id}"><span>${esc(o.name||o.label||o.id)}</span><span class="enterprise-classification">Simulation-local</span></button>`).join('')}</div><div class="enterprise-group"><h3>Revisions</h3><button type="button" class="enterprise-tree-button" data-mode-target="revisions">${bdi(s.revisionId)} · ${esc(s.authoring)}</button></div><div class="enterprise-group"><h3>Baselines</h3>${s.baselines.map(b=>`<button type="button" class="enterprise-tree-button" data-mode-target="baselines">${bdi(b.id)} · ${esc(b.status)}</button>`).join('')}</div>`;

  const draw=({preserveSpatial=false}={})=>{
    const s=composition.domain.snapshot(),editAvailability=composition.bus.availability('enterprise.edit'),handoffAvailability=composition.bus.availability('enterprise.handoff');
    const existingSpatial=preserveSpatial?spatial:null;
    root.innerHTML=`<style data-enterprise-presentation-style>${STYLE}</style><section class="enterprise-studio" aria-label="Enterprise and Digital Twin modeling workspace"><header class="enterprise-top" data-region="TOP"><div class="enterprise-identity"><strong>Enterprise · ${bdi(s.revisionId)}</strong><span class="state-token" data-state="${stateTone(s.authoring)}">${esc(s.authoring)}</span><span class="state-token" data-state="${stateTone(s.twinBinding)}">${esc(s.twinBinding)}</span></div>${commandButton('enterprise.inspect','Inspect',composition)}${commandButton('enterprise.edit','Connect / Edit Relation',composition)}${commandButton('enterprise.revise','Clone / New Revision',composition)}${commandButton('enterprise.twin','Twin / Rebase',composition)}${commandButton('enterprise.handoff','Prepare Run',composition)}</header><div class="enterprise-workbench"><aside class="enterprise-left" data-region="LEFT" aria-label="Enterprise structure"><h2>Enterprise / Twin structure</h2>${leftStructure(s)}</aside><main class="enterprise-center" data-region="CENTER"><nav class="enterprise-modebar" aria-label="Enterprise workbench views">${[['topology','Topology'],['twins','Digital Twins'],['revisions','Revisions'],['baselines','Baselines'],['state','State / Validation']].map(([id,label])=>`<button class="btn" type="button" data-mode="${id}" aria-pressed="${mode===id}">${label}</button>`).join('')}</nav><div class="enterprise-main">${centerPanel(s)}<p tabindex="-1" role="status" aria-live="polite" class="enterprise-status" data-enterprise-status>${esc(status)}</p></div></main><aside class="enterprise-right" data-region="RIGHT" aria-label="Selected Enterprise context"><h2>Selected context</h2>${rightContext(s)}</aside></div><details class="enterprise-bottom" data-region="BOTTOM"><summary>Temporary deep work · validation / history / provenance</summary><div class="enterprise-bottom-body"><p>Shared pane owner should host this content in product composition; S10 does not implement independent pane mechanics.</p><pre>${esc(JSON.stringify({authoring:s.authoring,twinBinding:s.twinBinding,baseline:s.baseline,lineage:s.lineage,persistence:s.persistence,sourceTruth:s.sourceTruth},null,2))}</pre></div></details></section>`;

    root.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;draw()}));
    root.querySelectorAll('[data-mode-target]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.modeTarget;draw()}));
    root.querySelectorAll('[data-object]').forEach(button=>button.addEventListener('click',()=>{composition.bus.execute('enterprise.inspect',{id:button.dataset.object,route:'enterprise-left-structure'});status=`Selected ${button.dataset.object}`;draw()}));
    root.querySelector('[data-command="enterprise.inspect"]')?.addEventListener('click',()=>{const selected=composition.domain.snapshot().selection.id;composition.bus.execute('enterprise.inspect',{id:selected,route:'enterprise-toolbar'});setStatus(selected?`Inspected ${selected}`:'Selection cleared.','success');draw()});
    root.querySelector('[data-command="enterprise.revise"]')?.addEventListener('click',()=>execute('enterprise.revise',{expectedVersion:composition.domain.version,reason:'explicit Enterprise successor revision'}));
    root.querySelector('[data-command="enterprise.handoff"]')?.addEventListener('click',()=>execute('enterprise.handoff'));
    root.querySelector('[data-command="enterprise.twin"]')?.addEventListener('click',()=>{const current=composition.domain.snapshot();if(current.twinBinding==='BASELINE_STALE'){const overlays=current.objects.map(o=>({id:o.id,classification:o.classification}));execute('enterprise.twin',{action:'rebaseTwin',overlayRefs:overlays,conflictsResolved:true,targetBaseline:{id:`${current.baseline.id}-SUCCESSOR`,revision:String(Number(current.baseline.revision||0)+1),digest:`${current.baseline.digest}:successor`}})}else{composition.domain.setTwinBinding({baselineStatus:'STALE'});status='Twin marked BASELINE_STALE for explicit rebase preview.';draw()}});
    root.querySelector('[data-command="enterprise.edit"]')?.addEventListener('click',()=>{mode='topology';draw();const main=root.querySelector('.enterprise-main');const nodes=nodeOptions();const form=document.createElement('form');form.className='enterprise-edit-form enterprise-summary-card';form.dataset.relationComposer='';form.innerHTML=`<label>Source<select name="source">${nodes.map(n=>`<option value="${esc(n.id)}">${esc(n.name||n.label||n.id)}</option>`).join('')}</select></label><label>Target<select name="target">${nodes.map((n,i)=>`<option value="${esc(n.id)}" ${i===1?'selected':''}>${esc(n.name||n.label||n.id)}</option>`).join('')}</select></label><label class="full">Typed relation<select name="type">${composition.domain.relations.types.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('')}</select></label><button class="btn" type="submit">Validate and apply relation</button><button class="btn" type="button" data-cancel-relation>Cancel</button>`;main.prepend(form);form.elements.type.addEventListener('change',()=>{});form.addEventListener('submit',event=>{event.preventDefault();const result=composition.bus.execute('enterprise.edit',{...relationPayloadFromForm(form),route:'enterprise-relation-composer'});if(result?.ok===false)setStatus(`${result.code}: ${result.reason}`,'error');else{status='Typed relation committed by W03EnterpriseDomain; geometry was not used as semantic truth.';spatial=null;draw()}});form.querySelector('[data-cancel-relation]').addEventListener('click',()=>form.remove())});

    if(mode==='topology'){
      const host=root.querySelector('[data-enterprise-spatial]');
      if(existingSpatial&&existingSpatial.host===host)spatial=existingSpatial;
      else{
        spatial=new SpatialView(host,nodeOptions(),composition.domain.relations.project(),{
          select:ids=>{const id=ids.at(-1)||null;composition.bus.execute('enterprise.inspect',{id,route:'shared-spatial-selection'});status=id?`Selected ${id}`:'Selection cleared.';const snap=composition.domain.snapshot();const right=root.querySelector('.enterprise-right');if(right)right.innerHTML=`<h2>Selected context</h2>${rightContext(snap)}`},
          open:id=>{composition.bus.execute('enterprise.inspect',{id,route:'shared-spatial-open'});status=`Inspected ${id}`;draw()},
          change:()=>{}
        });
        spatial.setActiveMode('author');
        requestAnimationFrame?.(()=>spatial.fit?.());
      }
    }
    if(!editAvailability.enabled&&s.authoring==='PUBLISHED')setStatus('Published revision is immutable. Spatial selection and analysis remain interactive; create a successor revision to write.','neutral');
    else if(!handoffAvailability.enabled&&handoffAvailability.code==='BASELINE_STALE')setStatus('Twin baseline is stale. Inspect and model remain interactive; Run preparation is blocked until explicit rebase.','neutral');
  };

  draw();
  return Object.freeze({
    owner:'EnterpriseSurfacePresentation',
    binding:createEnterprisePresentationBinding(composition),
    refresh:()=>draw(),
    focus:()=>root.querySelector('[data-region="CENTER"] .spatial-canvas, [data-region="CENTER"] button')?.focus(),
    spatial:()=>spatial,
    setMode:value=>{mode=value;draw();return mode;},
    destroy:()=>{root.replaceChildren();spatial=null;}
  });
}
