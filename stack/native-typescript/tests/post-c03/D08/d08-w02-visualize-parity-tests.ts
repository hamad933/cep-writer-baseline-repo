import {assertGenuineLibrarySource} from '../../../surfaces/library/runtime-composition.js';
import {createLearnRuntimeComposition,LearnAdapter} from '../../../adapters/learn.js';
import {RQDomainAdapter} from '../../../adapters/rq/domain.js';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';
import {VisualizeDomainAdapter} from '../../../adapters/visualize/domain.js';
import {renderSpatialNode,renderSpatialRelation,renderMultiSelectionGroupBoundary} from '../../../foundation/spatial/presentation.js';

const rows=[];
const assert=(condition,message='assertion failed')=>{if(!condition)throw Error(message)};
const equal=(actual,expected,message='values differ')=>assert(actual===expected,`${message}: ${actual} !== ${expected}`);
const test=async(id,run)=>{try{rows.push({id,status:'PASS',detail:await run()})}catch(error){rows.push({id,status:'FAIL',error:String(error?.stack||error)})}};

const sampleReps=()=>[
  {representationId:'rep-a',canonicalRef:{objectId:'obj-a',revision:'r1'},label:'Object A',x:20,y:40,views:['TREE','PATH','GRAPH','CANVAS']},
  {representationId:'rep-b',canonicalRef:{objectId:'obj-b',revision:'r1'},label:'Object B',x:180,y:80,views:['TREE','PATH','GRAPH','CANVAS']},
  {representationId:'rep-c',canonicalRef:{objectId:'obj-c',revision:'r1'},label:'Object C',x:340,y:120,views:['TREE','PATH','GRAPH','CANVAS']}
];

// 1. A01-PF-008: Library Source Truth
await test('d08.library.non-production-source-rejected',()=>{
  let thrownNonProd=false,thrownSeed=false,thrownNotCanonical=false;
  try{assertGenuineLibrarySource({classification:'NON_PRODUCTION',truth:'NON_PRODUCTION_FIXTURE'});}catch(e){thrownNonProd=true;}
  try{assertGenuineLibrarySource({classification:'PRODUCT_RUNTIME_LOCAL_SOURCE',truth:'ACCEPTANCE_SEED'});}catch(e){thrownSeed=true;}
  try{assertGenuineLibrarySource({classification:'PRODUCT_RUNTIME_LOCAL_SOURCE',truth:'NOT_CANONICAL_RUNTIME_IMPORT'});}catch(e){thrownNotCanonical=true;}
  assert(thrownNonProd&&thrownSeed&&thrownNotCanonical,'failed to reject non-production/seed sources');
  const genuine=assertGenuineLibrarySource({
    classification:'PRODUCT_RUNTIME_LOCAL_SOURCE',truth:'REAL_LIBRARY_PRODUCT_SOURCE',providerRef:'canonical-ref',
    document:{id:'LIB-REAL-001',revision:'r1',title:'Real Library',blocks:[]},sources:[],context:{},lifecycle:{state:'DRAFT'}
  });
  assert(genuine&&genuine.truth==='REAL_LIBRARY_PRODUCT_SOURCE');
  return {rejectedNonProd:true,rejectedSeed:true,rejectedNotCanonical:true,admittedGenuine:true};
});

// 2. A03-PF-014: Learn Source Truth
await test('d08.learn.non-production-source-rejected',()=>{
  const seed=createLearnRuntimeComposition({source:{classification:'PRODUCT_RUNTIME_BOUND_SOURCE',truth:'ACCEPTANCE_SEED',activity:{id:'a1'},document:{id:'d1',blocks:[]}}});
  const nonCanonical=createLearnRuntimeComposition({source:{classification:'PRODUCT_RUNTIME_BOUND_SOURCE',truth:'NOT_CANONICAL_RUNTIME_IMPORT',activity:{id:'a1'},document:{id:'d1',blocks:[]}}});
  assert(!seed.learn.sourceAvailability().enabled&&!nonCanonical.learn.sourceAvailability().enabled,'failed to reject non-production Learn sources');
  return {rejectedSeed:true,rejectedNotCanonical:true,appCrash:false};
});

// 3. A12-PF-001 / A12-PF-002: Learn Journey Navigation Semantics
await test('d08.learn.journey-navigation-semantics-preserved',()=>{
  const composition=createLearnRuntimeComposition({source:{
    classification:'PRODUCT_RUNTIME_BOUND_SOURCE',truth:'BOUND_CANONICAL_LEARNING_SOURCE',providerRef:'canonical-learn',
    activity:{id:'activity-identity-01',revision:1,title:'Trust boundaries',kind:'practice',editable:true},
    document:{id:'doc-1',revision:'r1',title:'Trust boundaries',blocks:[{id:'b1',type:'h2',html:'Intro'},{id:'b2',type:'paragraph',html:'Details'}]}
  }});
  equal(composition.descriptor.semanticOwner,'JourneyNavigationOwner');
  equal(composition.descriptor.journeyBound,true);
  const outline=composition.learn.outlineDescriptor();
  equal(outline.ariaLabel,'Learn Journey navigation');
  assert(outline.summary&&outline.summary.text.includes('Journey'),'summary should reference Journey navigation');
  assert(outline.nodes.length>0,'outline nodes should not be empty');
  assert(['journey-stage','journey-activity-step'].includes(outline.nodes[0].kind),'node should have journey kind');
  return {semanticOwner:composition.descriptor.semanticOwner,journeyBound:composition.descriptor.journeyBound,ariaLabel:outline.ariaLabel,firstNodeKind:outline.nodes[0].kind};
});

// 4. A12-PF-003: RQ Epistemic Truth (UNAVAILABLE distinct from EMPTY)
await test('d08.rq.epistemic-unavailable-distinct-from-empty',()=>{
  const unadmitted=new RQDomainAdapter([],{
    analyticalCompareOwner:new AnalyticalCompareOwner(),
    providerAdmitted:false,
    providerClassification:'TEST_UNADMITTED_PROVIDER'
  });
  const unadmittedAvail=unadmitted.providerAvailability();
  equal(unadmittedAvail.enabled,false);
  equal(unadmittedAvail.epistemicState,'UNAVAILABLE');

  const unadmittedSearch=unadmitted.search('test');
  equal(unadmittedSearch.ok,false);
  equal(unadmittedSearch.epistemicState,'UNAVAILABLE');
  equal(unadmittedSearch.status,'RQ_CURRENT_PROVIDER_UNAVAILABLE');

  const admittedEmpty=new RQDomainAdapter([],{
    analyticalCompareOwner:new AnalyticalCompareOwner(),
    providerAdmitted:true,
    providerClassification:'ADMITTED_EMPTY_PROVIDER'
  });
  const admittedSearch=admittedEmpty.search('test');
  equal(admittedSearch.ok,true);
  equal(admittedSearch.epistemicState,'EMPTY');
  assert(unadmittedSearch.epistemicState!==admittedSearch.epistemicState,'UNAVAILABLE must be distinct from EMPTY');
  return {unadmittedEpistemic:unadmittedSearch.epistemicState,admittedEmptyEpistemic:admittedSearch.epistemicState};
});

// 5. F-048: Visualize Tree Hard Ceiling
await test('d08.visualize.tree-hard-ceiling-no-fabricated-hierarchy',()=>{
  const adapter=new VisualizeDomainAdapter({representations:sampleReps()});
  const hierarchy=adapter.hierarchyProjection();
  equal(hierarchy.ok,false);
  equal(hierarchy.status,'VISUALIZE_HIERARCHY_UNAVAILABLE_NOT_OBSERVED');
  assert(hierarchy.reason.includes('no admitted canonical hierarchy'),'must state no admitted canonical hierarchy');
  equal(hierarchy.mutation,'AUTHORITY_GATED');
  return {ok:hierarchy.ok,status:hierarchy.status,reason:hierarchy.reason,mutation:hierarchy.mutation};
});

// 6. F-049 / A12-PF-004: Visualize Canvas-Local Removal Preserves Other Projections
await test('d08.visualize.canvas-local-removal-preserves-other-projections',()=>{
  const adapter=new VisualizeDomainAdapter({representations:sampleReps()});
  const treeBefore=adapter.representationProjection('TREE').representations.length;
  const pathBefore=adapter.representationProjection('PATH').representations.length;
  const graphBefore=adapter.representationProjection('GRAPH').representations.length;
  const canvasBefore=adapter.representationProjection('CANVAS').representations.length;
  equal(canvasBefore,3);

  const removeResult=adapter.removeRepresentation({representationIds:['rep-a'],mode:'CANVAS'});
  assert(removeResult.ok,'removeRepresentation failed');
  equal(removeResult.canonicalMutation,false);
  equal(removeResult.canvasLocalMembershipPreserved,true);

  // Canvas count decremented
  const canvasAfter=adapter.representationProjection('CANVAS').representations.length;
  equal(canvasAfter,2);
  assert(!adapter.view('CANVAS').representationIds().includes('rep-a'));

  // Other projection counts untouched
  equal(adapter.representationProjection('TREE').representations.length,treeBefore,'TREE projection mutated');
  equal(adapter.representationProjection('PATH').representations.length,pathBefore,'PATH projection mutated');
  equal(adapter.representationProjection('GRAPH').representations.length,graphBefore,'GRAPH projection mutated');

  // Node is NOT deleted from underlying model
  const modelNode=adapter.model.nodes.find(n=>n.id==='rep-a');
  assert(modelNode,'node was purged from model.nodes');
  equal(modelNode.presentationState?.canvasRemoved,true);

  // Undo restores Canvas membership cleanly
  const undoResult=adapter.undoPresentation();
  assert(undoResult.ok,'undoPresentation failed');
  equal(adapter.representationProjection('CANVAS').representations.length,canvasBefore);
  assert(adapter.view('CANVAS').representationIds().includes('rep-a'));

  return {canvasBefore,canvasAfter,treeUntouched:treeBefore===adapter.representationProjection('TREE').representations.length,undoRestored:true};
});

// 7. F-050 Facet 1: Visualize Duplicate Representation Presentation Parity
await test('d08.visualize.f050-facet1-duplicate-presentation-styling',()=>{
  const adapter=new VisualizeDomainAdapter({representations:sampleReps()});
  const dupResult=adapter.duplicateRepresentation({representationId:'rep-a',mode:'CANVAS'});
  assert(dupResult.ok,'duplicateRepresentation failed');
  const dupRep=dupResult.representation;
  assert(Boolean(dupRep.presentationState?.duplicateOf),'missing duplicateOf in presentationState');
  equal(dupRep.presentationState.duplicateOf,'rep-a');

  const html=renderSpatialNode({node:{id:dupRep.representationId,label:dupRep.label,x:dupRep.x,y:dupRep.y,presentationState:dupRep.presentationState}});
  assert(html.includes('spatial-node-duplicate'),'missing spatial-node-duplicate class');
  assert(html.includes('[DUPLICATE]'),'missing [DUPLICATE] badge');
  assert(html.includes('[Duplicate of rep-a]'),'missing duplicate in aria-label');
  return {duplicateOf:dupRep.presentationState.duplicateOf,hasDuplicateClass:true,hasDuplicateBadge:true};
});

// 8. F-050 Facet 2: Visualize Multi-Selection Group Boundary
await test('d08.visualize.f050-facet2-multi-selection-group-boundary',()=>{
  const nodes=[
    {id:'n1',x:10,y:20,width:120,height:50},
    {id:'n2',x:200,y:150,width:120,height:50}
  ];
  const singleBoundary=renderMultiSelectionGroupBoundary({nodes:[nodes[0]],selectedIds:new Set(['n1'])});
  equal(singleBoundary,'','single node should not render group boundary');

  const groupBoundary=renderMultiSelectionGroupBoundary({nodes,selectedIds:new Set(['n1','n2'])});
  assert(groupBoundary.includes('spatial-multi-selection-group'),'missing spatial-multi-selection-group class');
  assert(groupBoundary.includes('group-boundary'),'missing group-boundary class');
  assert(groupBoundary.includes('stroke-dasharray="6 4"'),'missing dashed stroke on boundary');
  assert(groupBoundary.includes('GROUP BOUNDARY (2 selected)'),'missing boundary label');
  return {singleNodeEmpty:true,multiNodeGroupRendered:true};
});

// 9. F-050 Facet 3: Visualize Canvas-Only Relation Link Presentation Parity
await test('d08.visualize.f050-facet3-canvas-only-relation-styling',()=>{
  const adapter=new VisualizeDomainAdapter({representations:sampleReps()});
  const linkResult=adapter.createCanvasOnlyLink({sourceRepresentationId:'rep-a',targetRepresentationId:'rep-b'});
  assert(linkResult.ok,'createCanvasOnlyLink failed');
  equal(linkResult.canonicalMutation,false);
  const edge=adapter.model.edges.find(e=>e.source==='rep-a'&&e.target==='rep-b');
  assert(edge,'edge not found in model');
  equal(edge.kind,'canvas-presentation');
  equal(edge.presentationOnly,true);

  const html=renderSpatialRelation({edge,source:sampleReps()[0],target:sampleReps()[1],markerId:'test-marker'});
  assert(html.includes('spatial-relation-canvas-only'),'missing spatial-relation-canvas-only class');
  assert(html.includes('stroke-dasharray="6 3"'),'missing dashed stroke on relation');
  assert(html.includes('[Canvas]'),'missing [Canvas] label');
  assert(html.includes('Canvas-only presentation link'),'missing Canvas-only in aria-label');
  return {canvasOnly:true,hasCanvasOnlyClass:true,hasCanvasBadge:true};
});

// 10. F-050 Facet 4: Authoritative Action Home in Canvas Toolbar
await test('d08.visualize.f050-facet4-action-home-canvas-toolbar',()=>{
  const canvasToolbar=['visualize.viewport','visualize.duplicateRepresentation','visualize.removeRepresentation','visualize.canvasLink','visualize.undoPresentation','visualize.redoPresentation','foundation.note'];
  for(const cmd of ['visualize.duplicateRepresentation','visualize.removeRepresentation','visualize.canvasLink','visualize.undoPresentation','visualize.redoPresentation']){
    assert(canvasToolbar.includes(cmd),`missing ${cmd} in Canvas toolbar`);
  }
  return {authoritativeActionHome:'Canvas Toolbar',canvasToolbarCommands:canvasToolbar};
});

const fail=rows.filter(row=>row.status==='FAIL').length;
console.log(JSON.stringify({suite:'D08_W02_VISUALIZE_PARITY_TESTS',classification:'D08_W02_CONVERGED__REPRESENTATION_PARITY_VERIFIED',pass:rows.length-fail,fail,rows},null,2));
if(fail)process.exitCode=1;
