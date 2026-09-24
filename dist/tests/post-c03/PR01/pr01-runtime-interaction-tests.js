import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PlatformWindowCapabilityBridge, LocalRuntimePlatformWindowBridge, PLATFORM_WINDOW_CAPABILITY_CONTRACT } from '../../../foundation/contracts/platform-window-capability.js';
import { PlatformInputDirectionBridge, NO_PLATFORM_INPUT_DIRECTION_BRIDGE, createLocalRuntimePlatformInputDirectionBridge, PLATFORM_INPUT_DIRECTION_BRIDGE_CONTRACT } from '../../../foundation/contracts/platform-input-direction-bridge.js';
import { InputDirectionResolver, INPUT_DIRECTION_POLICY, INPUT_DIRECTION_RESOLVER_CONTRACT } from '../../../foundation/global/input-direction.js';
import { GlobalShellNavigationOwner, GLOBAL_SHELL_OWNER, resolveGlobalShellRoute, canonicalizeGlobalShellRoute } from '../../../foundation/global/shell/navigation.js';
import { CEP_PRODUCT_DESTINATION_REGISTRY } from '../../../foundation/global/shell/cep-destinations.js';

const assert = (v     , m = 'assertion failed') => { if (!v) throw Error(m); };
const run = (name        , fn            , out       ) => {
  try {
    fn();
    out.push({ name, status: 'PASS' });
  } catch (e) {
    out.push({ name, status: 'FAIL', error: String((e       )?.message || e) });
  }
};
const throws = (fn            , code        ) => {
  let caught     ;
  try { fn(); } catch (e) { caught = String((e       )?.message || e); }
  assert(typeof caught === 'string' && caught.includes(code), `expected ${code}, got ${caught}`);
};

export function runPR01RuntimeInteractionTests() {
  const t        = [];

  run('pr01.platform-window-capability.non-blocking-contract', () => {
    assert(PLATFORM_WINDOW_CAPABILITY_CONTRACT.scope === 'OS_NATIVE_PRESENTATION_CAPABILITY_ONLY', 'contract scope mismatch');
    const bridge = new LocalRuntimePlatformWindowBridge();
    assert(bridge.id === 'LocalRuntimePlatformWindowBridge', 'bridge id mismatch');
    const descriptor = bridge.descriptor();
    assert(descriptor.owner === 'PlatformWindowCapability', 'descriptor owner mismatch');
    assert(typeof descriptor.available === 'boolean', 'descriptor available must be boolean');
    const caps = bridge.capabilities();
    assert(typeof caps.alwaysOnTop === 'boolean', 'capabilities alwaysOnTop must be boolean');
  }, t);

  run('pr01.platform-input-direction-bridge.async-non-blocking', () => {
    assert(PLATFORM_INPUT_DIRECTION_BRIDGE_CONTRACT.owner === 'Global Input Direction', 'contract owner mismatch');
    const absent = NO_PLATFORM_INPUT_DIRECTION_BRIDGE.read();
    assert(absent.available === false && absent.code === 'PLATFORM_DIRECTION_BRIDGE_ABSENT', 'absent bridge contract check');

    let hintCalls = 0;
    const mockBridge = new PlatformInputDirectionBridge(() => {
      hintCalls++;
      return 'rtl';
    });
    const read1 = mockBridge.read();
    assert(read1.available === true && read1.hint === 'rtl' && read1.recognized === true, 'bridge hint read failed');
    assert(hintCalls === 1, 'hint callback count mismatch');
  }, t);

  run('pr01.input-direction-resolver.epoch-cache-deduplication', () => {
    let bridgeReads = 0;
    const testBridge = {
      capability: () => ({ available: true, code: 'AVAILABLE' }),
      read: () => {
        bridgeReads++;
        return { available: true, code: 'PLATFORM_DIRECTION_HINT_RESOLVED', hint: 'rtl', recognized: true };
      }
    };

    const resolver = new InputDirectionResolver({ bridge: testBridge        });
    assert(resolver.contract.id === INPUT_DIRECTION_RESOLVER_CONTRACT.id, 'resolver contract mismatch');

    // Call resolve() 10 times in rapid succession for empty blocks (simulating initial load of 15 blocks)
    for (let i = 0; i < 10; i++) {
      const res = resolver.resolve({ content: '', surface: 'structured', blockId: `b-${i}` });
      assert(res.direction === 'rtl', 'expected resolved direction rtl');
      assert(res.source === 'PLATFORM_OS_KEYBOARD_HINT', 'expected source PLATFORM_OS_KEYBOARD_HINT');
    }

    // Bridge read should have been called EXACTLY ONCE within the 250ms epoch!
    assert(bridgeReads === 1, `expected 1 bridge read across 10 rapid calls, got ${bridgeReads}`);

    // Persisted direction should bypass the bridge completely
    const persistedRes = resolver.resolve({ persistedDirection: 'ltr', content: 'hello', blockId: 'b-persisted' });
    assert(persistedRes.direction === 'ltr' && persistedRes.persistedWon === true, 'persisted direction failed');
    assert(bridgeReads === 1, 'persisted direction must not invoke bridge read');
  }, t);

  run('pr01.shell-route-resolution-and-canonicalization', () => {
    const route1 = resolveGlobalShellRoute('?surface=library', CEP_PRODUCT_DESTINATION_REGISTRY);
    assert(route1.surface === 'library' && route1.fallback === false, 'library route failed');

    const route2 = resolveGlobalShellRoute('?surface=today', CEP_PRODUCT_DESTINATION_REGISTRY);
    assert(route2.surface === 'today' && route2.fallback === false, 'today route failed');

    const routeUnknown = resolveGlobalShellRoute('?surface=nonexistent', CEP_PRODUCT_DESTINATION_REGISTRY);
    assert(routeUnknown.surface === 'library' && routeUnknown.fallback === true, 'unknown route fallback failed');

    const canonical = canonicalizeGlobalShellRoute('?surface=nonexistent', 'http://127.0.0.1:4173/?surface=nonexistent', CEP_PRODUCT_DESTINATION_REGISTRY);
    assert(canonical.required === true && canonical.href.includes('surface=library'), 'canonicalizeGlobalShellRoute failed');
  }, t);

  run('pr01.global-shell-navigation.spa-history-navigation', () => {
    // Set up mock DOM and window environment
    const prevDocument = globalThis.document;
    const prevWindow = globalThis.window;
    const prevLocation = globalThis.location;
    const prevHistory = globalThis.history;
    const prevSessionStorage = globalThis.sessionStorage;
    const prevMutationObserver = (globalThis       ).MutationObserver;

    const prevScrollX = (globalThis       ).scrollX;
    const prevScrollY = (globalThis       ).scrollY;
    const prevHTMLElement = (globalThis       ).HTMLElement;
    const prevElement = (globalThis       ).Element;
    const prevRAF = (globalThis       ).requestAnimationFrame;
    const prevScrollTo = (globalThis       ).scrollTo;

    try {
      class MockElement {}
      (globalThis       ).HTMLElement = MockElement;
      (globalThis       ).Element = MockElement;
      (globalThis       ).requestAnimationFrame = (cb     ) => setTimeout(cb, 0);
      (globalThis       ).scrollTo = () => {};
      (globalThis       ).scrollX = 0;
      (globalThis       ).scrollY = 0;
      class MockMutationObserver {
        observe() {}
        disconnect() {}
      }
      (globalThis       ).MutationObserver = MockMutationObserver;

      const storageMap                         = {};
      globalThis.sessionStorage = {
        getItem: (k        ) => storageMap[k] ?? null,
        setItem: (k        , v        ) => { storageMap[k] = String(v); },
        removeItem: (k        ) => { delete storageMap[k]; },
        clear: () => { Object.keys(storageMap).forEach(k => delete storageMap[k]); },
        length: 0,
        key: () => null
      }       ;

      let pushedState      = null;
      let pushedUrl = '';
      globalThis.history = {
        state: null,
        pushState: (state     , _unused        , url        ) => {
          pushedState = state;
          pushedUrl = url;
        },
        replaceState: (_state     , _unused        , _url        ) => {},
        back: () => {},
        forward: () => {}
      }       ;

      const mockLocation = new URL('http://127.0.0.1:4173/?surface=library')       ;
      mockLocation.assign = (url        ) => { mockLocation.href = url; };
      globalThis.location = mockLocation;

      const mockHost = {
        dataset: {}                          ,
        setAttribute: () => {},
        getAttribute: () => null,
        innerHTML: '',
        addEventListener: () => {},
        removeEventListener: () => {},
        querySelector: () => null,
        querySelectorAll: () => []
      }       ;

      globalThis.document = {
        documentElement: { lang: 'en', dir: 'ltr' },
        body: { dataset: {} },
        querySelector: (sel        ) => (sel === '.foundation-shell' ? mockHost : null),
        querySelectorAll: () => [],
        activeElement: null
      }       ;

      globalThis.window = {
        addEventListener: () => {},
        removeEventListener: () => {}
      }       ;

      let navDestination = '';
      let navOptions      = null;
      const navOwner = new GlobalShellNavigationOwner({
        surface: 'library',
        workspace: { dialog: () => {} },
        api: { state: { editor: { dirty: false } } },
        preferences: {},
        destinationRegistry: CEP_PRODUCT_DESTINATION_REGISTRY,
        onNavigate: (dest        , opts     ) => {
          navDestination = dest;
          navOptions = opts;
          return true;
        }
      });

      assert(navOwner.owner === GLOBAL_SHELL_OWNER, 'owner name mismatch');
      assert(navOwner.surface === 'library', 'initial surface must be library');

      // Navigate to 'today'
      const navResult = navOwner.navigate('today');
      assert(navResult.ok === true && navResult.status === 'NAVIGATING', 'navigate to today failed');
      assert(navDestination === 'today', 'onNavigate handler not invoked with today');
      assert(pushedUrl.includes('surface=today'), 'pushState url does not target today');
      assert(pushedState?.cepDestination === 'today', 'pushed state destination mismatch');

      // Test dirty guard
      navOwner.api.state.editor.dirty = true;
      let dialogShown = false;
      navOwner.workspace.dialog = () => { dialogShown = true; };
      const blocked = navOwner.navigate('visualize');
      assert(blocked.ok === false && blocked.status === 'DIRTY_DEPARTURE_BLOCKED', 'dirty departure must be blocked');
      assert(dialogShown === true, 'dirty departure dialog must be shown');

      navOwner.destroy();
    } finally {
      globalThis.document = prevDocument;
      globalThis.window = prevWindow;
      globalThis.location = prevLocation;
      globalThis.history = prevHistory;
      globalThis.sessionStorage = prevSessionStorage;
      (globalThis       ).MutationObserver = prevMutationObserver;
      (globalThis       ).HTMLElement = prevHTMLElement;
      (globalThis       ).Element = prevElement;
      (globalThis       ).requestAnimationFrame = prevRAF;
      (globalThis       ).scrollTo = prevScrollTo;
      (globalThis       ).scrollX = prevScrollX;
      (globalThis       ).scrollY = prevScrollY;
    }
  }, t);

  run('pr01.static-codebase-audit.zero-sync-xhr', () => {
    const root = path.resolve(fileURLToPath(import.meta.url), '../../../../..');
    const sourceDir = path.join(root, 'stack', 'native-typescript');

    function walkDir(dir        )           {
      const files           = [];
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) files.push(...walkDir(full));
        else if (entry.isFile() && entry.name.endsWith('.ts')) files.push(full);
      }
      return files;
    }

    const files = walkDir(sourceDir).filter(f => !f.includes(`${path.sep}tests${path.sep}`));
    assert(files.length > 0, 'no source files found');
    const xhrViolations           = [];
    const forbiddenToken = ['XML', 'Http', 'Request'].join('');
    for (const f of files) {
      const text = readFileSync(f, 'utf8');
      if (text.includes(forbiddenToken)) {
        xhrViolations.push(path.relative(sourceDir, f));
      }
    }
    assert(xhrViolations.length === 0, `Sync XHR forbidden in source: ${xhrViolations.join(', ')}`);
  }, t);

  run('pr01.static-donor-extract.no-donor-first-paint-header', () => {
    const root = path.resolve(fileURLToPath(import.meta.url), '../../../../..');
    const indexPath = path.join(root, 'dist', 'index.html');
    const html = readFileSync(indexPath, 'utf8');

    assert(!html.includes('<header class="global">'), 'dist/index.html must not contain donor header class="global"');
    assert(!html.includes('Donor Editor Canvas'), 'dist/index.html must not contain Donor Editor Canvas');
    assert(html.includes('class="foundation-shell"'), 'dist/index.html must contain canonical foundation-shell');
    assert(html.includes('data-shell-host="GlobalShellNavigationOwner"'), 'dist/index.html must contain initial shell marker');
  }, t);

  return t;
}

if (process.argv[1] && (pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url || process.argv[1].includes('pr01-runtime-interaction-tests'))) {
  const tests = runPR01RuntimeInteractionTests();
  const report = {
    mission: 'PR01',
    kind: 'MODEL_NOT_BROWSER',
    pass: tests.filter((x     ) => x.status === 'PASS').length,
    fail: tests.filter((x     ) => x.status === 'FAIL').length,
    tests
  };
  console.log(JSON.stringify(report, null, 2));
  if (tests.some((x     ) => x.status === 'FAIL')) process.exitCode = 1;
}
