const OWNER='LibraryDomainAdapter';
const hasCommand=(registry,id)=>registry?.commands instanceof Map&&registry.commands.has(id);
const register=(registry,id,label,run,available=()=>true)=>{if(!hasCommand(registry,id))registry.register(id,OWNER,label,run,available);return id;};
const unavailable=(code,reason)=>({enabled:false,code,reason,availabilityOwner:OWNER});
export function bindLibrarySurface({commands,structured,libraryRuntime=null,workspace=null}={}){
  if(!commands||!structured)throw Error('LIBRARY_SURFACE_BINDING_REQUIRED');
  if(structured.owner!==OWNER)throw Error('LIBRARY_CANONICAL_ADAPTER_REQUIRED');
  structured.assertCanonicalMutationOwner();structured.assertCanonicalTransactionOwner();structured.assertCanonicalClipboardOwner();structured.assertCanonicalActionDescriptorOwner();structured.assertCanonicalDragDropOwner();
  if(libraryRuntime&&libraryRuntime.structured!==structured)throw Error('LIBRARY_RUNTIME_STRUCTURED_IDENTITY_MISMATCH');
  const ids=[
    register(commands,'library.create','Create Library working document',payload=>libraryRuntime?.create?.(payload)||{ok:false,status:'LIBRARY_CREATE_PROVIDER_UNAVAILABLE',mutated:false},()=>libraryRuntime?.canCreate?.()?true:unavailable('LIBRARY_CREATE_PROVIDER_UNAVAILABLE','Library collection provider is not bound')),
    register(commands,'library.insert','Insert structured block',payload=>({ok:true,status:'INSERTED',document:structured.insertBlock(payload.block,payload.index)}),payload=>structured.availability('document.insertBlock',payload)),
    register(commands,'library.save','Save Library document',payload=>structured.commit(payload),payload=>structured.transactionDescriptor().persistedBoundaryConfigured?structured.availability('document.commit',payload):unavailable('SAVE_BOUNDARY_UNAVAILABLE','A real Library persistence boundary is not bound')),
    register(commands,'library.revise','Create successor Library revision',payload=>libraryRuntime?.revise?.(payload)||{ok:false,status:'LIBRARY_REVISION_PROVIDER_UNAVAILABLE',mutated:false},()=>libraryRuntime?.canRevise?.()?true:unavailable('LIBRARY_REVISION_PROVIDER_UNAVAILABLE','Successor-revision provider is not bound; published content must not be overwritten')),
    register(commands,'library.history','Compare exact Library revisions',payload=>libraryRuntime?.compareRevisions?.(payload)||{ok:false,status:'LIBRARY_EXACT_REVISION_PAIR_REQUIRED',mutated:false},payload=>libraryRuntime?.canCompareRevisions?.(payload)?true:unavailable('LIBRARY_EXACT_REVISION_PAIR_REQUIRED','Two exact revision identities and a comparison provider are required; latest aliases are not accepted'))
  ];
  workspace?.status?.('Library · canonical structured owner bound');
  return {surface:'library',owner:structured.owner,transactionOwner:structured.transactionOwner.owner,commands:ids,persistence:structured.persistence?.descriptor?.()||{available:false,status:'UNCONFIGURED'},consumerTruth:structured.sourceBinding?.truth||structured.metadata?.consumerTruth||'UNBOUND',fixtureClaimed:false};
}
