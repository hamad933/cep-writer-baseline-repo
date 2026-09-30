import {STRUCTURED_TREE_KERNEL} from '../structured.js';

const clone=value=>structuredClone(value);
const hasOwn=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const SAFE_NUMERIC_ENTITY_WHITESPACE=new Set([0x09,0x0a,0x0d]);

export function assertCanonicalStructuredNavigationTreeKernel(treeKernel){
  if(treeKernel!==STRUCTURED_TREE_KERNEL)throw Error('CANONICAL_STRUCTURED_TREE_KERNEL_REQUIRED');
  return treeKernel;
}

export function validateStructuredNavigationDocument(document,treeKernel=STRUCTURED_TREE_KERNEL){
  const canonicalTreeKernel=assertCanonicalStructuredNavigationTreeKernel(treeKernel);
  if(!document?.id||typeof document.id!=='string')throw Error('STRUCTURED_DOCUMENT_ID_REQUIRED');
  if(!document.revision||typeof document.revision!=='string')throw Error('STRUCTURED_DOCUMENT_REVISION_REQUIRED');
  if(typeof document.title!=='string'||!Array.isArray(document.blocks))throw Error('INVALID_STRUCTURED_DOCUMENT');
  const validation=canonicalTreeKernel.validate(document.blocks);
  if(!validation.ok)throw Error(`INVALID_STRUCTURED_TREE:${validation.issues?.[0]?.code||'UNKNOWN'}`);
  return document;
}

export function validateStructuredNavigationIdentity(document,identity){
  if(identity==null)identity={};
  if(typeof identity!=='object'||Array.isArray(identity))throw Error('INVALID_STRUCTURED_NAVIGATION_IDENTITY');
  const normalized={};
  if(hasOwn(identity,'id')&&identity.id!==undefined){
    if(typeof identity.id!=='string')throw Error('INVALID_STRUCTURED_NAVIGATION_IDENTITY_ID');
    if(identity.id!==document.id)throw Error('STRUCTURED_NAVIGATION_DOCUMENT_IDENTITY_MISMATCH');
    normalized.id=identity.id;
  }else normalized.id=document.id;

  if(hasOwn(identity,'committedRevision')&&identity.committedRevision!==undefined){
    if(identity.committedRevision!==null&&typeof identity.committedRevision!=='string')throw Error('INVALID_STRUCTURED_NAVIGATION_COMMITTED_REVISION');
    normalized.committedRevision=identity.committedRevision;
  }else normalized.committedRevision=document.revision;

  if(hasOwn(identity,'workingRevision')&&identity.workingRevision!==undefined){
    if(identity.workingRevision!==null&&(!Number.isSafeInteger(identity.workingRevision)||identity.workingRevision<0))throw Error('INVALID_STRUCTURED_NAVIGATION_WORKING_REVISION');
    normalized.workingRevision=identity.workingRevision;
  }else normalized.workingRevision=null;

  if(hasOwn(identity,'owner')&&identity.owner!==undefined){
    if(identity.owner!==null&&typeof identity.owner!=='string')throw Error('INVALID_STRUCTURED_NAVIGATION_IDENTITY_OWNER');
    normalized.owner=identity.owner;
  }else normalized.owner=null;
  return Object.freeze(normalized);
}

export function validateStructuredNavigationSnapshot({treeKernel=STRUCTURED_TREE_KERNEL,document,identity}={}){
  const canonicalTreeKernel=assertCanonicalStructuredNavigationTreeKernel(treeKernel);
  validateStructuredNavigationDocument(document,canonicalTreeKernel);
  return Object.freeze({treeKernel:canonicalTreeKernel,document,identity:validateStructuredNavigationIdentity(document,identity)});
}

const decodeNumericEntity=(match,value,radix)=>{
  const codePoint=Number.parseInt(value,radix);
  if(!Number.isSafeInteger(codePoint)||codePoint<0||codePoint>0x10ffff||(codePoint>=0xd800&&codePoint<=0xdfff))return match;
  const isC0=codePoint>=0x00&&codePoint<=0x1f&&!SAFE_NUMERIC_ENTITY_WHITESPACE.has(codePoint);
  const isC1=codePoint>=0x7f&&codePoint<=0x9f;
  if(isC0||isC1)return match;
  try{return String.fromCodePoint(codePoint)}catch{return match}
};

const decodeEntities=value=>String(value??'')
  .replace(/&nbsp;/gi,' ')
  .replace(/&amp;/gi,'&')
  .replace(/&lt;/gi,'<')
  .replace(/&gt;/gi,'>')
  .replace(/&quot;/gi,'"')
  .replace(/&#39;|&apos;/gi,"'")
  .replace(/&#(\d+);/g,(match,n)=>decodeNumericEntity(match,n,10))
  .replace(/&#x([0-9a-f]+);/gi,(match,n)=>decodeNumericEntity(match,n,16));

export function structuredNavigationPlainText(value){
  return decodeEntities(String(value??'')
    .replace(/<br\s*\/?>/gi,' ')
    .replace(/<[^>]*>/g,' '))
    .replace(/\s+/g,' ')
    .trim();
}

export function structuredNavigationLabel(block,{fallbackLabel='Block'}={}){
  const source=block?.type==='toggle'?(block?.titleHtml??block?.title??''):(block?.html??block?.titleHtml??block?.title??'');
  const text=structuredNavigationPlainText(source);
  return Object.freeze({
    label:text||String(fallbackLabel||'Block'),
    labelSource:text?'content':'type-fallback',
    hasContentLabel:!!text
  });
}

export function deriveStructuredReadInspectionDescriptor({owner,contract,policy,treeKernel,document,identity,blockId,mode='read',typeLabel='Block',delegation}={}){
  const snapshot=validateStructuredNavigationSnapshot({treeKernel,document,identity});
  const canonicalTreeKernel=snapshot.treeKernel,canonicalIdentity=snapshot.identity,documentId=document.id;
  const base={
    owner,
    contract,
    policy:clone(policy),
    kind:'read-inspection',
    mode,
    documentIdentity:Object.freeze({
      documentId,
      committedRevision:canonicalIdentity.committedRevision,
      workingRevision:canonicalIdentity.workingRevision,
      identityOwner:canonicalIdentity.owner
    }),
    target:Object.freeze({identityKind:'canonical-structured-block',documentId,blockId:blockId||null}),
    behavior:Object.freeze({
      activatesEditSelection:false,
      capturesWriterFocus:false,
      mutatesDocument:false,
      mutatesDomainReference:false,
      opensContextInspector:false,
      performsDomScroll:false,
      presentationDelegation:clone(delegation)
    })
  };
  if(mode!=='read')return Object.freeze({...base,eligible:false,code:'READ_MODE_REQUIRED',reason:'Read inspection descriptors are available only for read-mode presentation.'});
  const ref=canonicalTreeKernel.findRef(document.blocks,blockId);
  if(!ref)return Object.freeze({...base,eligible:false,code:'UNKNOWN_CANONICAL_BLOCK',reason:'The requested canonical Structured block does not exist.'});
  const label=structuredNavigationLabel(ref.block,{fallbackLabel:typeLabel});
  return Object.freeze({
    ...base,
    eligible:true,
    code:'READ_INSPECTION_DESCRIPTOR_READY',
    reason:'Descriptor derived from canonical Structured document truth without selection, focus, transient, DOM-scroll or mutation side effects.',
    block:Object.freeze({
      id:ref.block.id,
      type:ref.block.type,
      label:label.label,
      labelSource:label.labelSource,
      depth:ref.depth,
      parentBlockId:ref.parent?.id||null,
      canonicalPathBlockIds:Object.freeze(canonicalTreeKernel.pathFor(document.blocks,ref.block.id).map(block=>block.id)),
      toggleOpen:ref.block.type==='toggle'?ref.block.open!==false:null
    })
  });
}
