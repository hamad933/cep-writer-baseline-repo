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

export function bindStructuredPersistence(adapter,persistenceClient,{onReceipt=null,autosaveDelayMs=350,autosavePreference=null,recoveryPreference=null}={}){
  if(!adapter||!persistenceClient)return {available:false,reason:'PERSISTENCE_CLIENT_UNAVAILABLE'};
  const operationReceipt=(operation,receipt={},extra={})=>({...(receipt&&typeof receipt==='object'?receipt:{ok:false,status:'INVALID_PROVIDER_RECEIPT'}),...extra,operation});
  const notify=receipt=>{try{onReceipt?.(receipt)}catch{}return receipt};
  const unavailable=(operation,status)=>notify(operationReceipt(operation,{ok:false,status,code:status},{attempted:false,persisted:false,durableCommit:false}));
  const autosaveContext=reason=>({baseRevisionId:adapter.committedRevision,workingRevision:adapter.workingRevision,dirty:adapter.dirty,reason,semanticOwner:adapter.transactionOwner.owner});
  const explicitSave=(snapshot,context)=>{
    if(typeof persistenceClient.explicitSave!=='function')return unavailable('EXPLICIT_SAVE','PERSISTENCE_PROVIDER_UNAVAILABLE');
    let result;try{result=persistenceClient.explicitSave(snapshot,context)}catch(error){return notify(operationReceipt('EXPLICIT_SAVE',{ok:false,status:'EXPLICIT_SAVE_FAILED',code:error?.code||'EXPLICIT_SAVE_FAILED',reason:String(error?.message||error)},{attempted:true,persisted:false,durableCommit:false}))}
    return Promise.resolve(result).then(receipt=>{const durable=receipt?.ok===true&&(receipt?.persisted===true||receipt?.committed===true);return notify(operationReceipt('EXPLICIT_SAVE',{...receipt,ok:durable,persisted:durable},{attempted:true,durableCommit:durable}))},error=>notify(operationReceipt('EXPLICIT_SAVE',{ok:false,status:'EXPLICIT_SAVE_FAILED',code:error?.code||'EXPLICIT_SAVE_FAILED',reason:String(error?.message||error)},{attempted:true,persisted:false,durableCommit:false})));
  };
  adapter.transactionOwner.saveBoundary=explicitSave;
  let autosaveTimer=null,scheduledAutosave=null,lastAutosave=Promise.resolve(operationReceipt('AUTOSAVE_DRAFT_ONLY',{ok:true,status:'NOT_SCHEDULED'},{attempted:false,persisted:false,durableCommit:false})),lastRecovery=Promise.resolve(operationReceipt('RECOVERY_POINT_ONLY',{ok:true,status:'NOT_CAPTURED'},{attempted:false,persisted:false,durableCommit:false}));
  const autosave=async({enabled,reason='working-change'}={})=>{
    if(enabled!==true)return unavailable('AUTOSAVE_DRAFT_ONLY','AUTOSAVE_DISABLED');
    if(typeof persistenceClient.autosave!=='function')return unavailable('AUTOSAVE_DRAFT_ONLY','PERSISTENCE_PROVIDER_UNAVAILABLE');
    let receipt;try{receipt=await persistenceClient.autosave(adapter.snapshot(),autosaveContext(reason))}catch(error){receipt={ok:false,status:'AUTOSAVE_FAILED',code:error?.code||'AUTOSAVE_FAILED',reason:String(error?.message||error)}}
    return notify(operationReceipt('AUTOSAVE_DRAFT_ONLY',receipt,{attempted:true,persisted:false,durableCommit:false,draftStored:receipt?.ok===true}));
  };
  const cancelScheduledAutosave=status=>{
    if(!autosaveTimer)return false;
    clearTimeout(autosaveTimer);autosaveTimer=null;
    scheduledAutosave?.resolve?.(operationReceipt('AUTOSAVE_DRAFT_ONLY',{ok:false,status},{attempted:false,persisted:false,durableCommit:false}));scheduledAutosave=null;
    return true;
  };
  const scheduleAutosave=({enabled,reason='working-change',delayMs=autosaveDelayMs}={})=>{
    cancelScheduledAutosave('AUTOSAVE_SUPERSEDED');
    if(enabled!==true){lastAutosave=Promise.resolve(unavailable('AUTOSAVE_DRAFT_ONLY','AUTOSAVE_DISABLED'));return {ok:false,status:'AUTOSAVE_DISABLED',operation:'AUTOSAVE_DRAFT_ONLY',attempted:false}}
    let resolve;lastAutosave=new Promise(done=>{resolve=done});scheduledAutosave={resolve,reason};
    autosaveTimer=setTimeout(()=>{autosaveTimer=null;const pending=scheduledAutosave;scheduledAutosave=null;autosave({enabled:true,reason}).then(pending.resolve)},Math.max(0,Number(delayMs)||0));
    return {ok:true,status:'AUTOSAVE_SCHEDULED',operation:'AUTOSAVE_DRAFT_ONLY',attempted:false,delayMs:Math.max(0,Number(delayMs)||0)};
  };
  const flushAutosave=async()=>{
    if(autosaveTimer){clearTimeout(autosaveTimer);autosaveTimer=null;const pending=scheduledAutosave;scheduledAutosave=null;const receipt=await autosave({enabled:true,reason:pending?.reason||'flush'});pending?.resolve?.(receipt);lastAutosave=Promise.resolve(receipt)}
    return lastAutosave;
  };
  const captureRecovery=async(reason='working-change',{enabled=true,record=null}={})=>{
    if(enabled!==true)return unavailable('RECOVERY_POINT_ONLY','RECOVERY_DISABLED');
    if(typeof persistenceClient.captureRecovery!=='function')return unavailable('RECOVERY_POINT_ONLY','PERSISTENCE_PROVIDER_UNAVAILABLE');
    const localRecord=record||adapter.transactionOwner.captureRecovery(reason,adapter.identity().id),snapshot=adapter.snapshot();
    let receipt;try{receipt=await persistenceClient.captureRecovery(snapshot,{recoveryId:localRecord.id,baseRevisionId:adapter.committedRevision,workingRevision:localRecord.workingRevision,reason:localRecord.reason,semanticOwner:adapter.transactionOwner.owner})}catch(error){receipt={ok:false,status:'RECOVERY_CAPTURE_FAILED',code:error?.code||'RECOVERY_CAPTURE_FAILED',reason:String(error?.message||error)}}
    return notify(operationReceipt('RECOVERY_POINT_ONLY',receipt,{attempted:true,persisted:false,durableCommit:false,recoveryId:localRecord.id,recoveryRecorded:receipt?.ok===true}));
  };
  const originalTransact=adapter.transact.bind(adapter);
  adapter.transact=(label,mutator,options={})=>{const result=originalTransact(label,mutator,options);if(result?.changed&&typeof autosavePreference==='function')scheduleAutosave({enabled:autosavePreference()===true,reason:label});return result};
  const originalCapture=adapter.captureRecovery.bind(adapter);
  adapter.captureRecovery=(reason='working-change',options={})=>{const record=originalCapture(reason,options),enabled=typeof recoveryPreference==='function'?recoveryPreference()===true:true;lastRecovery=captureRecovery(reason,{enabled,record});return record};
  const originalCommit=adapter.commit.bind(adapter);
  adapter.commit=options=>{const tag=receipt=>({...receipt,operation:'EXPLICIT_SAVE',durableCommit:receipt?.persisted===true});const result=originalCommit(options);return result&&typeof result.then==='function'?result.then(tag):tag(result)};
  adapter.persistence={
    owner:'StructuredPersistenceConsumerBinding',client:persistenceClient,
    descriptor:()=>({...(typeof persistenceClient.descriptor==='function'?persistenceClient.descriptor():{}),operations:['AUTOSAVE_DRAFT_ONLY','EXPLICIT_SAVE','RECOVERY_POINT_ONLY'],autosavePreferenceBound:typeof autosavePreference==='function',recoveryPreferenceBound:typeof recoveryPreference==='function'}),
    autosave,scheduleAutosave,cancelAutosave:()=>cancelScheduledAutosave('AUTOSAVE_CANCELLED'),flushAutosave,lastAutosave:()=>lastAutosave,
    captureRecovery,lastRecovery:()=>lastRecovery,
    listRecovery:()=>typeof persistenceClient.listRecovery==='function'?persistenceClient.listRecovery(adapter.identity().id):Promise.resolve(unavailable('RECOVERY_POINT_ONLY','PERSISTENCE_PROVIDER_UNAVAILABLE')),
    restorePersistedRecoveryAsWorking:async recoveryId=>{if(typeof persistenceClient.readRecovery!=='function')return unavailable('RECOVERY_POINT_ONLY','PERSISTENCE_PROVIDER_UNAVAILABLE');const recovered=await persistenceClient.readRecovery(recoveryId);if(!recovered?.ok||!recovered.document)return {ok:false,status:'RECOVERY_UNAVAILABLE',operation:'RECOVERY_POINT_ONLY',receipt:recovered};const document={...recovered.document,id:adapter.identity().id,revision:adapter.committedRevision};const result=adapter.acceptExternalTransaction({document,label:'provider.recovery.restoreAsWorking',source:'StructuredPersistenceConsumerBinding'});return {ok:true,status:'RECOVERY_RESTORED_AS_WORKING',operation:'RECOVERY_POINT_ONLY',recoveryId,result,dirty:adapter.dirty,committedRevision:adapter.committedRevision}}
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
