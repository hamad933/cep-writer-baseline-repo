import {nodes as sourceNodes} from './w03-v34/enterprise-fixture.js';
import {validateRelation} from './w03-v34/domain-kernel.js';
import {RelationDomainAdapter} from '../foundation/relations.js';

/**
 * Bounded local design fixture adapter only. It exercises the real shared RelationDomainAdapter
 * and W03 domain rules, but its node values are never promoted to canonical CEP product truth.
 */
export function createEnterpriseAdapter({fixture=false}={}){
  const nodes=fixture?Object.values(structuredClone(sourceNodes)).map((n,i)=>({...n,label:n.name,x:(i%3)*240,y:Math.floor(i/3)*200,interfaces:[{id:n.id+':eth0',name:'eth0',type:'ethernet',ip:n.id==='APP-WEB-01'?'192.0.2.10':n.id==='DATA-SQL-01'?'192.0.2.20':null}]})):[];
  const types=['PROTECTED_BY','DEPENDS_ON','AUTHENTICATES_WITH','SENDS_LOGS','CONNECTS_TO'];
  const relations=nodes.flatMap(n=>n.rels.filter(([t])=>types.includes(t)).map(([type,target],i)=>({id:n.id+':relation:'+i,source:n.id,target,type,direction:'directed',scope:n.source==='Simulation-local'?'TWIN_OVERLAY':'ENTERPRISE_DRAFT'})));
  const keyed=Object.fromEntries(nodes.map(n=>[n.id,n]));
  const adapter=new RelationDomainAdapter({owner:'W03EnterpriseDomain.LocalDraft',nodes,relations,types,fields:[{name:'sourcePin',label:'Source interface (CONNECTS_TO)'},{name:'targetPin',label:'Target interface (CONNECTS_TO)'}],validate:p=>{const result=validateRelation(keyed,p.source,p.target,p.type);if(p.type==='CONNECTS_TO'){for(const [key,id] of [['sourcePin',p.source],['targetPin',p.target]])if(!keyed[id].interfaces.some(x=>x.id===p[key]))throw Error('INVALID_INTERFACE:'+key)}else if(p.sourcePin||p.targetPin)throw Error('INTERFACES_ONLY_FOR_CONNECTS_TO');return {scope:result.scope}}});
  adapter.enterpriseId=fixture?'ENT-ATLAS-FINANCE':null;adapter.revisionId=fixture?'ENT-REV-004-DRAFT':'ENT-REV-UNAVAILABLE';adapter.twinId=fixture?'TWIN-TRAINING-01':null;adapter.sourceSnapshot=fixture?JSON.stringify(sourceNodes):null;
  adapter.sourceClassification=fixture?'FIXTURE_ONLY__NOT_PRODUCT_TRUTH':'UNAVAILABLE';adapter.canonicalProductTruth=false;adapter.sourceDigest=fixture?'fixture-w03-v34-enterprise-local-draft':null;adapter.providerAvailability=fixture?'EXPLICIT_TEST_FIXTURE':'UNAVAILABLE';
  return adapter;
}

export const createEnterpriseFixtureAdapter=()=>createEnterpriseAdapter({fixture:true});
