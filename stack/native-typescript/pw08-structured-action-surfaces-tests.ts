import {createStructuredConsumerAdapter} from './adapters/structured-documents.js';
import {StructuredActionDescriptorOwner} from './foundation/structured/action-descriptors.js';
import {StructuredActionSurfacePresentationHost,STRUCTURED_ACTION_SURFACE_PRESENTATION_CONTRACT} from './foundation/structured/action-surfaces/presentation-host.js';
import {TransientFocusOwner} from './foundation/global/transient-focus.js';

const assert=(condition:boolean,message:string)=>{if(!condition)throw Error(message);};
class FakeClassList{contains(){return false;}}
class FakeElement{
  hidden=true;disabled=false;isConnected=true;offsetParent:any={};offsetWidth=300;offsetHeight=240;dataset:any={};style:any={};classList=new FakeClassList();children:any[]=[];attributes=new Map<string,string>();focused=false;
  id:string;doc:any;rect:any;
  constructor(id:string,doc:any,rect={left:20,top:20,right:70,bottom:50,width:50,height:30}){this.id=id;this.doc=doc;this.rect=rect;}
  setAttribute(k:string,v:string){this.attributes.set(k,String(v));}
  getAttribute(k:string){return this.attributes.get(k)??null;}
  removeAttribute(k:string){this.attributes.delete(k);}
  querySelector(){return null;} querySelectorAll(){return [];} addEventListener(){}
  contains(target:any){return target===this;} getBoundingClientRect(){return this.rect;}
  focus(){this.doc.activeElement=this;this.focused=true;}
}
const fakeDocument=()=>{const doc:any={activeElement:null,querySelector(){return null;}};return doc;};
const digest=(value:any)=>JSON.stringify(value);

export function runPW08StructuredActionSurfaceTests(){
  const results:any[]=[];const run=(id:string,fn:()=>any)=>{try{const detail=fn();results.push({id,status:'PASS',detail:detail??null});}catch(error:any){results.push({id,status:'FAIL',error:String(error?.stack||error)});}};
  const adapter=createStructuredConsumerAdapter('learn');
  const actions=new StructuredActionDescriptorOwner(adapter);
  const blockId=adapter.snapshot().blocks[0].id;
  const context={mode:'edit',blockId};

  run('PW08-T01_DESCRIPTOR_ROUTE_PARITY',()=>{
    const block=actions.blockMenu(context),shift=actions.shiftF10(context),keyboard=actions.keyboard(context);
    assert(digest(block.truthKeys)===digest(shift.truthKeys),'block-menu/Shift+F10 truth diverged');
    assert(digest(block.truthKeys)===digest(keyboard.truthKeys),'block-menu/keyboard truth diverged');
    assert(block.owner==='StructuredActionDescriptorOwner','descriptor owner changed');
    return {owner:block.owner,count:block.descriptors.length,truthParity:true};
  });
  run('PW08-T02_UNAVAILABLE_PARITY',()=>{
    const block=actions.blockMenu(context).descriptors.find((x:any)=>x.actionId==='block.moveUp');
    const shift=actions.shiftF10(context).descriptors.find((x:any)=>x.actionId==='block.moveUp');
    assert(block?.enabled===false,'first block moveUp should be unavailable');
    assert(block?.truthKey===shift?.truthKey,'unavailable truth diverged by route');
    assert(block?.availabilityOwner==='StructuredCommandAvailabilityOwner','availability owner changed');
    return {enabled:block.enabled,code:block.code,owner:block.availabilityOwner};
  });
  run('PW08-T03_INSERTION_TARGET_CANONICAL',()=>{
    const descriptor=actions.describe('insert.after',context);
    assert(descriptor.insertionContract?.id==='StructuredInsertionTargetOwner','insertion target owner changed');
    assert(descriptor.target?.kind,'canonical insertion target missing');
    return {contract:descriptor.insertionContract.id,target:descriptor.target};
  });
  run('PW08-T04_ACTION_EXECUTION_DELEGATED',()=>{
    const before=digest(adapter.snapshot());
    const descriptor=actions.describe('block.duplicate',context);
    const result=actions.execute('block.duplicate',{...context,surface:'block-menu'});
    assert(result.ok===true&&result.changed===true,'canonical duplicate failed');
    assert(result.descriptorOwner==='StructuredActionDescriptorOwner','descriptor ownership changed');
    assert(result.domainMutationByDescriptorOwner===false,'Presentation/descriptor owner mutated domain directly');
    assert(result.delegation?.mutationOwner==='StructuredMutationKernel','mutation owner changed');
    adapter.executeSharedCommand('history.undo',{mode:'edit'});
    assert(digest(adapter.snapshot())===before,'undo did not exactly restore Structured document');
    return {delegation:result.delegation,undoExact:true,truthKey:descriptor.truthKey};
  });
  run('PW08-T05_PRESENTATION_CONTRACT_NO_SEMANTICS',()=>{
    assert(STRUCTURED_ACTION_SURFACE_PRESENTATION_CONTRACT.semanticOwner===false,'Presentation host claims semantics');
    assert(STRUCTURED_ACTION_SURFACE_PRESENTATION_CONTRACT.transientOwner==='TransientHostOwner','G2 transient owner not bound');
    assert(STRUCTURED_ACTION_SURFACE_PRESENTATION_CONTRACT.focusOwner==='TransientFocusOwner','G2 focus owner not bound');
    assert(STRUCTURED_ACTION_SURFACE_PRESENTATION_CONTRACT.actionOwner==='StructuredActionDescriptorOwner','G3 action owner not bound');
    return STRUCTURED_ACTION_SURFACE_PRESENTATION_CONTRACT;
  });
  run('PW08-T06_ESCAPE_FOCUS_RETURN_G2',()=>{
    const doc=fakeDocument(),invoker=new FakeElement('invoker',doc),menu=new FakeElement('menu',doc),focus=new TransientFocusOwner({document:doc}),host=new StructuredActionSurfacePresentationHost({transientFocus:focus,document:doc,window:{innerWidth:1440,innerHeight:1000}} as any);
    invoker.focus();host.openBlockMenu({element:menu,invoker,anchorRect:invoker.rect});
    assert(focus.top()?.id==='pw08:block-menu','PW08 surface not registered through G2 focus owner');
    assert(host.dismissTop('escape',{restore:true})===true,'Escape dismissal failed');
    assert(doc.activeElement===invoker,'G2 focus return failed');
    assert(focus.snapshot().lastDismissal?.owner==='TransientFocusOwner','focus return not owned by G2');
    return focus.snapshot();
  });
  run('PW08-T07_OUTSIDE_DISMISS_NO_STALE_TRANSIENT',()=>{
    const doc=fakeDocument(),invoker=new FakeElement('invoker',doc),palette=new FakeElement('palette',doc),outside=new FakeElement('outside',doc),focus=new TransientFocusOwner({document:doc}),host=new StructuredActionSurfacePresentationHost({transientFocus:focus,document:doc,window:{innerWidth:1024,innerHeight:900}} as any);
    host.openInsertionPalette({element:palette,invoker,anchorRect:invoker.rect});
    assert(host.outsidePointer(outside,{restore:false})===true,'outside dismissal failed');
    assert(focus.active().length===0,'stale G2 transient remained after outside dismissal');
    return {active:focus.active(),lastDismissal:focus.snapshot().lastDismissal};
  });
  run('PW08-T08_CONFIRMATION_PROTECTED_TOP',()=>{
    const doc=fakeDocument(),invoker=new FakeElement('invoker',doc),dialog=new FakeElement('dialog',doc),focus=new TransientFocusOwner({document:doc}),host=new StructuredActionSurfacePresentationHost({transientFocus:focus,document:doc,window:{innerWidth:1024,innerHeight:900}} as any);
    host.bindConfirmation({element:dialog,invoker});
    assert(host.blocksDismissal('escape')===true,'destructive confirmation must block Escape dismissal at PW08 layer');
    assert(host.blocksDismissal('outside')===true,'destructive confirmation must block outside dismissal at PW08 layer');
    assert(host.dismissTop('escape')===false,'confirmation was incorrectly Escape-dismissed');
    host.closeSurface('destructive-confirmation',{restore:true,reason:'canonical-receipt'});
    assert(doc.activeElement===invoker,'confirmation receipt focus return failed');
    return {protectedEscape:true,protectedOutside:true,owner:focus.snapshot().lastDismissal?.owner};
  });
  const pass=results.filter(x=>x.status==='PASS').length,fail=results.length-pass;
  return {kind:'PW08_STRUCTURED_ACTION_SURFACE_FOCUSED_TESTS',status:fail?'FAIL':'PASS',pass,fail,total:results.length,consumerTruth:'UNIT_SEMANTIC_PROOF_ONLY__NOT_REAL_CONSUMER_CLAIM',results};
}
