import {RUNTIME_ADAPTER_CONTRACT} from '../foundation/contracts/runtime-adapter.js';

/**
 * NON-DOMAIN CONTRACT FIXTURE ONLY.
 * This is not a second real RuntimeAdapter provider and MUST NOT be used as M6 evidence.
 */
export class W4FNonDomainRuntimeContractFixture {
  constructor(){this.kind='W4FContractFixtureNonDomain';this.connected=true;this.sessions=new Map([['fixture-session-1',{id:'fixture-session-1',deviceId:'fixture-device',runId:'CONTRACT-FIXTURE',epoch:0,recorded:true,lines:[{command:'fixture-input',output:'fixture-source-output'}],history:[]}]]);}
  descriptor(){return {contract:RUNTIME_ADAPTER_CONTRACT,id:this.kind,label:'Contract fixture (non-domain)',inputLabel:'fixture >',help:'Fixture source projection only',commandOwner:'NONE_NON_DOMAIN_FIXTURE',sessionOwner:this.kind,capabilities:['PRESENTATION_SHAPE_ONLY'],prompt:session=>`fixture:${session.deviceId} >`};}
  session(id){return this.sessions.get(id)||null;}
  input(){throw Error('CONTRACT_FIXTURE_INPUT_NOT_SUPPORTED');}
  recorded(){return {kind:'CONTRACT_FIXTURE_NON_DOMAIN',readOnly:true,events:[],devices:[]};}
}
export const W4F_CONTRACT_FIXTURE_CLASSIFICATION='CONTRACT_FIXTURE_NON_DOMAIN_NOT_M6_EVIDENCE';
