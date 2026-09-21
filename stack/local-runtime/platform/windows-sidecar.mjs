import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=fileURLToPath(new URL('.',import.meta.url));
export const DEFAULT_WINDOWS_SIDECAR=resolve(here,'../../windows-platform/bin/cep-win-sidecar.exe');
const enc=v=>Buffer.from(String(v),'utf8').toString('base64');
export class WindowsPlatformSidecar{
 constructor({helperPath=process.env.CEP_WINDOWS_SIDECAR||DEFAULT_WINDOWS_SIDECAR}={}){this.helperPath=resolve(helperPath);this.child=null;this.pending=[];this.buffer='';this.epoch=0;}
 available(){return process.platform==='win32'&&existsSync(this.helperPath)}
 windowAvailable(){if(!this.available())return false;const roots=[process.env['ProgramFiles(x86)'],process.env.ProgramFiles].filter(Boolean);return roots.some(root=>existsSync(resolve(root,'Microsoft','Edge','Application','msedge.exe')))}
 start(){if(this.child)return this;if(!this.available())return this;this.child=spawn(this.helperPath,['platform'],{stdio:['pipe','pipe','pipe'],windowsHide:true});this.child.stdout.setEncoding('utf8');this.child.stdout.on('data',c=>{this.buffer+=c;while(this.buffer.includes('\n')){let i=this.buffer.indexOf('\n'),line=this.buffer.slice(0,i).trim();this.buffer=this.buffer.slice(i+1);if(!line)continue;let value;try{value=JSON.parse(line)}catch{value={ok:false,code:'INVALID_PROVIDER_RESPONSE',raw:line}};this.pending.shift()?.resolve(value)}});this.child.once('exit',()=>{const p=this.pending.splice(0);for(const x of p)x.reject(Error('WINDOWS_PLATFORM_PROVIDER_LOST'));this.child=null;this.epoch++});return this;}
 request(line){if(!this.start().child)return Promise.resolve({ok:false,code:'WINDOWS_PLATFORM_UNAVAILABLE',providerEpoch:this.epoch});return new Promise((resolve,reject)=>{this.pending.push({resolve:value=>resolve({...value,providerEpoch:value?.providerEpoch??this.epoch}),reject});this.child.stdin.write(line+'\n')})}
 describe(){return this.request('DESCRIBE')}
 inputDirection(){return this.request('INPUT_DIRECTION')}
 openDetached(presentationId,url){return this.request(`WINDOW_OPEN\t${enc(presentationId)}\t${enc(url)}`)}
 focus(presentationId){return this.request(`WINDOW_FOCUS\t${enc(presentationId)}`)}
 close(presentationId){return this.request(`WINDOW_CLOSE\t${enc(presentationId)}`)}
 bounds(presentationId){return this.request(`WINDOW_BOUNDS\t${enc(presentationId)}`)}
 topmost(presentationId,requested){return this.request(`WINDOW_TOPMOST\t${enc(presentationId)}\t${requested?'1':'0'}`)}
 stop(){if(this.child){this.child.stdin.end('QUIT\n');this.child=null}}
}
