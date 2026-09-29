import {SemanticCommandBus} from '../../foundation/global/commands.js';

export const CONFIG_COMMAND_LABELS=Object.freeze({'configuration.edit':'Edit proposal','configuration.diff':'Diff observed vs proposal','configuration.validate':'Validate proposal','configuration.reset':'Discard proposal','configuration.requestApply':'Request application authority'});
export const CONFIGURATION_DOMAIN_OWNER='ConfigurationDomainAdapter';
export const CONFIGURATION_COMMANDS=Object.freeze(['configuration.edit','configuration.diff','configuration.validate','configuration.reset','configuration.requestApply']);
export type ConfigObservationState='AVAILABLE'|'STALE'|'UNAVAILABLE'|'ERROR';
export type ConfigProposalState='DRAFT'|'VALIDATED'|'INVALID'|'AUTHORITY_PENDING';
export type ConfigApplicationState='NOT_APPLIED'|'APPLY_REQUESTED'|'APPLIED'|'RESTART_REQUIRED';
export type ConfigObservation={key:string;presentVersion:string;redactedValue:string;source:string;observedAt:string;restartRequired:boolean;state:ConfigObservationState};
export type ConfigProposal={key:string;baseVersion:string;proposedValue:string;validation:{ok:boolean;reason:string};state:ConfigProposalState;application:ConfigApplicationState};
export type ConfigAuthority={id:string;requestApply:(proposal:ConfigProposal)=>{status:'APPLY_REQUESTED'|'APPLIED'|'RESTART_REQUIRED';authorityId:string;appliedVersion?:string}};
export type ConfigProposalPolicy=(key:string,observation:ConfigObservation)=>{allowed:boolean;reason:string};

const clone=<T>(value:T):T=>structuredClone(value);
const sensitiveKey=/(?:password|passwd|secret|token|credential|private[-_. ]?key|api[-_. ]?key)/i;
const defaultProposalPolicy:ConfigProposalPolicy=(key)=>sensitiveKey.test(key)?{allowed:false,reason:'SENSITIVE_CONFIG_KEY_EXCLUDED'}:{allowed:true,reason:'ALLOWLISTED_OPERATIONAL_CONFIG_KEY'};
const safeObservation=(row:ConfigObservation)=>{
  if(!row?.key||!row.presentVersion||!row.source||!row.observedAt)throw Error('CONFIG_OBSERVATION_IDENTITY_REQUIRED');
  if(!['AVAILABLE','STALE','UNAVAILABLE','ERROR'].includes(row.state))throw Error('CONFIG_OBSERVATION_STATE_INVALID');
  if(typeof row.redactedValue!=='string')throw Error('CONFIG_REDACTED_VALUE_REQUIRED');
  return clone(row);
};

export class ConfigurationDomainAdapter{
  readonly owner=CONFIGURATION_DOMAIN_OWNER;
  private observations:ConfigObservation[];
  private proposals=new Map<string,ConfigProposal>();
  private authority:ConfigAuthority|null;
  private validator:(key:string,value:string)=>{ok:boolean;reason:string};
  private proposalPolicy:ConfigProposalPolicy;
  private selectedKey:string|null=null;
  private history:any[]=[]; lastAction:any=null;
  constructor({observations=[],authority=null,validator=(key,value)=>({ok:Boolean(key)&&value.length<=4096,reason:Boolean(key)&&value.length<=4096?'SAFE_VALUE_VALIDATED':'INVALID_SAFE_VALUE'}),proposalPolicy=defaultProposalPolicy}:{observations?:ConfigObservation[];authority?:ConfigAuthority|null;validator?:(key:string,value:string)=>{ok:boolean;reason:string};proposalPolicy?:ConfigProposalPolicy}={}){
    this.observations=observations.map(safeObservation);this.authority=authority;this.validator=validator;this.proposalPolicy=proposalPolicy;
  }
  rows(){return this.observations.map(clone);}
  select(key:string|null){if(key!==null&&!this.observations.some(row=>row.key===key))throw Error('CONFIG_OBSERVATION_UNKNOWN');this.selectedKey=key;return this.selected();}
  selected(){return this.selectedKey?clone(this.observations.find(row=>row.key===this.selectedKey)||null):null;}
  proposal(key=this.selectedKey){return key&&this.proposals.has(key)?clone(this.proposals.get(key)!):null;}
  observeState(){if(!this.observations.length)return {code:'EMPTY_SCOPE',truth:'No visible whitelisted operational keys. This is not an all-config dump.'};return {code:'ROWS_AVAILABLE',count:this.observations.length,scope:'SAFE_OPERATIONAL_ALLOWLIST_ONLY'};}
  private editableObservation(key:string){const row=this.observations.find(item=>item.key===key);if(!row)throw Error('CONFIG_OBSERVATION_UNKNOWN');if(row.state!=='AVAILABLE'&&row.state!=='STALE')throw Error('CONFIG_SOURCE_NOT_EDITABLE');const policy=this.proposalPolicy(row.key,clone(row));if(!policy?.allowed)throw Error(policy?.reason||'CONFIG_PROPOSAL_POLICY_REJECTED');return row;}
  beginProposal(key:string,proposedValue:string){const row=this.editableObservation(key);const value=String(proposedValue);const proposal:ConfigProposal={key,baseVersion:row.presentVersion,proposedValue:value,validation:{ok:false,reason:'NOT_VALIDATED'},state:'DRAFT',application:'NOT_APPLIED'};this.proposals.set(key,proposal);this.history.push({type:'PROPOSAL_DRAFTED',key,baseVersion:row.presentVersion,operationalWrite:false});return clone(proposal);}
  validate(key=this.selectedKey){const proposal=key?this.proposals.get(key):null;if(!proposal)throw Error('CONFIG_PROPOSAL_REQUIRED');const row=this.observations.find(item=>item.key===proposal.key);if(!row)throw Error('CONFIG_OBSERVATION_UNKNOWN');if(row.presentVersion!==proposal.baseVersion){proposal.state='INVALID';proposal.application='NOT_APPLIED';proposal.validation={ok:false,reason:'VERSION_CONFLICT'};this.history.push({type:'PROPOSAL_STALE',key:proposal.key,presentVersion:row.presentVersion,baseVersion:proposal.baseVersion,application:'NOT_APPLIED'});return clone(proposal);}const result=this.validator(proposal.key,proposal.proposedValue);proposal.validation=clone(result);proposal.state=result.ok?'VALIDATED':'INVALID';proposal.application='NOT_APPLIED';this.history.push({type:'PROPOSAL_VALIDATED',key:proposal.key,ok:result.ok,reason:result.reason,application:'NOT_APPLIED',operationalWrite:false,restartAuthorized:false});return clone(proposal);}
  reset(key=this.selectedKey){if(!key)return {ok:false,code:'CONFIG_PROPOSAL_REQUIRED'};const existed=this.proposals.delete(key),observed=this.observations.find(row=>row.key===key);if(existed)this.history.push({type:'PROPOSAL_DISCARDED',key,presentVersion:observed?.presentVersion??null,operationalWrite:false});return {ok:existed,code:existed?'PROPOSAL_DISCARDED':'NO_PROPOSAL',observed:observed?.redactedValue??null,presentVersion:observed?.presentVersion??null,liveConfigMutation:false,factoryReset:false};}
  diff(key=this.selectedKey){const observed=key?this.observations.find(row=>row.key===key):null,proposal=key?this.proposals.get(key):null;if(!observed)return {ok:false,code:'CONFIG_OBSERVATION_REQUIRED'};return {ok:true,key:observed.key,presentVersion:observed.presentVersion,observedRedacted:observed.redactedValue,source:observed.source,restartRequired:observed.restartRequired,proposal:proposal?{key:proposal.key,baseVersion:proposal.baseVersion,proposedValue:proposal.proposedValue,validation:clone(proposal.validation),state:proposal.state,application:proposal.application}:null,redactionApplied:true,containsObservedPlaintext:false};}
  requestApply(key=this.selectedKey){const proposal=key?this.proposals.get(key):null;if(!proposal)throw Error('CONFIG_PROPOSAL_REQUIRED');if(proposal.state!=='VALIDATED')throw Error('CONFIG_PROPOSAL_NOT_VALIDATED');if(!this.authority){proposal.state='AUTHORITY_PENDING';proposal.application='NOT_APPLIED';this.history.push({type:'AUTHORITY_UNAVAILABLE',key:proposal.key,application:'NOT_APPLIED'});return {ok:false,code:'AUTHORITY_PENDING',proposal:clone(proposal),authorityBound:true,settingsCanApply:false};}proposal.state='AUTHORITY_PENDING';proposal.application='APPLY_REQUESTED';const result=this.authority.requestApply(clone(proposal));if(!result?.authorityId||result.authorityId!==this.authority.id)throw Error('CONFIG_AUTHORITY_ID_REQUIRED');proposal.application=result.status;this.history.push({type:'APPLY_AUTHORITY_RESULT',key:proposal.key,status:result.status,authorityId:result.authorityId,authorityBound:true});return {ok:true,code:result.status,authorityId:result.authorityId,proposal:clone(proposal),authorityBound:true,settingsCanApply:false};}
  availability(id:string,payload:any={}){const key=payload.key??this.selectedKey,proposal=key?this.proposals.get(key):null,row=key?this.observations.find(item=>item.key===key):null;if(id==='configuration.edit'){if(!row||!(row.state==='AVAILABLE'||row.state==='STALE'))return 'Select an available whitelisted ConfigObservation';const policy=this.proposalPolicy(row.key,clone(row));return policy?.allowed?true:(policy?.reason||'Config key is not proposal-safe');}if(id==='configuration.diff')return row?true:'Select a ConfigObservation';if(id==='configuration.validate')return proposal?true:'Create a ConfigProposal first';if(id==='configuration.reset')return proposal?true:'No ConfigProposal to discard';if(id==='configuration.requestApply'){if(!proposal||proposal.state!=='VALIDATED')return 'Validated ConfigProposal required';if(!this.authority)return 'ConfigAuthority unavailable; request remains authority-pending';return true;}return 'Unknown Configuration command';}
  /** Authoritative single-location projection of one ConfigObservation: observed value, the
      proposal bound to it, the declared ceilings and the profile invariants. */
  inspect(key=this.selectedKey){
    const row=key?this.observations.find(item=>item.key===key):null;
    if(!row)return {ok:false as const,code:'NO_CONFIG_OBSERVATION',requirements:['key','presentVersion','source','observedAt']};
    const proposal=this.proposal(row.key);
    return {
      key:row.key,presentVersion:row.presentVersion,redactedValue:row.redactedValue,source:row.source,observedAt:row.observedAt,restartRequired:row.restartRequired,state:row.state,
      proposal:proposal?{key:proposal.key,baseVersion:proposal.baseVersion,state:proposal.state,application:proposal.application,validation:clone(proposal.validation)}:'ABSENT',
      ceilings:{editMutatesOperationalConfig:false,validateImpliesApply:false,resetFactoryResetsOperationalConfig:false,requestApplyRequiresExplicitAuthority:true,duplicateSettingsEngine:false,settingsCanDispatchOperationalConfigApply:false},
      invariants:['UI preferences never modify operational configuration','Present value is not approved value','Default is observation/proposal until newer mutation authority exists','Reset means discard proposal/reveal present value, not factory-reset production'],
      epistemic:{empty:'Whitelist has no visible keys: explicit empty scope, not all-config dump.',stale:'Source changed since proposal: version conflict and refreshed diff.',unavailable:'Config source inaccessible: unknown value; never substitute defaults as observed fact.',error:'Sensitive/unknown key rejected before storage/logging; safe reason only.'},
      timeline:this.history.filter(entry=>entry.key===row.key).map(entry=>({type:entry.type,detail:entry.reason||entry.state||entry.application||'RECORDED'})),
      lastAction:this.lastAction||null,
      commandAvailability:Object.fromEntries(Object.entries({edit:['configuration.edit',{key:row.key}],diff:['configuration.diff',{key:row.key}],validate:['configuration.validate',{key:row.key}],reset:['configuration.reset',{key:row.key}],requestApply:['configuration.requestApply',{key:row.key}]}).map(([k,v]:any)=>{let r:any='';try{r=this.availability(v[0],v[1])}catch(e){r='ERROR'}return [k,r===true?'AVAILABLE':(typeof r==='string'?r:(r?.reason||r?.code||'UNAVAILABLE'))]})),
      ok:true
    };
  }
  bindCommands(bus:SemanticCommandBus){for(const id of CONFIGURATION_COMMANDS){const label=id.split('.').at(-1)!.replace(/([A-Z])/g,' $1');bus.registerCommand(id,this.owner,CONFIG_COMMAND_LABELS[id]||label,p=>{const key=p.key??this.selectedKey;const run=()=>{if(id==='configuration.edit')return this.beginProposal(key,p.proposedValue??'');if(id==='configuration.diff')return this.diff(key);if(id==='configuration.validate')return this.validate(key);if(id==='configuration.reset')return this.reset(key);return this.requestApply(key)};let result:any;try{result=run()}catch(error){this.lastAction={commandId:id,ok:false,code:String((error as any)?.message||error),key,at:new Date().toISOString()};throw error}this.lastAction={commandId:id,ok:result?.ok!==false,code:String(result?.code||result?.state||'RECORDED'),key,at:new Date().toISOString()};return result;},p=>this.availability(id,p));}return bus;}
  diagnosticProjection(){return {owner:this.owner,selectedKey:this.selectedKey,observations:this.rows(),proposals:[...this.proposals.values()].map(({proposedValue,...proposal})=>({...clone(proposal),proposedValue:'[PROPOSAL_VALUE_WITHHELD_FROM_DIAGNOSTICS]'})),history:clone(this.history),operationalConfig:{presentValues:'OBSERVED_READ_ONLY',proposalEditing:'LOCAL_PROPOSAL_ONLY',validationImpliesApply:false,resetMutatesLiveConfig:false},settingsBoundary:{owner:'SettingsCenterOwner',role:'GLOBAL_PREFERENCES_ONLY',canDispatchOperationalConfigApply:false},providerTruth:this.authority?'EXPLICIT_CONFIG_AUTHORITY_BOUND':'OPERATIONAL_CONFIG_AUTHORITY_UNAVAILABLE'};}
}
