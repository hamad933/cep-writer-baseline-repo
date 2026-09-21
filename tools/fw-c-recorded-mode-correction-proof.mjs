import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {CommandRegistry,SpatialModel} from '../dist/foundation/models.js';
import {RelationDomainAdapter} from '../dist/foundation/relations.js';
import {W03V34RunsAdapter} from '../dist/adapters/w03-runs.js';

const root=new URL('../',import.meta.url);
const hash=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const assert=(value,message)=>{if(!value)throw Error(message)};
const registerGeometry=(registry,model)=>{
  registry.register('spatial.align','SpatialInteraction','Align',()=>model.align('y'),()=>model.geometryMutationAvailability({minimumSelection:2,action:'spatial.align'}));
  registry.register('spatial.distribute','SpatialInteraction','Distribute',()=>model.distribute('x'),()=>model.geometryMutationAvailability({minimumSelection:3,action:'spatial.distribute'}));
  registry.register('spatial.undo','SpatialInteraction','Undo',()=>model.undo(),()=>model.geometryMutationAvailability({action:'spatial.undo'}));
  registry.register('spatial.redo','SpatialInteraction','Redo',()=>model.redo(),()=>model.geometryMutationAvailability({action:'spatial.redo'}));
};
const state=model=>JSON.stringify({nodes:model.nodes,edges:model.edges,history:model.history,future:model.future});
const runs=new W03V34RunsAdapter(),recorded=runs.recorded(),nodes=recorded.devices.map((d,i)=>({id:d.id,label:d.name,x:80+i*210,y:120+(i%2)*130,status:d.up===null?'NOTE':d.up?'UP':'DOWN'}));
const relationAdapter=new RelationDomainAdapter({owner:'W03RunDomain.RecordedTopology',nodes,relations:[{id:'edge-1',source:'DEV-WEB-01',target:'DEV-DB-01',type:'RECORDED_PATH',direction:'directed'}],readOnly:true});
const runtimeBefore=hash({devices:runs.devices,sessions:runs.sessions,events:runs.events,run:runs.run}),relationsBefore=hash(relationAdapter.records),model=new SpatialModel(nodes,relationAdapter.project());
model.selection=new Set(model.nodes.map(node=>node.id));model.setActiveMode('recorded');
const selectionBefore=model.selectionReceipt('recorded-selection-before'),accessibleNavigation=model.selectionKernel.focusNext({source:'accessible-recorded-proof'}),before=state(model),registry=new CommandRegistry();registerGeometry(registry,model);
const commandAttempts={};
for(const id of ['spatial.align','spatial.distribute','spatial.undo','spatial.redo'])commandAttempts[id]={availability:registry.availability(id),execution:registry.execute(id)};
const afterRegistry=state(model),directAttempts={move:model.move([model.nodes[0].id],17,9),snap:model.snapSelection(),align:model.align('y'),distribute:model.distribute('x'),undo:model.undo(),redo:model.redo()},afterDirect=state(model),selectionAfter=model.selectionReceipt('recorded-selection-after'),runtimeAfter=hash({devices:runs.devices,sessions:runs.sessions,events:runs.events,run:runs.run}),relationsAfter=hash(relationAdapter.records);
assert(selectionBefore.activeMode==='recorded'&&selectionAfter.activeMode==='recorded'&&accessibleNavigation.activeMode==='recorded','RECORDED_RECEIPT_MODE_FALSE');
assert(selectionAfter.selectionCount===model.nodes.length&&accessibleNavigation.targetId,'RECORDED_SELECTION_OR_NAVIGATION_UNAVAILABLE');
assert(Object.values(commandAttempts).every(row=>row.availability.enabled===false&&row.availability.code==='MODE_FORBIDS_ACTION'&&row.execution.ok===false&&row.execution.code==='MODE_FORBIDS_ACTION'),'RECORDED_COMMAND_GUARD_FAILED');
assert(registry.receipts.length===0&&before===afterRegistry&&before===afterDirect,'RECORDED_GEOMETRY_OR_HISTORY_MUTATED');
assert(Object.values(directAttempts).every(value=>value===false),'DIRECT_MODEL_MUTATION_BYPASS');
assert(runtimeBefore===runtimeAfter&&relationsBefore===relationsAfter,'RECORDED_RUNTIME_OR_RELATION_STATE_MUTATED');
const mutable={};
for(const mode of ['author','live']){const m=new SpatialModel(nodes),r=new CommandRegistry();m.selection=new Set(m.nodes.map(node=>node.id));m.setActiveMode(mode);registerGeometry(r,m);const beforeMutable=state(m),alignAvailability=r.availability('spatial.align'),distributeAvailability=r.availability('spatial.distribute');r.execute('spatial.align');r.execute('spatial.distribute');mutable[mode]={receipt:m.selectionReceipt(`${mode}-mutation-proof`),alignAvailability,distributeAvailability,changed:beforeMutable!==state(m),registryReceipts:r.receipts.length};assert(alignAvailability.enabled&&distributeAvailability.enabled&&mutable[mode].changed&&mutable[mode].receipt.activeMode===mode&&r.receipts.length===2,`MUTABLE_MODE_REGRESSION:${mode}`)}
const proof={status:'PASS',mission:'FW-C-SPATIAL-SELECTION-NAVIGATION',correction:'RUNS_RECORDED_SPATIAL_MUTATION_GUARD_AND_TRUTHFUL_MODE',recorded:{selectionBefore,accessibleNavigation,selectionAfter,commandAttempts,directAttempts,geometryState:{before:hash(before),afterRegistry:hash(afterRegistry),afterDirect:hash(afterDirect),unchanged:before===afterRegistry&&before===afterDirect},registryReceiptCount:registry.receipts.length,relationState:{before:relationsBefore,after:relationsAfter,unchanged:relationsBefore===relationsAfter},runtimeState:{before:runtimeBefore,after:runtimeAfter,unchanged:runtimeBefore===runtimeAfter},recordedProjectionReadOnly:recorded.readOnly},mutableModes:mutable,invariants:{availabilityBlocksRecordedGeometryMutation:true,directRegistryExecutionCannotBypass:true,directModelMutationCannotBypass:true,selectionInspectionNavigationRemainAvailable:true,activeModeReceiptTruthful:true,runtimeAndRelationTruthPreserved:true,authorAndLiveMutationPreserved:true}};
await writeFile(new URL('assurance/FW_C_RECORDED_MODE_CORRECTION_PROOF.json',root),JSON.stringify(proof,null,2)+'\n');
console.log(JSON.stringify(proof,null,2));
