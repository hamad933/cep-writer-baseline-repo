const OWNER='LibraryDomainAdapter';
const hasCommand=(registry,id)=>registry?.commands instanceof Map&&registry.commands.has(id);
const register=(registry,id,label,run,available=()=>true,owner=OWNER)=>{if(!hasCommand(registry,id))registry.register(id,owner,label,run,available);return id;};
const unavailable=(code,reason)=>({enabled:false,code,reason,availabilityOwner:OWNER});
export function bindLibrarySurface({commands,structured,libraryRuntime=null,workspace=null}={}){
  if(!commands||!structured)throw Error('LIBRARY_SURFACE_BINDING_REQUIRED');
  if(structured.owner!==OWNER)throw Error('LIBRARY_CANONICAL_ADAPTER_REQUIRED');
  structured.assertCanonicalMutationOwner();structured.assertCanonicalTransactionOwner();structured.assertCanonicalClipboardOwner();structured.assertCanonicalActionDescriptorOwner();structured.assertCanonicalDragDropOwner();
  if(libraryRuntime&&libraryRuntime.structured!==structured)throw Error('LIBRARY_RUNTIME_STRUCTURED_IDENTITY_MISMATCH');
  const sourceAvailability=()=>libraryRuntime?.sourceAvailability?.()||true;
  const admitted=availability=>{const source=sourceAvailability();return source===true||source?.enabled!==false?availability:source;};
  /* No canonical Library source runtime is bound => there is no published source to protect, so a
     local working revision is admitted through the canonical Structured transaction owner.
     With a runtime bound the successor-revision provider gate below is preserved (S08). */
  const localRevisionAvailability=payload=>{
    if(libraryRuntime)return libraryRuntime.canRevise?.()?true:unavailable('LIBRARY_REVISION_PROVIDER_UNAVAILABLE','Successor-revision provider is not bound; published content must not be overwritten');
    if(!payload||typeof payload.title!=='string')return unavailable('LIBRARY_REVISION_TITLE_REQUIRED','No canonical Library source runtime is bound; a local working revision requires an explicit title.');
    return admitted(structured.availability('document.updateTitle',payload));
  };
  const localRevision=payload=>{
    if(!payload||typeof payload.title!=='string')return {ok:false,status:'LIBRARY_REVISION_TITLE_REQUIRED',mutated:false,persisted:false};
    const document=structured.updateTitle(payload.title);
    return {ok:true,changed:true,status:'LOCAL_WORKING_REVISION_CREATED',owner:structured.transactionOwner.owner,transactionOwner:structured.transactionOwner.owner,document,canonicalMutation:false,canonicalSourceBound:false,persisted:false};
  };
  const ids=[
    register(commands,'library.create','Create Library working document',payload=>libraryRuntime?.create?.(payload)||{ok:false,status:'LIBRARY_CREATE_PROVIDER_UNAVAILABLE',mutated:false},()=>libraryRuntime?.canCreate?.()?true:unavailable('LIBRARY_CREATE_PROVIDER_UNAVAILABLE','Library collection provider is not bound')),
    register(commands,'library.insert','Insert structured block',payload=>({ok:true,status:'INSERTED',document:structured.insertBlock(payload.block,payload.index)}),payload=>admitted(structured.availability('document.insertBlock',payload))),
    register(commands,'library.save','Save Library document',payload=>structured.commit(payload),payload=>admitted(structured.availability('document.commit',payload))),
    register(commands,'library.revise','Create successor Library revision',payload=>libraryRuntime?(libraryRuntime.revise?.(payload)||{ok:false,status:'LIBRARY_REVISION_PROVIDER_UNAVAILABLE',mutated:false}):localRevision(payload),localRevisionAvailability),
    register(commands,'library.history','Compare exact Library revisions',payload=>libraryRuntime?.compareRevisions?.(payload)||{ok:false,status:'LIBRARY_EXACT_REVISION_PAIR_REQUIRED',mutated:false},payload=>libraryRuntime?.canCompareRevisions?.(payload)?true:unavailable('LIBRARY_EXACT_REVISION_PAIR_REQUIRED','Two exact revision identities and a comparison provider are required; latest aliases are not accepted'),'StructuredTransactionHistoryRecoveryOwner')
  ];
  workspace?.status?.('Library · canonical structured owner bound');
  const source=sourceAvailability();
  return {surface:'library',owner:structured.owner,transactionOwner:structured.transactionOwner.owner,commands:ids,sourceAvailability:source,persistence:structured.persistence?.descriptor?.()||{available:false,status:'UNCONFIGURED'},consumerTruth:structured.sourceBinding?.truth||structured.metadata?.consumerTruth||'UNBOUND',fixtureClaimed:false};
}
