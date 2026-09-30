/* MANUAL AI BRIDGE — CENTER WORKBENCH (W05-MANUAL-AI)
 * The centre is this surface's actual work area: a lettered A…E adjudication workbench that mirrors
 * the Owner-confirmed AI-Bridge reference's information architecture (request identity → cleared
 * payload → exchange state → response intake → human decision gate). Every value comes from the
 * domain adapter's inspect()/rows(); nothing is inferred, nothing is a fake AI receipt. */
                                                                               
import {RECORD_BASIS,STATE_META,B,DISPOSITION_COPY,esc,icon,L,localeNow,pill,shortDigest,STEPS,copyOf,stepStatuses,stateTone} from './presentation.js';

const DISPOSITIONS=['ACCEPT','EDIT','REJECT','DEFER','REQUEST_EVIDENCE'];

                              
                   
                          
                        
                
                 
  

const alt=(locale          )=>locale==='ar'?'en':'ar';

function def(label       ,value       ,strong=false,inline='')       {
  return `<div><dt>${esc(label)}</dt><dd${strong?' data-strong="true"':''}>${inline||value}</dd></div>`;
}

function renderIdentity(ctx                 )       {
  const {row,locale}=ctx;
  if(!row)return '';
  const copy=copyOf(row),meta=STATE_META[row.state];
  const stateLabel=locale==='ar'?meta.ar:meta.en;
  return `<section class="ma-sec" data-sec="A" data-lead="true">
    <h2><span class="ma-sec-key" dir="ltr">A.</span>${locale==='ar'?'هوية الطلب':'Request identity'}<em>${locale==='ar'?'Request identity':'هوية الطلب'}</em></h2>
    <dl class="ma-defs">
      ${def(locale==='ar'?'معرّف الطلب':'Request ID','',true,B(row.proposalId))}
      ${def(locale==='ar'?'الملف / المشروع':'Source / project','',false,esc(L(copy.project,locale)))}
      ${def(locale==='ar'?'تاريخ الإنشاء':'Created','',false,B(row.provenance.obtainedAt))}
      ${def(locale==='ar'?'الغرض':'Purpose','',false,esc(L(copy.title,locale)))}
      ${def(locale==='ar'?'الهدف':'Scope','',false,esc(L(copy.scope,locale)))}
      ${def(locale==='ar'?'الحالة الحالية':'Current state','',false,
        `<span class="ma-inline">${pill(row.state,stateTone(row.state))}<span>${esc(stateLabel)}</span></span>`)}
      ${def(locale==='ar'?'مسودة العمل':'Working draft','',false,
        row.draftId?`<span class="ma-inline">${pill('CREATED','ok')}<span>${B(row.draftId)}</span></span>`:`${B('NONE')} · <span style="color:var(--text3)">${esc(row.draftState)}</span>`)}
    </dl></section>`;
}

function renderPayload(ctx                 )       {
  const {row,locale}=ctx;
  if(!row)return '';
  const copy=copyOf(row),p=row.provenance;
  const rows                                =[
    ['doc',locale==='ar'?'وحدة المعرفة المصدر':'Source knowledge unit',`${B(p.sourceId)} · ${B(p.sourceRevisionId)}`,'muted'],
    ['doc',locale==='ar'?'الملفات المرفقة':'Included files',copy.files.length?copy.files.map(B).join(' · '):'—','muted'],
    ['info',locale==='ar'?'نطاق المحتوى':'Content scope',esc(L(copy.scope,locale)),'muted'],
    ['shield',locale==='ar'?'نتيجة التجهيز':'Clearance verdict',esc(L(copy.verdict,locale)),copy.verdictTone==='muted'?'muted':copy.verdictTone],
    ['plug',locale==='ar'?'أثر التصدير':'Export artifact',p.exportedArtifactId?`${B(p.exportedArtifactId)} · ${B(shortDigest(p.exportedPackageDigest))}`:`${B('NOT_EXPORTED')}`,'muted'],
    ['seal',locale==='ar'?'ظرف الحزمة':'Packet envelope',`${B('schemaVersion=2')} · ${B('mode=MANUAL_ONLY')}`,'muted']
  ];
  return `<section class="ma-sec" data-sec="B">
    <h2><span class="ma-sec-key" dir="ltr">B.</span>${locale==='ar'?'الحمولة الخارجية المجهّزة':'Cleared external payload'}<em>${locale==='ar'?'Cleared external payload':'الحمولة الخارجية المجهّزة'}</em></h2>
    <div class="ma-rows">${rows.map(([ic,lab,val,tone])=>`<div class="ma-row">${icon(ic,tone==='muted'?'info':tone       )}<span class="ma-lab">${esc(lab)}</span><span class="ma-val" data-tone="${tone}">${val}</span></div>`).join('')}</div>
    <p class="ma-sec-note">${locale==='ar'
      ?'الحمولة تخرج يدويًا من CEP. لا يُنفَّذ أي استدعاء مزوّد، ولا تُسجَّل أي استجابة كاكتمال قبل استيرادها وتدقيقها.'
      :'The payload leaves CEP by hand. No provider call is executed, and no response is recorded as complete before it is imported and verified.'}</p>
  </section>`;
}

function renderExchange(ctx                 )       {
  const {row,locale}=ctx;
  if(!row)return '';
  const status=stepStatuses(row);
  const meta=STATE_META[row.state];
  const equality=(ctx.inspected&&ctx.inspected.provenanceMatch)?'EQUAL':(row.state==='PROVENANCE_INVALID'?'MISMATCH':'PENDING');
  const eqTone=equality==='EQUAL'?'ok':equality==='MISMATCH'?'bad':'warn';
  const last=ctx.lastAction&&ctx.lastAction.proposalId===row.proposalId?ctx.lastAction.at:row.provenance.obtainedAt;
  return `<section class="ma-sec" data-sec="C">
    <h2><span class="ma-sec-key" dir="ltr">C.</span>${locale==='ar'?'حالة التبادل':'Exchange state'}<em>${locale==='ar'?'Exchange state':'حالة التبادل'}</em></h2>
    <ol class="ma-steps">${STEPS.map((step,index)=>{
      const s=status[index];
      const state=s==='done'?'done':s==='blocked'?'blocked':status.slice(0,index).every(v=>v==='done')?'current':'pending';
      return `<li data-s="${state}" title="${esc(step.en)}"><span class="ma-step-dot" dir="ltr">${state==='done'?'✓':state==='blocked'?'✕':index+1}</span><span class="ma-step-lab">${esc(locale==='ar'?step.ar:step.short)}</span></li>`;
    }).join('')}</ol>
    <div class="ma-statebar">
      <span class="ma-now">${locale==='ar'?'الحالة الحالية':'Current state'}${pill(locale==='ar'?meta.ar:meta.en,stateTone(row.state))}${pill(equality,eqTone)}</span>
      <span class="ma-upd">${esc(locale==='ar'?'آخر تحديث':'Last update')} <bdi>${esc(String(last||'—'))}</bdi></span>
    </div>
  </section>`;
}

function renderIntake(ctx                 )       {
  const {row,locale}=ctx;
  if(!row)return '';
  const p=row.provenance,match=ctx.inspected?.provenanceMatch||null;
  const received=p.obtainedBy==='MANUAL_IMPORT';
  const quarantined=row.state==='PROVENANCE_INVALID';
  const responseStatus=quarantined?{ar:'مستلمة · محجوزة بعد مخالفة التساوية',en:'Received · quarantined after equality mismatch'}
    :received?{ar:'مستلمة يدويًا وبانتظار القرار',en:'Imported manually and awaiting decision'}
    :{ar:'غير مستلمة — لا استجابة بعد',en:'Not received — no response yet'};
  const checks                              =[
    ['SOURCE_ID',match?(match.sourceId?'ok':'bad'):'muted'],
    ['SOURCE_REVISION',match?(match.sourceRevisionId?'ok':'bad'):'muted'],
    ['SOURCE_DIGEST',match?(match.sourceDigest?'ok':'bad'):'muted'],
    ['EXPORTED_PACKAGE_DIGEST',match?(match.packageDigest?'ok':'bad'):'muted']
  ];
  const mark=(tone                   )=>tone==='ok'?'✓':tone==='bad'?'✕':'?';
  return `<section class="ma-sec" data-sec="D">
    <h2><span class="ma-sec-key" dir="ltr">D.</span>${locale==='ar'?'استقبال الاستجابة':'Response intake'}<em>${locale==='ar'?'Response intake':'استقبال الاستجابة'}</em></h2>
    <dl class="ma-facts">
      <div><dt>${locale==='ar'?'حالة الاستجابة':'Response status'}</dt><dd>${pill(quarantined?'QUARANTINED':received?'IMPORTED':'PENDING',quarantined?'bad':received?'violet':'warn')}<span>${esc(L(responseStatus,locale))}</span></dd></div>
      <div><dt>${locale=='ar'?'يُستورد عند':'Imported at'}</dt><dd>${received?B(p.obtainedAt):'—'}</dd></div>
      <div><dt>${locale==='ar'?'طريقة الاستحواذ':'Acquisition'}</dt><dd>${B(p.obtainedBy)}</dd></div>
      <div><dt>${locale==='ar'?'الربط بالطلب الأصلي':'Linked original request'}</dt><dd>${icon('link','info')}${B(row.proposalId)}</dd></div>
    </dl>
    ${row.state==='EXPORTED'?`<div class="ma-intake">
      <label for="maIntake">${locale==='ar'?'لصق الاستجابة الخارجية':'Paste the external response'}</label>
      <textarea id="maIntake" data-ma-intake dir="auto" placeholder="${esc(locale==='ar'?'الصق نصّ الاستجابة الذي حصلت عليه خارج CEP…':'Paste the response text you obtained outside CEP…')}"></textarea>
      <small>${esc(locale==='ar'
        ?'لا يوجد استيراد تلقائي: هذا الحقل هو المدخل الوحيد، وزر «تسجيل استجابة خارجية» في شريط الأدوات يستهلكه.'
        :'There is no automatic import: this field is the only input, and the “Import external result” action in the strip consumes it.')}</small>
    </div>`:''}
    <div class="ma-eq">${checks.map(([name,tone])=>pill(`${mark(tone)} ${name}`,tone)).join('')}</div>
    <p class="ma-sec-note">${locale==='ar'
      ?'التسوية تُقارن أربعة قيم مُصرَّحة: معرّف المصدر، مراجعة المصدر، باقة المصدر، وبصمة حزمة التصدير. أي مخالفة تحجز الاستجابة ولا تُنتج قرارًا.'
      :'Equality compares four declared values: source id, source revision, source digest and export package digest. Any mismatch quarantines the response and produces no decision.'}</p>
  </section>`;
}

function renderGate(ctx                 )       {
  const {row,locale}=ctx;
  if(!row)return '';
  const governance=Array.isArray(ctx.inspected?.governance)?ctx.inspected.governance:[];
  const reviewable=row.state==='IMPORTED'||row.state==='DEFERRED';
  const reviewReason=ctx.inspected?.commandAvailability?.review||'';
  const readiness                           =ctx.inspected?.dispositionReadiness||null;
  const glyphs                           =['shield','person','seal'];
  return `<section class="ma-sec" data-sec="E">
    <h2><span class="ma-sec-key" dir="ltr">E.</span>${locale==='ar'?'بوابة القرار البشري':'Human decision gate'}<em>${locale==='ar'?'Human decision gate':'بوابة القرار البشري'}</em></h2>
    <div>${governance.map((g    ,index       )=>`<div class="ma-check">${icon(glyphs[index%3],index===0?'info':index===1?'violet':'ok')}<div><strong>${esc(locale==='ar'?g.rule:g.en)}</strong><small dir="ltr">${esc(g.enforced)}</small></div></div>`).join('')}</div>
    <div class="ma-gate">
      <span><b>${locale==='ar'?'جاهزية المراجعة':'Review readiness'}</b> — ${reviewable
        ?`${locale==='ar'?'المقترح مستورد بتسوية مصدر مثبتة، والقرار البشري متاح الآن.':'The proposal is imported with provenance equality proven; the human decision is open now.'}`
        :esc(reviewReason|| (locale==='ar'?'القرار غير متاح حتى الآن.':'The decision is not open yet.'))}</span>
      <span style="color:var(--text3)">${locale==='ar'
        ?'قبول يُنشئ مسودة عمل فقط ولا ينشر قانونيًا أبدًا.'
        :'Accept creates a working draft only and never publishes canonically.'}</span>
    </div>
    <div class="ma-actions" role="group" aria-label="${esc(locale==='ar'?'تصرفات المراجع':'Reviewer dispositions')}">
      ${DISPOSITIONS.map(d=>{
        const ready=(reviewable&&(readiness?readiness[d]==='AVAILABLE':true));
        const why=reviewable&&readiness&&readiness[d]&&readiness[d]!=='AVAILABLE'?String(readiness[d]):(reviewable?'':(reviewReason||'NOT_OPEN_YET'));
        return `<button type="button" class="btn" data-ma-disposition="${d}" title="${esc(why)}"${ready?'':' disabled aria-disabled="true"'}><span dir="auto">${esc(L(DISPOSITION_COPY[d],locale))}</span></button>`;
      }).join('')}
    </div>
    ${(reviewable&&readiness&&readiness.ACCEPT!=='AVAILABLE')?`<p class="ma-sec-note" style="border-top:0;padding-top:8px">${esc(locale==='ar'
      ?'لا يوجد مُستقبِل مسودة عمل مربوط في هذه البنية، لذلك تُبلغ محاولة القبول DRAFT_SINK_UNAVAILABLE ولا يُنشأ نجاح وهمي. التصرّفات الأخرى متاحة.'
      :'No working-draft sink is bound in this build, so ACCEPT reports DRAFT_SINK_UNAVAILABLE instead of fabricating a success. The other dispositions remain available.')}</p>`:''}
  </section>`;
}

function renderEmpty(locale          )       {
  const guide=locale==='ar'?[
    'جهّز طلبًا من مصدر مُصرَّح ومراجعة محددة.',
    'صدّر الحزمة واحصل على نتيجة الذكاء الاصطناعي خارج CEP.',
    'استورد النتيجة وتحقّق من تساوية المصدر قبل أي قرار.']
    :['Prepare a request from a declared source revision.',
      'Export the packet and obtain any AI result outside CEP.',
      'Import the result and prove provenance equality before any decision.'];
  return `<div class="ma-root" data-ma-owned="manual_ai" data-empty="true">
    <header class="ma-head"><div class="ma-head-main">
      <span class="ma-eyebrow"><bdi dir="ltr">W05 · HUMAN-IN-THE-LOOP AI BRIDGE</bdi></span>
      <h1>${esc(locale==='ar'?'جسر الذكاء الاصطناعي':'Manual AI Bridge')}<span class="ma-alt">${esc(locale==='ar'?'Manual AI Bridge':'جسر الذكاء الاصطناعي')}</span></h1>
      <p class="ma-lead">${esc(locale==='ar'?'تبادل يدوي محوّم: لا استدعاء مزوّد، لا نشر قانوني، والقرار النهائي يبقى لدى المراجع.':'A governed manual exchange: no provider call, no canonical publication, and the final decision stays with the reviewer.')}</p>
    </div></header>
    <section class="ma-sec"><h2><span class="ma-sec-key" dir="ltr">—</span>${locale==='ar'?'لا يوجد طلب محدد':'No request selected'}</h2>
      <div class="ma-empty">${esc(locale==='ar'?'اختر سجلًا من قائمة سجلات الجسر لفتح مسرد الطلب A…E.':'Select a record from the bridge records list to open the A…E adjudication workbench.')}</div>
      <ul style="margin:10px 0 0;padding-inline-start:18px;color:var(--text2);display:grid;gap:6px;font-size:12.5px">${guide.map(g=>`<li>${esc(g)}</li>`).join('')}</ul>
    </section></div>`;
}

export function renderCenter(ctx                 )       {
  if(!ctx.row)return renderEmpty(ctx.locale);
  return `<div class="ma-root" data-ma-owned="manual_ai" data-selected="${esc(ctx.row.proposalId)}" data-state="${esc(ctx.row.state)}">
    <header class="ma-head">
      <div class="ma-head-main">
        <span class="ma-eyebrow"><bdi dir="ltr">W05 · HUMAN-IN-THE-LOOP AI BRIDGE</bdi></span>
        <h1>${esc(L({ar:'جسر الذكاء الاصطناعي',en:'Manual AI Bridge'},ctx.locale))}<span class="ma-alt">${esc(L({ar:'جسر الذكاء الاصطناعي',en:'Manual AI Bridge'},alt(ctx.locale)))}</span></h1>
        <p class="ma-lead">${esc(ctx.locale==='ar'
          ?'تبادل يدوي محوّم مع الذكاء الاصطناعي: تُجهَّز الحزمة من مصدر مُصرَّح، تُنفَّذ خارج CEP، ثم تُستورد وتُدقَّق تساوي مصدرها قبل أي قرار بشري.'
          :'A governed manual exchange with external AI: prepare a packet from a declared source, run it outside CEP, then import it and prove provenance equality before any human decision.')}</p>
      </div>
      <ul class="ma-head-facts">
        <li data-tone="info" dir="ltr">MANUAL_ONLY_PROVIDER_NEUTRAL</li>
        <li data-tone="ok" dir="ltr">hiddenProviderCalls = 0</li>
        <li data-tone="ok" dir="ltr">automaticCanonicalPublication = false</li>
        <li data-tone="warn" dir="ltr">importRequiresDeclaredExport = true</li>
      </ul>
    </header>
    ${renderIdentity(ctx)}
    ${renderPayload(ctx)}
    ${renderExchange(ctx)}
    <div class="ma-duo">${renderIntake(ctx)}${renderGate(ctx)}</div>
    <p class="ma-foot"><b>${esc(ctx.locale==='ar'?'أساس السجل':'Record basis')}</b> · ${esc(RECORD_BASIS)}</p>
  </div>`;
}

export function manualAiWorkbenchContext({adapter,locale=localeNow()             }                                )                 {
  const rows                 =adapter&&typeof adapter.rows==='function'?adapter.rows():[];
  const selected=typeof adapter?.selected==='function'?adapter.selected():null;
  const row=selected||(rows[0]||null);
  let inspected    =null;
  try{inspected=row&&typeof adapter?.inspect==='function'?adapter.inspect(row.proposalId):null}catch{inspected=null}
  return {locale,row,rows,inspected,lastAction:adapter?.lastAction||null};
}
