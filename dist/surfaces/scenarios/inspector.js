/**
 * W03-SCENARIOS · RIGHT inspector pane.
 *
 * The reference shows a sectioned inspector for the selected scenario element — Type,
 * Recipient, Trigger, Delivery, Payload type, Branch impact — each section a teal label with a
 * primary value and a muted secondary line. This module reproduces that information hierarchy
 * for whatever is selected (element / phase / scenario facet), and always closes with the two
 * scenario truths an author needs at hand: validation state and environment binding state.
 *
 * Nothing here is inferred: every value is read from the domain projection, the validation
 * receipt or the declared binding. Unknown fields are omitted rather than invented.
 */
import {countText,esc,icon,kindColor,kindDescription,kindIcon,kindLabel,phaseNumber} from './util.js';

                                  
                          
                 
                
               
                        
                 
                          
              
                
                                                                  
                                                               
                              
 

const field=(glyph       ,valueHtml       ,subHtml='')=>`<div class="w03-ifield"><span class="ic">${icon(glyph)}</span><span><span class="v">${valueHtml}</span>${subHtml?`<span class="s">${subHtml}</span>`:''}</span></div>`;
const kv=(label       ,valueHtml       )=>`<div class="w03-ikv"><span>${esc(label)}</span><b>${valueHtml}</b></div>`;
const section=(title       ,body       )=>`<section class="w03-isec"><h4>${title}</h4>${body}</section>`;
const chips=(values         )=>`<div class="w03-ichips">${values.map(v=>`<span class="w03-pill"><bdi dir="ltr">${esc(v)}</bdi></span>`).join('')}</div>`;

const phaseOf=(projection    ,elementId       )=>{
  const phases=projection.phases||[];
  for(let i=0;i<phases.length;i++){
    const items=phases[i].elements||[];
    const index=items.findIndex((x    )=>x.id===elementId);
    if(index>=0)return {phase:phases[i],phaseIndex:i,index};
  }
  return null;
};

const validationSection=(ctx                 )=>{
  const {t,validation,validationStatus}=ctx;
  const results=validation?.requirements||[];
  const passed=results.filter((r    )=>r.status==='PASS').length;
  const blocked=results.filter((r    )=>r.status!=='PASS');
  const state=validation?.ok?`<span style="color:var(--ok)">${esc(t.passed)}</span>`:`<span style="color:var(--bad)">${esc(t.blocked)}</span>`;
  const recorded=String(validationStatus||'UNVALIDATED');
  const recordedTone=recorded==='VALIDATED'?'var(--ok)':recorded==='VALIDATION_FAILED'?'var(--bad)':'var(--text2)';
  return section(`${icon('shield')}${esc(t.validation)}`,
    kv(t.state,`<bdi dir="ltr" style="color:${recordedTone}">${esc(recorded)}</bdi>`)+
    kv(t.requirements,`<bdi dir="ltr">${passed}/${results.length}</bdi> ${state}`)+
    results.slice(0,blocked.length?3:4).map((r    )=>kv(String(r.id||r.code||''),`<span style="color:${r.status==='PASS'?'var(--ok)':'var(--bad)'}"><bdi dir="ltr">${esc(String(r.status))}</bdi></span>`)).join('')+
    (blocked.length?blocked.slice(0,2).map((r    )=>field('warn',`<span style="color:var(--bad)">${esc(String(r.code||r.id))}</span>`,esc(String(r.reason||'')))).join(''):''));
};

const environmentSection=(ctx                 )=>{
  const {t,projection,binding}=ctx;
  const required=projection.environment?.capabilities||[];
  return section(`${icon('lab')}${esc(t.environment)}`,
    `${required.length?kv(t.requiredCaps,chips(required)):kv(t.requiredCaps,esc(t.emptyFacet))}`+
    field('shield',`<bdi dir="ltr">${esc(binding?.provider||'UNBOUND')}</bdi>`,esc(t.fixtureBinding))+
    kv(t.binding,`<bdi dir="ltr">${esc(ctx.validation?.bindingStatus||'UNBOUND')}</bdi>`));
};

const recordList=(items      ,emptyText       ,t                      ,showKind=false)=>{
  if(!items.length)return `<p class="w03-snote">${esc(emptyText)}</p>`;
  return `<ul class="w03-ilist">${items.map((item    )=>{
    const label=typeof item==='string'?item:String(item.name||item.title||item.label||item.id||'');
    const meta=typeof item==='string'?'':[item.id?`<bdi dir="ltr">${esc(item.id)}</bdi>`:'',item.duty||item.channel||item.relation||item.revision?`<bdi dir="auto">${esc(item.duty||item.channel||item.relation||item.revision)}</bdi>`:''].filter(Boolean).join(' · ');
    const kind=showKind&&item?.kind?`<span>${esc(kindLabel(String(item.kind),t))}</span>`:'';
    return `<li><strong>${esc(label)}</strong>${meta?`<span>${meta}</span>`:''}${kind}</li>`;
  }).join('')}</ul>`;
};

export const renderInspector=(ctx                 )=>{
  const {t,projection,selection,facet,validation,binding,locale}=ctx;
  const phases=projection.phases||[];
  const sections         =[];

  const facetRecord=()=>{
    const [facetKey,rawId]=String(ctx.facetItem||'').split(':');
    const pool    =(projection.facets||{})[facetKey]||[];
    const record=pool.find((x    )=>typeof x==='object'&&String(x.id)===rawId)||null;
    if(!record)return `<p class="w03-snote">${esc(t.emptyFacet)}</p>`;
    const rows=Object.entries(record).filter(([,v])=>typeof v==='string'||typeof v==='number'||typeof v==='boolean')
      .map(([k,v])=>kv(k,`<bdi dir="auto">${esc(String(v))}</bdi>`)).join('');
    const nested=Object.entries(record).filter(([,v])=>v&&typeof v==='object')
      .map(([k,v])=>field('ref',`<bdi dir="ltr">${esc(String((v       ).id||JSON.stringify(v)))}</bdi>`,esc(k))).join('');
    return field('ref',`<bdi dir="auto">${esc(String(record.name||record.title||record.id||''))}</bdi>`,esc(t.position))+rows+nested;
  };

  const facetBody=()=>{
    if(ctx.facetItem)return facetRecord();
    switch(facet){
      case 'overview':
        return section(`${icon('info')}${esc(t.identity)}`,
          kv(t.scenario,`<bdi dir="ltr">${esc(projection.identity?.id||projection.title)}</bdi>`)+
          kv(t.draftRevision,`<bdi dir="ltr">${esc(projection.identity?.revision||'1')}</bdi>`)+
          kv(t.lifecycleLabel,`<bdi dir="ltr">${esc(projection.lifecycle||'DRAFT')}</bdi>`))+
          section(`${icon('layout')}${esc(t.structureFacet)}`,
            kv(t.phases,esc(countText(phases.length,'phase',locale)))+
            kv(t.elements,esc(countText(phases.reduce((n       ,p    )=>n+(p.elements?.length||0),0),'element',locale))));
      case 'environment':
        return environmentSection(ctx);
      case 'roles':
        return section(`${icon('list')}${esc(t.roles)}`,recordList(projection.roles||[],t.emptyFacet,t));
      case 'phases':
        return section(`${icon('layout')}${esc(t.phases)}`,recordList(phases.map((p    ,i       )=>({id:p.id,title:`${String(i+1).padStart(2,'0')} ${String(p.name||p.id).replace(/^\d+\s*/,'')}`,duty:countText((p.elements||[]).length,'element',locale)})),t.emptyFacet,t));
      case 'references-knowledge':
        return section(`${icon('book')}${esc(t.knowledgeUnits)}`,recordList(ctx.knowledgeUnits,t.knowledgeEmpty,t));
      case 'references-labs':
        return section(`${icon('lab')}${esc(t.labLibrary)}`,recordList(ctx.labRefs.map(l=>({id:`${l.id}@${l.revision}`,title:l.id,duty:l.available?t.available:t.unavailable})),t.labEmpty,t));
      default:
        return section(icon('list'),recordList((projection.facets||{})[facet]||[],t.emptyFacet,t));
    }
  };

  if(facet==='selection'&&selection?.kind&&selection.kind!=='scenario'&&selection.kind!=='missing'&&selection.object){
    const object=selection.object;
    if(selection.kind==='phase'){
      const index=phases.findIndex((p    )=>p.id===selection.id);
      const items=object.elements||[];
      const gates=items.filter((x    )=>x.condition);
      sections.push(section(`${icon('layout')}${esc(t.phase)}`,
        field('list',`<bdi dir="auto">${esc(String(object.name||object.id).replace(/^\d+\s*/,''))}</bdi>`,
          `${esc(t.order)} <bdi dir="ltr">${index>=0?phaseNumber(object,index):'—'}</bdi> · <bdi dir="ltr">${esc(selection.id)}</bdi>`)));
      sections.push(section(`${icon('list')}${esc(t.contents)}`,recordList(items.map((x    )=>({...x,title:x.title||x.id})),t.emptyFacet,t,true)));
      sections.push(section(`${icon('move')}${esc(t.gates)}`,gates.length?recordList(gates,t.emptyFacet,t):`<p class="w03-snote">${esc(t.emptyFacet)}</p>`));
    }else{
      const kind=String(object.kind||'event');
      const located=phaseOf(projection,selection.id);
      sections.push(section(`${icon(kindIcon(kind))}${esc(t.type)}`,
        `<div class="w03-ifield"><span class="ic" style="color:${kindColor(kind)}">${icon(kindIcon(kind))}</span><span><span class="v">${esc(kindLabel(kind,t))}</span><span class="s">${esc(kindDescription(kind,ctx.locale       ))}</span></span></div>`));
      if(located)sections.push(section(`${icon('info')}${esc(t.position)}`,
        kv(t.phase,esc(String(located.phase.name||located.phase.id).replace(/^\d+\s*/,'')))+
        kv(t.order,`<bdi dir="ltr">${located.index+1} / ${located.phase.elements?.length||0}</bdi>`)+
        kv(t.scenario,`<bdi dir="ltr">${esc(selection.id)}</bdi>`)));
      const recipient=object.recipient||object.participant;
      if(recipient){
        const role=(projection.roles||[]).find((r    )=>String(r.name)===String(recipient));
        sections.push(section(`${icon('list')}${esc(t.recipient)}`,field('list',esc(String(recipient)),role?`${esc(t.role)}: <bdi dir="auto">${esc(role.duty||role.name)}</bdi>`:esc(t.type))));
      }
      if(object.trigger||object.source)sections.push(section(`${icon('focus')}${esc(t.trigger)}`,
        (object.trigger?field('focus',`<bdi dir="auto">${esc(object.trigger)}</bdi>`):'')+
        (object.source?field('ref',`<bdi dir="auto">${esc(object.source)}</bdi>`,esc(t.source)):'')));
      if(object.delivery||object.channel)sections.push(section(`${icon('move')}${esc(t.delivery)}`,
        (object.delivery?field('move',`<bdi dir="auto">${esc(object.delivery)}</bdi>`):'')+
        (object.channel?field('link',`<bdi dir="auto">${esc(object.channel)}</bdi>`,esc(t.channel)):'')));
      if(object.payloadType)sections.push(section(`${icon('note')}${esc(t.payloadType)}`,
        field('note',`<bdi dir="auto">${esc(object.payloadType)}</bdi>`,object.channel?esc(t.channel):esc(t.type))));
      if(object.labRef)sections.push(section(`${icon('lab')}${esc(t.labLibrary)}`,
        field('lab',`<bdi dir="ltr">${esc(object.labRef.id)}@${esc(object.labRef.revision)}</bdi>`,esc(t.requiredCaps))));
      if(object.branchImpact||object.condition)sections.push(section(`${icon('link')}${esc(t.branchImpact)}`,
        (object.branchImpact?field('link',`<bdi dir="auto">${esc(object.branchImpact)}</bdi>`):'')+
        (object.condition?field('move',`<bdi dir="auto">${esc(object.condition)}</bdi>`,esc(t.condition)):'')));
    }
    sections.push(validationSection(ctx));
    sections.push(environmentSection(ctx));
  }else{
    sections.push(facetBody());
    sections.push(validationSection(ctx));
    sections.push(environmentSection(ctx));
  }

  const title=selection?.kind==='element'||(selection&&selection.kind!=='scenario'&&selection.kind!=='phase'&&selection.kind!=='missing')
    ? String(selection.title||selection.id||'')
    : selection?.kind==='phase'?String(selection.title||''):String(projection.title||'');
  const path=[String(projection.identity?.id||''),selection?.phaseId||'',selection?.id&&selection.kind!=='scenario'?selection.id:''].filter(Boolean);

  return `<div class="w03-insp" aria-label="${esc(t.ariaInspector)}" data-scenario-inspector>
    <div class="w03-isub"><b><bdi dir="auto">${esc(title||t.inspector)}</bdi></b></div>
    ${path.length>1?`<div class="w03-isub">${path.map((p,i)=>`${i?`<span aria-hidden="true">›</span>`:''}<bdi dir="ltr">${esc(p)}</bdi>`).join('')}</div>`:''}
    ${sections.join('')}
  </div>`;
};
