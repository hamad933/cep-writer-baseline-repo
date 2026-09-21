import {AnalyticalCompareOwner} from '../../foundation/analytical/compare.js';
import {TimelineReplayOwner} from '../../foundation/timeline/replay.js';
import {createResultsCompareProvider} from '../analytical/results-compare-provider.js';
import {createResultsTimelineProvider} from './timeline-replay-provider.js';

const clone=value=>value==null?value:structuredClone(value);
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))freeze(child);Object.freeze(value)}return value};
const required=(value,code)=>{if(typeof value!=='string'||!value.trim())throw Error(code);return value.trim()};
const exactRef=record=>freeze({resultId:required(record?.resultId,'RESULT_ID_REQUIRED'),revisionId:required(record?.revisionId,'RESULT_REVISION_ID_REQUIRED'),manifestDigest:required(record?.manifestDigest,'RESULT_MANIFEST_DIGEST_REQUIRED')});
const keyOf=ref=>`${ref.resultId}@${ref.revisionId}`;
const hash=text=>{let h=0x811c9dc5;for(const ch of String(text)){h^=ch.codePointAt(0);h=Math.imul(h,0x01000193)>>>0}return h.toString(16).padStart(8,'0')};

function sealedRecord(input){
  const record=clone(input),ref=exactRef(record);
  if(record.sealed!==true)throw Error('RESULT_REVISION_NOT_SEALED');
  if(record.recordedEvents!==undefined&&!Array.isArray(record.recordedEvents))throw Error('RESULT_RECORDED_EVENTS_ARRAY_REQUIRED');
  return freeze({...record,...ref,recordedEvents:clone(record.recordedEvents||[])});
}
function sourceEventFrom(projected){return clone(projected?.selection?.selectedEvent?.presentationMeta?.sourceEvent??null)}
function gapSelected(projected){return projected?.selection?.selectedEvent?.presentationMeta?.recordedGap===true}

export class W03ResultsDomain {
  constructor({records=[],determinismVerifier=null,persistence=null,timelineReplayOwner=null,analyticalCompareOwner=null}={}){
    this.owner='W03ResultsDomain';
    this.records=freeze(records.map(sealedRecord));
    this.byId=new Map(this.records.map(record=>[keyOf(record),record]));
    this.aar=new Map();
    this.persistence=persistence;
    this.determinismVerifier=determinismVerifier;
    this.replayOwner=timelineReplayOwner||new TimelineReplayOwner();
    if(this.replayOwner?.owner!=='TimelineReplayOwner')throw Error('RESULTS_TIMELINE_REPLAY_OWNER_REQUIRED');
    this.replayRef=null;
    this.compareOwner=analyticalCompareOwner||new AnalyticalCompareOwner();
    if(this.compareOwner?.owner!=='AnalyticalCompareOwner')throw Error('RESULTS_ANALYTICAL_COMPARE_OWNER_REQUIRED');
    this.provider=createResultsCompareProvider(this.records);
    this.compareOwner.registerProvider(this.provider);
  }
  _record(ref){
    const exact=exactRef(ref),record=this.byId.get(keyOf(exact));
    if(!record)throw Error('RESULT_REVISION_ABSENT');
    if(record.manifestDigest!==exact.manifestDigest)throw Error('RESULT_MANIFEST_DIGEST_REVISION_CONTRADICTION');
    return record;
  }
  listResults(){return freeze(this.records.map(record=>({ref:exactRef(record),sealed:true,schemaVersion:record.schemaVersion||'',comparatorVersion:record.comparatorVersion||'',label:record.label||record.title||record.resultId,runId:record.runId||record.sourceRunInputRef?.runId||'',status:record.status||record.outcome||'SEALED',eventCount:record.recordedEvents.length,provenanceRefs:clone(record.provenanceRefs||[])})))}
  resultProjection(ref){const record=this._record(ref);return freeze({ref:exactRef(record),sealed:true,label:record.label||record.title||record.resultId,status:record.status||record.outcome||'SEALED',runId:record.runId||record.sourceRunInputRef?.runId||'',schemaVersion:record.schemaVersion||'',comparatorVersion:record.comparatorVersion||'',sourceRunInputRef:clone(record.sourceRunInputRef||null),provenanceRefs:clone(record.provenanceRefs||[]),limitations:clone(record.limitations||[]),historicalTerminalBytesInert:true})}
  hasReplaySelection(){return !!this.replayRef}
  replayResult(ref){
    const record=this._record(ref);
    this.replayRef=exactRef(record);
    this.replayOwner.attachProvider(createResultsTimelineProvider(record));
    return this.replayState();
  }
  step(delta=1){if(!this.replayRef)throw Error('RESULT_REPLAY_NOT_SELECTED');this.replayOwner.step(Number(delta||1));return this.replayState()}
  replayState(){
    const projected=this.replayOwner.project(),hasSelection=!!this.replayRef;
    const state=!hasSelection?'IDLE':projected.timeline.status==='EMPTY'?'GAP':gapSelected(projected)?'GAP':'PAUSED';
    return freeze({owner:this.owner,replayOwner:projected.owner,replayOwnerToken:projected.ownerToken,ref:clone(this.replayRef),key:this.replayRef?keyOf(this.replayRef):null,index:projected.timeline.index,state,event:sourceEventFrom(projected),selectedEventId:projected.selection.selectedEventId,timelineStatus:projected.timeline.status,total:projected.timeline.total,replayExecutesRuntime:false,historicalTerminalBytesInert:true,canonicalHistoryClaimByGenericOwner:false,providerCanonicalHistoryClaim:projected.provider.providerCanonicalClaim===true,presentationTruth:clone(projected.presentationTruth)})
  }
  compare({left,right}){const id=this.provider.descriptor().providerId,pair=this.compareOwner.createPair({left:{providerId:id,ref:left},right:{providerId:id,ref:right}});return this.compareOwner.comparePair(pair)}
  aarProjection(ref){
    const record=this._record(ref),entry=this.aar.get(keyOf(record));
    if(!entry)return freeze({resultRef:exactRef(record),state:'EMPTY',analysisId:null,revision:0,analysisDigest:null,revisions:[],resultManifestDigest:record.manifestDigest,factMutation:false});
    return freeze(clone(entry));
  }
  annotate({ref,text,analysisId=null,expectedRevision=null,state='DRAFT',anchoredEventRefs=[]}={}){
    const record=this._record(ref),key=keyOf(record),existing=this.aar.get(key),normalizedState=String(state||'DRAFT').toUpperCase();
    if(!['DRAFT','SAVED'].includes(normalizedState))throw Error(`RESULT_AAR_STATE_INVALID:${normalizedState}`);
    const expected=expectedRevision===null||expectedRevision===undefined?(existing?.revision??0):Number(expectedRevision);
    const current=existing?.revision??0;
    if(!Number.isInteger(expected)||expected<0)throw Error('RESULT_AAR_EXPECTED_REVISION_INVALID');
    if(expected!==current)return freeze({resultRef:exactRef(record),state:'CONFLICT',analysisId:existing?.analysisId||analysisId||null,expectedRevision:expected,currentRevision:current,analysisDigest:existing?.analysisDigest||null,resultManifestDigest:record.manifestDigest,factMutation:false,conflict:true});
    const nextRevision=current+1,id=analysisId||existing?.analysisId||`AAR-${record.resultId}-${record.revisionId}`;
    if(existing&&analysisId&&analysisId!==existing.analysisId)throw Error('RESULT_AAR_ANALYSIS_ID_CONTRADICTION');
    const anchors=Array.isArray(anchoredEventRefs)?anchoredEventRefs.map(value=>String(value)):(()=>{throw Error('RESULT_AAR_EVENT_REFS_ARRAY_REQUIRED')})();
    const eventRefs=new Set((record.recordedEvents||[]).map((event,index)=>String(event?.eventId||event?.id||(event?.seq!==undefined?`seq:${String(event.seq)}`:`recorded:${index+1}`))));
    for(const anchor of anchors)if(!eventRefs.has(anchor))throw Error(`RESULT_AAR_EVENT_REF_ABSENT:${anchor}`);
    const body=String(text||'');
    const analysisDigest=`aar-fnv1a32:${hash(JSON.stringify({id,revision:nextRevision,state:normalizedState,text:body,anchoredEventRefs:anchors,resultId:record.resultId,resultRevisionId:record.revisionId,resultManifestDigest:record.manifestDigest}))}`;
    const revision=freeze({analysisId:id,revision:nextRevision,state:normalizedState,text:body,anchoredEventRefs:anchors,analysisDigest,resultRef:exactRef(record),resultManifestDigest:record.manifestDigest,factMutation:false});
    const revisions=freeze([...(existing?.revisions||[]),revision]);
    const entry=freeze({...revision,revisions});
    this.aar.set(key,entry);
    return freeze(clone(entry));
  }
  handoff({ref}={}){
    const record=this._record(ref),resultRef=exactRef(record);
    return freeze({ok:true,owner:this.owner,envelopeVersion:'candidate-evidence/results-source/1',resultRef,sourceRunInputRef:clone(record.sourceRunInputRef||null),schemaVersion:record.schemaVersion||'',comparatorVersion:record.comparatorVersion||'',provenanceRefs:clone(record.provenanceRefs||[]),limitations:clone(record.limitations||[]),sealed:true,candidateEvidenceOnly:true,formalAdmissionPerformed:false,reviewDecisionPerformed:false,masteryMutation:false,portfolioMutation:false,auditAuthority:false});
  }
  verifyDeterminism({ref}={}){const record=this._record(ref);if(typeof this.determinismVerifier!=='function')return freeze({ok:false,code:'DETERMINISM_PROVIDER_UNAVAILABLE',reason:'Determinism verification requires a separately admitted execution provider.',runExecuted:false,mutated:false});return this.determinismVerifier({result:clone(record)})}
}
