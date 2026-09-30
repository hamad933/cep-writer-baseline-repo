import {canonicalAnalyticalIdentityKey,createAnalyticalProviderBoundary} from '../../foundation/contracts/analysis-provider.js';

const clone=value=>value===undefined?undefined:structuredClone(value);
const text=(value,code)=>{if(typeof value!=='string'||!value.trim())throw Error(code);return value;};
const exactRef=ref=>{
  if(!ref||typeof ref!=='object')throw Error('RQ_SOURCE_REVISION_REF_REQUIRED');
  return Object.freeze({sourceId:text(ref.sourceId,'RQ_SOURCE_ID_REQUIRED'),revision:text(ref.revision,'RQ_REVISION_REQUIRED'),digest:text(ref.digest,'RQ_DIGEST_REQUIRED'),locator:text(ref.locator,'RQ_LOCATOR_REQUIRED')});
};
const keyOf=ref=>canonicalAnalyticalIdentityKey('rq-source-revision-index',[ref.sourceId,ref.revision]);
const refKey=ref=>canonicalAnalyticalIdentityKey('rq-source-revision-ref',[ref.sourceId,ref.revision,ref.digest,ref.locator]);

function validateRecord(record){
  const ref=exactRef(record);
  text(record.schemaVersion,'RQ_SCHEMA_VERSION_REQUIRED');
  if(!record.comparable||typeof record.comparable!=='object'||Array.isArray(record.comparable))throw Error('RQ_COMPARABLE_FIELDS_REQUIRED');
  if(record.workingConflict){text(record.workingConflict.classification,'RQ_WORKING_CONFLICT_CLASSIFICATION_REQUIRED');text(record.workingConflict.rationale,'RQ_WORKING_CONFLICT_RATIONALE_REQUIRED');}
  if(record.successor)exactRef(record.successor);
  return {...clone(record),...ref};
}

function fieldDescriptors(record){
  return Object.keys(record.comparable).sort().map(path=>{
    const field=record.comparable[path];
    if(!field||typeof field!=='object')throw Error(`RQ_FIELD_DESCRIPTOR_REQUIRED:${path}`);
    const present=field.present!==false;
    return {path,label:text(field.label||path,'RQ_FIELD_LABEL_REQUIRED'),type:text(field.type||typeof field.value,'RQ_FIELD_TYPE_REQUIRED'),present,...(present?{value:clone(field.value)}:{}),provenanceRefs:clone(field.provenanceRefs||[refKey(record)])};
  });
}

export function createRqCompareProvider(records,{providerId='rq.source-revision.compare',comparatorVersion='rq-compare/1.0.0'}={}){
  if(!Array.isArray(records))throw Error('RQ_RECORDS_REQUIRED');
  const snapshot=records.map(validateRecord),byKey=new Map();
  for(const record of snapshot){const key=keyOf(record);if(byKey.has(key))throw Error(`RQ_DUPLICATE_SOURCE_REVISION:${key}`);byKey.set(key,record);}
  return createAnalyticalProviderBoundary({
    descriptor:{providerId,domainKind:'rq',schemaVersion:'rq-source-revision/1',comparatorVersion,identityShape:'sourceId + revision + digest + locator'},
    validateExactRef:exactRef,
    refKey,
    resolve(ref){
      const record=byKey.get(keyOf(ref));
      if(!record)return {state:'MISSING',reason:'The exact SourceRevision is absent from the RQ provider.',reasonCode:'RQ_SOURCE_REVISION_ABSENT',provenanceRefs:[]};
      if(record.digest!==ref.digest)throw Error('RQ_DIGEST_REVISION_CONTRADICTION');
      if(record.locator!==ref.locator)return {state:'UNRESOLVABLE',reason:'The SourceRevision exists but the requested locator cannot resolve to its pinned locator.',reasonCode:'RQ_LOCATOR_UNRESOLVABLE',provenanceRefs:[refKey(record)],successorHint:clone(record.successor||null)};
      return {state:'RESOLVED',objectId:record.sourceId,revisionId:record.revision,digest:record.digest,schemaVersion:record.schemaVersion,fields:fieldDescriptors(record),provenanceRefs:clone(record.provenanceRefs||[refKey(record)]),successorHint:clone(record.successor||null),domainContext:record.workingConflict?{kind:'WorkingConflict',classification:record.workingConflict.classification,rationale:record.workingConflict.rationale,authority:'RQ_ANALYTICAL_WORKING_STATE',formalReview:false,w04Finding:false,w04Decision:false}:null};
    },
    preflightCompatibility(left,right){
      if(left.schemaVersion!==right.schemaVersion)return {compatible:false,reason:'RQ SourceRevision schemas are incompatible.',reasonCode:'RQ_SCHEMA_INCOMPATIBLE',comparatorVersion};
      return {compatible:true,reason:'',reasonCode:'',comparatorVersion};
    }
  });
}
