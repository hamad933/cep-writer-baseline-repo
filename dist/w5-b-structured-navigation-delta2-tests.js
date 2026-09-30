import {createStructuredConsumerAdapter} from './adapters/structured-documents.js';
import {STRUCTURED_TREE_KERNEL} from './foundation/structured.js';
import {deriveStructuredReadInspectionDescriptor,structuredNavigationPlainText} from './foundation/structured/read-inspection.js';
import {StructuredNavigationDescriptorOwner,restoreStructuredNavigationDescriptorPolicy,structuredNavigationDescriptorPolicy} from './foundation/structured/outline-descriptor.js';

const clone=value=>structuredClone(value);
const assert=(condition,message)=>{if(!condition)throw Error(message)};
const run=(id,fn)=>{try{return {id,status:'PASS',evidence:fn()}}catch(error){return {id,status:'FAIL',error:String(error?.stack||error)}}};
const doc=(id='delta-doc',overrides={})=>({id,revision:`${id}-rev-1`,title:`Title ${id}`,blocks:[{id:`${id}-h1`,type:'h2',html:`Heading ${id}`}],...overrides});
const identityFor=document=>({id:document.id,committedRevision:document.revision,workingRevision:1,owner:'DeltaIdentityOwner'});
const ownerFor=(document,identity=identityFor(document),extra={})=>new StructuredNavigationDescriptorOwner({readDocument:()=>clone(document),readIdentity:()=>clone(identity),treeKernel:STRUCTURED_TREE_KERNEL,...extra});
const expectError=(fn,code)=>{let caught=null;try{fn()}catch(error){caught=String(error?.message||error)}assert(caught===code,`expected ${code}; got ${caught}`);return caught};
const assertAtomicReject=(before,invalid,code)=>{const beforeJson=JSON.stringify(before),error=expectError(()=>restoreStructuredNavigationDescriptorPolicy(invalid),code),after=structuredNavigationDescriptorPolicy();assert(JSON.stringify(after)===beforeJson,`policy changed after ${code}`);return {error,unchanged:true,after}};
const fakeTreeKernel=()=>({owner:'StructuredTreeKernel',contract:STRUCTURED_TREE_KERNEL.contract,validate:(...args)=>STRUCTURED_TREE_KERNEL.validate(...args),walk:(...args)=>STRUCTURED_TREE_KERNEL.walk(...args),findRef:(...args)=>STRUCTURED_TREE_KERNEL.findRef(...args),pathFor:()=>['FAKE_PATH']});

export function runW5BStructuredNavigationDelta2Proof(){
  const originalPolicy=structuredNavigationDescriptorPolicy(),cases=[];
  try{
    cases.push(run('w5b.delta2.policy-nonboolean-and-heading-types-reject-atomically',()=>{
      const before=structuredNavigationDescriptorPolicy(),checks=[];
      checks.push(assertAtomicReject(before,{...before,includeTogglesInOutline:'false'},'STRUCTURED_NAVIGATION_POLICY_BOOLEAN_REQUIRED'));
      checks.push(assertAtomicReject(before,{...before,includeTogglesInQuickJump:1},'STRUCTURED_NAVIGATION_POLICY_BOOLEAN_REQUIRED'));
      checks.push(assertAtomicReject(before,{...before,requireContentLabel:null},'STRUCTURED_NAVIGATION_POLICY_BOOLEAN_REQUIRED'));
      checks.push(assertAtomicReject(before,{...before,headingTypes:['h2',3]},'STRUCTURED_NAVIGATION_HEADING_TYPE_STRING_REQUIRED'));
      return {checks,final:structuredNavigationDescriptorPolicy()};
    }));

    cases.push(run('w5b.delta2.quick-jump-limit-type-rejects-atomically',()=>{
      const before=structuredNavigationDescriptorPolicy(),checks=[];
      for(const value of ['18',true,null,18.5])checks.push({value,...assertAtomicReject(before,{...before,quickJumpLimit:value},'INVALID_STRUCTURED_NAVIGATION_QUICK_JUMP_LIMIT')});
      return {checks};
    }));

    cases.push(run('w5b.delta2.full-policy-missing-fields-reject-atomically',()=>{
      const before=structuredNavigationDescriptorPolicy(),checks=[];
      for(const key of ['headingTypes','includeTogglesInOutline','includeTogglesInQuickJump','requireContentLabel','quickJumpLimit']){
        const invalid={...before};delete invalid[key];checks.push({missing:key,...assertAtomicReject(before,invalid,'STRUCTURED_NAVIGATION_POLICY_SNAPSHOT_INCOMPLETE')});
      }
      return {checks};
    }));

    cases.push(run('w5b.delta2.malformed-committed-revision-rejected',()=>{
      const document=doc('identity-committed'),identity={...identityFor(document),committedRevision:{bad:true}},nav=ownerFor(document,identity);
      return {error:expectError(()=>nav.outline(),'INVALID_STRUCTURED_NAVIGATION_COMMITTED_REVISION')};
    }));

    cases.push(run('w5b.delta2.malformed-working-revision-rejected',()=>{
      const document=doc('identity-working'),identity={...identityFor(document),workingRevision:['bad']},nav=ownerFor(document,identity);
      return {error:expectError(()=>nav.quickJump(),'INVALID_STRUCTURED_NAVIGATION_WORKING_REVISION')};
    }));

    cases.push(run('w5b.delta2.malformed-owner-and-id-provenance-rejected',()=>{
      const document=doc('identity-owner'),badOwner=ownerFor(document,{...identityFor(document),owner:123}),badId=ownerFor(document,{...identityFor(document),id:123});
      return {ownerError:expectError(()=>badOwner.descriptor(),'INVALID_STRUCTURED_NAVIGATION_IDENTITY_OWNER'),idError:expectError(()=>badId.descriptor(),'INVALID_STRUCTURED_NAVIGATION_IDENTITY_ID')};
    }));

    cases.push(run('w5b.delta2.document-missing-title-rejected',()=>{
      const document=doc('missing-title');delete document.title;const nav=ownerFor(document,identityFor(document));
      return {error:expectError(()=>nav.outline(),'INVALID_STRUCTURED_DOCUMENT')};
    }));

    cases.push(run('w5b.delta2.document-missing-revision-rejected',()=>{
      const document=doc('missing-revision');delete document.revision;const nav=new StructuredNavigationDescriptorOwner({readDocument:()=>clone(document),readIdentity:()=>({id:document.id,workingRevision:1,owner:'DeltaIdentityOwner'}),treeKernel:STRUCTURED_TREE_KERNEL});
      return {error:expectError(()=>nav.quickJump(),'STRUCTURED_DOCUMENT_REVISION_REQUIRED')};
    }));

    cases.push(run('w5b.delta2.document-wrong-title-type-rejected',()=>{
      const document=doc('wrong-title',{title:{bad:true}}),nav=ownerFor(document,identityFor(document));
      return {error:expectError(()=>nav.descriptor(),'INVALID_STRUCTURED_DOCUMENT')};
    }));

    cases.push(run('w5b.delta2.document-id-and-blocks-contract-preserved',()=>{
      const missingId=doc('missing-id');delete missingId.id;
      const badBlocks=doc('bad-blocks',{blocks:{not:'array'}});
      const navId=new StructuredNavigationDescriptorOwner({readDocument:()=>clone(missingId),readIdentity:()=>({}),treeKernel:STRUCTURED_TREE_KERNEL});
      const navBlocks=new StructuredNavigationDescriptorOwner({readDocument:()=>clone(badBlocks),readIdentity:()=>identityFor(badBlocks),treeKernel:STRUCTURED_TREE_KERNEL});
      return {idError:expectError(()=>navId.outline(),'STRUCTURED_DOCUMENT_ID_REQUIRED'),blocksError:expectError(()=>navBlocks.outline(),'INVALID_STRUCTURED_DOCUMENT')};
    }));

    cases.push(run('w5b.delta2.direct-helper-document-identity-contradiction-rejected',()=>{
      const adapter=createStructuredConsumerAdapter('learn'),document=adapter.snapshot();
      const error=expectError(()=>deriveStructuredReadInspectionDescriptor({treeKernel:STRUCTURED_TREE_KERNEL,document,identity:{id:'OTHER',workingRevision:99,owner:'Other'},blockId:'learn-h1',mode:'read'}),'STRUCTURED_NAVIGATION_DOCUMENT_IDENTITY_MISMATCH');
      return {documentId:document.id,error};
    }));

    cases.push(run('w5b.delta2.fake-same-name-tree-kernel-rejected',()=>{
      const document=doc('fake-tree'),fake=fakeTreeKernel();
      const error=expectError(()=>new StructuredNavigationDescriptorOwner({readDocument:()=>clone(document),readIdentity:()=>identityFor(document),treeKernel:fake}),'CANONICAL_STRUCTURED_TREE_KERNEL_REQUIRED');
      return {fakeOwner:fake.owner,error};
    }));

    cases.push(run('w5b.delta2.adapter-different-overriding-tree-kernel-rejected',()=>{
      const adapter=createStructuredConsumerAdapter('learn'),fake=fakeTreeKernel();
      const error=expectError(()=>new StructuredNavigationDescriptorOwner({adapter,treeKernel:fake}),'STRUCTURED_NAVIGATION_ADAPTER_TREE_KERNEL_MISMATCH');
      return {adapterTreeIsCanonical:adapter.treeKernel===STRUCTURED_TREE_KERNEL,fakeOwner:fake.owner,error};
    }));

    cases.push(run('w5b.delta2.helper-fake-tree-authority-rejected',()=>{
      const adapter=createStructuredConsumerAdapter('learn'),document=adapter.snapshot(),fake=fakeTreeKernel();
      const error=expectError(()=>deriveStructuredReadInspectionDescriptor({treeKernel:fake,document,identity:adapter.identity(),blockId:'learn-h1'}),'CANONICAL_STRUCTURED_TREE_KERNEL_REQUIRED');
      return {fakeOwner:fake.owner,error};
    }));

    cases.push(run('w5b.delta2.numeric-control-entities-never-emit-controls',()=>{
      const input='A&#0;B &#1; C &#31; D &#127; E &#128; F &#x9F; G &#9; H &#10; I',output=structuredNavigationPlainText(input),controls=/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u;
      assert(!controls.test(output),'navigation label emitted a C0/C1 control scalar');
      for(const entity of ['&#0;','&#1;','&#31;','&#127;','&#128;','&#x9F;'])assert(output.includes(entity),`unsafe control entity not preserved: ${entity}`);
      assert(output.includes('G H I'),'valid tab/newline whitespace did not normalize safely');
      return {input,output,containsControlScalar:controls.test(output),unsafeEntitiesPreserved:true,whitespaceNormalized:true};
    }));

    cases.push(run('w5b.delta2.printable-numeric-entities-decode',()=>{
      const output=structuredNavigationPlainText('ASCII &#65; &#x42; © &#169; عربي &#x627;');
      assert(output==='ASCII A B © © عربي ا',`printable numeric entities failed: ${output}`);
      return {output};
    }));

    cases.push(run('w5b.delta2.out-of-range-and-surrogate-entities-remain-safe',()=>{
      const input='Bad &#9999999999; &#x110000; &#xD800; valid &#65;',output=structuredNavigationPlainText(input);
      assert(output==='Bad &#9999999999; &#x110000; &#xD800; valid A','previous malformed entity safety regressed');
      return {input,output,noCrash:true};
    }));

    cases.push(run('w5b.delta2.single-snapshot-combined-descriptor-remains-pass',()=>{
      const docs=[doc('snapshot-A'),doc('snapshot-B')];let reads=0,lastId=null;
      const nav=new StructuredNavigationDescriptorOwner({readDocument:()=>{const document=clone(docs[Math.min(reads,docs.length-1)]);reads++;lastId=document.id;return document},readIdentity:()=>({id:lastId,committedRevision:`${lastId}-rev-1`,workingRevision:reads,owner:'ChangingReaderIdentity'}),treeKernel:STRUCTURED_TREE_KERNEL});
      const combined=nav.descriptor();
      assert(reads===1,'combined descriptor read more than one document snapshot');
      assert(combined.outline.documentIdentity.documentId==='snapshot-A'&&combined.quickJump.documentIdentity.documentId==='snapshot-A','combined descriptor mixed snapshots');
      const standalone=nav.outline();assert(reads===2&&standalone.documentIdentity.documentId==='snapshot-B','standalone API did not acquire a fresh snapshot');
      return {combinedReads:1,combinedDocumentId:combined.outline.documentIdentity.documentId,standaloneDocumentId:standalone.documentIdentity.documentId,totalReads:reads};
    }));
  }finally{restoreStructuredNavigationDescriptorPolicy(originalPolicy)}
  const pass=cases.filter(item=>item.status==='PASS').length,fail=cases.length-pass;
  return {schemaVersion:1,kind:'W5_B_STRUCTURED_NAVIGATION_POST_CORRECTION_DELTA2_PROOF',status:fail?'FAIL':'PASS',pass,fail,cases,finalPolicy:structuredNavigationDescriptorPolicy()};
}
