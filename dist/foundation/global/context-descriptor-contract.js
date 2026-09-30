export const CONTEXT_DESCRIPTOR_CONTRACT=Object.freeze({
  id:'ContextDescriptorContract',
  version:'1.0.0',
  compatibility:'SEMVER',
  owner:'ContextInspectorHost',
  policyTag:'presentation-projection-only-v1',
  limits:Object.freeze({lenses:8,tabsPerLens:8,fieldsPerTab:24})
});

const IDENTIFIER=/^[A-Za-z0-9][A-Za-z0-9._:+-]{0,127}$/;
const nonEmpty=value=>typeof value==='string'&&value.trim().length>0;
const identifier=(value,code)=>{if(!nonEmpty(value)||!IDENTIFIER.test(value))throw Error(code);return value;};
const primitive=value=>value===null||['string','number','boolean'].includes(typeof value);
const freezeArray=value=>Object.freeze([...value]);

export function defineContextDescriptorProvider({id,family,owner,describe,isApplicable=()=>true}){
  identifier(id,'CONTEXT_PROVIDER_ID_INVALID');
  identifier(family,'CONTEXT_PROVIDER_FAMILY_INVALID');
  if(!nonEmpty(owner))throw Error('CONTEXT_PROVIDER_OWNER_REQUIRED');
  if(typeof describe!=='function'||typeof isApplicable!=='function')throw Error('CONTEXT_PROVIDER_FUNCTION_REQUIRED');
  return Object.freeze({contract:CONTEXT_DESCRIPTOR_CONTRACT,id,family,owner,describe,isApplicable});
}

function normalizeField(field,index){
  if(!field||typeof field!=='object')throw Error(`CONTEXT_FIELD_INVALID:${index}`);
  const id=identifier(field.id||`field-${index+1}`,`CONTEXT_FIELD_ID_INVALID:${index}`);
  if(!nonEmpty(field.label))throw Error(`CONTEXT_FIELD_LABEL_REQUIRED:${id}`);
  if(!primitive(field.value))throw Error(`CONTEXT_FIELD_VALUE_MUST_BE_PRIMITIVE:${id}`);
  const direction=field.direction|| (field.technical?'ltr':'auto');
  if(!['auto','ltr','rtl'].includes(direction))throw Error(`CONTEXT_FIELD_DIRECTION_INVALID:${id}`);
  return Object.freeze({id,label:field.label.trim(),value:field.value,technical:field.technical===true,direction});
}

function normalizeTab(tab,lensId,index){
  if(!tab||typeof tab!=='object')throw Error(`CONTEXT_TAB_INVALID:${lensId}:${index}`);
  const id=identifier(tab.id,`CONTEXT_TAB_ID_INVALID:${lensId}:${index}`);
  if(!nonEmpty(tab.label))throw Error(`CONTEXT_TAB_LABEL_REQUIRED:${id}`);
  const fields=Array.isArray(tab.fields)?tab.fields:[];
  if(fields.length>CONTEXT_DESCRIPTOR_CONTRACT.limits.fieldsPerTab)throw Error(`CONTEXT_TAB_FIELD_LIMIT:${id}`);
  const normalized=fields.map(normalizeField),ids=normalized.map(field=>field.id);
  if(new Set(ids).size!==ids.length)throw Error(`CONTEXT_DUPLICATE_FIELD_ID:${id}`);
  return Object.freeze({id,label:tab.label.trim(),emptyMessage:nonEmpty(tab.emptyMessage)?tab.emptyMessage.trim():null,fields:freezeArray(normalized)});
}

function normalizeLens(lens,index){
  if(!lens||typeof lens!=='object')throw Error(`CONTEXT_LENS_INVALID:${index}`);
  const id=identifier(lens.id,`CONTEXT_LENS_ID_INVALID:${index}`);
  if(!nonEmpty(lens.label))throw Error(`CONTEXT_LENS_LABEL_REQUIRED:${id}`);
  if(!Array.isArray(lens.tabs)||lens.tabs.length===0)throw Error(`CONTEXT_LENS_TAB_REQUIRED:${id}`);
  if(lens.tabs.length>CONTEXT_DESCRIPTOR_CONTRACT.limits.tabsPerLens)throw Error(`CONTEXT_LENS_TAB_LIMIT:${id}`);
  const tabs=lens.tabs.map((tab,tabIndex)=>normalizeTab(tab,id,tabIndex)),ids=tabs.map(tab=>tab.id);
  if(new Set(ids).size!==ids.length)throw Error(`CONTEXT_DUPLICATE_TAB_ID:${id}`);
  return Object.freeze({id,label:lens.label.trim(),tabs:freezeArray(tabs)});
}

export function normalizeContextDescriptor(provider,descriptor){
  if(!provider||provider.contract!==CONTEXT_DESCRIPTOR_CONTRACT)throw Error('CONTEXT_PROVIDER_CONTRACT_REQUIRED');
  if(!descriptor||typeof descriptor!=='object')throw Error('CONTEXT_DESCRIPTOR_REQUIRED');
  const id=identifier(descriptor.id,'CONTEXT_DESCRIPTOR_ID_INVALID');
  if(descriptor.providerId!==provider.id)throw Error('CONTEXT_DESCRIPTOR_PROVIDER_MISMATCH');
  if(descriptor.family!==provider.family)throw Error('CONTEXT_DESCRIPTOR_FAMILY_MISMATCH');
  if(!nonEmpty(descriptor.subject))throw Error('CONTEXT_DESCRIPTOR_SUBJECT_REQUIRED');
  if(!nonEmpty(descriptor.domainOwner))throw Error('CONTEXT_DESCRIPTOR_DOMAIN_OWNER_REQUIRED');
  if(!Array.isArray(descriptor.lenses)||descriptor.lenses.length===0)throw Error('CONTEXT_DESCRIPTOR_LENS_REQUIRED');
  if(descriptor.lenses.length>CONTEXT_DESCRIPTOR_CONTRACT.limits.lenses)throw Error('CONTEXT_DESCRIPTOR_LENS_LIMIT');
  const lenses=descriptor.lenses.map(normalizeLens),lensIds=lenses.map(lens=>lens.id);
  if(new Set(lensIds).size!==lensIds.length)throw Error('CONTEXT_DUPLICATE_LENS_ID');
  const revisionToken=descriptor.revisionToken==null?null:String(descriptor.revisionToken);
  return Object.freeze({
    contract:CONTEXT_DESCRIPTOR_CONTRACT,
    id,
    providerId:provider.id,
    family:provider.family,
    subject:descriptor.subject.trim(),
    eyebrow:nonEmpty(descriptor.eyebrow)?descriptor.eyebrow.trim():'Context',
    summary:nonEmpty(descriptor.summary)?descriptor.summary.trim():'',
    domainOwner:descriptor.domainOwner.trim(),
    revisionToken,
    lenses:freezeArray(lenses)
  });
}

export function describeContextProvider(provider,context={}){
  if(!provider||provider.contract!==CONTEXT_DESCRIPTOR_CONTRACT)throw Error('CONTEXT_PROVIDER_CONTRACT_REQUIRED');
  if(provider.isApplicable(context)!==true)return Object.freeze({ok:false,code:'DESCRIPTOR_INAPPLICABLE',providerId:provider.id});
  try{return Object.freeze({ok:true,descriptor:normalizeContextDescriptor(provider,provider.describe(context))});}
  catch(error){return Object.freeze({ok:false,code:'INVALID_DESCRIPTOR',providerId:provider.id,error:String(error?.message||error)});}
}
