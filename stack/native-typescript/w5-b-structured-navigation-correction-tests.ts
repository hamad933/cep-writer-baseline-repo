import {STRUCTURED_TREE_KERNEL} from './foundation/structured.js';
import {StructuredNavigationDescriptorOwner,structuredNavigationDescriptorPolicy,restoreStructuredNavigationDescriptorPolicy} from './foundation/structured/outline-descriptor.js';

const clone=value=>structuredClone(value);
const assert=(condition,message)=>{if(!condition)throw Error(message)};
const run=(id,fn)=>{try{return {id,status:'PASS',evidence:fn()}}catch(error){return {id,status:'FAIL',error:String(error?.stack||error)}}};
const document=(id='doc-A',blocks=null)=>({id,revision:`${id}-rev-1`,title:id,blocks:blocks??[{id:`${id}-h1`,type:'h2',html:`Heading ${id}`},{id:`${id}-t1`,type:'toggle',titleHtml:`Toggle ${id}`,open:true,children:[]}]});
const ownerFor=(doc,identity={id:doc.id,committedRevision:doc.revision,workingRevision:1,owner:'TestIdentityOwner'})=>new StructuredNavigationDescriptorOwner({readDocument:()=>clone(doc),readIdentity:()=>clone(identity),treeKernel:STRUCTURED_TREE_KERNEL});
const expectError=(fn,code)=>{let caught=null;try{fn()}catch(error){caught=String(error?.message||error)}assert(caught===code,`expected ${code}; got ${caught}`);return caught};

export function runW5BStructuredNavigationCorrectionProof(){
  const originalPolicy=structuredNavigationDescriptorPolicy(),cases=[];
  try{
    cases.push(run('w5b.correction.document-identity-mismatch-rejected-everywhere',()=>{
      const doc=document('doc-A'),nav=new StructuredNavigationDescriptorOwner({readDocument:()=>clone(doc),readIdentity:()=>({id:'doc-B',committedRevision:'doc-B-rev-1',workingRevision:1,owner:'ContradictoryIdentity'}),treeKernel:STRUCTURED_TREE_KERNEL});
      const code='STRUCTURED_NAVIGATION_DOCUMENT_IDENTITY_MISMATCH';
      const results={outline:expectError(()=>nav.outline(),code),quickJump:expectError(()=>nav.quickJump(),code),readInspection:expectError(()=>nav.readInspection('doc-A-h1'),code),descriptor:expectError(()=>nav.descriptor(),code)};
      return {code,results,deterministic:Object.values(results).every(value=>value===code)};
    }));

    cases.push(run('w5b.correction.policy-restore-invalid-is-atomic',()=>{
      const before=structuredNavigationDescriptorPolicy(),beforeJson=JSON.stringify(before),invalid={...before,headingTypes:['h3'],includeTogglesInOutline:!before.includeTogglesInOutline,includeTogglesInQuickJump:!before.includeTogglesInQuickJump,requireContentLabel:!before.requireContentLabel,quickJumpLimit:0};
      const error=expectError(()=>restoreStructuredNavigationDescriptorPolicy(invalid),'INVALID_STRUCTURED_NAVIGATION_QUICK_JUMP_LIMIT'),after=structuredNavigationDescriptorPolicy();
      assert(JSON.stringify(after)===beforeJson,'invalid restore partially mutated policy');
      return {error,before,after,zeroMutation:JSON.stringify(after)===beforeJson};
    }));

    cases.push(run('w5b.correction.quick-jump-toggle-policy-independent-matrix',()=>{
      const doc=document('matrix-doc'),nav=ownerFor(doc),base=structuredNavigationDescriptorPolicy(),matrix=[];
      for(const includeTogglesInOutline of [false,true])for(const includeTogglesInQuickJump of [false,true]){
        restoreStructuredNavigationDescriptorPolicy({...base,includeTogglesInOutline,includeTogglesInQuickJump});
        const outline=nav.outline(),quickJump=nav.quickJump(),outlineHas=outline.entries.some(item=>item.kind==='toggle'),quickHas=quickJump.items.some(item=>item.kind==='toggle');
        assert(outlineHas===includeTogglesInOutline,`outline toggle policy mismatch ${includeTogglesInOutline}/${includeTogglesInQuickJump}`);
        assert(quickHas===includeTogglesInQuickJump,`quick-jump toggle policy mismatch ${includeTogglesInOutline}/${includeTogglesInQuickJump}`);
        matrix.push({includeTogglesInOutline,includeTogglesInQuickJump,outlineHasToggle:outlineHas,quickJumpHasToggle:quickHas});
      }
      restoreStructuredNavigationDescriptorPolicy(base);
      return {matrix,independent:true};
    }));

    cases.push(run('w5b.correction.malformed-numeric-entities-never-crash',()=>{
      const doc=document('entity-doc',[{id:'entity-h1',type:'h2',html:'Bad &#9999999999; entity · &#x110000; · &#xD800; · valid &#65; &#x42; — عربي English'}]),nav=ownerFor(doc),outline=nav.outline(),quick=nav.quickJump(),inspection=nav.readInspection('entity-h1');
      const expected='Bad &#9999999999; entity · &#x110000; · &#xD800; · valid A B — عربي English';
      assert(outline.entries[0]?.label===expected,'outline entity label incorrect');
      assert(quick.items[0]?.label===expected,'quick-jump entity label incorrect');
      assert(inspection.block?.label===expected,'read inspection entity label incorrect');
      return {label:expected,outlineLabel:outline.entries[0].label,quickJumpLabel:quick.items[0].label,inspectionLabel:inspection.block.label,validEntitiesDecoded:true,invalidEntitiesPreserved:true};
    }));

    cases.push(run('w5b.correction.combined-descriptor-single-coherent-snapshot',()=>{
      const docs=[document('doc-A'),document('doc-B')];let reads=0,lastId=null;
      const nav=new StructuredNavigationDescriptorOwner({readDocument:()=>{const doc=clone(docs[Math.min(reads,docs.length-1)]);reads++;lastId=doc.id;return doc},readIdentity:()=>({id:lastId,committedRevision:`${lastId}-rev-1`,workingRevision:reads,owner:'ChangingReaderIdentity'}),treeKernel:STRUCTURED_TREE_KERNEL});
      const combined=nav.descriptor();
      assert(reads===1,'combined descriptor read document more than once');
      assert(combined.outline.documentIdentity.documentId==='doc-A'&&combined.quickJump.documentIdentity.documentId==='doc-A','combined descriptor mixed document identities');
      assert(combined.outline.entries.every(item=>item.target.documentId==='doc-A')&&combined.quickJump.items.every(item=>item.target.documentId==='doc-A'),'combined descriptor mixed canonical targets');
      const standalone=nav.outline();
      assert(reads===2&&standalone.documentIdentity.documentId==='doc-B','standalone outline API no longer reads a fresh snapshot');
      return {combinedDocumentReads:1,combinedOutlineDocumentId:combined.outline.documentIdentity.documentId,combinedQuickJumpDocumentId:combined.quickJump.documentIdentity.documentId,standaloneNextDocumentId:standalone.documentIdentity.documentId,totalReadsAfterStandalone:reads};
    }));

    cases.push(run('w5b.correction.read-inspection-regression-codes',()=>{
      const doc=document('regression-doc'),nav=ownerFor(doc),nonRead=nav.readInspection('regression-doc-h1',{mode:'edit'}),unknown=nav.readInspection('missing-block',{mode:'read'});
      assert(nonRead.eligible===false&&nonRead.code==='READ_MODE_REQUIRED','non-read regression');
      assert(unknown.eligible===false&&unknown.code==='UNKNOWN_CANONICAL_BLOCK','unknown-block regression');
      return {nonRead:{eligible:nonRead.eligible,code:nonRead.code},unknown:{eligible:unknown.eligible,code:unknown.code}};
    }));

    cases.push(run('w5b.correction.quick-jump-limit-regression',()=>{
      const doc=document('limit-doc',[{id:'limit-h1',type:'h2',html:'H1'},{id:'limit-t1',type:'toggle',titleHtml:'T1',children:[]},{id:'limit-h2',type:'h3',html:'H2'},{id:'limit-t2',type:'toggle',titleHtml:'T2',children:[]}]),nav=ownerFor(doc),before=structuredNavigationDescriptorPolicy();
      restoreStructuredNavigationDescriptorPolicy({...before,quickJumpLimit:2,includeTogglesInQuickJump:true});
      const quick=nav.quickJump();
      assert(quick.count===2&&quick.items.length===2,'quick-jump limit not enforced');
      restoreStructuredNavigationDescriptorPolicy(before);
      return {limit:2,count:quick.count,ids:quick.items.map(item=>item.target.blockId)};
    }));

    cases.push(run('w5b.correction.library-learn-shape-compatible',()=>{
      const libraryDoc={id:'KU-D05-0021',revision:'library-rev',title:'Library correction fixture',blocks:[{id:'lib-h',type:'h2',html:'نطاق الحماية في واجهات API'},{id:'lib-t',type:'toggle',titleHtml:'التحقق من الهوية',children:[]}]},learnDoc={id:'learn-document-trust-boundaries',revision:'learn-rev',title:'Learn correction fixture',blocks:[{id:'learn-h',type:'h2',html:'حدود الثقة والتحقق'}]};
      const library=ownerFor(libraryDoc).descriptor(),learn=ownerFor(learnDoc).descriptor();
      assert(library.outline.documentIdentity.documentId==='KU-D05-0021'&&learn.outline.documentIdentity.documentId==='learn-document-trust-boundaries','real consumer identity shape regressed');
      return {library:{documentId:library.outline.documentIdentity.documentId,outline:library.outline.count,quickJump:library.quickJump.count},learn:{documentId:learn.outline.documentIdentity.documentId,outline:learn.outline.count,quickJump:learn.quickJump.count}};
    }));
  }finally{restoreStructuredNavigationDescriptorPolicy(originalPolicy)}
  const pass=cases.filter(item=>item.status==='PASS').length,fail=cases.length-pass;
  return {schemaVersion:1,kind:'W5_B_STRUCTURED_NAVIGATION_BOUNDED_CORRECTION_PROOF',status:fail?'FAIL':'PASS',pass,fail,cases,finalPolicy:structuredNavigationDescriptorPolicy()};
}
