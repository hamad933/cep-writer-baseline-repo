const clone=value=>structuredClone(value);
const stripMarkup=value=>String(value??'').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]*>/g,'').replace(/&nbsp;/gi,' ');

export const STRUCTURED_CARET_BRIDGE_CONTRACT=Object.freeze({
  id:'StructuredCaretBridge',
  version:'1.0.0',
  role:'transient-caret-composition-adapter',
  semanticOwner:'StructuredInputKeymapOwner',
  canonicalSelectionOwner:'StructuredSelectionKernel',
  policyTag:'structured-input-caret-v1'
});

export class StructuredCaretBridge{
  constructor({readDocument,treeKernel}={}){
    if(typeof readDocument!=='function')throw Error('STRUCTURED_CARET_DOCUMENT_READER_REQUIRED');
    if(!treeKernel?.walk||!treeKernel?.findRef)throw Error('STRUCTURED_CARET_TREE_KERNEL_REQUIRED');
    this.owner='StructuredInputKeymapOwner';
    this.bridgeId=STRUCTURED_CARET_BRIDGE_CONTRACT.id;
    this.contract=STRUCTURED_CARET_BRIDGE_CONTRACT;
    this.readDocument=readDocument;
    this.treeKernel=treeKernel;
    this.state={blockId:null,offset:0,textLength:0,atStart:false,atEnd:false,beforeText:'',afterText:'',beforeHtml:'',afterHtml:'',compositionActive:false,compositionData:''};
    this.sequence=0;
    this.receipts=[];
  }
  _document(){const document=this.readDocument();if(!document?.id||!Array.isArray(document.blocks))throw Error('INVALID_STRUCTURED_CARET_DOCUMENT');return document;}
  _rows(){const rows=[];this.treeKernel.walk(this._document().blocks,(block,context)=>rows.push({id:block.id,block,parentId:context.parent?.id||null,depth:context.depth}));return rows;}
  _text(block){return block?.type==='code'?String(block.codeText??block.html??''):stripMarkup(block?.html??block?.titleHtml??block?.title??'');}
  _receipt(kind,extra={}){const receipt={sequence:++this.sequence,kind,semanticOwner:this.owner,bridgeId:this.bridgeId,...clone(extra)};this.receipts.push(receipt);return receipt;}
  capture(snapshot={}){
    const document=this._document(),blockId=String(snapshot.blockId||'');
    if(blockId&&!this.treeKernel.findRef(document.blocks,blockId))throw Error(`UNKNOWN_STRUCTURED_BLOCK:${blockId}`);
    const ref=blockId?this.treeKernel.findRef(document.blocks,blockId):null,text=ref?this._text(ref.block):String(snapshot.text??''),textLength=Math.max(0,Number(snapshot.textLength??text.length)||0),offset=Math.max(0,Math.min(Number(snapshot.offset)||0,textLength));
    this.state={...this.state,blockId:blockId||null,offset,textLength,atStart:snapshot.atStart??offset===0,atEnd:snapshot.atEnd??offset===textLength,beforeText:String(snapshot.beforeText??text.slice(0,offset)),afterText:String(snapshot.afterText??text.slice(offset)),beforeHtml:String(snapshot.beforeHtml??snapshot.beforeText??text.slice(0,offset)),afterHtml:String(snapshot.afterHtml??snapshot.afterText??text.slice(offset))};
    this._receipt('caret.capture',{blockId:this.state.blockId,offset:this.state.offset,textLength:this.state.textLength});
    return this.snapshot();
  }
  compositionStart(data=''){this.state.compositionActive=true;this.state.compositionData=String(data??'');this._receipt('composition.start',{blockId:this.state.blockId,data:this.state.compositionData});return this.snapshot();}
  compositionUpdate(data=''){this.state.compositionActive=true;this.state.compositionData=String(data??'');this._receipt('composition.update',{blockId:this.state.blockId,data:this.state.compositionData});return this.snapshot();}
  compositionEnd(data=''){this.state.compositionActive=false;this.state.compositionData=String(data??'');this._receipt('composition.end',{blockId:this.state.blockId,data:this.state.compositionData});return this.snapshot();}
  navigationTarget(key,snapshot=this.state){
    const rows=this._rows(),blockId=snapshot.blockId||this.state.blockId,index=rows.findIndex(row=>row.id===blockId);if(index<0)return null;
    const offset=Math.max(0,Number(snapshot.offset??this.state.offset)||0),atStart=snapshot.atStart??offset===0,atEnd=snapshot.atEnd??offset===(snapshot.textLength??this.state.textLength);
    let targetIndex=null,targetOffset=offset;
    if(key==='ArrowLeft'&&atStart){targetIndex=index-1;targetOffset=null}
    else if(key==='ArrowRight'&&atEnd){targetIndex=index+1;targetOffset=0}
    else if(key==='ArrowUp'){targetIndex=index-1}
    else if(key==='ArrowDown'){targetIndex=index+1}
    else return null;
    if(targetIndex<0||targetIndex>=rows.length)return null;
    const target=rows[targetIndex],length=this._text(target.block).length,resolvedOffset=targetOffset==null?length:Math.max(0,Math.min(targetOffset,length));
    return {blockId:target.id,offset:resolvedOffset,textLength:length,fromBlockId:blockId,key};
  }
  snapshot(){return clone({...this.state,semanticOwner:this.owner,bridgeId:this.bridgeId,contract:this.contract});}
}
