import {SemanticCommandBus} from '../../foundation/global/commands.js';

export const MANUAL_AI_DOMAIN_OWNER='ManualAiDomainAdapter';
export const MANUAL_AI_COMMANDS=Object.freeze(['manual_ai.draft','manual_ai.export','manual_ai.import','manual_ai.review']);
export type ManualProposalState='PREPARED'|'EXPORTED'|'IMPORTED'|'PROVENANCE_INVALID'|'DEFERRED'|'REJECTED'|'ACCEPTED_AS_DRAFT';
export type DraftState='ABSENT'|'CREATED'|'CONFLICT';
export type ManualProposal={
  proposalId:string;
  revision:string;
  sourceDigest:string;
  provenance:{
    sourceId:string;
    sourceRevisionId:string;
    sourceDigest:string;
    obtainedBy:'USER_MEDIATED_EXTERNAL_AI'|'MANUAL_IMPORT';
    obtainedAt:string;
    exportedArtifactId?:string|null;
    exportedPackageDigest?:string|null;
  };
  content:string;
  state:ManualProposalState;
  draftState:DraftState;
  draftId?:string|null;
};
export type HumanDisposition='ACCEPT'|'EDIT'|'REJECT'|'DEFER'|'REQUEST_EVIDENCE';
export type ManualIoBridge={exportPackage?:(packet:any)=>{artifactId:string;digest:string};importResult?:(input:any)=>any};
export type DraftSink={createWorkingDraft:(proposal:ManualProposal)=>{draftId:string;status:'CREATED'|'CONFLICT'}};
const clone=<T>(value:T):T=>structuredClone(value);
const digestValid=(value:string)=>/^[a-f0-9]{32,128}$/i.test(value||'');
const text=(value:any)=>String(value??'').trim();
const same=(left:any,right:any)=>text(left)===text(right);
const terminal=(state:ManualProposalState)=>state==='REJECTED'||state==='ACCEPTED_AS_DRAFT';

export class ManualAiDomainAdapter{
  readonly owner=MANUAL_AI_DOMAIN_OWNER;
  readonly providerMode='MANUAL_ONLY_PROVIDER_NEUTRAL';
  private proposals=new Map<string,ManualProposal>();
  private selectedId:string|null=null;
  private io:ManualIoBridge;
  private draftSink:DraftSink|null;
  private history:any[]=[];

  capabilityTruth(){return {exportHelperAvailable:typeof this.io.exportPackage==='function',importHelperBound:typeof this.io.importResult==='function',draftSinkAvailable:!!this.draftSink,historyPersistence:'IN_MEMORY_ONLY',appendOnlyDurableHistory:false,providerNetworkCalls:0,backgroundCompletion:false};}

  constructor({proposals=[],io={},draftSink=null}:{proposals?:ManualProposal[];io?:ManualIoBridge;draftSink?:DraftSink|null}={}){
    this.io=io;this.draftSink=draftSink;for(const row of proposals)this.put(row);
  }
  private normalize(row:ManualProposal):ManualProposal{
    const sourceRevisionId=text(row?.provenance?.sourceRevisionId||row.revision);
    const sourceDigest=text(row?.provenance?.sourceDigest||row.sourceDigest);
    return {...clone(row),revision:text(row.revision),sourceDigest,provenance:{...clone(row.provenance),sourceId:text(row.provenance?.sourceId),sourceRevisionId,sourceDigest,obtainedBy:row.provenance?.obtainedBy||'USER_MEDIATED_EXTERNAL_AI',obtainedAt:row.provenance?.obtainedAt||new Date().toISOString(),exportedArtifactId:row.provenance?.exportedArtifactId??null,exportedPackageDigest:row.provenance?.exportedPackageDigest??null},draftId:row.draftId??null};
  }
  private put(row:ManualProposal){if(!row?.proposalId||!row.revision)throw Error('MANUAL_PROPOSAL_IDENTITY_REQUIRED');const normalized=this.normalize(row);this.proposals.set(normalized.proposalId,normalized);}
  rows(){return [...this.proposals.values()].map(clone);}
  select(id:string|null){if(id!==null&&!this.proposals.has(id))throw Error('MANUAL_PROPOSAL_UNKNOWN');this.selectedId=id;return this.selected();}
  selected(){return this.selectedId?clone(this.proposals.get(this.selectedId)!):null;}
  private provenanceMatches(row:ManualProposal,input:any){
    const sourceId=text(input?.sourceId??input?.provenance?.sourceId);
    const sourceRevisionId=text(input?.sourceRevisionId??input?.revision??input?.provenance?.sourceRevisionId);
    const sourceDigest=text(input?.sourceDigest??input?.provenance?.sourceDigest);
    const packageDigest=text(input?.exportedPackageDigest??input?.packageDigest??input?.requestDigest);
    const expectedPackageDigest=text(row.provenance.exportedPackageDigest);
    return {
      sourceId:!!sourceId&&same(sourceId,row.provenance.sourceId),
      sourceRevisionId:!!sourceRevisionId&&same(sourceRevisionId,row.provenance.sourceRevisionId),
      sourceDigest:digestValid(sourceDigest)&&same(sourceDigest,row.provenance.sourceDigest),
      packageDigest:!expectedPackageDigest||(digestValid(packageDigest)&&same(packageDigest,expectedPackageDigest))
    };
  }
  private provenanceValid(row:ManualProposal,input:any){const match=this.provenanceMatches(row,input);return Object.values(match).every(Boolean);}

  prepare({proposalId,revision,sourceDigest,sourceId,content=''}:{proposalId:string;revision:string;sourceDigest:string;sourceId:string;content?:string}){
    if(!proposalId||!revision||!sourceId)throw Error('MANUAL_PREPARE_IDENTITY_REQUIRED');
    const valid=digestValid(sourceDigest);
    const proposal:ManualProposal={proposalId,revision,sourceDigest,provenance:{sourceId,sourceRevisionId:revision,sourceDigest,obtainedBy:'USER_MEDIATED_EXTERNAL_AI',obtainedAt:new Date().toISOString(),exportedArtifactId:null,exportedPackageDigest:null},content,state:valid?'PREPARED':'PROVENANCE_INVALID',draftState:'ABSENT',draftId:null};
    this.put(proposal);this.selectedId=proposalId;this.history.push({type:'PREPARED',proposalId,state:proposal.state,sourceId,sourceRevisionId:revision,sourceDigest});return clone(proposal);
  }

  export(id=this.selectedId){
    const row=id?this.proposals.get(id):null;if(!row)throw Error('MANUAL_PROPOSAL_REQUIRED');
    if(row.state==='PROVENANCE_INVALID')throw Error('MANUAL_PROVENANCE_INVALID');
    if(terminal(row.state))return {ok:false,code:'FINAL_DECISION_IMMUTABLE',proposal:clone(row)};
    const packet={schemaVersion:2,mode:'MANUAL_ONLY',proposalId:row.proposalId,revision:row.revision,sourceId:row.provenance.sourceId,sourceRevisionId:row.provenance.sourceRevisionId,sourceDigest:row.provenance.sourceDigest,content:row.content,instruction:'Obtain any AI result externally, then import it manually. No provider call is performed by CEP.'};
    if(!this.io.exportPackage)return {ok:false,code:'EXPORT_HELPER_UNAVAILABLE',packet};
    const result=this.io.exportPackage(clone(packet));
    if(!result?.artifactId||!digestValid(result.digest))return {ok:false,code:'EXPORT_PROVENANCE_UNAVAILABLE',packet};
    row.state='EXPORTED';row.provenance.exportedArtifactId=String(result.artifactId);row.provenance.exportedPackageDigest=String(result.digest);
    this.history.push({type:'EXPORTED',proposalId:row.proposalId,artifactId:result.artifactId,packageDigest:result.digest,sourceId:row.provenance.sourceId,sourceRevisionId:row.provenance.sourceRevisionId,sourceDigest:row.provenance.sourceDigest});
    return {ok:true,code:'EXPORTED',packet,artifact:clone(result)};
  }

  import(input:any){
    const imported=this.io.importResult?this.io.importResult(input):input;
    const proposalId=text(imported?.proposalId);
    const row=proposalId?this.proposals.get(proposalId):null;
    if(!row){this.history.push({type:'IMPORT_REJECTED',proposalId:proposalId||null,code:'DECLARED_REQUEST_NOT_FOUND'});return {ok:false,code:'DECLARED_REQUEST_NOT_FOUND',proposal:null};}
    this.selectedId=row.proposalId;
    if(terminal(row.state)){this.history.push({type:'IMPORT_REJECTED',proposalId:row.proposalId,code:'FINAL_DECISION_IMMUTABLE'});return {ok:false,code:'FINAL_DECISION_IMMUTABLE',proposal:clone(row)};}
    if(row.state!=='EXPORTED'){this.history.push({type:'IMPORT_REJECTED',proposalId:row.proposalId,code:'EXPORTED_REQUEST_REQUIRED'});return {ok:false,code:'EXPORTED_REQUEST_REQUIRED',proposal:clone(row)};}
    const match=this.provenanceMatches(row,imported);
    if(!this.provenanceValid(row,imported)){
      row.state='PROVENANCE_INVALID';
      this.history.push({type:'IMPORT_PROVENANCE_MISMATCH',proposalId:row.proposalId,match,declared:{sourceId:text(imported?.sourceId??imported?.provenance?.sourceId),sourceRevisionId:text(imported?.sourceRevisionId??imported?.revision??imported?.provenance?.sourceRevisionId),sourceDigest:text(imported?.sourceDigest??imported?.provenance?.sourceDigest),packageDigest:text(imported?.exportedPackageDigest??imported?.packageDigest??imported?.requestDigest)}});
      return {ok:false,code:'PROVENANCE_INVALID',match,proposal:clone(row)};
    }
    row.content=String(imported?.content??'');row.state='IMPORTED';row.provenance.obtainedBy='MANUAL_IMPORT';row.provenance.obtainedAt=new Date().toISOString();
    this.history.push({type:'IMPORTED',proposalId:row.proposalId,sourceId:row.provenance.sourceId,sourceRevisionId:row.provenance.sourceRevisionId,sourceDigest:row.provenance.sourceDigest,packageDigest:row.provenance.exportedPackageDigest});
    return {ok:true,code:'IMPORTED',provenanceEqual:true,proposal:clone(row)};
  }

  review({id=this.selectedId,disposition,actor='owner',reason=''}:{id?:string|null;disposition:HumanDisposition;actor?:string;reason?:string}){
    const row=id?this.proposals.get(id):null;if(!row)throw Error('MANUAL_PROPOSAL_REQUIRED');
    if(terminal(row.state)){
      if(disposition==='ACCEPT'&&row.state==='ACCEPTED_AS_DRAFT'&&row.draftState==='CREATED'&&row.draftId)return {ok:true,code:'ACCEPTED_AS_DRAFT',draft:{draftId:row.draftId,status:'CREATED'},proposal:clone(row),canonicalPublication:false,idempotent:true};
      return {ok:false,code:'FINAL_DECISION_REQUIRES_SUPERSESSION',proposal:clone(row)};
    }
    if(row.state==='PROVENANCE_INVALID')return {ok:false,code:'PROVENANCE_INVALID',proposal:clone(row)};
    if(row.state!=='IMPORTED'&&row.state!=='DEFERRED')return {ok:false,code:'IMPORTED_PROPOSAL_REQUIRED',proposal:clone(row)};
    if(disposition==='REJECT'){row.state='REJECTED';this.history.push({type:'REVIEW',proposalId:row.proposalId,disposition,actor,reason});return {ok:true,code:'REJECTED',proposal:clone(row)};}
    if(disposition==='DEFER'||disposition==='REQUEST_EVIDENCE'){row.state='DEFERRED';this.history.push({type:'REVIEW',proposalId:row.proposalId,disposition,actor,reason});return {ok:true,code:'DEFERRED',proposal:clone(row)};}
    if(disposition==='EDIT'){this.history.push({type:'REVIEW',proposalId:row.proposalId,disposition,actor,reason,originalContent:row.content});return {ok:true,code:'EDIT_REQUIRED',proposal:clone(row)};}
    if(!digestValid(row.provenance.sourceDigest)||!same(row.revision,row.provenance.sourceRevisionId)||!same(row.sourceDigest,row.provenance.sourceDigest))return {ok:false,code:'PROVENANCE_INVALID',proposal:clone(row)};
    if(!this.draftSink)return {ok:false,code:'DRAFT_SINK_UNAVAILABLE',proposal:clone(row)};
    const draft=this.draftSink.createWorkingDraft(clone(row));row.draftState=draft.status;row.draftId=draft.draftId;row.state=draft.status==='CREATED'?'ACCEPTED_AS_DRAFT':'DEFERRED';
    this.history.push({type:'REVIEW',proposalId:row.proposalId,disposition,actor,reason,draftId:draft.draftId,draftStatus:draft.status,canonicalPublication:false});
    return {ok:draft.status==='CREATED',code:draft.status==='CREATED'?'ACCEPTED_AS_DRAFT':'DRAFT_CONFLICT',draft:clone(draft),proposal:clone(row),canonicalPublication:false};
  }

  availability(id:string,payload:any={}){
    const row=this.proposals.get(payload.id??this.selectedId??'');
    if(id==='manual_ai.draft')return true;
    if(id==='manual_ai.export'){
      if(!row||row.state==='PROVENANCE_INVALID'||terminal(row.state))return 'Valid non-final proposal required';
      if(!this.io.exportPackage)return 'Export helper unavailable; export remains manual and no provider call is substituted';
      return true;
    }
    if(id==='manual_ai.import')return row?.state==='EXPORTED'?true:'Exported request required for provenance equality';
    if(id==='manual_ai.review'){
      if(!row)return 'Select a ManualProposal';
      if(payload?.disposition==='ACCEPT'&&row.state==='ACCEPTED_AS_DRAFT'&&row.draftState==='CREATED'&&row.draftId)return true;
      if(terminal(row.state))return 'Final decision requires explicit supersession';
      if(row.state==='PROVENANCE_INVALID')return 'Imported proposal with valid provenance required for human review';
      if(row.state!=='IMPORTED'&&row.state!=='DEFERRED')return 'Import and provenance equality must succeed before human review';
      if(payload?.disposition==='ACCEPT'&&!this.draftSink)return 'Draft sink unavailable; ACCEPT cannot create or persist a working draft';
      return true;
    }
    return 'Unknown Manual AI command';
  }
  bindCommands(bus:SemanticCommandBus){for(const id of MANUAL_AI_COMMANDS)bus.registerCommand(id,this.owner,id.split('.').at(-1)!,p=>{if(id==='manual_ai.draft')return this.prepare(p);if(id==='manual_ai.export')return this.export(p.id??this.selectedId);if(id==='manual_ai.import')return this.import(p.input);return this.review(p);},p=>this.availability(id,p));return bus;}
  diagnosticProjection(){return {owner:this.owner,providerMode:this.providerMode,hiddenProviderCalls:0,automaticCanonicalPublication:false,selectedId:this.selectedId,proposals:this.rows(),history:clone(this.history),capabilities:this.capabilityTruth(),truth:{importRequiresDeclaredExport:true,sourceRevisionDigestEqualityRequired:true,acceptCreatesDraftOnly:true,historyPersistence:'IN_MEMORY_ONLY',appendOnlyDurableHistory:false,backgroundCompletion:false,providerNetworkCalls:0}};}
}
