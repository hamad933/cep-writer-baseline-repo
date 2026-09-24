import {RUNTIME_ADAPTER_CONTRACT} from '../foundation/operational.js';
/** Canonical simulated device state. It has no terminal or presentation knowledge. */
export class SimulatedDeviceEngine {
  constructor(devices){this.devices=structuredClone(devices);}
  device(id){const device=this.devices.find(d=>d.id===id);if(!device)throw Error('UNKNOWN_DEVICE');return device;}
  apply(id,semantic){const device=this.device(id);if(semantic==='device.shutdown'){const changed=device.up===true;device.up=false;return {changed,state:'DOWN'}}if(semantic==='device.enable'){const changed=device.up===false;device.up=true;return {changed,state:'UP'}}return {changed:false,state:device.up?'UP':'DOWN'};}
}
/** Deterministic in-browser adapter. Parser, simulation engine and receipts are explicit boundaries. */
export class InternalSimulationAdapter {
  constructor(){this.kind='InternalSimulationAdapter';this.runId='simulation-001';this.engine=new SimulatedDeviceEngine([{id:'device-a',name:'Router A',up:true,capabilities:['OPEN_TERMINAL']},{id:'device-b',name:'Switch B',up:true,capabilities:['OPEN_TERMINAL']},{id:'note-c',name:'Design note',up:null,capabilities:[]}]);this.devices=this.engine.devices;this.sessions=new Map();this.events=[];this.invocations=new Map();this.authored=JSON.stringify(this.devices);this.epoch=1;this.connected=true;this.nextSession=1;this.presentationSequence=0;}
  capable(id){return this.devices.find(d=>d.id===id)?.capabilities.includes('OPEN_TERMINAL')===true;}
  descriptor(){return {contract:RUNTIME_ADAPTER_CONTRACT,id:this.kind,label:'Internal simulation',inputLabel:'sim >',help:'Commands: help, show status, show topology, shutdown, no shutdown',commandOwner:this.kind,sessionOwner:this.kind,capabilities:['OPEN_TERMINAL','runtime.input','runtime.recorded'],connected:this.connected,runtimeTruth:'INTERNAL_SIMULATION',nativeTerminal:false,pty:false,powershell:false,ssh:false,persistence:false,prompt:session=>`sim:${session.deviceId} >`};}
  session(id){return this.sessions.get(id)||null;}
  _transition(session,state,detail){const transition={sequence:++this.presentationSequence,state,detail:String(detail||'')};const prior=Array.isArray(session.presentation?.transitions)?session.presentation.transitions:[];session.presentation={state,detail:transition.detail,sequence:transition.sequence,transitions:[...prior,transition].slice(-12)};return transition;}
  open(id){if(!this.capable(id))throw Error('CAPABILITY_UNAVAILABLE');let s=[...this.sessions.values()].find(s=>s.deviceId===id);if(!s){s={id:`sim-session-${this.nextSession++}`,deviceId:id,runId:this.runId,epoch:this.epoch,recorded:false,lines:[],history:[],presentation:{state:'idle',detail:'Internal simulation ready.',sequence:0,transitions:[]}};this.sessions.set(s.id,s)}else if(this.connected&&s.epoch===this.epoch&&s.presentation?.state==='unavailable')this._transition(s,'idle','Internal simulation available.');return s;}
  parse(command){const value=command.trim().toLowerCase(),known={'show status':'device.status','shutdown':'device.shutdown','no shutdown':'device.enable','show topology':'topology.show','help':'runtime.help'};return {id:known[value]||'runtime.unsupported',raw:command};}
  input(sessionId,command,invocationId){const digest=JSON.stringify([sessionId,command]);if(this.invocations.has(invocationId)){const r=this.invocations.get(invocationId);if(r.digest!==digest)throw Error('INVOCATION_COLLISION');return r.receipt}const s=this.sessions.get(sessionId);if(!s)throw Error('STALE_SESSION');if(!this.connected){this._transition(s,'unavailable','Internal simulation provider is disconnected.');throw Error('PROVIDER_DISCONNECTED')}if(s.epoch!==this.epoch){this._transition(s,'unavailable','Session epoch is stale. Reopen or reconnect the simulated session.');throw Error('STALE_SESSION')}if(s.recorded){this._transition(s,'read-only','Recorded simulation evidence is read only.');throw Error('RECORDED_READ_ONLY')}const d=this.engine.device(s.deviceId),semantic=this.parse(command);this._transition(s,'running',`Executing ${semantic.id} in InternalSimulationAdapter.`);let output,changed=false;
    try{
      if(semantic.id==='device.status')output=`${d.name}: ${d.up?'UP':'DOWN'}; run=${this.runId}; epoch=${this.epoch}`;
      else if(semantic.id==='device.shutdown'||semantic.id==='device.enable'){const result=this.engine.apply(d.id,semantic.id);changed=result.changed;output=`${d.name}: interface ${result.state} (simulation)`;}
      else if(semantic.id==='topology.show')output=this.devices.filter(d=>this.capable(d.id)).map(d=>`${d.id}=${d.up?'UP':'DOWN'}`).join('\n');
      else if(semantic.id==='runtime.help')output='show status | show topology | shutdown | no shutdown | help';
      else output=`Unsupported simulation command: ${command}. Type help.`;
      const terminalState=semantic.id==='runtime.unsupported'?'error':'completed',detail=terminalState==='error'?'Command is unsupported by InternalSimulationAdapter.':`Completed ${semantic.id} in InternalSimulationAdapter.`;
      this._transition(s,terminalState,detail);
      const receipt={sequence:this.events.length+1,sessionId,deviceId:d.id,command,semanticCommand:semantic.id,output,changed,provider:this.kind,runtimeTruth:'INTERNAL_SIMULATION',presentation:structuredClone(s.presentation)};this.events.push(receipt);s.lines.push({command,semanticCommand:semantic.id,output});s.history.push(command);this.invocations.set(invocationId,{digest,receipt});return receipt;
    }catch(error){this._transition(s,'error',String(error?.message||error));throw error}
  }
  disconnect(){this.connected=false;this.epoch++;for(const session of this.sessions.values())this._transition(session,'unavailable','Internal simulation provider is disconnected.');}
  reconnect(id){const s=this.sessions.get(id);if(!s)throw Error('UNKNOWN_SESSION');this.connected=true;s.epoch=this.epoch;this._transition(s,'idle','Internal simulation reconnected.');return s;}
  recorded(){return {kind:'RecordedResult',readOnly:true,runId:this.runId,events:structuredClone(this.events),devices:structuredClone(this.devices),runtimeTruth:'INTERNAL_SIMULATION',nativeTerminal:false,pty:false,powershell:false,ssh:false,persistence:false}}
}
