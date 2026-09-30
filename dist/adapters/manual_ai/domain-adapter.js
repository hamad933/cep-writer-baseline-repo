import {SemanticCommandBus} from '../../foundation/global/commands.js';

export const MANUAL_AI_DOMAIN_OWNER='ManualAiDomainAdapter';
export const MANUAL_AI_COMMAND_LABELS=Object.freeze({'manual_ai.draft':'Prepare manual packet','manual_ai.export':'Export packet for external AI','manual_ai.import':'Import external result','manual_ai.review':'Record human disposition'});
export const MANUAL_AI_COMMANDS=Object.freeze(['manual_ai.draft','manual_ai.export','manual_ai.import','manual_ai.review']);
                                                                                                                                
                                                     
                            
                    
                  
                      
              
                    
                            
                        
                                                           
                      
                                    
                                       
    
                 
                            
                        
                       
  
                                                                                 
                                                                                                                           
                                                                                                                   
const clone=   (value  )  =>structuredClone(value);
const digestValid=(value       )=>/^[a-f0-9]{32,128}$/i.test(value||'');
const text=(value    )=>String(value??'').trim();
const same=(left    ,right    )=>text(left)===text(right);
const terminal=(state                    )=>state==='REJECTED'||state==='ACCEPTED_AS_DRAFT';

export class ManualAiDomainAdapter{
           owner=MANUAL_AI_DOMAIN_OWNER;
           providerMode='MANUAL_ONLY_PROVIDER_NEUTRAL';
          proposals=new Map                       ();
          selectedId            =null;
          io               ;
          draftSink               ;
          history      =[]; lastAction    =null;

  constructor({proposals=[],io={},draftSink=null}                                                                           ={}){
    this.io=io;this.draftSink=draftSink;for(const row of proposals)this.put(row);
  }
          normalize(row               )               {
    const sourceRevisionId=text(row?.provenance?.sourceRevisionId||row.revision);
    const sourceDigest=text(row?.provenance?.sourceDigest||row.sourceDigest);
    return {...clone(row),revision:text(row.revision),sourceDigest,provenance:{...clone(row.provenance),sourceId:text(row.provenance?.sourceId),sourceRevisionId,sourceDigest,obtainedBy:row.provenance?.obtainedBy||'USER_MEDIATED_EXTERNAL_AI',obtainedAt:row.provenance?.obtainedAt||new Date().toISOString(),exportedArtifactId:row.provenance?.exportedArtifactId??null,exportedPackageDigest:row.provenance?.exportedPackageDigest??null},draftId:row.draftId??null};
  }
          put(row               ){if(!row?.proposalId||!row.revision)throw Error('MANUAL_PROPOSAL_IDENTITY_REQUIRED');const normalized=this.normalize(row);this.proposals.set(normalized.proposalId,normalized);}
  rows(){return [...this.proposals.values()].map(row=>({...clone(row),id:row.proposalId}));}
  select(id            ){if(id!==null&&!this.proposals.has(id))throw Error('MANUAL_PROPOSAL_UNKNOWN');this.selectedId=id;return this.selected();}
  selected(){return this.selectedId?clone(this.proposals.get(this.selectedId) ):null;}
          provenanceMatches(row               ,input    ){
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
          provenanceValid(row               ,input    ){const match=this.provenanceMatches(row,input);return Object.values(match).every(Boolean);}

  prepare({proposalId,revision,sourceDigest,sourceId,content=''}                                                                                        ){
    if(!proposalId||!revision||!sourceId)throw Error('MANUAL_PREPARE_IDENTITY_REQUIRED');
    const valid=digestValid(sourceDigest);
    const proposal               ={proposalId,revision,sourceDigest,provenance:{sourceId,sourceRevisionId:revision,sourceDigest,obtainedBy:'USER_MEDIATED_EXTERNAL_AI',obtainedAt:new Date().toISOString(),exportedArtifactId:null,exportedPackageDigest:null},content,state:valid?'PREPARED':'PROVENANCE_INVALID',draftState:'ABSENT',draftId:null};
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

  import(input    ){
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

  review({id=this.selectedId,disposition,actor='owner',reason=''}                                                                            ){
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

  availability(id       ,payload    ={}){
    const row=this.proposals.get(payload.id??this.selectedId??'');
    if(id==='manual_ai.draft')return true;
    if(id==='manual_ai.export')return row&&row.state!=='PROVENANCE_INVALID'&&!terminal(row.state)?true:'Valid non-final proposal required';
    if(id==='manual_ai.import'){if(row?.state!=='EXPORTED')return 'Exported request required for provenance equality';if(payload&&payload.requireResponse===true&&!text(payload?.input?.content))return 'Paste the external response into the intake field first';return true}
    if(id==='manual_ai.review'){if(!row)return 'Select a ManualProposal';if(row.state==='PROVENANCE_INVALID')return 'Imported proposal with valid provenance required for human review';return row.state==='IMPORTED'||row.state==='DEFERRED'?true:'Import and provenance equality must succeed before human review';}
    return 'Unknown Manual AI command';
  }
  /** Authoritative single-location projection of one ManualProposal (CEP-VIS-001-FINAL:
      ONE INFORMATION ITEM -> ONE AUTHORITATIVE DISPLAY LOCATION). Consumed by the typed-collection
      CENTER region; the declared state machine comes from the W05 surface profile. */
  inspect(id            =this.selectedId){
    const row=id?this.proposals.get(id):null;
    if(!row)return {ok:false         ,code:'NO_MANUAL_PROPOSAL',requirements:['proposalId','revision','sourceId','sourceRevisionId','sourceDigest']};
    const terminalState=terminal(row.state);
    /* Authoritative equality truth: a recorded mismatch carries the exact four-flag result; a
       provenance-equal import implies all four matched; otherwise no response exists yet. */
    const mismatchEntry=this.history.filter(entry=>entry.type==='IMPORT_PROVENANCE_MISMATCH'&&entry.proposalId===row.proposalId).slice(-1)[0]||null;
    const responseReceived=row.provenance.obtainedBy==='MANUAL_IMPORT';
    const provenanceMatch=mismatchEntry
      ?{sourceId:Boolean(mismatchEntry.match?.sourceId),sourceRevisionId:Boolean(mismatchEntry.match?.sourceRevisionId),sourceDigest:Boolean(mismatchEntry.match?.sourceDigest),packageDigest:Boolean(mismatchEntry.match?.packageDigest)}
      :((responseReceived&&row.state!=='PROVENANCE_INVALID')?{sourceId:true,sourceRevisionId:true,sourceDigest:true,packageDigest:true}:null);
    const sequence=(['PREPARED','EXPORTED','IMPORTED','DEFERRED','REJECTED','ACCEPTED_AS_DRAFT']         ).map((step,index)=>({
      step:index+1,name:step,
      reached:step==='PREPARED'?true:step==='EXPORTED'?['EXPORTED','IMPORTED','DEFERRED','REJECTED','ACCEPTED_AS_DRAFT'].includes(row.state):step==='IMPORTED'?['IMPORTED','DEFERRED','REJECTED','ACCEPTED_AS_DRAFT'].includes(row.state):step==='DEFERRED'?row.state==='DEFERRED':step==='REJECTED'?row.state==='REJECTED':row.state==='ACCEPTED_AS_DRAFT',
      current:(step==='PREPARED'&&row.state==='PREPARED')||(step==='EXPORTED'&&row.state==='EXPORTED')||(step==='IMPORTED'&&row.state==='IMPORTED')||(step==='DEFERRED'&&row.state==='DEFERRED')||(step==='REJECTED'&&row.state==='REJECTED')||(step==='ACCEPTED_AS_DRAFT'&&row.state==='ACCEPTED_AS_DRAFT')
    }));
    return {
      proposalId:row.proposalId,revision:row.revision,state:row.state,draftState:row.draftState,draftId:row.draftId,
      terminal:terminalState,
      provenanceMatch,
      provenance:{sourceId:row.provenance.sourceId,sourceRevisionId:row.provenance.sourceRevisionId,sourceDigest:row.provenance.sourceDigest,obtainedBy:row.provenance.obtainedBy,obtainedAt:row.provenance.obtainedAt,exportedArtifactId:row.provenance.exportedArtifactId||'NOT_EXPORTED',exportedPackageDigest:row.provenance.exportedPackageDigest||'NOT_EXPORTED'},
      sequence,
      /* Per-disposition readiness: ACCEPT additionally needs a bound working-draft sink, which this
         build does not provide — surfaced truthfully instead of faking a draft-creation receipt. */
      dispositionReadiness:Object.fromEntries(['ACCEPT','EDIT','REJECT','DEFER','REQUEST_EVIDENCE'].map(d=>[d,
        d!=='ACCEPT'?(terminalState||row.state==='PROVENANCE_INVALID'?'NOT_OPEN_YET':'AVAILABLE')
          :(terminalState||row.state==='PROVENANCE_INVALID'?'NOT_OPEN_YET':(this.draftSink?'AVAILABLE':'DRAFT_SINK_UNAVAILABLE'))])),
      ceilings:{providerMode:this.providerMode,hiddenProviderCalls:0,automaticCanonicalPublication:false,importRequiresDeclaredExport:true,sourceRevisionDigestEqualityRequired:true,acceptCreatesDraftOnly:true,invalidProvenanceFailsClosed:true},
      governance:[
        {rule:'الذكاء الاصطناعي الخارجي أداة مساعدة للمراجعة فقط',en:'External AI is a review aid only',enforced:'MANUAL_ONLY_PROVIDER_NEUTRAL'},
        {rule:'القرار النهائي يبقى لدى المراجع البشري',en:'The final decision stays with the human reviewer',enforced:'human disposition ACCEPT/EDIT/REJECT/DEFER/REQUEST_EVIDENCE'},
        {rule:'لا قبول من دون تحقّق وتدوين (audit)',en:'No acceptance without verification and audit',enforced:'provenance equality + separate audit trail'}
      ],
      timeline:this.history.filter(entry=>entry.proposalId===row.proposalId).map(entry=>({type:entry.type,state:entry.state||entry.disposition||entry.code||'RECORDED',at:entry.at||null})),
      lastAction:this.lastAction||null,
      commandAvailability:Object.fromEntries(Object.entries({draft:['manual_ai.draft',{}],export:['manual_ai.export',{id:row.proposalId}],import:['manual_ai.import',{id:row.proposalId}],review:['manual_ai.review',{id:row.proposalId}]}).map(([k,v]    )=>{let r    ='';try{r=this.availability(k,v)}catch(e){r='ERROR'}return [k,r===true?'AVAILABLE':(typeof r==='string'?r:(r&&r.reason?r.reason:'UNAVAILABLE'))]})),
      ok:true
    };
  }
  bindCommands(bus                   ){for(const id of MANUAL_AI_COMMANDS)bus.registerCommand(id,this.owner,MANUAL_AI_COMMAND_LABELS[id]||id,p=>{const exec=()=>{if(id==='manual_ai.draft')return this.prepare(p);if(id==='manual_ai.export')return this.export(p.id??this.selectedId);if(id==='manual_ai.import')return this.import(p.input);return this.review(p)};let result    ;try{result=exec()}catch(error){this.lastAction={commandId:id,ok:false,code:String((error       )?.message||error),at:new Date().toISOString()};throw error}this.lastAction={commandId:id,ok:result?.ok!==false,code:String(result?.code||result?.state||'RECORDED'),proposalId:result?.proposal?.proposalId??p?.id??null,at:new Date().toISOString()};return result;},p=>this.availability(id,p));return bus;}
  diagnosticProjection(){return {owner:this.owner,providerMode:this.providerMode,hiddenProviderCalls:0,automaticCanonicalPublication:false,selectedId:this.selectedId,proposals:this.rows(),history:clone(this.history),truth:{importRequiresDeclaredExport:true,sourceRevisionDigestEqualityRequired:true,acceptCreatesDraftOnly:true}};}
}
