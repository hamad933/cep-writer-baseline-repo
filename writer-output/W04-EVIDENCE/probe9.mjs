import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.evaluate(() => {
  const d = window.CEPFoundation.m0Composition.group.evidence.domain;
  d.importEvidence({ id: 'pr-1', revisionId: 'pr-1-r1', title: 'Probe candidate', subject: 'probe', evidenceClaim: 'probe claim', criterionRefs: ['criteria:v4#integrity'], governedPurpose: 'probe', sourceId: 'SRC-1', sourceRevision: 'r1' });
  d.verifySource('pr-1', { status: 'VERIFIED', providerId: 'provider:p', providerRevision: '1.0.0', proofId: 'proof:p', digest: 'sha256:' + 'a'.repeat(64), schemaValid: true, sourceBytesAvailable: true });
  d.markCandidateValidated('pr-1', { validator: 'v', validationProofRef: 'proof:intake:pr-1' });
  d.submitCandidate('pr-1');
  d.admissionAuthorityRegistry = { resolveAdmissionAuthority: () => ({ state: 'AUTHORIZED', testOnly: false }) };
  d.setAdmissionAuthority('pr-1', true, 'authority:x', { testOnly: false });
  window.CEPFoundation.m0Composition.mounted.render();
});
await page.waitForTimeout(600);
const out = await page.evaluate(() => {
  const b = document.querySelector('#domainToolbar [data-foundation-command="evidence.admit"]');
  const cs = b ? getComputedStyle(b) : null;
  const rect = sel => { const n = document.querySelector(sel); if (!n) return null; const r = n.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
  const tw = document.querySelector('#domainToolbar');
  const sheetRules = [];
  const el = document.querySelector('#w04SurfacePresentationStyle');
  for (const r of el.sheet.cssRules) if (r.selectorText && r.selectorText.includes('evidence.admit')) sheetRules.push(r.selectorText);
  return {
    admit: b ? { disabled: b.disabled, bg: cs.backgroundColor, color: cs.color, border: cs.borderColor, matches: b.matches('body:is([data-consumer=evidence],[data-consumer=reviews],[data-consumer=mastery],[data-consumer=portfolio]) #domainToolbar [data-foundation-command="evidence.admit"]:not(:disabled)') } : null,
    toolbarRect: rect('#domainToolbar'),
    twCls: tw ? tw.className : null,
    sheetRules,
    isLast: document.head.lastElementChild?.id === 'w04SurfacePresentationStyle',
    titlerowRect: rect('.w04-rec-titlerow'),
    titleRect: rect('.w04-rec-title'),
    pillRect: rect('.w04-rec-titlerow .w04-pill'),
    trackRect: rect('.w04-track'),
    steps: [...document.querySelectorAll('.w04-track-step')].map(n => ({ t: n.textContent.trim().slice(0, 34), w: Math.round(n.getBoundingClientRect().width) }))
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
