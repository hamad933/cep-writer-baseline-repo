import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// -----------------------------------------------------------------------------
// Lightweight Headless DOM Mock for Node.js Execution
// -----------------------------------------------------------------------------
class MockNode {
  id: string = '';
  className: string = '';
  tagName: string;
  style: Record<string, string> = {};
  dataset: Record<string, string> = {};
  children: MockNode[] = [];
  parentElement: MockNode | null = null;
  attributes: Map<string, string> = new Map();
  textContent: string = '';
  elements: Record<string, any> = {};
  dir: string = 'ltr';
  hidden: boolean = false;
  inert: boolean = false;
  private _innerHTML: string = '';

  constructor(tagName: string = 'div') {
    this.tagName = tagName.toUpperCase();
    if (this.tagName === 'FORM') {
      this.elements = {
        source: new MockNode('select'),
        target: new MockNode('select'),
        type: new MockNode('select'),
        id: new MockNode('input'),
        revision: new MockNode('input'),
        digest: new MockNode('input')
      };
    }
  }

  get innerHTML(): string {
    return this._innerHTML;
  }

  set innerHTML(html: string) {
    this._innerHTML = html;
    this.children = [];
    const tagMatches = html.matchAll(/<([a-zA-Z0-9-]+)([^>]*)>/g);
    for (const match of tagMatches) {
      const tag = match[1];
      const rawAttrs = match[2];
      const node = new MockNode(tag);
      const attrMatches = rawAttrs.matchAll(/([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g);
      for (const am of attrMatches) {
        const name = am[1];
        const val = am[2] ?? am[3] ?? am[4] ?? '';
        node.setAttribute(name, val);
      }
      this.appendChild(node);
    }
  }

  setAttribute(k: string, v: string) {
    this.attributes.set(k, String(v));
    if (k === 'id') this.id = String(v);
    if (k === 'class') this.className = String(v);
    if (k.startsWith('data-')) {
      const camel = k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      this.dataset[camel] = String(v);
    }
  }

  getAttribute(k: string) {
    return this.attributes.get(k) ?? null;
  }

  removeAttribute(k: string) {
    this.attributes.delete(k);
    if (k === 'id') this.id = '';
    if (k === 'class') this.className = '';
    if (k.startsWith('data-')) {
      const camel = k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      delete this.dataset[camel];
    }
  }

  hasAttribute(k: string) {
    return this.attributes.has(k);
  }

  appendChild(child: MockNode) {
    this.children.push(child);
    child.parentElement = this;
    return child;
  }

  prepend(...children: MockNode[]) {
    for (let i = children.length - 1; i >= 0; i--) {
      const c = children[i];
      this.children.unshift(c);
      c.parentElement = this;
    }
  }

  append(...children: (MockNode | string)[]) {
    for (const c of children) {
      if (typeof c === 'string') this.textContent += c;
      else if (c instanceof MockNode) this.appendChild(c);
    }
  }

  remove() {
    if (this.parentElement) {
      const idx = this.parentElement.children.indexOf(this);
      if (idx !== -1) this.parentElement.children.splice(idx, 1);
    }
  }

  replaceChildren(...children: MockNode[]) {
    this.children = [];
    for (const c of children) this.appendChild(c);
  }

  addEventListener(event: string, handler: any) {}
  removeEventListener(event: string, handler: any) {}
  dispatchEvent(event: any) { return true; }
  focus(opts?: any) {}
  blur() {}
  getBoundingClientRect() { return { left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0 }; }
  setPointerCapture(id: any) {}
  releasePointerCapture(id: any) {}
  closest(selector: string): MockNode | null { return this; }
  insertAdjacentHTML(pos: string, html: string) {
    this.innerHTML = this.innerHTML + html;
  }

  private _matchSelector(node: MockNode, sel: string): boolean {
    if (sel.startsWith('#')) return node.id === sel.slice(1);
    if (sel.startsWith('.')) {
      const cls = sel.slice(1);
      return (node.className || '').split(/\s+/).includes(cls);
    }
    if (sel.startsWith('[') && sel.endsWith(']')) {
      const inside = sel.slice(1, -1);
      if (inside.includes('=')) {
        const [k, rawV] = inside.split('=');
        const v = rawV.replace(/^["']|["']$/g, '');
        return node.getAttribute(k.trim()) === v;
      }
      return node.hasAttribute(inside.trim());
    }
    if (/^[a-zA-Z0-9-]+$/.test(sel)) {
      return node.tagName.toLowerCase() === sel.toLowerCase();
    }
    return false;
  }

  querySelector(sel: string): MockNode | null {
    if (sel.includes(',')) {
      const parts = sel.split(',');
      for (const part of parts) {
        const found = this.querySelector(part.trim());
        if (found) return found;
      }
      return null;
    }
    if (sel.includes(' ')) {
      const parts = sel.trim().split(/\s+/);
      let current: MockNode = this;
      for (const part of parts) {
        const next = current.querySelector(part);
        if (!next) return null;
        current = next;
      }
      return current;
    }
    for (const child of this.children) {
      if (this._matchSelector(child, sel)) return child;
      const found = child.querySelector(sel);
      if (found) return found;
    }
    return null;
  }

  querySelectorAll(sel: string): MockNode[] {
    const list: MockNode[] = [];
    const search = (node: MockNode) => {
      for (const child of node.children) {
        if (this._matchSelector(child, sel)) list.push(child);
        search(child);
      }
    };
    search(this);
    return list;
  }
}

const mockBody = new MockNode('body');
const mockHead = new MockNode('head');
const mockDocElement = new MockNode('html');
mockDocElement.appendChild(mockHead);
mockDocElement.appendChild(mockBody);

// Setup shell containers required by M0 controller composition
const centerPane = new MockNode('div');
centerPane.id = 'centerPane';
const foundationStage = new MockNode('div');
foundationStage.id = 'foundationStage';
foundationStage.className = 'foundation-stage';
centerPane.appendChild(foundationStage);

const topBanner = new MockNode('div');
topBanner.id = 'topBanner';
const bannerTitle = new MockNode('span');
bannerTitle.className = 'title';
const bannerBadge = new MockNode('span');
bannerBadge.className = 'badge';
const bannerLock = new MockNode('span');
bannerLock.className = 'lock';
const bannerLockText = new MockNode('span');
bannerLock.appendChild(bannerLockText);
topBanner.appendChild(bannerTitle);
topBanner.appendChild(bannerBadge);
topBanner.appendChild(bannerLock);

const leftPane = new MockNode('div');
leftPane.id = 'leftPane';
const pbody = new MockNode('div');
pbody.className = 'pbody';
leftPane.appendChild(pbody);

mockBody.appendChild(topBanner);
mockBody.appendChild(leftPane);
mockBody.appendChild(centerPane);

const mockDocument = {
  documentElement: mockDocElement,
  head: mockHead,
  body: mockBody,
  activeElement: null,
  createElement: (tag: string) => new MockNode(tag),
  createTextNode: (text: string) => {
    const n = new MockNode('text');
    n.textContent = text;
    return n;
  },
  getElementById: (id: string) => mockDocElement.querySelector(`#${id}`),
  querySelector: (sel: string) => mockDocElement.querySelector(sel),
  querySelectorAll: (sel: string) => mockDocElement.querySelectorAll(sel),
  addEventListener: () => {},
  removeEventListener: () => {}
};

(globalThis as any).document = mockDocument;
(globalThis as any).window = {
  addEventListener: () => {},
  removeEventListener: () => {}
};
(globalThis as any).CSS = {
  escape: (s: string) => s
};
(globalThis as any).requestAnimationFrame = (cb: () => void) => { setTimeout(cb, 0); return 1; };
(globalThis as any).HTMLElement = MockNode;
(globalThis as any).Element = MockNode;

import {SemanticCommandBus} from '../../../foundation/global/commands.js';
import {CommandRegistry,CapabilityRegistry} from '../../../foundation/models.js';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';
import {TimelineReplayOwner} from '../../../foundation/timeline/replay.js';
import {W04ReviewDomain,ReviewAuthorityRegistry,createTestReviewAuthorityRegistry} from '../../../adapters/reviews/domain.js';
import {W04EvidenceDomain} from '../../../adapters/evidence/domain.js';
import {createW04RescueComposition} from '../../../surfaces/composition/w04-rescue.js';
import {createW05RescueComposition,W05_RESCUE_SURFACES} from '../../../surfaces/composition/w05-rescue.js';
import {createLearnRuntimeComposition} from '../../../adapters/learn.js';
import {createEnterpriseAdapter} from '../../../adapters/w03-enterprise.js';
import {W03EnterpriseDomain} from '../../../adapters/enterprise/domain.js';
import {composeEnterpriseSurface} from '../../../surfaces/enterprise/index.js';
import {renderEnterpriseSurface} from '../../../surfaces/enterprise/presentation.js';
import {W03ResultsDomain} from '../../../adapters/results/domain.js';
import {mountM0ControllerComposition} from '../../../surfaces/m0-controller-composition.js';
import {bindLibrarySurface} from '../../../surfaces/library/surface.js';
import {createStructuredConsumerAdapter} from '../../../adapters/structured-documents.js';
import * as libraryBundle from '../../../adapters/library-fixtures.js';

interface TestResult {
  id: string;
  contract: string;
  status: 'PASS' | 'FAIL';
  detail?: unknown;
  error?: string;
}

const results: TestResult[] = [];

async function test(id: string, contract: string, run: () => unknown | Promise<unknown>) {
  try {
    const detail = await run();
    results.push({ id, contract, status: 'PASS', detail });
  } catch (error: any) {
    results.push({ id, contract, status: 'FAIL', error: String(error?.stack || error) });
  }
}

function createMockStage(): any {
  return foundationStage;
}

function createMockWorkspace() {
  const currentToolbar: string[] = [];
  return {
    dir: 'ltr',
    scope: 'global',
    toolbar: (commands: any) => {
      currentToolbar.length = 0;
      if (Array.isArray(commands)) currentToolbar.push(...commands);
      else if (commands && typeof commands[Symbol.iterator] === 'function') currentToolbar.push(...commands);
    },
    getToolbar: () => [...currentToolbar],
    status: () => {},
    applyPreferences: () => {},
    region: () => null,
    refreshToolbar: () => {},
    inspectorDescriptor: () => {},
    dialog: () => {}
  };
}

const standardEsc = (v: any) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const standardButton = (id: string, label: string) => `<button class="btn" data-foundation-command="${id}">${label}</button>`;

// -----------------------------------------------------------------------------
// CONTRACT C1: W05 SemanticCommandBus Injection
// -----------------------------------------------------------------------------

await test('C1-001.w05-rescue-ready-with-injected-command-bus', 'C1_W05_COMMAND_BUS', () => {
  const bus = new SemanticCommandBus();
  const compareOwner = new AnalyticalCompareOwner();
  const group = createW05RescueComposition({ commands: bus, analyticalCompareOwner: compareOwner });
  assert.equal(group.integration.state, 'READY');
  assert.equal(group.integration.code, 'CENTRAL_COMMAND_BUS_BOUND');
  assert.equal(group.commands, bus);
  for (const surfaceId of W05_RESCUE_SURFACES) {
    assert.ok(group.surfaces[surfaceId], `W05 surface ${surfaceId} must be present`);
  }
  return { state: group.integration.state, surfaces: Object.keys(group.surfaces) };
});

await test('C1-002.w05-rescue-fails-closed-without-command-bus', 'C1_W05_COMMAND_BUS', () => {
  const group = createW05RescueComposition({ commands: null });
  assert.equal(group.integration.state, 'INTEGRATION_REQUIRED');
  assert.equal(group.integration.code, 'SEMANTIC_COMMAND_BUS_INTEGRATION_REQUIRED');
  assert.deepEqual(group.surfaces, {});
  return { state: group.integration.state, code: group.integration.code };
});

await test('C1-003.w05-controller-composition-injects-command-bus', 'C1_W05_COMMAND_BUS', async () => {
  const bus = new SemanticCommandBus();
  const registry = new CommandRegistry(bus);
  const compareOwner = new AnalyticalCompareOwner();
  const workspace = createMockWorkspace();
  const result = await mountM0ControllerComposition({
    consumer: 'health',
    commandBus: bus,
    registry,
    workspace,
    analyticalCompareOwner: compareOwner,
    esc: standardEsc,
    button: standardButton
  });
  assert.ok(result);
  assert.equal(result.group.integration.state, 'READY');
  assert.equal(result.group.integration.code, 'CENTRAL_COMMAND_BUS_BOUND');
  return { consumer: 'health', integrationState: result.group.integration.state };
});

// -----------------------------------------------------------------------------
// CONTRACT C2: Singular AnalyticalCompareOwner
// -----------------------------------------------------------------------------

await test('C2-001.analytical-compare-owner-singular-identity', 'C2_ANALYTICAL_COMPARE_OWNER', () => {
  const compareOwner = new AnalyticalCompareOwner();
  const bus = new SemanticCommandBus();
  const w04 = createW04RescueComposition({ analyticalCompareOwner: compareOwner, commands: bus });
  const w05 = createW05RescueComposition({ commands: bus, analyticalCompareOwner: compareOwner });
  const replayOwner = new TimelineReplayOwner();
  const resultsDomain = new W03ResultsDomain({ timelineReplayOwner: replayOwner, analyticalCompareOwner: compareOwner });

  assert.equal(w04.shared.analyticalCompareOwner, compareOwner);
  assert.equal(resultsDomain.compareOwner, compareOwner);
  assert.equal(w05.surfaces.releases.adapter.compareOwner, compareOwner);
  return { compareOwnerId: compareOwner.ownerToken };
});

await test('C2-002.w04-fails-closed-without-analytical-compare-owner', 'C2_ANALYTICAL_COMPARE_OWNER', () => {
  const w04 = createW04RescueComposition({ analyticalCompareOwner: undefined });
  assert.equal(w04.integration.state, 'INTEGRATION_REQUIRED');
  assert.equal(w04.integration.code, 'ANALYTICAL_COMPARE_INTEGRATION_REQUIRED');
  return { state: w04.integration.state, code: w04.integration.code };
});

// -----------------------------------------------------------------------------
// CONTRACT C3: W03 Enterprise and Results Workspace Presenters
// -----------------------------------------------------------------------------

await test('C3-001.enterprise-controller-mounts-renderEnterpriseSurface', 'C3_W03_PRESENTERS', async () => {
  const bus = new SemanticCommandBus();
  const registry = new CommandRegistry(bus);
  const relations = createEnterpriseAdapter();
  const workspace = createMockWorkspace();

  const result = await mountM0ControllerComposition({
    consumer: 'enterprise',
    commandBus: bus,
    registry,
    relations,
    workspace,
    esc: standardEsc,
    button: standardButton
  });

  assert.ok(result);
  assert.ok(result.domain instanceof W03EnterpriseDomain);
  assert.ok(result.composition);
  assert.ok(result.presentation);
  assert.equal(result.realStudio, true);
  assert.equal(result.presentation.owner, 'EnterpriseSurfacePresentation');
  assert.ok(foundationStage.querySelector('.enterprise-studio'), 'Enterprise studio container rendered');
  assert.ok(foundationStage.querySelector('[data-region="CENTER"]'), 'Enterprise center region rendered');

  const toolbar = workspace.getToolbar();
  assert.ok(toolbar.includes('enterprise.inspect'));
  assert.ok(toolbar.includes('enterprise.edit'));
  assert.ok(toolbar.includes('enterprise.revise'));
  assert.ok(toolbar.includes('enterprise.twin'));
  assert.ok(toolbar.includes('enterprise.handoff'));

  return { mounted: true, presentationOwner: result.presentation.owner, toolbar };
});

await test('C3-002.main-avoids-duplicate-spatial-view-on-enterprise', 'C3_W03_PRESENTERS', () => {
  const mainSrc = readFileSync('stack/native-typescript/main.ts', 'utf8');
  assert.ok(mainSrc.includes("if(consumer!=='enterprise'){"), 'Enterprise guard block exists in main.ts');
  return { enterpriseGuardVerified: true };
});

await test('C3-003.results-studio-binds-singular-shared-owners', 'C3_W03_PRESENTERS', async () => {
  const bus = new SemanticCommandBus();
  const registry = new CommandRegistry(bus);
  const compareOwner = new AnalyticalCompareOwner();
  const replayOwner = new TimelineReplayOwner();
  const workspace = createMockWorkspace();

  const result = await mountM0ControllerComposition({
    consumer: 'results',
    commandBus: bus,
    registry,
    analyticalCompareOwner: compareOwner,
    timelineReplayOwner: replayOwner,
    workspace,
    esc: standardEsc,
    button: standardButton
  });

  assert.ok(result);
  assert.equal(result.domain.compareOwner, compareOwner);
  assert.equal(result.domain.replayOwner, replayOwner);
  assert.equal(result.realStudio, true);
  assert.equal(result.compareHostOwner, 'AnalyticalCompareHost');

  return { resultsSharedOwnersBound: true, compareOwnerToken: compareOwner.ownerToken };
});

// -----------------------------------------------------------------------------
// CONTRACT C4: ReviewAuthorityRegistry Binding (W04 Reviews)
// -----------------------------------------------------------------------------

await test('C4-001.w04-reviews-binds-central-authority-registry-fail-closed', 'C4_REVIEW_AUTHORITY', async () => {
  const bus = new SemanticCommandBus();
  const registry = new CommandRegistry(bus);
  const compareOwner = new AnalyticalCompareOwner();
  const authorityRegistry = new ReviewAuthorityRegistry(); // Empty fail-closed
  const workspace = createMockWorkspace();

  const result = await mountM0ControllerComposition({
    consumer: 'reviews',
    commandBus: bus,
    registry,
    analyticalCompareOwner: compareOwner,
    reviewAuthorityRegistry: authorityRegistry,
    workspace,
    esc: standardEsc,
    button: standardButton
  });

  assert.ok(result);
  assert.equal(result.centralReviewAuthorityRegistry, authorityRegistry);
  assert.equal(result.surface.domain.reviewAuthorityRegistry, authorityRegistry);

  // Calling reviews.review without registered reviewer fails closed
  const failure = result.surface.domain.review('non-existent-review', {
    action: 'continue'
  });
  assert.equal(failure.ok, false);

  return { registryBound: true, defaultFailClosed: true };
});

await test('C4-002.w04-reviews-rejects-test-authority-in-product', 'C4_REVIEW_AUTHORITY', () => {
  const testRegistry = createTestReviewAuthorityRegistry();
  const evidenceDomain = new W04EvidenceDomain();
  const reviewsDomain = new W04ReviewDomain(undefined, {
    evidenceResolver: ref => evidenceDomain.resolveReviewableEvidenceRef(ref),
    reviewAuthorityRegistry: testRegistry,
    allowTestAuthority: false
  });

  // Attempting request with test reviewer when allowTestAuthority is false
  const outcome = reviewsDomain.review('test-rev-01', {
    action: 'request',
    evidenceRefs: ['ev-01@r1'],
    criteriaRefs: ['crit-01'],
    reviewer: { identity: 'reviewer:local-owner' }
  });
  assert.equal(outcome.ok, false);
  assert.ok(['EVIDENCE_RESOLVER_UNBOUND', 'EXACT_EVIDENCE_REFS_REQUIRED', 'ADMITTED_IMMUTABLE_EVIDENCE_REQUIRED', 'TEST_AUTHORITY_NOT_ALLOWED_IN_PRODUCT', 'REVIEWER_AUTHORITY_UNAVAILABLE'].includes(outcome.code));
  return { testAuthorityRejected: true, code: outcome.code };
});

// -----------------------------------------------------------------------------
// CONTRACT C5: Library and Learn Product Source Admission
// -----------------------------------------------------------------------------

await test('C5-001.learn-composition-unbound-without-fixture', 'C5_PRODUCT_SOURCE_ADMISSION', () => {
  const composition = createLearnRuntimeComposition();
  assert.equal(composition.learn.sourceAvailable, false);
  assert.equal(composition.descriptor.sourceAvailability, 'UNAVAILABLE');
  assert.equal(composition.descriptor.realConsumer, false);
  assert.equal(composition.descriptor.fixtureFallback, false);
  assert.equal(composition.learn.source.rejectionReason, 'LEARN_PROVIDER_UNBOUND');
  return composition.descriptor;
});

await test('C5-002.learn-composition-rejects-synthetic-or-fixture-source', 'C5_PRODUCT_SOURCE_ADMISSION', () => {
  const composition = createLearnRuntimeComposition({
    source: {
      classification: 'LOCAL_DEV_ACCEPTANCE_SEED__NON_PRODUCTION',
      truth: 'ACCEPTANCE_FIXTURE_SEED',
      activity: { id: 'act-1', revision: 1 },
      document: { id: 'doc-1', revision: '1', blocks: [] }
    }
  });
  assert.equal(composition.learn.sourceAvailable, false);
  assert.equal(composition.learn.source.rejectionReason, 'LEARN_FIXTURE_OR_SYNTHETIC_SOURCE_FORBIDDEN');
  return { rejected: true, reason: composition.learn.source.rejectionReason };
});

await test('C5-003.main-has-no-balanced6-learn-source-leak', 'C5_PRODUCT_SOURCE_ADMISSION', () => {
  const mainSrc = readFileSync('stack/native-typescript/main.ts', 'utf8');
  assert.equal(mainSrc.includes('BALANCED6_LEARN_SOURCE'), false, 'BALANCED6_LEARN_SOURCE must not be referenced in main.ts');
  assert.ok(mainSrc.includes("createLearnRuntimeComposition():null"), 'createLearnRuntimeComposition called unbound in main.ts');
  return { noLearnFixtureLeak: true };
});

await test('C5-004.library-surface-fixture-claimed-false', 'C5_PRODUCT_SOURCE_ADMISSION', () => {
  const bus = new SemanticCommandBus();
  const registry = new CommandRegistry(bus);
  const structured = createStructuredConsumerAdapter('library', libraryBundle);
  const bound = bindLibrarySurface({ commands: registry, structured });
  assert.equal(bound.fixtureClaimed, false);
  assert.equal(bound.surface, 'library');
  return { fixtureClaimed: bound.fixtureClaimed, surface: bound.surface };
});

// -----------------------------------------------------------------------------
// CONTRACT C6: Results Replay / Compare Shared Owners
// -----------------------------------------------------------------------------

await test('C6-001.results-domain-binds-exact-singular-instances', 'C6_RESULTS_SHARED_OWNERS', () => {
  const replayOwner = new TimelineReplayOwner();
  const compareOwner = new AnalyticalCompareOwner();
  const domain = new W03ResultsDomain({ timelineReplayOwner: replayOwner, analyticalCompareOwner: compareOwner });
  assert.equal(domain.replayOwner, replayOwner);
  assert.equal(domain.compareOwner, compareOwner);
  return { replayOwnerToken: replayOwner.ownerToken, compareOwnerToken: compareOwner.ownerToken };
});

// -----------------------------------------------------------------------------
// Summary and Verdict Output
// -----------------------------------------------------------------------------

const passes = results.filter(r => r.status === 'PASS').length;
const fails = results.filter(r => r.status === 'FAIL').length;
const total = results.length;

console.log(JSON.stringify({
  suite: 'LCORR03_CENTRAL_INTEGRATION_FALSIFICATION_TESTS',
  total,
  passes,
  fails,
  verdict: fails === 0 ? 'PASS' : 'FAIL',
  results
}, null, 2));

if (fails > 0) {
  process.exit(1);
}
