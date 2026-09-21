import {appendFileSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {randomUUID} from 'node:crypto';

const statusSet=new Set(['AVAILABLE','UNAVAILABLE','STALE','ERROR']);
const iso=ms=>new Date(ms).toISOString();

export class HealthCapability{
  constructor({root,sources=[],clock=()=>Date.now()}={}){if(!root)throw Error('HEALTH_ROOT_REQUIRED');this.owner='HealthCapability';this.version='1.0.0';this.root=resolve(root);this.clock=clock;this.sources=new Map();this.latest=new Map();mkdirSync(this.root,{recursive:true});for(const source of sources)this.registerSource(source);this.#hydrate()}
  #hydrate(){try{const parsed=JSON.parse(readFileSync(join(this.root,'latest.json'),'utf8'));for(const observation of parsed.observations||[])this.latest.set(observation.sourceId,observation)}catch{}}
  #persist(){writeFileSync(join(this.root,'latest.json'),JSON.stringify({schema:'CEP_HEALTH_LATEST_V1',observations:[...this.latest.values()]},null,2),'utf8')}
  registerSource(source){if(!source?.sourceId||typeof source.observe!=='function')throw Error('HEALTH_SOURCE_INVALID');this.sources.set(source.sourceId,{freshnessMs:5000,kind:'Observation',...source});return source.sourceId}
  descriptor(){return {owner:this.owner,version:this.version,availability:'AVAILABLE',states:[...statusSet],sourceIds:[...this.sources.keys()],persistenceHealthIsProductHealth:false};}
  async #observe(source){const observedNow=this.clock(),observationId=`obs-${randomUUID()}`;try{const result=await source.observe();const observedAt=String(result?.observedAt||iso(observedNow)),freshnessMs=Math.max(1,Number(result?.freshnessMs??source.freshnessMs??5000)),ageMs=Math.max(0,observedNow-Date.parse(observedAt));let status=statusSet.has(result?.status)?result.status:'AVAILABLE';if(status==='AVAILABLE'&&ageMs>freshnessMs)status='STALE';return {observationId,sourceId:source.sourceId,kind:source.kind||'Observation',observedAt,freshnessMs,ageMs,status,value:result?.value??null,error:result?.error??null,sourceIdentity:result?.sourceIdentity||source.sourceId,providerEvidence:result?.providerEvidence??null}}
    catch(error){return {observationId,sourceId:source.sourceId,kind:source.kind||'Observation',observedAt:iso(observedNow),freshnessMs:Number(source.freshnessMs||5000),ageMs:0,status:'ERROR',value:null,error:String(error?.message||error),sourceIdentity:source.sourceId,providerEvidence:null}}}
  async refresh(){const observations=[];for(const source of this.sources.values()){const observation=await this.#observe(source);this.latest.set(observation.sourceId,observation);observations.push(observation)}this.#persist();return {ok:true,owner:this.owner,refreshedAt:iso(this.clock()),observations};}
  observations(){return {ok:true,owner:this.owner,observations:[...this.latest.values()]};}
  workerLiveness(){return [...this.latest.values()].filter(item=>item.kind==='WorkerLiveness')}
  queueMetrics(){return [...this.latest.values()].filter(item=>item.kind==='QueueMetric')}
  async runDiagnostic({requestedBy='health-surface'}={}){const diagnosticId=`diag-${randomUUID()}`,startedAt=iso(this.clock()),refreshed=await this.refresh(),summary={AVAILABLE:0,UNAVAILABLE:0,STALE:0,ERROR:0};for(const observation of refreshed.observations)summary[observation.status]=(summary[observation.status]||0)+1;const status=summary.ERROR?'ERROR':summary.UNAVAILABLE?'UNAVAILABLE':summary.STALE?'STALE':'AVAILABLE',receipt={schema:'CEP_HEALTH_DIAGNOSTIC_V1',diagnosticId,requestedBy:String(requestedBy),startedAt,completedAt:iso(this.clock()),status,summary,observationIds:refreshed.observations.map(item=>item.observationId),durable:true};appendFileSync(join(this.root,'diagnostics.jsonl'),JSON.stringify(receipt)+'\n','utf8');return {ok:true,owner:this.owner,diagnostic:receipt,observations:refreshed.observations};}
}
