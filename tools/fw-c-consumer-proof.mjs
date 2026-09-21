import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {SpatialModel} from '../dist/foundation/models.js';
import {SPATIAL_SELECTION_OWNER_ID,SPATIAL_SELECTION_CONTRACT} from '../dist/foundation/spatial.js';
import {RelationDomainAdapter} from '../dist/foundation/relations.js';
import {createEnterpriseAdapter} from '../dist/adapters/w03-enterprise.js';
import {W03V34RunsAdapter} from '../dist/adapters/w03-runs.js';

const root=new URL('../',import.meta.url);
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const assert=(value,message)=>{if(!value)throw Error(message)};
const visualNodes=Array.from({length:36},(_,i)=>({id:`concept-${i+1}`,label:['Identity','Trust','Network','Evidence','Protocol','Control'][i%6]+' '+(i+1),x:(i%6)*175,y:Math.floor(i/6)*112}));
const visualEdges=Array.from({length:30},(_,i)=>({id:`edge-${i+1}`,source:`concept-${i+1}`,target:`concept-${i+7}`,type:'relates',direction:'directed'}));
const visualDomain=new RelationDomainAdapter({owner:'VisualizeDomain.LocalGraph',nodes:visualNodes,relations:visualEdges});
const visualBefore=hash(visualDomain.records),visualModel=new SpatialModel(visualNodes,visualDomain.project());
visualModel.setActiveMode('author');visualModel.select('concept-1');const visualNavigation=visualModel.selectionKernel.focusNeighbor('ArrowRight',{source:'fw-c-proof'});const visualReceipt=visualModel.selectionReceipt('fw-c-visualize');
const visualAfter=hash(visualDomain.records);

const enterprise=createEnterpriseAdapter(),enterpriseBefore=hash(enterprise.records),enterpriseModel=new SpatialModel(enterprise.nodes,enterprise.project());
enterpriseModel.setActiveMode('author');enterpriseModel.select(enterprise.nodes[0].id);const enterpriseNavigation=enterpriseModel.selectionKernel.focusNeighbor('ArrowRight',{source:'fw-c-proof'});enterpriseModel.move([...enterpriseModel.selection],7,0);const enterpriseReceipt=enterpriseModel.selectionReceipt('fw-c-enterprise'),enterpriseAfter=hash(enterprise.records);

const runs=new W03V34RunsAdapter(),runtimeBefore=hash({devices:runs.devices,sessions:runs.sessions,events:runs.events,run:runs.run}),runsNodes=runs.devices.map((d,i)=>({id:d.id,label:d.name,x:80+i*210,y:120+(i%2)*130,status:d.up===null?'NOTE':d.up?'UP':'DOWN'})),runsModel=new SpatialModel(runsNodes,[{id:'edge-1',source:'DEV-WEB-01',target:'DEV-DB-01',type:'RECORDED_PATH',direction:'directed'},{id:'edge-2',source:'DEV-DB-01',target:'DEV-SIEM-01',type:'RECORDED_TELEMETRY',direction:'directed'}]);
runsModel.setActiveMode('live');runsModel.select(runsNodes[0].id);const runsNavigation=runsModel.selectionKernel.focusNext({source:'fw-c-proof'});runsModel.move([...runsModel.selection],9,0);const runsReceipt=runsModel.selectionReceipt('fw-c-runs'),runtimeAfter=hash({devices:runs.devices,sessions:runs.sessions,events:runs.events,run:runs.run});
const recorded=runs.recorded();runsModel.setActiveMode('recorded');const recordedNavigation=runsModel.selectionKernel.focusNext({source:'fw-c-recorded-navigation'}),recordedReceipt=runsModel.selectionReceipt('fw-c-runs-recorded'),recordedBefore=JSON.stringify({nodes:runsModel.nodes,history:runsModel.history,future:runsModel.future}),recordedAlign=runsModel.geometryMutationAvailability({minimumSelection:1,action:'spatial.align'}),recordedMove=runsModel.move([...runsModel.selection],11,0),recordedAfter=JSON.stringify({nodes:runsModel.nodes,history:runsModel.history,future:runsModel.future}),readOnlyRelations=new RelationDomainAdapter({owner:'W03RunDomain.RecordedTopology',nodes:runsNodes,relations:[],readOnly:true}),readOnlyDecision=readOnlyRelations.connectionAvailability([runsNodes[0].id,runsNodes[1].id]);

const receipts=[visualReceipt,enterpriseReceipt,runsReceipt];
assert(receipts.every(receipt=>receipt.ownerId===SPATIAL_SELECTION_OWNER_ID),'THREE_CONSUMER_OWNER_MISMATCH');
assert(receipts.every(receipt=>receipt.schema===SPATIAL_SELECTION_CONTRACT.receiptSchema),'THREE_CONSUMER_SCHEMA_MISMATCH');
assert(visualBefore===visualAfter,'VISUALIZE_RELATION_STATE_MUTATED');
assert(enterpriseBefore===enterpriseAfter,'ENTERPRISE_RELATION_STATE_MUTATED');
assert(runtimeBefore===runtimeAfter,'RUNS_RUNTIME_STATE_MUTATED');
assert(recorded.readOnly===true&&readOnlyDecision.code==='READ_ONLY'&&!readOnlyDecision.enabled&&!recordedAlign.enabled&&recordedAlign.code==='MODE_FORBIDS_ACTION'&&recordedMove===false&&recordedBefore===recordedAfter&&recordedReceipt.activeMode==='recorded'&&recordedNavigation.activeMode==='recorded','RUNS_RECORDED_MUTATION_NOT_REFUSED');

const proof={status:'PASS',mission:'FW-C-SPATIAL-SELECTION-NAVIGATION',ownerId:SPATIAL_SELECTION_OWNER_ID,receiptSchema:SPATIAL_SELECTION_CONTRACT.receiptSchema,consumers:{visualize:{projection:'bounded representation fixture used by main.ts',receipt:visualReceipt,navigation:visualNavigation,relationState:{before:visualBefore,after:visualAfter,unchanged:visualBefore===visualAfter}},enterprise:{projectionOwner:enterprise.owner,receipt:enterpriseReceipt,navigation:enterpriseNavigation,relationState:{before:enterpriseBefore,after:enterpriseAfter,unchanged:enterpriseBefore===enterpriseAfter}},runs:{projection:'W03V34RunsAdapter runtime topology mapping used by main.ts',receipt:runsReceipt,navigation:runsNavigation,runtimeState:{before:runtimeBefore,after:runtimeAfter,unchanged:runtimeBefore===runtimeAfter},recorded:{readOnly:recorded.readOnly,receipt:recordedReceipt,navigation:recordedNavigation,relationMutationAvailability:readOnlyDecision,geometryMutationAvailability:recordedAlign,directMoveRejected:recordedMove===false,geometryStateUnchanged:recordedBefore===recordedAfter}}},invariants:{canonicalIdStateOnly:receipts.every(r=>r.selectedIds.every(id=>typeof id==='string')&&[r.focusId,r.anchorId].every(id=>id===null||typeof id==='string')),sameOwnerAndSchema:true,selectionDoesNotMutateRelationsOrRuntime:true,recordedInspectNavigationWithMutationRefusal:true}};
await writeFile(new URL('assurance/FW_C_THREE_CONSUMER_PROOF.json',root),JSON.stringify(proof,null,2)+'\n');
console.log(JSON.stringify(proof,null,2));
