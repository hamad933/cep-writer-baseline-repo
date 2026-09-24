import {nodes as sourceNodes} from './w03-v34/enterprise-fixture.js';
import {validateRelation} from './w03-v34/domain-kernel.js';
import {RelationDomainAdapter} from '../foundation/relations.js';

/**
 * Bounded local design fixture adapter only. It exercises the real shared RelationDomainAdapter
 * and W03 domain rules, but its node values are never promoted to canonical CEP product truth.
 */
export function createEnterpriseAdapter(){
  const nodes=Object.values(structuredClone(sourceNodes)).map((n,i)=>({...n,label:n.name,x:(i%3)*240,y:Math.floor(i/3)*200,interfaces:[{id:n.id+':eth0',name:'eth0',type:'ethernet',ip:n.id==='APP-WEB-01'?'192.0.2.10':n.id==='DATA-SQL-01'?'192.0.2.20':null}]}));
  const types=['PROTECTED_BY','DEPENDS_ON','AUTHENTICATES_WITH','SENDS_LOGS','CONNECTS_TO'];
  const relations=nodes.flatMap(n=>n.rels.filter(([t])=>types.includes(t)).map(([type,target],i)=>({id:n.id+':relation:'+i,source:n.id,target,type,direction:'directed',scope:n.source==='Simulation-local'?'TWIN_OVERLAY':'ENTERPRISE_DRAFT'})));
  const keyed=Object.fromEntries(nodes.map(n=>[n.id,n]));
  const adapter=new RelationDomainAdapter({owner:'W03EnterpriseDomain.LocalDraft',nodes,relations,types,fields:[{name:'sourcePin',label:'Source interface (CONNECTS_TO)'},{name:'targetPin',label:'Target interface (CONNECTS_TO)'}],validate:p=>{const result=validateRelation(keyed,p.source,p.target,p.type);if(p.type==='CONNECTS_TO'){for(const [key,id] of [['sourcePin',p.source],['targetPin',p.target]])if(!keyed[id].interfaces.some(x=>x.id===p[key]))throw Error('INVALID_INTERFACE:'+key)}else if(p.sourcePin||p.targetPin)throw Error('INTERFACES_ONLY_FOR_CONNECTS_TO');return {scope:result.scope}}});
  adapter.enterpriseId='ENT-ATLAS-FINANCE';adapter.revisionId='ENT-REV-004-DRAFT';adapter.twinId='TWIN-TRAINING-01';adapter.sourceSnapshot=JSON.stringify(sourceNodes);
  adapter.sourceClassification='FIXTURE_ONLY__NOT_PRODUCT_TRUTH';adapter.canonicalProductTruth=false;adapter.sourceDigest='fixture-w03-v34-enterprise-local-draft';
  return adapter;
}
