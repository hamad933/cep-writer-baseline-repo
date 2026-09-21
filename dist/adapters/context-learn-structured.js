import {defineContextDescriptorProvider} from '../foundation/global/context-descriptor-contract.js';

export const LEARN_STRUCTURED_CONTEXT_PROVIDER_ID='learn-structured-context';
export const LEARN_STRUCTURED_CONTEXT_PROVIDER_OWNER='LearnContextDescriptorProvider';

const primitive=value=>value===null||['string','number','boolean'].includes(typeof value);
const resolve=value=>typeof value==='function'?value():value;
const truthValue=(value,fallback='UNAVAILABLE')=>{const resolved=resolve(value);if(primitive(resolved)&&resolved!==null&&resolved!==''&&resolved!==undefined)return resolved;if(resolved&&typeof resolved==='object'){for(const key of ['state','status','code','label','description'])if(primitive(resolved[key])&&resolved[key]!==''&&resolved[key]!==undefined)return resolved[key]}return fallback;};
const technical=value=>value==null?'':String(value);

/** Thin Learn-domain projection for the canonical ContextInspectorHost. It owns no inspector Presentation, focus, or interaction state. */
export function createLearnStructuredContextProvider({learn,structured=null,recommendation=null,assessment=null,lab=null}={}){
  if(!learn||typeof learn!=='object')throw Error('LEARN_CONTEXT_SOURCE_REQUIRED');
  return defineContextDescriptorProvider({
    id:LEARN_STRUCTURED_CONTEXT_PROVIDER_ID,
    family:'structured',
    owner:LEARN_STRUCTURED_CONTEXT_PROVIDER_OWNER,
    isApplicable:()=>Boolean(learn.activity?.id),
    describe:(context={})=>{
      const activity=learn.activity||{},attempt=learn.attempt||null,document=structured?.identity?.()||null;
      const activityRevision=activity.revision??null,attemptRevision=attempt?.revision??null;
      const revisionAligned=attempt?String(attemptRevision)===String(activityRevision):null;
      const recommendationTruth=truthValue(context.recommendation??recommendation);
      const assessmentTruth=truthValue(context.assessment??assessment);
      const labTruth=truthValue(context.lab??lab);
      return {
        id:`learn:${activity.id}`,
        providerId:LEARN_STRUCTURED_CONTEXT_PROVIDER_ID,
        family:'structured',
        subject:String(activity.title||activity.id),
        eyebrow:'Learn context',
        summary:'Read-only Learn domain projection consumed by the canonical shared Context Inspector.',
        domainOwner:'LearnAdapter',
        revisionToken:activityRevision==null?null:`activity:${activityRevision}`,
        lenses:[
          {id:'activity',label:'Activity',tabs:[
            {id:'identity',label:'Identity',fields:[
              {id:'activity-id',label:'Activity ID',value:technical(activity.id),technical:true},
              {id:'activity-kind',label:'Activity kind',value:technical(activity.kind),technical:true},
              {id:'activity-revision',label:'Activity revision',value:activityRevision==null?'':activityRevision,technical:true},
              {id:'document-id',label:'Structured document',value:technical(document?.id),technical:true},
              {id:'document-revision',label:'Document revision',value:technical(document?.revision),technical:true}
            ]}
          ]},
          {id:'learning',label:'Learning',tabs:[
            {id:'progress',label:'Progress',fields:[
              {id:'progress-state',label:'Progress state',value:truthValue(learn.progress,'INCOMPLETE'),technical:true},
              {id:'attempt-id',label:'Attempt ID',value:technical(attempt?.id),technical:true},
              {id:'attempt-state',label:'Attempt state',value:truthValue(attempt?.state,'NO_ATTEMPT'),technical:true},
              {id:'attempt-revision',label:'Attempt revision',value:attemptRevision==null?'':attemptRevision,technical:true},
              {id:'revision-aligned',label:'Current activity revision',value:revisionAligned==null?'NO_ATTEMPT':revisionAligned,technical:true}
            ]}
          ]},
          {id:'support',label:'Support',tabs:[
            {id:'truth',label:'Truthful state',fields:[
              {id:'recommendation',label:'Recommendation',value:recommendationTruth},
              {id:'assessment',label:'Assessment state',value:assessmentTruth,technical:true},
              {id:'lab',label:'Lab state',value:labTruth,technical:true}
            ]}
          ]}
        ]
      };
    }
  });
}
