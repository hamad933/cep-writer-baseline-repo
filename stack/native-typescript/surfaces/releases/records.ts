/* RELEASES SURFACE RECORD MODEL (presentation-side).
 *
 * W05-RELEASES owns this file. It carries the structured, realistic release records that the
 * Owner-confirmed Releases reference composes (identity, build statement, scope, gates,
 * verification results, deployment stages, rollback readiness, approvers, notes, risks,
 * verification events). The DOMAIN adapter stays authoritative for the three separated truths
 * (technical readiness / Owner authorization / deployment observation); these records only add
 * the presentation detail around them and are keyed by the same candidateId.
 *
 * Basis law: exact commit/tree/artifact/evidence digests are synthetic fixture values.
 * Nothing here ever asserts a successful release, publish, approval or deployment that the
 * domain does not hold. Unknown candidates (not in this map) are rendered from domain truth
 * alone with their presentation detail declared UNAVAILABLE — never invented.
 */

export type GateState='pass'|'fail'|'warn'|'pending';
export type ChannelKey='internal'|'beta'|'production';
export type EnvironmentKey='staging'|'preProd'|'production';
export type DisplayState='draft'|'readyWarning'|'ready'|'held'|'released'|'rolledBack';

export interface ReleaseRecord{
  candidateId:string;
  domainVersion?:boolean;
  /** Domain-authoritative facts (the domain adapter is the single source of these three axes). */
  domain:{state:'ASSEMBLED'|'TECHNICALLY_READY'|'NOT_READY';authorization:'NONE'|'REQUESTED'|'GRANTED'|'REVOKED';deployment:'NOT_DEPLOYED'|'IN_PROGRESS'|'DEPLOYED'|'FAILED'|'UNKNOWN';deploymentObservedAt:string|null};
  version:string;
  channel:ChannelKey;
  target:'productionCandidate'|'preProduction';
  environment:EnvironmentKey;
  createdAt:string;
  createdBy:string;
  editedAt:string;
  ageMinutes:number;
  build:{id:string;branch:string;commit:string;ci:'ok'|'fail';verifiedAt:string;irreversible:boolean};
  scope:{components:number;services:number;artifacts:number;checks:number};
  gates:{key:string;state:GateState}[];
  results:{key:string;state:GateState;detail:string}[];
  approvers:{role:string;person:string;state:'granted'|'pending'|'missing'}[];
  rollback:{state:'ready'|'partial'|'blocked';previous:string;plan:string;minutes:number|null};
  stages:{current:'draft'|'validating'|'ready'|'promoted'|'released';held:boolean;rolledBack:boolean};
  notes:{ar:string;en:string}[];
  risks:{key:string;value:string;tone:'ok'|'warn'|'bad'|'muted'}[];
  interpretation:{from:EnvironmentKey;to:EnvironmentKey;note:{ar:string;en:string}};
  events:{at:string;key:string;ok:boolean}[];
  files:{path:string;kind:'source'|'binary'|'doc';now:string;before:string;delta:string;tone:'ok'|'warn'|'bad'|'muted'}[];
  packageState:{state:'ok'|'warn'|'bad';key:string};
}

const hex=(chars:string,n=40)=>chars.repeat(n);
const sha=(seed:string)=>hex(seed,10).slice(0,40);
const digest=(seed:string)=>hex(seed,16).slice(0,64);

export const RECORD_BASIS='W05_SURFACE_REPRESENTATIVE_RECORD · commit/tree/artifact/evidence digests are synthetic fixture values bound to these candidates for presentation; this surface never claims a built artifact, an Owner approval or a deployment that the domain does not hold.';

const standardGates=(states:GateState[]):{key:string;state:GateState}[]=>[
  {key:'gate.security',state:states[0]},{key:'gate.operations',state:states[1]},{key:'gate.notifications',state:states[2]},
  {key:'gate.audit',state:states[3]},{key:'gate.encryption',state:states[4]},{key:'gate.observability',state:states[5]}
];
const standardResults=(states:GateState[]):{key:string;state:GateState;detail:string}[]=>[
  {key:'res.signatures',state:states[0],detail:'artifact-signature'},
  {key:'res.migrations',state:states[1],detail:'db-migration-dry-run'},
  {key:'res.broadcast',state:states[2],detail:'broadcast-schedule'},
  {key:'res.observability',state:states[3],detail:'metrics-and-alerts'},
  {key:'res.rollback',state:states[4],detail:'rollback-plan-check'}
];

export const RELEASE_RECORDS:ReleaseRecord[]=([
  {
    candidateId:'REL-2026.08.31-RC2',
    domain:{state:'TECHNICALLY_READY',authorization:'NONE',deployment:'NOT_DEPLOYED',deploymentObservedAt:null},
    version:'v0.4.0-rc2',channel:'internal',target:'productionCandidate',environment:'preProd',
    createdAt:'2026-08-31T09:15:00Z',createdBy:'System Release Bot',editedAt:'2026-08-31T09:26:00Z',ageMinutes:25,
    build:{id:'build/2026.08.31.0912',branch:'main',commit:sha('4a3cbb4'),ci:'ok',verifiedAt:'2026-08-31 09:20',irreversible:true},
    scope:{components:4,services:11,artifacts:27,checks:143},
    gates:standardGates(['pass','warn','pass','pass','pass','pending']),
    results:standardResults(['pass','pass','warn','pass','pending']),
    approvers:[
      {role:'approver.releaseManager',person:'R. Haddad',state:'granted'},
      {role:'approver.securityOwner',person:'S. Okonkwo',state:'missing'},
      {role:'approver.operationsLead',person:'M. Ferreira',state:'pending'},
      {role:'approver.productOwner',person:'L. Zhang',state:'pending'}
    ],
    rollback:{state:'ready',previous:'v0.3.9',plan:'plan.compatible',minutes:10},
    stages:{current:'ready',held:false,rolledBack:false},
    notes:[
      {ar:'إضافة طبقة تخزين مؤقت للمحركات المحاكاة مع سقف ذاكرة معلن.',en:'Added a simulation-engine cache layer with a declared memory ceiling.'},
      {ar:'تحديث التوقيع الرقمي للحزم وسجل تدقيق الوصول للإرسال.',en:'Updated package signing and the dispatch access audit trail.'},
      {ar:'تصحيح حدّ جلسة المصادقة وإعادة تمرير التحقق من المهاجمات.',en:'Fixed the authentication session bound and re-ran the inject checks.'},
      {ar:'توثيق خطط التراجع ومسارات الاستعادة داخل دليل الإصدار.',en:'Documented rollback plans and recovery paths in the release handbook.'}
    ],
    risks:[
      {key:'risk.upgradeWindow',value:'00:30–01:00 UTC',tone:'warn'},
      {key:'risk.dependencies',value:'MySQL 8.0 · Redis 7',tone:'muted'},
      {key:'risk.approvals',value:'3 open',tone:'bad'}
    ],
    interpretation:{from:'preProd',to:'production',note:{ar:'الترقية إلى الإنتاج تتطلب اعتماد المالك الصريح؛ الجاهزية التقنية وحدها لا تكفي.',en:'Promotion to Production requires explicit Owner authorization; technical readiness alone is never sufficient.'}},
    events:[
      {at:'09:42:11',key:'event.signatureCheck',ok:true},
      {at:'09:41:55',key:'event.broadcastSync',ok:true},
      {at:'09:41:22',key:'event.approvalReceipt',ok:false},
      {at:'09:40:18',key:'event.artifactScan',ok:true}
    ],
    files:[
      {path:'/services/sim-engine',kind:'binary',now:'120.4 MB',before:'125.7 MB',delta:'−5.3 MB',tone:'ok'},
      {path:'/apps/editor',kind:'binary',now:'85.2 MB',before:'88.9 MB',delta:'−3.7 MB',tone:'ok'},
      {path:'/libs/common',kind:'binary',now:'32.1 MB',before:'32.1 MB',delta:'—',tone:'muted'},
      {path:'/docs/release-notes.md',kind:'doc',now:'—',before:'14.2 KB',delta:'+14.2 KB',tone:'warn'}
    ],
    packageState:{state:'warn',key:'package.needsApproval'}
  },
  {
    candidateId:'REL-2026.08.30-RC1',
    domain:{state:'TECHNICALLY_READY',authorization:'GRANTED',deployment:'DEPLOYED',deploymentObservedAt:'2026-08-30T09:20:00Z'},
    version:'v0.4.0-rc1',channel:'internal',target:'productionCandidate',environment:'production',
    createdAt:'2026-08-30T07:04:00Z',createdBy:'System Release Bot',editedAt:'2026-08-30T09:20:00Z',ageMinutes:1440+7*60,
    build:{id:'build/2026.08.30.0701',branch:'release/v0.4.0',commit:sha('71e0d9a'),ci:'ok',verifiedAt:'2026-08-30 07:12',irreversible:false},
    scope:{components:4,services:11,artifacts:24,checks:138},
    gates:standardGates(['pass','pass','pass','pass','pass','pass']),
    results:standardResults(['pass','pass','pass','pass','pass']),
    approvers:[
      {role:'approver.releaseManager',person:'R. Haddad',state:'granted'},
      {role:'approver.securityOwner',person:'S. Okonkwo',state:'granted'},
      {role:'approver.operationsLead',person:'M. Ferreira',state:'granted'},
      {role:'approver.productOwner',person:'L. Zhang',state:'granted'}
    ],
    rollback:{state:'ready',previous:'v0.3.9',plan:'plan.compatible',minutes:8},
    stages:{current:'released',held:false,rolledBack:false},
    notes:[
      {ar:'إصدار معتمد ومُنشر مع مراقبة النشر المنفصلة عن الجاهزية التقنية.',en:'Authorized release deployed with deployment observed through a separate provider.'},
      {ar:'تحسين أداء قراءة سجلات التدقيق ضمن قيود الاستعلام.',en:'Improved audit-log read performance within the query bounds.'},
      {ar:'مراجعات التبعيات الأمنية قبل الاعتماد الصريح.',en:'Security dependency refresh completed before explicit authorization.'}
    ],
    risks:[
      {key:'risk.upgradeWindow',value:'closed',tone:'ok'},
      {key:'risk.dependencies',value:'MySQL 8.0 · Redis 7',tone:'muted'},
      {key:'risk.observability',value:'7d watch',tone:'ok'}
    ],
    interpretation:{from:'production',to:'production',note:{ar:'نُشر فعليًا ورُصد عبر مزوّد نشر منفصل؛ الاستمرارية ليست إقرار الجاهزية.',en:'Actually deployed and observed through a separate deployment provider; continuity is not readiness.'}},
    events:[
      {at:'09:20:04',key:'event.deploymentObserved',ok:true},
      {at:'09:14:37',key:'event.approvalReceipt',ok:true},
      {at:'09:12:50',key:'event.broadcastSync',ok:true},
      {at:'09:11:02',key:'event.artifactScan',ok:true}
    ],
    files:[
      {path:'/services/sim-engine',kind:'binary',now:'125.7 MB',before:'124.9 MB',delta:'+0.8 MB',tone:'warn'},
      {path:'/apps/editor',kind:'binary',now:'88.9 MB',before:'88.9 MB',delta:'—',tone:'muted'},
      {path:'/libs/common',kind:'binary',now:'32.1 MB',before:'31.4 MB',delta:'+0.7 MB',tone:'warn'},
      {path:'/docs/release-notes.md',kind:'doc',now:'14.2 KB',before:'13.8 KB',delta:'+0.4 KB',tone:'ok'}
    ],
    packageState:{state:'ok',key:'package.verified'}
  },
  {
    candidateId:'REL-2026.08.29-RC3',
    domain:{state:'NOT_READY',authorization:'REVOKED',deployment:'NOT_DEPLOYED',deploymentObservedAt:null},
    version:'v0.4.0-rc0',channel:'internal',target:'preProduction',environment:'staging',
    createdAt:'2026-08-29T16:30:00Z',createdBy:'M. Ferreira',editedAt:'2026-08-29T18:02:00Z',ageMinutes:2*1440+3*60,
    build:{id:'build/2026.08.29.1627',branch:'hotfix/session-bound',commit:sha('c52b18e'),ci:'fail',verifiedAt:'2026-08-29 16:41',irreversible:false},
    scope:{components:3,services:9,artifacts:19,checks:121},
    gates:standardGates(['fail','pass','pass','pass','pending','pending']),
    results:standardResults(['fail','fail','pass','pass','pending']),
    approvers:[
      {role:'approver.releaseManager',person:'R. Haddad',state:'granted'},
      {role:'approver.securityOwner',person:'S. Okonkwo',state:'granted'},
      {role:'approver.operationsLead',person:'M. Ferreira',state:'missing'},
      {role:'approver.productOwner',person:'L. Zhang',state:'pending'}
    ],
    rollback:{state:'blocked',previous:'v0.3.8',plan:'plan.unverified',minutes:null},
    stages:{current:'validating',held:true,rolledBack:false},
    notes:[
      {ar:'معلّق بعد فشل توقيع الحزمة وفشل تجربة ترحيل قاعدة البيانات.',en:'Held after a package signature failure and a failed database migration dry-run.'},
      {ar:'إعادة بناء الحزمة مطلوبة قبل أي طلب اعتماد جديد.',en:'Package rebuild is required before any new authorization request.'}
    ],
    risks:[
      {key:'risk.signature',value:'FAILED',tone:'bad'},
      {key:'risk.migration',value:'dry-run 2 errors',tone:'bad'},
      {key:'risk.dependencies',value:'MySQL 8.0',tone:'muted'}
    ],
    interpretation:{from:'staging',to:'preProd',note:{ar:'الحالة المُعاد ضبطها رُصدت ولا تتحول إلى نجاح؛ الإبقاء موقوت حتى عودة التحقق.',en:'The reset state stays observed and never converts to success; held until checks pass again.'}},
    events:[
      {at:'18:02:44',key:'event.signatureCheck',ok:false},
      {at:'17:58:12',key:'event.migrationDryRun',ok:false},
      {at:'17:44:09',key:'event.artifactScan',ok:true},
      {at:'17:40:55',key:'event.broadcastSync',ok:true}
    ],
    files:[
      {path:'/services/sim-engine',kind:'binary',now:'119.8 MB',before:'120.4 MB',delta:'−0.6 MB',tone:'ok'},
      {path:'/apps/editor',kind:'binary',now:'84.6 MB',before:'85.2 MB',delta:'−0.6 MB',tone:'ok'},
      {path:'/libs/common',kind:'binary',now:'32.1 MB',before:'32.1 MB',delta:'—',tone:'muted'},
      {path:'/db/migrations/014_session.sql',kind:'source',now:'6.4 KB',before:'—',delta:'+6.4 KB',tone:'bad'}
    ],
    packageState:{state:'bad',key:'package.signatureFailed'}
  },
  {
    candidateId:'REL-2026.08.27-RC2',
    domain:{state:'ASSEMBLED',authorization:'NONE',deployment:'UNKNOWN',deploymentObservedAt:null},
    version:'v0.3.9-rc2',channel:'beta',target:'preProduction',environment:'staging',
    createdAt:'2026-08-27T11:12:00Z',createdBy:'System Release Bot',editedAt:'2026-08-27T11:58:00Z',ageMinutes:4*1440+8*60,
    build:{id:'build/2026.08.27.1110',branch:'release/v0.3.9',commit:sha('9b41f70'),ci:'ok',verifiedAt:'2026-08-27 11:31',irreversible:false},
    scope:{components:4,services:10,artifacts:17,checks:96},
    gates:standardGates(['pass','pass','pending','pass','pass','pending']),
    results:standardResults(['pass','pass','pending','pass','pending']),
    approvers:[
      {role:'approver.releaseManager',person:'R. Haddad',state:'granted'},
      {role:'approver.securityOwner',person:'S. Okonkwo',state:'pending'},
      {role:'approver.operationsLead',person:'M. Ferreira',state:'pending'},
      {role:'approver.productOwner',person:'L. Zhang',state:'pending'}
    ],
    rollback:{state:'partial',previous:'v0.3.8',plan:'plan.draft',minutes:14},
    stages:{current:'draft',held:false,rolledBack:false},
    notes:[
      {ar:'مسودة مجمّعة: التحقق التقني لم يكتمل ولم تُطلب مصادقة المالك.',en:'Assembled draft: technical verification is incomplete and no Owner authorization was requested.'},
      {ar:'بانتظار نتائج التحقق من الحزمة قبل الترقية إلى جاهز.',en:'Awaiting package check results before promotion to Ready.'}
    ],
    risks:[
      {key:'risk.verifications',value:'3 pending',tone:'warn'},
      {key:'risk.dependencies',value:'Redis 7',tone:'muted'},
      {key:'risk.rollout',value:'not scheduled',tone:'muted'}
    ],
    interpretation:{from:'staging',to:'preProd',note:{ar:'التجميع وحده لا يعني الجاهزية؛ لا يُعرض أي نجاح تحقق قبل ورود النتائج.',en:'Assembly alone is not readiness; no check success is shown before results arrive.'}},
    events:[
      {at:'11:58:21',key:'event.artifactScan',ok:true},
      {at:'11:31:47',key:'event.broadcastSync',ok:true},
      {at:'11:30:02',key:'event.signatureCheck',ok:true},
      {at:'11:12:36',key:'event.assembled',ok:true}
    ],
    files:[
      {path:'/services/sim-engine',kind:'binary',now:'120.4 MB',before:'120.4 MB',delta:'—',tone:'muted'},
      {path:'/apps/editor',kind:'binary',now:'85.2 MB',before:'85.0 MB',delta:'+0.2 MB',tone:'warn'},
      {path:'/libs/common',kind:'binary',now:'32.1 MB',before:'32.1 MB',delta:'—',tone:'muted'},
      {path:'/docs/release-notes.md',kind:'doc',now:'11.7 KB',before:'—',delta:'+11.7 KB',tone:'warn'}
    ],
    packageState:{state:'warn',key:'package.checksPending'}
  },
  {
    candidateId:'REL-2026.08.25-RC1',
    domain:{state:'ASSEMBLED',authorization:'NONE',deployment:'UNKNOWN',deploymentObservedAt:null},
    version:'v0.3.9-rc1',channel:'beta',target:'preProduction',environment:'staging',
    createdAt:'2026-08-25T08:47:00Z',createdBy:'System Release Bot',editedAt:'2026-08-25T09:05:00Z',ageMinutes:6*1440+12*60,
    build:{id:'build/2026.08.25.0844',branch:'release/v0.3.9',commit:sha('2f6ac3d'),ci:'ok',verifiedAt:'2026-08-25 08:59',irreversible:false},
    scope:{components:3,services:9,artifacts:14,checks:88},
    gates:standardGates(['pass','pending','pending','pass','pending','pending']),
    results:standardResults(['pass','pending','pending','pending','pending']),
    approvers:[
      {role:'approver.releaseManager',person:'R. Haddad',state:'pending'},
      {role:'approver.securityOwner',person:'S. Okonkwo',state:'pending'},
      {role:'approver.operationsLead',person:'M. Ferreira',state:'pending'},
      {role:'approver.productOwner',person:'L. Zhang',state:'pending'}
    ],
    rollback:{state:'partial',previous:'v0.3.8',plan:'plan.draft',minutes:16},
    stages:{current:'draft',held:false,rolledBack:false},
    notes:[
      {ar:'مسودة أولى مجمّعة من فرع الإصدار؛ التحقق جزئي والاعتماد لم يبدأ.',en:'First assembled draft from the release branch; verification partial, authorization not started.'},
      {ar:'تسجيل الأحداث وحده لا يعني قبولًا أو نشرًا.',en:'Recording events alone never implies acceptance or publication.'}
    ],
    risks:[
      {key:'risk.verifications',value:'5 pending',tone:'warn'},
      {key:'risk.dependencies',value:'MySQL 8.0',tone:'muted'},
      {key:'risk.rollout',value:'not scheduled',tone:'muted'}
    ],
    interpretation:{from:'staging',to:'preProd',note:{ar:'المسودة تبقى غير مُرقّاة حتى اكتمال التحقق وطلب المصادقة صراحةً.',en:'The draft stays unpromoted until verification completes and authorization is requested explicitly.'}},
    events:[
      {at:'09:05:14',key:'event.artifactScan',ok:true},
      {at:'08:59:33',key:'event.assembled',ok:true},
      {at:'08:52:10',key:'event.broadcastSync',ok:false},
      {at:'08:47:02',key:'event.assembled',ok:true}
    ],
    files:[
      {path:'/services/sim-engine',kind:'binary',now:'119.6 MB',before:'—',delta:'+119.6 MB',tone:'warn'},
      {path:'/apps/editor',kind:'binary',now:'84.4 MB',before:'—',delta:'+84.4 MB',tone:'warn'},
      {path:'/libs/common',kind:'binary',now:'31.9 MB',before:'—',delta:'+31.9 MB',tone:'warn'},
      {path:'/docs/release-notes.md',kind:'doc',now:'9.1 KB',before:'—',delta:'+9.1 KB',tone:'warn'}
    ],
    packageState:{state:'warn',key:'package.checksPending'}
  },
  {
    candidateId:'REL-2026.08.21-RC4',
    domain:{state:'TECHNICALLY_READY',authorization:'GRANTED',deployment:'FAILED',deploymentObservedAt:'2026-08-21T15:48:00Z'},
    version:'v0.3.8-rc4',channel:'production',target:'productionCandidate',environment:'production',
    createdAt:'2026-08-21T13:20:00Z',createdBy:'System Release Bot',editedAt:'2026-08-21T15:48:00Z',ageMinutes:10*1440+4*60,
    build:{id:'build/2026.08.21.1317',branch:'release/v0.3.8',commit:sha('e8d05b2'),ci:'fail',verifiedAt:'2026-08-21 13:34',irreversible:true},
    scope:{components:4,services:10,artifacts:21,checks:130},
    gates:standardGates(['pass','pass','pass','pass','pass','fail']),
    results:standardResults(['pass','pass','pass','fail','pass']),
    approvers:[
      {role:'approver.releaseManager',person:'R. Haddad',state:'granted'},
      {role:'approver.securityOwner',person:'S. Okonkwo',state:'granted'},
      {role:'approver.operationsLead',person:'M. Ferreira',state:'granted'},
      {role:'approver.productOwner',person:'L. Zhang',state:'granted'}
    ],
    rollback:{state:'ready',previous:'v0.3.7',plan:'plan.executed',minutes:6},
    stages:{current:'promoted',held:false,rolledBack:true},
    notes:[
      {ar:'رُجع بعد فشل الرصد في الإنتاج؛ خطة التراجع نُفّذت خلال 6 دقائق.',en:'Rolled back after an observation failure in Production; the rollback plan executed in 6 minutes.'},
      {ar:'ملاحظة: فشل الرصد لا يُعاد كتابته كنجاح نشر.',en:'Note: an observation failure is never rewritten as a successful deployment.'}
    ],
    risks:[
      {key:'risk.observability',value:'FAILED in production',tone:'bad'},
      {key:'risk.rollback',value:'executed 6 min',tone:'ok'},
      {key:'risk.dependencies',value:'MySQL 8.0 · Redis 7',tone:'muted'}
    ],
    interpretation:{from:'production',to:'staging',note:{ar:'الرجوع رُصد كحدث منفصل؛ الإنتاج عاد إلى v0.3.7 دون فقدان السجل.',en:'The rollback is observed as a separate event; Production returned to v0.3.7 with the record intact.'}},
    events:[
      {at:'15:48:30',key:'event.rollbackObserved',ok:true},
      {at:'15:31:12',key:'event.observabilityFail',ok:false},
      {at:'15:02:44',key:'event.deploymentObserved',ok:true},
      {at:'14:58:07',key:'event.approvalReceipt',ok:true}
    ],
    files:[
      {path:'/services/sim-engine',kind:'binary',now:'124.9 MB',before:'124.9 MB',delta:'—',tone:'muted'},
      {path:'/apps/editor',kind:'binary',now:'88.4 MB',before:'88.4 MB',delta:'—',tone:'muted'},
      {path:'/libs/common',kind:'binary',now:'31.4 MB',before:'31.4 MB',delta:'—',tone:'muted'},
      {path:'/docs/release-notes.md',kind:'doc',now:'13.8 KB',before:'13.8 KB',delta:'—',tone:'muted'}
    ],
    packageState:{state:'bad',key:'package.rolledBack'}
  }
] as ReleaseRecord[]);

const RECORD_BY_ID=new Map(RELEASE_RECORDS.map(record=>[record.candidateId,record]));

const hexSeed=(seed:string,n:number)=>seed.repeat(Math.ceil(n/seed.length)).slice(0,n);
/** Domain candidates derived from the record model: commit/tree/artifact/evidence are synthetic
 *  but stable and distinct; the three separated axes come straight from the record's domain block. */
export function domainCandidates():any[]{
  return RELEASE_RECORDS.map(record=>{
    const seed=hexSeed(String(record.candidateId.replace(/[^0-9a-f]/gi,'').toLowerCase()||'rc'),4);
    return {
      candidateId:record.candidateId,
      commitSHA:record.build.commit,
      treeSHA:hexSeed(seed+'a',40),
      artifactDigest:hexSeed(seed+'b',40),
      evidenceDigest:hexSeed(seed+'c',64),
      state:record.domain.state,
      authorization:record.domain.authorization,
      deployment:record.domain.deployment,
      deploymentObservedAt:record.domain.deploymentObservedAt,
      recordBasis:RECORD_BASIS
    };
  });
}

/** Presentation detail for a candidate. Candidates outside the representative set (tests, future
 *  domain records) get a record built ONLY from domain truth — no invented scope, gates or notes. */
export function releaseRecord(candidateId:string,domain:any):ReleaseRecord|null{
  const known=RECORD_BY_ID.get(candidateId);
  if(known)return known;
  if(!domain)return null;
  return {
    candidateId,domainVersion:true,
    domain:{state:domain.state||'ASSEMBLED',authorization:domain.authorization||'NONE',deployment:domain.deployment||'UNKNOWN',deploymentObservedAt:domain.deploymentObservedAt||null},
    version:'—',channel:'internal',target:'productionCandidate',environment:'staging',
    createdAt:'—',createdBy:'—',editedAt:'—',ageMinutes:0,
    build:{id:'UNAVAILABLE',branch:'—',commit:String(domain.commitSHA||'').slice(0,12),ci:'fail',verifiedAt:'—',irreversible:false},
    scope:{components:0,services:0,artifacts:0,checks:0},
    gates:[],results:[],
    approvers:[],
    rollback:{state:'blocked',previous:'—',plan:'—',minutes:null},
    stages:{current:'draft',held:false,rolledBack:false},
    notes:[],risks:[],interpretation:{from:'staging',to:'preProd',note:{ar:'لا تتوفر تفاصيل عرض لهذا المرشح؛ تُعرض حقائق النطاق فقط.',en:'No presentation detail exists for this candidate; only domain facts are shown.'}},
    events:[],files:[],
    packageState:{state:'warn',key:'package.unavailable'}
  } as ReleaseRecord;
}
