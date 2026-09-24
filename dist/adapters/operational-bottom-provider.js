import {BOTTOM_DEEP_WORK_PROVIDER_CONTRACT} from '../foundation/global/bottom-provider-contract.js';
import {RUNTIME_ADAPTER_CONTRACT} from '../foundation/operational.js';
import {normalizeOperationalTerminalState} from '../foundation/operational/presentation.js';

const clone=value=>structuredClone(value);

/** Read-only projection over canonical Operational runtime/session evidence. */
export class OperationalBottomProvider {
  constructor(runtime,{id='operational.runtime-session',label='Runtime evidence'}={}){
    if(!runtime||typeof runtime.descriptor!=='function'||typeof runtime.recorded!=='function')throw Error('OPERATIONAL_BOTTOM_SOURCE_REQUIRED');
    const descriptor=runtime.descriptor();
    if(descriptor.contract?.id!==RUNTIME_ADAPTER_CONTRACT.id)throw Error('OPERATIONAL_BOTTOM_RUNTIME_CONTRACT_REQUIRED');
    this.runtime=runtime;
    this.providerId=id;
    this.label=label;
  }
  descriptor(){const source=this.runtime.descriptor();return {contract:BOTTOM_DEEP_WORK_PROVIDER_CONTRACT,id:this.providerId,label:this.label,family:'operational',contentKind:'runtime-session-evidence',sourceOwner:source.sessionOwner||source.id,readOnly:true,ownsCanonicalContent:false};}
  read(){
    const source=this.runtime.descriptor(),recorded=this.runtime.recorded(),sessions=[...(this.runtime.sessions?.values?.()||[])].map(session=>({id:session.id,deviceId:session.deviceId,runId:session.runId,epoch:session.epoch,recorded:!!session.recorded,presentationState:normalizeOperationalTerminalState(source,session),lines:clone(session.lines||[])}));
    return {
      providerId:this.providerId,family:'operational',contentKind:'runtime-session-evidence',sourceOwner:source.sessionOwner||source.id,readOnly:true,ownsCanonicalContent:false,
      runId:recorded.runId,connected:this.runtime.connected!==false,epoch:this.runtime.epoch??null,runtimeTruth:source.runtimeTruth||source.id,
      nativeTerminal:source.nativeTerminal===true,pty:source.pty===true,powershell:source.powershell===true,ssh:source.ssh===true,persistence:source.persistence===true,
      sessions,events:clone(recorded.events||[]),sourceEvents:clone(recorded.sourceEvents||[]),devices:clone(recorded.devices||[]),
      lifecycle:clone(recorded.lifecycle??null),lineage:recorded.lineage??null
    };
  }
}
