const clone=value=>value==null?value:structuredClone(value);
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))freeze(child);Object.freeze(value)}return value};
const revisionAfter=value=>{const n=Number(value);return Number.isFinite(n)&&String(n)===String(value).trim()?String(n+1):`${String(value||'0')}.1`};
const exactRef=ref=>ref&&typeof ref==='object'&&String(ref.id||'').trim()&&String(ref.revision||'').trim();
const allowedKinds=new Set(['event','inject','decision','lab','task','rule','observability','completion']);
const facetForKind=kind=>kind==='lab'?'modules':kind==='observability'?'observability':kind==='completion'?'completion':`${kind}s`;

export class W03ScenarioDomain {
  constructor({definition={id:'SCENARIO-DRAFT',revision:'1',title:'',roles:[],environment:{capabilities:[]},phases:[],rules:[],observability:[],completion:[]},persistence=null,status='DRAFT'}={}){
    this.owner='W03ScenarioDomain';this.definition=clone(definition);this.persistence=persistence;this.version=1;this.lifecycle=status;this.validationStatus='UNVALIDATED';this.bindingStatus='UNBOUND';this.receipts=[];this.selection=null;this.publishedRevisions=[];this.sourceLineage=null;
  }
  snapshot(){return freeze({owner:this.owner,version:this.version,status:this.lifecycle,lifecycle:this.lifecycle,validationStatus:this.validationStatus,bindingStatus:this.bindingStatus,selection:clone(this.selection),sourceLineage:clone(this.sourceLineage),definition:clone(this.definition),publishedRevisions:clone(this.publishedRevisions.map(x=>({id:x.id,revision:x.revision,digest:x.digest||null}))),persistence:this.persistence?{status:'DELEGATED'}:{status:'UNAVAILABLE',reason:'Shared persistence not bound in this composition.'}})}
  _assertMutable(){if(this.lifecycle==='PUBLISHED')throw Error('SCENARIO_PUBLISHED_REVISION_IMMUTABLE')}
  _receipt(action,detail={}){const receipt=freeze({owner:this.owner,action,version:this.version,lifecycle:this.lifecycle,...clone(detail)});this.receipts.push(receipt);return receipt}
  _allItems(){return (this.definition.phases||[]).flatMap(phase=>(phase.elements||[]).map(item=>({phaseId:phase.id,...item})))}
  studioProjection(){
    const items=this._allItems(),facets={events:[],injects:[],decisions:[],modules:[],tasks:[],rules:clone(this.definition.rules||[]),observability:clone(this.definition.observability||[]),completion:clone(this.definition.completion||[])};
    for(const item of items){const facet=facetForKind(item.kind);if(facets[facet])facets[facet].push(clone(item))}
    return freeze({owner:this.owner,lifecycle:this.lifecycle,revision:String(this.definition.revision||''),identity:{id:this.definition.id,revision:this.definition.revision},title:this.definition.title||'',roles:clone(this.definition.roles||[]),environment:clone(this.definition.environment||{}),phases:clone(this.definition.phases||[]),facets,selection:this.selectionContext(),sharedOwnerRequirements:['StructuredSurfaceHost','SpatialInteractionKernel','RelationInteractionOwner']});
  }
  selectionContext(){
    if(!this.selection)return freeze({kind:'scenario',id:this.definition.id,title:this.definition.title||'',editable:this.lifecycle!=='PUBLISHED'});
    if(this.selection.kind==='phase'){const phase=(this.definition.phases||[]).find(x=>x.id===this.selection.id);return freeze(phase?{kind:'phase',phaseId:phase.id,id:phase.id,title:phase.name||phase.title||phase.id,editable:this.lifecycle!=='PUBLISHED',object:clone(phase)}:{kind:'missing',id:this.selection.id,editable:false})}
    const item=this._allItems().find(x=>x.id===this.selection.id);return freeze(item?{kind:item.kind,phaseId:item.phaseId,id:item.id,title:item.title||item.id,editable:this.lifecycle!=='PUBLISHED',object:clone(item)}:{kind:'missing',id:this.selection.id,editable:false});
  }
  select(selection=null){this.selection=selection?clone(selection):null;return this.selectionContext()}
  _applyOperation(operation){
    const op=operation?.op;if(!op)throw Error('SCENARIO_AUTHOR_OPERATION_REQUIRED');
    const phases=clone(this.definition.phases||[]);
    if(op==='addPhase'){const phase=clone(operation.phase||{});if(!phase.id)throw Error('SCENARIO_PHASE_ID_REQUIRED');if(phases.some(x=>x.id===phase.id))throw Error('SCENARIO_PHASE_ID_DUPLICATE');phases.push({id:phase.id,name:phase.name||phase.title||'New phase',elements:clone(phase.elements||[])});this.definition={...this.definition,phases};return}
    if(op==='updatePhase'){const i=phases.findIndex(x=>x.id===operation.phaseId);if(i<0)throw Error('SCENARIO_PHASE_NOT_FOUND');phases[i]={...phases[i],...clone(operation.patch||{}),id:phases[i].id};this.definition={...this.definition,phases};return}
    if(op==='reorderPhase'){const i=phases.findIndex(x=>x.id===operation.phaseId),j=Math.max(0,Math.min(phases.length-1,Number(operation.toIndex)));if(i<0)throw Error('SCENARIO_PHASE_NOT_FOUND');const [phase]=phases.splice(i,1);phases.splice(j,0,phase);this.definition={...this.definition,phases};return}
    const pi=phases.findIndex(x=>x.id===operation.phaseId);if(pi<0)throw Error('SCENARIO_PHASE_NOT_FOUND');const elements=clone(phases[pi].elements||[]);
    if(op==='addElement'){const element=clone(operation.element||{});if(!element.id||!allowedKinds.has(element.kind))throw Error('SCENARIO_ELEMENT_SHAPE_INVALID');if(this._allItems().some(x=>x.id===element.id))throw Error('SCENARIO_ELEMENT_ID_DUPLICATE');elements.push(element)}
    else if(op==='updateElement'){const i=elements.findIndex(x=>x.id===operation.elementId);if(i<0)throw Error('SCENARIO_ELEMENT_NOT_FOUND');const patch=clone(operation.patch||{});if(patch.kind&&!allowedKinds.has(patch.kind))throw Error('SCENARIO_ELEMENT_KIND_INVALID');elements[i]={...elements[i],...patch,id:elements[i].id}}
    else if(op==='removeElement'){const i=elements.findIndex(x=>x.id===operation.elementId);if(i<0)throw Error('SCENARIO_ELEMENT_NOT_FOUND');elements.splice(i,1)}
    else if(op==='moveElement'){const i=elements.findIndex(x=>x.id===operation.elementId);if(i<0)throw Error('SCENARIO_ELEMENT_NOT_FOUND');const [item]=elements.splice(i,1),target=phases.findIndex(x=>x.id===operation.targetPhaseId||operation.phaseId);if(target<0)throw Error('SCENARIO_TARGET_PHASE_NOT_FOUND');phases[pi]={...phases[pi],elements};const targetElements=clone(phases[target].elements||[]);targetElements.splice(Math.max(0,Math.min(targetElements.length,Number(operation.toIndex??targetElements.length))),0,item);phases[target]={...phases[target],elements:targetElements};this.definition={...this.definition,phases};return}
    else throw Error('SCENARIO_AUTHOR_OPERATION_UNKNOWN:'+op);
    phases[pi]={...phases[pi],elements};this.definition={...this.definition,phases};
  }
  author(patch={}){
    this._assertMutable();
    if(patch?.op)this._applyOperation(patch);else{for(const key of Object.keys(patch))if(!['title','roles','phases','environment','rules','observability','completion','references'].includes(key))throw Error('SCENARIO_FIELD_OUT_OF_SCOPE:'+key);this.definition={...this.definition,...clone(patch)}}
    this.version++;this.lifecycle='DIRTY';this.validationStatus='UNVALIDATED';this.bindingStatus='UNBOUND';return {receipt:this._receipt('scenarios.author',{operation:patch?.op||'patch'}),snapshot:this.snapshot()}
  }
  publish({digest=null,validationContext={}}={}){if(this.lifecycle==='PUBLISHED')return this.snapshot();const validation=this.validate(validationContext);if(!validation.ok)throw Error('SCENARIO_VALIDATION_REQUIRED_BEFORE_PUBLISH');const frozen=freeze({...clone(this.definition),digest:digest||null});this.publishedRevisions.push(frozen);this.definition=clone(frozen);this.version++;this.lifecycle='PUBLISHED';this.validationStatus='VALIDATED';this.bindingStatus=validation.bindingStatus;return this.snapshot()}
  revise({expectedVersion=this.version}={}){
    if(expectedVersion!==this.version)throw Error('STALE_SCENARIO_VERSION');const source=freeze(clone(this.definition)),sourceLifecycle=this.lifecycle,sourceDigest=this.definition.digest||null;if(sourceLifecycle==='PUBLISHED'&&!this.publishedRevisions.some(item=>item.id===source.id&&item.revision===source.revision))this.publishedRevisions.push(source);this.version++;this.definition={...clone(source),revision:revisionAfter(source.revision),digest:null};this.sourceLineage=freeze({id:source.id,revision:source.revision,digest:sourceDigest,lifecycle:sourceLifecycle});this.lifecycle='DRAFT';this.validationStatus='UNVALIDATED';this.bindingStatus='UNBOUND';return {receipt:this._receipt('scenarios.revise',{sourceLineage:this.sourceLineage,successorRevision:this.definition.revision}),snapshot:this.snapshot(),source:source};
  }
  validate({availableCapabilities=[],resolveLab=null,binding=null}={}){
    const errors=[],results=[],seen=new Set(),phases=this.definition.phases||[];if(!phases.length)errors.push('phases:required');
    const push=(id,ok,code,reason='')=>{results.push({id,status:ok?'PASS':'BLOCKED',code,reason});if(!ok)errors.push(`${id}:${code}`)};
    for(const phase of phases){push(`phase.${phase?.id||'missing'}.identity`,!!phase?.id&&!seen.has(phase.id),'PHASE_ID_INVALID',!phase?.id?'Phase id required':'Phase id duplicated');if(phase?.id)seen.add(phase.id);push(`phase.${phase?.id||'missing'}.name`,!!String(phase?.name||'').trim(),'PHASE_NAME_REQUIRED','Phase name required');for(const item of phase.elements||[]){push(`element.${item?.id||'missing'}.identity`,!!item?.id&&!seen.has(item.id)&&allowedKinds.has(item.kind),'ELEMENT_ID_OR_KIND_INVALID','Element requires unique id and governed kind');if(item?.id)seen.add(item.id);if(item?.kind==='lab'){push(`element.${item.id}.labRef`,!!exactRef(item.labRef),'EXACT_LAB_REVISION_REQUIRED','Portable Lab module must pin id + revision');if(exactRef(item.labRef)){if(typeof resolveLab!=='function')push(`element.${item.id}.labResolved`,false,'LAB_REVISION_RESOLVER_UNBOUND','Pinned Lab revision cannot be treated as resolved without a bound Lab revision resolver');else push(`element.${item.id}.labResolved`,!!resolveLab(item.labRef),'LAB_REVISION_UNAVAILABLE','Pinned Lab revision is unavailable')}}if(item?.kind==='decision')push(`element.${item.id}.condition`,!!String(item.condition||'').trim(),'DECISION_CONDITION_REQUIRED','Decision requires condition')}}
    const required=this.definition.environment?.capabilities||[],available=binding?.capabilities||availableCapabilities||[];for(const cap of required)push(`environment.capability.${cap}`,available.includes(cap),'MISSING_REQUIRED_CAPABILITY',`Required capability ${cap} is unavailable`);
    const requiredDigest=this.definition.environment?.contractDigest||null,boundDigest=binding?.contractDigest||null;if(requiredDigest)push('environment.contractDigest',boundDigest===requiredDigest,'ENVIRONMENT_CONTRACT_DIGEST_MISMATCH',`Expected ${requiredDigest}; got ${boundDigest||'UNBOUND'}`);
    const bindingStatus=errors.some(x=>x.includes('environment.'))?'INCOMPATIBLE':(required.length||requiredDigest)?'COMPATIBLE':'COMPATIBLE';
    return freeze({owner:this.owner,status:errors.length?'VALIDATION_FAILED':'VALIDATED',bindingStatus,ok:!errors.length,errors,requirements:results,mutated:false,queryOnly:true,runtimeProvisioned:false});
  }
  recordValidation(context={}){const validation=this.validate(context);this.validationStatus=validation.status;this.bindingStatus=validation.bindingStatus;const receipt=this._receipt('scenarios.validate',{status:this.validationStatus,bindingStatus:this.bindingStatus,errors:[...validation.errors]});return freeze({...validation,mutated:true,receipt})}
  prepare(context={}){
    if(this.lifecycle!=='PUBLISHED')return freeze({ok:false,code:'SCENARIO_REVISION_NOT_PUBLISHED',reason:'Run preparation requires an exact published Scenario revision.',mutated:false,runStarted:false,deploymentMutated:false,preview:true});
    const validation=this.validate(context);if(!validation.ok)return freeze({ok:false,code:'SCENARIO_VALIDATION_FAILED',validation,mutated:false,runStarted:false,deploymentMutated:false});
    const labRefs=(this.definition.phases||[]).flatMap(p=>(p.elements||[]).filter(x=>x.kind==='lab').map(x=>clone(x.labRef))),manifest=freeze({scenarioRef:{id:this.definition.id,revision:this.definition.revision},environmentRequirements:clone(this.definition.environment||{}),environmentBinding:clone(context.binding||{capabilities:context.availableCapabilities||[]}),labRefs,contractDigest:this.definition.environment?.contractDigest||null,preparedFromLifecycle:this.lifecycle});
    return freeze({ok:true,code:'RUN_INPUT_MANIFEST_READY',inputManifest:manifest,scenarioRef:manifest.scenarioRef,environment:manifest.environmentRequirements,labRefs:manifest.labRefs,bindingStatus:validation.bindingStatus,preview:this.lifecycle!=='PUBLISHED',runStarted:false,deploymentMutated:false,canonicalPublication:false,mutated:false});
  }
}
