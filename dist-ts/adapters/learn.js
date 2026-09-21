import {StructuredDocumentDomainAdapter} from '../foundation/structured.js';
import {StructuredNavigationDescriptorOwner,createStructuredOutlinePresentationDescriptor} from '../foundation/structured/outline-descriptor.js';
import {renderStructuredOutline,resolveStructuredOutlineKeyboardIntent} from '../foundation/structured/outline-host.js';

const clone=value=>structuredClone(value);
const unsafeTruth=value=>/(FIXTURE|DEMO|SYNTHETIC|HARNESS|PROOF)/i.test(String(value||''));
const unavailableDocument=()=>({id:'learn-unavailable',revision:'UNAVAILABLE',title:'Learning source unavailable',tags:['Learning','Unavailable'],blocks:[{id:'learn-unavailable-p1',type:'paragraph',html:'Learning source is not bound. This placeholder is not canonical learning content and is not editable.'}]});
const normalizeSource=source=>{
  if(!source)return {available:false,truth:'UNAVAILABLE_PROVIDER_UNBOUND',classification:'UNAVAILABLE',providerRef:null,activity:{id:'learn-unavailable',revision:1,title:'Learning source unavailable',kind:'unavailable',editable:false,prerequisiteState:'UNKNOWN'},document:unavailableDocument()};
  if(unsafeTruth(source.classification)||unsafeTruth(source.truth))throw Error('LEARN_FIXTURE_OR_SYNTHETIC_SOURCE_FORBIDDEN');
  if(!source.activity?.id||source.activity.revision===undefined||!source.document?.id||!source.document?.revision||!Array.isArray(source.document?.blocks))throw Error('LEARN_EXACT_CANONICAL_SOURCE_REQUIRED');
  return {available:true,truth:String(source.truth||'BOUND_CANONICAL_LEARNING_SOURCE'),classification:String(source.classification||'PRODUCT_RUNTIME_BOUND_SOURCE'),providerRef:source.providerRef||null,activity:clone(source.activity),document:clone(source.document)};
};

/** Thin Learn-domain owner. Shared workbench/editor mechanics remain Foundation-owned. */
export class LearnAdapter {
  constructor({source=null}={}){
    this.source=normalizeSource(source);this.sourceAvailable=this.source.available;
    this.activity=clone(this.source.activity);this.attempt=null;this.progress='INCOMPLETE';this.sequence=0;this.structured=null;this.navigation=null;
  }
  createStructuredAdapter(){
    if(this.structured)return this.structured;
    const document=clone(this.source.document);
    this.structured=new StructuredDocumentDomainAdapter({
      owner:'LearnAdapter',domainKind:'learn',document,
      metadata:{surface:'learn',domainOwner:'LearnAdapter',activityId:this.activity.id,activityRevision:this.activity.revision,libraryIndependent:false,persistence:'UNCONFIGURED_LOCAL_WORKING_STATE',consumerTruth:this.source.truth,sourceAvailability:this.sourceAvailable?'AVAILABLE':'UNAVAILABLE'},
      sourceBinding:{sources:this.sourceAvailable?[{id:this.activity.id,title:this.activity.title,kind:'LearningActivity',revision:this.activity.revision,status:'BOUND'}]:[],truth:this.source.truth,classification:this.source.classification,providerRef:this.source.providerRef},
      noteBinding:{route:'PERSONAL:CEP/W02/learn'}
    });
    this.navigation=new StructuredNavigationDescriptorOwner({adapter:this.structured});
    return this.structured;
  }
  sourceAvailability(){return this.sourceAvailable?{enabled:true,code:'AVAILABLE',reason:'',availabilityOwner:'LearnAdapter'}:{enabled:false,code:'LEARN_CANONICAL_SOURCE_UNAVAILABLE',reason:'No canonical learning-object source is bound; local fallback content is not product truth.',availabilityOwner:'LearnAdapter'};}
  outlineDescriptor({query=''}={}){
    if(!this.structured)this.createStructuredAdapter();
    const selected=new Set(this.structured.selectedFragmentIdentity?.().blockIds||[]),outline=this.navigation.outline();
    const project=item=>({id:item.descriptorId,kind:item.kind,label:item.label,iconKey:item.kind==='heading'?'i-book':'i-chev',secondary:[{text:item.target.blockId,direction:'ltr',element:'bdi'}],selected:selected.has(item.target.blockId),current:selected.has(item.target.blockId),expanded:true,forceExpanded:true,activationDataset:{blockId:item.target.blockId},children:(item.children||[]).map(project)});
    return createStructuredOutlinePresentationDescriptor({mode:'hierarchy',ariaLabel:'Learn structured document outline',query,nodes:outline.hierarchy.map(project),summary:{kind:'count',text:`${outline.count} navigation item(s)`}});
  }
  mountOutline(host,{query='',onActivate=null}={}){
    if(!host)throw Error('LEARN_OUTLINE_HOST_REQUIRED');
    const render=()=>renderStructuredOutline(host,this.outlineDescriptor({query}),{document:host.ownerDocument});
    const activate=item=>{const blockId=item?.dataset?.blockId;if(!blockId)return false;this.structured.selectBlocks([blockId]);onActivate?.(blockId);return true;};
    host.onclick=event=>{const item=event.target.closest?.('.treeitem');if(item)activate(item)};
    host.onkeydown=event=>{const item=event.target.closest?.('.treeitem');if(!item)return;const items=[...host.querySelectorAll('.treeitem')],branch=item.closest('.treebranch'),children=branch?.querySelector(':scope > .treechildren'),parentBranch=branch?.parentElement?.closest?.('.treebranch'),parentId=parentBranch?.querySelector(':scope > .treeitem')?.dataset?.treeId||null;const intent=resolveStructuredOutlineKeyboardIntent({key:event.key,item,items,hasChildren:!!children,expanded:item.getAttribute('aria-expanded')==='true',parentId});if(!intent.handled)return;event.preventDefault();if(intent.action==='focus')intent.target?.focus();else if(intent.action==='focus-id')host.querySelector(`[data-tree-id="${CSS.escape(intent.targetId)}"]`)?.focus();else if(intent.action==='activate')activate(item);};
    return render();
  }
  openActivity(){const availability=this.sourceAvailability();if(!availability.enabled)return {ok:false,status:availability.code,reason:availability.reason,masteryWrite:false};const before=this.learningProgress();return {ok:true,status:'LEARNING_ACTIVITY_OPEN',activity:clone(this.activity),prerequisiteNavigationLocked:false,progressBefore:before.state,progressAfter:this.learningProgress().state,masteryWrite:false};}
  editability(){const source=this.sourceAvailability();if(!source.enabled)return source;if(this.activity.editable!==true)return {enabled:false,code:'LEARN_ACTIVITY_NOT_EDITABLE',reason:'Selected learning object does not permit Structured authoring',availabilityOwner:'LearnAdapter'};return {enabled:true,code:'AVAILABLE',reason:'',availabilityOwner:'LearnAdapter'};}
  practiceAvailability(){const source=this.sourceAvailability();if(!source.enabled)return source;return {enabled:true,code:'AVAILABLE',reason:'',availabilityOwner:'LearnAdapter'};}
  reviewAvailability(){const source=this.sourceAvailability();if(!source.enabled)return source;if(!this.attempt)return {enabled:false,code:'LEARN_ATTEMPT_REQUIRED',reason:'A current exact learning attempt is required.',availabilityOwner:'LearnAdapter'};return {enabled:true,code:'AVAILABLE',reason:'',availabilityOwner:'LearnAdapter'};}
  start(){if(!this.attempt||this.attempt.state==='SUBMITTED')this.attempt={id:`attempt-${++this.sequence}`,activityId:this.activity.id,activityRevision:this.activity.revision,revision:this.activity.revision,actor:'LOCAL_SESSION',state:'IN_PROGRESS',answer:'',sourceSnapshot:{activityId:this.activity.id,activityRevision:this.activity.revision,title:this.activity.title,kind:this.activity.kind}};this.progress='INCOMPLETE';return clone(this.attempt);}
  submit(answer){if(!this.attempt)throw Error('START_REQUIRED');if(this.attempt.state==='SUBMITTED')return this.attempt;if(!String(answer||'').trim())throw Error('ANSWER_REQUIRED');this.attempt={...this.attempt,state:'SUBMITTED',answer:String(answer),feedback:'Recorded in this local session; no external assessment, grading, persistence, or Mastery inference.',score:'NOT_INFERRED'};this.progress='COMPLETE';return this.attempt;}
  review({attemptId=this.attempt?.id}={}){if(!this.sourceAvailable)return {ok:false,status:'LEARN_CANONICAL_SOURCE_UNAVAILABLE',masteryWrite:false,formalReviewCreated:false};if(!this.attempt||!attemptId||String(attemptId)!==String(this.attempt.id)||this.attempt.activityId!==this.activity.id)return {ok:false,status:'LEARN_EXACT_ATTEMPT_ACTIVITY_PAIR_REQUIRED',masteryWrite:false,formalReviewCreated:false};return {ok:true,status:'LOCAL_LEARNING_REVIEW',attempt:clone(this.attempt),progress:this.learningProgress(),assessment:this.assessmentDescriptor(),mastery:'NOT_INFERRED',masteryWrite:false,formalReviewCreated:false,w04DecisionCreated:false};}
  learningProgress(){const attempt=this.attempt,sameActivity=!!attempt&&attempt.activityId===this.activity.id,sameRevision=sameActivity&&attempt.activityRevision===this.activity.revision,countsForCurrentCompletion=this.sourceAvailable&&!!attempt&&sameRevision&&attempt.state==='SUBMITTED'&&this.progress==='COMPLETE';const attemptTruth=!this.sourceAvailable?'SOURCE_UNAVAILABLE':!attempt?'NO_ATTEMPT':!sameActivity?'STALE_ACTIVITY_ATTEMPT':!sameRevision?'STALE_REVISION_ATTEMPT':attempt.state==='SUBMITTED'?'CURRENT_REVISION_SUBMITTED':'CURRENT_REVISION_IN_PROGRESS';return {activityId:this.activity.id,activityRevision:this.activity.revision,state:countsForCurrentCompletion?'COMPLETE':'INCOMPLETE',scope:'LEARNING_PROJECTION',sourceTruth:this.source.truth,mastery:'NOT_INFERRED',persisted:false,attemptTruth,attempt:attempt?{id:attempt.id,activityId:attempt.activityId,activityRevision:attempt.activityRevision,state:attempt.state,historicalProgress:this.progress,countsForCurrentCompletion}:null};}
  recommendation(){if(!this.sourceAvailable)return 'Bind a canonical learning source to continue.';if(!this.attempt)return 'Start a practice attempt when ready.';if(this.attempt.state==='IN_PROGRESS')return 'Continue editing, then submit when ready.';return 'Review the local feedback or start a new attempt.';}
  assessmentDescriptor(){return {kind:'ASSESSMENT_BRIEF',availability:this.sourceAvailable?'LOCAL_BRIEF_ONLY':'UNAVAILABLE',gradingProvider:'UNAVAILABLE',masteryWrite:false,w04DecisionCreated:false};}
  labDescriptor(){return {kind:'LAB_LEARNING_BRIEF',runtime:'NOT_CREATED',operationalAdapter:'UNBOUND',w03RuntimeCreated:false};}
}

export function createLearnRuntimeComposition({source=null}={}){const learn=new LearnAdapter({source}),structured=learn.createStructuredAdapter();return {learn,structured,descriptor:{owner:'LearnAdapter',domainKind:'learn',structuredOwner:structured.owner,sourceTruth:structured.sourceBinding?.truth||null,sourceAvailability:learn.sourceAvailable?'AVAILABLE':'UNAVAILABLE',realConsumer:learn.sourceAvailable,fixtureFallback:false}};}
