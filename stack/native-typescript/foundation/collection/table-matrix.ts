export const COLLECTION_TABLE_MATRIX_OWNER_ID='CollectionTableMatrixPresentationCore' as const;
export const COLLECTION_TABLE_MATRIX_CONTRACT={
  owner:COLLECTION_TABLE_MATRIX_OWNER_ID,
  version:'1.0.0',
  classification:'CONCEPT_CONTRACT_ONLY',
  dataBoundary:'DOMAIN_ADAPTER_SUPPLIES_ROWS_CELLS_ACTIONS',
  ownedState:['filterQuery','selectedRowIds','selectionAnchorId','focusedRowId','sort'],
  forbidden:['universal-domain-row-schema','domain-row-store','persistence','provider-fabrication','central-registry-wiring']
} as const;

export type CollectionDirection='auto'|'ltr'|'rtl';
export type CollectionAlign='start'|'center'|'end';
export type CollectionTone='default'|'muted'|'success'|'warning'|'danger'|'accent';

export type CollectionCellProjection={
  text:string;
  secondary?:string;
  ariaLabel?:string;
  direction?:CollectionDirection;
  tone?:CollectionTone;
};

export type CollectionRowAction={
  id:string;
  label:string;
  enabled?:boolean;
  destructive?:boolean;
  ariaLabel?:string;
};

export type CollectionColumnDescriptor<TRow>={
  id:string;
  label:string;
  width?:string;
  minWidth?:number;
  align?:CollectionAlign;
  cell:(row:TRow)=>string|CollectionCellProjection;
  compareRows?:(left:TRow,right:TRow)=>number;
};

export type CollectionTableMatrixDomainAdapter<TRow>={
  adapterId:string;
  rows:()=>readonly TRow[];
  rowId:(row:TRow)=>string;
  rowLabel:(row:TRow)=>string;
  searchableText:(row:TRow)=>string;
  columns:readonly CollectionColumnDescriptor<TRow>[];
  actions?:(row:TRow)=>readonly CollectionRowAction[];
};

export type CollectionSortState={columnId:string;direction:'asc'|'desc'}|null;
export type CollectionTableMatrixSnapshot<TRow>={
  adapterId:string;
  totalRows:number;
  visibleRows:readonly TRow[];
  visibleRowIds:readonly string[];
  filterQuery:string;
  selectedRowIds:readonly string[];
  focusedRowId:string|null;
  selectionAnchorId:string|null;
  sort:CollectionSortState;
};

const normalize=(value:string)=>value.normalize('NFKC').toLocaleLowerCase().trim().replace(/\s+/g,' ');
const unique=(values:readonly string[])=>[...new Set(values.filter(Boolean))];
const cellProjection=(value:string|CollectionCellProjection):CollectionCellProjection=>typeof value==='string'?{text:value}:value;

export class CollectionTableMatrixPresentationCore<TRow>{
  readonly adapter:CollectionTableMatrixDomainAdapter<TRow>;
  private filterQuery='';
  private selected=new Set<string>();
  private selectionAnchorId:string|null=null;
  private focusedRowId:string|null=null;
  private sort:CollectionSortState=null;

  constructor(adapter:CollectionTableMatrixDomainAdapter<TRow>){
    if(!adapter?.adapterId)throw Error('COLLECTION_ADAPTER_ID_REQUIRED');
    if(typeof adapter.rows!=='function'||typeof adapter.rowId!=='function'||typeof adapter.rowLabel!=='function'||typeof adapter.searchableText!=='function')throw Error('COLLECTION_ADAPTER_BOUNDARY_INVALID');
    if(!Array.isArray(adapter.columns)||adapter.columns.length===0)throw Error('COLLECTION_COLUMNS_REQUIRED');
    const ids=adapter.columns.map(column=>column.id);
    if(ids.some(id=>!id)||new Set(ids).size!==ids.length)throw Error('COLLECTION_COLUMN_IDS_INVALID');
    this.adapter=adapter;
  }

  setFilter(query:string){this.filterQuery=String(query??'');this.reconcile();return this.snapshot();}
  clearFilter(){return this.setFilter('');}

  setSort(columnId:string|null,direction:'asc'|'desc'='asc'){
    if(columnId===null){this.sort=null;return this.snapshot();}
    const column=this.adapter.columns.find(item=>item.id===columnId);
    if(!column)throw Error(`COLLECTION_SORT_COLUMN_UNKNOWN:${columnId}`);
    if(typeof column.compareRows!=='function')throw Error(`COLLECTION_SORT_COMPARATOR_REQUIRED:${columnId}`);
    this.sort={columnId,direction};return this.snapshot();
  }
  toggleSort(columnId:string){
    const current=this.sort;
    if(current?.columnId!==columnId)return this.setSort(columnId,'asc');
    if(current.direction==='asc')return this.setSort(columnId,'desc');
    this.sort=null;return this.snapshot();
  }

  clearSelection(){this.selected.clear();this.selectionAnchorId=null;return this.snapshot();}
  selectOnly(rowId:string){this.assertCurrentRow(rowId);this.selected=new Set([rowId]);this.selectionAnchorId=rowId;this.focusedRowId=rowId;return this.snapshot();}
  toggleSelection(rowId:string){
    this.assertCurrentRow(rowId);
    if(this.selected.has(rowId))this.selected.delete(rowId);else this.selected.add(rowId);
    this.selectionAnchorId=rowId;this.focusedRowId=rowId;return this.snapshot();
  }
  selectRange(rowId:string,{additive=false}:{additive?:boolean}={}){
    this.assertCurrentRow(rowId);
    const visible=this.visibleRows(),ids=visible.map(row=>this.adapter.rowId(row));
    const anchor=this.selectionAnchorId&&ids.includes(this.selectionAnchorId)?this.selectionAnchorId:(this.focusedRowId&&ids.includes(this.focusedRowId)?this.focusedRowId:rowId);
    const a=ids.indexOf(anchor),b=ids.indexOf(rowId),range=ids.slice(Math.min(a,b),Math.max(a,b)+1);
    if(!additive)this.selected.clear();
    range.forEach(id=>this.selected.add(id));
    this.selectionAnchorId=anchor;this.focusedRowId=rowId;return this.snapshot();
  }
  selectAllVisible(){this.visibleRows().forEach(row=>this.selected.add(this.adapter.rowId(row)));return this.snapshot();}

  focusRow(rowId:string|null){if(rowId!==null)this.assertCurrentRow(rowId);this.focusedRowId=rowId;return this.snapshot();}
  moveFocus(delta:number){
    const ids=this.visibleRows().map(row=>this.adapter.rowId(row));if(ids.length===0){this.focusedRowId=null;return this.snapshot();}
    let index=this.focusedRowId?ids.indexOf(this.focusedRowId):-1;
    if(index<0)index=delta<0?ids.length: -1;
    index=Math.max(0,Math.min(ids.length-1,index+delta));this.focusedRowId=ids[index];return this.snapshot();
  }
  focusBoundary(which:'first'|'last'){
    const ids=this.visibleRows().map(row=>this.adapter.rowId(row));this.focusedRowId=ids.length?(which==='first'?ids[0]:ids.at(-1)!):null;return this.snapshot();
  }

  rowById(rowId:string){return this.currentRows().find(row=>this.adapter.rowId(row)===rowId)??null;}
  rowActions(rowId:string){const row=this.rowById(rowId);return row&&this.adapter.actions?[...this.adapter.actions(row)]:[];}
  cell(row:TRow,columnId:string){const column=this.adapter.columns.find(item=>item.id===columnId);if(!column)throw Error(`COLLECTION_COLUMN_UNKNOWN:${columnId}`);return cellProjection(column.cell(row));}

  snapshot():CollectionTableMatrixSnapshot<TRow>{
    this.reconcile();const rows=this.visibleRows(),visibleRowIds=rows.map(row=>this.adapter.rowId(row));
    return Object.freeze({adapterId:this.adapter.adapterId,totalRows:this.currentRows().length,visibleRows:Object.freeze([...rows]),visibleRowIds:Object.freeze(visibleRowIds),filterQuery:this.filterQuery,selectedRowIds:Object.freeze(unique([...this.selected])),focusedRowId:this.focusedRowId,selectionAnchorId:this.selectionAnchorId,sort:this.sort?Object.freeze({...this.sort}):null});
  }

  private currentRows(){
    const rows=this.adapter.rows();if(!Array.isArray(rows))throw Error('COLLECTION_ADAPTER_ROWS_MUST_BE_ARRAY');
    const ids=rows.map(row=>this.adapter.rowId(row));if(ids.some(id=>!id)||new Set(ids).size!==ids.length)throw Error('COLLECTION_ROW_IDS_INVALID');return [...rows];
  }
  private visibleRows(){
    let rows=this.currentRows();const query=normalize(this.filterQuery);
    if(query)rows=rows.filter(row=>normalize(`${this.adapter.rowLabel(row)} ${this.adapter.searchableText(row)}`).includes(query));
    if(this.sort){const column=this.adapter.columns.find(item=>item.id===this.sort!.columnId);if(column?.compareRows){const dir=this.sort.direction==='asc'?1:-1;rows=[...rows].sort((a,b)=>column.compareRows!(a,b)*dir);}}
    return rows;
  }
  private assertCurrentRow(rowId:string){if(!this.currentRows().some(row=>this.adapter.rowId(row)===rowId))throw Error(`COLLECTION_ROW_UNKNOWN:${rowId}`);}
  private reconcile(){
    const ids=new Set(this.currentRows().map(row=>this.adapter.rowId(row)));this.selected.forEach(id=>{if(!ids.has(id))this.selected.delete(id)});
    if(this.selectionAnchorId&&!ids.has(this.selectionAnchorId))this.selectionAnchorId=null;
    if(this.focusedRowId&&!ids.has(this.focusedRowId))this.focusedRowId=null;
  }
}
