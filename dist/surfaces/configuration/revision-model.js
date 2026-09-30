/* CONFIGURATION REVISION MODEL — the content model of the Configuration surface.
 *
 * Surface identity: "configuration" is the workspace where platform configuration is READ,
 * a DRAFT REVISION is prepared, VALIDATED, and PUBLISHED. It is revision control for
 * configuration, not a generic settings list.
 *
 * Two scopes with two different truths (never collapsed):
 *   preference  — durable UI preferences. Value owner + persistence owner: ScopedPreferencesOwner.
 *                 Publishing writes real, durable preference overrides and the document shell
 *                 direction/language follows them.
 *   operational — observed operational configuration from the adapter. Publishing NEVER mutates
 *                 it: it stays AUTHORITY_PENDING behind the explicit ConfigAuthority boundary.
 *
 * Fixture basis: the operational observations are representative (declared, redacted) records —
 * see RECORD_BASIS. Preference values are LIVE reads from ScopedPreferencesOwner, never fixtures.
 */

import {PREFERENCE_DEFINITIONS} from '../../foundation/global/preferences/schema.js';

                                                  
                                     
                                        
                                                                
                                                                                   
                
                    
 

export const CONFIGURATION_REVISION_BASIS='W05_REPRESENTATIVE_REVISION_RECORD · preference values are live reads of ScopedPreferencesOwner; operational observations are declared representative records with redacted values, not a live configuration read';

export const CONFIGURATION_DOMAINS                               =[
  {id:'language',kind:'preference',icon:'i-focus',label:{ar:'اللغة والاتجاه',en:'Language & direction'},description:{ar:'لغة المنتج واتجاه القشرة',en:'Product language and chrome direction'},keys:['locale','chromeDirection','contentDirection'],valueOwner:'ScopedPreferencesOwner'},
  {id:'appearance',kind:'preference',icon:'i-theme',label:{ar:'المظهر وإمكانية الوصول',en:'Appearance & access'},description:{ar:'السمة والكثافة والمقياس والحركة',en:'Theme, density, scale, motion, contrast'},keys:['theme','density','scale','font','highContrast','motion'],valueOwner:'ScopedPreferencesOwner'},
  {id:'layout',kind:'preference',icon:'i-layout',label:{ar:'تخطيط مساحة العمل',en:'Workspace layout'},description:{ar:'أبعاد اللوحات وشريط الأدوات وعرض المستند',en:'Panes, toolbar and document width'},keys:['left','right','documentWidth','toolbar','toolbarOrder'],valueOwner:'ScopedPreferencesOwner'},
  {id:'editing',kind:'preference',icon:'i-edit',label:{ar:'تحرير المستند',en:'Document editing'},description:{ar:'المحاذاة والحفظ والاسترداد والحماية',en:'Alignment, autosave, recovery, safety'},keys:['alignment','autosave','recoveryEnabled','deleteConfirmation','clipboardMode','disclosureMode'],valueOwner:'ScopedPreferencesOwner'},
  {id:'accessibility',kind:'preference',icon:'i-info',label:{ar:'الإرشاد والتركيز',en:'Guidance & focus'},description:{ar:'مؤشرات التركيز وسلوك الانتقال',en:'Focus indicators and focus behaviour'},keys:['guidance','focusIndicators','focusOnInput','focusOnCommandRail','focusOnBlockSelection'],valueOwner:'ScopedPreferencesOwner'},
  {id:'security',kind:'operational',icon:'i-shield',label:{ar:'الأمن والصلاحيات',en:'Security & permissions'},description:{ar:'الحماية والمصداقية والتحكم بالوصول',en:'Protection, integrity, access control'},keys:['security.session.idle_timeout','security.session.max_concurrent','security.privileged_action.confirm_required','security.audit.enforcement'],valueOwner:'ConfigurationDomainAdapter'},
  {id:'simulation',kind:'operational',icon:'i-lab',label:{ar:'المحاكاة والتشغيل',en:'Simulation & runtime'},description:{ar:'ملف تشغيل المحاكاة وسياسة التنفيذ',en:'Simulation runtime profile and policy'},keys:['simulation.runtime.profile'],valueOwner:'ConfigurationDomainAdapter'},
  {id:'backup',kind:'operational',icon:'i-folder',label:{ar:'النسخ والاستعادة',en:'Backup & recovery'},description:{ar:'مدة الاحتفاظ وفحص الحزم',en:'Retention window and package checks'},keys:['backup.retention.days'],valueOwner:'ConfigurationDomainAdapter'}
];

/** Proposed values for the open draft revision. Operational ones are created as REAL
 *  ConfigProposals on the adapter; preference ones are compared against LIVE preference reads. */
export const DRAFT_OPERATIONAL_PROPOSALS=Object.freeze([
  {key:'security.session.idle_timeout',proposedValue:'20m'},
  {key:'security.session.max_concurrent',proposedValue:'3'},
  {key:'security.privileged_action.confirm_required',proposedValue:'true'},
  {key:'security.audit.enforcement',proposedValue:'enforce'}
]         );

export const DRAFT_PREFERENCE_PROPOSALS=Object.freeze([
  {key:'density',proposedValue:'compact'},
  {key:'motion',proposedValue:'reduced'},
  {key:'highContrast',proposedValue:'true'},
  {key:'documentWidth',proposedValue:'compact'},
  {key:'toolbar',proposedValue:'compact'},
  {key:'guidance',proposedValue:'true'},
  {key:'clipboardMode',proposedValue:'plain'}
]         );

export const REVISION_PROFILES=Object.freeze([
  {id:'production',label:{ar:'الإنتاج',en:'Production'},tone:'accent',note:{ar:'ملف نشط',en:'Active profile'}},
  {id:'staging',label:{ar:'التجهيز',en:'Staging'},tone:'info',note:{ar:'مطابق للإنتاج',en:'Mirrors production'}},
  {id:'training',label:{ar:'التدريب',en:'Training'},tone:'warn',note:{ar:'قيود مخفّضة',en:'Relaxed limits'}},
  {id:'default',label:{ar:'الافتراضي',en:'Default'},tone:'muted',note:{ar:'لا تغييرات',en:'No overrides'}}
]         );

export const REVISION_LINEAGE=Object.freeze([
  {id:'CFG-REV-0043-DRAFT',state:'DRAFT',age:{ar:'المسودة المفتوحة',en:'Open draft'}},
  {id:'CFG-REV-0042',state:'ACTIVE',age:{ar:'منذ 3 أيام',en:'3 days ago'}},
  {id:'CFG-REV-0041',state:'SUPERSEDED',age:{ar:'منذ 11 يومًا',en:'11 days ago'}},
  {id:'CFG-REV-0040',state:'ARCHIVED',age:{ar:'منذ 26 يومًا',en:'26 days ago'}}
]         );

export const CONFIGURATION_AUTHORITIES=Object.freeze([
  {id:'ScopedPreferencesOwner',role:{ar:'مالك القيم والحفظ لبيانات التفضيلات',en:'Preference value and persistence owner'}},
  {id:'SettingsCenterOwner',role:{ar:'الواجهة المرجعية لإعداد التفضيلات',en:'Canonical preference configuration home'}},
  {id:'ConfigurationDomainAdapter',role:{ar:'راصد ومقترح للإعداد التشغيلي',en:'Operational configuration observe/propose'}},
  {id:'SemanticCommandBus',role:{ar:'مالك الأوامر الدلالية',en:'Semantic command owner'}}
]         );

export const AFFECTED_SURFACES=Object.freeze([
  {id:'shell',label:{ar:'القشرة العامة',en:'Global shell'}},
  {id:'today',label:{ar:'اليوم',en:'Today'}},
  {id:'library',label:{ar:'المكتبة',en:'Library'}},
  {id:'configuration',label:{ar:'الإعداد',en:'Configuration'}},
  {id:'settings-center',label:{ar:'مركز الإعدادات',en:'Settings center'}}
]         );

const coerce=(key       ,value        )=>{
  const definition=(PREFERENCE_DEFINITIONS       )[key];
  if(!definition)return String(value);
  if(typeof definition.safeDefault==='boolean')return String(value)==='true'?'true':'false';
  return String(value);
};

                             
                                                                        
                                                             
                                                                      
                                                               
 

/** Live draft projection: preference rows read the real preference owner, operational rows read
 *  the real adapter proposals. Nothing here is a static fixture once the surface is mounted. */
export function projectDraftChanges({preferences=null,adapter=null,validatedKeys=null}                                                                )              {
  const validated=new Set        (Array.from(validatedKeys||[]));
  const changes              =[];
  for(const proposal of DRAFT_PREFERENCE_PROPOSALS){
    let from='',sourceScope='default';
    if(preferences&&typeof preferences.resolve==='function'){
      const resolved=preferences.resolve(proposal.key);
      from=coerce(proposal.key,resolved.preferredValue);
      sourceScope=resolved.sourceScope||'default';
    }else{
      const definition=(PREFERENCE_DEFINITIONS       )[proposal.key];
      from=coerce(proposal.key,definition?.safeDefault);
    }
    const to=coerce(proposal.key,proposal.proposedValue);
    const noop=from===to;
    changes.push({
      id:`preference:${proposal.key}`,domainId:domainIdFor(proposal.key),key:proposal.key,scope:'preference',
      from,to,
      kind:noop?'NO_OP':(sourceScope==='default'?'ADD':'MODIFY'),
      state:noop?'APPLIED':(validated.has(proposal.key)?'VALIDATED':'PENDING'),
      reason:noop?'ALREADY_ACTIVE':(validated.has(proposal.key)?'SAFE_VALUE_VALIDATED':'NOT_VALIDATED'),
      restartRequired:false,technicalToken:true
    });
  }
  if(adapter&&typeof adapter.proposal==='function'){
    for(const entry of DRAFT_OPERATIONAL_PROPOSALS){
      const proposal=adapter.proposal(entry.key);
      const observation=adapter.rows().find((row    )=>row.key===entry.key);
      if(!observation)continue;
      changes.push({
        id:`operational:${entry.key}`,domainId:domainIdFor(entry.key),key:entry.key,scope:'operational',
        from:String(observation.redactedValue),to:String(entry.proposedValue),
        kind:'MODIFY',
        state:proposal?(proposal.state==='VALIDATED'?'VALIDATED':proposal.state==='INVALID'?'INVALID':proposal.state==='AUTHORITY_PENDING'?'AUTHORITY_PENDING':'PENDING'):'PENDING',
        reason:proposal?.validation?.reason||'PROPOSAL_DRAFTED',
        restartRequired:observation.restartRequired===true,technicalToken:true
      });
    }
  }
  return changes;
}

export function domainIdFor(key       ){
  const domain=CONFIGURATION_DOMAINS.find(entry=>entry.keys.includes(key));
  return domain?domain.id:'security';
}
export function domainById(id       ){return CONFIGURATION_DOMAINS.find(entry=>entry.id===id)||CONFIGURATION_DOMAINS[0]}

                                                                                                                                                                                                               

export function summarizeDraft(changes              )             {
  const live=changes.filter(change=>change.kind!=='NO_OP');
  const by=kind=>live.filter(change=>change.kind===kind).length;
  return {
    total:live.length,additions:by('ADD'),modifications:by('MODIFY'),deletions:by('DELETE'),
    pending:live.filter(change=>change.state==='PENDING').length,
    validated:live.filter(change=>change.state==='VALIDATED').length,
    authorityPending:live.filter(change=>change.state==='AUTHORITY_PENDING').length,
    publishable:live.filter(change=>change.scope==='preference').length,
    noOp:changes.length-live.length,
    domainsTouched:new Set(live.map(change=>change.domainId)).size
  };
}

export const REVISION_TABS=Object.freeze(['diff','log','observations']         );
                                                       
