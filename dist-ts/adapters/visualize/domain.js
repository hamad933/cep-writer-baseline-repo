import {SpatialModel} from '../../foundation/models.js';
const clone=value=>value===undefined?undefined:structuredClone(value);
const MODES=Object.freeze(['TREE','PATH','GRAPH','CANVAS']);
const finite=value=>Number.isFinite(Number(value));
const modeOf=value=>MODES.includes(String(value||'').toUpperCase())?String(value).toUpperCase():null;
const canonicalObjectId=representation=>String(representation?.canonicalRef?.objectId||representation?.canonicalObjectId||'');
const viewsOf=representation=>{const explicit=(representation?.views||[]).map(modeOf).filter(Boolean);return explicit.length?[...new Set(explicit)]:[...MODES];};

export const VISUALIZE_DOMAIN_OWNER='VisualizeDomainAdapter';
export class VisualizeViewAdapter{
  constructor(domain,mode){this.domain=domain;this.mode=mode;this.owner=`Visualize${mode}RepresentationAdapter`;this.model=domain.model;}
  descriptor(){return {owner:this.owner,mode:this.mode,engineOwner:this.model.interactionKernel.ownerId,canonicalOwner:this.domain.provider?'BOUND_PROVIDER':'UNAVAILABLE',representationOnly:true};}
  representationIds(){return this.domain.representations.filter(item=>viewsOf(item).includes(this.mode)).map(item=>item.representationId);}
  assertIds(ids=[]){const allowed=new Set(this.representationIds()),normalized=[...new Set(ids.map(String))];if(normalized.some(id=>!allowed.has(id)))return {ok:false,status:'VISUALIZE_SELECTION_OUTSIDE_VIEW',ids:normalized};return {ok:true,ids:normalized};}
  select({representationIds=[],route='pointer',action='replace'}={}){
    const checked=this.assertIds(representationIds);if(!checked.ok)return checked;
    this.model.syncSelectionProjection();
    if(action==='clear')this.model.selectionKernel.clear({source:`visualize-${this.mode.toLowerCase()}-${route}`});
    else if(action==='toggle'){for(const id of checked.ids)this.model.selectionKernel.toggle(id,{source:`visualize-${this.mode.toLowerCase()}-${route}`});}
    else this.model.selectionKernel.replace(checked.ids,{source:`visualize-${this.mode.toLowerCase()}-${route}`});
    const receipt=this.model.selectionReceipt(`visualize-${this.mode.toLowerCase()}-${route}`);
    return {ok:true,status:'REPRESENTATION_SELECTED',mode:this.mode,route,representationIds:[...receipt.selectedIds],canonicalMutation:false,receipt};
  }
  move({representationIds=[],dx=0,dy=0}={}){const checked=this.assertIds(representationIds);if(!checked.ok)return checked;return this.domain.move(checked.ids,dx,dy,{mode:this.mode});}
  viewport(payload={}){return this.domain.viewport({...payload,mode:this.mode});}
}

/** Thin Visualize adapter. One SpatialModel/SpatialInteractionKernel drives Tree/Path/Graph/Canvas. */
export class VisualizeDomainAdapter{
  constructor({provider=null,representations=[]}={}){
    this.owner=VISUALIZE_DOMAIN_OWNER;
    this.provider=provider&&typeof provider.read==='function'?provider:null;
    this.representations=clone(representations).map((item,index)=>{
      const representationId=String(item?.representationId||'').trim();if(!representationId)throw Error(`VISUALIZE_REPRESENTATION_ID_REQUIRED:${index}`);
      const objectId=canonicalObjectId(item);if(objectId&&objectId===representationId)throw Error('VISUALIZE_REPRESENTATION_ID_MUST_DIFFER_FROM_CANONICAL_OBJECT_ID');
      return {...clone(item),representationId,views:viewsOf(item)};
    });
    this.model=new SpatialModel(this.representations.map(item=>({id:item.representationId,x:finite(item.x)?Number(item.x):0,y:finite(item.y)?Number(item.y):0,label:item.label||item.representationId,type:item.type||'representation'})),[]);
    this.views=Object.fromEntries(MODES.map(mode=>[mode,new VisualizeViewAdapter(this,mode)]));
  }
  descriptor(){return {owner:this.owner,spatialOwner:this.model.interactionKernel.ownerId,canonicalDataProvider:this.provider?'BOUND':'UNAVAILABLE',canonicalTruthLabel:this.provider?'PROVIDER_BOUND':'UNAVAILABLE',localGraphTruth:this.provider?'REPRESENTATION_ONLY':'SYNTHETIC_REPRESENTATION_ONLY',fixtureIsCanonical:false,representationIdentity:'representationId != canonicalObjectId',views:this.viewDescriptors(),universalVirtualizationOwner:false};}
  view(mode){const key=modeOf(mode);if(!key)throw Error('VISUALIZE_VIEW_MODE_REQUIRED');return this.views[key];}
  viewDescriptors(){return MODES.map(mode=>this.views[mode].descriptor());}
  canonicalProjection(){
    if(!this.provider)return {ok:false,status:'VISUALIZE_CANONICAL_DATA_PROVIDER_UNAVAILABLE',objects:[],relations:[],canonical:false,localGraph:'SYNTHETIC_REPRESENTATION_ONLY'};
    try{const result=this.provider.read();if(!result||result.ok!==true)return {ok:false,status:result?.status||'VISUALIZE_PROVIDER_ERROR',objects:[],relations:[],canonical:false,localGraph:'REPRESENTATION_ONLY'};const canonical=result.canonical===true;return {...clone(result),canonical,localGraph:canonical?'REPRESENTATION_ONLY':'LOCAL_ACCEPTANCE_REPRESENTATION_ONLY'}}catch(error){return {ok:false,status:'VISUALIZE_PROVIDER_ERROR',reason:String(error?.message||error),objects:[],relations:[],canonical:false,localGraph:'REPRESENTATION_ONLY'}}
  }
  canonicalDigest(){const projection=this.canonicalProjection();return JSON.stringify(projection);}
  representationProjection(mode=null){const key=modeOf(mode),allowed=key?new Set(this.view(key).representationIds()):null;return {ok:true,status:'REPRESENTATION_PROJECTION',canonical:false,synthetic:this.provider?false:true,mode:key||'ALL',representations:this.model.nodes.filter(node=>!allowed||allowed.has(node.id)).map(node=>{const source=this.representations.find(item=>item.representationId===node.id)||{};return {...clone(source),representationId:node.id,x:node.x,y:node.y,canonicalRef:clone(source.canonicalRef||null),canonicalObjectCloned:false}})};}
  selectionAvailability({mode,representationIds=[]}={}){const key=modeOf(mode);if(!key)return {enabled:false,code:'VISUALIZE_VIEW_MODE_REQUIRED',reason:'Tree/Path/Graph/Canvas view context is required.'};const checked=this.view(key).assertIds(representationIds);return checked.ok?{enabled:true,code:'AVAILABLE',reason:''}:{enabled:false,code:checked.status,reason:'Selection contains a representation outside the active view.'};}
  select(payload={}){const key=modeOf(payload.mode);if(!key)return {ok:false,status:'VISUALIZE_VIEW_MODE_REQUIRED',canonicalMutation:false};return this.view(key).select(payload);}
  move(ids,dx,dy,{mode=null}={}){if(!finite(dx)||!finite(dy))return {ok:false,status:'VISUALIZE_NON_FINITE_GEOMETRY_REJECTED',canonicalMutation:false};const canonicalBefore=this.canonicalDigest(),edgeBefore=JSON.stringify(this.model.edges),ok=this.model.move(ids,Number(dx),Number(dy));return {ok:ok===true,status:ok===true?'GEOMETRY_MOVED':'GEOMETRY_REJECTED',mode:modeOf(mode)||null,canonicalMutation:false,canonicalTruthUnchanged:canonicalBefore===this.canonicalDigest(),relationsUnchanged:edgeBefore===JSON.stringify(this.model.edges),projection:this.representationProjection(mode)};}
  align(axis){const canonicalBefore=this.canonicalDigest(),ok=this.model.align(axis);return {ok:ok===true,status:ok===true?'GEOMETRY_ALIGNED':'GEOMETRY_REJECTED',canonicalMutation:false,canonicalTruthUnchanged:canonicalBefore===this.canonicalDigest(),projection:this.representationProjection()};}
  distribute(axis){const canonicalBefore=this.canonicalDigest(),ok=this.model.distribute(axis);return {ok:ok===true,status:ok===true?'GEOMETRY_DISTRIBUTED':'GEOMETRY_REJECTED',canonicalMutation:false,canonicalTruthUnchanged:canonicalBefore===this.canonicalDigest(),projection:this.representationProjection()};}
  fit(width,height){if(!finite(width)||!finite(height)||Number(width)<=0||Number(height)<=0)return {ok:false,status:'VISUALIZE_VIEWPORT_BOUNDS_REQUIRED',canonicalMutation:false};return {ok:this.model.fit(Number(width),Number(height))===true,status:'REPRESENTATION_CAMERA_ONLY',canonicalMutation:false,camera:clone(this.model.camera)};}
  viewport({mode,width,height,action='fit',factor=1,x=0,y=0,dx=0,dy=0}={}){
    if(mode&&!modeOf(mode))return {ok:false,status:'VISUALIZE_VIEW_MODE_REQUIRED',canonicalMutation:false};
    if(action==='fit')return {...this.fit(width,height),mode:modeOf(mode)||null,keyboardReachable:true,minimapReachable:true};
    if(action==='zoom'){if(!finite(factor)||Number(factor)<=0||!finite(x)||!finite(y))return {ok:false,status:'VISUALIZE_VIEWPORT_BOUNDS_REQUIRED',canonicalMutation:false};this.model.zoomAt(Number(factor),Number(x),Number(y));return {ok:true,status:'REPRESENTATION_CAMERA_ONLY',canonicalMutation:false,camera:clone(this.model.camera),mode:modeOf(mode)||null,keyboardReachable:true,minimapReachable:true};}
    if(action==='pan'){if(!finite(dx)||!finite(dy))return {ok:false,status:'VISUALIZE_VIEWPORT_BOUNDS_REQUIRED',canonicalMutation:false};this.model.pan(Number(dx),Number(dy));return {ok:true,status:'REPRESENTATION_CAMERA_ONLY',canonicalMutation:false,camera:clone(this.model.camera),mode:modeOf(mode)||null,keyboardReachable:true,minimapReachable:true};}
    return {ok:false,status:'VISUALIZE_VIEWPORT_ACTION_UNKNOWN',canonicalMutation:false};
  }
  linkAvailability(payload={}){
    if(!this.provider)return {enabled:false,code:'VISUALIZE_CANONICAL_DATA_PROVIDER_UNAVAILABLE',reason:'Canonical provider is unavailable; local graph remains explicitly synthetic.'};
    if(typeof this.provider.validateRelation!=='function'||typeof this.provider.commitRelation!=='function')return {enabled:false,code:'VISUALIZE_VALIDATED_RELATION_COMMAND_REQUIRED',reason:'Canonical relation mutation requires the bound provider validation and commit command.'};
    const source=String(payload.sourceObjectId||''),target=String(payload.targetObjectId||''),type=String(payload.type||'');if(!source||!target||source===target||!type)return {enabled:false,code:'VISUALIZE_RELATION_CONTEXT_REQUIRED',reason:'Distinct canonical endpoints and relation type are required.'};
    try{const result=this.provider.validateRelation({sourceObjectId:source,targetObjectId:target,type,context:clone(payload.context||{})});if(result===true||result?.ok===true)return {enabled:true,code:'AVAILABLE',reason:'',validation:clone(result)};return {enabled:false,code:result?.code||'VISUALIZE_RELATION_VALIDATION_REJECTED',reason:result?.reason||'Provider rejected the relation.'};}catch(error){return {enabled:false,code:'VISUALIZE_RELATION_VALIDATION_ERROR',reason:String(error?.message||error)};}
  }
  link(payload={}){const availability=this.linkAvailability(payload);if(!availability.enabled)return {ok:false,status:availability.code,reason:availability.reason,canonicalMutation:false,representationEdgeWrites:0};try{const result=this.provider.commitRelation({sourceObjectId:String(payload.sourceObjectId),targetObjectId:String(payload.targetObjectId),type:String(payload.type),context:clone(payload.context||{}),validation:clone(availability.validation)});return {ok:result?.ok!==false,status:result?.status||'CANONICAL_RELATION_PROVIDER_COMMAND',canonicalMutation:result?.ok!==false,providerReceipt:clone(result),representationEdgeWrites:0};}catch(error){return {ok:false,status:'VISUALIZE_RELATION_PROVIDER_ERROR',reason:String(error?.message||error),canonicalMutation:false,representationEdgeWrites:0};}}
  editAvailability(payload={}){if(!this.provider)return {enabled:false,code:'VISUALIZE_CANONICAL_DATA_PROVIDER_UNAVAILABLE',reason:'Canonical provider is unavailable.'};if(typeof this.provider.editObject!=='function')return {enabled:false,code:'VISUALIZE_CANONICAL_EDIT_COMMAND_REQUIRED',reason:'Canonical object edit requires a bound provider command.'};if(!String(payload.objectId||''))return {enabled:false,code:'VISUALIZE_CANONICAL_OBJECT_REQUIRED',reason:'Canonical object identity is required.'};return {enabled:true,code:'AVAILABLE',reason:''};}
  edit(payload={}){const availability=this.editAvailability(payload);if(!availability.enabled)return {ok:false,status:availability.code,reason:availability.reason,canonicalMutation:false};try{const result=this.provider.editObject({objectId:String(payload.objectId),patch:clone(payload.patch||{}),context:clone(payload.context||{})});return {ok:result?.ok!==false,status:result?.status||'CANONICAL_OBJECT_PROVIDER_COMMAND',canonicalMutation:result?.ok!==false,providerReceipt:clone(result),representations:this.representationProjection()};}catch(error){return {ok:false,status:'VISUALIZE_CANONICAL_EDIT_PROVIDER_ERROR',reason:String(error?.message||error),canonicalMutation:false};}}
  connect(){return {ok:false,status:'SHARED_RELATION_INTERACTION_OWNER_REQUIRED',canonicalMutation:false,owner:'RelationInteractionOwner'};}
}
