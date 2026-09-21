import {NO_PLATFORM_INPUT_DIRECTION_BRIDGE,PLATFORM_INPUT_DIRECTION_BRIDGE_CONTRACT} from '../contracts/platform-input-direction-bridge.js';

export const INPUT_DIRECTION_RESOLVER_CONTRACT = Object.freeze({
  id:'InputDirectionResolver',version:'1.0.1',compatibility:'SEMVER',owner:'Global Input Direction',policyRevision:'input-direction-w4c-r2'
});

export const INPUT_DIRECTION_POLICY = Object.freeze({
  revision:'input-direction-w4c-policy-r2',
  fallbackDirection:'rtl',
  admittedDirections:Object.freeze(['rtl','ltr']),
  autoToken:'auto',
  semanticDomainLanguageInference:'FORBIDDEN',
  bridgeContractId:PLATFORM_INPUT_DIRECTION_BRIDGE_CONTRACT.id
});

const admitted=(value,policy)=>policy.admittedDirections.includes(String(value||'').toLowerCase());
const normalized=(value,policy)=>admitted(value,policy)?String(value).toLowerCase():null;

export class InputDirectionResolver {
  constructor({bridge=NO_PLATFORM_INPUT_DIRECTION_BRIDGE,policy=INPUT_DIRECTION_POLICY}={}){
    this.owner='InputDirectionResolver';this.contract=INPUT_DIRECTION_RESOLVER_CONTRACT;this.policy=policy;this.bridge=bridge||NO_PLATFORM_INPUT_DIRECTION_BRIDGE;
  }
  descriptor(){return {owner:this.owner,contract:this.contract,policy:this.policy,bridge:this.bridge.capability?.()||{available:false,code:'PLATFORM_DIRECTION_BRIDGE_INVALID'},semanticDomainLanguageInference:false};}
  resolve({persistedDirection=null,fallbackDirection=null,content='',surface='structured',blockId=null}={}){
    const persisted=normalized(persistedDirection,this.policy);
    const explicitFallback=normalized(fallbackDirection,this.policy);
    const policyFallback=normalized(this.policy.fallbackDirection,this.policy)||'ltr';
    const fallback=explicitFallback||policyFallback;
    const empty=String(content??'').length===0;
    if(persisted)return {direction:persisted,source:'PERSISTED_EXPLICIT_DIRECTION',persistedWon:true,fallbackUsed:false,bridgeUsed:false,bridgeCapability:this.bridge.capability?.()||{available:false,code:'PLATFORM_DIRECTION_BRIDGE_INVALID'},semanticInference:false,contentInspectedForLanguage:false,empty,surface,blockId,owner:this.owner,policyRevision:this.policy.revision};
    const bridgeRead=this.bridge.read?.({surface,blockId,empty,contentLength:String(content??'').length})||{available:false,recognized:false,code:'PLATFORM_DIRECTION_BRIDGE_INVALID',hint:null};
    if(bridgeRead.available&&bridgeRead.recognized&&normalized(bridgeRead.hint,this.policy))return {direction:normalized(bridgeRead.hint,this.policy),source:'PLATFORM_OS_KEYBOARD_HINT',persistedWon:false,fallbackUsed:false,bridgeUsed:true,bridgeCapability:bridgeRead,semanticInference:false,contentInspectedForLanguage:false,empty,surface,blockId,owner:this.owner,policyRevision:this.policy.revision};
    return {direction:fallback,source:explicitFallback?'EXPLICIT_FALLBACK':'POLICY_FALLBACK',persistedWon:false,fallbackUsed:true,bridgeUsed:false,bridgeCapability:bridgeRead,semanticInference:false,contentInspectedForLanguage:false,empty,surface,blockId,owner:this.owner,policyRevision:this.policy.revision};
  }
  initializeEmptyStructuredBlock(block,{fallbackDirection=null}={}){
    const next=structuredClone(block||{}),content=next.html??next.title??'';
    const resolution=this.resolve({persistedDirection:next.dir,fallbackDirection,content,surface:'structured',blockId:next.id||null});
    if(String(content).length===0&&!normalized(next.dir,this.policy))next.dir=resolution.direction;
    return {block:next,resolution};
  }
  initializeEmptyNoteContent(noteContent,{fallbackDirection=null}={}){
    const next=structuredClone(noteContent||{}),content=next.html??next.text??'';
    const resolution=this.resolve({persistedDirection:next.dir,fallbackDirection,content,surface:'note-content',blockId:next.id||null});
    if(String(content).length===0&&!normalized(next.dir,this.policy))next.dir=resolution.direction;
    return {content:next,resolution};
  }
}
