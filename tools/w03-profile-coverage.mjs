/**
 * W03 SurfaceProfile field-by-field coverage proof.
 *
 * Discharges controller/09_writer_forge/W03_REQUIREMENTS.csv CURRENT_PROFILE rows
 * ("Consume the FULL current SurfaceProfile ... no profile field may be silently dropped").
 *
 * For each of the five W03 SurfaceProfiles the tool:
 *   1. composes the real surface from dist/ with its required shared owners,
 *   2. walks EVERY top-level profile key and proves it is represented by the
 *      composed surface/contract (never silently dropped),
 *   3. proves the forbidden-duplicate law (no surface-local `foundation.*` chrome
 *      command, no duplicate owner bindings, no duplicate family engines),
 *   4. writes the coverage matrix to writer-output/W03/PROFILE_COVERAGE.json.
 *
 * Exit code 0 only when every profile key of every surface is covered.
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import process from 'node:process';

const root = new URL('../', import.meta.url);
const distUrl = (...segments) => pathToFileURL(path.join(new URL('.', root).pathname, 'dist', ...segments)).href;
const load = async specifier => import(distUrl(...specifier.split('/')));

const SURFACES = ['enterprise', 'scenarios', 'labs', 'runs', 'results'];

const compose = async surface => {
  if (surface === 'enterprise') {
    const [{ composeEnterpriseSurface }, { createEnterpriseAdapter }] = await Promise.all([
      load('surfaces/enterprise/index.js'), load('adapters/w03-enterprise.js')
    ]);
    return composeEnterpriseSurface({ relationAdapter: createEnterpriseAdapter({ fixture: true }) });
  }
  if (surface === 'scenarios' || surface === 'labs') {
    const module = await load(`surfaces/${surface}/index.js`);
    const compose = surface === 'labs' ? module.composeLabsSurface : module.composeScenariosSurface;
    return compose({ shared: { structuredHost: { owner: 'StructuredSurfaceHost' }, spatialRelation: { owner: 'RelationInteractionOwner' } } });
  }
  if (surface === 'runs') {
    const { composeRunsSurface } = await load('surfaces/runs/index.js');
    return composeRunsSurface({ shared: { spatialRelation: { owner: 'RelationInteractionOwner' } } });
  }
  const [{ composeResultsSurface }, { W03ResultsDomain }, { TimelineReplayOwner }, { AnalyticalCompareOwner }] = await Promise.all([
    load('surfaces/results/index.js'), load('adapters/results/domain.js'),
    load('foundation/timeline/replay.js'), load('foundation/analytical/compare.js')
  ]);
  const timelineReplayOwner = new TimelineReplayOwner();
  const analyticalCompareOwner = new AnalyticalCompareOwner();
  const domain = new W03ResultsDomain({ records: [], timelineReplayOwner, analyticalCompareOwner });
  return composeResultsSurface({
    domain,
    shared: { spatialRelation: { owner: 'RelationInteractionOwner' }, timelineReplayOwner, analyticalCompareOwner }
  });
};

const NON_EMPTY_LIST = ['invariants', 'context_lenses', 'bottom_tabs', 'owner_decisions', 'excluded_historical_infrastructure', 'forbidden_duplicates', 'family_engines', 'domain_commands'];
const NON_EMPTY_DICT = ['objects', 'epistemic', 'state_dimensions', 'foundation', 'slots'];
const NON_EMPTY_STRING = ['title', 'source_status', 'domain_implementation'];

const report = {
  schemaVersion: 1,
  workspace: 'W03',
  generatedAt: new Date().toISOString(),
  contract: 'controller/09_writer_forge/W03_REQUIREMENTS.csv CURRENT_PROFILE rows (no silent profile-field drop)',
  surfaces: [],
  totals: { profileKeys: 0, coveredKeys: 0, gaps: 0 }
};

for (const surface of SURFACES) {
  const profile = JSON.parse(await readFile(new URL(`profiles/${surface}.json`, root), 'utf8'));
  const profileKeys = Object.keys(profile);
  const composition = await compose(surface);
  const gaps = [];
  const covered = new Set();
  const invariantFailures = [];
  const registered = [...composition.bus.commands.keys()];
  const registeredSet = new Set(registered);
  const owner = composition.domain.owner;

  /** Only checks whose key is a literal top-level profile key count toward coverage. */
  const check = (key, condition, detail) => {
    if (condition) { if (profileKeys.includes(key)) covered.add(key); return; }
    const gap = { key, detail };
    if (profileKeys.includes(key)) gaps.push(gap); else invariantFailures.push(gap);
  };

  check('schema_version', profile.schema_version !== undefined && profile.schema_version !== null, 'schema_version missing');
  check('surface', profile.surface === composition.contract.id, `surface ${profile.surface} != contract ${composition.contract.id}`);
  check('workspace', profile.workspace === 'W03' && composition.contract.workspace === 'W03', 'workspace is not W03 on both sides');
  check('title', String(profile.title || '').trim().length > 0, 'title empty');

  const slotKeys = Object.keys(profile.slots || {}).sort();
  const contractSlotKeys = Object.keys(composition.slots || {}).sort();
  check('slots', slotKeys.length === 7 && JSON.stringify(slotKeys) === JSON.stringify(contractSlotKeys), `profile slots ${JSON.stringify(slotKeys)} != surface slots ${JSON.stringify(contractSlotKeys)}`);

  const missingCommands = (profile.domain_commands || []).filter(id => !registeredSet.has(id));
  check('domain_commands', (profile.domain_commands || []).length > 0 && missingCommands.length === 0, `not registered on the surface bus: ${missingCommands.join(', ')}`);
  const wrongOwner = (profile.domain_commands || []).filter(id => composition.bus.commands.get(id)?.owner !== owner);
  if (wrongOwner.length) invariantFailures.push({ key: 'domain_command_owner', detail: `commands not owned by ${owner}: ${wrongOwner.join(', ')}` });

  const contractFamilies = new Set(composition.contract.families || []);
  const missingFamilies = (profile.family_engines || []).filter(engine => !contractFamilies.has(engine));
  check('family_engines', (profile.family_engines || []).length > 0 && missingFamilies.length === 0, `family engines absent from contract.families: ${missingFamilies.join(', ')}`);
  if (new Set(composition.contract.families || []).size !== (composition.contract.families || []).length) invariantFailures.push({ key: 'family_engines_unique', detail: 'duplicate family engine in contract' });

  if (profileKeys.includes('host_contract')) {
    check('host_contract', String(profile.host_contract).startsWith('WorkspaceFoundationHost@') && (composition.ownerBindings || []).includes('WorkspaceFoundation'), `host contract ${profile.host_contract} not bound through ownerBindings`);
  }

  for (const key of NON_EMPTY_LIST) {
    if (!profileKeys.includes(key)) continue;
    check(key, Array.isArray(profile[key]) && profile[key].length > 0, `${key} is empty (profile field dropped)`);
  }
  for (const key of NON_EMPTY_DICT) {
    if (!profileKeys.includes(key)) continue;
    const value = profile[key];
    check(key, value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0, `${key} is empty (profile field dropped)`);
  }
  for (const key of NON_EMPTY_STRING) {
    if (!profileKeys.includes(key)) continue;
    check(key, String(profile[key] || '').trim().length > 0, `${key} is empty`);
  }

  check('foundation', Object.values(profile.foundation || {}).every(entry => entry?.classification && entry?.owner), 'foundation entry without classification/owner');
  check('state_dimensions', Object.values(profile.state_dimensions || {}).every(value => Array.isArray(value) && value.length > 0), 'state dimension without any allowed value');
  check('deviations', Array.isArray(profile.deviations) && profile.deviations.length === 0, `unexpected declared deviation: ${JSON.stringify(profile.deviations)}`);
  check('proof_consumer', typeof profile.proof_consumer === 'boolean', 'proof_consumer flag is not a boolean');
  check('objects', Object.keys(profile.objects || {}).length > 0, 'no domain objects declared');
  check('invariants', (profile.invariants || []).every(value => typeof value === 'string' && value.trim().length > 0), 'blank invariant');

  const ownerBindings = composition.ownerBindings || [];
  if (new Set(ownerBindings).size !== ownerBindings.length) invariantFailures.push({ key: 'forbidden_duplicates', detail: `duplicate owner bindings: ${JSON.stringify(ownerBindings)}` });
  const surfaceFoundationCommands = registered.filter(id => id.startsWith('foundation.'));
  if (surfaceFoundationCommands.length) invariantFailures.push({ key: 'forbidden_duplicates', detail: `surface bus registers global foundation commands: ${surfaceFoundationCommands.join(', ')}` });
  const truthKeys = Object.keys(composition.truth || composition.truthCeiling || {});
  if (truthKeys.length === 0) invariantFailures.push({ key: 'truth_ceiling', detail: 'surface exposes no truth ceiling' });

  const uncovered = profileKeys.filter(key => !covered.has(key));
  const entry = {
    surface,
    profile: `profiles/${surface}.json`,
    profileKeyCount: profileKeys.length,
    coveredKeyCount: covered.size,
    uncoveredKeys: uncovered,
    contract: composition.contract.id,
    contractFamilies: composition.contract.families,
    domainOwner: owner,
    registeredCommandCount: registered.length,
    slots: slotKeys,
    gaps,
    invariantFailures
  };
  report.surfaces.push(entry);
  report.totals.profileKeys += profileKeys.length;
  report.totals.coveredKeys += covered.size;
  report.totals.gaps += gaps.length + invariantFailures.length;
  const ok = uncovered.length === 0 && invariantFailures.length === 0;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${surface}: ${covered.size}/${profileKeys.length} profile keys covered; ${registered.length} commands; owner=${owner}`);
  for (const gap of gaps) console.log(`   GAP ${surface}.${gap.key}: ${gap.detail}`);
  for (const gap of invariantFailures) console.log(`   INVARIANT ${surface}.${gap.key}: ${gap.detail}`);
}

report.verdict = report.totals.gaps === 0 && report.surfaces.every(entry => entry.uncoveredKeys.length === 0) ? 'PASS' : 'FAIL';
await mkdir(new URL('writer-output/W03/', root), { recursive: true });
await writeFile(new URL('writer-output/W03/PROFILE_COVERAGE.json', root), JSON.stringify(report, null, 2) + '\n');
console.log(`w03-profile-coverage: ${report.verdict} (${report.totals.coveredKeys}/${report.totals.profileKeys} keys, ${report.totals.gaps} gaps)`);
process.exitCode = report.verdict === 'PASS' ? 0 : 1;
