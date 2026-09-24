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


let cachedDirectionHint: string | null = null;
let lastDirectionFetch = 0;
let fetchPromise: Promise<void> | null = null;
const DIRECTION_CACHE_TTL_MS = 1000;

async function refreshPlatformDirectionAsync() {
  if (fetchPromise) return fetchPromise;
  const now = Date.now();
  if (now - lastDirectionFetch < DIRECTION_CACHE_TTL_MS && cachedDirectionHint !== null) {
    return;
  }
  lastDirectionFetch = now;
  try {
    const url = (globalThis.CEP_LOCAL_RUNTIME_URL || 'http://127.0.0.1:4174') + '/v1/platform/input-direction';
    fetchPromise = fetch(url, { method: 'GET' })
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (data?.recognized === true && (data.hint === 'rtl' || data.hint === 'ltr')) {
          cachedDirectionHint = data.hint;
        }
        fetchPromise = null;
      })
      .catch(() => {
        fetchPromise = null;
      });
    return fetchPromise;
  } catch {
    fetchPromise = null;
  }
}

function readPlatformDirectionCached() {
  const now = Date.now();
  if (now - lastDirectionFetch >= DIRECTION_CACHE_TTL_MS) {
    void refreshPlatformDirectionAsync();
  }
  return cachedDirectionHint;
}

export function createLocalRuntimePlatformInputDirectionBridge() {
  void refreshPlatformDirectionAsync();
  return new PlatformInputDirectionBridge(() => readPlatformDirectionCached(), {
    id: 'windows-platform-input-direction',
    source: 'platform-os-keyboard-hint'
  });
}
