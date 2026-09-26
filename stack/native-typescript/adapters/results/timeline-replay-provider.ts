import {defineTimelineReplayProvider} from '../../foundation/timeline/replay.js';

const clone=value=>value===undefined?undefined:structuredClone(value);
const text=(value,fallback)=>typeof value==='string'&&value.trim()?value.trim():fallback;
const scalar=value=>value===null||['string','number','boolean'].includes(typeof value)?String(value):JSON.stringify(value);

function eventId(event,index){
  return text(event?.eventId,text(event?.id,event?.seq!==undefined?`seq:${String(event.seq)}`:`recorded:${index+1}`));
}
function eventLabel(event,index){
  return text(event?.label,text(event?.title,text(event?.type,`Recorded event ${index+1}`)));
}
function timestampLabel(event,index){
  return text(event?.timestampLabel,text(event?.timestamp,text(event?.time,event?.at!==undefined?String(event.at):`Step ${index+1}`)));
}
function kindLabel(event){
  return text(event?.kindLabel,text(event?.kind,text(event?.type,'')));
function exactGapRange(event){
  const candidates=[
    [event?.gapStartSequence,event?.gapEndSequence],
    [event?.missingRange?.startSequence,event?.missingRange?.endSequence],
    [event?.gapRange?.startSequence,event?.gapRange?.endSequence],
    [event?.gapRange?.start,event?.gapRange?.end],
    [event?.seq,event?.seq]
  ];
  for(const [start,end] of candidates){
    const first=Number(start),last=Number(end);
    if(Number.isInteger(first)&&Number.isInteger(last)&&first>=0&&last>=first)return Object.freeze({startSequence:first,endSequence:last});
  }
  return null;
}
}
function detailRows(event){
  if(Array.isArray(event?.detailRows))return clone(event.detailRows);
  if(!event||typeof event!=='object'||Array.isArray(event))return [];
  const omitted=new Set(['eventId','id','seq','label','title','summary','timestampLabel','timestamp','time','at','kindLabel','kind','type','detailRows']);
  return Object.entries(event).filter(([key,value])=>!omitted.has(key)&&value!==undefined).slice(0,16).map(([key,value])=>({label:key,value:scalar(value)}));
}
function normalizeEvent(event,index){
  const raw=event&&typeof event==='object'&&!Array.isArray(event)?event:{value:event};
  const range=gap?exactGapRange(raw):null;
  const gap=raw.gap===true||String(raw.type||'').toUpperCase()==='GAP';
  return {
    eventId:eventId(raw,index),
    label:gap?text(raw.label,'Recorded gap'):eventLabel(raw,index),
    summary:text(raw.summary,gap?'The recorded stream declares a gap. No event is reconstructed or synthesized.':''),
    timestampLabel:timestampLabel(raw,index),
    kindLabel:gap?'GAP':kindLabel(raw),
    detailRows:detailRows(raw),
    presentationMeta:{recordedGap:gap,gapRange:range,sourceIndex:index,sourceEvent:clone(raw)}
  };
}

export function createResultsTimelineProvider(record,{providerId='results.sealed-result.timeline'}={}){
  if(!record||typeof record!=='object'||Array.isArray(record))throw Error('RESULT_REPLAY_RECORD_REQUIRED');
  if(record.sealed!==true)throw Error('RESULT_REPLAY_REQUIRES_SEALED_RESULT');
  if(typeof record.resultId!=='string'||!record.resultId.trim())throw Error('RESULT_ID_REQUIRED');
  if(typeof record.revisionId!=='string'||!record.revisionId.trim())throw Error('RESULT_REVISION_ID_REQUIRED');
  if(typeof record.manifestDigest!=='string'||!record.manifestDigest.trim())throw Error('RESULT_MANIFEST_DIGEST_REQUIRED');
  if(record.recordedEvents!==undefined&&!Array.isArray(record.recordedEvents))throw Error('RESULT_RECORDED_EVENTS_ARRAY_REQUIRED');
  const events=(record.recordedEvents||[]).map(normalizeEvent);
  const streamId=`${record.resultId}@${record.revisionId}`;
  return defineTimelineReplayProvider({
    providerId,
    domainKind:'results',
    truthClass:'DOMAIN_OWNED',
    canonicalHistory:true,
    readTimeline:()=>({
      status:events.length?'READY':'EMPTY',
      truthClass:'DOMAIN_OWNED',
      streamId,
      revision:record.revisionId,
      label:`Recorded Result · ${record.resultId}`,
      stateMessage:events.length?'':'The sealed Result contains no recorded timeline events.',
      events:clone(events)
    })
  });
}
