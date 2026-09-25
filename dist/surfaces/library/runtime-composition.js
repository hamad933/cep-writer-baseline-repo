import {StructuredDocumentDomainAdapter} from '../../foundation/structured.js';

export const LIBRARY_REAL_CONSUMER_SOURCE_CONTRACT=Object.freeze({
  id:'LibraryRealConsumerSource',version:'1.0.0',owner:'LibraryDomainAdapter',
  role:'REAL_PRODUCT_SOURCE_INJECTION__NO_FIXTURE_FALLBACK'
});
const forbiddenTruth=/(FIXTURE|DEMO|SYNTHETIC|HARNESS|PROOF[_ -]?ONLY|NON_PRODUCTION|ACCEPTANCE_SEED|NOT_CANONICAL_RUNTIME_IMPORT)/i;
const clone=value=>structuredClone(value);

export function assertGenuineLibrarySource(source){
  if(!source||typeof source!=='object')throw Error('LIBRARY_REAL_SOURCE_REQUIRED');
  if(!source.document?.id||!Array.isArray(source.document?.blocks))throw Error('LIBRARY_REAL_DOCUMENT_REQUIRED');
  const classification=String(source.classification||source.kind||'').trim();
  const truth=String(source.truth||source.sourceTruth||'').trim();
  if(!classification||!truth)throw Error('LIBRARY_SOURCE_TRUTH_REQUIRED');
  if(forbiddenTruth.test(classification)||forbiddenTruth.test(truth))throw Error('LIBRARY_FIXTURE_SOURCE_FORBIDDEN');
  return {classification,truth,documentId:String(source.document.id)};
}

export class LibraryRuntimeComposition {
  constructor({source,commit=null,noteRoute='PERSONAL:CEP/W02/library'}={}){
    const identity=assertGenuineLibrarySource(source);
    this.owner='LibraryRuntimeComposition';
    this.semanticOwner=false;
    const {services={},...sourceData}=source;
    this.source=clone(sourceData);
    this.sourceIdentity=identity;
    this.services=services;
    this.structured=new StructuredDocumentDomainAdapter({
      owner:'LibraryDomainAdapter',domainKind:'library',document:clone(source.document),
      metadata:{surface:'library',domainOwner:'LibraryDomainAdapter',consumerTruth:'REAL_LIBRARY_PRODUCT_SOURCE',sourceClassification:identity.classification,lifecycle:clone(source.lifecycle||null),context:clone(source.context||{})},
      sourceBinding:{sources:clone(source.sources||[]),truth:identity.truth,classification:identity.classification,providerRef:source.providerRef||null},
      noteBinding:{route:noteRoute},commit:commit||this.services.saveBoundary||null
    });
  }
  canCreate(){return typeof this.services.createDocument==='function';}
  create(payload={}){if(!this.canCreate())return {ok:false,status:'LIBRARY_CREATE_PROVIDER_UNAVAILABLE',mutated:false};return this.services.createDocument(payload);}
  canRevise(){return typeof this.services.createSuccessorRevision==='function';}
  revise(payload={}){if(!this.canRevise())return {ok:false,status:'LIBRARY_REVISION_PROVIDER_UNAVAILABLE',mutated:false};return this.services.createSuccessorRevision({document:this.structured.snapshot(),identity:this.structured.identity(),...payload});}
  canCompareRevisions(payload={}){return typeof this.services.compareRevisions==='function'&&Boolean(payload.leftRevision)&&Boolean(payload.rightRevision);}
  compareRevisions(payload={}){if(!this.canCompareRevisions(payload))return {ok:false,status:'LIBRARY_EXACT_REVISION_PAIR_REQUIRED',mutated:false};if(String(payload.leftRevision)==='latest'||String(payload.rightRevision)==='latest')return {ok:false,status:'LIBRARY_LATEST_ALIAS_FORBIDDEN',mutated:false};return this.services.compareRevisions({documentId:this.structured.identity().id,leftRevision:String(payload.leftRevision),rightRevision:String(payload.rightRevision)});}
  descriptor(){return {owner:this.owner,semanticOwner:false,contract:LIBRARY_REAL_CONSUMER_SOURCE_CONTRACT,sourceIdentity:clone(this.sourceIdentity),structuredOwner:this.structured.owner,transactionOwner:this.structured.transactionOwner.owner,persistenceConfigured:this.structured.transactionDescriptor().persistedBoundaryConfigured,fixtureFallback:false};}
}

export function createLibraryRuntimeComposition(options){return new LibraryRuntimeComposition(options);}
