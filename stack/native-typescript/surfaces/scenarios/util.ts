/**
 * W03-SCENARIOS · local presentation primitives.
 *
 * Shared mechanics (SVG sprite icons, design tokens) are reused; every grouping, hierarchy and
 * colour mapping below is composed for scenario authoring and is not inherited from any other
 * surface. Colour carries meaning consistently: one hue per element kind, stable across the
 * timeline, the board, the flow chain and the topology graph.
 */
import type {ScenarioLocale} from './i18n.js';

export const esc=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] as string));

export const icon=(name:string,cls='icon sm')=>`<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;

export type ScenarioElementKind='event'|'inject'|'decision'|'lab'|'task'|'rule'|'observability'|'completion';

export const KIND:{
  [K in ScenarioElementKind]:{color:string;icon:string;label:(t:Record<string,string>)=>string}
}={
  event:{color:'var(--accent)',icon:'history',label:t=>t.kindEvent},
  inject:{color:'var(--violet)',icon:'edit',label:t=>t.kindInject},
  decision:{color:'var(--warn)',icon:'move',label:t=>t.kindDecision},
  lab:{color:'var(--ok)',icon:'lab',label:t=>t.kindLab},
  task:{color:'var(--accent2)',icon:'list',label:t=>t.kindTask},
  rule:{color:'var(--text2)',icon:'shield',label:t=>t.kindRule},
  observability:{color:'var(--accent2)',icon:'focus',label:t=>t.kindObservability},
  completion:{color:'var(--ok)',icon:'check',label:t=>t.kindCompletion}
};

export const kindColor=(kind:string)=>(KIND[kind as ScenarioElementKind]?.color)||'var(--accent)';
export const kindIcon=(kind:string)=>(KIND[kind as ScenarioElementKind]?.icon)||'info';
export const kindLabel=(kind:string,t:Record<string,string>)=>{
  const entry=KIND[kind as ScenarioElementKind];
  if(!entry)return kind;
  return entry.label(t);
};

/** One-line type description shown under the element type in the inspector. */
export const kindDescription=(kind:string,locale:ScenarioLocale)=>{
  const table={
    en:{event:'Observed scenario occurrence',inject:'Participant stimulus',decision:'Branch gate evaluated on a condition',lab:'Pinned lab module reference',task:'Operator action with an expected signal',rule:'Rule enforced while the scenario runs',observability:'Signal captured while the scenario runs',completion:'Criterion that completes the scenario'},
    ar:{event:'حدث مشهد مُرصَد',inject:'محفّز للمشاركين',decision:'بوابة فرع تُقيَّم بشرط',lab:'مرجع وحدة مختبر مثبَّت',task:'إجراء مشغَّل بإشارة متوقعة',rule:'قاعدة تُطبَّق أثناء تشغيل السيناريو',observability:'إشارة تُلتقط أثناء تشغيل السيناريو',completion:'معيار يُكمل السيناريو'}
  }[locale==='ar'?'ar':'en'] as Record<string,string>;
  return table[kind]||table.event;
};

/** Phase numbers stay LTR technical tokens in both directions (BIDI isolation). */
export const phaseNumber=(phase:{name?:string;id?:string},index:number)=>{
  const m=/^0*(\d+)/.exec(String(phase?.name||'').trim());
  return m?m[1].padStart(2,'0'):String(index+1).padStart(2,'0');
};

export const nextId=(prefix:string,items:Array<{id:string}>)=>{
  const ids=new Set(items.map(x=>x.id));
  let n=1;while(ids.has(`${prefix}-${n}`))n++;
  return `${prefix}-${n}`;
};

/** Prefer the most specific authored line for the compact card subtitle. */
export const nodeSubtitle=(item:any)=>{
  if(!item)return '';
  for(const key of ['detail','trigger','condition','branchImpact','payloadType','channel','delivery','participant','recipient']){
    const value=item[key];
    if(value&&typeof value==='string'&&value.trim())return value;
  }
  if(item.labRef&&item.labRef.id)return `${item.labRef.id}@${item.labRef.revision}`;
  return '';
};

export const stateBlock=(title:string,hint:string)=>`<div class="w03-empty" data-state="empty"><strong>${esc(title)}</strong><span>${esc(hint)}</span></div>`;

/** Arabic and English both get correct singular/plural counts (no "1 elements"). */
export const countText=(n:number,unit:'element'|'phase',locale:string)=>{
  if(locale==='ar'){
    if(unit==='element')return n===1?'عنصر واحد':n===2?'عنصران':n>=3&&n<=10?`${n} عناصر`:`${n} عنصر`;
    return n===1?'مرحلة واحدة':n===2?'مرحلتان':n>=3&&n<=10?`${n} مراحل`:`${n} مرحلة`;
  }
  return `${n} ${unit==='element'?(n===1?'element':'elements'):(n===1?'phase':'phases')}`;
};

export const KIND_ORDER:ScenarioElementKind[]=['event','inject','decision','lab','task','rule','observability','completion'];
