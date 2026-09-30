import {STRUCTURED_TREE_KERNEL,STRUCTURED_BLOCK_TYPES} from '../structured.js';
import {assertCanonicalStructuredNavigationTreeKernel,deriveStructuredReadInspectionDescriptor,structuredNavigationLabel,validateStructuredNavigationDocument,validateStructuredNavigationIdentity} from './read-inspection.js';

const clone=value=>structuredClone(value);
const HEADING_RANKS=Object.freeze({h2:2,h3:3});
const SUPPORTED_HEADINGS=Object.freeze(Object.keys(HEADING_RANKS));
const TYPE_LABELS=Object.freeze(Object.fromEntries(STRUCTURED_BLOCK_TYPES.map(item=>[item.type,item.label])));

export const STRUCTURED_NAVIGATION_DESCRIPTOR_CONTRACT=Object.freeze({
  id:'StructuredNavigationDescriptorOwner',
  version:'1.0.0',
  compatibility:'SEMVER',
  owner:'Structured Family',
  policyRevision:'structured-navigation-descriptor-w5b-r1'
});

const defaultPolicy=Object.freeze({
  headingTypes:Object.freeze(['h2','h3']),
  includeTogglesInOutline:true,
  includeTogglesInQuickJump:true,
  requireContentLabel:true,
  quickJumpLimit:18
});
const policyState={
  headingTypes:[...defaultPolicy.headingTypes],
  includeTogglesInOutline:defaultPolicy.includeTogglesInOutline,
  includeTogglesInQuickJump:defaultPolicy.includeTogglesInQuickJump,
  requireContentLabel:defaultPolicy.requireContentLabel,
  quickJumpLimit:defaultPolicy.quickJumpLimit
};

const validateHeadingTypes=value=>{
  if(!Array.isArray(value))throw Error('STRUCTURED_NAVIGATION_HEADING_TYPES_REQUIRED');
  if(value.some(type=>typeof type!=='string'))throw Error('STRUCTURED_NAVIGATION_HEADING_TYPE_STRING_REQUIRED');
  const unique=[...new Set(value)];
  if(unique.some(type=>!SUPPORTED_HEADINGS.includes(type)))throw Error('UNSUPPORTED_STRUCTURED_NAVIGATION_HEADING_TYPE');
  return unique;
};
const snapshotPolicy=()=>Object.freeze({
  headingTypes:Object.freeze([...policyState.headingTypes]),
  includeTogglesInOutline:policyState.includeTogglesInOutline,
  includeTogglesInQuickJump:policyState.includeTogglesInQuickJump,
  requireContentLabel:policyState.requireContentLabel,
  quickJumpLimit:policyState.quickJumpLimit
});
const validatePolicySnapshot=snapshot=>{
  if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot))throw Error('STRUCTURED_NAVIGATION_POLICY_SNAPSHOT_REQUIRED');
  const required=['headingTypes','includeTogglesInOutline','includeTogglesInQuickJump','requireContentLabel','quickJumpLimit'];
  if(required.some(key=>!Object.prototype.hasOwnProperty.call(snapshot,key)))throw Error('STRUCTURED_NAVIGATION_POLICY_SNAPSHOT_INCOMPLETE');
  const headingTypes=validateHeadingTypes(snapshot.headingTypes);
  if(typeof snapshot.includeTogglesInOutline!=='boolean'||typeof snapshot.includeTogglesInQuickJump!=='boolean'||typeof snapshot.requireContentLabel!=='boolean')throw Error('STRUCTURED_NAVIGATION_POLICY_BOOLEAN_REQUIRED');
  const limit=snapshot.quickJumpLimit;
  if(typeof limit!=='number'||!Number.isInteger(limit)||limit<1||limit>1000)throw Error('INVALID_STRUCTURED_NAVIGATION_QUICK_JUMP_LIMIT');
  return {
    headingTypes,
    includeTogglesInOutline:snapshot.includeTogglesInOutline,
    includeTogglesInQuickJump:snapshot.includeTogglesInQuickJump,
    requireContentLabel:snapshot.requireContentLabel,
    quickJumpLimit:limit
  };
};
const applyPolicy=snapshot=>{
  const next=validatePolicySnapshot(snapshot);
  policyState.headingTypes=[...next.headingTypes];
  policyState.includeTogglesInOutline=next.includeTogglesInOutline;
  policyState.includeTogglesInQuickJump=next.includeTogglesInQuickJump;
  policyState.requireContentLabel=next.requireContentLabel;
  policyState.quickJumpLimit=next.quickJumpLimit;
  return snapshotPolicy();
};

export function structuredNavigationDescriptorPolicy(){return snapshotPolicy();}
export function setStructuredNavigationHeadingEligibility(headingTypes){
  const previous=snapshotPolicy();
  applyPolicy({...previous,headingTypes:validateHeadingTypes(headingTypes)});
  let reverted=false;
  return Object.freeze({
    previous,
    current:snapshotPolicy(),
    revert(){if(!reverted){applyPolicy(previous);reverted=true;}return snapshotPolicy();}
  });
}
export function setStructuredNavigationToggleEligibility(enabled){
  if(typeof enabled!=='boolean')throw Error('STRUCTURED_NAVIGATION_TOGGLE_ELIGIBILITY_BOOLEAN_REQUIRED');
  const previous=snapshotPolicy();
  applyPolicy({...previous,includeTogglesInOutline:enabled,includeTogglesInQuickJump:enabled});
  let reverted=false;
  return Object.freeze({
    previous,
    current:snapshotPolicy(),
    revert(){if(!reverted){applyPolicy(previous);reverted=true;}return snapshotPolicy();}
  });
}
export function restoreStructuredNavigationDescriptorPolicy(snapshot){return applyPolicy(snapshot);}
export function resetStructuredNavigationDescriptorPolicy(){return applyPolicy(defaultPolicy);}

const delegation=Object.freeze({
  transientPresentationOwner:'TransientFocusOwner',
  contextInspectorLifecycleOwner:'ContextInspectorHost',
  canonicalSelectionOwner:'StructuredSelectionKernel',
  canonicalDocumentMutationOwner:'StructuredMutationKernel',
  domScrollOwner:'CONTROLLER_INTEGRATION_PRESENTATION',
  descriptorOwnerOwnsTransientLifecycle:false,
  descriptorOwnerOwnsDomScroll:false,
  descriptorOwnerOwnsSelection:false,
  descriptorOwnerOwnsDocumentMutation:false,
  descriptorOwnerOwnsDomainReferenceMutation:false
});

const freezeTarget=(documentId,blockId)=>Object.freeze({
  identityKind:'canonical-structured-block',
  documentId,
  blockId,
  key:`${documentId}::${blockId}`
});

export class StructuredNavigationDescriptorOwner{
  constructor({adapter=null,readDocument=null,readIdentity=null,treeKernel=null}={}){
    this.owner='StructuredNavigationDescriptorOwner';
    this.contract=STRUCTURED_NAVIGATION_DESCRIPTOR_CONTRACT;
    this.adapter=adapter||null;
    if(this.adapter){
      assertCanonicalStructuredNavigationTreeKernel(this.adapter.treeKernel);
      if(treeKernel!=null&&treeKernel!==this.adapter.treeKernel)throw Error('STRUCTURED_NAVIGATION_ADAPTER_TREE_KERNEL_MISMATCH');
      this.treeKernel=this.adapter.treeKernel;
    }else this.treeKernel=assertCanonicalStructuredNavigationTreeKernel(treeKernel??STRUCTURED_TREE_KERNEL);
    this.readDocument=readDocument||(adapter&&(()=>adapter.snapshot()));
    this.readIdentity=readIdentity||(adapter&&(()=>adapter.identity()));
    if(typeof this.readDocument!=='function'||typeof this.readIdentity!=='function')throw Error('STRUCTURED_NAVIGATION_DESCRIPTOR_READERS_REQUIRED');
  }
  policy(){return structuredNavigationDescriptorPolicy();}
  delegation(){return clone(delegation);}
  _snapshot(){
    const rawDocument=this.readDocument(),document=clone(rawDocument);
    validateStructuredNavigationDocument(document,this.treeKernel);
    const rawIdentity=this.readIdentity(),identity=validateStructuredNavigationIdentity(document,rawIdentity==null?{}:clone(rawIdentity));
    return Object.freeze({document,identity,policy:this.policy()});
  }
  _label(block){return structuredNavigationLabel(block,{fallbackLabel:TYPE_LABELS[block?.type]||'Block'});}
  _outlineEligibility(block,policy){
    const label=this._label(block),headingRank=HEADING_RANKS[block?.type]||null,isHeading=!!headingRank&&policy.headingTypes.includes(block.type),isToggle=block?.type==='toggle'&&policy.includeTogglesInOutline;
    const contentEligible=!policy.requireContentLabel||label.hasContentLabel;
    return {eligible:(isHeading||isToggle)&&contentEligible,isHeading,isToggle,headingRank,label};
  }
  _quickJumpEligibility(block,policy){
    const label=this._label(block),headingRank=HEADING_RANKS[block?.type]||null,isHeading=!!headingRank&&policy.headingTypes.includes(block.type),isToggle=block?.type==='toggle'&&policy.includeTogglesInQuickJump;
    const contentEligible=!policy.requireContentLabel||label.hasContentLabel;
    return {eligible:(isHeading||isToggle)&&contentEligible,isHeading,isToggle,headingRank,label};
  }
  _documentIdentity(document,identity){return Object.freeze({documentId:document.id,committedRevision:identity.committedRevision,workingRevision:identity.workingRevision,identityOwner:identity.owner});}
  _canonical(document,block,ref){return Object.freeze({
    documentId:document.id,
    blockId:block.id,
    parentBlockId:ref.parent?.id||null,
    depth:ref.depth,
    siblingIndex:ref.index,
    pathBlockIds:Object.freeze(this.treeKernel.pathFor(document.blocks,block.id).map(node=>node.id))
  });}
  _outlineFromSnapshot(snapshot){
    const {document,identity,policy}=snapshot,roots=[],flat=[];
    const makeItem=(block,ref,kind,headingRank,parent)=>{
      const label=this._label(block),target=freezeTarget(document.id,block.id),item={
        descriptorId:`structured-outline:${document.id}:${block.id}`,
        kind,
        headingRank:headingRank||null,
        label:label.label,
        labelSource:label.labelSource,
        target,
        canonical:this._canonical(document,block,ref),
        toggle:kind==='toggle'?Object.freeze({open:block.open!==false}):null,
        outlineParentTarget:parent?parent.target:null,
        children:[]
      };
      if(parent)parent.children.push(item);else roots.push(item);
      flat.push(item);
      return item;
    };
    const visitArray=(blocks,inheritedParent=null)=>{
      const headingStack=[];
      for(const block of blocks||[]){
        const ref=this.treeKernel.findRef(document.blocks,block.id),eligibility=this._outlineEligibility(block,policy);
        let currentParent=headingStack.at(-1)?.item||inheritedParent,currentItem=null;
        if(eligibility.isHeading&&eligibility.eligible){
          while(headingStack.length&&headingStack.at(-1).rank>=eligibility.headingRank)headingStack.pop();
          currentParent=headingStack.at(-1)?.item||inheritedParent;
          currentItem=makeItem(block,ref,'heading',eligibility.headingRank,currentParent);
          headingStack.push({rank:eligibility.headingRank,item:currentItem});
        }else if(eligibility.isToggle&&eligibility.eligible){
          currentParent=headingStack.at(-1)?.item||inheritedParent;
          currentItem=makeItem(block,ref,'toggle',null,currentParent);
        }
        if(block.children?.length)visitArray(block.children,currentItem||currentParent);
      }
    };
    visitArray(document.blocks,null);
    const freezeNode=node=>Object.freeze({...node,children:Object.freeze(node.children.map(freezeNode))});
    const frozenRoots=Object.freeze(roots.map(freezeNode));
    const frozenFlat=Object.freeze(flat.map(item=>Object.freeze({...item,children:undefined})));
    return Object.freeze({
      owner:this.owner,
      contract:this.contract,
      policy,
      kind:'structured-outline',
      documentIdentity:this._documentIdentity(document,identity),
      hierarchy:frozenRoots,
      entries:frozenFlat,
      count:frozenFlat.length,
      canonicalTreeOwner:this.treeKernel.owner,
      deterministicOrder:'canonical-tree-preorder-with-heading-rank-parenting',
      presentationDelegation:clone(delegation)
    });
  }
  _quickJumpFromSnapshot(snapshot){
    const {document,identity,policy}=snapshot,candidates=[];
    this.treeKernel.walk(document.blocks,(block,ref)=>{
      const eligibility=this._quickJumpEligibility(block,policy);
      if(!eligibility.eligible)return;
      const kind=eligibility.isHeading?'heading':'toggle',target=freezeTarget(document.id,block.id);
      candidates.push({
        descriptorId:`structured-quick-jump:${document.id}:${block.id}`,
        kind,
        label:eligibility.label.label,
        labelSource:eligibility.label.labelSource,
        headingRank:kind==='heading'?eligibility.headingRank:null,
        target,
        canonical:this._canonical(document,block,ref),
        request:Object.freeze({kind:'request-canonical-structured-target-presentation',target,performsDomScroll:false,transientLifecycleOwned:false})
      });
    });
    const items=Object.freeze(candidates.slice(0,policy.quickJumpLimit).map((item,index)=>Object.freeze({...item,order:index})));
    return Object.freeze({
      owner:this.owner,
      contract:this.contract,
      policy,
      kind:'structured-quick-jump',
      documentIdentity:this._documentIdentity(document,identity),
      items,
      count:items.length,
      targetIdentity:'canonical-document-and-block-id',
      domIdentityCanonical:false,
      performsDomScroll:false,
      presentationDelegation:clone(delegation)
    });
  }
  _readInspectionFromSnapshot(snapshot,blockId,{mode='read'}={}){
    const {document,identity,policy}=snapshot,ref=this.treeKernel.findRef(document.blocks,blockId),typeLabel=TYPE_LABELS[ref?.block?.type]||'Block';
    return deriveStructuredReadInspectionDescriptor({owner:this.owner,contract:this.contract,policy,treeKernel:this.treeKernel,document,identity,blockId,mode,typeLabel,delegation});
  }
  outline(){return this._outlineFromSnapshot(this._snapshot());}
  quickJump(){return this._quickJumpFromSnapshot(this._snapshot());}
  readInspection(blockId,options={}){return this._readInspectionFromSnapshot(this._snapshot(),blockId,options);}
  descriptor(){
    const snapshot=this._snapshot(),outline=this._outlineFromSnapshot(snapshot),quickJump=this._quickJumpFromSnapshot(snapshot);
    return Object.freeze({owner:this.owner,contract:this.contract,policy:snapshot.policy,outline,quickJump,presentationDelegation:clone(delegation),semanticOwner:true,descriptorDerivationOnly:true});
  }
}

export const STRUCTURED_OUTLINE_PRESENTATION_DESCRIPTOR_CONTRACT=Object.freeze({
  id:'StructuredOutlinePresentationDescriptor',
  version:'1.0.0',
  compatibility:'SEMVER',
  owner:'Structured Family',
  scope:'OUTLINE_TREE_PRESENTATION_ONLY',
  excludes:Object.freeze(['quick-jump','domain-search-ranking','domain-route-mutation','canonical-structure-mutation'])
});

const normalizePresentationSecondary=value=>Object.freeze((Array.isArray(value)?value:[]).map(item=>Object.freeze({
  text:String(item?.text??''),
  direction:item?.direction==='ltr'?'ltr':'auto',
  element:item?.element==='bdi'?'bdi':'small'
})));
const normalizeActivationDataset=value=>Object.freeze(Object.fromEntries(Object.entries(value&&typeof value==='object'?value:{}).filter(([key,item])=>/^[A-Za-z][A-Za-z0-9]*$/.test(key)&&item!=null).map(([key,item])=>[key,String(item)])));
const freezePresentationNode=node=>{
  if(!node||typeof node!=='object'||Array.isArray(node))throw Error('STRUCTURED_OUTLINE_PRESENTATION_NODE_REQUIRED');
  const id=String(node.id??'').trim(),label=String(node.label??'');
  if(!id)throw Error('STRUCTURED_OUTLINE_PRESENTATION_NODE_ID_REQUIRED');
  const children=Object.freeze((Array.isArray(node.children)?node.children:[]).map(freezePresentationNode));
  return Object.freeze({
    id,
    kind:String(node.kind||'item'),
    label,
    iconKey:String(node.iconKey||''),
    secondary:normalizePresentationSecondary(node.secondary),
    statusText:String(node.statusText||''),
    statusClass:String(node.statusClass||'').split(/\s+/).filter(token=>/^[A-Za-z_-][A-Za-z0-9_-]*$/.test(token)).join(' '),
    countText:Object.prototype.hasOwnProperty.call(node,'countText')&&node.countText===null?null:node.countText==null?(children.length?String(children.length):''):String(node.countText),
    selected:!!node.selected,
    current:!!node.current,
    onActivePath:!!node.onActivePath,
    expanded:children.length?!!node.expanded:false,
    forceExpanded:children.length?!!node.forceExpanded:false,
    focused:!!node.focused,
    variantClass:String(node.variantClass||''),
    activationDataset:normalizeActivationDataset(node.activationDataset),
    children
  });
};

export function createStructuredOutlinePresentationDescriptor({mode='hierarchy',ariaLabel='Outline',query='',nodes=[],focusId=null,summary=null}={}){
  if(mode!=='hierarchy'&&mode!=='results')throw Error('STRUCTURED_OUTLINE_PRESENTATION_MODE_INVALID');
  const frozenNodes=Object.freeze((Array.isArray(nodes)?nodes:[]).map(freezePresentationNode));
  const normalizedSummary=summary&&typeof summary==='object'?Object.freeze({
    kind:['path','count','text'].includes(summary.kind)?summary.kind:'text',
    labels:Object.freeze((Array.isArray(summary.labels)?summary.labels:[]).map(value=>String(value))),
    text:String(summary.text||''),
    title:String(summary.title||'')
  }):null;
  return Object.freeze({
    owner:'StructuredOutlinePresentationDescriptor',
    contract:STRUCTURED_OUTLINE_PRESENTATION_DESCRIPTOR_CONTRACT,
    mode,
    ariaLabel:String(ariaLabel||'Outline'),
    query:String(query||''),
    focusId:focusId==null?null:String(focusId),
    nodes:frozenNodes,
    summary:normalizedSummary,
    presentationOnly:true,
    ownsQuickJump:false,
    ownsDomainSearchRanking:false,
    ownsDomainRouting:false,
    ownsCanonicalStructureMutation:false
  });
}
