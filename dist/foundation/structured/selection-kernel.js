import {STRUCTURED_SELECTION_CONTRACT,STRUCTURED_SELECTION_POLICY} from './selection-contract.js';

const clone=value=>structuredClone(value);
const unique=values=>[...new Set((values||[]).filter(value=>typeof value==='string'&&value))];

export class StructuredSelectionKernel {
  constructor({readDocument,readRevision=()=>null,treeKernel,policy=STRUCTURED_SELECTION_POLICY}={}){
    if(typeof readDocument!=='function')throw Error('STRUCTURED_SELECTION_READER_REQUIRED');
    if(!treeKernel?.walk||!treeKernel?.findRef||!treeKernel?.pathFor)throw Error('STRUCTURED_SELECTION_TREE_KERNEL_REQUIRED');
    this.owner='StructuredSelectionKernel';this.contract=STRUCTURED_SELECTION_CONTRACT;this.policy=policy;this.readDocument=readDocument;this.readRevision=readRevision;this.treeKernel=treeKernel;
    this.state={documentId:null,workingRevision:null,blockIds:[],coveredBlockIds:[],anchorBlockId:null,focusBlockId:null,mode:'replace',range:null,inlineRange:null};
    this.sequence=0;this._receipts=[];
  }
  _document(){const document=this.readDocument();if(!document||typeof document.id!=='string'||!Array.isArray(document.blocks))throw Error('INVALID_STRUCTURED_SELECTION_DOCUMENT');return document;}
  _revision(document=this._document()){const value=this.readRevision?.();return value==null?String(document.revision??'unknown'):String(value);}
  _order(document=this._document()){const rows=[];this.treeKernel.walk(document.blocks,(block,context)=>rows.push({id:block.id,block,parent:context.parent,depth:context.depth,index:rows.length}));return rows;}
  _known(document=this._document()){return new Set(this._order(document).map(row=>row.id));}
  _receipt(kind,extra={}){const receipt={sequence:++this.sequence,kind,owner:this.owner,policyRevision:this.contract.policyRevision,...clone(extra)};this._receipts.push(receipt);return clone(receipt);}
  _validate(ids,document){const known=this._known(document);for(const id of unique(ids))if(!known.has(id)){this._receipt('selection.reject.unknown',{documentId:document.id,blockId:id});throw Error(`UNKNOWN_STRUCTURED_BLOCK:${id}`)}return known;}
  _canonical(ids,document){const wanted=new Set(unique(ids)),ordered=[];this.treeKernel.walk(document.blocks,block=>{if(wanted.has(block.id))ordered.push(block.id)});return ordered;}
  _normalize(ids,document){
    const ordered=this._canonical(ids,document),selected=new Set(ordered),roots=[];
    for(const id of ordered){const path=this.treeKernel.pathFor(document.blocks,id);if(path.slice(0,-1).some(block=>selected.has(block.id)))continue;roots.push(id)}
    const covered=[];for(const id of roots){const ref=this.treeKernel.findRef(document.blocks,id);if(ref)this.treeKernel.walk([ref.block],block=>covered.push(block.id))}
    return {blockIds:roots,coveredBlockIds:this._canonical(covered,document),rawBlockIds:ordered};
  }
  _rangeRepair(range,rawBlockIds,document){
    const raw=this._canonical(rawBlockIds,document);
    if(!range||!raw.length)return {anchorBlockId:raw[0]||null,focusBlockId:raw.at(-1)||null,range:null};
    const sourceRaw=unique(range.rawBlockIds?.length?range.rawBlockIds:raw),anchorIndex=sourceRaw.indexOf(range.anchorBlockId),focusIndex=sourceRaw.indexOf(range.focusBlockId);
    const segment=anchorIndex>=0&&focusIndex>=0?sourceRaw.slice(Math.min(anchorIndex,focusIndex),Math.max(anchorIndex,focusIndex)+1):sourceRaw;
    const survivors=segment.filter(id=>raw.includes(id)),pool=survivors.length?survivors:raw,preferredDirection=range.direction==='backward'?'backward':'forward';
    const anchorBlockId=raw.includes(range.anchorBlockId)?range.anchorBlockId:(preferredDirection==='backward'?pool.at(-1):pool[0]);
    const focusBlockId=raw.includes(range.focusBlockId)?range.focusBlockId:(preferredDirection==='backward'?pool[0]:pool.at(-1));
    const positions=new Map(this._order(document).map(row=>[row.id,row.index])),direction=(positions.get(anchorBlockId)??0)<=(positions.get(focusBlockId)??0)?'forward':'backward';
    return {anchorBlockId,focusBlockId,range:{...clone(range),anchorBlockId,focusBlockId,rawBlockIds:raw,direction}};
  }
  _assign({ids,anchor=null,focus=null,mode='replace',range=null,inlineRange=this.state.inlineRange,kind='selection.set'}={}){
    const document=this._document();this._validate(ids,document);const normalized=this._normalize(ids,document),workingRevision=this._revision(document),rangeState=range?this._rangeRepair({...clone(range),anchorBlockId:range.anchorBlockId??anchor,focusBlockId:range.focusBlockId??focus},normalized.rawBlockIds,document):null;
    const anchorBlockId=rangeState?.anchorBlockId??(anchor&&normalized.rawBlockIds.includes(anchor)?anchor:(normalized.rawBlockIds[0]||null)),focusBlockId=rangeState?.focusBlockId??(focus&&normalized.rawBlockIds.includes(focus)?focus:(normalized.rawBlockIds.at(-1)||null));
    this.state={documentId:document.id,workingRevision,blockIds:normalized.blockIds,coveredBlockIds:normalized.coveredBlockIds,anchorBlockId,focusBlockId,mode,range:rangeState?.range||null,inlineRange:inlineRange?clone(inlineRange):null};
    this._receipt(kind,{documentId:document.id,workingRevision,blockIds:this.state.blockIds,coveredBlockIds:this.state.coveredBlockIds,anchorBlockId:this.state.anchorBlockId,focusBlockId:this.state.focusBlockId});return this.descriptor({reconcile:false});
  }
  reconcile({reason='document-revision'}={}){
    const document=this._document(),workingRevision=this._revision(document),previous=clone(this.state),known=this._known(document);
    if(previous.documentId&&previous.documentId!==document.id){this.state={documentId:document.id,workingRevision,blockIds:[],coveredBlockIds:[],anchorBlockId:null,focusBlockId:null,mode:'replace',range:null,inlineRange:null};this._receipt('selection.repair.document-change',{reason,fromDocumentId:previous.documentId,toDocumentId:document.id});return this.descriptor({reconcile:false})}
    const stale=unique([...(previous.blockIds||[]),...(previous.range?.rawBlockIds||[]),previous.inlineRange?.blockId]).filter(id=>!known.has(id));
    const surviving=(previous.range?.rawBlockIds?.length?previous.range.rawBlockIds:previous.blockIds||[]).filter(id=>known.has(id));
    const normalized=this._normalize(surviving,document),rangeState=previous.range?this._rangeRepair(previous.range,normalized.rawBlockIds,document):null,inlineRange=previous.inlineRange&&known.has(previous.inlineRange.blockId)?previous.inlineRange:null;
    const anchorBlockId=rangeState?.anchorBlockId??(known.has(previous.anchorBlockId)?previous.anchorBlockId:(normalized.rawBlockIds[0]||null)),focusBlockId=rangeState?.focusBlockId??(known.has(previous.focusBlockId)?previous.focusBlockId:(normalized.rawBlockIds.at(-1)||null));
    this.state={...previous,documentId:document.id,workingRevision,blockIds:normalized.blockIds,coveredBlockIds:normalized.coveredBlockIds,anchorBlockId,focusBlockId,range:rangeState?.range||null,inlineRange};
    if(stale.length||previous.workingRevision!==workingRevision)this._receipt('selection.repair.revision',{reason,documentId:document.id,fromWorkingRevision:previous.workingRevision,toWorkingRevision:workingRevision,removedBlockIds:stale,inlineInvalidated:!!previous.inlineRange&&!inlineRange});
    return this.descriptor({reconcile:false});
  }
  select(ids,{mode='replace',anchor=null,focus=null}={}){
    const document=this._document(),requested=unique(Array.isArray(ids)?ids:[ids]);this._validate(requested,document);const base=mode==='add'?this.descriptor().range?.rawBlockIds||this.descriptor().blockIds:[];return this._assign({ids:[...base,...requested],anchor,focus,mode,range:null,inlineRange:null,kind:'selection.select'});
  }
  selectRange(anchorBlockId,focusBlockId,{mode='replace'}={}){
    const document=this._document();this._validate([anchorBlockId,focusBlockId],document);const ordered=this._order(document).map(row=>row.id),a=ordered.indexOf(anchorBlockId),b=ordered.indexOf(focusBlockId),lo=Math.min(a,b),hi=Math.max(a,b);let rangeIds=ordered.slice(lo,hi+1);
    if(this.policy.rangeEndpoint==='exclude-focus-probe'&&rangeIds.length>1)rangeIds=rangeIds.filter(id=>id!==focusBlockId);
    const base=mode==='add'?this.descriptor().range?.rawBlockIds||this.descriptor().blockIds:[];return this._assign({ids:[...base,...rangeIds],anchor:anchorBlockId,focus:focusBlockId,mode,range:{anchorBlockId,focusBlockId,direction:a<=b?'forward':'backward'},inlineRange:null,kind:'selection.range'});
  }
  toggle(blockId){const current=this.descriptor(),raw=current.range?.rawBlockIds||current.blockIds,next=new Set(raw);next.has(blockId)?next.delete(blockId):next.add(blockId);return this._assign({ids:[...next],anchor:blockId,focus:blockId,mode:'toggle',range:null,inlineRange:null,kind:'selection.toggle'});}
  selectInlineRange({blockId,anchorOffset,focusOffset,direction=null}={}){
    const document=this._document();this._validate([blockId],document);const anchor=Math.max(0,Number(anchorOffset)||0),focus=Math.max(0,Number(focusOffset)||0),resolvedDirection=direction|| (anchor<=focus?'forward':'backward');
    const inlineRange={blockId,anchorOffset:anchor,focusOffset:focus,start:Math.min(anchor,focus),end:Math.max(anchor,focus),direction:resolvedDirection};
    const descriptor=this._assign({ids:[blockId],anchor:blockId,focus:blockId,mode:'inline',range:null,inlineRange,kind:'selection.inline'});return descriptor;
  }
  clearInlineRange(){this.reconcile();this.state.inlineRange=null;this._receipt('selection.inline.clear',{documentId:this.state.documentId});return this.descriptor({reconcile:false});}
  clear(){const document=this._document();this.state={documentId:document.id,workingRevision:this._revision(document),blockIds:[],coveredBlockIds:[],anchorBlockId:null,focusBlockId:null,mode:'replace',range:null,inlineRange:null};this._receipt('selection.clear',{documentId:document.id});return this.descriptor({reconcile:false});}
  descriptor({reconcile=true}={}){if(reconcile)this.reconcile({reason:'descriptor'});const document=this._document(),ordered=this._order(document).map(row=>row.id),positions=new Map(ordered.map((id,index)=>[id,index]));return {contract:this.contract,owner:this.owner,policyRevision:this.contract.policyRevision,policy:clone(this.policy),documentId:document.id,workingRevision:this.state.workingRevision,blockIds:[...this.state.blockIds],coveredBlockIds:[...this.state.coveredBlockIds],count:this.state.blockIds.length,coveredCount:this.state.coveredBlockIds.length,startIndex:this.state.blockIds.length?positions.get(this.state.blockIds[0])??null:null,endIndex:this.state.blockIds.length?positions.get(this.state.blockIds.at(-1))??null:null,anchorBlockId:this.state.anchorBlockId,focusBlockId:this.state.focusBlockId,mode:this.state.mode,range:clone(this.state.range),inlineRange:clone(this.state.inlineRange)};}
  bookmark(){const d=this.descriptor();return {kind:'cep.structured-selection-bookmark',version:1,documentId:d.documentId,workingRevision:d.workingRevision,blockIds:[...d.blockIds],anchorBlockId:d.anchorBlockId,focusBlockId:d.focusBlockId,range:clone(d.range),inlineRange:clone(d.inlineRange)};}
  projectBookmark(bookmark){const document=this._document();if(!bookmark||bookmark.documentId&&bookmark.documentId!==document.id){this.clear();this._receipt('selection.bookmark.reject',{reason:'DOCUMENT_MISMATCH'});return this.descriptor()}
    const known=this._known(document);
    if(bookmark.inlineRange&&known.has(bookmark.inlineRange.blockId))return this.selectInlineRange(bookmark.inlineRange);
    const sourceRaw=unique(bookmark.range?.rawBlockIds?.length?bookmark.range.rawBlockIds:bookmark.blockIds||[]),surviving=sourceRaw.filter(id=>known.has(id)),removed=sourceRaw.filter(id=>!known.has(id));
    if(surviving.length){
      if(bookmark.range){const rangeState=this._rangeRepair(bookmark.range,surviving,document),result=this._assign({ids:surviving,anchor:rangeState.anchorBlockId,focus:rangeState.focusBlockId,mode:'replace',range:rangeState.range,inlineRange:null,kind:'selection.bookmark.project'});if(removed.length)this._receipt('selection.bookmark.repair',{reason:'STALE_RANGE_BOOKMARK',documentId:document.id,removedBlockIds:removed,anchorBlockId:result.anchorBlockId,focusBlockId:result.focusBlockId});return this.descriptor({reconcile:false})}
      const normalized=this._normalize(surviving,document),anchor=known.has(bookmark.anchorBlockId)?bookmark.anchorBlockId:(normalized.rawBlockIds[0]||null),focus=known.has(bookmark.focusBlockId)?bookmark.focusBlockId:(normalized.rawBlockIds.at(-1)||null),result=this._assign({ids:surviving,anchor,focus,mode:'replace',range:null,inlineRange:null,kind:'selection.bookmark.project'});if(removed.length)this._receipt('selection.bookmark.repair',{reason:'STALE_BLOCK_BOOKMARK',documentId:document.id,removedBlockIds:removed,anchorBlockId:result.anchorBlockId,focusBlockId:result.focusBlockId});return this.descriptor({reconcile:false});
    }
    this.clear();if(sourceRaw.length||bookmark.inlineRange)this._receipt('selection.bookmark.repair',{reason:'STALE_BOOKMARK',documentId:document.id,removedBlockIds:removed});return this.descriptor({reconcile:false});
  }
  fragment(){const document=this._document(),descriptor=this.descriptor(),result=[];for(const id of descriptor.blockIds){const ref=this.treeKernel.findRef(document.blocks,id);if(ref)result.push(clone(ref.block))}return result;}
  receipts(){return clone(this._receipts);}
}
