import {createValidationConsumerAdapter,VALIDATION_RULESET_IDENTITY,VALIDATION_VALIDATOR_IDENTITY} from '../../../adapters/validation.js';

const assert=(value:any,message='assertion failed')=>{if(!value)throw Error(message)};
const artifactDigest='c'.repeat(64);
const exact=(overrides:any={})=>JSON.stringify({artifactRef:'artifact-A',artifactDigest,ruleset:VALIDATION_RULESET_IDENTITY,validator:VALIDATION_VALIDATOR_IDENTITY,payload:{ok:true},...overrides});
const results:any[]=[];
const test=async(name:string,fn:()=>any)=>{try{await fn();results.push({name,status:'PASS'})}catch(error){results.push({name,status:'FAIL',error:String((error as any)?.message||error)})}};

await test('exact identity yields technical-only result with exact sha256 request digest',async()=>{
  const adapter=createValidationConsumerAdapter();
  const result=await adapter.validate(exact());
  assert(result.status==='TECHNICALLY_VALID',`unexpected status ${result.status}`);
  assert(result.inputDigest==='sha256:20ded142e7401c20e42c0a39ce484910975794eca42ece1a226da3701cb570ec',`request digest mismatch: ${result.inputDigest}`);
  assert(adapter.truth().formalReviewAuthority===false&&adapter.truth().acceptanceAuthority===false,'technical result gained authority');
});

await test('typed snapshot preserves QUEUED→RUNNING→terminal history',async()=>{
  const adapter=createValidationConsumerAdapter();
  const result=await adapter.validate(exact());
  const snapshot=adapter.snapshot();
  assert(snapshot.requests.length===1&&snapshot.results.length===1,'typed request/result projection missing');
  const statuses=snapshot.history.filter((entry:any)=>entry.requestId===result.requestId).map((entry:any)=>entry.status);
  assert(statuses[0]==='QUEUED','QUEUED transition missing');
  assert(statuses.includes('RUNNING'),'RUNNING transition missing');
  assert(statuses.at(-1)==='TECHNICALLY_VALID','terminal transition missing');
});

await test('changed current artifact marks prior result stale and keeps acceptance null',async()=>{
  const adapter=createValidationConsumerAdapter();
  const result=await adapter.validate(exact());
  const inspected=adapter.inspect({resultId:result.resultId,currentRaw:exact({artifactRef:'artifact-B',artifactDigest:'d'.repeat(64)})});
  assert(inspected.code==='STALE_FOR_CURRENT_ARTIFACT','stale result was not preserved');
  assert(inspected.currentIdentityMatches===false,'stale comparison did not fail exact identity');
  assert(inspected.acceptance===null&&inspected.formalReviewAuthority===false,'stale path created authority');
});

await test('missing validator remains UNAVAILABLE and never technically valid',async()=>{
  const adapter=createValidationConsumerAdapter();
  const result=await adapter.validate(JSON.stringify({artifactRef:'artifact-A',artifactDigest,ruleset:VALIDATION_RULESET_IDENTITY,payload:{ok:true}}));
  assert(result.status==='UNAVAILABLE',`unexpected status ${result.status}`);
  assert(result.technicalFindings.some((finding:any)=>finding.code==='VALIDATOR_IDENTITY_MISSING'),'missing-validator diagnostic absent');
});

await test('missing ruleset remains UNAVAILABLE and never technically valid',async()=>{
  const adapter=createValidationConsumerAdapter();
  const result=await adapter.validate(JSON.stringify({artifactRef:'artifact-A',artifactDigest,validator:VALIDATION_VALIDATOR_IDENTITY,payload:{ok:true}}));
  assert(result.status==='UNAVAILABLE',`unexpected status ${result.status}`);
  assert(result.technicalFindings.some((finding:any)=>finding.code==='RULESET_IDENTITY_MISSING'),'missing-ruleset diagnostic absent');
});

await test('runtime technical finding retains rule locator observed and expected without W04 authority',async()=>{
  const adapter=createValidationConsumerAdapter({validatorRuntime:{available:()=>true,validate:()=>({findings:[{ruleId:'RULE-17',code:'PORT_POLICY',message:'Port policy mismatch',locator:'$.payload.port',observed:8080,expected:443}]})}});
  const result=await adapter.validate(exact());
  assert(result.status==='TECHNICALLY_INVALID',`runtime nonconformance collapsed into ${result.status}`);
  const finding=result.technicalFindings.find((item:any)=>item.code==='PORT_POLICY');
  assert(finding?.ruleId==='RULE-17'&&finding?.locator==='$.payload.port','rule/locator projection missing');
  assert(finding?.observed===8080&&finding?.expected===443,'observed/expected projection missing');
  assert(finding?.formalReviewFinding===false&&finding?.formalReviewAuthority===false,'technical finding gained W04 authority');
});

await test('validator execution exception becomes ERROR not technical invalid',async()=>{
  const adapter=createValidationConsumerAdapter({validatorRuntime:{available:()=>true,validate:()=>{throw Error('synthetic validator crash')}}});
  const result=await adapter.validate(exact());
  assert(result.status==='ERROR',`execution exception collapsed into ${result.status}`);
  assert(result.technicalFindings.some((finding:any)=>finding.code==='VALIDATOR_EXECUTION_ERROR'),'safe execution-error finding missing');
});

await test('technical findings never create W04 Review findings or Mastery truth',async()=>{
  const adapter=createValidationConsumerAdapter();
  const result=await adapter.validate('{');
  const findings=adapter.findings({resultId:result.resultId});
  assert(findings.technicalFindings.length>0,'expected technical finding');
  assert(findings.formalReviewFindings.length===0&&findings.formalReviewAuthority===false,'technical finding promoted to W04');
  assert(adapter.truth().masteryAuthority===false,'validation created mastery authority');
});

await test('DS01 scheme is explicitly classified test-only and non-canonical',async()=>{
  const adapter=createValidationConsumerAdapter();
  await adapter.validate(exact({artifactRef:'ds01://artifact/validation-target'}));
  const classification=adapter.truth().dataClassification;
  assert(classification?.testOnly===true&&classification?.nonCanonical===true&&classification?.nonProduction===true,'DS01 truth classification missing');
  assert(classification?.providerAuthority===false&&classification?.persistenceAuthority===false,'DS01 fixture gained provider/persistence authority');
});

const report={suite:'SWR-W05-VALIDATION_RESTORATION',pass:results.filter(x=>x.status==='PASS').length,fail:results.filter(x=>x.status==='FAIL').length,total:results.length,tests:results};
console.log(JSON.stringify(report,null,2));
if(report.fail)process.exitCode=1;
