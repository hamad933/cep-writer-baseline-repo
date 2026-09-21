// Exact v3.4 Runs inline script[4] fixture, historical assertions are source evidence.
export const fixture={
  runId:'RUN-0042',runUuid:'9f31a0db-3dc4-4ea2-8d80-5f6ef2de8c42',manifestId:'RMF-0042-v1',manifestVersion:1,manifestCreatedAt:'2026-08-14T10:16:02.004Z',manifestDigest:'sha256:cc10231597b4d7f93865f7fc9c5a93da9ca4a31d1fce2f4b607f3e09cb790cf1',isolationScope:'RUN_LOCAL_OVERLAY',title:'Web Application Breach & Response',titleAr:'اختراق تطبيق ويب والاستجابة',runType:'Scenario Run',lifecycle:'RUNNING',health:'HEALTHY',phase:'03 Detection',role:'SOC Analyst',task:'Investigate suspicious SQL activity',seed:20260814,executionModel:'CEP Internal High-Fidelity Simulation',provenance:'SIMULATED',definitionId:'scenario-privileged-login',definitionRevision:'2.4',definitionDigest:'sha256:ae25d319d3b6c1e65854c842e0cc6bf8f9e7692023ae79a4b15c78b75be60119',environmentDigest:'sha256:912db0f4b127d579104e4469bac7e641b41a6628694147eabffb1a357c8407ab',inputDigest:'sha256:cb888a49b53d86d6428cab876105298324958524351439b1ca53950f97fbbf51',baselineId:'BL-2026-08-secure-web-tier',baselineDigest:'sha256:991bc382752082152010e9bc85e7de2659ec13aef1783b5012a8dc8108f1af23',twinRevision:'DT-REV-12',enterprise:'Enterprise Alpha',mode:'GUIDED / TEAM / ROLE-BASED',sourceFixture:true,
  capabilities:['SIMULATED_HTTP_INSPECTION','SIMULATED_EVENT_CORRELATION','SIMULATED_DATABASE_STATE','SIMULATED_APPLICATION_LOGS'],
  alerts:[
    {id:'ALERT-7f3a8c1b',time:'10:24:31',title:'Anomalous SQL query detected',sub:'Correlated application behavior',sev:'High',status:'New',source:'Web Application',ip:'203.0.113.45',rule:'SIM-RULE-1007',technique:'T1190 — Exploit Public-Facing Application',uri:'/search',method:'POST',detail:'Parameter pattern matched simulated detection signature.'},
    {id:'ALERT-f92be0d2',time:'10:22:11',title:'Suspicious parameter patterns',sub:'Repeated request anomaly',sev:'High',status:'New',source:'Web Application',ip:'203.0.113.45',rule:'SIM-RULE-1007',technique:'T1190',uri:'/search',method:'POST',detail:'Multiple simulated requests exceeded the correlation threshold.'},
    {id:'ALERT-5a91641d',time:'10:20:47',title:'Potential database access anomaly',sub:'Unusual query volume',sev:'Medium',status:'New',source:'Database',ip:'10.20.40.15',rule:'SIM-RULE-DB04',technique:'Behavior anomaly',uri:'db://app-db/query',method:'QUERY',detail:'Simulated query rate diverged from the baseline.'},
    {id:'ALERT-6d281ce9',time:'10:18:09',title:'Failed login attempts spike',sub:'From single source IP',sev:'Low',status:'New',source:'Identity Service',ip:'203.0.113.45',rule:'SIM-RULE-ID03',technique:'Authentication anomaly',uri:'/login',method:'POST',detail:'Failed authentication count crossed the simulated threshold.'}
  ],
  events:[
    {seq:117,time:'10:24:31.482',source:'Web Application',type:'DETECTION_RULE_MATCHED',detail:'SIM-RULE-1007 matched correlated request state',actor:'SIM:ENGINE',kind:'telemetry'},
    {seq:116,time:'10:24:31.201',source:'Web Application',type:'REQUEST_BLOCKED',detail:'Policy action recorded in simulation state: BLOCK',actor:'SIM:WAF',kind:'action'},
    {seq:115,time:'10:24:30.904',source:'Web Application',type:'HTTP_REQUEST_OBSERVED',detail:'POST /search · synthetic fixture traffic',actor:'SIM:CLIENT',kind:'event'},
    {seq:114,time:'10:24:30.661',source:'Web Application',type:'PARAMETER_ANOMALY',detail:'Input feature set diverged from baseline',actor:'SIM:APP',kind:'telemetry'},
    {seq:113,time:'10:24:29.337',source:'Web Application',type:'SESSION_ESTABLISHED',detail:'Session mapped to synthetic IP 203.0.113.45',actor:'SIM:APP',kind:'event'},
    {seq:112,time:'10:24:28.901',source:'Firewall',type:'NETWORK_FLOW_ALLOWED',detail:'203.0.113.45 → web-app:443',actor:'SIM:FIREWALL',kind:'event'}
  ],
  tasks:[
    {id:'T-01',label:'Review correlated application signals',status:'DONE',progress:100},
    {id:'T-02',label:'Investigate suspicious SQL activity',status:'ACTIVE',progress:62},
    {id:'T-03',label:'Validate potential database impact',status:'LOCKED',progress:0},
    {id:'T-04',label:'Record defensible observation',status:'LOCKED',progress:0}
  ],
  devices:[{id:'DEV-WEB-01',name:'Web Application',type:'SIMULATED_WEB_APP',state:'HEALTHY'},{id:'DEV-DB-01',name:'Database',type:'SIMULATED_DATABASE',state:'HEALTHY'},{id:'DEV-SIEM-01',name:'SIEM',type:'SIMULATED_SIEM',state:'HEALTHY'}],
  snapshots:[{id:'SNAP-0001',seq:1,kind:'RUN_PREPARATION',digest:'sha256:4d88444b5c833756a039387dd3ef2f71b81d50f878e1d98bac8874e5435e420f',time:'10:16:02'},{id:'SNAP-0002',seq:2,kind:'MANUAL',digest:'sha256:63b9f58a944967a130bec747a23d9767710074778ddf40e5e96c75821cb07541',time:'10:21:15'}],
  logs:[
    '[10:16:02.004] [SIMULATED] RUN_PREPARED source=scenario-privileged-login rev=2.4 seed=20260814',
    '[10:16:02.017] [SIMULATED] MANIFEST_FROZEN input_digest=cb888a49b53d…',
    '[10:16:02.041] [SIMULATED] SNAPSHOT_CAPTURED kind=RUN_PREPARATION seq=1',
    '[10:16:04.100] [SIMULATED] LIFECYCLE PREPARING -> READY',
    '[10:16:11.256] [SIMULATED] LIFECYCLE READY -> RUNNING',
    '[10:21:15.028] [SIMULATED] SNAPSHOT_CAPTURED kind=MANUAL seq=2',
    '[10:24:31.482] [SIMULATED] EVENT DETECTION_RULE_MATCHED seq=117 rule=SIM-RULE-1007'
  ]
};
