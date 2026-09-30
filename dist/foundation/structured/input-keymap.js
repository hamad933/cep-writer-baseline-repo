import {INPUT_INTENT,createInputOwnershipDescriptor,isCompositionEvent} from '../global/input-ownership-contract.js';
import {STRUCTURED_CARET_BRIDGE_CONTRACT,StructuredCaretBridge} from './caret-bridge.js';
import {STRUCTURED_SHORTHAND_CONTRACT,resolveStructuredShorthand} from './shorthand.js';

const clone=value=>structuredClone(value);
const CLIPBOARD_CHORDS=Object.freeze({
  'Ctrl+KeyC':'document.copy','Meta+KeyC':'document.copy',
  'Ctrl+KeyX':'document.cut','Meta+KeyX':'document.cut',
  'Ctrl+KeyV':'document.paste','Meta+KeyV':'document.paste'
});
const HISTORY_CHORDS=Object.freeze({
  'Ctrl+KeyZ':'history.undo','Meta+KeyZ':'history.undo',
  'Ctrl+Shift+KeyZ':'history.redo','Meta+Shift+KeyZ':'history.redo',
  'Ctrl+KeyY':'history.redo','Meta+KeyY':'history.redo'
});

const SETTINGS_BINDINGS=Object.freeze([
  Object.freeze({id:'structured.enter',label:'Structured Enter',chord:'Enter',commandId:'block.split'}),
  Object.freeze({id:'structured.tab',label:'Indent block',chord:'Tab',commandId:'block.indent'}),
  Object.freeze({id:'structured.shift-tab',label:'Outdent block',chord:'Shift+Tab',commandId:'block.outdent'}),
  Object.freeze({id:'structured.backspace',label:'Structural merge',chord:'Backspace',commandId:'block.mergeBackward'}),
  Object.freeze({id:'structured.undo',label:'Undo structured transaction',chord:'Ctrl/Meta+Z',commandId:'history.undo'}),
  Object.freeze({id:'structured.redo-shift-z',label:'Redo structured transaction',chord:'Ctrl/Meta+Shift+Z',commandId:'history.redo'}),
  Object.freeze({id:'structured.redo-y',label:'Redo structured transaction',chord:'Ctrl/Meta+Y',commandId:'history.redo'}),
  Object.freeze({id:'structured.copy',label:'Copy structured selection',chord:'Ctrl/Meta+C',commandId:'document.copy'}),
  Object.freeze({id:'structured.cut',label:'Cut structured selection',chord:'Ctrl/Meta+X',commandId:'document.cut'}),
  Object.freeze({id:'structured.paste',label:'Paste structured selection',chord:'Ctrl/Meta+V',commandId:'document.paste'})
]);

export const STRUCTURED_INPUT_KEYMAP_OWNER='StructuredInputKeymapOwner';
export const STRUCTURED_INPUT_KEYMAP_CONTRACT=Object.freeze({
  id:STRUCTURED_INPUT_KEYMAP_OWNER,
  version:'1.0.0',
  family:'structured',
  owner:STRUCTURED_INPUT_KEYMAP_OWNER,
  globalOwner:'GlobalInputKeymapOwner',
  canonicalSelectionOwner:'StructuredSelectionKernel',
  canonicalClipboardOwner:'StructuredClipboardTrustOwner',
  canonicalAvailabilityOwner:'StructuredCommandAvailabilityOwner',
  canonicalMutationOwner:'StructuredMutationKernel',
  canonicalTransactionOwner:'StructuredTransactionHistoryRecoveryOwner',
  semanticCommandOwner:'SemanticCommandBus',
  policyTag:'structured-input-keymap-w4a-r1'
});

export const STRUCTURED_INPUT_KEYMAP_POLICY=Object.freeze({
  enter:Object.freeze({headingContinuationType:'paragraph',defaultContinuation:'preserve',emptyListExitType:'paragraph'}),
  tab:Object.freeze({forwardCommand:'block.indent',reverseCommand:'block.outdent'}),
  backspace:Object.freeze({structuralAtBlockStart:true}),
  navigation:Object.freeze({crossBlockArrows:true}),
  shorthand:Object.freeze({enabled:true}),
  clipboard:Object.freeze({keyboardDelegation:true}),
  global:Object.freeze({shortcutPrecedence:'global-first',claimShortcutIntent:false})
});

const isMacChord=event=>event.metaKey===true&&!event.ctrlKey;
const chordFor=event=>{
  const modifiers=[];if(event.ctrlKey)modifiers.push('Ctrl');if(event.metaKey)modifiers.push('Meta');if(event.altKey)modifiers.push('Alt');if(event.shiftKey)modifiers.push('Shift');
  const base=String(event.code||event.key||'').trim();return [...modifiers,base].filter(Boolean).join('+');
};
const preventOnce=event=>{if(event?.defaultPrevented===true)return false;event?.preventDefault?.();return true;};
const editableHtml=block=>String(block?.html??block?.titleHtml??block?.title??block?.codeText??'');
const editableText=block=>editableHtml(block).replace(/<[^>]*>/g,'');

export class StructuredInputKeymapOwner{
  constructor({commands,globalInputKeymapOwner,selection,clipboard,commandAvailability,mutationKernel,transactionOwner,readDocument,treeKernel=null,policy=STRUCTURED_INPUT_KEYMAP_POLICY,allocateBlockId=null}={}){
    if(!commands||typeof commands.execute!=='function'||typeof commands.availability!=='function')throw Error('SEMANTIC_COMMAND_BUS_REQUIRED');
    if(globalInputKeymapOwner?.owner!=='GlobalInputKeymapOwner')throw Error('GLOBAL_INPUT_KEYMAP_OWNER_REQUIRED');
    if(selection?.owner!=='StructuredSelectionKernel')throw Error('STRUCTURED_SELECTION_KERNEL_REQUIRED');
    if(clipboard?.owner!=='StructuredClipboardTrustOwner')throw Error('STRUCTURED_CLIPBOARD_TRUST_OWNER_REQUIRED');
    if(commandAvailability?.owner!=='StructuredCommandAvailabilityOwner')throw Error('STRUCTURED_COMMAND_AVAILABILITY_OWNER_REQUIRED');
    if(mutationKernel?.owner!=='StructuredMutationKernel')throw Error('STRUCTURED_MUTATION_KERNEL_REQUIRED');
    if(transactionOwner?.owner!=='StructuredTransactionHistoryRecoveryOwner')throw Error('STRUCTURED_TRANSACTION_HISTORY_RECOVERY_OWNER_REQUIRED');
    if(typeof readDocument!=='function')throw Error('STRUCTURED_INPUT_DOCUMENT_READER_REQUIRED');
    if(clipboard.selection!==selection||clipboard.mutationKernel!==mutationKernel||clipboard.transactionOwner!==transactionOwner||clipboard.commandAvailabilityOwner!==commandAvailability)throw Error('STRUCTURED_INPUT_CANONICAL_OWNER_MISMATCH');
    this.owner=STRUCTURED_INPUT_KEYMAP_OWNER;this.contract=STRUCTURED_INPUT_KEYMAP_CONTRACT;this.commands=commands;this.globalInputKeymapOwner=globalInputKeymapOwner;this.selection=selection;this.clipboard=clipboard;this.commandAvailability=commandAvailability;this.mutationKernel=mutationKernel;this.transactionOwner=transactionOwner;this.readDocument=readDocument;this.treeKernel=treeKernel||mutationKernel.treeKernel;this.policy=Object.freeze({...STRUCTURED_INPUT_KEYMAP_POLICY,...policy,enter:Object.freeze({...STRUCTURED_INPUT_KEYMAP_POLICY.enter,...policy.enter}),tab:Object.freeze({...STRUCTURED_INPUT_KEYMAP_POLICY.tab,...policy.tab}),backspace:Object.freeze({...STRUCTURED_INPUT_KEYMAP_POLICY.backspace,...policy.backspace}),navigation:Object.freeze({...STRUCTURED_INPUT_KEYMAP_POLICY.navigation,...policy.navigation}),shorthand:Object.freeze({...STRUCTURED_INPUT_KEYMAP_POLICY.shorthand,...policy.shorthand}),clipboard:Object.freeze({...STRUCTURED_INPUT_KEYMAP_POLICY.clipboard,...policy.clipboard}),global:Object.freeze({...STRUCTURED_INPUT_KEYMAP_POLICY.global,...policy.global})});
    this.allocateBlockId=typeof allocateBlockId==='function'?allocateBlockId:null;this.identitySequence=0;this.sequence=0;this.receipts=[];this.caret=new StructuredCaretBridge({readDocument:this.readDocument,treeKernel:this.treeKernel});
    this.inputOwnership=createInputOwnershipDescriptor({owner:this.owner,family:'structured',kind:'structured-editor',claimedIntents:[INPUT_INTENT.PRINTABLE,INPUT_INTENT.EDITING,INPUT_INTENT.NAVIGATION],allowedGlobalCommands:[]});
  }
  descriptor(){return {id:'StructuredInputKeymapOwner.SettingsDescriptor',family:'structured',semanticOwner:this.owner,bindings:SETTINGS_BINDINGS.map(binding=>({...binding})),contract:this.contract,owner:this.owner,policy:clone(this.policy),inputOwnership:this.inputOwnership,delegates:{global:this.globalInputKeymapOwner.owner,selection:this.selection.owner,clipboard:this.clipboard.owner,availability:this.commandAvailability.owner,mutation:this.mutationKernel.owner,transaction:this.transactionOwner.owner,commands:'SemanticCommandBus'},caretContract:STRUCTURED_CARET_BRIDGE_CONTRACT,shorthandContract:STRUCTURED_SHORTHAND_CONTRACT};}
  inputOwnershipDescriptor({allowedGlobalCommands=[]}={}){return createInputOwnershipDescriptor({owner:this.owner,family:'structured',kind:'structured-editor',claimedIntents:[INPUT_INTENT.PRINTABLE,INPUT_INTENT.EDITING,INPUT_INTENT.NAVIGATION],allowedGlobalCommands});}
  _receipt(kind,detail={}){const receipt={sequence:++this.sequence,kind,owner:this.owner,policyTag:this.contract.policyTag,...clone(detail)};this.receipts.push(receipt);return receipt;}
  _document(){const document=this.readDocument();if(!document?.id||!Array.isArray(document.blocks))throw Error('INVALID_STRUCTURED_INPUT_DOCUMENT');return document;}
  _block(blockId){return blockId?this.treeKernel.findRef(this._document().blocks,blockId)?.block||null:null;}
  _allocate(source='block',context={}){if(typeof context.allocateBlockId==='function')return String(context.allocateBlockId({source,owner:this.owner})||'');if(this.allocateBlockId)return String(this.allocateBlockId({source,owner:this.owner})||'');let id;do{id=`${source}-input-${++this.identitySequence}`}while(this.treeKernel.findRef(this._document().blocks,id));return id;}
  _globalReserved(globalResult){if(!globalResult)return false;if(globalResult.handled)return true;if(globalResult.suppressed&&globalResult.code!=='INPUT_OWNER_CLAIMS_INTENT')return true;return false;}
  _command(command,payload,event,{expectedAvailabilityOwner=this.commandAvailability.owner,kind='structural',suppressNative=false}={}){
    const earlyPrevented=suppressNative?preventOnce(event):false;
    const availability=this.commands.availability(command,payload);
    if(!availability.enabled)return {handled:false,suppressed:true,code:availability.code||'COMMAND_UNAVAILABLE',owner:this.owner,command,availability,preventDefaultApplied:earlyPrevented};
    if(expectedAvailabilityOwner&&availability.availabilityOwner!==expectedAvailabilityOwner)return {handled:false,suppressed:true,code:'CANONICAL_AVAILABILITY_OWNER_MISMATCH',owner:this.owner,command,availability,expectedAvailabilityOwner,preventDefaultApplied:earlyPrevented};
    const result=this.commands.execute(command,{...payload,route:'structured-keyboard',inputOwner:this.owner});
    if(result?.ok===false)return {handled:false,suppressed:true,code:result.code||'COMMAND_EXECUTION_FAILED',owner:this.owner,command,availability,result,preventDefaultApplied:earlyPrevented};
    const prevented=suppressNative?earlyPrevented:preventOnce(event),receipt=this._receipt(kind,{command,delegatedCommandOwner:availability.commandOwner,availabilityOwner:availability.availabilityOwner,preventDefaultApplied:prevented});
    return {handled:true,suppressed:false,code:'STRUCTURED_COMMAND_DISPATCHED',owner:this.owner,command,availability,result,preventDefaultApplied:prevented,receipt};
  }
  _clipboardCommand(command,event,context={}){
    const payload={mode:context.mode||'edit',payload:context.clipboardPayload,target:context.pasteTarget,index:context.pasteIndex,transport:context.clipboardTransport};
    const availability=this.commands.availability(command,payload);
    if(!availability.enabled)return {handled:false,suppressed:true,code:availability.code||'CLIPBOARD_COMMAND_UNAVAILABLE',owner:this.owner,command,availability};
    if(availability.commandOwner!==this.clipboard.owner)return {handled:false,suppressed:true,code:'CLIPBOARD_OWNER_MISMATCH',owner:this.owner,command,availability,expectedOwner:this.clipboard.owner};
    const result=this.commands.execute(command,{...payload,route:'structured-keyboard',inputOwner:this.owner});
    if(result?.ok===false)return {handled:false,suppressed:true,code:result.code||'CLIPBOARD_COMMAND_FAILED',owner:this.owner,command,availability,result};
    const prevented=preventOnce(event),receipt=this._receipt('clipboard',{command,delegatedCommandOwner:availability.commandOwner,availabilityOwner:availability.availabilityOwner,preventDefaultApplied:prevented});
    return {handled:true,suppressed:false,code:'STRUCTURED_CLIPBOARD_DELEGATED',owner:this.owner,command,delegatedOwner:this.clipboard.owner,availability,result,preventDefaultApplied:prevented,receipt};
  }
  _enter(event,context,caret){
    const block=this._block(caret.blockId);if(!block)return {handled:false,suppressed:true,code:'BLOCK_REQUIRED',owner:this.owner};
    if(block.type==='code')return {handled:false,suppressed:false,code:'ENTER_NATIVE_CODE_PASSTHROUGH',owner:this.owner};
    const caretText=String(caret.beforeText??'')+String(caret.afterText??'');
    if((block.type==='bullet'||block.type==='number')&&!caretText.trim()&&caret.atStart&&caret.atEnd){return this._command('block.convert',{mode:context.mode||'edit',blockId:block.id,to:this.policy.enter.emptyListExitType,sourceHtml:'',sourceText:''},event,{kind:'enter-empty-list-exit'});}
    if(block.type==='toggle'||block.type==='bullet'||block.type==='number'){
      const ref=this.treeKernel.findRef(this._document().blocks,block.id),id=this._allocate(block.id,context);if(!ref||!id)return {handled:false,suppressed:true,code:'IDENTITY_PROVIDER_FAILED',owner:this.owner};
      const target={kind:'gap',surfaceKey:'main',parentId:ref.parent?.id||null,depth:ref.depth,index:ref.index+1,afterBlockId:block.id,beforeBlockId:ref.array[ref.index+1]?.id||null};
      const newBlock=block.type==='toggle'?{id,type:'toggle',title:'',titleHtml:'',open:true,children:[]}:{id,type:block.type,html:'',children:[]};
      return this._command('block.insert',{mode:context.mode||'edit',blockId:block.id,target,block:newBlock,type:newBlock.type,presentation:{caret:{blockId:id,offset:0}}},event,{kind:'enter-container-sibling'});
    }
    const continuation=(block.type==='h2'||block.type==='h3')?this.policy.enter.headingContinuationType:this.policy.enter.defaultContinuation==='preserve'?block.type:'paragraph';
    const id=this._allocate(block.id,context);if(!id)return {handled:false,suppressed:true,code:'IDENTITY_PROVIDER_FAILED',owner:this.owner};
    const newBlock={id,type:continuation,html:String(caret.afterHtml??caret.afterText??'')};
    return this._command('block.split',{mode:context.mode||'edit',blockId:block.id,before:String(caret.beforeHtml??caret.beforeText??''),newBlock,presentation:{caret:{blockId:id,offset:0}}},event,{kind:'enter'});
  }
  _tab(event,context,caret){const command=event.shiftKey?this.policy.tab.reverseCommand:this.policy.tab.forwardCommand;return this._command(command,{mode:context.mode||'edit',blockId:caret.blockId},event,{kind:event.shiftKey?'shift-tab':'tab'});}
  _backspace(event,context,caret){if(!this.policy.backspace.structuralAtBlockStart||!caret.atStart)return {handled:false,suppressed:false,code:'BACKSPACE_NATIVE_TEXT_PASSTHROUGH',owner:this.owner};const block=this._block(caret.blockId);if(block?.type==='toggle'&&!String(caret.beforeText??'').trim()&&!String(caret.afterText??'').trim()&&!(block.children?.length)){return this._command('block.convert',{mode:context.mode||'edit',blockId:block.id,to:'paragraph',sourceHtml:'',sourceText:''},event,{kind:'backspace-empty-toggle'});}return this._command('block.mergeBackward',{mode:context.mode||'edit',blockId:caret.blockId,plainText:String(caret.beforeText??'')+String(caret.afterText??'')},event,{kind:'backspace'});}
  _navigation(event,context,caret){if(!this.policy.navigation.crossBlockArrows)return {handled:false,suppressed:false,code:'NAVIGATION_POLICY_PASSTHROUGH',owner:this.owner};const target=this.caret.navigationTarget(event.key,caret);if(!target)return {handled:false,suppressed:false,code:'NAVIGATION_NATIVE_PASSTHROUGH',owner:this.owner};const selection=this.selection.selectInlineRange({blockId:target.blockId,anchorOffset:target.offset,focusOffset:target.offset});const prevented=preventOnce(event),receipt=this._receipt('navigation',{key:event.key,fromBlockId:target.fromBlockId,toBlockId:target.blockId,offset:target.offset,selectionOwner:selection.owner,preventDefaultApplied:prevented});return {handled:true,suppressed:false,code:'STRUCTURED_NAVIGATION_DELEGATED',owner:this.owner,selectionOwner:this.selection.owner,selection,target,preventDefaultApplied:prevented,receipt};}
  _shorthand(event,context,caret){if(!this.policy.shorthand.enabled)return null;const block=this._block(caret.blockId);if(!block)return null;const shorthand=resolveStructuredShorthand({key:event.key,beforeText:caret.beforeText,afterText:caret.afterText,blockType:block.type,compositionActive:this.caret.snapshot().compositionActive});if(!shorthand)return null;return this._command('block.convert',{mode:context.mode||'edit',blockId:block.id,to:shorthand.to,sourceHtml:shorthand.sourceHtml,sourceText:shorthand.sourceText},event,{kind:'shorthand'});}
  handleCompositionStart(event={},context={}){const snapshot=context.caret?this.caret.capture(context.caret):this.caret.snapshot();this.caret.compositionStart(event.data??context.data??'');return {handled:false,suppressed:false,code:'IME_COMPOSITION_STARTED',owner:this.owner,caret:snapshot};}
  handleCompositionUpdate(event={},context={}){this.caret.compositionUpdate(event.data??context.data??'');return {handled:false,suppressed:false,code:'IME_COMPOSITION_UPDATED',owner:this.owner};}
  handleCompositionEnd(event={},context={}){this.caret.compositionEnd(event.data??context.data??'');return {handled:false,suppressed:false,code:'IME_COMPOSITION_ENDED',owner:this.owner};}
  handleKeydown(event={},context={}){
    if(this._globalReserved(context.globalResult))return {handled:false,suppressed:true,code:'GLOBAL_ROUTE_RESERVED',owner:this.owner,globalOwner:this.globalInputKeymapOwner.owner,globalResult:context.globalResult};
    if(isCompositionEvent(event)||this.caret.snapshot().compositionActive)return {handled:false,suppressed:false,code:'IME_COMPOSITION_PASSTHROUGH',owner:this.owner,compositionSafe:true};
    const suppliedCaret=context.caret||this.caret.snapshot(),caret=suppliedCaret.blockId?this.caret.capture(suppliedCaret):suppliedCaret;
    const chord=chordFor(event),historyCommand=HISTORY_CHORDS[chord],clipboardCommand=CLIPBOARD_CHORDS[chord];
    if(historyCommand)return this._command(historyCommand,{mode:context.mode||'edit'},event,{kind:historyCommand==='history.undo'?'history-undo':'history-redo',suppressNative:true});
    if(clipboardCommand&&this.policy.clipboard.keyboardDelegation)return this._clipboardCommand(clipboardCommand,event,context);
    if((event.ctrlKey||event.metaKey||event.altKey)&&!clipboardCommand)return {handled:false,suppressed:false,code:'GLOBAL_SHORTCUT_DELEGATED',owner:this.owner,globalOwner:this.globalInputKeymapOwner.owner,chord:isMacChord(event)?chord:chordFor(event)};
    if(event.key==='Enter'&&!event.shiftKey)return this._enter(event,context,caret);
    if(event.key==='Tab')return this._tab(event,context,caret);
    if(event.key==='Backspace')return this._backspace(event,context,caret);
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return this._navigation(event,context,caret);
    const shorthand=this._shorthand(event,context,caret);if(shorthand)return shorthand;
    return {handled:false,suppressed:false,code:'STRUCTURED_NATIVE_INPUT_PASSTHROUGH',owner:this.owner};
  }
}
