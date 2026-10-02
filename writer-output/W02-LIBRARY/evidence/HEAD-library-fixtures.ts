import {BALANCED6_CLASSIFICATION,BALANCED6_TRUTH,BALANCED6_STRUCTURE_TREE,BALANCED6_DOCUMENTS} from '../../../dist/adapters/balanced6-acceptance-data.js';
export const LIBRARY_FIXTURE_CLASSIFICATION=BALANCED6_CLASSIFICATION;
export const LIBRARY_FIXTURE_TRUTH=BALANCED6_TRUTH;
export const libraryFixtureDescriptor=()=>Object.freeze({classification:LIBRARY_FIXTURE_CLASSIFICATION,truth:LIBRARY_FIXTURE_TRUTH,realConsumer:true,role:'SOURCE_GROUNDED_BALANCED6_LOCAL_ACCEPTANCE'});

/* Library owns its outline composition. The donor corpus nests a single cluster level between
   domain and knowledge unit; the outline projects `countText = children.length`, so that level
   made every domain badge read "1" no matter how many units it holds (W02-LIBRARY DEF-02).
   Flattening domain → knowledge unit keeps the domain ids used by the scope filter, keeps every
   KU id used by routing/quick-jump, and makes the badge equal the unit count (3 / 2 / 1).
   The cluster truth is not lost: it stays searchable in `meta` and is stated in the pane corpus
   summary through LIBRARY_FIXTURE_CLASSIFICATION. */
const flattenDomainOutline=tree=>(tree||[]).map(domain=>({
  ...domain,
  meta:`${domain.meta||''} · Balanced6 source-grounded acceptance set`.replace(/^\s*·\s*/,'').trim(),
  children:(domain.children||[]).flatMap(cluster=>(cluster.children||[])).map(ku=>ku?.ku?{...ku,label:String(ku.label||ku.ku).replace(new RegExp(`^${ku.ku}\\s*[—–-]\\s*`),'')}:ku)
}));
export const STRUCTURE_TREE=flattenDomainOutline(BALANCED6_STRUCTURE_TREE);

/* The corpus stores markdown list lines inside single paragraph blocks, so the editor paints
   literal "- **ku_id:** …" source markup as body text (W02-LIBRARY DEF-04). The Library fixture
   boundary is the right place to normalise that: same content, same ids, real block types.
   Only list-shaped paragraphs are rewritten; prose, tables and code are left untouched. */
const LIST_MARK=/^-\s+\*\*([^*]+?)\*\*:\s*(.*)$/;
const BULLET_MARK=new RegExp('^-\\s+(.+)$');
const rewriteListParagraph=(block)=>{
  if(block?.type!=='paragraph'||typeof block.html!=='string')return block;
  /* only source-bound corpus paragraphs are normalised; `blk-*` blocks are the shared editor
     test corpus and must keep their exact ids and content. */
  if(!String(block.id||'').startsWith('src-'))return block;
  const lines=block.html.split(/<br\s*\/?>/i).map(line=>line.trim());
  if(!lines.length||!lines.every(line=>LIST_MARK.test(line)||BULLET_MARK.test(line)))return block;
  const children=lines.map((line,index)=>{
    const labelled=line.match(LIST_MARK);
    const plain=line.match(BULLET_MARK);
    const text=labelled?`<strong>${labelled[1]}:</strong> <bdi dir="ltr">${labelled[2]}</bdi>`:`<bdi dir="auto">${plain[1]}</bdi>`;
    return {id:`${block.id}-b${index+1}`,type:'bullet',html:text};
  });
  return children.length===1?children[0]:children;
};
const normalizeBlocks=(blocks)=>(blocks||[]).flatMap(block=>{
  const rewritten=rewriteListParagraph(block);
  if(rewritten===block){
    if(block?.children?.length)return [{...block,children:normalizeBlocks(block.children)}];
    return [block];
  }
  return Array.isArray(rewritten)?rewritten:[rewritten];
});
export const FIXTURES=Object.fromEntries(Object.entries(BALANCED6_DOCUMENTS).map(([id,doc])=>[
  id,{...doc,blocks:normalizeBlocks(doc.blocks)}
]));

export const NOTE_FIXTURES=[
 {id:'note-001',title:'tenant_id لا يكفي وحده',status:'مسودة سياقية',binding:{kuId:'KU-D05-0021',blockId:'blk-d05-p1',selection:'subject_id ↔ object_id',route:'PERSONAL:CEP/W02/Library'},working:{blocks:[{id:'note-001-p1',type:'paragraph',html:'تذكير: لا تستخدم <bdi dir="ltr">tenant_id</bdi> كبديل عن فحص ملكية الكائن. English note: verify object ownership before response.'}],history:[],historyIndex:-1,selectedBlock:null,caret:null,dirty:false,recovery:false},window:{x:820,y:230,width:360,height:330,floating:true,minimized:false,pinned:false,closed:true}},
 {id:'note-002',title:'رابط التحقق من السياسة',status:'ملاحظة ممثّلة',binding:{kuId:'KU-D03-0011',blockId:'blk-d03-p1',selection:null,route:'PERSONAL:CEP/W02/Library'},working:{blocks:[{id:'note-002-p1',type:'paragraph',html:'راجع <bdi dir="ltr">policy.can()</bdi> مع <bdi dir="ltr">aud</bdi> و <bdi dir="ltr">scope</bdi>.'}],history:[],historyIndex:-1,selectedBlock:null,caret:null,dirty:false,recovery:false},window:{x:760,y:210,width:350,height:310,floating:true,minimized:false,pinned:false,closed:true}}
];

