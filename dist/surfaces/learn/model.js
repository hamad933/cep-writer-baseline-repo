/**
 * W02-LEARN · learning-state projection.
 *
 * Pure projection of Learn domain truth into the shapes the Learn panes render.
 * Nothing here invents product content: every value is derived from LearnAdapter,
 * the structured document, or command availability. Missing truth stays missing
 * and is rendered as a state, never as a success.
 */
import {t,tf,learnLocale,learnDir,                } from './i18n.js';

                                               
                        
                                              
                                                        
                                                     
                                                        
  

                        
                                     
                                                                                                           
                          
                                                                                                           
                                                                                                             
                                                                                                                                                     
                                                                           
                      
                  
          
                                                                                                                        
                                                                                         
    
                                                                                                                                
                   
                     
  

const str=(value        ,fallback='—')=>value===null||value===undefined||value===''?fallback:String(value);

const reasonOf=(result    ,fallback       )=>String(result?.reason||result?.code||(!result?.enabled?fallback:'')||'');

export function buildLearnModel({learn,structured,commands}                                        )           {
  const locale=learnLocale();
  const activity=learn?.activity||{};
  const sourceAvailable=learn?.sourceAvailable===true;
  const source=learn?.source||{};
  const progress=learn?.learningProgress?.()||{};
  const attemptRaw=learn?.attempt||null;
  const snapshot=typeof structured?.snapshot==='function'?structured.snapshot():{};
  const identity=typeof structured?.identity==='function'?structured.identity():{};
  const metadata=structured?.metadata||{};
  const blocks=Array.isArray(snapshot?.blocks)?snapshot.blocks:[];
  const hasSections=blocks.some(block=>/^h[1-6]$/i.test(String(block?.type||'')));

  const assessment=learn?.assessmentDescriptor?.()||{};
  const lab=learn?.labDescriptor?.()||{};
  const attemptTruth=String(progress.attemptTruth||'NO_ATTEMPT');
  const done=[sourceAvailable&&progress.state==='COMPLETE',attemptRaw?.state==='SUBMITTED',false,false].filter(Boolean).length;
  const total=4;
  const percent=Math.round((done/total)*100);

  const avail=(id       ,payload    ={})=>{
    if(!commands?.availability)return null;
    try{
      const result=commands.availability(id,payload);
      if(result?.enabled)return null;
      return reasonOf(result,t('stateUnavailable',locale));
    }catch{return t('stateUnavailable',locale)};
  };

  const openBlock=avail('learn.open');
  const practiceBlock=avail('learn.practice',{});
  const editBlock=avail('learn.edit',{blockId:blocks[0]?.id,patch:{html:''}});
  const reviewBlock=avail('learn.review',{});
  const startBlock=avail('learn.start');
  const submitBlock=avail('learn.submit');

  const stages             =[
    {
      key:'journey',index:'01',label:t('stageJourney',locale),
      sub:sourceAvailable?(openBlock||t('subJourneyOpen',locale)):t('subJourneyUnbound',locale),
      state:sourceAvailable?(progress.state==='COMPLETE'?'done':'current'):'current',
      badge:sourceAvailable?(progress.state==='COMPLETE'?t('stateComplete',locale):t('stateCurrent',locale)):t('stateUnavailable',locale),
      badgeTone:sourceAvailable?(progress.state==='COMPLETE'?'ok':'accent'):'warn',
      meta:[{label:t('fActivityId',locale),value:str(activity.id),technical:true}]
    },
    {
      key:'practice',index:'02',label:t('stagePractice',locale),
      sub:attemptRaw?.state==='SUBMITTED'?t('subPracticeSubmitted',locale):attemptRaw?.state==='IN_PROGRESS'?t('subPracticeUnlocked',locale):sourceAvailable&&!practiceBlock?t('subPracticeReady',locale):t('subPracticeLocked',locale),
      state:attemptRaw?.state==='SUBMITTED'?'done':attemptRaw?.state==='IN_PROGRESS'?'current':'idle',
      badge:attemptRaw?.state==='SUBMITTED'?t('stateComplete',locale):attemptRaw?.state==='IN_PROGRESS'?t('stateCurrent',locale):sourceAvailable?t('stateNext',locale):t('stateUnavailable',locale),
      badgeTone:attemptRaw?.state==='SUBMITTED'?'ok':attemptRaw?.state==='IN_PROGRESS'?'accent':sourceAvailable?'mute':'warn',
      meta:[{label:t('attemptShort',locale),value:str(attemptRaw?.state,attemptTruth),technical:true}]
    },
    {
      key:'assessment',index:'03',label:t('stageAssessment',locale),
      sub:t('subAssessment',locale),state:'idle',
      badge:t('stateBrief',locale),badgeTone:'mute',
      meta:[{label:t('briefGrading',locale),value:str(assessment.gradingProvider,'UNAVAILABLE'),technical:true}]
    },
    {
      key:'lab',index:'04',label:t('stageLab',locale),
      sub:t('subLab',locale),state:'idle',
      badge:t('stateBrief',locale),badgeTone:'mute',
      meta:[{label:t('briefRuntime',locale),value:str(lab.runtime,'NOT_CREATED'),technical:true}]
    }
  ];

  return {
    locale,dir:learnDir(),
    activity:{
      id:str(activity.id,'—'),title:str(activity.title,t('crumbKind',locale)),
      revision:activity.revision??null,kind:str(activity.kind,'—'),
      editable:activity.editable===true,prerequisiteState:str(activity.prerequisiteState,'UNKNOWN')
    },
    sourceAvailable,
    source:{
      truth:String(source.truth||structured?.sourceBinding?.truth||'UNAVAILABLE'),
      classification:String(source.classification||structured?.sourceBinding?.classification||'UNAVAILABLE'),
      providerRef:(source.providerRef??structured?.sourceBinding?.providerRef)??null,
      rejectionReason:String(source.rejectionReason||'LEARN_PROVIDER_UNBOUND'),
      bound:sourceAvailable
    },
    document:{
      id:String(snapshot?.id||identity?.id||'—'),
      revision:snapshot?.revision===undefined?null:String(snapshot.revision),
      title:String(snapshot?.title||''),
      blockCount:blocks.length,hasSections,
      tags:Array.isArray(snapshot?.tags)?snapshot.tags.map(String):[]
    },
    progress:{
      state:progress.state==='COMPLETE'?'COMPLETE':'INCOMPLETE',
      percent:sourceAvailable?percent:0,done,total,
      attemptTruth,mastery:String(progress.mastery||'NOT_INFERRED'),
      persisted:progress.persisted===true,scope:String(progress.scope||'LEARNING_PROJECTION')
    },
    attempt:attemptRaw?{
      id:String(attemptRaw.id||'—'),state:String(attemptRaw.state||'—'),
      answer:String(attemptRaw.answer||''),
      feedback:attemptRaw.feedback?String(attemptRaw.feedback):null
    }:null,
    stages,
    nextStep:sourceAvailable?str(learn.recommendation?.(),t('nextStepNoAttempt',locale)):t('nextStepUnbound',locale),
    briefs:{
      assessment:{
        kind:str(assessment.kind,'ASSESSMENT_BRIEF'),
        availability:str(assessment.availability,'UNAVAILABLE'),
        gradingProvider:str(assessment.gradingProvider,'UNAVAILABLE'),
        masteryWrite:assessment.masteryWrite===true,
        w04DecisionCreated:assessment.w04DecisionCreated===true
      },
      lab:{
        kind:str(lab.kind,'LAB_LEARNING_BRIEF'),
        runtime:str(lab.runtime,'NOT_CREATED'),
        operationalAdapter:str(lab.operationalAdapter,'UNBOUND'),
        w03RuntimeCreated:lab.w03RuntimeCreated===true
      }
    },
    availability:{open:openBlock,edit:editBlock,practice:practiceBlock,review:reviewBlock,start:startBlock,submit:submitBlock},
    editable:learn?.editability?.()?.enabled===true,
    persistence:String(metadata?.persistence||'UNCONFIGURED_LOCAL_WORKING_STATE')
  };
}

/** Localized "%d/%d stages" style caption. */
export const stageCaption=(model           )=>tf('stageCount',{done:model.progress.done},model.locale);

/** Localized percent label. */
export const percentLabel=(model           )=>`${model.progress.percent}%`;
