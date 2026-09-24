import test from 'node:test';
import assert from 'node:assert/strict';
import {CollectionTableMatrixPresentationCore,COLLECTION_TABLE_MATRIX_CONTRACT} from '../../../foundation/collection/table-matrix.js';

test('collection mechanics remain domain-neutral while preserving selection/filter/sort',()=>{
  const rows=[
    {key:'r1',name:'Alpha',score:2,opaque:{domain:'one'}},
    {key:'r2',name:'Beta',score:1,opaque:{domain:'two'}},
    {key:'r3',name:'Gamma',score:3,opaque:{domain:'three'}}
  ];
  const core=new CollectionTableMatrixPresentationCore({
    adapterId:'s06.arbitrary-domain',rows:()=>rows,rowId:r=>r.key,rowLabel:r=>r.name,searchableText:r=>`${r.name} ${r.opaque.domain}`,
    columns:[{id:'name',label:'Name',cell:r=>r.name,compareRows:(a,b)=>a.name.localeCompare(b.name)},{id:'score',label:'Score',cell:r=>String(r.score),compareRows:(a,b)=>a.score-b.score}],
    actions:r=>[{id:`inspect:${r.key}`,label:'Inspect'}]
  });
  assert.equal(COLLECTION_TABLE_MATRIX_CONTRACT.dataBoundary,'DOMAIN_ADAPTER_SUPPLIES_ROWS_CELLS_ACTIONS');
  assert.ok(COLLECTION_TABLE_MATRIX_CONTRACT.forbidden.includes('domain-row-store'));
  assert.deepEqual(core.setSort('score','asc').visibleRowIds,['r2','r1','r3']);
  assert.deepEqual(core.setFilter('two').visibleRowIds,['r2']);
  core.clearFilter();core.selectOnly('r1');core.selectRange('r3');
  assert.deepEqual(core.snapshot().selectedRowIds,['r1','r3']);
  assert.deepEqual(core.rowActions('r2').map(a=>a.id),['inspect:r2']);
});

test('collection rejects duplicate row identities instead of inventing domain truth',()=>{
  const core=new CollectionTableMatrixPresentationCore({adapterId:'dup',rows:()=>[{id:'x'},{id:'x'}],rowId:r=>r.id,rowLabel:r=>r.id,searchableText:r=>r.id,columns:[{id:'id',label:'ID',cell:r=>r.id}]});
  assert.throws(()=>core.snapshot(),/COLLECTION_ROW_IDS_INVALID/);
});
