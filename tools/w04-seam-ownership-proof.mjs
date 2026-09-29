/**
 * W04 — w04-rescue seam single-owner invariant proof (packet §10 acceptance (d)).
 *
 * The w04 rescue seam is a **W04-group seam, not a reviews-only seam** (ownership adjudication
 * mechanic #7, C-14). This proof measures the single-owner invariants directly:
 *
 *   1. exactly ONE seam implementation exists in product source;
 *   2. exactly ONE domain class per W04 family (no competing owner);
 *   3. the seam never creates shared owners locally (localSharedOwnerCreation=false everywhere);
 *   4. the seam delegates to the CENTRAL AnalyticalCompareOwner / Collection / Audit owners and
 *      reports INTEGRATION_REQUIRED when the controller did not inject them;
 *   5. provider ids are unique and W04-owned;
 *   6. grouping authority is not claimed (Q-5 stays open).
 *
 * Writes `writer-output/W04/SEAM_OWNERSHIP_PROOF.json`. Exit 1 on any failed check.
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { canonicalSourceIdentity } from './source-tree-identity.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const nativeRoot = path.join(root, 'stack/native-typescript');
const outPath = path.join(root, 'writer-output/W04/SEAM_OWNERSHIP_PROOF.json');
const git = command => { try { return String(execSync(command, { cwd: root, encoding: 'utf8' })).trim(); } catch { return ''; } };

const result = { schemaVersion: 1, workspace: 'W04', proof: 'W04_SEAM_SINGLE_OWNER_INVARIANT', executedAt: new Date().toISOString(), checks: [] };
const check = (id, pass, detail) => { result.checks.push({ id, pass: pass === true, detail }); return pass === true; };

const walk = async dir => {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else out.push(full);
  }
  return out;
};
const allFiles = await walk(nativeRoot);
const productFiles = allFiles.filter(p => p.endsWith('.ts') && !p.includes(`${path.sep}tests${path.sep}`) && !p.endsWith('.d.ts'));
const countIn = async (files, needle) => {
  let n = 0;
  for (const file of files) { const src = await readFile(file, 'utf8'); n += src.split(needle).length - 1; }
  return n;
};

/* ---------------------------------------------------------------- 1. one seam */

const seamFiles = productFiles.filter(p => p.endsWith(`${path.sep}w04-rescue.ts`));
check('S1-exactly-one-w04-rescue-seam', seamFiles.length === 1, {
  count: seamFiles.length,
  files: seamFiles.map(p => path.relative(root, p)),
  expected: 'stack/native-typescript/surfaces/composition/w04-rescue.ts'
});
check('S2-seam-defines-one-rescue-composition', await countIn(productFiles, 'export function createW04RescueComposition') === 1, {
  definitions: await countIn(productFiles, 'export function createW04RescueComposition')
});

/* ------------------------------------------------------- 2. one owner per family */

const familyOwnerCounts = {};
const familyOf = { W04EvidenceDomain: 'evidence', W04ReviewDomain: 'reviews', W04MasteryDomain: 'mastery', W04PortfolioDomain: 'portfolio' };
for (const owner of Object.keys(familyOf)) {
  const adapter = productFiles.find(p => p.endsWith(`${path.sep}adapters${path.sep}${familyOf[owner]}${path.sep}domain.ts`));
  const classDefs = await countIn(productFiles, `class ${owner}`);
  familyOwnerCounts[owner] = { adapter: adapter ? path.relative(root, adapter) : null, classDefinitions: classDefs };
}
check('S3-one-domain-class-per-family', Object.values(familyOwnerCounts).every(v => v.classDefinitions === 1 && v.adapter), familyOwnerCounts);

/* ------------------------------------------------- 3. no local shared owner creation */

const surfaceFiles = productFiles.filter(p => p.includes(`${path.sep}surfaces${path.sep}`) && ['evidence', 'reviews', 'mastery', 'portfolio'].some(s => p.includes(`${path.sep}${s}${path.sep}`)));
const localSharedCreations = [];
for (const file of productFiles) {
  const src = await readFile(file, 'utf8');
  if (/localSharedOwnerCreation\s*:\s*true/.test(src)) localSharedCreations.push(path.relative(root, file));
}
check('S4-no-local-shared-owner-creation', localSharedCreations.length === 0, { offenders: localSharedCreations, surfaceFilesChecked: surfaceFiles.length });

/* -------------------------------------------------------- 4./5./6. runtime seam */

const { createW04RescueComposition, W04_RESCUE_AUTHORITY, W04_CAUSAL_CHAIN, W04_ROUTE_BINDINGS } =
  await import(pathToFileURL(path.join(root, 'dist/surfaces/composition/w04-rescue.js')).href);
const { AnalyticalCompareOwner } = await import(pathToFileURL(path.join(root, 'dist/foundation/analytical/compare.js')).href);

const unbound = createW04RescueComposition();
check('S5-unbound-seam-reports-integration-required', unbound.integration?.state === 'INTEGRATION_REQUIRED' && unbound.shared?.analyticalCompareOwner === null, {
  state: unbound.integration?.state, code: unbound.integration?.code, sharedOwner: unbound.shared?.analyticalCompareOwner
});

const compareOwner = new AnalyticalCompareOwner();
const group = createW04RescueComposition({ analyticalCompareOwner: compareOwner });
check('S6-bound-seam-is-ready-without-local-ownership', group.integration?.state === 'READY' && group.integration?.code === 'CENTRAL_OWNERS_BOUND', {
  state: group.integration?.state, code: group.integration?.code
});
check('S7-seam-is-candidate-only-and-never-self-promoting', group.candidateOnly === true && group.selfPromotion === false, {
  candidateOnly: group.candidateOnly, selfPromotion: group.selfPromotion
});
check('S8-single-shared-owner-set', group.shared?.collectionOwner === 'CollectionTableMatrixPresentationCore'
  && group.shared?.auditOwner === 'AuditProvenanceInteractionCore'
  && group.shared?.reviewDecisionOwner === 'ReviewDecisionPresentationOwner', {
  collectionOwner: group.shared?.collectionOwner, auditOwner: group.shared?.auditOwner, reviewDecisionOwner: group.shared?.reviewDecisionOwner
});
const providerIds = [...group.shared.analyticalProviderIds];
check('S9-w04-provider-ids-unique-and-four', providerIds.length === 4 && new Set(providerIds).size === 4, { providerIds });
const domains = {
  evidence: group.evidence.domain.owner, reviews: group.reviews.domain.owner,
  mastery: group.mastery.domain.owner, portfolio: group.portfolio.domain.owner
};
check('S10-each-family-uses-its-own-w04-domain-owner', domains.evidence === 'W04EvidenceDomain' && domains.reviews === 'W04ReviewDomain'
  && domains.mastery === 'W04MasteryDomain' && domains.portfolio === 'W04PortfolioDomain', domains);
check('S11-surface-contracts-declare-no-local-shared-ownership',
  group.evidence.contract.localSharedOwnerCreation === false
  && group.reviews.contract.localSharedOwnerCreation === false
  && group.evidence.compareOwner === 'AnalyticalCompareOwner'
  && group.reviews.compareOwner === 'AnalyticalCompareOwner'
  && group.mastery.compareOwner?.owner === 'AnalyticalCompareOwner'
  && group.portfolio.compareOwner?.owner === 'AnalyticalCompareOwner'
  && group.mastery.compareProvider.descriptor().providerId !== group.portfolio.compareProvider.descriptor().providerId, {
  evidence: group.evidence.contract.localSharedOwnerCreation,
  reviews: group.reviews.contract.localSharedOwnerCreation,
  compareOwners: [group.evidence.compareOwner, group.reviews.compareOwner, group.mastery.compareOwner?.owner, group.portfolio.compareOwner?.owner],
  note: 'all four families delegate comparison to the ONE controller-injected AnalyticalCompareOwner'
});
check('S12-grouping-authority-not-claimed-q5-open', group.invariants?.groupingAuthority === 'AUTHORITY_DECISION_REQUIRED', {
  groupingAuthority: group.invariants?.groupingAuthority
});
check('S13-seam-authority-and-causal-chain', W04_RESCUE_AUTHORITY === 'ORACLE-011/A03'
  && [...W04_CAUSAL_CHAIN].join('>') === 'Candidate Evidence>Evidence>Review>Decision>Mastery State'
  && Object.keys(W04_ROUTE_BINDINGS).sort().join(',') === 'evidence,mastery,portfolio,reviews', {
  authority: W04_RESCUE_AUTHORITY, causalChain: [...W04_CAUSAL_CHAIN], routes: Object.keys(W04_ROUTE_BINDINGS)
});
const emptyByDefault = ['evidence', 'reviews', 'mastery', 'portfolio'].every(k => group[k].domain.records.length === 0);
check('S14-seam-defaults-empty-no-implied-fixture', emptyByDefault, {
  records: Object.fromEntries(['evidence', 'reviews', 'mastery', 'portfolio'].map(k => [k, group[k].domain.records.length]))
});

/* ------------------------------------------------------------------- binding */

const identity = await canonicalSourceIdentity(new URL('../', import.meta.url));
const declaredTree = 'c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f';
result.binding = {
  bindingAlgorithm: 'path\\0size\\0sha256\\n (tools/source-tree-identity.mjs)',
  dispatchDeclaredCandidate: `WORKTREE_VARIANT:${declaredTree}`,
  executedSourceTreeSha256: identity.sha256,
  executedSourceFileCount: identity.files,
  matchesDispatchBaseline: identity.sha256 === declaredTree,
  commit: git('git rev-parse HEAD'),
  tree: git('git rev-parse HEAD^{tree}'),
  command: 'node tools/w04-seam-ownership-proof.mjs'
};
result.pass = result.checks.every(c => c.pass);
await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({
  receipt: 'writer-output/W04/SEAM_OWNERSHIP_PROOF.json',
  pass: result.pass,
  checks: result.checks.map(c => `${c.pass ? 'PASS' : 'FAIL'} ${c.id}`)
}, null, 2));
if (!result.pass) process.exitCode = 1;
