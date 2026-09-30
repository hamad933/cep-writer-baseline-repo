import {createStructuredOutlinePresentationDescriptor} from '../foundation/structured/outline-descriptor.js';

export const LIBRARY_OUTLINE_DESCRIPTOR_CONTRACT=Object.freeze({
  id:'LibraryOutlineDescriptorAdapter',
  version:'1.0.0',
  owner:'LibraryDomainAdapter',
  role:'THIN_DATA_LABEL_SEARCH_PROJECTION',
  ownsPresentation:false,
  ownsSearchRanking:false,
  ownsRouteMutation:false,
  ownsQuickJump:false
});

const includesQuery=(node,query)=>{
  if(!query)return true;
  const haystack=`${node?.label||''} ${node?.meta||''} ${node?.ku||''}`.toLocaleLowerCase();
  if(haystack.includes(String(query).toLocaleLowerCase()))return true;
  return !!node?.children?.some(child=>includesQuery(child,query));
};
const categoryFromMeta=(meta,targetId)=>String(meta||'').replace(String(targetId||''),'').replace(/^\s*[·—-]\s*/,'').trim();
const iconForKind=kind=>kind==='ku'?'i-shield':kind==='capability'?'i-list':'i-folder';

export function projectLibraryHierarchyNode(node,{query='',activeTargetId=null,activePathIds=new Set(),expandedIds=new Set(),focusedId=null}={}){
  const visibleChildren=(node.children||[]).filter(child=>includesQuery(child,query));
  const forceExpanded=!!query&&visibleChildren.length>0,isLeaf=!node.children?.length,targetId=node.ku||null,category=targetId?categoryFromMeta(node.meta,targetId):'';
  return {
    id:node.id,
    kind:node.kind||'item',
    label:node.label||'',
    iconKey:iconForKind(node.kind),
    secondary:targetId?[{text:targetId,direction:'ltr',element:'bdi'},...(category?[{text:category,direction:'auto',element:'small'}]:[])]:[],
    statusText:'',
    countText:node.children?.length?String(node.children.length):'',
    selected:targetId===activeTargetId,
    current:targetId===activeTargetId,
    onActivePath:activePathIds.has(node.id),
    expanded:!isLeaf&&expandedIds.has(node.id),
    forceExpanded,
    focused:node.id===focusedId,
    activationDataset:targetId?{ku:targetId}:{},
    children:visibleChildren.map(child=>projectLibraryHierarchyNode(child,{query,activeTargetId,activePathIds,expandedIds,focusedId}))
  };
}

export function createLibraryHierarchyOutlineDescriptor({tree=[],query='',activeTargetId=null,activePath=[],expandedIds=new Set(),focusedId=null}={}){
  const pathIds=new Set((activePath||[]).map(node=>node.id)),visibleRoots=(tree||[]).filter(node=>includesQuery(node,query));
  return createStructuredOutlinePresentationDescriptor({
    mode:'hierarchy',
    ariaLabel:'شجرة المعرفة الهرمية',
    query,
    focusId:focusedId,
    nodes:visibleRoots.map(node=>projectLibraryHierarchyNode(node,{query,activeTargetId,activePathIds:pathIds,expandedIds,focusedId})),
    summary:{kind:'path',labels:(activePath||[]).map(node=>node.label).slice(-3),title:(activePath||[]).map(node=>node.label).join(' › ')}
  });
}

export function createLibrarySearchOutlineDescriptor({rows=[],activeTargetId=null,focusedId=null,resolvePath=()=>[],readMeta=()=>({})}={}){
  const nodes=(rows||[]).map((row,index)=>{
    const path=resolvePath(row.ku)||[],leaf=path.at(-1),meta=readMeta(row.ku)||{};
    return {
      id:leaf?.id||`search-${row.ku}`,
      kind:'ku',
      label:row.title||row.ku,
      iconKey:'i-shield',
      secondary:[{text:row.ku,direction:'ltr',element:'bdi'},...(row.domainLabel?[{text:row.domainLabel,direction:'auto',element:'small'}]:[])],
      statusText:`${meta.favorite?'★':''}${meta.completed?'✓':''}`,
      statusClass:'library-result-state',
      countText:null,
      selected:row.ku===activeTargetId,
      current:row.ku===activeTargetId,
      onActivePath:false,
      expanded:false,
      forceExpanded:false,
      focused:index===0&&focusedId==null||leaf?.id===focusedId,
      variantClass:'library-result',
      activationDataset:{ku:row.ku},
      children:[]
    };
  });
  return createStructuredOutlinePresentationDescriptor({mode:'results',ariaLabel:'نتائج بحث المكتبة المرتبة',query:'',focusId:focusedId,nodes,summary:{kind:'count',text:`${nodes.length} نتيجة مرتبة`}});
}
