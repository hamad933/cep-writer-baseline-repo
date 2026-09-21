const clone=value=>structuredClone(value);

export const STRUCTURED_DRAG_DROP_CONTRACT=Object.freeze({
  id:'StructuredDragDropOwner',version:'1.0.0',compatibility:'SEMVER',owner:'Structured Family',policyRevision:'structured-drag-drop-w4d-r1'
});

export const STRUCTURED_DRAG_DROP_POLICY=Object.freeze({
  activationDistancePx:8,
  autoscrollEdgePx:56,
  autoscrollMaxStepPx:24,
  dropIndicatorDerivedOnly:true,
  mutationRoute:'StructuredMutationKernel',
  transactionRoute:'StructuredTransactionHistoryRecoveryOwner'
});

export class StructuredDragDropOwner{
  constructor({readDocument,readTransaction,targetPolicyOwner,executeMove,policy=STRUCTURED_DRAG_DROP_POLICY}={}){
    if(typeof readDocument!=='function')throw Error('STRUCTURED_DRAG_DROP_DOCUMENT_READER_REQUIRED');
    if(typeof readTransaction!=='function')throw Error('STRUCTURED_DRAG_DROP_TRANSACTION_READER_REQUIRED');
    if(!targetPolicyOwner?.validate||!targetPolicyOwner?.keyboardTarget)throw Error('STRUCTURED_DRAG_DROP_TARGET_POLICY_REQUIRED');
    if(typeof executeMove!=='function')throw Error('STRUCTURED_DRAG_DROP_MUTATION_ROUTE_REQUIRED');
    this.owner='StructuredDragDropOwner';this.contract=STRUCTURED_DRAG_DROP_CONTRACT;this.policy=policy;this.readDocument=readDocument;this.readTransaction=readTransaction;this.targetPolicyOwner=targetPolicyOwner;this.executeMove=executeMove;this.pointer=null;this.receiptLog=[];this.sequence=0;
  }
  descriptor(){return {owner:this.owner,contract:this.contract,policy:clone(this.policy),targetPolicyOwner:this.targetPolicyOwner.owner,pointer:this.pointer?clone(this.pointer):null,receiptCount:this.receiptLog.length};}
  _receipt(kind,extra={}){const receipt={sequence:++this.sequence,kind,owner:this.owner,policyRevision:this.contract.policyRevision,...clone(extra)};this.receiptLog.push(receipt);return clone(receipt);}
  receipts(){return clone(this.receiptLog);}
  beginPointer({sourceBlockId,pointerId=null,startX=0,startY=0}={}){
    const before=this.readDocument(),source=this.targetPolicyOwner.treeKernel.findRef(before.blocks,sourceBlockId);if(!source)return {ok:false,code:'UNKNOWN_BLOCK',reason:'Unknown Structured drag source',owner:this.owner};
    this.pointer={sourceBlockId,pointerId,startX:Number(startX)||0,startY:Number(startY)||0,active:false,target:null,validation:null,indicator:{visible:false,derived:true},autoscroll:{direction:'none',deltaY:0,derived:true}};
    return {ok:true,owner:this.owner,pointer:clone(this.pointer),receipt:this._receipt('pointer.begin',{sourceBlockId,pointerId})};
  }
  projectAutoscroll({clientY,viewportTop=0,viewportBottom}={}){
    const top=Number(viewportTop)||0,bottom=Number(viewportBottom),y=Number(clientY),edge=this.policy.autoscrollEdgePx,max=this.policy.autoscrollMaxStepPx;
    if(!Number.isFinite(y)||!Number.isFinite(bottom)||bottom<=top)return {direction:'none',deltaY:0,derived:true,owner:this.owner};
    if(y<top+edge){const ratio=Math.max(0,Math.min(1,(top+edge-y)/edge));return {direction:'up',deltaY:-Math.max(1,Math.round(max*ratio)),derived:true,owner:this.owner};}
    if(y>bottom-edge){const ratio=Math.max(0,Math.min(1,(y-(bottom-edge))/edge));return {direction:'down',deltaY:Math.max(1,Math.round(max*ratio)),derived:true,owner:this.owner};}
    return {direction:'none',deltaY:0,derived:true,owner:this.owner};
  }
  projectDropIndicator(validation){
    if(!validation)return {visible:false,derived:true,owner:this.owner};
    return {visible:true,derived:true,owner:this.owner,valid:!!validation.ok,code:validation.code,reason:validation.reason||'',targetIdentity:validation.targetIdentity??null,target:validation.target?clone(validation.target):null};
  }
  updatePointer({clientX=0,clientY=0,target=null,viewportTop=0,viewportBottom=0}={}){
    if(!this.pointer)return {ok:false,code:'DRAG_NOT_STARTED',reason:'Pointer drag has not been started',owner:this.owner};
    const dx=Number(clientX)-this.pointer.startX,dy=Number(clientY)-this.pointer.startY,distance=Math.hypot(dx,dy);
    if(!this.pointer.active&&distance>=this.policy.activationDistancePx)this.pointer.active=true;
    const validation=this.pointer.active&&target?this.targetPolicyOwner.validate(this.pointer.sourceBlockId,target,{route:'pointer-drag'}):null;
    this.pointer.target=target?clone(target):null;this.pointer.validation=validation?clone(validation):null;this.pointer.indicator=this.pointer.active?this.projectDropIndicator(validation):{visible:false,derived:true,owner:this.owner};this.pointer.autoscroll=this.pointer.active?this.projectAutoscroll({clientY,viewportTop,viewportBottom}):{direction:'none',deltaY:0,derived:true,owner:this.owner};
    return {ok:true,owner:this.owner,active:this.pointer.active,distance,validation:clone(validation),indicator:clone(this.pointer.indicator),autoscroll:clone(this.pointer.autoscroll)};
  }
  cancelPointer(reason='cancelled'){
    if(!this.pointer)return {ok:true,changed:false,owner:this.owner,code:'NO_ACTIVE_DRAG'};const sourceBlockId=this.pointer.sourceBlockId;this.pointer=null;return {ok:true,changed:false,owner:this.owner,code:'CANCELLED',receipt:this._receipt('pointer.cancel',{sourceBlockId,reason})};
  }
  _commit(sourceBlockId,validation,{route,transactionLabel}={}){
    if(!validation?.ok)return {ok:false,changed:false,owner:this.owner,code:validation?.code||'INVALID_TARGET',reason:validation?.reason||'Structured target validation failed',validation:clone(validation)};
    const beforeDocument=this.readDocument(),beforeTransaction=this.readTransaction(),result=this.executeMove({sourceBlockId,target:clone(validation.target),route,transactionLabel}),afterDocument=this.readDocument(),afterTransaction=this.readTransaction(),historyFrameDelta=afterTransaction.historyLength-beforeTransaction.historyLength;
    const changed=!!result?.changed;if(changed&&historyFrameDelta!==1)throw Error(`STRUCTURED_DRAG_DROP_NON_ATOMIC_TRANSACTION:${historyFrameDelta}`);if(!changed&&historyFrameDelta!==0)throw Error(`STRUCTURED_DRAG_DROP_FALSE_TRANSACTION:${historyFrameDelta}`);
    const receipt=this._receipt('reorder.commit',{route,sourceBlockId,targetIdentity:validation.targetIdentity,changed,mutationOwner:result?.owner??null,semanticOwner:result?.semanticOwner??null,availabilityOwner:result?.availabilityOwner??validation.availabilityOwner,transactionOwner:afterTransaction.owner,historyFrameDelta,beforeWorkingRevision:beforeTransaction.workingRevision,afterWorkingRevision:afterTransaction.workingRevision});
    return {...result,owner:this.owner,dragDropOwner:this.owner,targetPolicyOwner:this.targetPolicyOwner.owner,validation:clone(validation),historyFrameDelta,receipt,beforeDocumentId:beforeDocument.id,afterDocumentId:afterDocument.id};
  }
  commitPointer({target=null,transactionLabel='Structured pointer reorder'}={}){
    if(!this.pointer)return {ok:false,changed:false,owner:this.owner,code:'DRAG_NOT_STARTED',reason:'Pointer drag has not been started'};
    const pointer=clone(this.pointer);if(!pointer.active){this.pointer=null;return {ok:true,changed:false,owner:this.owner,code:'DRAG_THRESHOLD_NOT_REACHED',receipt:this._receipt('pointer.end.no-drag',{sourceBlockId:pointer.sourceBlockId})};}
    const validation=this.targetPolicyOwner.validate(pointer.sourceBlockId,target||pointer.target,{route:'pointer-drop'});this.pointer=null;return this._commit(pointer.sourceBlockId,validation,{route:'pointer',transactionLabel});
  }
  reorderKeyboard(sourceBlockId,direction,{transactionLabel=`Structured keyboard reorder ${direction}`}={}){
    const validation=this.targetPolicyOwner.keyboardTarget(sourceBlockId,direction);return this._commit(sourceBlockId,validation,{route:`keyboard-${direction}`,transactionLabel});
  }
}
