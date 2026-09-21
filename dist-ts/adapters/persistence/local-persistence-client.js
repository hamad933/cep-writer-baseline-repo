const DEFAULT_RUNTIME_PORT=4174;
const LOOPBACK_HOST='127.0.0.1';
const REQUEST_TIMEOUT_MS=5000;

const numericPort=value=>{const parsed=Number(value);return Number.isInteger(parsed)&&parsed>=1024&&parsed<=65535?parsed:DEFAULT_RUNTIME_PORT};
const currentPort=()=>{try{return numericPort(new URLSearchParams(globalThis.location?.search||'').get('persistencePort'))}catch{return DEFAULT_RUNTIME_PORT}};
const clone=value=>structuredClone(value);

export const LOCAL_PERSISTENCE_CLIENT_CONTRACT=Object.freeze({
  id:'LocalPersistenceClient',version:'1.0.0',transport:'HTTP_JSON_LOOPBACK_ONLY',host:LOOPBACK_HOST,
  semanticOwner:'StructuredTransactionHistoryRecoveryOwner'
});

export class LocalPersistenceClient{
  constructor({port=currentPort(),fetchImpl=globalThis.fetch}={}){
    const resolvedFetch=fetchImpl===globalThis.fetch&&typeof fetchImpl==='function'?fetchImpl.bind(globalThis):fetchImpl;
    this.port=numericPort(port);this.baseUrl=`http://${LOOPBACK_HOST}:${this.port}`;this.fetchImpl=resolvedFetch;this.inFlightSaves=new Map();this.lastReceipt=null;
  }
  descriptor(){return {contract:LOCAL_PERSISTENCE_CLIENT_CONTRACT,baseUrl:this.baseUrl,host:LOOPBACK_HOST,port:this.port,arbitraryHost:false};}
  async request(method,path,body=undefined){
    if(typeof this.fetchImpl!=='function')return {ok:false,status:0,code:'FETCH_UNAVAILABLE',reason:'FETCH_UNAVAILABLE'};
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort('timeout'),REQUEST_TIMEOUT_MS);
    try{
      const response=await this.fetchImpl(this.baseUrl+path,{method,headers:body===undefined?undefined:{'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal});
      let payload;try{payload=await response.json()}catch{payload={ok:false,code:'INVALID_JSON_RESPONSE'}}
      const receipt={...payload,httpStatus:response.status,transportOk:response.ok};this.lastReceipt=clone(receipt);return receipt;
    }catch(error){const receipt={ok:false,httpStatus:0,transportOk:false,code:error?.name==='AbortError'?'RUNTIME_TIMEOUT':'RUNTIME_UNAVAILABLE',reason:String(error?.message||error)};this.lastReceipt=clone(receipt);return receipt}
    finally{clearTimeout(timer)}
  }
  capabilities(){return this.request('GET','/v1/capabilities')}
  health(){return this.request('GET','/v1/persistence/health')}
  bootstrap(document,{domainKind='structured',surface='unknown',provenance=document?.provenance||{},sourceKind=domainKind}={}){return this.request('POST','/v1/persistence/bootstrap',{document,domainKind,surface,provenance,sourceKind})}
  readDocument(documentId){return this.request('GET',`/v1/persistence/document/${encodeURIComponent(documentId)}`)}
  explicitSave(document,context={}){
    const documentId=String(context.documentId||document.id),workingRevision=Number(context.workingRevision),key=`${documentId}:${workingRevision}`;
    if(this.inFlightSaves.has(key))return this.inFlightSaves.get(key);
    const requestId=globalThis.crypto?.randomUUID?.()||`save-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const work=this.request('POST','/v1/persistence/save',{operation:'EXPLICIT_SAVE',requestId,document,context:{...context,documentId}})
      .then(receipt=>receipt?.ok===true?{...receipt,revision:receipt.revision||receipt.committedRevision}:{ok:false,reason:receipt?.code||receipt?.reason||'PERSISTENCE_SAVE_FAILED',...receipt})
      .finally(()=>this.inFlightSaves.delete(key));
    this.inFlightSaves.set(key,work);return work;
  }
  autosave(document,context={}){return this.request('POST','/v1/persistence/autosave',{operation:'AUTOSAVE_DRAFT_ONLY',document,context})}
  captureRecovery(document,context={}){return this.request('POST','/v1/persistence/recovery',{operation:'RECOVERY_POINT_ONLY',document,context})}
  listRecovery(documentId){return this.request('GET',`/v1/persistence/recovery/${encodeURIComponent(documentId)}`)}
  readRecovery(recoveryId){return this.request('GET',`/v1/persistence/recovery-point/${encodeURIComponent(recoveryId)}`)}
}

export function createLocalPersistenceClient(options={}){return new LocalPersistenceClient(options)}
