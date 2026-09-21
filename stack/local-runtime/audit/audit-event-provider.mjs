import {appendFileSync,existsSync,mkdirSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';

const canonical=value=>JSON.stringify(canonicalize(value));
function canonicalize(value){if(Array.isArray(value))return value.map(canonicalize);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonicalize(value[key])]));return value}
const sha256=value=>createHash('sha256').update(value).digest('hex');
const safeText=(value,max=4000)=>String(value??'').slice(0,max);
const eventPayload=event=>({schema:event.schema,sequence:event.sequence,eventId:event.eventId,occurredAt:event.occurredAt,actor:event.actor,action:event.action,target:event.target,outcome:event.outcome,correlationId:event.correlationId,details:event.details,previousHash:event.previousHash});
const eventHash=event=>sha256(canonical(eventPayload(event)));

function readJsonl(path){
  if(!existsSync(path))return [];
  const text=readFileSync(path,'utf8');if(!text.trim())return [];
  return text.split(/\r?\n/).filter(Boolean).map((line,index)=>{try{return JSON.parse(line)}catch{throw Object.assign(Error('AUDIT_STORAGE_CORRUPT'),{code:'AUDIT_STORAGE_CORRUPT',line:index+1})}});
}

export class AuditEventProvider{
  constructor({root,clock=()=>new Date()}={}){
    if(!root)throw Error('AUDIT_ROOT_REQUIRED');
    this.owner='AuditEventProvider';this.version='1.0.0';this.root=resolve(root);this.clock=clock;
    mkdirSync(this.root,{recursive:true});this.eventsPath=join(this.root,'audit-events.jsonl');this.annotationsPath=join(this.root,'audit-annotations.jsonl');
    this.events=readJsonl(this.eventsPath);this.annotations=readJsonl(this.annotationsPath);
  }
  descriptor(){return {owner:this.owner,version:this.version,availability:'AVAILABLE',domainKind:'CEP_AUDIT_EVENT',storage:'DURABLE_JSONL',appendOnlyApplicationContract:true,databaseImmutabilityProven:false,encryption:false,eventSchema:'CEP_AUDIT_EVENT_V1',annotationSchema:'CEP_AUDIT_ANNOTATION_V1',hashChain:{algorithm:'SHA-256',scope:'CANONICAL_AUDIT_EVENT_RECORD'},annotationsStoredSeparately:true,semanticCommandReceiptsAreAuditEvents:false};}
  verify(){
    let previousHash='GENESIS';
    for(let i=0;i<this.events.length;i++){
      const event=this.events[i],expectedSequence=i+1;
      if(Number(event.sequence)!==expectedSequence||event.previousHash!==previousHash||event.hash!==eventHash(event))return {ok:true,valid:false,firstInvalidSequence:expectedSequence,observedScope:this.#scope()};
      previousHash=event.hash;
    }
    return {ok:true,valid:true,firstInvalidSequence:null,observedScope:this.#scope()};
  }
  #scope(){const count=this.events.length,last=this.events[count-1]||null;return {fromSequence:count?1:null,toSequence:count?Number(last.sequence):null,count,watermarkHash:last?.hash||'GENESIS'};}
  append({eventId,occurredAt,actor,action,target,outcome,correlationId=null,details=null}={}){
    const verify=this.verify();if(!verify.valid)return {ok:false,code:'AUDIT_CHAIN_INVALID',firstInvalidSequence:verify.firstInvalidSequence,observedScope:verify.observedScope};
    const required={actor:safeText(actor,240),action:safeText(action,240),target:safeText(target,400),outcome:safeText(outcome,120)};
    if(!required.actor||!required.action||!required.target||!required.outcome)return {ok:false,code:'AUDIT_EVENT_FIELDS_REQUIRED'};
    const prior=this.events.at(-1),event={schema:'CEP_AUDIT_EVENT_V1',sequence:this.events.length+1,eventId:safeText(eventId,240)||`audit-${randomUUID()}`,occurredAt:occurredAt?new Date(occurredAt).toISOString():this.clock().toISOString(),...required,correlationId:correlationId==null?null:safeText(correlationId,240),details:details==null?null:structuredClone(details),previousHash:prior?.hash||'GENESIS'};
    if(this.events.some(item=>item.eventId===event.eventId))return {ok:false,code:'AUDIT_EVENT_ID_CONFLICT',eventId:event.eventId};
    event.hash=eventHash(event);appendFileSync(this.eventsPath,JSON.stringify(event)+'\n','utf8');this.events.push(event);return {ok:true,event:structuredClone(event),observedScope:this.#scope()};
  }
  search({actor,action,target,outcome,correlationId,from,to,limit=50,cursor=null}={}){
    const before=this.#scope();const max=Math.min(200,Math.max(1,Number(limit)||50)),afterSequence=Math.max(0,Number(cursor)||0),fromMs=from?Date.parse(from):null,toMs=to?Date.parse(to):null;
    const matches=this.events.filter(event=>{
      const at=Date.parse(event.occurredAt);return event.sequence>afterSequence&&(!actor||event.actor===actor)&&(!action||event.action===action)&&(!target||event.target===target)&&(!outcome||event.outcome===outcome)&&(!correlationId||event.correlationId===correlationId)&&(!Number.isFinite(fromMs)||at>=fromMs)&&(!Number.isFinite(toMs)||at<=toMs);
    });
    const page=matches.slice(0,max),nextCursor=matches.length>max?String(page.at(-1)?.sequence||afterSequence):null,after=this.#scope();
    return {ok:true,events:structuredClone(page),pagination:{limit:max,cursor:cursor==null?null:String(cursor),nextCursor,returned:page.length},filters:{actor:actor||null,action:action||null,target:target||null,outcome:outcome||null,correlationId:correlationId||null,from:from||null,to:to||null},observedScope:after,historyMutated:canonical(before)!==canonical(after)};
  }
  annotate({eventId,actor,note}={}){
    const event=this.events.find(item=>item.eventId===String(eventId||''));if(!event)return {ok:false,code:'AUDIT_EVENT_NOT_FOUND'};
    const text=safeText(note,4000),who=safeText(actor,240);if(!text||!who)return {ok:false,code:'AUDIT_ANNOTATION_FIELDS_REQUIRED'};
    const eventHashBefore=event.hash,eventCountBefore=this.events.length,annotation={schema:'CEP_AUDIT_ANNOTATION_V1',annotationId:`annotation-${randomUUID()}`,eventId:event.eventId,revision:this.annotations.filter(item=>item.eventId===event.eventId).length+1,actor:who,note:text,createdAt:this.clock().toISOString()};
    appendFileSync(this.annotationsPath,JSON.stringify(annotation)+'\n','utf8');this.annotations.push(annotation);
    return {ok:true,annotation:structuredClone(annotation),eventHashBefore,eventHashAfter:event.hash,eventCountBefore,eventCountAfter:this.events.length,eventMutated:event.hash!==eventHashBefore||this.events.length!==eventCountBefore};
  }
  listAnnotations(eventId){return structuredClone(this.annotations.filter(item=>item.eventId===String(eventId||'')));}
}
