const escape=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
export const STRUCTURED_CODE_BLOCK_CONTRACT=Object.freeze({id:'StructuredCodeBlockBehavior',version:'1.1.0',owner:'StructuredRichContentOwner',policyRevision:'structured-code-pw06-donor-r1'});

export function projectStructuredCodeBlock(rawCode,direction='ltr'){
  const raw=String(rawCode??'');return {rawText:raw,html:`<pre dir="${direction==='rtl'?'rtl':'ltr'}"><code>${escape(raw)}</code></pre>`,direction:direction==='rtl'?'rtl':'ltr',copyText:raw,rawByteLength:new TextEncoder().encode(raw).length,contract:STRUCTURED_CODE_BLOCK_CONTRACT};
}

export function structuredCodeLineLabels(rawCode){
  const count=Math.max(1,String(rawCode??'').split('\n').length);
  return Array.from({length:count},(_,index)=>String(index+1)).join('\n');
}

/**
 * Donor-derived code-view projection. Presentation only: it never changes code text,
 * syntax annotations, persistence state, or semantic document ownership.
 */
export function applyStructuredCodeViewPreferences(element,block,{preferences,rawCode}={}){
  if(!element||block?.type!=='code')return false;
  const prefs=preferences||{};
  element.dataset.codeWrap=String(prefs.codeWrap??'wrap');
  element.dataset.codeLineNumbers=String(prefs.codeLineNumbers!==false);
  element.dataset.codeFocusLines=String(prefs.codeFocusLines!==false);
  if(prefs.codeLineNumbers!==false)element.dataset.lineLabels=structuredCodeLineLabels(typeof rawCode==='function'?rawCode(block):block?.codeText??'');
  else delete element.dataset.lineLabels;
  const bar=element.parentElement?.querySelector?.('.codebar');
  if(bar)bar.dataset.copyControls=String(prefs.codeShowCopyControls!==false);
  return true;
}
