export const CONFIRMATION_SAFETY_OWNER='ConfirmationSafetyHost';
export const DESTRUCTIVE_RISK_DESCRIPTOR_CONTRACT=Object.freeze({
  id:'DestructiveRiskDescriptor',
  version:'1.0.0',
  compatibility:'SEMVER',
  source:'EXPLICIT_CALLER_DESCRIPTOR_ONLY'
});
export const CONFIRMATION_SAFETY_POLICY=Object.freeze({
  id:'ConfirmationSafetyPolicy',
  revision:'w4g-confirmation-safety-v1',
  explicitRiskRequired:true,
  refuseContradictoryDestructiveDescriptor:true,
  codes:Object.freeze({missingRisk:'CONFIRMATION_RISK_DESCRIPTOR_REQUIRED',contradiction:'CONFIRMATION_RISK_DESCRIPTOR_CONTRADICTION'}),
  dialog:Object.freeze({role:'alertdialog',ariaModal:'true'})
});
export const CONFIRMATION_SAFETY_CONTRACT=Object.freeze({
  id:CONFIRMATION_SAFETY_OWNER,
  version:'1.0.0',
  kind:'presentation-safety-gate-only',
  riskSource:'explicit-descriptor',
  guessesDestructiveRisk:false,
  executesAction:false,
  ownsCommandAvailability:false,
  ownsDomainSemantics:false,
  ownsDomainCopy:false
});

const isObject=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const text=(value,code)=>{const result=String(value??'').trim();if(!result)throw Error(code);return result};
const freeze=value=>Object.freeze(value);
const clone=value=>value==null?value:structuredClone(value);

export function validateDestructiveRiskDescriptor(input){
  if(!isObject(input))throw Error('CONFIRMATION_RISK_DESCRIPTOR_REQUIRED');
  const actionId=text(input.actionId,'CONFIRMATION_ACTION_ID_REQUIRED');
  const sourceOwner=text(input.sourceOwner,'CONFIRMATION_SOURCE_OWNER_REQUIRED');
  if(typeof input.destructive!=='boolean')throw Error('CONFIRMATION_DESTRUCTIVE_BOOLEAN_REQUIRED');
  if(typeof input.confirmationRequired!=='boolean')throw Error('CONFIRMATION_REQUIRED_BOOLEAN_REQUIRED');
  if(input.destructive&&!input.confirmationRequired)throw Error('CONFIRMATION_RISK_DESCRIPTOR_CONTRADICTION:DESTRUCTIVE_WITHOUT_CONFIRMATION');
  const riskCode=text(input.riskCode,'CONFIRMATION_RISK_CODE_REQUIRED');
  if(!isObject(input.copy))throw Error('CONFIRMATION_COPY_REQUIRED');
  const copy={
    title:text(input.copy.title,'CONFIRMATION_COPY_TITLE_REQUIRED'),
    message:text(input.copy.message,'CONFIRMATION_COPY_MESSAGE_REQUIRED'),
    confirmLabel:text(input.copy.confirmLabel,'CONFIRMATION_COPY_CONFIRM_LABEL_REQUIRED'),
    cancelLabel:text(input.copy.cancelLabel,'CONFIRMATION_COPY_CANCEL_LABEL_REQUIRED')
  };
  if(!isObject(input.canonicalTruth))throw Error('CONFIRMATION_CANONICAL_TRUTH_REQUIRED');
  const canonicalTruth=clone(input.canonicalTruth);
  text(canonicalTruth.owner,'CONFIRMATION_TRUTH_OWNER_REQUIRED');
  return freeze({contract:DESTRUCTIVE_RISK_DESCRIPTOR_CONTRACT,actionId,sourceOwner,destructive:input.destructive,confirmationRequired:input.confirmationRequired,riskCode,copy:freeze(copy),canonicalTruth:freeze(canonicalTruth),scope:clone(input.scope??null)});
}

/**
 * Presentation/safety host only. It never inspects action names, mutation types,
 * command registries or payloads to decide danger. The risk descriptor is the
 * sole destructive-risk input and action execution remains external.
 */
export class ConfirmationSafetyHost{
  constructor({policy=CONFIRMATION_SAFETY_POLICY}={}){this.policy=policy;this.sequence=0;this.pending=new Map();this.receipts=[];}
  request(input={}){
    if(!isObject(input.risk))return this.refuse(this.policy?.codes?.missingRisk||'CONFIRMATION_RISK_DESCRIPTOR_REQUIRED',{actionId:input.actionId??null,reason:'EXPLICIT_RISK_DESCRIPTOR_MISSING'});
    let risk;
    try{risk=validateDestructiveRiskDescriptor(input.risk)}catch(error){return this.refuse(String(error?.message||error),{actionId:input.actionId??input.risk?.actionId??null,reason:'INVALID_RISK_DESCRIPTOR'});}
    if(input.actionId!=null&&String(input.actionId)!==risk.actionId)return this.refuse(this.policy?.codes?.contradiction||'CONFIRMATION_RISK_DESCRIPTOR_CONTRADICTION',{actionId:String(input.actionId),descriptorActionId:risk.actionId,reason:'ACTION_ID_MISMATCH'});
    if(!risk.confirmationRequired){const receipt=freeze({accepted:true,code:'CONFIRMATION_NOT_REQUIRED',actionId:risk.actionId,destructive:risk.destructive,confirmationRequired:false,sourceOwner:risk.sourceOwner,riskCode:risk.riskCode,executesAction:false,policyRevision:this.policy.revision});this.receipts.push(receipt);return receipt;}
    const id=`confirmation-${++this.sequence}`;
    const projection=freeze({id,actionId:risk.actionId,sourceOwner:risk.sourceOwner,destructive:risk.destructive,confirmationRequired:true,riskCode:risk.riskCode,copy:risk.copy,canonicalTruth:risk.canonicalTruth,scope:risk.scope,policyRevision:this.policy.revision,executesAction:false});
    this.pending.set(id,projection);
    const receipt=freeze({accepted:true,code:'CONFIRMATION_PRESENTED',confirmationId:id,actionId:risk.actionId,destructive:risk.destructive,confirmationRequired:true,executesAction:false,projection});
    this.receipts.push(receipt);return receipt;
  }
  confirm(id){const projection=this.pending.get(id);if(!projection)return this.refuse('CONFIRMATION_REQUEST_NOT_FOUND',{confirmationId:id,reason:'UNKNOWN_CONFIRMATION'});this.pending.delete(id);const receipt=freeze({accepted:true,code:'CONFIRMED',confirmationId:id,actionId:projection.actionId,sourceOwner:projection.sourceOwner,riskCode:projection.riskCode,executesAction:false,authorizationOnly:true,canonicalTruth:projection.canonicalTruth});this.receipts.push(receipt);return receipt;}
  cancel(id){const projection=this.pending.get(id);if(!projection)return this.refuse('CONFIRMATION_REQUEST_NOT_FOUND',{confirmationId:id,reason:'UNKNOWN_CONFIRMATION'});this.pending.delete(id);const receipt=freeze({accepted:false,code:'CONFIRMATION_CANCELLED',confirmationId:id,actionId:projection.actionId,sourceOwner:projection.sourceOwner,riskCode:projection.riskCode,executesAction:false});this.receipts.push(receipt);return receipt;}
  refuse(code,extra={}){const receipt=freeze({accepted:false,code:String(code),owner:CONFIRMATION_SAFETY_OWNER,executesAction:false,policyRevision:this.policy.revision,...extra});this.receipts.push(receipt);return receipt;}
  snapshot(){return freeze({owner:CONFIRMATION_SAFETY_OWNER,contract:CONFIRMATION_SAFETY_CONTRACT,policyRevision:this.policy.revision,pending:freeze([...this.pending.values()]),pendingCount:this.pending.size,guessesDestructiveRisk:false,executesAction:false,commandAvailabilityOwned:false});}
}

/** Accessible DOM projection helper; confirmation result is a receipt, never action execution. */
export class ConfirmationSafetyProjector{
  constructor(host,{document:doc=globalThis.document,root=null}={}){if(!(host instanceof ConfirmationSafetyHost))throw Error('CONFIRMATION_HOST_REQUIRED');if(!doc?.createElement)throw Error('CONFIRMATION_DOCUMENT_REQUIRED');this.host=host;this.document=doc;this.root=root||doc.body;this.node=null;this.onReceipt=null;}
  present(requestInput){const receipt=this.host.request(requestInput);if(!receipt.accepted||receipt.code!=='CONFIRMATION_PRESENTED')return receipt;this.dismissDom();const p=receipt.projection,dialog=this.document.createElement('section'),title=this.document.createElement('h2'),message=this.document.createElement('p'),confirm=this.document.createElement('button'),cancel=this.document.createElement('button');title.id=`${p.id}-title`;message.id=`${p.id}-message`;dialog.dataset.confirmationSafetyHost=CONFIRMATION_SAFETY_OWNER;dialog.dataset.confirmationId=p.id;dialog.setAttribute('role',this.host.policy.dialog.role);dialog.setAttribute('aria-modal',this.host.policy.dialog.ariaModal);dialog.setAttribute('aria-labelledby',title.id);dialog.setAttribute('aria-describedby',message.id);title.textContent=p.copy.title;message.textContent=p.copy.message;confirm.type='button';cancel.type='button';confirm.textContent=p.copy.confirmLabel;cancel.textContent=p.copy.cancelLabel;confirm.dataset.confirmAction=p.actionId;cancel.dataset.cancelAction=p.actionId;confirm.onclick=()=>{const result=this.host.confirm(p.id);this.dismissDom();if(typeof this.onReceipt==='function')this.onReceipt(result)};cancel.onclick=()=>{const result=this.host.cancel(p.id);this.dismissDom();if(typeof this.onReceipt==='function')this.onReceipt(result)};dialog.append(title,message,confirm,cancel);this.root.append(dialog);this.node=dialog;confirm.focus();return receipt;}
  dismissDom(){this.node?.remove?.();this.node=null;}
}
