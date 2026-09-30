export class StructuredSelectionDOMBridge {
  constructor(){this.owner='StructuredSelectionDOMBridge';this.authority='PROJECTION_ONLY';}
  descriptorFromDOMSelection(selection,{surfaceRoot=null}={}){
    if(!selection||selection.isCollapsed||!selection.rangeCount)return null;
    const elementFor=node=>{const element=node?.nodeType===1?node:node?.parentElement;return element?.closest?.('.blockbody[data-editable-block],.toggle-title[data-editable-block]')||null};
    const anchorElement=elementFor(selection.anchorNode),focusElement=elementFor(selection.focusNode);if(!anchorElement||!focusElement||anchorElement!==focusElement)return null;if(surfaceRoot&&!surfaceRoot.contains(anchorElement))return null;
    const row=anchorElement.closest('.block'),blockId=row?.dataset.blockId;if(!blockId)return null;
    const logicalOffset=(container,offset)=>{try{const range=document.createRange();range.selectNodeContents(anchorElement);range.setEnd(container,offset);return range.toString().length}catch{return null}};
    const anchorOffset=logicalOffset(selection.anchorNode,selection.anchorOffset),focusOffset=logicalOffset(selection.focusNode,selection.focusOffset);if(anchorOffset==null||focusOffset==null)return null;
    return {blockId,anchorOffset,focusOffset,start:Math.min(anchorOffset,focusOffset),end:Math.max(anchorOffset,focusOffset),direction:anchorOffset<=focusOffset?'forward':'backward'};
  }
  projectInlineRange(descriptor,{resolveEditable}={}){
    if(!descriptor||typeof resolveEditable!=='function')return null;const editable=resolveEditable(descriptor.blockId);if(!editable)return null;
    const point=offset=>{const walker=document.createTreeWalker(editable,NodeFilter.SHOW_TEXT);let remaining=Math.max(0,Number(offset)||0),node;while((node=walker.nextNode())){if(remaining<=node.nodeValue.length)return {node,offset:remaining};remaining-=node.nodeValue.length}return {node:editable,offset:editable.childNodes.length}};
    const a=point(descriptor.anchorOffset),f=point(descriptor.focusOffset),range=document.createRange();try{range.setStart(a.node,a.offset);range.setEnd(f.node,f.offset)}catch{return null}return range;
  }
}
export const STRUCTURED_SELECTION_DOM_BRIDGE=Object.freeze(new StructuredSelectionDOMBridge());
