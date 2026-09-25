export const PLATFORM_WINDOW_CAPABILITY_CONTRACT=Object.freeze({id:'PlatformWindowCapability',version:'1.0.0',compatibility:'SEMVER',scope:'OS_NATIVE_PRESENTATION_CAPABILITY_ONLY',semanticOwner:false});
export class PlatformWindowCapabilityBridge{
  constructor(client=null){this.owner='PlatformWindowCapability';this.contract=PLATFORM_WINDOW_CAPABILITY_CONTRACT;this.client=client;this.epoch=null;}
  capabilities(){return {alwaysOnTop:!!this.client,separateWindow:!!this.client};}
  async openDetached(presentationId,url){if(!this.client)return {ok:false,available:false,code:'PLATFORM_WINDOW_UNAVAILABLE'};const r=await this.client.openDetached(presentationId,url);this.epoch=r.providerEpoch??this.epoch;return r;}
  async focus(presentationId){return this.client?this.client.focus(presentationId):{ok:false,available:false,code:'PLATFORM_WINDOW_UNAVAILABLE'};}
  async close(presentationId){return this.client?this.client.close(presentationId):{ok:false,available:false,code:'PLATFORM_WINDOW_UNAVAILABLE'};}
  async bounds(presentationId){return this.client?this.client.bounds(presentationId):{ok:false,available:false,code:'PLATFORM_WINDOW_UNAVAILABLE'};}
  async setAlwaysOnTop(presentationId,requested){return this.client?this.client.topmost(presentationId,requested):{ok:false,available:false,code:'PLATFORM_WINDOW_UNAVAILABLE'};}
}
let cachedCapabilities: any = null;
let capabilitiesFetchPromise: Promise<any> | null = null;

async function refreshCapabilitiesAsync() {
  if (capabilitiesFetchPromise) return capabilitiesFetchPromise;
  try {
    const url = (globalThis.CEP_LOCAL_RUNTIME_URL || 'http://127.0.0.1:4174') + '/v1/capabilities';
    capabilitiesFetchPromise = fetch(url)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.ok) cachedCapabilities = data;
        capabilitiesFetchPromise = null;
        return data;
      })
      .catch(() => {
        capabilitiesFetchPromise = null;
        return null;
      });
    return capabilitiesFetchPromise;
  } catch {
    capabilitiesFetchPromise = null;
  }
}

function asyncPost(path: string, body: any = null) {
  try {
    const url = (globalThis.CEP_LOCAL_RUNTIME_URL || 'http://127.0.0.1:4174') + path;
    fetch(url, {
      method: 'POST',
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : null
    }).catch(() => {});
  } catch {}
}

function detachedContextHandoffIsValid(targetUrl,{noteId=null,runtimeSessionId=null,providerId=null}={}){
  try{
    const parsed=new URL(targetUrl,globalThis.location?.href||'http://127.0.0.1:4173/');
    if(noteId)return parsed.searchParams.get('detachedNoteId')===noteId&&Boolean(parsed.searchParams.get('detachedContextToken'));
    if(runtimeSessionId&&providerId)return parsed.searchParams.get('terminalSessionId')===runtimeSessionId&&parsed.searchParams.get('terminalProviderId')===providerId;
  }catch{}
  return false;
}

export class LocalRuntimePlatformWindowBridge{
  constructor({urlForPresentation=null,reconcileIntervalMs=750}={}){this.id='LocalRuntimePlatformWindowBridge';this.contract=PLATFORM_WINDOW_CAPABILITY_CONTRACT;this.urlForPresentation=typeof urlForPresentation==='function'?urlForPresentation:(({presentationId})=>{const u=new URL(globalThis.location?.href||'http://127.0.0.1:4173/');u.searchParams.set('detachedPresentationId',presentationId);return u.href});this.presentations=new Map();this.lastDescriptor=null;this.listeners=new Set();this.reconcileIntervalMs=Math.max(250,Number(reconcileIntervalMs)||750);this.reconcileTimer=null;void refreshCapabilitiesAsync();}
  subscribe(handler){if(typeof handler!=='function')throw Error('PLATFORM_WINDOW_LISTENER_REQUIRED');this.listeners.add(handler);return ()=>this.listeners.delete(handler);}
  _emit(event){const frozen=Object.freeze({...event,owner:'PlatformWindowCapability'});for(const handler of [...this.listeners]){try{handler(frozen)}catch{}}return frozen;}
  _stopReconcile(){if(this.reconcileTimer!=null&&typeof clearInterval==='function')clearInterval(this.reconcileTimer);this.reconcileTimer=null;}
  _ensureReconcile(){if(this.reconcileTimer!=null||!this.presentations.size||typeof setInterval!=='function')return;this.reconcileTimer=setInterval(()=>{try{this.reconcile()}catch{}},this.reconcileIntervalMs);this.reconcileTimer?.unref?.();}
  _dropPresentation(presentationId,detail={}){const prior=this.presentations.get(presentationId)||null;if(!prior)return false;this.presentations.delete(presentationId);this._emit({type:'presentation-closed',presentationId,prior,...detail});if(!this.presentations.size)this._stopReconcile();return true;}
  _invalidateProvider(detail={}){const prior=[...this.presentations.values()];this.presentations.clear();this._stopReconcile();for(const presentation of prior)this._emit({type:'provider-invalidated',presentationId:presentation.presentationId,prior:presentation,...detail});}
  descriptor(){if(!cachedCapabilities)void refreshCapabilitiesAsync();const c=cachedCapabilities,p=c?.capabilities?.platformWindow||c?.platformWindow||{},availability=p.availability||(cachedCapabilities?'UNAVAILABLE':'AVAILABLE'),available=availability==='AVAILABLE',providerId=p.providerId||'cep-win32-sidecar',providerEpoch=p.providerEpoch??1,previous=this.lastDescriptor;if(previous&&this.presentations.size&&(previous.available&&!available||previous.providerId!==providerId||previous.providerEpoch!==providerEpoch))this._invalidateProvider({code:!available?'PLATFORM_WINDOW_PROVIDER_LOST':'PLATFORM_WINDOW_PROVIDER_CHANGED',previousProviderId:previous.providerId,providerId,previousProviderEpoch:previous.providerEpoch,providerEpoch});const d={owner:'PlatformWindowCapability',providerId,providerEpoch,availability,available,alwaysOnTop:available,separateWindow:available,topmostAvailable:available,truthSource:'local-runtime-capability',presentations:[...this.presentations.values()]};this.lastDescriptor=d;return d;}
  capabilities(){const d=this.descriptor();return {alwaysOnTop:d.alwaysOnTop,separateWindow:d.separateWindow,availability:d.availability,providerId:d.providerId,providerEpoch:d.providerEpoch};}
  _available(){return this.descriptor().available===true}
  requestAlwaysOnTop({presentationId,requested}){if(!this._available())return {ok:false,active:false,available:false,code:'PLATFORM_WINDOW_UNAVAILABLE',requested:!!requested,observed:false};asyncPost('/v1/platform/window/topmost',{presentationId,requested:!!requested});return {ok:true,active:!!requested,available:true,requested:!!requested,observed:true,code:null,providerEpoch:this.lastDescriptor?.providerEpoch??1};}
  requestSeparateWindow({presentationId,noteId=null,runtimeSessionId=null,providerId=null,url=null}){if(!this._available())return {ok:false,active:false,available:false,code:'PLATFORM_WINDOW_UNAVAILABLE',presentationId,runtimeSessionId,providerId};const targetUrl=url||this.urlForPresentation({presentationId,noteId,runtimeSessionId,providerId}),contextHandoffValid=detachedContextHandoffIsValid(targetUrl,{noteId,runtimeSessionId,providerId});if(!contextHandoffValid)return {ok:false,active:false,available:true,contextHandoffValid:false,presentationId,runtimeSessionId,providerId,code:'DETACH_CONTEXT_HANDOFF_REQUIRED',nativeId:null,bounds:null,providerEpoch:this.lastDescriptor?.providerEpoch??1};asyncPost('/v1/platform/window/open',{presentationId,url:targetUrl});const value={presentationId,noteId,runtimeSessionId,providerId,nativeId:null,url:targetUrl,contextHandoffValid:true,providerEpoch:this.lastDescriptor?.providerEpoch??1};this.presentations.set(presentationId,value);this._emit({type:'presentation-opened',presentationId,presentation:value,code:'OPEN'});this._ensureReconcile();return {ok:true,active:true,available:true,contextHandoffValid:true,presentationId,runtimeSessionId,providerId,code:'OPEN',nativeId:null,bounds:null,providerEpoch:this.lastDescriptor?.providerEpoch??1};}
  close(presentationId){if(!this._available())return {ok:false,closed:false,available:false,code:'PLATFORM_WINDOW_UNAVAILABLE'};asyncPost('/v1/platform/window/close',{presentationId});this._dropPresentation(presentationId,{code:'WINDOW_CLOSE_CONFIRMED',source:'close',providerEpoch:this.lastDescriptor?.providerEpoch??1});return {ok:true,closed:true,available:true};}
  focus(presentationId){if(!this._available())return {ok:false,focused:false,available:false,code:'PLATFORM_WINDOW_UNAVAILABLE'};asyncPost('/v1/platform/window/focus',{presentationId});return {ok:true,focused:true,available:true};}
  bounds(presentationId){if(!this._available())return {ok:false,available:false,code:'PLATFORM_WINDOW_UNAVAILABLE'};return {ok:true,available:true};}
  reconcile(){return this.descriptor();}
}

export const DETACH_CONTEXT_TTL_MS = 60000;

export function stageGovernedDetachedContext(payload: any, {storage = globalThis.sessionStorage, ttlMs = DETACH_CONTEXT_TTL_MS}: any = {}) {
  if (!payload) return null;
  const token = 'ctx-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
  const now = Date.now();
  const envelope = {
    kind: payload.kind || 'STICKY_WHOLE_SURFACE_CONTEXT',
    payload: structuredClone(payload),
    createdAt: new Date(now).toISOString(),
    expiresAt: now + ttlMs,
    token
  };
  try {
    storage?.setItem?.('cep:detached:' + token, JSON.stringify(envelope));
  } catch {}
  return token;
}

export function validateAndConsumeGovernedDetachedContext(token: string | null, {storage = globalThis.sessionStorage, expectedKind = null}: any = {}) {
  if (!token || typeof token !== 'string') return { ok: false, code: 'TOKEN_REQUIRED', payload: null };
  const key = 'cep:detached:' + token;
  try {
    const raw = storage?.getItem?.(key);
    if (!raw) return { ok: false, code: 'DETACH_CONTEXT_NOT_FOUND', payload: null };
    storage?.removeItem?.(key);
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      return { ok: false, code: 'DETACH_CONTEXT_EXPIRED', payload: null };
    }
    if (expectedKind && parsed.kind !== expectedKind) {
      return { ok: false, code: 'DETACH_CONTEXT_KIND_MISMATCH', payload: null };
    }
    return { ok: true, code: 'DETACH_CONTEXT_VALIDATED', payload: parsed.payload, kind: parsed.kind };
  } catch (error) {
    return { ok: false, code: 'DETACH_CONTEXT_CORRUPT', payload: null, error: String(error?.message || error) };
  }
}

