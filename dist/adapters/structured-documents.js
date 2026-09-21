import {StructuredDocumentDomainAdapter} from '../foundation/structured.js';

const clone=value=>structuredClone(value);
const learnDocument={
  id:'learn-document-trust-boundaries',revision:'learn-rev-1',title:'دفتر التعلّم · حدود الثقة',tags:['Learning','Editable draft'],
  blocks:[
    {id:'learn-h1',type:'h2',html:'حدود الثقة والتحقق'},
    {id:'learn-p1',type:'paragraph',html:'اشرح أين تنتقل البيانات من نطاق غير موثوق إلى نطاق موثوق، ثم اربط الضابط الأمني بموضع التحقق.'},
    {id:'learn-callout-1',type:'callout',html:'هذا مستند تعلّم مستقل؛ لا يحتاج إلى حالة بحث المكتبة أو شجرة <bdi dir="ltr">KU</bdi>.'}
  ]
};

export function structuredConsumerSeed(surface,libraryBundle=null){
  if(surface==='library'){if(!libraryBundle)throw Error('LIBRARY_FIXTURE_BUNDLE_REQUIRED');const id=libraryBundle.initialDocumentId||Object.keys(libraryBundle.FIXTURES)[0];return clone(libraryBundle.FIXTURES[id])}
  if(surface==='learn')return clone(learnDocument);
  return {id:`structured-${surface}-document`,revision:'foundation-rev-1',title:`${surface} · Foundation document host`,tags:['Foundation'],blocks:[{id:`${surface}-placeholder`,type:'paragraph',html:'Structured host retained for shared workspace composition.'}]};
}

export function bindStructuredPersistence(adapter,persistenceClient,{onReceipt=null,autosaveDelayMs=350}={}){
  if(!adapter||!persistenceClient)return {available:false,reason:'PERSISTENCE_CLIENT_UNAVAILABLE'};
  adapter.transactionOwner.saveBoundary=(snapshot,context)=>persistenceClient.explicitSave(snapshot,context);
  let autosaveTimer=null,lastAutosave=Promise.resolve({ok:true,status:'NOT_SCHEDULED'}),lastRecovery=Promise.resolve({ok:true,status:'NOT_CAPTURED'});
  const notify=receipt=>{try{onReceipt?.(receipt)}catch{}return receipt};
  const originalTransact=adapter.transact.bind(adapter);
  adapter.transact=(label,mutator,options={})=>{const result=originalTransact(label,mutator,options);if(result?.changed){if(autosaveTimer)clearTimeout(autosaveTimer);autosaveTimer=setTimeout(()=>{autosaveTimer=null;lastAutosave=persistenceClient.autosave(adapter.snapshot(),{baseRevisionId:adapter.committedRevision,workingRevision:adapter.workingRevision,dirty:adapter.dirty,semanticOwner:adapter.transactionOwner.owner}).then(notify)},Math.max(0,Number(autosaveDelayMs)||0))}return result};
  const originalCapture=adapter.captureRecovery.bind(adapter);
  adapter.captureRecovery=(reason='working-change',options={})=>{const record=originalCapture(reason,options),snapshot=adapter.snapshot();lastRecovery=persistenceClient.captureRecovery(snapshot,{recoveryId:record.id,baseRevisionId:adapter.committedRevision,workingRevision:record.workingRevision,reason:record.reason,semanticOwner:adapter.transactionOwner.owner}).then(notify);return record};
  const originalCommit=adapter.commit.bind(adapter);
  adapter.commit=options=>{const result=originalCommit(options);return result&&typeof result.then==='function'?result.then(notify):notify(result)};
  adapter.persistence={
    owner:'StructuredPersistenceConsumerBinding',client:persistenceClient,descriptor:()=>persistenceClient.descriptor(),
    flushAutosave:async()=>{if(autosaveTimer){clearTimeout(autosaveTimer);autosaveTimer=null;lastAutosave=persistenceClient.autosave(adapter.snapshot(),{baseRevisionId:adapter.committedRevision,workingRevision:adapter.workingRevision,dirty:adapter.dirty,semanticOwner:adapter.transactionOwner.owner}).then(notify)}return lastAutosave},
    lastRecovery:()=>lastRecovery,
    listRecovery:()=>persistenceClient.listRecovery(adapter.identity().id),
    restorePersistedRecoveryAsWorking:async recoveryId=>{const recovered=await persistenceClient.readRecovery(recoveryId);if(!recovered?.ok||!recovered.document)return {ok:false,status:'RECOVERY_UNAVAILABLE',receipt:recovered};const document={...recovered.document,id:adapter.identity().id,revision:adapter.committedRevision};const result=adapter.acceptExternalTransaction({document,label:'provider.recovery.restoreAsWorking',source:'StructuredPersistenceConsumerBinding'});return {ok:true,status:'RECOVERY_RESTORED_AS_WORKING',recoveryId,result,dirty:adapter.dirty,committedRevision:adapter.committedRevision}}
  };
  return adapter.persistence;
}

export function createStructuredConsumerAdapter(surface,libraryBundle=null,{document=null,persistenceClient=null,onPersistenceReceipt=null,inputDirectionBridge=null}={}){
  const initial=document?clone(document):structuredConsumerSeed(surface,libraryBundle);
  const adapter=new StructuredDocumentDomainAdapter({owner:surface==='library'?'LibraryDomainAdapter':surface==='learn'?'LearnDomainAdapter':'StructuredFoundationHost',domainKind:surface,document:initial,metadata:surface==='library'?{surface}:{surface,libraryIndependent:true},sourceBinding:{sources:surface==='library'?(initial.sources||[]):surface==='learn'?[{title:'Local learning fixture',kind:'Practice',status:'Unassessed'}]:[]},noteBinding:{route:`PERSONAL:CEP/${surface}`}});
  if(inputDirectionBridge)adapter.inputDirectionResolver.bridge=inputDirectionBridge;
  if(surface==='library')adapter.fixtureBundle=()=>libraryBundle;
  if(persistenceClient)bindStructuredPersistence(adapter,persistenceClient,{onReceipt:onPersistenceReceipt});
  return adapter;
}
