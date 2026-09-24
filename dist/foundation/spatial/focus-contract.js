export const SPATIAL_FOCUS_CONTRACT=Object.freeze({id:'SpatialFocusContract',version:'1.0.0',owner:'SpatialSelectionNavigationKernel'});

export class SpatialFocusContract {
  constructor(){this.focusId=null;this.anchorId=null;}
  reconcile(order,selected=[]){const known=new Set(order),selectedKnown=selected.filter(id=>known.has(id));if(!known.has(this.focusId))this.focusId=known.has(this.anchorId)?this.anchorId:(selectedKnown[0]||order[0]||null);if(!known.has(this.anchorId))this.anchorId=selectedKnown[0]||this.focusId||order[0]||null;return this.snapshot();}
  focus(id,order){if(id!==null&&!order.includes(id))throw Error('UNKNOWN_SPATIAL_ENDPOINT:'+id);this.focusId=id;return this.focusId;}
  anchor(id,order){if(id!==null&&!order.includes(id))throw Error('UNKNOWN_SPATIAL_ENDPOINT:'+id);this.anchorId=id;return this.anchorId;}
  snapshot(){return {focusId:this.focusId,anchorId:this.anchorId,contract:SPATIAL_FOCUS_CONTRACT};}
}
