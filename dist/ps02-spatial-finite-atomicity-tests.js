import {SpatialModel} from './foundation/models.js';

const nonFinite=[Number.NaN,Number.POSITIVE_INFINITY,Number.NEGATIVE_INFINITY];
const nodes=()=>[
  {id:'a',x:0,y:0},
  {id:'b',x:260,y:90},
  {id:'c',x:520,y:180}
];
const edge=()=>({id:'edge-1',source:'a',target:'b',type:'connects',direction:'directed',kind:'representation'});
const token=value=>Number.isNaN(value)?'NaN':value===Number.POSITIVE_INFINITY?'+Infinity':value===Number.NEGATIVE_INFINITY?'-Infinity':value;
const stable=value=>JSON.stringify(value,(_key,item)=>typeof item==='number'&&!Number.isFinite(item)?token(item):item);
const assert=(condition,message)=>{if(!condition)throw Error(message)};
const model=()=>{
  const m=new SpatialModel(nodes(),[edge()]);
  m.select('a');
  m.revision=17;
  m.domain={revision:5,records:[{id:'domain-1',state:'UP'}]};
  m.provider={revision:9,state:'CONNECTED'};
  return m;
};
const state=m=>({
  nodes:structuredClone(m.nodes),
  edges:structuredClone(m.edges),
  camera:structuredClone(m.camera),
  selection:{ids:[...m.selection],focusId:m.selectionKernel.focusContract.focusId,anchorId:m.selectionKernel.focusContract.anchorId,revision:m.selectionKernel.revision,lastAction:m.selectionKernel.lastAction},
  history:structuredClone(m.history),
  future:structuredClone(m.future),
  revision:m.revision,
  domain:structuredClone(m.domain),
  provider:structuredClone(m.provider)
});
const invalidSnapshot=(m,mutate)=>{const s=m.snapshot();mutate(s);return s};

export function runPS02SpatialFiniteAtomicityTests(){
  const cases=[];
  const run=(id,fn)=>{try{const detail=fn();cases.push({id,status:'PASS',detail:detail??true})}catch(error){cases.push({id,status:'FAIL',detail:String(error?.stack||error)})}};
  const atomic=(id,make,invoke)=>run(id,()=>{const m=make();const before=stable(state(m));const result=invoke(m);const after=stable(state(m));assert(result===false,`${id}: expected false rejection, received ${stable(result)}`);assert(after===before,`${id}: fail-atomic state changed`);return {result:'false',stateUnchanged:true}});

  for(const bad of nonFinite){
    const tag=token(bad);
    atomic(`move.dx.${tag}`,model,m=>m.move(['a'],bad,1));
    atomic(`move.dy.${tag}`,model,m=>m.move(['a'],1,bad));
    atomic(`pan.dx.${tag}`,model,m=>m.pan(bad,1));
    atomic(`pan.dy.${tag}`,model,m=>m.pan(1,bad));
    atomic(`zoom.factor.${tag}`,model,m=>m.zoomAt(bad,100,80));
    atomic(`zoom.anchor-x.${tag}`,model,m=>m.zoomAt(1.25,bad,80));
    atomic(`zoom.anchor-y.${tag}`,model,m=>m.zoomAt(1.25,100,bad));
    atomic(`fit.width.${tag}`,model,m=>m.fit(bad,700));
    atomic(`fit.height.${tag}`,model,m=>m.fit(1000,bad));
    atomic(`world.x.${tag}`,model,m=>m.world(bad,80));
    atomic(`world.y.${tag}`,model,m=>m.world(100,bad));
    atomic(`marquee.a-x.${tag}`,model,m=>m.marquee({x:bad,y:0},{x:150,y:70}));
    atomic(`marquee.a-y.${tag}`,model,m=>m.marquee({x:0,y:bad},{x:150,y:70}));
    atomic(`marquee.b-x.${tag}`,model,m=>m.marquee({x:0,y:0},{x:bad,y:70}));
    atomic(`marquee.b-y.${tag}`,model,m=>m.marquee({x:0,y:0},{x:150,y:bad}));
    atomic(`fit.node-x.${tag}`,()=>{const m=model();m.nodes[0].x=bad;return m},m=>m.fit(1000,700));
    atomic(`fit.node-y.${tag}`,()=>{const m=model();m.nodes[0].y=bad;return m},m=>m.fit(1000,700));
    atomic(`move.existing-node-x.${tag}`,()=>{const m=model();m.nodes[0].x=bad;return m},m=>m.move(['a'],1,1));
    atomic(`move.existing-node-y.${tag}`,()=>{const m=model();m.nodes[0].y=bad;return m},m=>m.move(['a'],1,1));
    atomic(`restore.camera-x.${tag}`,model,m=>m.restore(invalidSnapshot(m,s=>{s.camera.x=bad})));
    atomic(`restore.camera-y.${tag}`,model,m=>m.restore(invalidSnapshot(m,s=>{s.camera.y=bad})));
    atomic(`restore.camera-zoom.${tag}`,model,m=>m.restore(invalidSnapshot(m,s=>{s.camera.zoom=bad})));
    atomic(`restore.node-x.${tag}`,model,m=>m.restore(invalidSnapshot(m,s=>{s.nodes[0].x=bad})));
    atomic(`restore.node-y.${tag}`,model,m=>m.restore(invalidSnapshot(m,s=>{s.nodes[0].y=bad})));
    atomic(`pointer.begin.start-x.${tag}`,model,m=>m.interactionKernel.beginPointerGesture({button:0,ctrlKey:false,space:false,node:m.nodes[0],start:{x:bad,y:0},before:m.snapshot(),selection:m.selection,add:false,pointerId:1}));
    atomic(`pointer.begin.start-y.${tag}`,model,m=>m.interactionKernel.beginPointerGesture({button:0,ctrlKey:false,space:false,node:m.nodes[0],start:{x:0,y:bad},before:m.snapshot(),selection:m.selection,add:false,pointerId:1}));
    run(`pointer.advance.point.${tag}`,()=>{const m=model(),g=m.interactionKernel.beginPointerGesture({button:0,ctrlKey:false,space:false,node:m.nodes[0],start:{x:0,y:0},before:m.snapshot(),selection:m.selection,add:false,pointerId:1}),gb=stable(g),mb=stable(state(m));const result=m.interactionKernel.advancePointerGesture(g,{x:bad,y:10});assert(result===false,'advance did not reject');assert(stable(g)===gb,'gesture mutated on rejection');assert(stable(state(m))===mb,'model mutated on pointer rejection');return {gestureUnchanged:true,stateUnchanged:true}});
  }

  atomic('move.finite-overflow',()=>{const m=model();m.nodes[0].x=Number.MAX_VALUE;return m},m=>m.move(['a'],Number.MAX_VALUE,0));
  atomic('pan.finite-overflow',()=>{const m=model();m.camera.x=Number.MAX_VALUE;return m},m=>m.pan(Number.MAX_VALUE,0));
  atomic('marquee.invalid-existing-node',()=>{const m=model();m.nodes[1].x=Number.POSITIVE_INFINITY;return m},m=>m.marquee({x:0,y:0},{x:900,y:600}));
  atomic('world.invalid-camera',()=>{const m=model();m.camera.zoom=Number.POSITIVE_INFINITY;return m},m=>m.world(100,80));
  atomic('pan.invalid-camera',()=>{const m=model();m.camera.y=Number.NaN;return m},m=>m.pan(2,3));
  atomic('zoom.invalid-camera',()=>{const m=model();m.camera.x=Number.NEGATIVE_INFINITY;return m},m=>m.zoomAt(1.25,100,80));
  atomic('fit.invalid-camera',()=>{const m=model();m.camera.zoom=Number.NaN;return m},m=>m.fit(1000,700));
  atomic('snap.nonfinite-grid',()=>{const m=model();m.grid=Number.POSITIVE_INFINITY;return m},m=>m.snapSelection());
  atomic('restore.malformed-missing-camera',model,m=>m.restore({nodes:structuredClone(m.nodes),edges:structuredClone(m.edges)}));
  atomic('finalize.invalid-before',model,m=>m.interactionKernel.finalizeMoveGesture(invalidSnapshot(m,s=>{s.nodes[0].x=Number.NaN})));
  atomic('undo.invalid-history-frame',()=>{const m=model();m.history.push(invalidSnapshot(m,s=>{s.nodes[0].x=Number.NaN}));return m},m=>m.undo());
  atomic('redo.invalid-future-frame',()=>{const m=model();m.future.push(invalidSnapshot(m,s=>{s.camera.zoom=Number.POSITIVE_INFINITY}));return m},m=>m.redo());

  run('positive.move-snap-undo-redo',()=>{const m=model();m.checkpoint();assert(m.move(['a'],31,29)===true,'move failed');assert(m.snapSelection()===true,'snap failed');assert(m.nodes[0].x===40&&m.nodes[0].y===20,'snap geometry changed');assert(m.undo()===true,'undo failed');assert(m.nodes[0].x===0&&m.nodes[0].y===0,'undo geometry wrong');assert(m.redo()===true,'redo failed');assert(m.nodes[0].x===40&&m.nodes[0].y===20,'redo geometry wrong');return {node:m.nodes[0],history:m.history.length,future:m.future.length}});
  run('positive.camera-world-pan-zoom-fit',()=>{const m=model();const pan=m.pan(10,-5);assert(pan.x===34&&pan.y===31,'pan changed');const before=m.world(140,90);assert(before&&Number.isFinite(before.x)&&Number.isFinite(before.y),'world failed');const zoom=m.zoomAt(1.25,140,90);assert(zoom&&zoom.zoom===1.25,'zoom failed');const after=m.world(140,90);assert(before.x===after.x&&before.y===after.y,'cursor-stable zoom changed');assert(m.fit(1000,700)===true,'fit failed');assert(Object.values(m.camera).every(Number.isFinite),'fit camera non-finite');return {camera:m.camera,world:after}});
  run('positive.marquee',()=>{const m=model();const receipt=m.marquee({x:-1,y:-1},{x:150,y:70});assert(receipt&&receipt.ownerId==='SpatialSelectionNavigationKernel','marquee receipt missing');assert(receipt.selectedIds.join()==='a','marquee semantics changed');return {selectedIds:[...receipt.selectedIds],revision:receipt.revision}});
  run('positive.restore',()=>{const m=model(),snap=m.snapshot();m.move(['a'],20,20);const result=m.restore(snap);assert(result===undefined,'finite restore return contract changed');assert(m.nodes[0].x===0&&m.nodes[0].y===0,'finite restore failed');return {returnContract:'undefined',node:m.nodes[0]}});
  run('positive.pointer',()=>{const m=model(),before=m.snapshot();const g=m.interactionKernel.beginPointerGesture({button:2,ctrlKey:true,space:false,node:null,start:{x:10,y:10},before,selection:m.selection,add:false,pointerId:7});assert(g&&g.kind==='pending-pan','begin gesture changed');const step=m.interactionKernel.advancePointerGesture(g,{x:20,y:10});assert(step&&step.kind==='pan'&&step.dx===10&&step.dy===0&&step.becamePan===true,'advance gesture changed');return step});
  run('positive.recorded-mutation-refusal',()=>{const m=model();m.setActiveMode('recorded');const before=stable(state(m));assert(m.move(['a'],12,3)===false,'recorded move unexpectedly enabled');assert(stable(state(m))===before,'recorded rejection mutated state');return {activeMode:m.activeMode}});

  atomic('checkpoint-corrupt-prestate.align-stops-before-mutation-history',()=>{const m=model();m.select('b',true);m.camera.x=Number.NaN;return m},m=>m.align('x'));
  atomic('checkpoint-corrupt-prestate.distribute-stops-before-mutation-history',()=>{const m=model();m.select('b',true);m.select('c',true);m.camera.zoom=Number.POSITIVE_INFINITY;return m},m=>m.distribute('x'));

  const failed=cases.filter(item=>item.status==='FAIL');
  return {schemaVersion:1,kind:'PS02_SPATIAL_FINITE_INPUT_ATOMICITY_TESTS',summary:{total:cases.length,pass:cases.length-failed.length,fail:failed.length},coverage:{nonFinite:['NaN','+Infinity','-Infinity'],boundaries:['move','pan','zoomAt','fit','world','marquee','restore','beginPointerGesture','advancePointerGesture','snapSelection','finalizeMoveGesture','undo','redo'],atomicState:['nodes','camera','selection','selectionRevision','history','future','modelRevision','relations/edges','domain','provider'],positive:['move','snap','undo','redo','world','pan','zoomAt','fit','marquee','restore','pointer','recorded-mode-refusal']},cases};
}

const report=runPS02SpatialFiniteAtomicityTests();
console.log(JSON.stringify(report,null,2));
if(report.summary.fail)process.exitCode=1;
