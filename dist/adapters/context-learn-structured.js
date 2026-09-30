import {defineContextDescriptorProvider} from '../foundation/global/context-descriptor-contract.js';
import {t,learnLocale,                } from '../surfaces/learn/i18n.js';

export const LEARN_STRUCTURED_CONTEXT_PROVIDER_ID='learn-structured-context';
export const LEARN_STRUCTURED_CONTEXT_PROVIDER_OWNER='LearnContextDescriptorProvider';

const primitive=value=>value===null||['string','number','boolean'].includes(typeof value);
const resolve=value=>typeof value==='function'?value():value;
const truthValue=(value,fallback='UNAVAILABLE')=>{const resolved=resolve(value);if(primitive(resolved)&&resolved!==null&&resolved!==''&&resolved!==undefined)return resolved;if(resolved&&typeof resolved==='object'){for(const key of ['state','status','code','label','description'])if(primitive(resolved[key])&&resolved[key]!==''&&resolved[key]!==undefined)return resolved[key]}return fallback;};
const technical=value=>value==null?'':String(value);
const yesNo=(value        ,locale            )=>value?t('yes',locale):t('no',locale);
const identifier=value=>String(value||'learn-activity').replace(/[^A-Za-z0-9._:+-]+/g,'-').slice(0,120);
const field=(id       ,label       ,value    ,technicalToken=false)=>({
  id,
  label,
  value:String(value===null||value===undefined||value===''?'—':value),
  technical:technicalToken===true
});

/**
 * Learn-domain projection for the canonical shared ContextInspectorHost.
 * Thin: it owns no inspector presentation, focus or interaction state — only the
 * descriptor content. Content is bilingual because the label set is Settings-driven.
 */
export function createLearnStructuredContextProvider({learn,structured=null,recommendation=null,assessment=null,lab=null}={}){
  if(!learn||typeof learn!=='object')throw Error('LEARN_CONTEXT_SOURCE_REQUIRED');
  return defineContextDescriptorProvider({
    id:LEARN_STRUCTURED_CONTEXT_PROVIDER_ID,
    family:'structured',
    owner:LEARN_STRUCTURED_CONTEXT_PROVIDER_OWNER,
    isApplicable:()=>Boolean(learn.activity?.id),
    describe:(context={})=>{
      const locale=learnLocale();
      const activity=learn.activity||{},attempt=learn.attempt||null,document=structured?.identity?.()||null;
      const snapshot=typeof structured?.snapshot==='function'?structured.snapshot():{};
      const source=learn.source||{},metadata=structured?.metadata||{};
      const binding=structured?.sourceBinding||{};
      const sourceAvailable=learn.sourceAvailable===true;
      const progress=typeof learn.learningProgress==='function'?learn.learningProgress():{};
      const activityRevision=activity.revision??null,attemptRevision=attempt?.revision??null;
      const revisionAligned=attempt?String(attemptRevision)===String(activityRevision):null;
      const recommendationTruth=truthValue(context.recommendation??recommendation,t('nextStepUnbound',locale));
      const assessmentTruth=truthValue(context.assessment??assessment);
      const labTruth=truthValue(context.lab??lab);
      const assessmentDescriptor=typeof learn.assessmentDescriptor==='function'?learn.assessmentDescriptor():{};
      const labDescriptor=typeof learn.labDescriptor==='function'?learn.labDescriptor():{};
      return {
        id:identifier(`learn:${activity.id}`),
        providerId:LEARN_STRUCTURED_CONTEXT_PROVIDER_ID,
        family:'structured',
        subject:String(activity.title||activity.id),
        eyebrow:t('ctxEyebrow',locale),
        summary:t('ctxObjectiveSummary',locale),
        domainOwner:'LearnAdapter',
        revisionToken:null,
        lenses:[
          {id:'objective',label:t('lensObjective',locale),tabs:[
            {id:'next',label:t('fObjective',locale),fields:[
              field('next-step',t('fObjective',locale),recommendationTruth),
              field('progress-state',t('fProgress',locale),truthValue(progress.state||learn.progress,'INCOMPLETE')),
              field('attempt-truth',t('attemptShort',locale),truthValue(progress.attemptTruth,'NO_ATTEMPT')),
              field('mastery',t('fMastery',locale),truthValue(progress.mastery,'NOT_INFERRED')),
              field('prerequisites',t('fPrerequisites',locale),technical(activity.prerequisiteState))
            ]},
            {id:'state',label:t('progressState',locale),fields:[
              field('scope',t('progressState',locale),truthValue(progress.scope,'LEARNING_PROJECTION')),
              field('persisted',t('fPersisted',locale),yesNo(progress.persisted===true,locale)),
              field('source-availability',t('briefAvailability',locale),sourceAvailable?'AVAILABLE':'UNAVAILABLE'),
              field('grading',t('briefGrading',locale),truthValue(assessmentDescriptor.gradingProvider,'UNAVAILABLE'))
            ]}
          ]},
          {id:'activity',label:t('lensActivity',locale),tabs:[
            {id:'identity',label:t('fActivityId',locale),fields:[
              field('activity-id',t('fActivityId',locale),technical(activity.id),true),
              field('activity-kind',t('fKind',locale),technical(activity.kind),true),
              field('activity-revision',t('fRevision',locale),activityRevision==null?'—':String(activityRevision),true),
              field('editable',t('fEditable',locale),yesNo(activity.editable===true,locale)),
              field('owner',t('briefOwner',locale),technical(metadata.domainOwner||'LearnAdapter'),true)
            ]},
            {id:'document',label:t('fDocId',locale),fields:[
              field('document-id',t('fDocId',locale),technical(document?.id),true),
              field('document-revision',t('fDocRevision',locale),technical(document?.revision),true),
              field('document-title',t('docGroup',locale),String(snapshot?.title||'—')),
              field('block-count',t('sections',locale),String(Array.isArray(snapshot?.blocks)?snapshot.blocks.length:0)),
              field('persistence',t('fPersisted',locale),technical(metadata.persistence||'UNCONFIGURED_LOCAL_WORKING_STATE'),true)
            ]}
          ]},
          {id:'progress',label:t('lensProgress',locale),tabs:[
            {id:'projection',label:t('pathProgress',locale),fields:[
              field('progress-state',t('fProgress',locale),truthValue(progress.state||learn.progress,'INCOMPLETE')),
              field('mastery',t('fMastery',locale),truthValue(progress.mastery,'NOT_INFERRED')),
              field('source-truth',t('fProvider',locale),truthValue(progress.sourceTruth||binding.truth,'UNAVAILABLE'),true),
              field('scope',t('progressState',locale),truthValue(progress.scope,'LEARNING_PROJECTION'))
            ]},
            {id:'attempt',label:t('attemptShort',locale),fields:[
              field('attempt-id',t('fAttemptId',locale),technical(attempt?.id),true),
              field('attempt-state',t('fAttempt',locale),truthValue(attempt?.state,'NO_ATTEMPT')),
              field('attempt-revision',t('fAttemptRevision',locale),attemptRevision==null?'—':String(attemptRevision),true),
              field('revision-aligned',t('fAligned',locale),revisionAligned==null?'NO_ATTEMPT':String(revisionAligned)),
              field('attempt-feedback',t('fieldFeedback',locale),technical(attempt?.feedback)||'—')
            ]}
          ]},
          {id:'source',label:t('lensSource',locale),tabs:[
            {id:'admission',label:t('sourceCard',locale),fields:[
              field('provider-truth',t('fProvider',locale),truthValue(source.truth||binding.truth,'UNAVAILABLE'),true),
              field('classification',t('fClassification',locale),truthValue(source.classification||binding.classification,'UNAVAILABLE'),true),
              field('provider-ref',t('fProviderRef',locale),technical(source.providerRef||binding.providerRef)||'—',true),
              field('rejection',t('fRejection',locale),technical(source.rejectionReason)||'—',true),
              field('bound-sources',t('sourceCard',locale),String(Array.isArray(binding.sources)?binding.sources.length:0))
            ]},
            {id:'policy',label:t('tagMastery',locale),fields:[
              field('fixture-fallback',t('fProvider',locale),'false',true),
              field('mastery-write',t('briefMastery',locale),'false',true),
              field('consumer-truth',t('fProvider',locale),technical(metadata.consumerTruth||binding.truth||'UNBOUND'),true),
              field('source-availability',t('briefAvailability',locale),technical(metadata.sourceAvailability||'UNAVAILABLE'),true)
            ]}
          ]},
          {id:'briefs',label:t('lensBriefs',locale),tabs:[
            {id:'assessment',label:t('assessmentTitle',locale),fields:[
              field('assessment-availability',t('briefAvailability',locale),truthValue(assessmentTruth)),
              field('assessment-kind',t('fKind',locale),technical(assessmentDescriptor.kind||'ASSESSMENT_BRIEF'),true),
              field('grading-provider',t('briefGrading',locale),truthValue(assessmentDescriptor.gradingProvider,'UNAVAILABLE'),true),
              field('assessment-mastery',t('briefMastery',locale),yesNo(assessmentDescriptor.masteryWrite===true,locale)),
              field('w04-decision',t('briefOwner',locale),yesNo(assessmentDescriptor.w04DecisionCreated===true,locale))
            ]},
            {id:'lab',label:t('labTitle',locale),fields:[
              field('lab-availability',t('briefAvailability',locale),truthValue(labTruth)),
              field('lab-kind',t('fKind',locale),technical(labDescriptor.kind||'LAB_LEARNING_BRIEF'),true),
              field('lab-runtime',t('briefRuntime',locale),technical(labDescriptor.runtime||'NOT_CREATED'),true),
              field('lab-adapter',t('briefOwner',locale),technical(labDescriptor.operationalAdapter||'UNBOUND'),true),
              field('w03-runtime',t('briefMastery',locale),yesNo(labDescriptor.w03RuntimeCreated===true,locale))
            ]}
          ]}
        ]
      };
    }
  });
}
