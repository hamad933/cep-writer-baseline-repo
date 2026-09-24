const DEFAULT_RUNTIME_PORT=4174;
const LOOPBACK_HOST='127.0.0.1';
const REQUEST_TIMEOUT_MS=5000;
const numericPort=value=>{const parsed=Number(value);return Number.isInteger(parsed)&&parsed>=1024&&parsed<=65535?parsed:DEFAULT_RUNTIME_PORT};
const currentPort=()=>{try{return numericPort(new URLSearchParams(globalThis.location?.search||'').get('persistencePort'))}catch{return DEFAULT_RUNTIME_PORT}};

export class BoundedLocalRuntimeTransport{
  constructor({port=currentPort(),fetchImpl=globalThis.fetch}={}){this.port=numericPort(port);this.baseUrl=`http://${LOOPBACK_HOST}:${this.port}`;this.fetchImpl=fetchImpl===globalThis.fetch&&typeof fetchImpl==='function'?fetchImpl.bind(globalThis):fetchImpl;this.lastReceipt=null;}
  descriptor(){return {id:'BoundedLocalRuntimeTransport',host:LOOPBACK_HOST,port:this.port,loopbackOnly:true,semanticOwnership:false};}
  async request(method,path,body=undefined){
    if(typeof this.fetchImpl!=='function')return {ok:false,httpStatus:0,transportOk:false,code:'FETCH_UNAVAILABLE'};
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort('timeout'),REQUEST_TIMEOUT_MS);
    try{const response=await this.fetchImpl(this.baseUrl+path,{method,headers:body===undefined?undefined:{'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal});let payload;try{payload=await response.json()}catch{payload={ok:false,code:'INVALID_JSON_RESPONSE'}}const receipt={...payload,httpStatus:response.status,transportOk:response.ok};this.lastReceipt=structuredClone(receipt);return receipt}
    catch(error){const receipt={ok:false,httpStatus:0,transportOk:false,code:error?.name==='AbortError'?'RUNTIME_TIMEOUT':'RUNTIME_UNAVAILABLE',reason:String(error?.message||error)};this.lastReceipt=structuredClone(receipt);return receipt}
    finally{clearTimeout(timer)}
  }
}
export function createBoundedLocalRuntimeTransport(options={}){return new BoundedLocalRuntimeTransport(options)}
