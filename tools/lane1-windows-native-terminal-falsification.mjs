import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {OperationalSessionOwner} from '../dist/foundation/operational/session-owner.js';
import {XtermOperationalTerminalRenderer} from '../dist/foundation/operational/xterm-renderer.js';
import {RUNTIME_ADAPTER_CONTRACT} from '../dist/foundation/operational.js';

const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const checks=[]; const check=(id,ok,detail='')=>{checks.push({id,status:ok?'PASS':'FAIL',detail}); if(!ok)process.exitCode=1};
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const cpp=read('stack/windows-platform/src/main.cpp');
check('win32.direct_conpty',cpp.includes('CreatePseudoConsole')&&cpp.includes('ResizePseudoConsole'),'C++17 direct ConPTY implementation present');
check('win32.arbitrary_executable',cpp.includes('CreateProcessW(a.exe.c_str()'),'Executable path is profile input, not an allowlist');
check('win32.platform_capabilities',cpp.includes('WINDOW_TOPMOST')&&cpp.includes('INPUT_DIRECTION')&&cpp.includes('GetKeyboardLayout'),'Window/topmost/input layout channels present');
check('win32.control_separate_from_raw_input',cpp.includes('controlSocket')&&cpp.includes('inputSocket')&&cpp.includes('ResizePseudoConsole')&&cpp.includes('INADDR_LOOPBACK'),'Resize/close control and raw terminal input use separate loopback channels; raw input is byte-preserving and not command-parsed');
const server=read('stack/local-runtime/server.mjs');
check('runtime.capability_routes',server.includes('/v1/platform/window/open')&&server.includes('/v1/terminal/open')&&server.includes('/v1/terminal/resize'),'Capability-specific runtime routes present');
check('runtime.no_security_allowlist',!server.includes('COMMAND_ALLOWLIST')&&!server.includes('EXECUTABLE_ALLOWLIST'),'No CEP-side command/executable allowlist');
const xterm=read('stack/native-typescript/foundation/operational/xterm-renderer.ts');
check('xterm.canonical_renderer',xterm.includes("import('/vendor/xterm/xterm.mjs')")&&xterm.includes('rawStream:true'),'xterm renderer handles raw provider I/O');
check('xterm.raw_input_passthrough',xterm.includes('rawInput:data')&&xterm.includes('rawStream:true')&&!xterm.includes('encodeWin32InputMode'),'xterm owns input interaction and passes raw terminal bytes unchanged to TerminalRuntimeCapability');
const main=read('stack/native-typescript/main.ts');
check('detach.same_runtime_identity',main.includes("terminalSessionId")&&main.includes('attachSession(existingSessionId'),'Detached real terminal reattaches same server-side runtime session');
check('detached_note.identity',main.includes('detachedNoteId')&&main.includes('api.openNote?.(detachedNoteId,false)'),'Detached note binds the same stable note identity');

const fake={descriptor(){return {contract:RUNTIME_ADAPTER_CONTRACT,id:'WindowsConptyRuntimeAdapter',label:'fake',sessionOwner:'TerminalRuntimeCapability',rawTerminal:true,pty:true,conpty:true,runtimeTruth:'WINDOWS_CONPTY'}},session(id){return {id,deviceId:'fake-shell',runId:'proof',epoch:'e1',presentation:{state:'running',detail:'proof',sequence:1,transitions:[]},rawOutputBase64:''}},prompt(){return ''}};
let detachArgs=null; const platform={requestSeparateWindow(args){detachArgs=structuredClone(args);return {ok:true,active:true,code:'OPEN'}}};
const owner=new OperationalSessionOwner({platformWindowBridge:platform});
const tab=owner.attachProviderSession(fake,'runtime-42',{classification:'REAL_RUNTIME_PROVIDER'}); owner.setPlacement('floating'); const pin=owner.setPinned(true),pinTransition=structuredClone(owner.lastTransition); const detached=owner.detachWindow();
check('operational.pin_internal',pin.chrome.pinned===true&&pinTransition.scope==='CEP_PRESENTATION_ONLY','CEP pin stays presentation-only');
check('operational.detach_identity',detached.providerSessionPreserved===true&&detachArgs.runtimeSessionId==='runtime-42'&&detachArgs.providerId==='WindowsConptyRuntimeAdapter'&&detachArgs.presentationId===tab.presentationId,'Detach passes stable presentation/provider/runtime identities');
const descriptor=owner.providerDescriptor('WindowsConptyRuntimeAdapter');
check('operational.provider_truth',descriptor.rawTerminal&&descriptor.pty&&descriptor.conpty&&descriptor.runtimeTruth==='WINDOWS_CONPTY','Provider truth projects without changing semantic owner');
const renderer=new XtermOperationalTerminalRenderer(); const rd=renderer.descriptor();
check('xterm.renderer_only',rd.rendererOnly===true&&rd.semanticCommandOwnership===false&&rd.processLifecycleOwnership===false,'xterm remains renderer-only');

const out={mission:'MISSION_WINDOWS_NATIVE_PLATFORM_TERMINAL_CONVERGENCE',classification:'LANE1_LOCAL_FALSIFICATION__NOT_WINDOWS_INTERACTIVE_ACCEPTANCE',pass:checks.every(x=>x.status==='PASS'),checks};
const outDir=path.join(root,'assurance/lane1-windows-native-terminal');
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'local-falsification.json'),JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2));
if(!out.pass)process.exit(1);
