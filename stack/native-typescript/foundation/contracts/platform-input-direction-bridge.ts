export const PLATFORM_INPUT_DIRECTION_BRIDGE_CONTRACT = Object.freeze({
  id:'PlatformInputDirectionBridge',version:'1.0.0',compatibility:'SEMVER',owner:'Global Input Direction',policyRevision:'platform-input-direction-bridge-w4c-r1'
});

const admitted=value=>value==='rtl'||value==='ltr';

export class PlatformInputDirectionBridge {
  constructor(readHint=null,{id='platform-input-direction',source='platform-os-keyboard-hint'}={}){
    this.owner='PlatformInputDirectionBridge';this.contract=PLATFORM_INPUT_DIRECTION_BRIDGE_CONTRACT;this.id=id;this.source=source;this.readHint=typeof readHint==='function'?readHint:null;
  }
  capability(){return this.readHint?{available:true,code:'AVAILABLE',owner:this.owner,source:this.source}:{available:false,code:'PLATFORM_DIRECTION_HINT_UNAVAILABLE',owner:this.owner,source:this.source};}
  read(context={}){
    const capability=this.capability();
    if(!capability.available)return {...capability,hint:null,recognized:false};
    let value=null;
    try{value=this.readHint(context)}catch(error){return {available:true,code:'PLATFORM_DIRECTION_HINT_ERROR',owner:this.owner,source:this.source,hint:null,recognized:false,error:String(error?.message||error)}}
    const hint=typeof value==='string'?value.toLowerCase():null;
    return {available:true,code:admitted(hint)?'PLATFORM_DIRECTION_HINT_RESOLVED':'PLATFORM_DIRECTION_HINT_UNKNOWN',owner:this.owner,source:this.source,hint:admitted(hint)?hint:null,rawHint:value??null,recognized:admitted(hint)};
  }
}

export const NO_PLATFORM_INPUT_DIRECTION_BRIDGE = Object.freeze({
  owner:'PlatformInputDirectionBridge',contract:PLATFORM_INPUT_DIRECTION_BRIDGE_CONTRACT,
  capability:()=>({available:false,code:'PLATFORM_DIRECTION_BRIDGE_ABSENT',owner:'PlatformInputDirectionBridge',source:null}),
  read:()=>({available:false,code:'PLATFORM_DIRECTION_BRIDGE_ABSENT',owner:'PlatformInputDirectionBridge',source:null,hint:null,recognized:false})
});


function syncPlatformDirection(){
  if(typeof XMLHttpRequest==='undefined')return null;
  try{const xhr=new XMLHttpRequest();xhr.open('GET',(globalThis.CEP_LOCAL_RUNTIME_URL||'http://127.0.0.1:4174')+'/v1/platform/input-direction',false);xhr.send();if(xhr.status<200||xhr.status>=300)return null;const value=JSON.parse(xhr.responseText||'{}');return value?.recognized===true&&(value.hint==='rtl'||value.hint==='ltr')?value.hint:null;}catch{return null}
}
export function createLocalRuntimePlatformInputDirectionBridge(){return new PlatformInputDirectionBridge(()=>syncPlatformDirection(),{id:'windows-platform-input-direction',source:'platform-os-keyboard-hint'});}
