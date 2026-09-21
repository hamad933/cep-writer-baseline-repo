import {STRUCTURED_OUTLINE_PRESENTATION_DESCRIPTOR_CONTRACT} from './outline-descriptor.js';

export const STRUCTURED_OUTLINE_HOST_CONTRACT=Object.freeze({
  id:'StructuredOutlineHost',
  version:'1.0.0',
  compatibility:'SEMVER',
  owner:'Structured Family',
  descriptorContract:STRUCTURED_OUTLINE_PRESENTATION_DESCRIPTOR_CONTRACT.id,
  presentationClasses:Object.freeze(['treebranch','treeitem','treechildren','treeexp','treeico','treelabel','tree-secondary','treeid','treecount','treematch']),
  domainNeutral:true,
  ownsQuickJump:false,
  ownsDomainSearchRanking:false,
  ownsDomainRouting:false,
  ownsCanonicalStructureMutation:false
});

const lower=value=>String(value??'').toLocaleLowerCase();
const appendHighlighted=(document,parent,value,query)=>{
  const text=String(value??''),needle=lower(query);
  if(!needle){parent.append(document.createTextNode(text));return;}
  const index=lower(text).indexOf(needle);
  if(index<0){parent.append(document.createTextNode(text));return;}
  if(index)parent.append(document.createTextNode(text.slice(0,index)));
  const mark=document.createElement('span');mark.className='treematch';mark.textContent=text.slice(index,index+String(query).length);parent.append(mark);
  if(index+String(query).length<text.length)parent.append(document.createTextNode(text.slice(index+String(query).length)));
};
const trustedIcon=(element,iconRenderer,key)=>{if(!key||typeof iconRenderer!=='function')return;element.innerHTML=String(iconRenderer(key)||'');};

export function renderStructuredOutlineNode(document,node,{query='',iconRenderer=null,level=1,pos=1,setSize=1}={}){
  const branch=document.createElement('div');branch.className='treebranch';
  const isLeaf=!node.children?.length,expanded=!isLeaf&&(node.forceExpanded||node.expanded);
  const button=document.createElement('button');button.type='button';button.className=`treeitem${node.variantClass?` ${node.variantClass}`:''}`;
  button.dataset.treeId=node.id;button.dataset.kind=node.kind;button.dataset.leaf=String(isLeaf);button.dataset.path=String(!!node.onActivePath);
  for(const [key,value] of Object.entries(node.activationDataset||{}))button.dataset[key]=value;
  button.setAttribute('role','treeitem');button.setAttribute('aria-level',String(level));button.setAttribute('aria-posinset',String(pos));button.setAttribute('aria-setsize',String(setSize));button.setAttribute('aria-selected',String(!!node.selected));
  if(node.current)button.setAttribute('aria-current','page');if(!isLeaf)button.setAttribute('aria-expanded',String(expanded));button.tabIndex=node.focused?0:-1;
  const expander=document.createElement('span');expander.className='treeexp';if(!isLeaf)trustedIcon(expander,iconRenderer,'i-chev');button.append(expander);
  const icon=document.createElement('span');icon.className='treeico';trustedIcon(icon,iconRenderer,node.iconKey);button.append(icon);
  const label=document.createElement('span');label.className='treelabel';const strong=document.createElement('strong');strong.setAttribute('dir','auto');appendHighlighted(document,strong,node.label,query);label.append(strong);
  if(node.secondary?.length){const secondary=document.createElement('span');secondary.className='tree-secondary';for(const part of node.secondary){const partEl=document.createElement(part.element==='bdi'?'bdi':'small');if(part.element==='bdi')partEl.className='treeid';partEl.setAttribute('dir',part.direction||'auto');appendHighlighted(document,partEl,part.text,query);secondary.append(partEl)}label.append(secondary)}
  button.append(label);
  if(node.countText!==null){const count=document.createElement('span');count.className='treecount';count.textContent=node.countText||'';button.append(count)}
  if(node.statusText){const status=document.createElement('span');status.className=node.statusClass||'outline-result-state';status.textContent=node.statusText;button.append(status)}
  branch.append(button);
  if(expanded){const children=document.createElement('div');children.className='treechildren';children.setAttribute('role','group');node.children.forEach((child,index)=>children.append(renderStructuredOutlineNode(document,child,{query,iconRenderer,level:level+1,pos:index+1,setSize:node.children.length})));branch.append(children)}
  return branch;
}

const renderSummary=(document,element,summary)=>{
  if(!element)return;
  element.replaceChildren();
  if(!summary){element.append(document.createElement('span')).textContent='—';element.removeAttribute('title');return;}
  if(summary.kind==='path'){
    if(!summary.labels.length){element.append(document.createElement('span')).textContent='—';element.removeAttribute('title');return;}
    summary.labels.forEach((label,index)=>{const part=document.createElement('span');part.setAttribute('dir','auto');part.textContent=label;element.append(part);if(index<summary.labels.length-1){const separator=document.createElement('b');separator.setAttribute('aria-hidden','true');separator.textContent='›';element.append(separator)}});
    if(summary.title)element.title=summary.title;else element.removeAttribute('title');return;
  }
  const part=document.createElement('span');part.textContent=summary.text;element.append(part);if(summary.title)element.title=summary.title;else element.removeAttribute('title');
};

export function renderStructuredOutline(host,descriptor,{document=host?.ownerDocument,iconRenderer=null,countElement=null,emptyElement=null,summaryElement=null}={}){
  if(!host||!document)throw Error('STRUCTURED_OUTLINE_HOST_REQUIRED');
  if(descriptor?.contract?.id!==STRUCTURED_OUTLINE_PRESENTATION_DESCRIPTOR_CONTRACT.id)throw Error('STRUCTURED_OUTLINE_DESCRIPTOR_CONTRACT_REQUIRED');
  host.replaceChildren();host.setAttribute('role','tree');host.setAttribute('aria-label',descriptor.ariaLabel);host.dataset.outlineOwner=STRUCTURED_OUTLINE_HOST_CONTRACT.id;host.dataset.outlineMode=descriptor.mode;
  const fragment=document.createDocumentFragment();descriptor.nodes.forEach((node,index)=>fragment.append(renderStructuredOutlineNode(document,node,{query:descriptor.query,iconRenderer,level:1,pos:index+1,setSize:descriptor.nodes.length})));host.append(fragment);
  const visible=[...host.querySelectorAll('.treeitem')];let focused=visible.find(item=>item.tabIndex===0)||null;if(!focused&&visible.length){focused=visible[0];focused.tabIndex=0}
  if(countElement)countElement.textContent=String(visible.length);if(emptyElement)emptyElement.hidden=!!visible.length;host.hidden=!visible.length;renderSummary(document,summaryElement,descriptor.summary);
  return Object.freeze({owner:STRUCTURED_OUTLINE_HOST_CONTRACT.id,mode:descriptor.mode,visibleCount:visible.length,focusedId:focused?.dataset.treeId||null,selectedId:host.querySelector('.treeitem[aria-selected="true"]')?.dataset.treeId||null,empty:visible.length===0});
}

export function resolveStructuredOutlineKeyboardIntent({key,item,items,hasChildren=false,expanded=false,parentId=null}={}){
  const list=Array.isArray(items)?items:[],index=list.indexOf(item);
  if(!item||index<0)return Object.freeze({handled:false});
  if(key==='ArrowDown')return Object.freeze({handled:true,action:'focus',target:list[Math.min(list.length-1,index+1)]||item});
  if(key==='ArrowUp')return Object.freeze({handled:true,action:'focus',target:list[Math.max(0,index-1)]||item});
  if(key==='Home')return Object.freeze({handled:true,action:'focus',target:list[0]||item});
  if(key==='End')return Object.freeze({handled:true,action:'focus',target:list.at(-1)||item});
  if(key==='ArrowRight'&&hasChildren&&!expanded)return Object.freeze({handled:true,action:'expand',targetId:item.dataset.treeId});
  if(key==='ArrowRight'&&hasChildren&&expanded)return Object.freeze({handled:true,action:'focus',target:list[index+1]||item});
  if(key==='ArrowLeft'&&hasChildren&&expanded)return Object.freeze({handled:true,action:'collapse',targetId:item.dataset.treeId});
  if(key==='ArrowLeft'&&parentId)return Object.freeze({handled:true,action:'focus-id',targetId:parentId});
  if(key==='Enter'||key===' ')return Object.freeze({handled:true,action:'activate',targetId:item.dataset.treeId});
  return Object.freeze({handled:false});
}
