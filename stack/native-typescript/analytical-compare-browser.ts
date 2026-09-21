import {AnalyticalCompareOwner} from './foundation/analytical/compare.js';
import {AnalyticalCompareHost} from './foundation/analytical/compare-host.js';
import {createRqCompareProvider} from './adapters/analytical/rq-compare-provider.js';
import {createResultsCompareProvider} from './adapters/analytical/results-compare-provider.js';

const clone=value=>structuredClone(value);

export function mountAnalyticalCompareBrowserProof(root){
  const rqRecords=[
    {sourceId:'SRC-BROWSER',revision:'r1',digest:'rq-browser-r1',locator:'rq://browser/SRC-BROWSER/r1',schemaVersion:'rq-source/1',provenanceRefs:['rq-browser-prov:r1'],successor:{sourceId:'SRC-BROWSER',revision:'r2',digest:'rq-browser-r2',locator:'rq://browser/SRC-BROWSER/r2'},workingConflict:{classification:'SOURCE_DIVERGENCE',rationale:'Working analytical rationale only.'},comparable:{title:{label:'Title',type:'text',value:'Old title'},abstract:{label:'Abstract',type:'text',value:'Old abstract'},confidence:{label:'Confidence',type:'number',value:0.7}}},
    {sourceId:'SRC-BROWSER',revision:'r2',digest:'rq-browser-r2',locator:'rq://browser/SRC-BROWSER/r2',schemaVersion:'rq-source/1',provenanceRefs:['rq-browser-prov:r2'],comparable:{title:{label:'Title',type:'text',value:'New title'},confidence:{label:'Confidence',type:'number',value:0.7},quality:{label:'Quality',type:'text',value:'verified'}}},
    {sourceId:'SRC-BROWSER-OTHER',revision:'r1',digest:'rq-browser-other',locator:'rq://browser/SRC-BROWSER-OTHER/r1',schemaVersion:'rq-source/2',comparable:{title:{label:'Title',type:'text',value:'Other'}}}
  ];
  const resultsRecords=[
    {resultId:'RES-BROWSER-1',revisionId:'rev-1',manifestDigest:'result-browser-1',sealed:true,schemaVersion:'sealed-result/1',comparatorVersion:'results-compare/1.0.0',recordedEvents:[{stream:'terminal',sequence:1,eventId:'evt-1',causalRefs:[]}],aar:{analysisId:'aar-browser-1',revision:'1',anchoredEventRefs:['evt-1']},historicalTerminalBytes:'<script>globalThis.__CEP_EXECUTED__=true</script> inert history',comparable:{score:{label:'Score',type:'number',value:10},status:{label:'Status',type:'text',value:'PASS'},terminal:{label:'Terminal bytes',type:'bytes-as-text',value:'<script>globalThis.__CEP_EXECUTED__=true</script> inert history'}}},
    {resultId:'RES-BROWSER-2',revisionId:'rev-2',manifestDigest:'result-browser-2',sealed:true,schemaVersion:'sealed-result/1',comparatorVersion:'results-compare/1.0.0',recordedEvents:[{stream:'terminal',sequence:1,eventId:'evt-2',causalRefs:[]}],aar:{analysisId:'aar-browser-2',revision:'1',anchoredEventRefs:['evt-2']},historicalTerminalBytes:'plain inert history',comparable:{score:{label:'Score',type:'number',value:20},status:{label:'Status',type:'text',value:'PASS'},terminal:{label:'Terminal bytes',type:'bytes-as-text',value:'plain inert history'}}},
    {resultId:'RES-BROWSER-3',revisionId:'rev-3',manifestDigest:'result-browser-3',sealed:true,schemaVersion:'sealed-result/2',comparatorVersion:'results-compare/1.0.0',comparable:{score:{label:'Score',type:'number',value:10}}}
  ];
  const before={rq:JSON.stringify(rqRecords),results:JSON.stringify(resultsRecords)};
  const effects={replay:0,simulator:0,determinism:0,evidence:0};
  const owner=new AnalyticalCompareOwner(),rq=createRqCompareProvider(rqRecords),results=createResultsCompareProvider(resultsRecords,{effects:{replayExecute:()=>effects.replay++,simulatorRun:()=>effects.simulator++,determinismVerify:()=>effects.determinism++,candidateEvidenceHandoff:()=>effects.evidence++}});
  owner.registerProvider(rq);owner.registerProvider(results);
  const pair=(providerId,left,right)=>owner.createPair({left:{providerId,ref:left},right:{providerId,ref:right}});
  const rq1={sourceId:'SRC-BROWSER',revision:'r1',digest:'rq-browser-r1',locator:'rq://browser/SRC-BROWSER/r1'},rq2={sourceId:'SRC-BROWSER',revision:'r2',digest:'rq-browser-r2',locator:'rq://browser/SRC-BROWSER/r2'};
  const res1={resultId:'RES-BROWSER-1',revisionId:'rev-1',manifestDigest:'result-browser-1'},res2={resultId:'RES-BROWSER-2',revisionId:'rev-2',manifestDigest:'result-browser-2'},res3={resultId:'RES-BROWSER-3',revisionId:'rev-3',manifestDigest:'result-browser-3'},missing={resultId:'RES-BROWSER-404',revisionId:'rev-x',manifestDigest:'missing-result'};
  owner.openSession('rq-browser',pair('rq.source-revision.compare',rq1,rq2));
  owner.openSession('results-valid',pair('results.sealed-result.compare',res1,res2));
  owner.openSession('results-incompatible',pair('results.sealed-result.compare',res1,res3));
  owner.openSession('results-missing',pair('results.sealed-result.compare',res1,missing));
  const host=new AnalyticalCompareHost(owner);host.mount(root,'rq-browser');
  return {
    owner,host,effects,before,rqRecords,resultsRecords,
    sessions:Object.freeze({rq:'rq-browser',resultsValid:'results-valid',resultsIncompatible:'results-incompatible',resultsMissing:'results-missing'}),
    show(name){const sessionId=this.sessions[name];if(!sessionId)throw Error('UNKNOWN_BROWSER_PROOF_SESSION');host.mount(root,sessionId);return owner.projectSession(sessionId);},
    unchanged(){return {rq:before.rq===JSON.stringify(rqRecords),results:before.results===JSON.stringify(resultsRecords)};},
    snapshot(){return clone({effects,unchanged:this.unchanged(),rq:owner.sessionState('rq-browser'),resultsValid:owner.sessionState('results-valid'),resultsIncompatible:owner.sessionState('results-incompatible'),resultsMissing:owner.sessionState('results-missing')});}
  };
}
