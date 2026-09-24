import {STRUCTURED_TREE_KERNEL} from './foundation/structured.js';
import {deriveStructuredReadInspectionDescriptor,validateStructuredNavigationIdentity} from './foundation/structured/read-inspection.js';
import {StructuredNavigationDescriptorOwner} from './foundation/structured/outline-descriptor.js';

const clone=value=>structuredClone(value);
const assert=(condition,message)=>{if(!condition)throw Error(message)};
const run=(id,fn)=>{try{return {id,status:'PASS',evidence:fn()}}catch(error){return {id,status:'FAIL',error:String(error?.stack||error)}}};
const document=()=>({id:'micro3-doc',revision:'micro3-rev-1',title:'Micro correction working revision',blocks:[{id:'micro3-h1',type:'h2',html:'Heading'},{id:'micro3-p1',type:'paragraph',html:'Body'}]});
const identity=(workingRevision)=>({id:'micro3-doc',committedRevision:'micro3-rev-1',workingRevision,owner:'Micro3IdentityOwner'});
const expectError=(fn,code)=>{let caught=null;try{fn()}catch(error){caught=String(error?.message||error)}assert(caught===code,`expected ${code}; got ${caught}`);return caught};
const ownerFor=workingRevision=>new StructuredNavigationDescriptorOwner({readDocument:()=>clone(document()),readIdentity:()=>clone(identity(workingRevision)),treeKernel:STRUCTURED_TREE_KERNEL});

export function runW5BStructuredNavigationMicro3Proof(){
  const cases=[];
  cases.push(run('w5b.micro3.negative-working-revision-rejected',()=>({error:expectError(()=>validateStructuredNavigationIdentity(document(),identity(-1)),'INVALID_STRUCTURED_NAVIGATION_WORKING_REVISION')})));
  cases.push(run('w5b.micro3.fractional-working-revision-rejected',()=>({error:expectError(()=>validateStructuredNavigationIdentity(document(),identity(1.5)),'INVALID_STRUCTURED_NAVIGATION_WORKING_REVISION')})));
  cases.push(run('w5b.micro3.previously-invalid-noncanonical-types-remain-rejected',()=>{
    const values=['2',Number.NaN,Number.POSITIVE_INFINITY,true,[],{}];
    return {checks:values.map(value=>({kind:Array.isArray(value)?'array':typeof value,error:expectError(()=>validateStructuredNavigationIdentity(document(),identity(value)),'INVALID_STRUCTURED_NAVIGATION_WORKING_REVISION')}))};
  }));
  cases.push(run('w5b.micro3.null-working-revision-remains-valid',()=>{
    const normalized=validateStructuredNavigationIdentity(document(),identity(null));assert(normalized.workingRevision===null,'null workingRevision changed');return {workingRevision:normalized.workingRevision};
  }));
  cases.push(run('w5b.micro3.valid-safe-integers-accepted-unchanged',()=>{
    const values=[0,1,2,42,Number.MAX_SAFE_INTEGER];
    for(const value of values){const normalized=validateStructuredNavigationIdentity(document(),identity(value));assert(normalized.workingRevision===value,`workingRevision changed: ${value}`)}
    return {values};
  }));
  cases.push(run('w5b.micro3.direct-helper-rejects-negative-and-fractional',()=>{
    const d=document(),checks=[];
    for(const value of [-1,1.5])checks.push({value,error:expectError(()=>deriveStructuredReadInspectionDescriptor({treeKernel:STRUCTURED_TREE_KERNEL,document:d,identity:identity(value),blockId:'micro3-h1',mode:'read'}),'INVALID_STRUCTURED_NAVIGATION_WORKING_REVISION')});
    return {checks};
  }));
  cases.push(run('w5b.micro3.owner-apis-share-central-negative-validation',()=>{
    const checks=[];
    for(const api of ['outline','quickJump','readInspection','descriptor']){
      const nav=ownerFor(-1),invoke=api==='readInspection'?()=>nav.readInspection('micro3-h1'):()=>nav[api]();
      checks.push({api,error:expectError(invoke,'INVALID_STRUCTURED_NAVIGATION_WORKING_REVISION')});
    }
    return {checks};
  }));
  cases.push(run('w5b.micro3.owner-apis-share-central-fractional-validation',()=>{
    const checks=[];
    for(const api of ['outline','quickJump','readInspection','descriptor']){
      const nav=ownerFor(1.5),invoke=api==='readInspection'?()=>nav.readInspection('micro3-h1'):()=>nav[api]();
      checks.push({api,error:expectError(invoke,'INVALID_STRUCTURED_NAVIGATION_WORKING_REVISION')});
    }
    return {checks};
  }));
  cases.push(run('w5b.micro3.valid-owner-provenance-preserved',()=>{
    const nav=ownerFor(7),combined=nav.descriptor();
    assert(combined.outline.documentIdentity.workingRevision===7,'outline revision changed');
    assert(combined.quickJump.documentIdentity.workingRevision===7,'quickJump revision changed');
    const inspection=nav.readInspection('micro3-h1');assert(inspection.documentIdentity.workingRevision===7,'readInspection revision changed');
    return {workingRevision:7,outline:combined.outline.documentIdentity,quickJump:combined.quickJump.documentIdentity,inspection:inspection.documentIdentity};
  }));
  const pass=cases.filter(item=>item.status==='PASS').length,fail=cases.length-pass;
  return {schemaVersion:1,kind:'W5_B_STRUCTURED_NAVIGATION_CORRECTED2_MICRO3_PROOF',status:fail?'FAIL':'PASS',pass,fail,cases};
}
