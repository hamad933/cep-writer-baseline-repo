import {existsSync,mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {HealthCapability} from '../stack/local-runtime/health/health-capability.mjs';
const assert=(v,m)=>{if(!v)throw Error(m)};let now=Date.parse('2026-09-17T02:00:00Z');const root=mkdtempSync(join(tmpdir(),'cep-w05-health-')),checks=[];const check=(id,fn)=>{fn();checks.push({id,status:'PASS'})};
try{
 const health=new HealthCapability({root,clock:()=>now,sources:[
  {sourceId:'proof.available',kind:'Observation',freshnessMs:5000,observe:()=>({status:'AVAILABLE',observedAt:new Date(now).toISOString(),sourceIdentity:'real-proof-source',value:{ok:true},providerEvidence:{actualProbe:true}})},
  {sourceId:'proof.stale-worker',kind:'WorkerLiveness',freshnessMs:1000,observe:()=>({status:'AVAILABLE',observedAt:new Date(now-5000).toISOString(),sourceIdentity:'worker-1',value:{workerId:'worker-1'}})},
  {sourceId:'proof.unavailable',kind:'QueueMetric',freshnessMs:5000,observe:()=>({status:'UNAVAILABLE',observedAt:new Date(now).toISOString(),sourceIdentity:'queue-provider',value:null,error:'QUEUE_PROVIDER_OFFLINE'})},
  {sourceId:'proof.error',kind:'Observation',observe:()=>{throw Error('probe failed')}}
 ]});const refresh=await health.refresh(),by=Object.fromEntries(refresh.observations.map(x=>[x.sourceId,x]));
 check('HLT-01-source-identity-observedAt',()=>assert(by['proof.available'].status==='AVAILABLE'&&by['proof.available'].sourceIdentity==='real-proof-source'&&by['proof.available'].observedAt,'available observation missing truth'));
 check('HLT-02-stale-derived-from-freshness',()=>assert(by['proof.stale-worker'].status==='STALE'&&by['proof.stale-worker'].ageMs===5000,'stale truth failed'));
 check('HLT-03-unavailable-truth',()=>assert(by['proof.unavailable'].status==='UNAVAILABLE','unavailable collapsed'));
 check('HLT-04-error-truth',()=>assert(by['proof.error'].status==='ERROR'&&String(by['proof.error'].error).includes('probe failed'),'error collapsed'));
 const diagnostic=await health.runDiagnostic({requestedBy:'health-real-consumer'});check('HLT-05-diagnostic-durable-separate',()=>assert(diagnostic.ok&&diagnostic.diagnostic.durable&&existsSync(join(root,'diagnostics.jsonl')),'diagnostic not durable'));
 const hydrated=new HealthCapability({root,clock:()=>now,sources:[]});check('HLT-06-restart-readback',()=>assert(hydrated.observations().observations.length===4,'health restart readback failed'));
 console.log(JSON.stringify({kind:'W05_HEALTH_CAPABILITY_PROOF',status:'PASS',checks,refresh,diagnostic:diagnostic.diagnostic},null,2));
}catch(error){console.error(JSON.stringify({kind:'W05_HEALTH_CAPABILITY_PROOF',status:'FAIL',checks,error:String(error?.stack||error)},null,2));process.exitCode=1}finally{rmSync(root,{recursive:true,force:true})}
