import {normalizeOperationalTerminalState,operationalStateData} from './presentation.js';
import {TERMINAL_RENDERER_PORT_CONTRACT} from './terminal-renderer-port.js';

const html=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let modulePromise=null;
function ensureCss(){if(globalThis.document&&!document.querySelector('link[data-cep-xterm]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/vendor/xterm/xterm.css';link.dataset.cepXterm='true';document.head.append(link)}}
async function module(){ensureCss();if(modulePromise)return modulePromise;if(typeof globalThis.window==='undefined'){try{return modulePromise=import(new URL('../../vendor/xterm/xterm.mjs',import.meta.url).href);}catch{}}return modulePromise=import('/vendor/xterm/xterm.mjs');}
const rawBytes=session=>session?.rawOutputBase64?Uint8Array.from(atob(session.rawOutputBase64),character=>character.charCodeAt(0)):null;
const generationOf=session=>Number(session?.outputGeneration??session?.restartCount??0);

export class XtermOperationalTerminalRenderer{
  constructor({moduleLoader=module}={}){this.id='XtermOperationalTerminalRenderer';this.kind='XTERM_JS';this.contract=TERMINAL_RENDERER_PORT_CONTRACT;this.instances=new Map();this.buffers=new Map();this.moduleLoader=moduleLoader;}
  descriptor(){return {id:this.id,kind:this.kind,contract:this.contract,package:'@xterm/xterm',rendererOnly:true,semanticCommandOwnership:false,canonicalStateOwnership:false,processLifecycleOwnership:false};}
  render({session,provider,presentationId,readOnly=false}){const state=normalizeOperationalTerminalState(provider,session),inputReadOnly=readOnly||session?.recorded===true||state.state==='read-only';return `<div class="terminal-state"><span class="state-token" data-state="${html(operationalStateData(state.state))}" role="status" aria-live="polite">${html(state.label)}</span>${state.detail?`<span>${html(state.detail)}</span>`:''}</div><div class="terminal-output xterm-host" role="application" aria-label="${html(provider.label||provider.id||'Runtime')} terminal" aria-readonly="${inputReadOnly}" tabindex="0" dir="ltr" data-xterm-presentation="${html(presentationId)}" data-terminal-state="${html(state.state)}"></div>`;}
  async mount({root,session,provider,providerRuntime=null,presentationId,readOnly=false,routeInput,routeResize}){
    const escCss=value=>globalThis.CSS?.escape?globalThis.CSS.escape(value):String(value).replace(/["\\]/g,'\\$&');
    const host=root.querySelector(`[data-xterm-presentation="${escCss(presentationId)}"]`);if(!host)return;
    let entry=this.instances.get(presentationId),buffering=true;
    const buffered=[];
    const applyStreamEvent=event=>{
      if(buffering){buffered.push(event);return}
      if(!entry)return;
      if(event?.type==='reset'){entry.term.reset();entry.lastOutputBytes=0;entry.generation=Number(event.generation)||0;return}
      if(Number.isFinite(Number(event?.generation))&&Number(event.generation)<entry.generation)return;
      if(event?.type==='output'&&event.data){entry.term.write(event.data);entry.lastOutputBytes+=event.data.length;return}
      if(event?.type==='error')entry.term.writeln(`\r\n[provider error] ${String(event.error||'unknown')}`);
    };
    // Subscribe before the async renderer load so provider output cannot fall into the mount gap.
    let earlySubscription=null;
    if(providerRuntime?.subscribe&&!entry?.streamSubscription)earlySubscription=providerRuntime.subscribe(session.id,applyStreamEvent);
    const {Terminal}=await this.moduleLoader();
    const reconciledSession=providerRuntime?.session?.(session.id)||session;
    const state=normalizeOperationalTerminalState(provider,reconciledSession),inputReadOnly=readOnly||reconciledSession?.recorded===true||state.state==='read-only';
    const bindInput=(term,target)=>{
      target.disposables.push(term.onData(data=>{if(target.readOnly)return;if(target.provider.rawTerminal||target.provider.pty||target.provider.conpty){target.routeInput?.({presentationId,rawInput:data,rawStream:true});return}let buffer=this.buffers.get(presentationId)||'';for(const character of data){if(character==='\r'){const command=buffer;this.buffers.set(presentationId,'');term.write('\r\n');if(command.trim()){const receipt=target.routeInput?.({presentationId,rawInput:command,rawStream:false});if(receipt&&typeof receipt==='object'&&'output' in receipt)term.writeln(String(receipt.output??''));}}else if(character==='\u007f'){buffer=buffer.slice(0,-1);this.buffers.set(presentationId,buffer);term.write('\b \b');}else if(character>=' '){buffer+=character;this.buffers.set(presentationId,buffer);term.write(character);}}}));
      target.disposables.push(term.onResize(size=>target.routeResize?.({presentationId,cols:size.cols,rows:size.rows})));
    };
    if(!entry||!entry.term.element?.isConnected){
      if(entry){for(const disposable of entry.disposables)disposable.dispose?.();entry.term.dispose();this.instances.delete(presentationId)}
      const term=new Terminal({convertEol:true,cursorBlink:true,scrollback:5000,allowProposedApi:false,disableStdin:inputReadOnly});term.open(host);
      entry={term,disposables:[],lastOutputBytes:0,lastLineCount:0,generation:generationOf(reconciledSession),readOnly:inputReadOnly,provider,routeInput,routeResize,streamSubscription:null};
      this.instances.set(presentationId,entry);bindInput(term,entry);
    }else{entry.readOnly=inputReadOnly;entry.provider=provider;entry.routeInput=routeInput;entry.routeResize=routeResize;entry.term.options.disableStdin=inputReadOnly;host.setAttribute('aria-readonly',String(inputReadOnly));}
    if(earlySubscription){entry.streamSubscription=earlySubscription;entry.disposables.push(earlySubscription)}
    if(provider.rawTerminal||provider.pty||provider.conpty){
      const generation=generationOf(reconciledSession);if(generation!==entry.generation){entry.term.reset();entry.lastOutputBytes=0;entry.generation=generation}
      const raw=rawBytes(reconciledSession);if(raw&&raw.length>entry.lastOutputBytes){entry.term.write(raw.slice(entry.lastOutputBytes));entry.lastOutputBytes=raw.length}
      const reconciledCursor=Number(reconciledSession?.outputCursor??entry.lastOutputBytes);
      buffering=false;
      for(const event of buffered){if(Number.isFinite(Number(event?.generation))&&Number(event.generation)<entry.generation)continue;if(event?.type==='output'&&Number.isFinite(Number(event.cursor))&&Number(event.cursor)<=reconciledCursor)continue;applyStreamEvent(event)}
      if(providerRuntime?.subscribe&&!entry.streamSubscription){entry.streamSubscription=providerRuntime.subscribe(session.id,applyStreamEvent);entry.disposables.push(entry.streamSubscription)}
    }else{
      buffering=false;earlySubscription?.dispose?.();entry.streamSubscription=null;
      const lines=Array.isArray(reconciledSession?.lines)?reconciledSession.lines:[];for(let index=entry.lastLineCount;index<lines.length;index++){const line=lines[index];entry.term.writeln(`${line.command}`);entry.term.writeln(String(line.output??''))}entry.lastLineCount=lines.length;if(!lines.length&&provider.help&&entry.lastLineCount===0)entry.term.writeln(provider.help);
    }
    queueMicrotask(()=>entry.term.focus());
  }
  dispose(presentationId){const entry=this.instances.get(presentationId);if(entry){for(const disposable of entry.disposables)disposable.dispose?.();entry.term.dispose();this.instances.delete(presentationId);this.buffers.delete(presentationId)}}
}
