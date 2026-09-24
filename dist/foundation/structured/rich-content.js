import {InputDirectionResolver} from '../global/input-direction.js';
import {StructuredDirectionAdapter} from './direction-adapter.js';
import {STRUCTURED_RICH_SANITIZATION_POLICY,sanitizeStructuredInlineHTML} from './sanitization-policy.js';
import {projectStructuredCodeBlock} from './code-block.js';

export const STRUCTURED_RICH_CONTENT_CONTRACT=Object.freeze({id:'StructuredRichContentOwner',version:'1.0.0',compatibility:'SEMVER',owner:'Structured Family',policyRevision:'structured-rich-content-w4c-r1'});
export const STRUCTURED_RICH_CONTENT_POLICY=Object.freeze({revision:'structured-rich-content-w4c-policy-r1',codeFallbackDirection:'ltr',inlineCodeDirection:'ltr',clipboardRole:'PORTABLE_REPRESENTATION_ONLY_CANONICAL_CLIPBOARD_OWNER_REQUIRED'});
const clone=value=>structuredClone(value);
const escape=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const escapePortableHTML=value=>escape(value).replace(/\b(javascript|vbscript)\s*:/gi,'$1&#58;').replace(/data\s*:\s*text\/html/gi,'data&#58;text/html');
const INLINE_MARKS=Object.freeze({bold:'strong',italic:'em',underline:'u',strike:'s',mark:'mark'});

export class StructuredRichContentOwner{
  constructor({directionResolver=new InputDirectionResolver(),clipboardOwner=null,sanitizationPolicy=STRUCTURED_RICH_SANITIZATION_POLICY,policy=STRUCTURED_RICH_CONTENT_POLICY}={}){
    this.owner='StructuredRichContentOwner';this.contract=STRUCTURED_RICH_CONTENT_CONTRACT;this.policy=policy;this.sanitizationPolicy=sanitizationPolicy;this.directionResolver=directionResolver;this.directionAdapter=new StructuredDirectionAdapter(directionResolver);this.clipboardOwner=clipboardOwner;
    if(clipboardOwner&&clipboardOwner.owner!=='StructuredClipboardTrustOwner')throw Error('CANONICAL_STRUCTURED_CLIPBOARD_OWNER_REQUIRED');
  }
  descriptor(){return {owner:this.owner,contract:this.contract,policy:this.policy,sanitizationPolicyRevision:this.sanitizationPolicy.revision,directionOwner:this.directionResolver.owner,clipboardOwner:this.clipboardOwner?.owner||null,clipboardOwnership:false,clipboardRole:this.policy.clipboardRole};}
  sanitizeInline(html){return sanitizeStructuredInlineHTML(html,this.sanitizationPolicy);}
  formatInline(text,mark){const value=escape(text);if(mark==='code')return this.isolateInline(`<code class="inline-code">${value}</code>`,this.policy.inlineCodeDirection,{alreadySafeHtml:true});const tag=INLINE_MARKS[mark];if(!tag)throw Error('UNSUPPORTED_RICH_INLINE_MARK');return this.sanitizeInline(`<${tag}>${value}</${tag}>`);}
  isolateInline(value,direction,{alreadySafeHtml=false}={}){if(direction!=='rtl'&&direction!=='ltr')throw Error('EXPLICIT_BIDI_DIRECTION_REQUIRED');const inner=alreadySafeHtml?String(value):escape(value);return this.sanitizeInline(`<bdi dir="${direction}">${inner}</bdi>`);}
  projectBlock(block,{fallbackDirection=null}={}){
    const value=clone(block||{}),isCode=value.type==='code',content=isCode?(value.codeText??value.html??''):(value.html??value.title??'');const resolution=this.directionAdapter.resolveBlock(value,{fallbackDirection:isCode?(fallbackDirection||this.policy.codeFallbackDirection):fallbackDirection});
    if(isCode){const code=projectStructuredCodeBlock(content,resolution.direction);return {owner:this.owner,blockId:value.id||null,type:'code',direction:resolution.direction,directionResolution:resolution,html:code.html,rawText:code.rawText,copyText:code.copyText,rawByteLength:code.rawByteLength,sanitized:true};}
    const sanitized=this.sanitizeInline(content);return {owner:this.owner,blockId:value.id||null,type:value.type||'paragraph',direction:resolution.direction,directionResolution:resolution,html:sanitized.html,rawText:null,copyText:String(content).replace(/<[^>]*>/g,''),sanitization:sanitized,sanitized:true};
  }
  _walkPortable(blocks){return (blocks||[]).map(block=>{const projected=this.projectBlock(block),copy={id:block.id,type:block.type,dir:projected.direction,html:block.type==='code'?escapePortableHTML(projected.rawText):projected.html};if(block.type==='code')copy.codeText=projected.rawText;if(block.title!=null)copy.title=String(block.title);if(block.open!=null)copy.open=!!block.open;if(block.align!=null)copy.align=block.align;if(block.bg!=null)copy.bg=block.bg;if(block.children)copy.children=this._walkPortable(block.children);return copy;});}
  portableFromCanonicalClipboard(payload){
    const owner=this._canonicalClipboard();const admitted=owner.compatibility(payload);if(!admitted.enabled)throw Error(`CANONICAL_CLIPBOARD_REJECTED:${admitted.code}`);const blocks=this._walkPortable(admitted.payload.blocks);return {kind:this.sanitizationPolicy.portableKind,version:this.sanitizationPolicy.portableVersion,source:{canonicalClipboardOwner:owner.owner,documentId:payload.source?.documentId||null,domainKind:payload.source?.domainKind||null},blocks,security:{sanitizerPolicyRevision:this.sanitizationPolicy.revision,activeHtmlAllowed:false,eventHandlersAllowed:false},ownership:{richContentOwner:this.owner,clipboardOwner:owner.owner,clipboardOwnership:false}};
  }
  canonicalClipboardFromPortable(portable,{documentId='portable-rich-source',domainKind='portable-rich'}={}){
    const owner=this._canonicalClipboard();if(portable?.kind!==this.sanitizationPolicy.portableKind||portable?.version!==this.sanitizationPolicy.portableVersion||!Array.isArray(portable.blocks))throw Error('INVALID_PORTABLE_RICH_FRAGMENT');const blocks=this._walkPortable(portable.blocks);const blockIds=blocks.map(block=>block.id);const payload={kind:owner.contract.payloadKind,version:owner.contract.payloadVersion,schema:{id:owner.schema.id,version:owner.schema.version},source:{documentId,domainKind,owner:this.owner},selection:{mode:'blocks',blockIds,coveredBlockIds:blockIds,coveredCount:blockIds.length,count:blockIds.length,anchorBlockId:blockIds[0]||null,focusBlockId:blockIds.at(-1)||null},trust:{boundary:owner.owner,state:'SANITIZED_THEN_CANONICAL_VALIDATION_REQUIRED',htmlPolicy:owner.policy.htmlTrustPolicy},blocks};const admitted=owner.compatibility(payload);if(!admitted.enabled)throw Error(`CANONICAL_CLIPBOARD_REJECTED:${admitted.code}`);return {payload:admitted.payload,validation:{owner:admitted.owner,code:admitted.code,trust:admitted.trust},ownership:{richContentOwner:this.owner,clipboardOwner:owner.owner,clipboardOwnership:false}};
  }
  _canonicalClipboard(){if(!this.clipboardOwner||this.clipboardOwner.owner!=='StructuredClipboardTrustOwner')throw Error('CANONICAL_STRUCTURED_CLIPBOARD_OWNER_REQUIRED');return this.clipboardOwner;}
}
