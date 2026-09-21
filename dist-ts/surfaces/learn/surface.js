const OWNER='LearnDomainAdapter';
const hasCommand=(registry,id)=>registry?.commands instanceof Map&&registry.commands.has(id);
const register=(registry,id,label,run,available=()=>true)=>{if(!hasCommand(registry,id))registry.register(id,OWNER,label,run,available);return id;};
const combineAvailability=(...rows)=>rows.find(row=>row?.enabled===false)||rows.find(row=>row?.enabled===true)||true;
export function bindLearnSurface({commands,learn,structured,workspace=null}={}){
  if(!commands||!learn||!structured)throw Error('LEARN_SURFACE_BINDING_REQUIRED');
  if(structured.owner!=='LearnAdapter'&&structured.owner!==OWNER)throw Error('LEARN_CANONICAL_ADAPTER_REQUIRED');
  structured.assertCanonicalMutationOwner();structured.assertCanonicalTransactionOwner();
  const ids=[
    register(commands,'learn.open','Open learning activity',()=>learn.openActivity(),()=>learn.sourceAvailability()),
    register(commands,'learn.edit','Edit learning document',payload=>({ok:true,status:'LEARNING_DOCUMENT_EDITED',document:structured.updateBlock(payload.blockId,payload.patch),masteryWrite:false}),payload=>combineAvailability(learn.editability(payload),structured.availability('document.updateBlock',payload))),
    register(commands,'learn.practice','Start, continue, or submit practice',payload=>payload?.action==='submit'?({ok:true,status:'PRACTICE_SUBMITTED',attempt:learn.submit(payload.answer),masteryWrite:false}):({ok:true,status:'PRACTICE_STARTED',attempt:learn.start(),masteryWrite:false}),()=>learn.practiceAvailability()),
    register(commands,'learn.review','Review local learning projection',payload=>learn.review(payload||{}),()=>learn.reviewAvailability())
  ];
  workspace?.status?.(learn.sourceAvailable?'Learn · canonical learning source bound':'Learn · canonical source unavailable · no local fixture truth');
  return {surface:'learn',owner:OWNER,sourceOwner:structured.owner,transactionOwner:structured.transactionOwner.owner,commands:ids,masteryWrite:false,labRuntimeCreated:false,consumerTruth:structured.sourceBinding?.truth||'UNBOUND',fixtureClaimed:false,sourceAvailability:learn.sourceAvailable?'AVAILABLE':'UNAVAILABLE'};
}
