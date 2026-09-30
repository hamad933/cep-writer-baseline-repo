/**
 * W03-SCENARIOS · the four workbench projections of one scenario definition.
 *
 * The center is the surface's real work area: a time-ordered authoring surface, not a card
 * dashboard. Four projections exist because scenario authoring has four genuine questions:
 *   timeline  — what happens when (default work surface, reference-shaped)
 *   flow      — how the phases chain into one continuous sequence
 *   topology  — how elements relate once author links are added (shared spatial kernel)
 *   canvas     — a per-phase authoring board with the full authored field set
 * Every projection reads the SAME domain projection; none invents content.
 */
import {countText,esc,icon,kindColor,kindIcon,kindLabel,nodeSubtitle,phaseNumber,stateBlock} from './util.js';

export interface ScenarioViewContext{
  t:Record<string,string>;
  projection:any;
  selectedId:string|null;
  selectedPhaseId:string|null;
  relations:Array<{id:string;source:string;target:string;type:string}>;
  locale:string;
}

const nodeButton=(item:any,ctx:ScenarioViewContext)=>{
  const kind=String(item.kind||'event');
  const subtitle=nodeSubtitle(item);
  const pressed=ctx.selectedId===item.id;
  return `<button type="button" class="w03-node" data-node="${esc(item.id)}" data-kind="${esc(kind)}" aria-pressed="${pressed}" style="--kn:${kindColor(kind)}">
    <span class="ic">${icon(kindIcon(kind))}</span>
    <span><span class="tt">${esc(item.title||item.id)}</span>${subtitle?`<span class="sb">${esc(subtitle)}</span>`:''}</span>
  </button>`;
};

const arrow=`<span class="w03-arrow" aria-hidden="true"></span>`;

const phaseTitle=(phase:any)=>String(phase?.name||phase?.id||'').replace(/^\d+\s*/,'');

/** Timeline · reference-shaped: numbered rail, horizontal element chain, add placeholder. */
export const renderTimeline=(ctx:ScenarioViewContext)=>{
  const {t,projection}=ctx;
  const phases=projection.phases||[];
  if(!phases.length)return stateBlock(t.empty,t.emptyHint);
  return `<div class="w03-lanes" role="list" aria-label="${esc(t.ariaLanes)}">${phases.map((phase:any,index:number)=>{
    const items=phase.elements||[];
    const selected=ctx.selectedPhaseId===phase.id;
    const chain=items.map((item:any,i:number)=>`${i?arrow:''}${nodeButton(item,ctx)}`).join('');
    return `<section class="w03-row" role="listitem" data-phase-row="${esc(phase.id)}" data-selected="${selected}">
      <div class="w03-rail">
        <button type="button" class="w03-num" data-phase="${esc(phase.id)}" aria-pressed="${selected}" title="${esc(t.phase)} ${esc(phaseNumber(phase,index))} · ${esc(phaseTitle(phase))}"><bdi dir="ltr">${esc(phaseNumber(phase,index))}</bdi></button>
        <span class="w03-conn" aria-hidden="true"></span>
      </div>
      <div class="w03-lane">
        <div class="w03-lane-head"><strong>${esc(phaseTitle(phase))}</strong></div>
        <div class="w03-chain">${chain}</div>
        <button type="button" class="w03-add" data-add-to="${esc(phase.id)}">${icon('plus')}${esc(t.addElement)}</button>
      </div>
    </section>`;
  }).join('')}</div>`;
};

/** Flow · one continuous cross-phase sequence with inline phase gates. */
export const renderFlow=(ctx:ScenarioViewContext)=>{
  const {t,projection,relations}=ctx;
  const phases=projection.phases||[];
  if(!phases.length)return stateBlock(t.empty,t.emptyHint);
  const ids=new Set<string>();
  phases.forEach((p:any)=>(p.elements||[]).forEach((e:any)=>ids.add(e.id)));
  return `<div class="w03-flow">${phases.map((phase:any,index:number)=>{
    const items=phase.elements||[];
    const inner=items.map((item:any,i:number)=>`${i?arrow:''}${nodeButton(item,ctx)}`).join('');
    const conditional=relations.filter(r=>ids.has(r.source)&&ids.has(r.target)&&items.some((e:any)=>e.id===r.source))
      .map(r=>`<span class="w03-cond"><i aria-hidden="true"></i><span>${esc(labelOf(projection,r.source))} → ${esc(labelOf(projection,r.target))} · ${esc(t.conditional)}</span></span>`).join('');
    return `<div class="w03-gate"><b><bdi dir="ltr">${esc(phaseNumber(phase,index))}</bdi></b><span>${esc(phaseTitle(phase))}</span><small>${esc(countText(items.length,'element',ctx.locale))}</small></div>
      <div class="w03-chain">${inner}${conditional}</div>`;
  }).join('')}</div>`;
};

/** Canvas · per-phase authoring board showing the full authored field set. */
export const renderCanvas=(ctx:ScenarioViewContext)=>{
  const {t,projection,locale}=ctx;
  const phases=projection.phases||[];
  if(!phases.length)return stateBlock(t.empty,t.emptyHint);
  const rowsOf=(item:any)=>{
    const rows:Array<[string,string]>=[];
    const push=(k:string,v:any)=>{if(v!==undefined&&v!==null&&String(v).trim()!=='')rows.push([k,String(v)])};
    push(t.type,kindLabel(String(item.kind||'event'),t));
    push(t.recipient,item.recipient||item.participant);
    push(t.trigger,item.trigger);
    push(t.source,item.source);
    push(t.delivery,item.delivery);
    push(t.payloadType,item.payloadType);
    push(t.channel,item.channel);
    push(t.condition,item.condition);
    if(item.labRef)push(t.type,`${item.labRef.id}@${item.labRef.revision}`);
    return rows.slice(0,5);
  };
  return `<div class="w03-columns">${phases.map((phase:any,index:number)=>{
    const items=phase.elements||[];
    return `<section class="w03-col" data-phase-col="${esc(phase.id)}">
      <header class="w03-col-head"><b><bdi dir="ltr">${esc(phaseNumber(phase,index))}</bdi></b><span>${esc(phaseTitle(phase))}</span><small>${esc(countText(items.length,'element',ctx.locale))}</small></header>
      <div class="w03-col-body">${items.length?items.map((item:any)=>{
        const kind=String(item.kind||'event'),rows=rowsOf(item);
        return `<button type="button" class="w03-card" data-node="${esc(item.id)}" data-kind="${esc(kind)}" aria-pressed="${ctx.selectedId===item.id}" style="--kn:${kindColor(kind)}">
          <span class="kk">${icon(kindIcon(kind))}${esc(kindLabel(kind,t))}</span>
          <span class="tt">${esc(item.title||item.id)}</span>
          <dl>${rows.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${locale==='ar'?esc(v):`<bdi dir="auto">${esc(v)}</bdi>`}</dd>`).join('')}</dl>
        </button>`;
      }).join(''):`<p class="w03-snote">${esc(t.emptyFacet)}</p>`}</div>
      <footer class="w03-col-foot"><button type="button" class="w03-add" data-add-to="${esc(phase.id)}">${icon('plus')}${esc(t.addElement)}</button></footer>
    </section>`;
  }).join('')}</div>`;
};

/** Topology graph inputs for the shared SpatialInteraction kernel (mechanics donor only). */
export const topologyGraph=(projection:any,relations:Array<any>)=>{
  const phases=projection.phases||[];
  const nodes:any[]=[],edges:any[]=[];
  phases.forEach((phase:any,pi:number)=>{
    const phaseNode=`phase:${phase.id}`;
    nodes.push({id:phaseNode,label:phaseTitle(phase),type:'phase',status:`${(phase.elements||[]).length}`,x:70+pi*262,y:46});
    (phase.elements||[]).forEach((item:any,ei:number)=>{
      nodes.push({id:item.id,label:item.title||item.id,type:String(item.kind||'event'),status:phaseTitle(phase),x:70+pi*262,y:172+ei*132});
      edges.push({id:`seq:${phase.id}:${item.id}`,source:phaseNode,target:item.id,type:'Sequence / Flow',direction:'directed',kind:'representation'});
    });
    if(pi){
      const prev=phases[pi-1],prevItems=prev.elements||[],curItems=phase.elements||[];
      const last=prevItems[prevItems.length-1],first=curItems[0];
      if(last&&first)edges.push({id:`bridge:${prev.id}:${phase.id}`,source:last.id,target:first.id,type:'Sequence / Flow',direction:'directed',kind:'representation'});
    }
  });
  const known=new Set(nodes.map(n=>n.id));
  relations.filter(r=>known.has(r.source)&&known.has(r.target)).forEach(r=>edges.push({id:r.id,source:r.source,target:r.target,type:r.type||'Authored link',direction:'directed',kind:'representation'}));
  return {nodes,edges};
};

export const labelOf=(projection:any,id:string)=>{
  for(const phase of projection.phases||[])for(const item of phase.elements||[])if(item.id===id)return item.title||item.id;
  return id;
};

export const renderBoardBody=(view:string,ctx:ScenarioViewContext)=>{
  const label=esc((ctx.t as any)[view]||ctx.t.ariaBoard);
  const body=view==='flow'?renderFlow(ctx)
    :view==='canvas'?renderCanvas(ctx)
    :view==='topology'?`<div class="w03-topo" data-topology aria-label="${esc(ctx.t.ariaBoard)}"></div>`
    :renderTimeline(ctx);
  /* tab + panel wiring: every view is a labelled, focusable tabpanel (keyboard-reachable) */
  return `<div class="w03-viewpanel" role="tabpanel" tabindex="0" aria-label="${label}">${body}</div>`;
};
