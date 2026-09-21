import {BALANCED6_CLASSIFICATION,BALANCED6_TRUTH,BALANCED6_STRUCTURE_TREE,BALANCED6_DOCUMENTS} from './balanced6-acceptance-data.js';
export const LIBRARY_FIXTURE_CLASSIFICATION=BALANCED6_CLASSIFICATION;
export const LIBRARY_FIXTURE_TRUTH=BALANCED6_TRUTH;
export const libraryFixtureDescriptor=()=>Object.freeze({classification:LIBRARY_FIXTURE_CLASSIFICATION,truth:LIBRARY_FIXTURE_TRUTH,realConsumer:true,role:'SOURCE_GROUNDED_BALANCED6_LOCAL_ACCEPTANCE'});
export const STRUCTURE_TREE=BALANCED6_STRUCTURE_TREE;
export const FIXTURES=BALANCED6_DOCUMENTS;

export const NOTE_FIXTURES=[
 {id:'note-001',title:'tenant_id لا يكفي وحده',status:'مسودة سياقية',binding:{kuId:'KU-D05-0021',blockId:'blk-d05-p1',selection:'subject_id ↔ object_id',route:'PERSONAL:CEP/W02/Library'},working:{blocks:[{id:'note-001-p1',type:'paragraph',html:'تذكير: لا تستخدم <bdi dir="ltr">tenant_id</bdi> كبديل عن فحص ملكية الكائن. English note: verify object ownership before response.'}],history:[],historyIndex:-1,selectedBlock:null,caret:null,dirty:false,recovery:false},window:{x:820,y:230,width:360,height:330,floating:true,minimized:false,pinned:false,closed:true}},
 {id:'note-002',title:'رابط التحقق من السياسة',status:'ملاحظة ممثّلة',binding:{kuId:'KU-D03-0011',blockId:'blk-d03-p1',selection:null,route:'PERSONAL:CEP/W02/Library'},working:{blocks:[{id:'note-002-p1',type:'paragraph',html:'راجع <bdi dir="ltr">policy.can()</bdi> مع <bdi dir="ltr">aud</bdi> و <bdi dir="ltr">scope</bdi>.'}],history:[],historyIndex:-1,selectedBlock:null,caret:null,dirty:false,recovery:false},window:{x:760,y:210,width:350,height:310,floating:true,minimized:false,pinned:false,closed:true}}
];

