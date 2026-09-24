const clone=value=>value===undefined?undefined:structuredClone(value);
const deepFreeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))deepFreeze(child);Object.freeze(value);}return value;};
const text=(value,code)=>{if(typeof value!=='string'||!value.trim())throw Error(code);return value.trim();};
const statusValue=value=>{const normalized=String(value||'').toUpperCase();if(!TIMELINE_REPLAY_STATES.includes(normalized))throw Error(`TIMELINE_REPLAY_STATUS_INVALID:${normalized||'EMPTY'}`);return normalized;};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export const TIMELINE_REPLAY_OWNER=Object.freeze({
  id:'TimelineReplayOwner',
  token:'TimelineReplay',
  version:'1.0.0',
  scope:'PRESENTATION_AND_GENERIC_INTERACTION_ONLY',
  historyIdentity:'DOMAIN_OWNED',
  eventMeaning:'DOMAIN_OWNED',
  replayTruth:'DOMAIN_OWNED',
  canonicalHistoryClaim:false,
  replayExecution:false,
  persistence:false,
  providerFabrication:false,
  realConsumerClaim:false
});

export const TIMELINE_REPLAY_PROVIDER_CONTRACT=Object.freeze({
  id:'TimelineReplayProviderContract',
  version:'1.0.0',
  compatibility:'SEMVER',
  required:['descriptor','readTimeline'],
  truthRule:'PROVIDER_SUPPLIES_DOMAIN_TRUTH__PRESENTATION_OWNER_NEVER_UPGRADES_IT'
});

export const TIMELINE_REPLAY_STATES=Object.freeze(['READY','EMPTY','LOADING','ERROR','UNAVAILABLE']);
export const TIMELINE_REPLAY_TRUTH_CLASSES=Object.freeze(['DOMAIN_OWNED','FIXTURE_ONLY']);

function normalizeDetailRows(rows){
  if(rows===undefined||rows===null)return Object.freeze([]);
  if(!Array.isArray(rows))throw Error('TIMELINE_REPLAY_DETAIL_ROWS_ARRAY_REQUIRED');
  return deepFreeze(rows.map((row,index)=>{
    if(!row||typeof row!=='object'||Array.isArray(row))throw Error(`TIMELINE_REPLAY_DETAIL_ROW_INVALID:${index}`);
    return {label:text(row.label,`TIMELINE_REPLAY_DETAIL_LABEL_REQUIRED:${index}`),value:String(row.value??'')};
  }));
}

function normalizeEvent(event,index){
  if(!event||typeof event!=='object'||Array.isArray(event))throw Error(`TIMELINE_REPLAY_EVENT_INVALID:${index}`);
  const eventId=text(event.eventId,`TIMELINE_REPLAY_EVENT_ID_REQUIRED:${index}`);
  return deepFreeze({
    eventId,
    label:text(event.label,`TIMELINE_REPLAY_EVENT_LABEL_REQUIRED:${eventId}`),
    summary:typeof event.summary==='string'?event.summary:'',
    timestampLabel:typeof event.timestampLabel==='string'?event.timestampLabel:'',
    kindLabel:typeof event.kindLabel==='string'?event.kindLabel:'',
    detailRows:normalizeDetailRows(event.detailRows),
    presentationMeta:event.presentationMeta&&typeof event.presentationMeta==='object'&&!Array.isArray(event.presentationMeta)?clone(event.presentationMeta):{}
  });
}

function normalizeSnapshot(snapshot,descriptor){
  if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot))throw Error('TIMELINE_REPLAY_SNAPSHOT_REQUIRED');
  const status=statusValue(snapshot.status);
  const truthClass=String(snapshot.truthClass||descriptor.truthClass||'').toUpperCase();
  if(!TIMELINE_REPLAY_TRUTH_CLASSES.includes(truthClass))throw Error(`TIMELINE_REPLAY_TRUTH_CLASS_INVALID:${truthClass||'EMPTY'}`);
  const events=status==='READY'?(Array.isArray(snapshot.events)?snapshot.events.map(normalizeEvent):(()=>{throw Error('TIMELINE_REPLAY_READY_EVENTS_REQUIRED')})()):[];
  const ids=new Set();for(const event of events){if(ids.has(event.eventId))throw Error(`TIMELINE_REPLAY_EVENT_ID_DUPLICATE:${event.eventId}`);ids.add(event.eventId);}
  if(status==='EMPTY'&&Array.isArray(snapshot.events)&&snapshot.events.length)throw Error('TIMELINE_REPLAY_EMPTY_STATE_CANNOT_CONTAIN_EVENTS');
  if(status!=='READY'&&status!=='EMPTY'&&Array.isArray(snapshot.events)&&snapshot.events.length)throw Error(`TIMELINE_REPLAY_${status}_STATE_CANNOT_CONTAIN_EVENTS`);
  return deepFreeze({
    status,
    truthClass,
    streamId:typeof snapshot.streamId==='string'?snapshot.streamId:'',
    revision:typeof snapshot.revision==='string'?snapshot.revision:'',
    label:typeof snapshot.label==='string'?snapshot.label:'Timeline / Replay',
    stateMessage:typeof snapshot.stateMessage==='string'?snapshot.stateMessage:'',
    events,
    providerId:descriptor.providerId,
    domainKind:descriptor.domainKind,
    providerCanonicalClaim:descriptor.canonicalHistory===true,
    ownerCanonicalClaim:false
  });
}

export function validateTimelineReplayProvider(provider){
  if(!provider||typeof provider!=='object'||Array.isArray(provider))throw Error('TIMELINE_REPLAY_PROVIDER_REQUIRED');
  if(typeof provider.descriptor!=='function'||typeof provider.readTimeline!=='function')throw Error('TIMELINE_REPLAY_PROVIDER_CONTRACT_INVALID');
  const descriptor=provider.descriptor();
  if(!descriptor||typeof descriptor!=='object'||Array.isArray(descriptor))throw Error('TIMELINE_REPLAY_PROVIDER_DESCRIPTOR_REQUIRED');
  const normalized={
    providerId:text(descriptor.providerId,'TIMELINE_REPLAY_PROVIDER_ID_REQUIRED'),
    domainKind:text(descriptor.domainKind,'TIMELINE_REPLAY_PROVIDER_DOMAIN_KIND_REQUIRED'),
    truthClass:String(descriptor.truthClass||'').toUpperCase(),
    canonicalHistory:descriptor.canonicalHistory===true
  };
  if(!TIMELINE_REPLAY_TRUTH_CLASSES.includes(normalized.truthClass))throw Error(`TIMELINE_REPLAY_PROVIDER_TRUTH_CLASS_INVALID:${normalized.truthClass||'EMPTY'}`);
  return deepFreeze(normalized);
}

/**
 * Thin provider helper. It intentionally does not infer event semantics, timestamps,
 * history identity, replay truth, persistence, or provider authority.
 */
export function defineTimelineReplayProvider({providerId,domainKind,truthClass='DOMAIN_OWNED',canonicalHistory=false,readTimeline}){
  const descriptor=deepFreeze({providerId:text(providerId,'TIMELINE_REPLAY_PROVIDER_ID_REQUIRED'),domainKind:text(domainKind,'TIMELINE_REPLAY_PROVIDER_DOMAIN_KIND_REQUIRED'),truthClass:String(truthClass).toUpperCase(),canonicalHistory:canonicalHistory===true});
  if(!TIMELINE_REPLAY_TRUTH_CLASSES.includes(descriptor.truthClass))throw Error(`TIMELINE_REPLAY_PROVIDER_TRUTH_CLASS_INVALID:${descriptor.truthClass}`);
  if(typeof readTimeline!=='function')throw Error('TIMELINE_REPLAY_PROVIDER_READ_REQUIRED');
  return deepFreeze({descriptor:()=>descriptor,readTimeline});
}

function interactionReceipt(action,state,extra={}){
  return deepFreeze({
    owner:TIMELINE_REPLAY_OWNER.id,
    ownerToken:TIMELINE_REPLAY_OWNER.token,
    action,
    accepted:extra.accepted!==false,
    selectedEventId:state.selectedEventId,
    focusedEventId:state.focusedEventId,
    cursorIndex:state.cursorIndex,
    detailOpen:state.detailOpen,
    ...clone(extra)
  });
}

export class TimelineReplayOwner{
  constructor(provider=null){
    this.owner=TIMELINE_REPLAY_OWNER.id;
    this.ownerToken=TIMELINE_REPLAY_OWNER.token;
    this.provider=null;
    this.descriptor=null;
    this.snapshot=deepFreeze({status:'UNAVAILABLE',truthClass:'DOMAIN_OWNED',streamId:'',revision:'',label:'Timeline / Replay',stateMessage:'No timeline provider attached.',events:[],providerId:'',domainKind:'',providerCanonicalClaim:false,ownerCanonicalClaim:false});
    this.state={cursorIndex:-1,selectedEventId:null,focusedEventId:null,detailOpen:false,lastAction:'INIT'};
    if(provider)this.attachProvider(provider);
  }
  attachProvider(provider){
    this.descriptor=validateTimelineReplayProvider(provider);this.provider=provider;return this.refresh();
  }
  detachProvider(){
    this.provider=null;this.descriptor=null;
    this.snapshot=deepFreeze({status:'UNAVAILABLE',truthClass:'DOMAIN_OWNED',streamId:'',revision:'',label:'Timeline / Replay',stateMessage:'No timeline provider attached.',events:[],providerId:'',domainKind:'',providerCanonicalClaim:false,ownerCanonicalClaim:false});
    this.state={cursorIndex:-1,selectedEventId:null,focusedEventId:null,detailOpen:false,lastAction:'DETACH'};
    return this.project();
  }
  refresh(){
    if(!this.provider||!this.descriptor)return this.detachProvider();
    const next=normalizeSnapshot(this.provider.readTimeline(),this.descriptor);
    const previousSelected=this.state.selectedEventId,previousFocused=this.state.focusedEventId;
    this.snapshot=next;
    if(next.status!=='READY'||!next.events.length){
      this.state={cursorIndex:-1,selectedEventId:null,focusedEventId:null,detailOpen:false,lastAction:'REFRESH'};
      return this.project();
    }
    let index=next.events.findIndex(event=>event.eventId===previousSelected);
    if(index<0)index=0;
    const selectedEventId=next.events[index].eventId;
    const focusedEventId=next.events.some(event=>event.eventId===previousFocused)?previousFocused:selectedEventId;
    this.state={cursorIndex:index,selectedEventId,focusedEventId,detailOpen:this.state.detailOpen&&selectedEventId===previousSelected,lastAction:'REFRESH'};
    return this.project();
  }
  _ready(action){
    if(this.snapshot.status!=='READY'||!this.snapshot.events.length)return interactionReceipt(action,this.state,{accepted:false,code:'TIMELINE_NOT_READY'});
    return null;
  }
  _selectIndex(index,{focus=true,openDetail=false,action='SELECT'}={}){
    const blocked=this._ready(action);if(blocked)return blocked;
    const bounded=clamp(Number.isFinite(index)?Math.trunc(index):0,0,this.snapshot.events.length-1),event=this.snapshot.events[bounded];
    this.state.cursorIndex=bounded;this.state.selectedEventId=event.eventId;if(focus)this.state.focusedEventId=event.eventId;this.state.detailOpen=!!openDetail;this.state.lastAction=action;
    return interactionReceipt(action,this.state,{eventId:event.eventId,index:bounded,total:this.snapshot.events.length});
  }
  selectEvent(eventId,{focus=true,openDetail=false}={}){
    const blocked=this._ready('SELECT_EVENT');if(blocked)return blocked;
    const index=this.snapshot.events.findIndex(event=>event.eventId===eventId);if(index<0)return interactionReceipt('SELECT_EVENT',this.state,{accepted:false,code:'TIMELINE_EVENT_UNKNOWN',eventId:String(eventId??'')});
    return this._selectIndex(index,{focus,openDetail,action:'SELECT_EVENT'});
  }
  step(delta){
    const blocked=this._ready('STEP');if(blocked)return blocked;
    const step=Number(delta);if(!Number.isFinite(step)||step===0)return interactionReceipt('STEP',this.state,{accepted:false,code:'TIMELINE_STEP_INVALID'});
    const current=this.state.cursorIndex<0?0:this.state.cursorIndex;
    return this._selectIndex(current+(step>0?1:-1),{focus:true,openDetail:false,action:step>0?'STEP_NEXT':'STEP_PREVIOUS'});
  }
  scrubToFraction(fraction){
    const blocked=this._ready('SCRUB');if(blocked)return blocked;
    const value=Number(fraction);if(!Number.isFinite(value))return interactionReceipt('SCRUB',this.state,{accepted:false,code:'TIMELINE_SCRUB_INVALID'});
    const normalized=clamp(value,0,1),index=Math.round(normalized*(this.snapshot.events.length-1));
    return this._selectIndex(index,{focus:true,openDetail:false,action:'SCRUB'});
  }
  focusEvent(eventId){
    const blocked=this._ready('FOCUS_EVENT');if(blocked)return blocked;
    if(!this.snapshot.events.some(event=>event.eventId===eventId))return interactionReceipt('FOCUS_EVENT',this.state,{accepted:false,code:'TIMELINE_EVENT_UNKNOWN',eventId:String(eventId??'')});
    this.state.focusedEventId=eventId;this.state.lastAction='FOCUS_EVENT';return interactionReceipt('FOCUS_EVENT',this.state,{eventId});
  }
  openDetail(eventId=this.state.selectedEventId){
    const selected=this.selectEvent(eventId,{focus:true,openDetail:true});if(selected.accepted===false)return selected;
    this.state.detailOpen=true;this.state.lastAction='OPEN_DETAIL';return interactionReceipt('OPEN_DETAIL',this.state,{eventId:this.state.selectedEventId});
  }
  closeDetail(){
    const wasOpen=this.state.detailOpen;this.state.detailOpen=false;this.state.lastAction='CLOSE_DETAIL';return interactionReceipt('CLOSE_DETAIL',this.state,{accepted:wasOpen,code:wasOpen?'CLOSED':'DETAIL_ALREADY_CLOSED'});
  }
  handleKey(key,{eventId=this.state.focusedEventId}={}){
    const normalized=String(key||'');
    if(['ArrowRight','ArrowDown'].includes(normalized))return this.step(1);
    if(['ArrowLeft','ArrowUp'].includes(normalized))return this.step(-1);
    if(normalized==='Home')return this._selectIndex(0,{focus:true,openDetail:false,action:'KEY_HOME'});
    if(normalized==='End')return this._selectIndex(this.snapshot.events.length-1,{focus:true,openDetail:false,action:'KEY_END'});
    if(normalized==='Enter'||normalized===' ')return this.openDetail(eventId);
    if(normalized==='Escape')return this.closeDetail();
    return interactionReceipt('KEY',this.state,{accepted:false,code:'TIMELINE_KEY_NOT_HANDLED',key:normalized});
  }
  project(){
    const events=this.snapshot.events,total=events.length,index=this.state.cursorIndex>=0?this.state.cursorIndex:-1,selected=index>=0?events[index]||null:null;
    const progress=total<=1?(total===1?1:0):index/(total-1);
    return deepFreeze({
      owner:this.owner,ownerToken:this.ownerToken,contract:TIMELINE_REPLAY_OWNER,
      provider:{providerId:this.snapshot.providerId,domainKind:this.snapshot.domainKind,truthClass:this.snapshot.truthClass,providerCanonicalClaim:this.snapshot.providerCanonicalClaim,ownerCanonicalClaim:false},
      timeline:{status:this.snapshot.status,streamId:this.snapshot.streamId,revision:this.snapshot.revision,label:this.snapshot.label,stateMessage:this.snapshot.stateMessage,total,index,progress,orderedEventIds:events.map(event=>event.eventId)},
      selection:{selectedEventId:this.state.selectedEventId,focusedEventId:this.state.focusedEventId,detailOpen:this.state.detailOpen,selectedEvent:clone(selected)},
      events:clone(events),
      presentationTruth:Object.freeze({historicalIdentity:'DOMAIN_OWNED',eventMeaning:'DOMAIN_OWNED',replayTruth:'DOMAIN_OWNED',canonicalHistoryClaim:false,simulatedTruthPromotion:false})
    });
  }
}
