const clone=value=>value==null?value:structuredClone(value);
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))freeze(child);Object.freeze(value)}return value};
const normalizedAuthoring=value=>['DRAFT','DIRTY','VALIDATED','PUBLISHED'].includes(value)?value:'DRAFT';
const classification=value=>String(value||'').toLowerCase().includes('simulation')?'SIMULATION_LOCAL':'ENTERPRISE_BACKED';

/**
 * Enterprise/Digital-Twin domain owner.
 * Shared Spatial/Relation mechanics remain external; this class owns only W03 Enterprise lifecycle truth.
 */
export class W03EnterpriseDomain {
  constructor({
    relationAdapter,
    baseline={status:'UNAVAILABLE',id:null,revision:null,digest:null},
    persistence=null,
    authoring=null,
    revisionId=null,
    twinId=null
  }={}){
    if(!relationAdapter?.commit||!relationAdapter?.project)throw Error('ENTERPRISE_RELATION_ADAPTER_REQUIRED');
    this.owner='W03EnterpriseDomain';
    this.relations=relationAdapter;
    this.persistence=persistence;
    this.version=1;
    this.revisionId=revisionId||relationAdapter.revisionId||'ENT-REV-LOCAL-1';
    this.enterpriseId=relationAdapter.enterpriseId||null;
    this.twinId=twinId||relationAdapter.twinId||null;
    this.authoring=normalizedAuthoring(authoring||(/PUBLISHED/i.test(this.revisionId)?'PUBLISHED':'DRAFT'));
    this.dirty=this.authoring==='DIRTY';
    const baselineStatus=baseline.status||'UNAVAILABLE';
    const sourceDigest=baseline.digest||(baselineStatus==='AVAILABLE'?relationAdapter.sourceDigest:null)||null;
    this.baseline=freeze({...clone(baseline),digest:sourceDigest,status:baselineStatus});
    this.baselines=[this.baseline];
    this.twinBinding=this.baseline.status==='STALE'?'BASELINE_STALE':this.baseline.status==='AVAILABLE'?'BOUND':'DETACHED';
    this.selection=freeze({kind:'NONE',id:null});
    this.receipts=[];
    this.revisionLineage=[];
    this.publishedRevisions=[];
    if(this.authoring==='PUBLISHED')this.#recordPublishedRevision({reason:'constructor-published-state'});
  }

  #objects(){return (this.relations.nodes||[]).map(node=>freeze({...clone(node),classification:classification(node.source),canonicalEnterpriseInventory:classification(node.source)==='ENTERPRISE_BACKED'}))}
  #currentRevisionRecord(){return freeze({revisionId:this.revisionId,version:this.version,authoring:this.authoring,enterpriseId:this.enterpriseId,twinId:this.twinId,baselineId:this.baseline.id,baselineRevision:this.baseline.revision,baselineDigest:this.baseline.digest,relationVersion:this.relations.version,relationCount:this.relations.project().length})}
  #recordPublishedRevision({reason='publish'}={}){const existing=this.publishedRevisions.find(item=>item.revisionId===this.revisionId);if(existing)return existing;const record=freeze({...this.#currentRevisionRecord(),authoring:'PUBLISHED',reason});this.publishedRevisions.push(record);return record}
  #assertDraftMutation(){if(this.authoring==='PUBLISHED')throw Error('PUBLISHED_REVISION_IMMUTABLE__CREATE_SUCCESSOR_REVISION')}
  #selectionFor(id){if(!id)return freeze({kind:'NONE',id:null});const node=(this.relations.nodes||[]).find(item=>item.id===id);if(node)return freeze({kind:'DEVICE',id:node.id,object:clone(node),classification:classification(node.source)});const relation=this.relations.project().find(item=>item.id===id);if(relation)return freeze({kind:'LINK',id:relation.id,relation:clone(relation)});return freeze({kind:'NONE',id:null})}
  #validationErrors(){
    const errors=[];
    if(!this.enterpriseId)errors.push('ENTERPRISE_ID_REQUIRED');
    if(!this.revisionId)errors.push('ENTERPRISE_REVISION_REQUIRED');
    if(this.baseline.status!=='AVAILABLE'||!this.baseline.id||!this.baseline.revision||!this.baseline.digest)errors.push('PINNED_BASELINE_IDENTITY_REQUIRED');
    return errors;
  }
  #markDraftMutation(){
    if(this.authoring==='VALIDATED')this.authoring='DIRTY';
    if(this.authoring!=='PUBLISHED')this.dirty=true;
  }

  snapshot(){
    const objects=this.#objects();
    const selected=this.selection.id?this.#selectionFor(this.selection.id):freeze({kind:'NONE',id:null});
    return freeze({
      owner:this.owner,
      workspaceInteraction:'WORKSPACE_FIRST',
      surfaceReadOnly:false,
      version:this.version,
      revisionId:this.revisionId,
      authoring:this.authoring,
      enterpriseId:this.enterpriseId,
      twinId:this.twinId,
      twinBinding:this.twinBinding,
      baseline:clone(this.baseline),
      baselines:clone(this.baselines),
      dirty:this.dirty,
      selection:selected,
      objects,
      relationVersion:this.relations.version,
      relations:this.relations.project(),
      lineage:clone(this.revisionLineage),
      publishedRevisions:clone(this.publishedRevisions),
      sourceTruth:freeze({classification:this.relations.sourceClassification||'UNCLASSIFIED',canonicalProductTruth:this.relations.canonicalProductTruth===true}),
      persistence:this.persistence?{status:'DELEGATED'}:{status:'UNAVAILABLE',reason:'No surface-local persistence owner; use the shared persistence boundary.'}
    })
  }

  inspect(payload={}){
    this.selection=this.#selectionFor(payload?.id||payload?.objectId||null);
    const receipt=freeze({owner:this.owner,action:'enterprise.inspect',selection:clone(this.selection)});
    this.receipts.push(receipt);
    return this.snapshot();
  }

  create({enterpriseId=undefined,twinId=undefined,revisionId=undefined}={}){
    if(this.authoring==='PUBLISHED')return freeze({ok:false,code:'PUBLISHED_REVISION_IMMUTABLE__CREATE_SUCCESSOR_REVISION',mutated:false});
    const nextEnterpriseId=enterpriseId!==undefined?(enterpriseId?String(enterpriseId).trim():null):this.enterpriseId;
    if(!nextEnterpriseId)return freeze({ok:false,code:'ENTERPRISE_ID_REQUIRED',reason:'Enterprise working revision requires an enterpriseId.',mutated:false});
    const nextRevisionId=revisionId!==undefined?(revisionId?String(revisionId).trim():null):this.revisionId;
    if(!nextRevisionId)return freeze({ok:false,code:'ENTERPRISE_REVISION_REQUIRED',reason:'Enterprise working revision requires a revisionId.',mutated:false});
    const nextTwinId=twinId!==undefined?(twinId?String(twinId).trim():null):this.twinId;
    const twinIdentityChanged=nextTwinId!==this.twinId;
    const mutated=nextEnterpriseId!==this.enterpriseId||twinIdentityChanged||nextRevisionId!==this.revisionId;
    this.enterpriseId=nextEnterpriseId;
    this.twinId=nextTwinId;
    this.revisionId=nextRevisionId;
    if(twinIdentityChanged)this.twinBinding='DETACHED';
    if(mutated){this.#markDraftMutation();this.version++}
    const receipt=freeze({owner:this.owner,action:'enterprise.create',enterpriseId:this.enterpriseId,twinId:this.twinId,revisionId:this.revisionId,canonicalPublication:false});
    this.receipts.push(receipt);
    return freeze({ok:true,mutated,receipt,snapshot:this.snapshot()});
  }

  pinBaseline({baseline}={}){
    if(this.authoring==='PUBLISHED')return freeze({ok:false,code:'PUBLISHED_REVISION_IMMUTABLE__CREATE_SUCCESSOR_REVISION',mutated:false});
    if(!baseline?.id||!baseline?.revision||!baseline?.digest||baseline?.status!=='AVAILABLE')return freeze({ok:false,code:'PINNED_BASELINE_IDENTITY_REQUIRED',mutated:false});
    const pinned=freeze({status:'AVAILABLE',id:String(baseline.id),revision:String(baseline.revision),digest:String(baseline.digest)});
    const mutated=pinned.id!==this.baseline.id||pinned.revision!==this.baseline.revision||pinned.digest!==this.baseline.digest||this.baseline.status!=='AVAILABLE';
    const priorTwinBinding=this.twinBinding;
    this.baseline=pinned;
    if(!this.baselines.some(item=>item.id===pinned.id&&item.revision===pinned.revision&&item.digest===pinned.digest))this.baselines.push(pinned);
    this.twinBinding=!this.twinId?'DETACHED':mutated?'DETACHED':priorTwinBinding;
    if(mutated){this.#markDraftMutation();this.version++}
    const receipt=freeze({owner:this.owner,action:'enterprise.baseline',baseline:clone(pinned),canonicalPublication:false});
    this.receipts.push(receipt);
    return freeze({ok:true,mutated,receipt,snapshot:this.snapshot()});
  }

  validate(){
    const errors=this.#validationErrors();
    if(errors.length)return freeze({ok:false,status:'VALIDATION_FAILED',errors,mutated:false,canonicalPublication:false,snapshot:this.snapshot()});
    if(this.authoring==='PUBLISHED')return freeze({ok:true,status:'PUBLISHED',errors:[],mutated:false,canonicalPublication:false,snapshot:this.snapshot()});
    const mutated=this.authoring!=='VALIDATED'||this.dirty;
    if(mutated){this.authoring='VALIDATED';this.dirty=false;this.version++}
    const receipt=freeze({owner:this.owner,action:'enterprise.validate',revisionId:this.revisionId,authoring:this.authoring,baselineDigest:this.baseline.digest,canonicalPublication:false});
    this.receipts.push(receipt);
    return freeze({ok:true,status:'VALIDATED',errors:[],mutated,receipt,snapshot:this.snapshot(),canonicalPublication:false});
  }

  publish(){
    if(this.authoring==='PUBLISHED')return freeze({ok:true,mutated:false,snapshot:this.snapshot()});
    const errors=this.#validationErrors();
    if(this.authoring!=='VALIDATED'||errors.length)return freeze({ok:false,code:'ENTERPRISE_VALIDATION_REQUIRED_BEFORE_PUBLISH',validation:freeze({ok:errors.length===0,status:errors.length?'VALIDATION_FAILED':'VALIDATION_REQUIRED',errors}),mutated:false});
    this.authoring='PUBLISHED';this.dirty=false;this.version++;
    const published=this.#recordPublishedRevision({reason:'explicit-publish'});
    const receipt=freeze({owner:this.owner,action:'enterprise.publish',revisionId:this.revisionId,baselineDigest:this.baseline.digest,canonicalPublication:false});
    this.receipts.push(receipt);
    return freeze({ok:true,mutated:true,published,receipt,snapshot:this.snapshot()});
  }

  edit(payload={}){
    this.#assertDraftMutation();
    const before=this.relations.version;
    const baselineDigest=this.baseline.digest;
    const relation=this.relations.commit({...payload,expectedVersion:payload?.expectedVersion??before});
    this.authoring='DIRTY';this.dirty=true;this.version++;
    if(this.baseline.digest!==baselineDigest)throw Error('BASELINE_IMMUTABILITY_BREACH');
    const receipt=freeze({owner:this.owner,action:'enterprise.edit',relationId:relation.id,relationVersion:this.relations.version,authoring:this.authoring,baselineDigest});
    this.receipts.push(receipt);
    return {relation,receipt,snapshot:this.snapshot()};
  }

  /** Creates a successor working revision and never mutates the source revision or pinned baseline. */
  revise({expectedVersion=this.version,reason='explicit successor revision'}={}){
    if(expectedVersion!==this.version)throw Error('STALE_ENTERPRISE_VERSION');
    if(this.authoring!=='PUBLISHED')return freeze({ok:false,code:'SOURCE_REVISION_NOT_PUBLISHED',reason:'A successor revision is created only from an immutable published source revision.',mutated:false,snapshot:this.snapshot()});
    const source=freeze({...this.#currentRevisionRecord(),authoring:this.authoring});
    const sourceBaselineDigest=this.baseline.digest;
    this.#recordPublishedRevision({reason:'source-of-successor'});
    this.version++;
    this.revisionId=`ENT-REV-LOCAL-${String(this.version).padStart(3,'0')}-DRAFT`;
    this.authoring='DRAFT';this.dirty=false;
    const lineage=freeze({sourceRevisionId:source.revisionId,sourceVersion:source.version,sourceAuthoring:source.authoring,successorRevisionId:this.revisionId,reason,sourceBaselineDigest});
    this.revisionLineage.push(lineage);
    if(this.baseline.digest!==sourceBaselineDigest)throw Error('BASELINE_IMMUTABILITY_BREACH');
    const receipt=freeze({owner:this.owner,action:'enterprise.revise',revisionId:this.revisionId,lineage});
    this.receipts.push(receipt);
    return {ok:true,mutated:true,receipt,source,snapshot:this.snapshot()};
  }

  /**
   * Twin binding/rebase. Overlay classification is mandatory so Simulation-local
   * objects can never be silently promoted into Enterprise inventory.
   */
  setTwinBinding(payload={}){
    const action=payload.action||'setBindingState';
    const identityChange=
      (payload.baselineId!==undefined&&String(payload.baselineId)!==String(this.baseline.id))||
      (payload.baselineRevision!==undefined&&String(payload.baselineRevision)!==String(this.baseline.revision))||
      (payload.baselineDigest!==undefined&&String(payload.baselineDigest)!==String(this.baseline.digest));
    if(this.authoring==='PUBLISHED'&&(['rebaseTwin','createTwin'].includes(action)||identityChange))return freeze({ok:false,code:'PUBLISHED_REVISION_IMMUTABLE__CREATE_SUCCESSOR_REVISION',reason:'Published Enterprise/Twin revisions and their pinned Baseline identity are immutable. Create a successor revision before rebasing or changing the Baseline pin.',mutated:false,revisionId:this.revisionId,baseline:clone(this.baseline)});

    if(['rebaseTwin','createTwin'].includes(action)){
      if(action==='createTwin'&&this.twinId)return freeze({ok:false,code:'TWIN_ALREADY_EXISTS',reason:'Create Twin is available only when no Twin identity is bound.',mutated:false});
      if(action==='rebaseTwin'&&this.twinBinding!=='BASELINE_STALE')return freeze({ok:false,code:'TWIN_REBASE_REQUIRES_STALE_BASELINE',reason:'Rebase is available only after baseline staleness is established by source/provider truth.',mutated:false});
      const refs=Array.isArray(payload.overlayRefs)?payload.overlayRefs:[];
      const invalid=refs.filter(ref=>!['ENTERPRISE_BACKED','SIMULATION_LOCAL'].includes(ref?.classification));
      if(invalid.length||refs.length===0)return freeze({ok:false,code:'OVERLAY_CLASSIFICATION_REQUIRED',reason:'Every overlay reference must explicitly classify Enterprise-backed versus Simulation-local.',mutated:false,invalidCount:invalid.length});
      if(payload.conflictsResolved!==true)return freeze({ok:false,code:'TWIN_REBASE_CONFLICT_RESOLUTION_REQUIRED',reason:'Twin binding remains a preview until conflicts are explicitly resolved.',mutated:false});
      const target=payload.targetBaseline;
      if(!target?.id||!target?.revision||!target?.digest)return freeze({ok:false,code:'PINNED_BASELINE_IDENTITY_REQUIRED',reason:'Twin binding requires exact target baseline identity and digest.',mutated:false});
      const requestedTwinId=action==='createTwin'?String(payload.twinId||'').trim():this.twinId;
      if(!requestedTwinId)return freeze({ok:false,code:'TWIN_ID_REQUIRED',reason:'Create Twin requires an explicit Twin identity.',mutated:false});
      const beforeSimulationLocal=this.#objects().filter(item=>item.classification==='SIMULATION_LOCAL').map(item=>item.id).sort();
      const immutableTarget=freeze({status:'AVAILABLE',id:String(target.id),revision:String(target.revision),digest:String(target.digest)});
      if(!this.baselines.some(item=>item.id===immutableTarget.id&&item.revision===immutableTarget.revision&&item.digest===immutableTarget.digest))this.baselines.push(immutableTarget);
      this.baseline=immutableTarget;this.twinId=requestedTwinId;this.twinBinding='BOUND';this.#markDraftMutation();this.version++;
      const afterSimulationLocal=this.#objects().filter(item=>item.classification==='SIMULATION_LOCAL').map(item=>item.id).sort();
      if(JSON.stringify(beforeSimulationLocal)!==JSON.stringify(afterSimulationLocal))throw Error('SIMULATION_LOCAL_PROMOTION_BREACH');
      const receipt=freeze({owner:this.owner,action:'enterprise.twin',operation:action,twinId:this.twinId,baselineId:this.baseline.id,baselineRevision:this.baseline.revision,baselineDigest:this.baseline.digest,conflictsResolved:true,simulationLocalPreserved:afterSimulationLocal});
      this.receipts.push(receipt);
      return {ok:true,mutated:true,receipt,snapshot:this.snapshot()};
    }

    // Provider/domain-state synchronization path. This is not exposed as a UI command.
    const nextStatus=payload.baselineStatus||this.baseline.status;
    const next=freeze({
      status:nextStatus,
      id:payload.baselineId||this.baseline.id,
      revision:payload.baselineRevision||this.baseline.revision,
      digest:payload.baselineDigest||this.baseline.digest
    });
    this.baseline=next;
    if(!this.baselines.some(item=>item.id===next.id&&item.revision===next.revision&&item.digest===next.digest))this.baselines.push(next);
    this.twinBinding=next.status==='STALE'?'BASELINE_STALE':next.status==='AVAILABLE'&&this.twinId?'BOUND':'DETACHED';
    const receipt=freeze({owner:this.owner,action:'enterprise.twin',operation:action,twinBinding:this.twinBinding,baselineId:next.id});
    this.receipts.push(receipt);
    return this.snapshot();
  }

  commandAvailability(id,payload={}){
    if(['enterprise.create','enterprise.baseline','enterprise.validate','enterprise.publish'].includes(id)){
      if(['enterprise.create','enterprise.baseline'].includes(id)&&this.authoring==='PUBLISHED')return {enabled:false,code:'PUBLISHED_REVISION_IMMUTABLE',reason:'Create a successor revision before changing Enterprise identity or baseline.',availabilityOwner:this.owner};
      if(id==='enterprise.validate'&&this.authoring==='PUBLISHED')return {enabled:false,code:'REVISION_ALREADY_PUBLISHED',reason:'Published revision is immutable; validation applies to the working successor revision.',availabilityOwner:this.owner};
      if(id==='enterprise.publish'){
        const errors=this.#validationErrors();
        if(this.authoring!=='VALIDATED'||errors.length)return {enabled:false,code:'ENTERPRISE_VALIDATION_REQUIRED_BEFORE_PUBLISH',reason:'Explicit successful validation and an exact Baseline pin are required before publication.',availabilityOwner:this.owner};
      }
      return true;
    }
    if(id==='enterprise.edit'){
      if(this.authoring==='PUBLISHED')return {enabled:false,code:'PUBLISHED_REVISION_IMMUTABLE',reason:'Published Enterprise/Twin revisions are immutable. Create a successor revision before editing.',availabilityOwner:this.owner};
      const ids=[payload?.source,payload?.target].filter(Boolean);
      if(ids.length===2)return this.relations.connectionAvailability?.(ids)||true;
      return true;
    }
    if(id==='enterprise.revise'){
      if(this.authoring!=='PUBLISHED')return {enabled:false,code:'SOURCE_REVISION_NOT_PUBLISHED',reason:'Create a successor revision only from an immutable published source revision.',availabilityOwner:this.owner};
      return true;
    }
    if(id==='enterprise.twin'){
      if(this.authoring==='PUBLISHED')return {enabled:false,code:'PUBLISHED_REVISION_IMMUTABLE__CREATE_SUCCESSOR_REVISION',reason:'Create a successor Enterprise/Twin revision before creating or rebasing the Twin.',availabilityOwner:this.owner};
      if(!this.twinId)return true;
      if(this.twinBinding==='BASELINE_STALE')return true;
      return {enabled:false,code:'TWIN_REBASE_REQUIRES_STALE_BASELINE',reason:'Twin is already bound. Rebase becomes available only after provider/source truth marks the baseline stale.',availabilityOwner:this.owner};
    }
    if(id==='enterprise.handoff'){
      if(this.twinBinding==='BASELINE_STALE')return {enabled:false,code:'BASELINE_STALE',reason:'Rebase the Twin explicitly before Run preparation.',availabilityOwner:this.owner};
      if(this.twinId&&this.twinBinding!=='BOUND')return {enabled:false,code:'TWIN_BASELINE_BINDING_REQUIRED',reason:'Run preparation requires an explicit bound Twin/Baseline identity when a Twin exists.',availabilityOwner:this.owner};
      if(this.baseline.status!=='AVAILABLE')return {enabled:false,code:'BASELINE_UNAVAILABLE',reason:'Run preparation requires an available pinned baseline.',availabilityOwner:this.owner};
      if(this.authoring!=='PUBLISHED')return {enabled:false,code:'REVISION_NOT_PUBLISHED',reason:'Run preparation requires a published Enterprise/Twin revision.',availabilityOwner:this.owner};
      if(!this.baseline.digest)return {enabled:false,code:'PINNED_SOURCE_DIGEST_UNAVAILABLE',reason:'Run preparation requires exact pinned source digests.',availabilityOwner:this.owner};
      return true;
    }
    return true;
  }

  handoff(){
    const availability=this.commandAvailability('enterprise.handoff');
    if(availability!==true)return freeze({ok:false,code:availability.code,reason:availability.reason,mutated:false,runStarted:false,liveDeviceChanges:0});
    return freeze({ok:true,code:'HANDOFF_READY',owner:this.owner,enterpriseId:this.enterpriseId,enterpriseRevision:this.revisionId,baseline:clone(this.baseline),twinId:this.twinId,canonicalPublication:false,runStarted:false,liveDeviceChanges:0,preflightOnly:true});
  }
}
