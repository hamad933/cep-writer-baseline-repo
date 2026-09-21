import {canonicalAnalyticalIdentityKey,createAnalyticalProviderBoundary} from '../../foundation/contracts/analysis-provider.js';

const clone=value=>value===undefined?undefined:structuredClone(value);
const text=(value,code)=>{if(typeof value!=='string'||!value.trim())throw Error(code);return value;};
const exactRef=ref=>{
  if(!ref||typeof ref!=='object')throw Error('RESULT_REF_REQUIRED');
  return Object.freeze({resultId:text(ref.resultId,'RESULT_ID_REQUIRED'),revisionId:text(ref.revisionId,'RESULT_REVISION_ID_REQUIRED'),manifestDigest:text(ref.manifestDigest,'RESULT_MANIFEST_DIGEST_REQUIRED')});
};
const keyOf=ref=>canonicalAnalyticalIdentityKey('results-revision-index',[ref.resultId,ref.revisionId]);
const refKey=ref=>canonicalAnalyticalIdentityKey('results-revision-ref',[ref.resultId,ref.revisionId,ref.manifestDigest]);

function validateRecord(record){
  const ref=exactRef(record);
  if(record.sealed!==true)throw Error('RESULT_COMPARE_REQUIRES_SEALED_RESULT');
  text(record.schemaVersion,'RESULT_SCHEMA_VERSION_REQUIRED');
  text(record.comparatorVersion,'RESULT_COMPARATOR_VERSION_REQUIRED');
  if(!record.comparable||typeof record.comparable!=='object'||Array.isArray(record.comparable))throw Error('RESULT_COMPARABLE_FIELDS_REQUIRED');
  if(record.recordedEvents!==undefined&&!Array.isArray(record.recordedEvents))throw Error('RESULT_RECORDED_EVENTS_ARRAY_REQUIRED');
  return {...clone(record),...ref};
}
function fieldDescriptors(record){
  return Object.keys(record.comparable).sort().map(path=>{
    const field=record.comparable[path];if(!field||typeof field!=='object')throw Error(`RESULT_FIELD_DESCRIPTOR_REQUIRED:${path}`);
    const present=field.present!==false;
    return {path,label:text(field.label||path,'RESULT_FIELD_LABEL_REQUIRED'),type:text(field.type||typeof field.value,'RESULT_FIELD_TYPE_REQUIRED'),present,...(present?{value:clone(field.value)}:{}),provenanceRefs:clone(field.provenanceRefs||[refKey(record)])};
  });
}

export function createResultsCompareProvider(records,{providerId='results.sealed-result.compare',comparatorVersion='results-compare/1.0.0',effects={}}={}){
  if(!Array.isArray(records))throw Error('RESULT_RECORDS_REQUIRED');
  const snapshot=records.map(validateRecord),byKey=new Map();
  for(const record of snapshot){const key=keyOf(record);if(byKey.has(key))throw Error(`RESULT_DUPLICATE_REVISION:${key}`);byKey.set(key,record);}
  // Execution-capable hooks may exist in the Results domain composition, but are deliberately retained
  // outside the analytical provider boundary. Compare has no reference with which to invoke them.
  const nonCompareEffects={replayExecute:effects.replayExecute,simulatorRun:effects.simulatorRun,determinismVerify:effects.determinismVerify,candidateEvidenceHandoff:effects.candidateEvidenceHandoff};
  void nonCompareEffects;
  return createAnalyticalProviderBoundary({
    descriptor:{providerId,domainKind:'results',schemaVersion:'sealed-result/1',comparatorVersion,identityShape:'resultId + revisionId + manifestDigest'},
    validateExactRef:exactRef,
    refKey,
    resolve(ref){
      const record=byKey.get(keyOf(ref));
      if(!record)return {state:'MISSING',reason:'The exact sealed Result revision is absent from the Results provider.',reasonCode:'RESULT_REVISION_ABSENT',provenanceRefs:[]};
      if(record.manifestDigest!==ref.manifestDigest)throw Error('RESULT_MANIFEST_DIGEST_REVISION_CONTRADICTION');
      return {state:'RESOLVED',objectId:record.resultId,revisionId:record.revisionId,digest:record.manifestDigest,schemaVersion:record.schemaVersion,fields:fieldDescriptors(record),provenanceRefs:clone(record.provenanceRefs||[refKey(record)]),domainContext:{sealed:true,replayPresentationOnly:true,recomputation:false,determinismVerification:false,candidateEvidenceAdmission:false,recordedEvents:clone(record.recordedEvents||[]),aar:clone(record.aar||null),historicalTerminalBytes:clone(record.historicalTerminalBytes??null)}};
    },
    preflightCompatibility(left,right){
      if(left.schemaVersion!==right.schemaVersion)return {compatible:false,reason:'Sealed Result schemas are incompatible.',reasonCode:'RESULT_SCHEMA_INCOMPATIBLE',comparatorVersion};
      const leftRecord=byKey.get(canonicalAnalyticalIdentityKey('results-revision-index',[left.objectId,left.revisionId])),rightRecord=byKey.get(canonicalAnalyticalIdentityKey('results-revision-index',[right.objectId,right.revisionId]));
      if(leftRecord?.comparatorVersion!==rightRecord?.comparatorVersion||leftRecord?.comparatorVersion!==comparatorVersion)return {compatible:false,reason:'Result comparator versions are incompatible with the registered comparison provider.',reasonCode:'RESULT_COMPARATOR_INCOMPATIBLE',comparatorVersion};
      return {compatible:true,reason:'',reasonCode:'',comparatorVersion};
    }
  });
}
