import {CLIPBOARD_TRUST_CONTRACT,CLIPBOARD_TRUST_POLICY} from './clipboard-contract.js';

const clone=value=>structuredClone(value);
const HTML_FIELDS=new Set(['html','titleHtml','contentHtml']);
const DANGEROUS_HTML=/<\/?(?:script|style|iframe|object|embed|meta|link|base)\b|\son[a-z0-9_-]+\s*=|\s(?:srcdoc|style)\s*=|(?:javascript|vbscript)\s*:|data\s*:\s*text\/html/i;
const DANGEROUS_URL=/^\s*(?:javascript|vbscript)\s*:|^\s*data\s*:\s*text\/html/i;
const URL_FIELDS=new Set(['href','src','url']);

function clipboardError(code,reason=code){const error=Error(code);error.code=code;error.reason=reason;return error;}
function plainDataIssue(value,path='payload',seen=new Set()){
  if(value===null||typeof value==='string'||typeof value==='number'||typeof value==='boolean')return null;
  if(value===undefined)return {code:'NON_CANONICAL_CLIPBOARD_VALUE',path,reason:'Undefined clipboard values are not canonical'};
  if(typeof value!=='object')return {code:'NON_CANONICAL_CLIPBOARD_VALUE',path,reason:'Clipboard payload must contain plain data only'};
  if(typeof value.nodeType==='number'&&typeof value.nodeName==='string')return {code:'DOM_NODE_FORBIDDEN',path,reason:'DOM-like nodes cannot be canonical clipboard identity'};
  if(seen.has(value))return {code:'CYCLIC_CLIPBOARD_PAYLOAD',path,reason:'Clipboard payload cannot be cyclic'};
  seen.add(value);
  if(Array.isArray(value)){
    for(let index=0;index<value.length;index++){const issue=plainDataIssue(value[index],`${path}[${index}]`,seen);if(issue)return issue;}
    seen.delete(value);return null;
  }
  const prototype=Object.getPrototypeOf(value);
  if(prototype!==Object.prototype&&prototype!==null){seen.delete(value);return {code:'NON_CANONICAL_CLIPBOARD_OBJECT',path,reason:'Clipboard payload must contain plain objects only'};}
  for(const [key,child] of Object.entries(value)){const issue=plainDataIssue(child,`${path}.${key}`,seen);if(issue){seen.delete(value);return issue;}}
  seen.delete(value);return null;
}
function inspectTrust(value,path='payload'){
  if(value===null||typeof value!=='object')return null;
  if(Array.isArray(value)){for(let index=0;index<value.length;index++){const issue=inspectTrust(value[index],`${path}[${index}]`);if(issue)return issue;}return null;}
  for(const [key,child] of Object.entries(value)){
    const next=`${path}.${key}`;
    if(/^on[a-z0-9_-]+$/i.test(key))return {code:'UNSAFE_CLIPBOARD_CONTENT',path:next,reason:'Event-handler fields are not trusted clipboard content'};
    if(key.toLowerCase()==='srcdoc'||key.toLowerCase()==='style')return {code:'UNSAFE_CLIPBOARD_CONTENT',path:next,reason:'Active HTML fields are not trusted clipboard content'};
    if(typeof child==='string'&&HTML_FIELDS.has(key)&&DANGEROUS_HTML.test(child))return {code:'UNSAFE_CLIPBOARD_CONTENT',path:next,reason:'Unsafe HTML crossed the Structured clipboard trust boundary'};
    if(typeof child==='string'&&URL_FIELDS.has(key.toLowerCase())&&DANGEROUS_URL.test(child))return {code:'UNSAFE_CLIPBOARD_CONTENT',path:next,reason:'Unsafe URL crossed the Structured clipboard trust boundary'};
    const issue=inspectTrust(child,next);if(issue)return issue;
  }
  return null;
}
function identityIssue(blocks){
  const seen=new Set();let issue=null;
  const walk=(items,path='blocks')=>{
    if(!Array.isArray(items)){issue={code:'INVALID_CHILDREN_SHAPE',path,reason:'Structured clipboard children must be arrays'};return;}
    for(let index=0;index<items.length&&!issue;index++){
      const block=items[index],next=`${path}[${index}]`;
      if(!block||typeof block!=='object'||typeof block.id!=='string'||!block.id){issue={code:'INVALID_BLOCK_ID',path:`${next}.id`,reason:'Every clipboard block requires an identity'};break;}
      if(seen.has(block.id)){issue={code:'DUPLICATE_CLIPBOARD_IDENTITY',path:`${next}.id`,reason:`Duplicate clipboard identity ${block.id}`};break;}
      seen.add(block.id);
      if('children' in block&&block.children!==undefined){if(!Array.isArray(block.children)){issue={code:'INVALID_CHILDREN_SHAPE',path:`${next}.children`,reason:'Structured clipboard children must be arrays'};break;}walk(block.children,`${next}.children`);}
    }
  };
  walk(blocks);return issue;
}

export class StructuredClipboardTrustOwner{
  constructor({readDocument,schema,domainKind,consumerOwner,treeKernel,mutationKernel,transactionOwner,selection,commandAvailabilityOwner,readOnly=()=>false,transact,policy=CLIPBOARD_TRUST_POLICY}={}){
    if(typeof readDocument!=='function'||typeof transact!=='function')throw Error('STRUCTURED_CLIPBOARD_DOCUMENT_BOUNDARY_REQUIRED');
    if(!treeKernel?.walk||!treeKernel?.validate||!mutationKernel?.apply)throw Error('STRUCTURED_CLIPBOARD_STRUCTURED_OWNERS_REQUIRED');
    if(!selection?.fragment||!selection?.descriptor||!selection?.select)throw Error('STRUCTURED_CLIPBOARD_SELECTION_OWNER_REQUIRED');
    if(transactionOwner?.owner!=='StructuredTransactionHistoryRecoveryOwner')throw Error('STRUCTURED_CLIPBOARD_TRANSACTION_OWNER_REQUIRED');
    if(commandAvailabilityOwner?.owner!=='StructuredCommandAvailabilityOwner')throw Error('STRUCTURED_CLIPBOARD_AVAILABILITY_OWNER_REQUIRED');
    this.owner='StructuredClipboardTrustOwner';this.contract=CLIPBOARD_TRUST_CONTRACT;this.policy=policy;this.readDocument=readDocument;this.schema=clone(schema);this.domainKind=domainKind;this.consumerOwner=consumerOwner;this.treeKernel=treeKernel;this.mutationKernel=mutationKernel;this.transactionOwner=transactionOwner;this.selection=selection;this.commandAvailabilityOwner=commandAvailabilityOwner;this.readOnly=readOnly;this.transact=transact;this.sequence=0;this.identitySequence=0;this._receipts=[];
  }
  descriptor(){return {owner:this.owner,contract:this.contract,policy:clone(this.policy),dependencies:{treeOwner:this.treeKernel.owner,mutationOwner:this.mutationKernel.owner,transactionOwner:this.transactionOwner.owner,selectionOwner:this.selection.owner,availabilityOwner:this.commandAvailabilityOwner.owner},canonicalPayloadState:'NONE',transportRole:'PRESENTATION_CAPABILITY_BRIDGE_ONLY'};}
  receipts(){return clone(this._receipts);}
  _receipt(command,extra={}){const receipt={sequence:++this.sequence,command,owner:this.owner,policyRevision:this.contract.policyRevision,...clone(extra)};this._receipts.push(receipt);return clone(receipt);}
  _normalize(payload){
    let value=payload;
    if(typeof value==='string'){try{value=JSON.parse(value)}catch{throw clipboardError('INVALID_PAYLOAD','Clipboard payload is not valid JSON')}}
    const issue=plainDataIssue(value);if(issue)throw clipboardError(issue.code,issue.reason);
    return clone(value);
  }
  compatibility(payload){
    let value;try{value=this._normalize(payload)}catch(error){return {enabled:false,code:error.code||'INVALID_PAYLOAD',reason:error.reason||error.message,owner:this.owner,policyRevision:this.contract.policyRevision};}
    if(value?.kind!==this.contract.payloadKind||value?.version!==this.contract.payloadVersion||!Array.isArray(value.blocks))return {enabled:false,code:'INVALID_PAYLOAD',reason:'Clipboard payload is not a supported structured fragment',owner:this.owner,policyRevision:this.contract.policyRevision};
    if(value.blocks.length>this.policy.maxPayloadRoots)return {enabled:false,code:'PAYLOAD_ROOT_LIMIT',reason:'Clipboard fragment exceeds the admitted root limit',owner:this.owner,policyRevision:this.contract.policyRevision};
    if(value.schema?.id!==this.schema.id||value.schema?.version!==this.schema.version)return {enabled:false,code:'INCOMPATIBLE_SCHEMA',reason:'Clipboard schema is incompatible with this structured consumer',owner:this.owner,policyRevision:this.contract.policyRevision};
    const identities=identityIssue(value.blocks);if(identities)return {enabled:false,...identities,owner:this.owner,policyRevision:this.contract.policyRevision};
    const tree=this.treeKernel.validate(value.blocks);if(!tree.ok)return {enabled:false,code:tree.issues[0]?.code||'INVALID_STRUCTURED_TREE',reason:'Clipboard fragment violates the Structured tree schema',issues:clone(tree.issues),owner:this.owner,policyRevision:this.contract.policyRevision};
    const trust=inspectTrust(value.blocks);if(trust)return {enabled:false,...trust,owner:this.owner,policyRevision:this.contract.policyRevision,trustBoundary:this.policy.htmlTrustPolicy};
    return {enabled:true,code:'AVAILABLE',reason:'',payload:value,owner:this.owner,policyRevision:this.contract.policyRevision,trust:{state:'VALIDATED_ON_INGRESS',boundary:this.owner,policy:this.policy.htmlTrustPolicy}};
  }
  _mutationModeGuard(context={}){
    if(this.readOnly())return {enabled:false,code:'READ_ONLY',reason:'Structured document is read only',owner:this.commandAvailabilityOwner.owner,policyRevision:this.commandAvailabilityOwner.contract.policyRevision};
    const mode=context.mode||'edit';if(mode==='edit')return {enabled:true,code:'AVAILABLE',reason:'',owner:this.commandAvailabilityOwner.owner,policyRevision:this.commandAvailabilityOwner.contract.policyRevision};
    const promoted=this.commandAvailabilityOwner.inspect('block.delete',{mode});
    return {enabled:false,code:promoted.code||'EDIT_MODE_REQUIRED',reason:promoted.reason||'Edit mode is required',owner:promoted.owner||this.commandAvailabilityOwner.owner,policyRevision:promoted.policyRevision||this.commandAvailabilityOwner.contract.policyRevision};
  }
  availability(command,context={}){
    const selection=this.selection.descriptor();
    if(command==='document.copy')return selection.count?{enabled:true,code:'AVAILABLE',reason:'',owner:this.owner,policyRevision:this.contract.policyRevision}:{enabled:false,code:'SELECTION_REQUIRED',reason:'Select at least one structured block',owner:this.owner,policyRevision:this.contract.policyRevision};
    if(command==='document.cut'){
      const mode=this._mutationModeGuard(context);if(!mode.enabled)return mode;
      return selection.count?{enabled:true,code:'AVAILABLE',reason:'',owner:this.owner,policyRevision:this.contract.policyRevision}:{enabled:false,code:'SELECTION_REQUIRED',reason:'Select at least one structured block',owner:this.owner,policyRevision:this.contract.policyRevision};
    }
    if(command==='document.paste'){
      const mode=this._mutationModeGuard(context);if(!mode.enabled)return mode;
      return this.compatibility(context.payload);
    }
    return {enabled:false,code:'UNKNOWN_COMMAND',reason:'Unknown structured clipboard command',owner:this.owner,policyRevision:this.contract.policyRevision};
  }
  copy(context={}){
    const available=this.availability('document.copy',context);if(!available.enabled)throw clipboardError(available.code,available.reason);
    const document=this.readDocument(),selection=this.selection.descriptor(),payload={kind:this.contract.payloadKind,version:this.contract.payloadVersion,schema:{id:this.schema.id,version:this.schema.version},source:{documentId:document.id,domainKind:this.domainKind,owner:this.consumerOwner},selection,trust:{boundary:this.owner,policyRevision:this.contract.policyRevision,state:'CANONICAL_SOURCE_VALIDATED',htmlPolicy:this.policy.htmlTrustPolicy},blocks:this.selection.fragment()};
    const validation=this.compatibility(payload);if(!validation.enabled)throw clipboardError(validation.code,validation.reason);
    const result=validation.payload;this._receipt('document.copy',{documentId:document.id,rootCount:result.blocks.length,coveredCount:selection.coveredCount,trustBoundary:this.policy.htmlTrustPolicy});return result;
  }
  _transportWrite(transport,payload){
    if(!transport)return null;const write=typeof transport==='function'?transport:transport?.write;if(typeof write!=='function')throw clipboardError('INVALID_CLIPBOARD_TRANSPORT','Clipboard transport bridge must expose write(payload)');
    let result;try{result=write(clone(payload));}catch(error){throw clipboardError('CLIPBOARD_TRANSPORT_FAILED',String(error?.message||error));}
    if(result&&typeof result.then==='function')throw clipboardError('ASYNC_CLIPBOARD_TRANSPORT_UNSUPPORTED','Canonical Structured cut requires a synchronous capability acknowledgement; async system transport stays in presentation');
    if(result===false||result?.ok===false)throw clipboardError('CLIPBOARD_TRANSPORT_FAILED',result?.reason||'Clipboard transport rejected payload');return result??{ok:true};
  }
  cut(context={}){
    const available=this.availability('document.cut',context);if(!available.enabled)throw clipboardError(available.code,available.reason);
    const payload=this.copy(context),before=this.readDocument(),rootIds=[...payload.selection.blockIds],planned=this.mutationKernel.apply(before.blocks,{type:'removeMany',blockIds:rootIds});
    if(!planned.ok)throw clipboardError(planned.code,planned.reason);
    this._transportWrite(context.transport,payload);
    const tx=this.transact('document.cut',document=>{document.blocks=clone(planned.blocks)},{source:this.owner,presentation:{selection:clone(payload.selection)}});
    this.selection.clear();this._receipt('document.cut',{documentId:before.id,rootCount:rootIds.length,coveredCount:payload.selection.coveredCount,historyFrameId:tx?.frame?.id||null,atomic:true});return payload;
  }
  _occupiedIds(blocks){const ids=new Set();this.treeKernel.walk(blocks,block=>ids.add(block.id));return ids;}
  _reseed(blocks,occupied,allocateId=null){
    const created=[],mapping={};
    const allocate=sourceId=>{
      for(let attempt=0;attempt<10000;attempt++){
        const proposed=allocateId?allocateId({sourceId,created:[...created],attempt}):`${sourceId}-clipboard-${++this.identitySequence}`;
        const id=String(proposed||'');if(!id)throw clipboardError('IDENTITY_PROVIDER_FAILED','Clipboard identity provider returned an empty identity');if(occupied.has(id))continue;occupied.add(id);created.push(id);return id;
      }
      throw clipboardError('IDENTITY_PROVIDER_FAILED','Clipboard identity provider could not allocate a unique identity');
    };
    const reseed=block=>{const copy=clone(block),sourceId=copy.id,id=allocate(sourceId);mapping[sourceId]=id;copy.id=id;if(copy.children)copy.children=copy.children.map(reseed);return copy;};
    return {blocks:blocks.map(reseed),created,mapping};
  }
  _target(targetOrIndex,document){
    if(targetOrIndex==null)return {kind:'gap',parentId:null,index:document.blocks.length,depth:0};
    if(typeof targetOrIndex==='number')return {kind:'gap',parentId:null,index:Math.max(0,Math.min(Number(targetOrIndex),document.blocks.length)),depth:0};
    if(targetOrIndex?.kind==='gap')return clone(targetOrIndex);
    throw clipboardError('INVALID_TARGET','Structured paste target must be a canonical gap or root index');
  }
  paste(payload,targetOrIndex=this.readDocument().blocks.length,context={}){
    const available=this.availability('document.paste',{...context,payload});if(!available.enabled)throw clipboardError(available.code,available.reason);
    const value=available.payload,before=this.readDocument(),occupied=this._occupiedIds(before.blocks),reseeded=this._reseed(value.blocks,occupied,context.allocateId),baseTarget=this._target(targetOrIndex,before);let planned=clone(before.blocks),cursor=Number(baseTarget.index)||0;
    for(const block of reseeded.blocks){const target={...baseTarget,index:cursor++},result=this.mutationKernel.apply(planned,{type:'insert',target,block});if(!result.ok)throw clipboardError(result.code,result.reason);planned=result.blocks;}
    const tx=this.transact('document.paste',document=>{document.blocks=clone(planned)},{source:this.owner,presentation:{clipboardSource:clone(value.source)}}),inserted=reseeded.blocks.map(block=>block.id);
    this.selection.select(inserted,{mode:'replace',anchor:inserted[0]||null,focus:inserted.at(-1)||null});const selection=this.selection.descriptor();this._receipt('document.paste',{documentId:before.id,rootCount:inserted.length,inserted:[...inserted],createdIdentities:[...reseeded.created],identityMap:clone(reseeded.mapping),historyFrameId:tx?.frame?.id||null,trustBoundary:this.policy.htmlTrustPolicy,atomic:true});return {inserted,createdIdentities:[...reseeded.created],identityMap:clone(reseeded.mapping),selection,document:this.readDocument(),trust:available.trust};
  }
}

export {CLIPBOARD_TRUST_CONTRACT,CLIPBOARD_TRUST_POLICY};
