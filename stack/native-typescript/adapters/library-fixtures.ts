import {BALANCED6_CLASSIFICATION,BALANCED6_TRUTH,BALANCED6_STRUCTURE_TREE,BALANCED6_DOCUMENTS} from './balanced6-acceptance-data.js';
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
   Only list-shaped source paragraphs are rewritten; prose and code are left untouched.

   Corpus syntax note (observed at source, not invented): the field lines are written
   `- **ku_id:** VALUE` — the colon sits INSIDE the bold run, so the label alternative below
   accepts both `**label:** VALUE` and `**label**: VALUE`. The previous pattern only accepted
   the second spelling, which is why the bullets still showed raw `**ku_id:**` markup. */
const esc=value=>String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const LIST_MARK=/^-\s+\*\*([^*]+?)(?::\*\*|\*\*:)\s*(.*)$/;
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
    const text=labelled?`<strong>${esc(labelled[1])}:</strong> <bdi dir="ltr">${esc(labelled[2])}</bdi>`:`<bdi dir="auto">${esc(plain[1])}</bdi>`;
    return {id:`${block.id}-b${index+1}`,type:'bullet',html:text};
  });
  return children.length===1?children[0]:children;
};

/* DEF-04 (second half): the corpus keeps markdown PIPE TABLES inside single paragraph blocks,
   so `|---|` separator rows paint as literal body text when the section is opened. A pipe
   table is source markup, not prose — the accepted Library donor already renders markdown
   source in a `code` block (see `src-*-raw`), so the table is normalised into exactly that
   block shape with identical content and the same block id. */
const TABLE_ROW=/^\s*\|/;
const TABLE_SEP=/^\s*\|?\s*:?-{2,}:?(\s*\|\s*:?-{2,}:?)+\s*\|?\s*$/;
const rewriteTableParagraph=(block)=>{
  if(block?.type!=='paragraph'||typeof block.html!=='string')return block;
  if(!String(block.id||'').startsWith('src-'))return block;
  const lines=block.html.split(/<br\s*\/?>/i).map(line=>line.trim()).filter(Boolean);
  if(lines.length<2||!lines.every(line=>TABLE_ROW.test(line)))return block;
  if(!lines.some(line=>TABLE_SEP.test(line)))return block;
  const raw=lines.join('\n');
  return {id:block.id,type:'code',html:raw,codeText:raw,annotations:[],language:'text',dir:'ltr'};
};

/* Both rewriters return the ORIGINAL block when they do not apply, so "did anything change?"
   must be an identity test — a truthy `block` from the table rewriter must never short-circuit
   the list rewriter. */
const rewriteParagraph=(block)=>{
  const asTable=rewriteTableParagraph(block);
  if(asTable!==block)return asTable;
  return rewriteListParagraph(block);
};
const normalizeBlocks=(blocks)=>(blocks||[]).flatMap(block=>{
  const rewritten=rewriteParagraph(block);
  if(rewritten===block){
    if(block?.children?.length)return [{...block,children:normalizeBlocks(block.children)}];
    return [block];
  }
  return Array.isArray(rewritten)?rewritten:[rewritten];
});
/* DEF-07 (right-pane statistic grid): the five-cell grid is projected straight from these
   fixture fields, but the corpus records a unit's declared relations only inside that unit's
   markdown `## Relationships` block — so four of six units reported `relations: 0` even where
   the source does declare them. Only relations the source itself declares are lifted here
   (related / prerequisites / supersedes / `- related:` prose lines). `labs`, `projects`
   and `evidence` are left EXACTLY as the corpus states them: the Balanced6 acceptance corpus
   declares none, Evidence admission requires a verifier, and inventing counts would be a false
   receipt. Those three cells stay truthful zeros and are recorded as residual. */
const REL_JSON=/##\s*Relationships[^\n]*\n+```json\s*([\s\S]*?)```/;
const REL_LINE=/^-\s*(related|prerequisites?|supersedes)\s*:\s*([^\s(]+)/i;
const declaredRelations=(doc)=>{
  const found=new Map();
  const add=(target,kind)=>{
    const value=String(target||'').replace(/[.,;]$/,'');
    if(!value||value.includes('`'))return;
    const key=`${kind}|${value}`;
    if(!found.has(key))found.set(key,{label:`Source-declared ${kind.replace('SOURCE_DECLARED_','').toLowerCase().replace(/_/g,' ')}`,target:value,kind});
  };
  const md=String(doc.sourceMarkdown||'');
  const json=REL_JSON.exec(md);
  if(json){
    try{
      const rel=JSON.parse(json[1]);
      /* navigational declarations only: `conflicts_with` / `variants` point at conflict and
         variant RECORD ids, not at units, and belong to the document body's own
         "Conflicts and variants" section — they are not relation-lens navigation. */
      (rel.related||[]).forEach(t=>add(t,'SOURCE_DECLARED_RELATED'));
      (rel.prerequisites||[]).forEach(t=>add(t,'SOURCE_DECLARED_PREREQUISITE'));
      (rel.supersedes||[]).forEach(t=>add(t,'SOURCE_DECLARED_SUPERSEDES'));
    }catch{/* not JSON — the prose form below still applies */}
  }
  md.split('\n').forEach(line=>{const hit=REL_LINE.exec(line.trim());if(hit)add(hit[2],`SOURCE_DECLARED_${hit[1].toUpperCase()}`)});
  return [...found.values()];
};
const mergeRelations=(doc)=>{
  const seen=new Set((doc.relations||[]).map(r=>String(r.target||'')));
  const merged=[...(doc.relations||[])];
  for(const relation of declaredRelations(doc)){
    const target=String(relation.target||'');
    if(!target||seen.has(target))continue;
    seen.add(target);
    merged.push(relation);
  }
  return merged;
};
export const FIXTURES=Object.fromEntries(Object.entries(BALANCED6_DOCUMENTS).map(([id,doc])=>[
  id,{...doc,relations:mergeRelations(doc),blocks:normalizeBlocks(doc.blocks)}
]));

export const NOTE_FIXTURES=[
 {id:'note-001',title:'tenant_id لا يكفي وحده',status:'مسودة سياقية',binding:{kuId:'KU-D05-0021',blockId:'blk-d05-p1',selection:'subject_id ↔ object_id',route:'PERSONAL:CEP/W02/Library'},working:{blocks:[{id:'note-001-p1',type:'paragraph',html:'تذكير: لا تستخدم <bdi dir="ltr">tenant_id</bdi> كبديل عن فحص ملكية الكائن. English note: verify object ownership before response.'}],history:[],historyIndex:-1,selectedBlock:null,caret:null,dirty:false,recovery:false},window:{x:820,y:230,width:360,height:330,floating:true,minimized:false,pinned:false,closed:true}},
 {id:'note-002',title:'رابط التحقق من السياسة',status:'ملاحظة ممثّلة',binding:{kuId:'KU-D03-0011',blockId:'blk-d03-p1',selection:null,route:'PERSONAL:CEP/W02/Library'},working:{blocks:[{id:'note-002-p1',type:'paragraph',html:'راجع <bdi dir="ltr">policy.can()</bdi> مع <bdi dir="ltr">aud</bdi> و <bdi dir="ltr">scope</bdi>.'}],history:[],historyIndex:-1,selectedBlock:null,caret:null,dirty:false,recovery:false},window:{x:760,y:210,width:350,height:310,floating:true,minimized:false,pinned:false,closed:true}}
];

