import {readFileSync} from 'node:fs';
import {SemanticCommandBus} from '../../../foundation/global/commands.js';
import {GlobalInputKeymapOwner, GLOBAL_INPUT_KEYMAP_OWNER} from '../../../foundation/global/input-keymap.js';
import {WorkspaceRegionCycle, createRegionCycleDescriptor} from '../../../foundation/global/region-cycle.js';
import {TransientFocusOwner, TRANSIENT_FOCUS_OWNER} from '../../../foundation/global/transient-focus.js';
import {classifyInputIntent, INPUT_INTENT} from '../../../foundation/global/input-ownership-contract.js';
                                                                                                 

const assert=(v    ,m='assertion failed')=>{if(!v)throw Error(m)};
const run=(name       ,fn         ,out      )=>{try{fn();out.push({name,status:'PASS'})}catch(e){out.push({name,status:'FAIL',error:String((e       )?.stack||(e       )?.message||e)})}};
const throws=(fn         ,code       )=>{let caught    ;try{fn()}catch(e){caught=String((e       )?.message||e)}assert(typeof caught==='string'&&caught.includes(code),expected , got )};

const mockElement=(id       ,tag='div')    =>{
  const attrs                      ={};
  return {
    id,
    tagName:tag.toUpperCase(),
    nodeType:1,
    hidden:false,
    disabled:false,
    focused:false,
    offsetParent:{},
    attrs,
    getAttribute(k       ){return attrs[k]??null},
    setAttribute(k       ,v       ){attrs[k]=String(v)},
    hasAttribute(k       ){return k in attrs},
    removeAttribute(k       ){delete attrs[k]},
    focus(){this.focused=true},
    blur(){this.focused=false},
    closest(sel       ){return sel.includes(id)?this:null}
  };
};

export function runD03BWorkspaceContextConvergenceTests(){const t      =[];

  run('d03b.input-intent-f6-classified-as-region-cycle',()=>{
    assert(classifyInputIntent({key:'F6'})===INPUT_INTENT.REGION_CYCLE,'plain F6 is classified as region-cycle');
    assert(classifyInputIntent({key:'F6',shiftKey:true})===INPUT_INTENT.REGION_CYCLE,'Shift+F6 is classified as region-cycle');
    assert(classifyInputIntent({key:'F6',ctrlKey:true})!==INPUT_INTENT.REGION_CYCLE,'Ctrl+F6 is shortcut, not region-cycle');
    assert(classifyInputIntent({key:'F6',altKey:true})!==INPUT_INTENT.REGION_CYCLE,'Alt+F6 is shortcut, not region-cycle');
  },t);

  run('d03b.region-cycle-f6-delegation-canonical-input-owner',()=>{
    const bus=new SemanticCommandBus();
    const regions=[
      mockElement('topRegion'),
      mockElement('toolbarRegion'),
      mockElement('leftPane'),
      mockElement('centerPane'),
      mockElement('rightPane'),
      mockElement('bottomPane')
    ];
    let focusedIndex=-1;
    const descriptors=[
      createRegionCycleDescriptor({id:'TOP',focus:()=>{focusedIndex=0;regions[0].focus();return true;},containsFocus:()=>focusedIndex===0}),
      createRegionCycleDescriptor({id:'TOOLBAR',focus:()=>{focusedIndex=1;regions[1].focus();return true;},containsFocus:()=>focusedIndex===1}),
      createRegionCycleDescriptor({id:'LEFT',focus:()=>{focusedIndex=2;regions[2].focus();return true;},containsFocus:()=>focusedIndex===2}),
      createRegionCycleDescriptor({id:'CENTER',focus:()=>{focusedIndex=3;regions[3].focus();return true;},containsFocus:()=>focusedIndex===3}),
      createRegionCycleDescriptor({id:'RIGHT',available:()=>false,focus:()=>{focusedIndex=4;regions[4].focus();return true;},containsFocus:()=>focusedIndex===4}),
      createRegionCycleDescriptor({id:'BOTTOM',focus:()=>{focusedIndex=5;regions[5].focus();return true;},containsFocus:()=>focusedIndex===5})
    ];
    const keymap=new GlobalInputKeymapOwner({commands:bus,regions:descriptors});
    assert(keymap.owner===GLOBAL_INPUT_KEYMAP_OWNER);

    // Initial cycle from none -> TOP
    const r1=keymap.handleKeydown({key:'F6',shiftKey:false});
    assert(r1.handled===true&&r1.owner===GLOBAL_INPUT_KEYMAP_OWNER&&r1.intent===INPUT_INTENT.REGION_CYCLE);
    assert(r1.receipt.to==='TOP'&&focusedIndex===0);

    // Forward cycle -> TOOLBAR
    const r2=keymap.handleKeydown({key:'F6',shiftKey:false});
    assert(r2.handled===true&&r2.receipt.to==='TOOLBAR'&&focusedIndex===1);

    // Forward cycle -> LEFT
    const r3=keymap.handleKeydown({key:'F6',shiftKey:false});
    assert(r3.handled===true&&r3.receipt.to==='LEFT'&&focusedIndex===2);

    // Forward cycle -> CENTER
    const r4=keymap.handleKeydown({key:'F6',shiftKey:false});
    assert(r4.handled===true&&r4.receipt.to==='CENTER'&&focusedIndex===3);

    // Forward cycle from CENTER -> RIGHT is unavailable, so skips RIGHT and lands on BOTTOM
    const r5=keymap.handleKeydown({key:'F6',shiftKey:false});
    assert(r5.handled===true&&r5.receipt.to==='BOTTOM'&&focusedIndex===5);
    assert(r5.receipt.skipped.some((s    )=>s.id==='RIGHT'&&s.reasons.includes('unavailable')),'unavailable region was skipped with receipt proof');

    // Reverse cycle with Shift+F6 from BOTTOM -> CENTER
    const r6=keymap.handleKeydown({key:'F6',shiftKey:true});
    assert(r6.handled===true&&r6.receipt.to==='CENTER'&&focusedIndex===3);
  },t);

  run('d03b.transient-focus-popover-containment-and-invoker-restoration',()=>{
    const owner=new TransientFocusOwner();
    assert(owner.snapshot().owner===TRANSIENT_FOCUS_OWNER);
    const invoker=mockElement('workspaceViewButton','button');
    const popover=mockElement('workspacePopover','div');
    popover.hidden=true;

    // Open popover
    popover.hidden=false;
    const opened=owner.open('workspacePopover',{
      invoker,
      element:popover,
      kind:'popover',
      modal:false,
      escapeDismiss:true,
      outsideDismiss:true,
      fallbackFocus:()=>mockElement('centerPane'),
      onClose:()=>{popover.hidden=true;}
    });
    assert(opened==='workspacePopover'&&owner.active().length===1);
    assert(owner.top()?.id==='workspacePopover');

    // Dismiss with escape -> restores focus to invoker
    const dismissed=owner.dismiss('escape',{restore:true});
    assert(dismissed===true&&popover.hidden===true);
    assert(owner.active().length===0);
    assert(invoker.focused===true,'invoker was refocused on escape dismissal');
    assert(owner.lastDismissal.restored===true&&owner.lastDismissal.focusTargetKind==='invoker');

    // Reopen and dismiss with outside pointer -> no restore to avoid stealing pointer target focus
    invoker.focused=false;
    popover.hidden=false;
    owner.open('workspacePopover',{
      invoker,
      element:popover,
      kind:'popover',
      modal:false,
      escapeDismiss:true,
      outsideDismiss:true,
      fallbackFocus:()=>mockElement('centerPane'),
      onClose:()=>{popover.hidden=true;}
    });
    assert(owner.active().length===1);
    const outsideDismissed=owner.dismiss('outside',{restore:false});
    assert(outsideDismissed===true&&popover.hidden===true);
    assert(owner.active().length===0);
    assert(invoker.focused===false,'invoker not refocused on outside click dismissal');
    assert(owner.lastDismissal.restored===false&&owner.lastDismissal.reason==='outside');
  },t);

  run('d03b.transient-focus-multiple-popovers-stack-depth-and-order',()=>{
    const owner=new TransientFocusOwner();
    const invoker1=mockElement('btn1','button'),pop1=mockElement('pop1','div');
    const invoker2=mockElement('btn2','button'),pop2=mockElement('pop2','div');

    owner.open('pop1',{invoker:invoker1,element:pop1,kind:'popover',modal:false,escapeDismiss:true,outsideDismiss:true,onClose:()=>{pop1.hidden=true;}});
    owner.open('pop2',{invoker:invoker2,element:pop2,kind:'popover',modal:false,escapeDismiss:true,outsideDismiss:true,onClose:()=>{pop2.hidden=true;}});

    assert(owner.stack.length===2&&owner.top()?.id==='pop2');
    // Dismiss top -> pop2 dismissed, restores to invoker2, pop1 remains
    owner.dismiss('escape',{restore:true});
    assert(pop2.hidden===true&&invoker2.focused===true);
    assert(owner.stack.length===1&&owner.top()?.id==='pop1');

    // Dismiss next -> pop1 dismissed, restores to invoker1
    owner.dismiss('escape',{restore:true});
    assert(pop1.hidden===true&&invoker1.focused===true);
    assert(owner.stack.length===0&&owner.active().length===0);
  },t);

  run('d03b.semantic-surface-context-provider-today-and-visualize',()=>{
    const registry=new Map                                      ();
    const register=(p                             )=>registry.set(p.surface,p);

    let todayFilter='ALL';
    const todayElement=mockElement('todayView');
    const todayProvider                             ={
      surface:'today',
      capture:()=>({activeFilter:todayFilter}),
      restore:(ctx)=>{
        todayFilter=ctx.activeFilter||'ALL';
        todayElement.setAttribute('data-active-filter',todayFilter);
        todayElement.setAttribute('data-context-restored','true');
      }
    };

    let visualizeRepresentation='TREE';
    const visualizeElement=mockElement('visualizeView');
    const visualizeProvider                             ={
      surface:'visualize',
      capture:()=>({representationView:visualizeRepresentation}),
      restore:(ctx)=>{
        visualizeRepresentation=ctx.representationView||'TREE';
        visualizeElement.setAttribute('data-representation-view',visualizeRepresentation);
        visualizeElement.setAttribute('data-context-restored','true');
      }
    };

    register(todayProvider);
    register(visualizeProvider);

    // Simulate Today surface active with ATTENTION filter
    todayFilter='ATTENTION';
    const todayCaptured=registry.get('today')?.capture();
    assert(todayCaptured?.activeFilter==='ATTENTION');

    // Simulate navigation to Visualize with GRID representation
    visualizeRepresentation='GRID';
    const vizCaptured=registry.get('visualize')?.capture();
    assert(vizCaptured?.representationView==='GRID');

    // Simulate Back navigation restoring Today context
    assert(todayElement.getAttribute('data-context-restored')===null);
    registry.get('today')?.restore(todayCaptured );
    assert(todayElement.getAttribute('data-active-filter')==='ATTENTION');
    assert(todayElement.getAttribute('data-context-restored')==='true');

    // Simulate Forward navigation restoring Visualize context
    assert(visualizeElement.getAttribute('data-context-restored')===null);
    registry.get('visualize')?.restore(vizCaptured );
    assert(visualizeElement.getAttribute('data-representation-view')==='GRID');
    assert(visualizeElement.getAttribute('data-context-restored')==='true');
  },t);

  run('d03b.negative.accepted-runtime-f6-and-popover-delegation-truth',()=>{
    const runtimeSource=readFileSync(new URL('../../../../stack/native-typescript/foundation/accepted-runtime.ts',import.meta.url),'utf8');
    assert(runtimeSource.includes('cyclePrimaryRegion'),'accepted-runtime has region cycle delegation');
    assert(runtimeSource.includes('owner.handleKeydown'),'F6 keydown delegates directly to canonical owner.handleKeydown');
    assert(runtimeSource.includes('extension.transientOwner?.dismiss?.(\'outside\''),'outside click dismisses through transientOwner');
    assert(runtimeSource.includes('owner.open(\'workspacePopover\''),'workspacePopover delegates to transientOwner.open');
    assert(runtimeSource.includes('owner.open(\'quickJumpPopover\''),'quickJumpPopover delegates to transientOwner.open');
    assert(runtimeSource.includes('owner.open(\'globalNavPopover\''),'globalNavPopover delegates to transientOwner.open');
  },t);

  return t;
}

if(process.argv[1]&&(import.meta.url.includes(process.argv[1].replace(/^[A-Za-z]:/,'').replaceAll('\\','/'))||process.argv[1].includes('d03b-workspace-context-convergence-tests'))){
  const tests=runD03BWorkspaceContextConvergenceTests();
  const report={mission:'D03B',kind:'MODEL_NOT_BROWSER',pass:tests.filter((x    )=>x.status==='PASS').length,fail:tests.filter((x    )=>x.status==='FAIL').length,tests};
  console.log(JSON.stringify(report,null,2));
  if(tests.some((x    )=>x.status==='FAIL'))process.exitCode=1;
}
