/**
 * W02-LEARN · surface composition.
 *
 * SHARED MECHANICS + SURFACE-SPECIFIC COMPOSITION + SURFACE-SPECIFIC PRESENTATION.
 *
 * Region ownership:
 *   TOP      → Learn-owned banner content inside the shared TopBanner slot.
 *   LEFT     → Learning path rail (Learn composition) + shared outline mechanics.
 *   CENTER   → Activity workbench above the shared Structured editor (real work).
 *   RIGHT    → shared Context Inspector (Learn-authored provider content).
 *   TOOLBAR  → Learn command set through the shared toolbar slot.
 *
 * The composition serves learning specifically: progress, sequence, mastery state
 * and the learner's next step. It is deliberately not a browse/organize layout.
 */
import {ensureLearnStyles} from './styles.js';
import {t,tf,tok,e,learnLocale,learnDir} from './i18n.js';
import {buildLearnModel,stageCaption,percentLabel,type LearnModel} from './model.js';

const icon=(id:string,cls='icon sm')=>`<svg class="${cls}" aria-hidden="true"><use href="#${id}"></use></svg>`;
const attemptCaption=(model:LearnModel)=>`${t('attemptShort',model.locale)} · ${model.attempt?.state||t('attemptNone',model.locale)}`;

type Deps={learn:any;structured:any;workspace:any;commands:any};

/* ── TOP: banner ─────────────────────────────────────────── */
function renderBanner(model:LearnModel,doc:Document){
  const banner=doc.querySelector('#topBanner');
  if(!banner)return;
  banner.setAttribute('aria-label',t('crumbKind',model.locale));
  const crumbs=banner.querySelector('.crumbs');
  if(crumbs){
    crumbs.innerHTML=`<span>${e(t('crumbArea',model.locale))}</span><span>›</span><span>${e(t('crumbKind',model.locale))}</span><span>›</span><bdi dir="ltr">${e(model.activity.id)}</bdi>`;
    const idNode=crumbs.querySelector('#bannerKuId');
    if(idNode)idNode.textContent=model.activity.id;
  }
  const title=doc.querySelector('#bannerTitle');
  if(title)title.textContent=model.sourceAvailable?model.activity.title:t('unboundTitle',model.locale);
  const toolbarTitle=doc.querySelector('#toolbarTitle');
  if(toolbarTitle)toolbarTitle.textContent=model.sourceAvailable?model.activity.title:t('unboundTitle',model.locale);
  const toolbarIdentity=doc.querySelector('#toolbarKuId');
  if(toolbarIdentity)toolbarIdentity.textContent=model.activity.id;

  const badge=banner.querySelector('.badge.accent');
  if(badge){
    const tone=model.sourceAvailable?'ok':'';
    badge.className=`badge accent${tone?` ${tone}`:''}`;
    badge.innerHTML=`<span class="dot"></span>${e(model.sourceAvailable?t('statusActive',model.locale):t('statusUnbound',model.locale))}`;
  }
  const secondary=banner.querySelector('.secondary');
  if(secondary)secondary.innerHTML=`<span dir="auto">${e(t('secondaryRead',model.locale))}</span><span dir="auto">${e(t('secondaryTruth',model.locale))}</span>`;
  const tags=banner.querySelector('.tags');
  if(tags)tags.innerHTML=[
    `<span class="badge">${e(model.sourceAvailable?t('tagSourceBound',model.locale):t('tagSource',model.locale))}</span>`,
    `<span class="badge">${e(t('tagLocal',model.locale))}</span>`,
    `<span class="badge ok">${e(t('tagMastery',model.locale))}</span>`
  ].join('');
  const lock=banner.querySelector('.lock span');
  if(lock)lock.textContent=t('lock',model.locale);
}

/* ── LEFT: learning path ─────────────────────────────────── */
function stageRow(model:LearnModel,stage:LearnModel['stages'][number]){
  const current=stage.state==='current';
  const meta=stage.key==='journey'?stage.meta.map(row=>`<span class="lsr-chip" data-tone="mute">${e(row.label)} · ${row.technical?tok(row.value):e(row.value)}</span>`).join(''):'';
  return `<button type="button" class="lsr-stage" data-learn-stage="${stage.key}" data-state="${stage.state}" aria-current="${current?'true':'false'}">
    <span class="lsr-rail" aria-hidden="true">${stage.state==='done'?icon('i-check','icon sm'):e(stage.index)}</span>
    <span class="lsr-stx">
      <span class="lsr-nm" dir="auto">${e(stage.label)}</span>
      <span class="lsr-sb" dir="auto">${e(stage.sub)}</span>
      ${meta?`<span class="lsr-tags">${meta}</span>`:''}
    </span>
    <span class="lsr-chip" data-tone="${stage.badgeTone==='mute'?'':stage.badgeTone}">${e(stage.badge)}</span>
  </button>`;
}

function leftPaneHTML(model:LearnModel){
  const src=model.source;
  const stages=model.stages.map(stage=>stageRow(model,stage)).join('');
  const sections=model.document.hasSections
    ? `<section class="lsr-outline">
         <div class="lsr-grouphd"><span>${e(t('sections',model.locale))}</span></div>
         <label class="treesearch">${icon('i-search')}<input aria-label="${e(t('searchSections',model.locale))}" id="learnOutlineSearch" placeholder="${e(t('searchSections',model.locale))}" type="search"></label>
         <div id="learnStructureTree"></div>
       </section>`
    : '';
  return `<div class="lsr" data-learn="rail">
    <section class="lsr-pathhead">
      <div class="lsr-pct">
        <strong>${e(percentLabel(model))}</strong>
        <span>${e(t('overall',model.locale))}</span>
      </div>
      <div class="lsr-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${model.progress.percent}" aria-label="${e(t('overall',model.locale))}"><i style="width:${model.progress.percent}%"></i></div>
      <div class="lsr-sub">
        <span class="lsr-chip" data-tone="accent">${e(stageCaption(model))}</span>
        <span class="lsr-chip">${e(model.progress.state)}</span>
        <span class="lsr-chip">${e(t('masteryShort',model.locale))}</span>
      </div>
    </section>

    <section class="lsr-group">
      <div class="lsr-grouphd"><span>${e(t('pathTitle',model.locale))}</span><span>${e(attemptCaption(model))}</span></div>
      <div class="lsr-stagelist">${stages}</div>
    </section>

    ${sections}

    <section class="lsr-source">
      <div class="lsr-srcrow">
        <strong dir="auto">${e(t('sourceCard',model.locale))}</strong>
        <span class="lsr-chip" data-tone="${src.bound?'ok':'warn'}">${e(src.bound?t('bound',model.locale):t('unbound',model.locale))}</span>
      </div>
      <p dir="auto">${src.bound?e(t('subJourneyOpen',model.locale)):e(t('unboundWhy',model.locale))}</p>
      <dl>
        <div><dt>${e(t('fProvider',model.locale))}</dt><dd>${tok(src.truth)}</dd></div>
        <div><dt>${e(t('fClassification',model.locale))}</dt><dd>${tok(src.classification)}</dd></div>
        <div><dt>${e(t('fRejection',model.locale))}</dt><dd>${tok(src.bound?'—':src.rejectionReason)}</dd></div>
        ${src.providerRef?`<div><dt>${e(t('fProviderRef',model.locale))}</dt><dd>${tok(src.providerRef)}</dd></div>`:''}
      </dl>
    </section>

    <button type="button" class="btn mapbtn" data-learn-action="path-map">${icon('i-folder')}<span dir="auto">${e(t('openPathMap',model.locale))}</span></button>
  </div>`;
}

/* ── CENTER: activity workbench ──────────────────────────── */
function briefFacts(model:LearnModel,which:'assessment'|'lab'){
  const isAssessment=which==='assessment';
  const brief=isAssessment?model.briefs.assessment:model.briefs.lab;
  const rows=isAssessment
    ? [
        [t('briefAvailability',model.locale),brief.availability,true],
        [t('briefGrading',model.locale),brief.gradingProvider,true],
        [t('briefMastery',model.locale),brief.masteryWrite?t('yes',model.locale):t('no',model.locale),false],
        [t('fObjective',model.locale),model.nextStep,false],
        [t('briefOwner',model.locale),'LearnAdapter',true]
      ]
    : [
        [t('briefAvailability',model.locale),brief.kind,true],
        [t('briefRuntime',model.locale),brief.runtime,true],
        [t('briefOwner',model.locale),brief.operationalAdapter,true],
        [t('briefMastery',model.locale),brief.w03RuntimeCreated?t('yes',model.locale):t('no',model.locale),false],
        [t('fPrerequisites',model.locale),model.activity.prerequisiteState,true]
      ];
  return `<dl class="lsr-facts">${rows.map(([label,value,technical])=>`<div><dt dir="auto">${e(String(label))}</dt><dd>${technical?tok(value):`<span dir="auto">${e(String(value))}</span>`}</dd></div>`).join('')}</dl>`;
}

function workbenchHTML(model:LearnModel,attemptAnswer:string){
  const attempt=model.attempt;
  const practiceBlocked=Boolean(model.availability.practice)||!model.sourceAvailable;
  const stepState=(key:string)=>key==='journey'?(model.sourceAvailable?'done':'on'):key==='practice'?(attempt?.state==='SUBMITTED'?'done':attempt?'on':'off'):'off';
  const steps=(['journey','practice','assessment','lab'] as const).map((key,index)=>{
    const label=key==='journey'?t('stageJourney',model.locale):key==='practice'?t('stagePractice',model.locale):key==='assessment'?t('stageAssessment',model.locale):t('stageLab',model.locale);
    const state=stepState(key);
    const arrow=index<3?`<span class="lsr-arrow" aria-hidden="true">→</span>`:'';
    return `<span class="lsr-step" data-on="${state==='done'?'done':state==='on'?'true':'false'}">${state==='done'?icon('i-check'):''}${e(label)}</span>${arrow}`;
  }).join('');

  const reason=practiceBlocked
    ? `<div class="lsr-blockreason">${icon('i-info')}<span dir="auto">${e(model.availability.practice||t('subPracticeLocked',model.locale))}</span></div>`
    : '';

  const controls=model.availability.practice
    ? `<button type="button" class="btn" data-learn-action="practice-start" disabled aria-disabled="true">${e(t('startAttempt',model.locale))}</button>`
    : `<button type="button" class="btn" data-learn-action="practice-start">${e(attempt?t('newAttempt',model.locale):t('startAttempt',model.locale))}</button>`;

  const submit=model.availability.practice||!attempt||attempt.state==='SUBMITTED'
    ? `<button type="button" class="btn" data-learn-action="practice-submit" disabled aria-disabled="true">${e(t('submitAnswer',model.locale))}</button>`
    : `<button type="button" class="btn" data-learn-action="practice-submit">${e(t('submitAnswer',model.locale))}</button>`;

  const review=model.availability.review
    ? `<button type="button" class="btn" data-learn-action="practice-review" disabled aria-disabled="true" title="${e(model.availability.review)}">${e(t('reviewAttempt',model.locale))}</button>`
    : `<button type="button" class="btn" data-learn-action="practice-review">${e(t('reviewAttempt',model.locale))}</button>`;

  return `<section class="lsr-work" data-learn="work">
    <header class="lsr-workhd">
      <p class="lsr-eyebrow">${e(t('eyebrow',model.locale))}</p>
      <div class="lsr-idrow">
        <span class="lsr-chip" data-tone="${model.sourceAvailable?'ok':'warn'}"><span class="lsr-dot"></span>${e(model.sourceAvailable?t('statusActive',model.locale):t('statusUnbound',model.locale))}</span>
        <span class="lsr-chip">${e(t('fActivityId',model.locale))} · ${tok(model.activity.id)}</span>
        <span class="lsr-chip">${e(t('fRevision',model.locale))} · ${tok(model.activity.revision??'—')}</span>
        <span class="lsr-chip">${e(t('fDocRevision',model.locale))} · ${tok(model.document.revision??'—')}</span>
        <span class="lsr-chip">${e(t('attemptShort',model.locale))} · ${tok(attempt?.state||model.progress.attemptTruth)}</span>
        ${model.editable?`<span class="lsr-chip">${e(t('fEditable',model.locale))}</span>`:''}
      </div>
    </header>

    <section class="lsr-progress">
      <div class="lsr-prow">
        <strong dir="auto">${e(t('pathProgress',model.locale))}</strong>
        <span class="lsr-meta">${e(stageCaption(model))} · ${e(t('progressState',model.locale))}: ${tok(model.progress.state)}</span>
      </div>
      <div class="lsr-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${model.progress.percent}" aria-label="${e(t('pathProgress',model.locale))}"><i style="width:${model.progress.percent}%"></i></div>
      <div class="lsr-legend">
        <span class="lsr-chip" data-tone="accent">${e(model.progress.scope)}</span>
        <span class="lsr-chip">${e(t('masteryShort',model.locale))}</span>
        <span class="lsr-chip">${e(t('fPersisted',model.locale))} · ${model.progress.persisted?t('yes',model.locale):t('no',model.locale)}</span>
      </div>
    </section>

    <section class="lsr-objective">
      <span class="lsr-oicon" aria-hidden="true">${icon('i-focus','icon')}</span>
      <span class="lsr-obody">
        <span class="lsr-eyebrow">${e(t('nextStep',model.locale))}</span>
        <span class="lsr-otext" dir="auto">${e(model.nextStep)}</span>
        <span class="lsr-ometa">
          <span class="lsr-chip" data-tone="mute">${e(t('fProvider',model.locale))} · ${tok(model.source.truth)}</span>
          <span class="lsr-chip" data-tone="mute">${e(t('progressState',model.locale))} · ${tok(model.progress.attemptTruth)}</span>
        </span>
      </span>
    </section>

    <section class="lsr-panel">
      <div class="lsr-phead2">
        <span class="lsr-hdtx">
          <h3 dir="auto">${e(t('practiceTitle',model.locale))}</h3>
          <span class="lsr-meta" dir="auto">${e(t('practiceHint',model.locale))}</span>
        </span>
        <span class="lsr-chip" data-tone="${attempt?'accent':'mute'}">${e(attemptCaption(model))}</span>
      </div>
      <div class="lsr-pbody2">
        <div class="lsr-steps" aria-label="${e(t('stageJourney',model.locale))} → ${e(t('stageLab',model.locale))}">${steps}</div>
        ${reason}
        <div class="lsr-field">
          <label for="practiceAnswer">${e(t('answerLabel',model.locale))}</label>
          <textarea id="practiceAnswer" dir="auto" placeholder="${e(t('answerPlaceholder',model.locale))}" ${practiceBlocked||attempt?.state==='SUBMITTED'?'disabled aria-disabled="true"':''}>${e(attemptAnswer)}</textarea>
        </div>
      </div>
      <div class="lsr-pfoot">
        <span class="lsr-actions">${controls}${submit}${review}</span>
        <span class="lsr-meta" dir="auto">${e(t('localNote',model.locale))}</span>
      </div>
    </section>

    <section class="lsr-after">
      <span class="lsr-meta" dir="auto">${e(t('afterPractice',model.locale))}</span>
      <span class="lsr-actions">
        <button type="button" class="btn" data-learn-action="brief-assessment">${icon('i-list')}<span dir="auto">${e(t('assessmentTitle',model.locale))}</span></button>
        <button type="button" class="btn" data-learn-action="brief-lab">${icon('i-lab')}<span dir="auto">${e(t('labTitle',model.locale))}</span></button>
      </span>
    </section>
  </section>`;
}

/* ── dialogs ─────────────────────────────────────────────── */
function briefDialog(model:LearnModel,which:'assessment'|'lab',workspace:any){
  const isAssessment=which==='assessment';
  workspace.dialog(
    isAssessment?t('assessmentTitle',model.locale):t('labTitle',model.locale),
    `<p dir="auto" style="margin:0 0 10px">${e(isAssessment?t('subAssessment',model.locale):t('subLab',model.locale))}</p>
     ${briefFacts(model,which)}
     <p class="lsr-meta" dir="auto" style="margin-top:10px">${e(t('localNote',model.locale))}</p>`,
    {safeOutside:true});
}

function pathMapDialog(model:LearnModel,workspace:any){
  const rows=model.stages.map(stage=>`<div class="lsr-facts" style="margin-bottom:8px">
      <div><dt>${e(stage.index)} · <span dir="auto">${e(stage.label)}</span></dt><dd><span class="lsr-chip" data-tone="${stage.badgeTone==='mute'?'':stage.badgeTone}">${e(stage.badge)}</span></dd></div>
      <div><dt></dt><dd><span dir="auto">${e(stage.sub)}</span></dd></div>
    </div>`).join('');
  workspace.dialog(t('pathMapTitle',model.locale),
    `<p dir="auto" style="margin:0 0 10px">${e(t('pathMapIntro',model.locale))}</p>${rows}
     <p class="lsr-meta" dir="auto">${e(t('localNote',model.locale))}</p>`,
    {safeOutside:true});
}

/* ── orchestrator ────────────────────────────────────────── */

/** Hide donor projection groups that carry no rows — an empty group is a dead zone. */
function syncProjectionGroups(editor:Element){
  let changed=false;
  editor.querySelectorAll('.projection-group').forEach(group=>{
    const body=group.querySelector('.projection-body');
    const empty=!body||!body.children.length;
    const node=group as HTMLElement;
    if(node.hidden!==empty){node.hidden=empty;changed=true}
  });
  return changed;
}

export function mountLearnSurfaceComposition({learn,structured,workspace,commands}:Deps){
  const doc=document;
  ensureLearnStyles(doc);

  let focusedId:string|null=null;
  const render=()=>{
    const model=buildLearnModel({learn,structured,commands});
    focusedId=doc.activeElement&&typeof (doc.activeElement as any).id==='string'?(doc.activeElement as any).id:null;

    renderBanner(model,doc);

    const leftBody=doc.querySelector('#leftPane .pbody');
    if(leftBody){
      // Learn owns this pane's composition; the donor outline scaffold is retired.
      [...leftBody.children].forEach(child=>{if(child.id!=='domainLeftRegion')child.remove()});
      const host=workspace.region('LEFT',{html:leftPaneHTML(model),label:t('pathTitle',model.locale),summary:t('overall',model.locale)});
      if(host)host.dataset.learnOwned='W02-LEARN';
      const headingIcon=doc.querySelector('#leftPane .paneheadicon use');
      if(headingIcon)headingIcon.setAttribute('href','#i-book');
      const outlineHost=doc.querySelector('#learnStructureTree');
      if(outlineHost&&model.document.hasSections){
        const activate=(blockId:string)=>{
          const block=doc.querySelector(`#blockList [data-block-id="${CSS.escape(blockId)}"]`);
          block?.scrollIntoView({block:'nearest'});
          block?.querySelector('[data-editable-block]')?.focus();
        };
        const search=doc.querySelector('#learnOutlineSearch') as HTMLInputElement|null;
        try{learn.mountOutline(outlineHost,{query:search?.value||'',onActivate:activate})}catch{}
        search?.addEventListener('input',()=>{try{learn.mountOutline(outlineHost,{query:search.value||'',onActivate:activate})}catch{}});
      }
    }

    const contextLabel=workspace.region('RIGHT',{html:'',label:t('ctxPane',model.locale)});
    const legacyContext=doc.querySelector('#domainContext');
    if(legacyContext){legacyContext.hidden=true;legacyContext.innerHTML='';legacyContext.setAttribute('aria-hidden','true')}
    // Donor KU/block scope switch does not apply to the Learn route (no Library KU state).
    doc.querySelectorAll('#rightPane .contextscope').forEach(node=>{node.hidden=true;node.inert=true;node.setAttribute('aria-hidden','true')});
    void contextLabel;

    workspace.region('BOTTOM',{label:t('deepWork',model.locale),summary:t('deepWorkHint',model.locale),open:null});

    const editor=doc.querySelector('#editorDocument');
    if(editor){
      const current=editor.querySelector('.learn-practice')||editor.querySelector('[data-learn="work"]');
      const answer=(doc.querySelector('#practiceAnswer') as HTMLTextAreaElement|null)?.value??model.attempt?.answer??'';
      const wrap=doc.createElement('div');
      wrap.innerHTML=workbenchHTML(model,answer);
      const node=wrap.firstElementChild;
      if(current&&node)current.replaceWith(node);
      else if(node&&!editor.querySelector('[data-learn="work"]'))editor.prepend(node);

      // The document title is domain data (StructuredDocumentDomainAdapter) and is
      // intentionally left to the shared editor — the surface never clobbers it.
      const docLead=editor.querySelector('.doclead');
      if(docLead)docLead.textContent=t('docLead',model.locale);
      const groupTitle=editor.querySelector('#contentGroupToggle .groupTitle');
      if(groupTitle)groupTitle.textContent=t('docGroup',model.locale);
      const groupHint=editor.querySelector('#contentGroupToggle .groupHint');
      if(groupHint)groupHint.textContent=t('docGroupHint',model.locale);
      editor.setAttribute('aria-label',t('crumbKind',model.locale));
      syncProjectionGroups(editor);
    }

    workspace.toolbar(['learn.open','learn.practice','learn.review']);

    if(focusedId){
      const target=doc.getElementById(focusedId);
      if(target&&typeof (target as any).focus==='function')target.focus();
    }
    return model;
  };

  let model=render();

  doc.addEventListener('click',event=>{
    const target=event.target as HTMLElement|null;
    const action=target?.closest?.('[data-learn-action]') as HTMLElement|null;
    if(action){
      const kind=action.dataset.learnAction;
      if(kind==='path-map'){pathMapDialog(model,workspace);return}
      if(kind==='brief-assessment'){briefDialog(model,'assessment',workspace);return}
      if(kind==='brief-lab'){briefDialog(model,'lab',workspace);return}
      const answer=(doc.querySelector('#practiceAnswer') as HTMLTextAreaElement|null)?.value||'';
      try{
        if(kind==='practice-start')commands.execute('learn.practice',{route:'learn-workbench'});
        if(kind==='practice-submit')commands.execute('learn.practice',{action:'submit',answer,route:'learn-workbench'});
        if(kind==='practice-review')commands.execute('learn.review',{route:'learn-workbench'});
      }catch(error:any){workspace.status(String(error?.message||error),'error')}
      model=render();
      return;
    }
    const stage=target?.closest?.('[data-learn-stage]') as HTMLElement|null;
    if(stage){
      const key=stage.dataset.learnStage||'';
      if(key==='assessment'||key==='lab'){briefDialog(model,key==='assessment'?'assessment':'lab',workspace);return}
      if(key==='practice'){
        const field=doc.querySelector('#practiceAnswer') as HTMLTextAreaElement|null;
        if(field&&!field.disabled){field.focus();field.scrollIntoView({block:'center'});return}
        try{commands.execute('learn.practice',{route:'learn-path-rail'})}catch{}
        model=render();
        return;
      }
      try{commands.execute('learn.open',{route:'learn-path-rail'})}catch{}
      model=render();
      return;
    }
    const hostCommand=target?.closest?.('[data-foundation-command],[data-command]') as HTMLElement|null;
    const commandId=hostCommand?.getAttribute('data-foundation-command')||hostCommand?.getAttribute('data-command')||'';
    if(commandId.startsWith('learn.'))setTimeout(()=>{model=render()},0);
  },true);

  const observer=new MutationObserver(()=>{
    const work=doc.querySelector('[data-learn="work"]'),rail=doc.querySelector('#domainLeftRegion .lsr');
    const editor=doc.querySelector('#editorDocument');
    const projectionsStale=editor?syncProjectionGroups(editor):false;
    if(!work||!rail||projectionsStale)model=render();
  });
  if(doc.body)observer.observe(doc.body,{childList:true,subtree:true});

  workspace.onPreferences=()=>{model=render()};
  return {render,get model(){return model},locale:learnLocale(),dir:learnDir()};
}
