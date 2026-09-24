import {BOTTOM_DEEP_WORK_PROVIDER_CONTRACT} from '../foundation/global/bottom-provider-contract.js';

const clone=value=>structuredClone(value);

/** Read-only projection over canonical Structured history/recovery truth. */
export class StructuredBottomProvider {
  constructor(adapter,{id='structured.history-recovery',label='History & recovery'}={}){
    if(!adapter||typeof adapter.transactionDescriptor!=='function'||typeof adapter.historyProjection!=='function'||typeof adapter.listRecovery!=='function')throw Error('STRUCTURED_BOTTOM_SOURCE_REQUIRED');
    const descriptor=adapter.transactionDescriptor();
    if(descriptor.owner!=='StructuredTransactionHistoryRecoveryOwner')throw Error('STRUCTURED_BOTTOM_CANONICAL_OWNER_REQUIRED');
    this.adapter=adapter;
    this.providerId=id;
    this.label=label;
  }
  descriptor(){return {contract:BOTTOM_DEEP_WORK_PROVIDER_CONTRACT,id:this.providerId,label:this.label,family:'structured',contentKind:'history-recovery',sourceOwner:'StructuredTransactionHistoryRecoveryOwner',readOnly:true,ownsCanonicalContent:false};}
  read(){
    const tx=this.adapter.transactionDescriptor(),history=this.adapter.historyProjection(),recovery=this.adapter.listRecovery(tx.documentId);
    return {
      providerId:this.providerId,family:'structured',contentKind:'history-recovery',sourceOwner:tx.owner,readOnly:true,ownsCanonicalContent:false,
      documentId:tx.documentId,workingRevision:tx.workingRevision,committedRevision:tx.committedRevision,dirty:tx.dirty,
      historyIndex:tx.historyIndex,historyLength:tx.historyLength,canUndo:tx.canUndo,canRedo:tx.canRedo,recoveryCount:tx.recoveryCount,
      history:history.map(frame=>({id:frame.id,label:frame.label,workingRevision:frame.workingRevision,presentation:clone(frame.presentation??null)})),
      recovery:clone(recovery)
    };
  }
}
