import {defineContextDescriptorProvider} from '../foundation/global/context-descriptor-contract.js';

export function createSpatialContextProvider({spatialModel,relationAdapter}){
  if(!spatialModel||!spatialModel.selectionKernel||typeof spatialModel.selectionReceipt!=='function')throw Error('SPATIAL_MODEL_REQUIRED');
  if(!relationAdapter||typeof relationAdapter.project!=='function')throw Error('RELATION_DOMAIN_ADAPTER_REQUIRED');
  const selected=()=>[...spatialModel.selection];
  return defineContextDescriptorProvider({
    id:'spatial-context',
    family:'spatial',
    owner:'SpatialContextDescriptorProvider',
    isApplicable:()=>selected().length>0,
    describe:()=>{
      const ids=selected(),receipt=spatialModel.selectionReceipt('context-inspector-read'),nodes=ids.map(id=>spatialModel.nodes.find(node=>node.id===id)).filter(Boolean),relations=relationAdapter.project().filter(record=>ids.includes(record.source)||ids.includes(record.target));
      return {
        id:`spatial:${ids.join('+')}`,
        providerId:'spatial-context',
        family:'spatial',
        subject:ids.length===1?(nodes[0]?.label||ids[0]):`${ids.length} selected objects`,
        eyebrow:'Spatial context',
        summary:'Read-only projection from Spatial selection and canonical relation records.',
        domainOwner:`${receipt.ownerId} + ${relationAdapter.owner}`,
        revisionToken:`selection:${receipt.revision}|relations:${relationAdapter.version}`,
        lenses:[
          {id:'selection',label:'Selection',tabs:[
            {id:'objects',label:'Objects',fields:[
              {id:'selected-count',label:'Selected objects',value:ids.length,technical:true},
              {id:'selected-ids',label:'Selected IDs',value:ids.join(', '),technical:true},
              {id:'focus-id',label:'Focus',value:receipt.focusId||'',technical:true},
              {id:'active-mode',label:'Mode',value:receipt.activeMode||spatialModel.activeMode||'',technical:true}
            ]}
          ]},
          {id:'relations',label:'Relations',tabs:[
            {id:'linked',label:'Linked',emptyMessage:'No canonical relationships touch the active selection',fields:[
              {id:'relation-count',label:'Canonical relations',value:relations.length,technical:true},
              {id:'relation-ids',label:'Relation IDs',value:relations.map(record=>record.id).join(', '),technical:true},
              {id:'relation-version',label:'Relation version',value:relationAdapter.version,technical:true}
            ]}
          ]}
        ]
      };
    }
  });
}
