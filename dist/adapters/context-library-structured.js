import {defineContextDescriptorProvider} from '../foundation/global/context-descriptor-contract.js';

const list=value=>Array.isArray(value)?value:[];
const scalar=value=>value==null?'':typeof value==='string'||typeof value==='number'||typeof value==='boolean'?value:JSON.stringify(value);
const DETAIL_LENSES=Object.freeze([
  ['sources','المصادر'],['relations','العلاقات'],['labs','المختبرات'],['projects','المشاريع'],
  ['evidence','الأدلة'],['notes','الملاحظات'],['history','السجل']
]);
const itemLabel=(item,fallback)=>String(item?.title||item?.label||item?.name||item?.id||fallback);
const itemDetail=item=>String(item?.kind||item?.status||item?.target||item?.type||item?.summary||'');
const itemFields=(items,prefix,label)=>{
  const rows=[];for(const [index,item] of list(items).slice(0,12).entries()){rows.push({id:`${prefix}-${index+1}-label`,label:`${label} ${index+1}`,value:itemLabel(item,`${label} ${index+1}`)});const detail=itemDetail(item);if(detail)rows.push({id:`${prefix}-${index+1}-detail`,label:'الحالة / النوع',value:detail});}return rows;
};
const oneTab=(id,label,fields,emptyMessage)=>({id:`${id}-summary`,label,emptyMessage,fields});

export function createLibraryStructuredContextProvider(adapter){
  if(!adapter||typeof adapter.identity!=='function'||typeof adapter.snapshot!=='function'||typeof adapter.selectedFragmentIdentity!=='function')throw Error('LIBRARY_STRUCTURED_ADAPTER_REQUIRED');
  return defineContextDescriptorProvider({
    id:'library-structured-context',
    family:'structured',
    owner:'LibraryStructuredContextDescriptorProvider',
    isApplicable:()=>adapter.domainKind==='library'&&Boolean(adapter.identity()?.id),
    describe:()=>{
      const identity=adapter.identity(),document=adapter.snapshot(),context=adapter.metadata?.context||{},sourceBinding=adapter.sourceBinding||{};
      const selection=adapter.selection?.descriptor?.({reconcile:false})||{blockIds:[],anchorBlockId:null,focusBlockId:null},blockIds=list(selection?.blockIds),notes=list(context.notes).filter(note=>{const binding=note?.binding||{};return (binding.documentId||binding.kuId)===identity.id;});
      const tx=typeof adapter.transactionDescriptor==='function'?adapter.transactionDescriptor():null,scope=blockIds.length>1?'selection':blockIds.length===1?'block':'ku';
      const fieldsByLens={
        overview:[
          {id:'document-id',label:'معرّف الوحدة',value:identity.id,technical:true},
          {id:'document-title',label:'العنوان',value:document.title||identity.id},
          {id:'working-revision',label:'المراجعة',value:identity.workingRevision??identity.revision??'',technical:true},
          {id:'context-scope',label:'النطاق المتاح',value:scope,technical:true},
          {id:'selected-count',label:'الكتل المحددة',value:blockIds.length,technical:true},
          {id:'selected-ids',label:'معرّفات التحديد',value:blockIds.join(', '),technical:true},
          {id:'tags',label:'التصنيف',value:list(document.tags).join(' · ')},
          {id:'source-truth',label:'حقيقة المصدر',value:sourceBinding.truth||adapter.metadata?.consumerTruth||'UNBOUND',technical:true}
        ],
        sources:itemFields(sourceBinding.sources,'source','المصدر'),
        relations:itemFields(context.relations,'relation','العلاقة'),
        labs:itemFields(context.labs,'lab','المختبر'),
        projects:itemFields(context.projects,'project','المشروع'),
        evidence:itemFields(context.evidence,'evidence','دليل'),
        notes:notes.flatMap((note,index)=>[
          {id:`note-${index+1}-title`,label:`ملاحظة ${index+1}`,value:note.title||'ملاحظة بلا عنوان'},
          {id:`note-${index+1}-binding`,label:'الارتباط',value:scalar(note.binding?.blockId||note.binding?.documentId||note.binding?.kuId||identity.id),technical:true}
        ]).slice(0,24),
        history:[
          {id:'history-owner',label:'المالك',value:tx?.owner||adapter.transactionOwner?.owner||'StructuredTransactionHistoryRecoveryOwner',technical:true},
          {id:'history-index',label:'الموضع',value:tx?.historyIndex??'',technical:true},
          {id:'history-length',label:'الإطارات',value:tx?.historyLength??adapter.history?.length??0,technical:true},
          {id:'dirty',label:'حالة العمل',value:tx?.dirty===true?'working changes':'clean'}
        ]
      };
      const empty={sources:'لا توجد مصادر مرتبطة.',relations:'لا توجد علاقات مرتبطة.',labs:'لا توجد مختبرات مرتبطة.',projects:'لا توجد مشاريع مرتبطة.',evidence:'لا توجد مؤشرات أدلة مرتبطة.',notes:'لا توجد ملاحظات مرتبطة.',history:'لا يوجد سجل متاح.'};
      return {
        id:`library:${identity.id}`,
        providerId:'library-structured-context',
        family:'structured',
        subject:document.title||identity.id,
        eyebrow:'Library / Structured',
        summary:'Read-only Library context projection; canonical document and selection truth stay in Structured owners.',
        domainOwner:adapter.owner,
        revisionToken:identity.workingRevision??identity.revision??null,
        lenses:[
          {id:'document',label:'Document',tabs:[
            {id:'overview',label:'Overview',fields:[
              {id:'document-id',label:'Document ID',value:identity.id,technical:true},
              {id:'document-title',label:'Title',value:document.title||''},
              {id:'working-revision',label:'Working revision',value:identity.workingRevision??identity.revision??'',technical:true},
              {id:'domain-kind',label:'Domain',value:adapter.domainKind,technical:true},
              {id:'source-truth',label:'Source truth',value:sourceBinding.truth||adapter.metadata?.consumerTruth||'UNBOUND',technical:true},
              {id:'source-classification',label:'Source classification',value:sourceBinding.classification||adapter.metadata?.sourceClassification||'UNBOUND',technical:true}
            ]},
            {id:'selection',label:'Selection',emptyMessage:'No Structured selection',fields:[
              {id:'selected-count',label:'Selected blocks',value:blockIds.length,technical:true},
              {id:'selected-ids',label:'Selected IDs',value:blockIds.join(', '),technical:true},
              {id:'anchor',label:'Anchor',value:selection?.anchorBlockId||'',technical:true},
              {id:'focus',label:'Focus',value:selection?.focusBlockId||'',technical:true}
            ]}
          ]},
          ...DETAIL_LENSES.map(([id,label])=>({id,label,tabs:[oneTab(id,label,fieldsByLens[id]||[],empty[id]||'لا توجد بيانات سياق.')] }))
        ]
      };
    }
  });
}
