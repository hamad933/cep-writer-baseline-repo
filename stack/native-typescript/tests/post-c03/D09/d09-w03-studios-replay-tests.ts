import {composeW03RescueGroup, W03_RESCUE_GROUP_CONTRACT} from '../../../surfaces/composition/w03-rescue.js';
import {W03EnterpriseDomain} from '../../../adapters/enterprise/domain.js';
import {createEnterpriseAdapter} from '../../../adapters/w03-enterprise.js';
import {W03ScenarioDomain} from '../../../adapters/scenarios/domain.js';
import {W03LabDomain} from '../../../adapters/labs/domain.js';
import {W03RunDomain} from '../../../adapters/runs/domain.js';
import {W03ResultsDomain} from '../../../adapters/results/domain.js';
import {composeResultsSurface} from '../../../surfaces/results/index.js';
import {TimelineReplayOwner} from '../../../foundation/timeline/replay.js';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';
import {OperationalSessionOwner} from '../../../foundation/operational/session-owner.js';

const rows: Array<{id: string; status: 'PASS' | 'FAIL'; detail?: any; error?: string}> = [];
const assert = (condition: boolean, message = 'assertion failed') => {
  if (!condition) throw Error(message);
};
const equal = (actual: any, expected: any, message = 'values differ') =>
  assert(actual === expected, `${message}: ${actual} !== ${expected}`);

const test = async (id: string, run: () => any) => {
  try {
    const detail = await run();
    rows.push({id, status: 'PASS', detail});
  } catch (error: any) {
    rows.push({id, status: 'FAIL', error: String(error?.stack || error)});
  }
};

const makeSampleResults = () => [
  {
    resultId: 'RES-001',
    revisionId: 'rev-1',
    manifestDigest: 'sha256:res001digest',
    sealed: true,
    label: 'Incident Remediation Run #1',
    schemaVersion: 'results/v1',
    comparatorVersion: 'results-compare/1.0.0',
    comparable: {
      status: {label: 'Execution Status', type: 'string', value: 'RESOLVED'},
      durationMs: {label: 'Duration', type: 'number', value: 4520}
    },
    recordedEvents: [
      {seq: 1, id: 'ev-1', type: 'RUN_INIT', timestamp: '2026-09-25T01:00:00Z', presentationMeta: {sourceEvent: {type: 'INIT'}}},
      {seq: 2, id: 'ev-2', type: 'COMMAND_DISPATCH', timestamp: '2026-09-25T01:00:02Z', presentationMeta: {sourceEvent: {cmd: 'check-bounds'}}},
      {seq: 3, id: 'ev-3', type: 'COMPLETED', timestamp: '2026-09-25T01:00:05Z', presentationMeta: {sourceEvent: {outcome: 'PASS'}}}
    ],
    historicalTerminalBytes: 'exit code 0\nremediation completed'
  },
  {
    resultId: 'RES-002',
    revisionId: 'rev-1',
    manifestDigest: 'sha256:res002digest',
    sealed: true,
    label: 'Incident Remediation Run #2',
    schemaVersion: 'results/v1',
    comparatorVersion: 'results-compare/1.0.0',
    comparable: {
      status: {label: 'Execution Status', type: 'string', value: 'FAILED'},
      durationMs: {label: 'Duration', type: 'number', value: 8900}
    },
    recordedEvents: [
      {seq: 1, id: 'ev-1', type: 'RUN_INIT', timestamp: '2026-09-25T02:00:00Z', presentationMeta: {sourceEvent: {type: 'INIT'}}},
      {seq: 2, id: 'ev-2', type: 'COMMAND_DISPATCH', timestamp: '2026-09-25T02:00:03Z', presentationMeta: {sourceEvent: {cmd: 'check-bounds'}}}
    ],
    historicalTerminalBytes: 'exit code 1\ntimeout exceeded'
  }
];

// 1. Cross-studio composition and Workspace-First architecture
await test('d09.w03.cross-studio-composition-and-workspace-first', () => {
  const shared = {
    structuredHost: {owner: 'StructuredSurfaceHost'},
    spatialRelation: {owner: 'RelationInteractionOwner'},
    timelineReplayOwner: new TimelineReplayOwner(),
    analyticalCompareOwner: new AnalyticalCompareOwner(),
    operationalSessionOwner: new OperationalSessionOwner()
  };
  const group = composeW03RescueGroup({
    shared,
    enterprise: {relationAdapter: createEnterpriseAdapter({fixture:true})}
  });
  equal(group.surfaceIds.length, 5, 'must compose exactly 5 W03 surfaces');
  assert(group.surfaceIds.includes('enterprise'), 'includes enterprise');
  assert(group.surfaceIds.includes('scenarios'), 'includes scenarios');
  assert(group.surfaceIds.includes('labs'), 'includes labs');
  assert(group.surfaceIds.includes('runs'), 'includes runs');
  assert(group.surfaceIds.includes('results'), 'includes results');
  for (const id of group.surfaceIds) {
    const proj = group.project(id);
    assert(proj.interaction.includes('WORKSPACE_FIRST'), `${id} must be WORKSPACE_FIRST`);
    equal(proj.globalReadEditMode, false, `${id} must not be globalReadEditMode`);
  }
  return {surfaces: group.surfaceIds, workspaceFirst: true};
});

// 2. Runs OperationalSessionOwner and Terminal Reuse
await test('d09.runs.operational-session-and-terminal-reuse', () => {
  const sessionOwner = new OperationalSessionOwner();
  const runDomain = new W03RunDomain({sessionOwner});
  const t1 = runDomain.openTerminal({deviceId: 'DEV-WEB-01'});
  equal(t1.ok, true, 'first openTerminal succeeds');
  equal(t1.reusedPresentation, false, 'first openTerminal is fresh');
  equal(t1.runtimeTruth, 'INTERNAL_SIMULATION', 'runtime truth is INTERNAL_SIMULATION');
  const t2 = runDomain.openTerminal({deviceId: 'DEV-WEB-01'});
  equal(t2.ok, true, 'second openTerminal succeeds');
  equal(t2.reusedPresentation, true, 'second openTerminal reuses existing presentation');
  equal(t1.tab.presentationId, t2.tab.presentationId, 'presentationId is preserved');
  const ws = runDomain.workspace();
  assert(ws.terminalPresentationOwner.includes('OperationalSessionOwner'), 'terminalPresentationOwner bound to OperationalSessionOwner');
  return {reusedPresentation: true, presentationId: t1.tab.presentationId};
});

// 3. Runs Live Unsealed vs Sealed Results Isolation
await test('d09.runs.live-unsealed-run-isolated-from-sealed-results', () => {
  const runDomain = new W03RunDomain();
  const liveRecorded = runDomain.recorded();
  assert(liveRecorded && typeof liveRecorded === 'object', 'live recorded is an object');
  equal(liveRecorded.recordedPlayback, 'INERT', 'live recorded playback is inert');
  assert(Array.isArray(liveRecorded.sourceEvents), 'sourceEvents is an array');
  const timelineReplayOwner = new TimelineReplayOwner();
  const analyticalCompareOwner = new AnalyticalCompareOwner();
  let thrownUnsealed = false;
  try {
    new W03ResultsDomain({
      records: [{
        resultId: 'UNSEALED-01',
        revisionId: '1',
        manifestDigest: 'sha256:unsealed',
        sealed: false,
        recordedEvents: []
      }],
      timelineReplayOwner,
      analyticalCompareOwner
    });
  } catch (err: any) {
    thrownUnsealed = String(err.message).includes('RESULT_REVISION_NOT_SEALED');
  }
  assert(thrownUnsealed, 'W03ResultsDomain must reject unsealed run records');
  return {unsealedRejected: true, isolationEnforced: true};
});

// 4. Results TimelineReplayOwner Shared Reuse & No Second Engine
await test('d09.results.timeline-replay-shared-owner-reuse-and-no-second-engine', () => {
  const timelineReplayOwner = new TimelineReplayOwner();
  const analyticalCompareOwner = new AnalyticalCompareOwner();
  let thrownMissing = false;
  try {
    new (W03ResultsDomain as any)({records: makeSampleResults(), analyticalCompareOwner});
  } catch (err: any) {
    thrownMissing = String(err.message).includes('RESULTS_SHARED_TIMELINE_REPLAY_OWNER_REQUIRED');
  }
  assert(thrownMissing, 'W03ResultsDomain must fail closed if timelineReplayOwner is missing');
  const domain = new W03ResultsDomain({
    records: makeSampleResults(),
    timelineReplayOwner,
    analyticalCompareOwner
  });
  equal(domain.replayOwner, timelineReplayOwner, 'domain must reuse injected timelineReplayOwner');
  assert(!('replay' in domain), 'domain must not define private replay state machine');
  return {sharedReplayReused: true, zeroPrivateEngine: true};
});

// 5. Results Replay is Inert Historical - No Runtime Execution
await test('d09.results.replay-inert-historical-no-runtime-execution', () => {
  const timelineReplayOwner = new TimelineReplayOwner();
  const analyticalCompareOwner = new AnalyticalCompareOwner();
  const domain = new W03ResultsDomain({
    records: makeSampleResults(),
    timelineReplayOwner,
    analyticalCompareOwner
  });
  const ref = {resultId: 'RES-001', revisionId: 'rev-1', manifestDigest: 'sha256:res001digest'};
  const initial = domain.replayResult(ref);
  equal(initial.replayExecutesRuntime, false, 'replay does not execute runtime');
  equal(initial.historicalTerminalBytesInert, true, 'historical bytes are inert');
  equal(initial.index, 0, 'starts at timeline index 0');
  const stepped = domain.step(1);
  equal(stepped.index, 1, 'stepped to index 1');
  equal(stepped.replayExecutesRuntime, false, 'step remains runtime-inert');
  return {inertHistorical: true, steppedIndex: stepped.index};
});

// 6. Results AnalyticalCompareOwner Shared Reuse
await test('d09.results.analytical-compare-shared-owner-reuse', () => {
  const timelineReplayOwner = new TimelineReplayOwner();
  const analyticalCompareOwner = new AnalyticalCompareOwner();
  let thrownMissing = false;
  try {
    new (W03ResultsDomain as any)({records: makeSampleResults(), timelineReplayOwner});
  } catch (err: any) {
    thrownMissing = String(err.message).includes('RESULTS_SHARED_ANALYTICAL_COMPARE_OWNER_REQUIRED');
  }
  assert(thrownMissing, 'W03ResultsDomain must fail closed if analyticalCompareOwner is missing');
  const domain = new W03ResultsDomain({
    records: makeSampleResults(),
    timelineReplayOwner,
    analyticalCompareOwner
  });
  const r1 = {resultId: 'RES-001', revisionId: 'rev-1', manifestDigest: 'sha256:res001digest'};
  const r2 = {resultId: 'RES-002', revisionId: 'rev-1', manifestDigest: 'sha256:res002digest'};
  const compareResult = domain.compare({left: r1, right: r2});
  equal(compareResult.state, 'DIFFERENT', 'comparison finds differences');
  equal(compareResult.receipt.owner, 'AnalyticalCompareOwner', 'receipt owner is AnalyticalCompareOwner');
  assert(compareResult.differences.length > 0, 'differences populated');
  return {comparatorOwner: compareResult.receipt.owner, state: compareResult.state, diffCount: compareResult.differences.length};
});

// 7. Results Epistemic Unbound Distinct from Empty
await test('d09.results.epistemic-unbound-distinct-from-empty', () => {
  const timelineReplayOwner = new TimelineReplayOwner();
  const analyticalCompareOwner = new AnalyticalCompareOwner();
  const domain = new W03ResultsDomain({
    records: makeSampleResults(),
    timelineReplayOwner,
    analyticalCompareOwner
  });
  const r1 = {resultId: 'RES-001', revisionId: 'rev-1', manifestDigest: 'sha256:res001digest'};
  // AAR before save is EMPTY
  const emptyAar = domain.aarProjection(r1);
  equal(emptyAar.state, 'EMPTY', 'uncreated AAR is EMPTY');
  equal(emptyAar.revision, 0, 'revision 0');
  // Determinism unverified is DETERMINISM_PROVIDER_UNAVAILABLE, not empty success
  const det = domain.verifyDeterminism({ref: r1});
  equal(det.ok, false, 'determinism without execution provider fails');
  equal(det.code, 'DETERMINISM_PROVIDER_UNAVAILABLE', 'explicit code for unbound provider');
  equal(det.runExecuted, false, 'zero execution');
  return {emptyAarState: emptyAar.state, determinismCode: det.code};
});

// 8. Enterprise Published Revision Immutability
await test('d09.enterprise.published-revision-immutable-twin-rebase-rejected', () => {
  const ent = new W03EnterpriseDomain({
    relationAdapter: createEnterpriseAdapter({fixture:true}),
    authoring: 'PUBLISHED',
    revisionId: 'ENT-PUB-01',
    baseline: {status: 'AVAILABLE', id: 'BL-1', revision: '1', digest: 'd1'}
  });
  const before = ent.snapshot();
  const res = ent.setTwinBinding({
    action: 'rebaseTwin',
    overlayRefs: before.objects.map(x => ({id: x.id, classification: x.classification})),
    conflictsResolved: true,
    targetBaseline: {id: 'BL-2', revision: '2', digest: 'd2'}
  });
  equal(res.ok, false, 'rebaseTwin on published revision must fail');
  assert(String(res.code).includes('PUBLISHED_REVISION_IMMUTABLE'), 'code is PUBLISHED_REVISION_IMMUTABLE');
  return {publishedImmutable: true};
});

// 9. Scenarios & Labs Unbound Resolvers and Lifecycle Gates
await test('d09.scenarios-labs.lifecycle-preflight-and-resolver-unbound-guards', () => {
  const scenario = new W03ScenarioDomain({
    definition: {
      id: 'SC-1', revision: '1', title: 'Scenario 1',
      environment: {capabilities: []},
      phases: [{id: 'P1', name: 'Phase 1', elements: [{id: 'LM1', kind: 'lab', title: 'Lab 1', labRef: {id: 'LAB-UNRESOLVED', revision: '1'}}]}]
    }
  });
  const val = scenario.validate();
  equal(val.ok, false, 'scenario with unresolved lab fails validation');
  assert(val.requirements.some((x: any) => x.code === 'LAB_REVISION_RESOLVER_UNBOUND'), 'reports LAB_REVISION_RESOLVER_UNBOUND');
  const lab = new W03LabDomain({
    definition: {
      id: 'LAB-1', revision: '1', title: 'Lab 1',
      environment: {capabilities: []},
      requiredTools: [],
      tasks: [{id: 'T1', title: 'Task 1', validation: 'ok', expectedSignal: 'sig'}],
      dependencies: []
    }
  });
  const lc = {tools: {}, environmentBinding: {capabilities: []}};
  equal(lab.preflight(lc).status, 'BLOCKED', 'unpublished lab preflight is BLOCKED');
  equal(lab.handoff(lc).code, 'LAB_REVISION_NOT_PUBLISHED', 'unpublished lab handoff rejected');
  return {unresolvedLabRejected: true, unpublishedLabBlocked: true};
});

// 10. Results Candidate Evidence Handoff Preserves Truth Ceiling
await test('d09.results.candidate-evidence-handoff-preserves-truth-ceiling', () => {
  const timelineReplayOwner = new TimelineReplayOwner();
  const analyticalCompareOwner = new AnalyticalCompareOwner();
  const domain = new W03ResultsDomain({
    records: makeSampleResults(),
    timelineReplayOwner,
    analyticalCompareOwner
  });
  const ref = {resultId: 'RES-001', revisionId: 'rev-1', manifestDigest: 'sha256:res001digest'};
  const handoff = domain.handoff({ref});
  equal(handoff.ok, true, 'handoff envelope generated');
  equal(handoff.candidateEvidenceOnly, true, 'envelope is candidateEvidenceOnly');
  equal(handoff.formalAdmissionPerformed, false, 'formal admission not performed');
  equal(handoff.reviewDecisionPerformed, false, 'review decision not performed');
  equal(handoff.auditAuthority, false, 'no audit authority claimed');
  const surface = composeResultsSurface({
    domain,
    shared: {spatialRelation: {owner: 'RelationInteractionOwner'}}
  });
  equal(surface.truthCeiling.sealedFactsMutable, false, 'sealedFactsMutable is false');
  equal(surface.truthCeiling.replayExecutesRuntime, false, 'replayExecutesRuntime is false');
  equal(surface.truthCeiling.reviewDecision, false, 'reviewDecision is false');
  return {candidateEvidenceOnly: true, sealedFactsMutable: false, replayExecutesRuntime: false};
});

const report = {
  suite: 'D09_W03_STUDIOS_REPLAY_TESTS',
  timestamp: new Date().toISOString(),
  pass: rows.filter(r => r.status === 'PASS').length,
  fail: rows.filter(r => r.status === 'FAIL').length,
  tests: rows
};

console.log(JSON.stringify(report, null, 2));
if (report.fail > 0) {
  process.exit(1);
}
