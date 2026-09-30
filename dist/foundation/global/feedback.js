import {
  ACCESSIBILITY_FEEDBACK_CONTRACT,
  ACCESSIBILITY_FEEDBACK_OWNER,
  ACCESSIBILITY_FEEDBACK_POLICY,
  assertFeedbackSourceTruth,
  feedbackFingerprint,
  normalizeFeedbackText,
  resolveFeedbackSemantics
} from './feedback-contract.js';

const cloneSource = input => Object.freeze({
  family: String(input.sourceFamily || ''),
  owner: String(input.sourceOwner || ''),
  code: input.sourceCode == null ? '' : String(input.sourceCode),
  operation: input.operation == null ? '' : String(input.operation)
});

const copyEvent = event => event ? { ...event, source: { ...event.source } } : null;
const optionalText = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const validPresentationTarget = target => target && typeof target.setAttribute === 'function' ? target : null;

/**
 * Reusable presentation-only owner for short-lived accessible feedback.
 * It validates caller-supplied truth, then stores only a bounded projection receipt.
 * Domain errors, command availability, save state, runtime state and relation truth remain external.
 */
export class AccessibilityFeedbackOwner {
  constructor({ policy = ACCESSIBILITY_FEEDBACK_POLICY, now = () => Date.now() } = {}) {
    this.policy = policy;
    this.now = now;
    this.sequence = 0;
    this.active = [];
    this.receipts = [];
    this.lastAcceptedByFingerprint = new Map();
    this.presentationById = new Map();
    this.listeners = new Set();
  }

  publish(input = {}) {
    const channel = input.channel || 'announcement';
    const outcome = input.outcome || 'info';
    const message = normalizeFeedbackText(input.message);
    if (!input.sourceFamily) throw new Error('FEEDBACK_SOURCE_FAMILY_REQUIRED');
    if (!input.sourceOwner) throw new Error('FEEDBACK_SOURCE_OWNER_REQUIRED');
    assertFeedbackSourceTruth(outcome, input.sourceTruth);
    const semantics = resolveFeedbackSemantics({ channel, outcome }, this.policy);
    const source = cloneSource(input);
    const at = Number.isFinite(Number(input.at)) ? Number(input.at) : Number(this.now());
    this.sweep(at);
    const fingerprint = feedbackFingerprint({ channel, outcome, message, sourceFamily: source.family, dedupeKey: input.dedupeKey });
    const prior = this.lastAcceptedByFingerprint.get(fingerprint);
    const dedupeWindowMs = Number(this.policy.dedupeWindowMs);
    if (prior && at - prior.at < dedupeWindowMs) {
      const duplicate = Object.freeze({
        accepted: false,
        code: 'DUPLICATE_SUPPRESSED',
        owner: ACCESSIBILITY_FEEDBACK_OWNER,
        duplicateOf: prior.id,
        fingerprint,
        at,
        policyRevision: this.policy.revision
      });
      this.receipts.push(duplicate);
      this.emit(duplicate);
      return duplicate;
    }
    const id = `feedback-${++this.sequence}`;
    const event = Object.freeze({
      id,
      sequence: this.sequence,
      owner: ACCESSIBILITY_FEEDBACK_OWNER,
      channel,
      outcome,
      politeness: semantics.politeness,
      announce: semantics.announce,
      message,
      source,
      createdAt: at,
      expiresAt: at + semantics.lifetimeMs,
      lifetimeMs: semantics.lifetimeMs,
      fingerprint,
      policyRevision: this.policy.revision
    });
    this.active.push(event);
    const maxActive = Number(this.policy.maxActive) || 8;
    if (this.active.length > maxActive) {
      const removed = this.active.splice(0, this.active.length - maxActive);
      for (const item of removed) this.presentationById.delete(item.id);
    }
    this.lastAcceptedByFingerprint.set(fingerprint, { id, at });
    const presentation = Object.freeze({
      title: optionalText(input.presentationTitle),
      detail: optionalText(input.presentationDetail),
      tone: optionalText(input.presentationTone),
      target: validPresentationTarget(input.presentationTarget)
    });
    if (presentation.title || presentation.detail || presentation.tone || presentation.target) this.presentationById.set(id, presentation);
    const publication = Object.freeze({ accepted: true, code: 'PROJECTED', owner: ACCESSIBILITY_FEEDBACK_OWNER, event });
    this.receipts.push(publication);
    this.emit(publication);
    return publication;
  }

  presentationFor(id) {
    return this.presentationById.get(id) || null;
  }

  dismiss(id, reason = 'presentation-dismiss') {
    const before = this.active.length;
    this.active = this.active.filter(event => event.id !== id);
    const removed = this.active.length !== before;
    if (removed) {
      this.presentationById.delete(id);
      const receipt = Object.freeze({ accepted: false, code: 'DISMISSED', owner: ACCESSIBILITY_FEEDBACK_OWNER, id, reason, at: Number(this.now()), policyRevision: this.policy.revision });
      this.receipts.push(receipt);
      this.emit(receipt);
    }
    return removed;
  }

  sweep(at = Number(this.now())) {
    const before = this.active;
    const expired = before.filter(event => event.expiresAt <= at);
    if (!expired.length) return [];
    const expiredIds = new Set(expired.map(event => event.id));
    this.active = before.filter(event => !expiredIds.has(event.id));
    for (const id of expiredIds) this.presentationById.delete(id);
    const receipt = Object.freeze({ accepted: false, code: 'EXPIRED', owner: ACCESSIBILITY_FEEDBACK_OWNER, ids: Object.freeze([...expiredIds]), at, policyRevision: this.policy.revision });
    this.receipts.push(receipt);
    this.emit(receipt);
    return [...expiredIds];
  }

  snapshot() {
    return Object.freeze({
      owner: ACCESSIBILITY_FEEDBACK_OWNER,
      contract: ACCESSIBILITY_FEEDBACK_CONTRACT,
      policyRevision: this.policy.revision,
      active: Object.freeze(this.active.map(copyEvent)),
      activeCount: this.active.length,
      canonicalTruth: false,
      focusOwnership: false,
      transientStackOwnership: false
    });
  }

  subscribe(listener) {
    if (typeof listener !== 'function') throw new Error('FEEDBACK_LISTENER_REQUIRED');
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(publication) {
    for (const listener of this.listeners) listener(publication);
  }
}

function visuallyHiddenStyle(node) {
  node.style.position = 'absolute';
  node.style.width = '1px';
  node.style.height = '1px';
  node.style.padding = '0';
  node.style.margin = '-1px';
  node.style.overflow = 'hidden';
  node.style.clipPath = 'inset(50%)';
  node.style.whiteSpace = 'nowrap';
  node.style.border = '0';
}

function svgUse(doc, id) {
  const svg = doc.createElementNS?.('http://www.w3.org/2000/svg', 'svg') || doc.createElement('svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = doc.createElementNS?.('http://www.w3.org/2000/svg', 'use') || doc.createElement('use');
  use.setAttribute('href', `#${id}`);
  svg.append(use);
  return svg;
}

/**
 * DOM projection helper for the canonical feedback owner.
 * The accepted Library donor's native toast/live/tooltip slots are adopted when present,
 * so Library remains a normal consumer rather than a parallel Presentation owner.
 */
export class AccessibilityFeedbackProjector {
  constructor(owner, { document: doc = globalThis.document, root = null } = {}) {
    if (!(owner instanceof AccessibilityFeedbackOwner)) throw new Error('ACCESSIBILITY_FEEDBACK_OWNER_REQUIRED');
    if (!doc?.createElement) throw new Error('FEEDBACK_DOCUMENT_REQUIRED');
    this.owner = owner;
    this.document = doc;
    this.root = root || doc.body;
    this.host = null;
    this.nodes = null;
    this.createdNodes = new Set();
    this.timers = new Map();
    this.tooltipTarget = null;
    this.tooltipEventId = null;
    this.tooltipCleanup = null;
    this.unsubscribe = null;
  }

  mount() {
    if (this.document.querySelector('[data-cep-accessibility-feedback-owner="AccessibilityFeedbackOwner"]')) {
      throw new Error('DUPLICATE_ACCESSIBILITY_FEEDBACK_PROJECTION');
    }
    const host = this.document.createElement('span');
    host.dataset.cepAccessibilityFeedbackOwner = ACCESSIBILITY_FEEDBACK_OWNER;
    host.dataset.feedbackPolicyRevision = this.owner.policy.revision;
    host.hidden = true;
    this.root.append(host);
    this.host = host;
    this.createdNodes.add(host);

    const adoptOrCreate = (selector, create, configure) => {
      const existing = selector ? this.document.querySelector(selector) : null;
      const node = existing || create();
      if (!existing) {
        this.root.append(node);
        this.createdNodes.add(node);
      }
      configure(node, Boolean(existing));
      node.dataset.feedbackPresentationOwner = ACCESSIBILITY_FEEDBACK_OWNER;
      return node;
    };

    const polite = adoptOrCreate('#politeLive', () => this.document.createElement('div'), node => {
      const semantics = this.owner.policy.liveRegions.polite;
      node.dataset.feedbackLive = 'polite';
      node.setAttribute('role', semantics.role);
      node.setAttribute('aria-live', semantics.ariaLive);
      node.setAttribute('aria-atomic', semantics.ariaAtomic);
      if (!node.id) visuallyHiddenStyle(node);
    });
    const assertive = adoptOrCreate('#assertiveLive', () => this.document.createElement('div'), node => {
      const semantics = this.owner.policy.liveRegions.assertive;
      node.dataset.feedbackLive = 'assertive';
      node.setAttribute('role', semantics.role);
      node.setAttribute('aria-live', semantics.ariaLive);
      node.setAttribute('aria-atomic', semantics.ariaAtomic);
      if (!node.id) visuallyHiddenStyle(node);
    });
    const status = adoptOrCreate('#foundationStatus', () => {
      const node = this.document.createElement('output');
      node.className = 'foundation-status';
      return node;
    }, node => {
      node.dataset.feedbackSurface = 'status';
      node.removeAttribute('aria-live');
      node.removeAttribute('aria-atomic');
    });
    const toast = adoptOrCreate('#toastStack', () => {
      const node = this.document.createElement('div');
      node.className = 'toaststack';
      node.id = 'cepFeedbackToastStack';
      return node;
    }, node => {
      node.dataset.feedbackSurface = 'toast';
      node.removeAttribute('aria-live');
      node.removeAttribute('aria-relevant');
    });
    const tooltip = adoptOrCreate('#cepTooltip', () => {
      const node = this.document.createElement('div');
      node.id = 'cep-accessibility-feedback-tooltip';
      return node;
    }, node => {
      node.dataset.feedbackSurface = 'tooltip';
      if (!node.classList?.contains('cep-tooltip')) node.classList?.add('cep-tooltip');
      node.setAttribute('role', this.owner.policy.tooltip.role);
      node.setAttribute('dir', 'auto');
      node.hidden = true;
    });

    this.nodes = { polite, assertive, status, toast, tooltip };
    this.unsubscribe = this.owner.subscribe(publication => this.apply(publication));
    this.syncPresentation();
    return this;
  }

  apply(publication) {
    if (!this.nodes) throw new Error('FEEDBACK_PROJECTOR_NOT_MOUNTED');
    if (!publication?.accepted || !publication.event) {
      if (publication?.code === 'EXPIRED' || publication?.code === 'DISMISSED') this.syncPresentation();
      return publication;
    }
    const event = publication.event;
    this.scheduleExpiry(event);
    if (event.channel === 'tooltip') {
      this.presentTooltip(event, this.owner.presentationFor(event.id)?.target || null);
    } else if (event.channel === 'toast') {
      this.syncToasts();
    } else if (event.channel === 'status') {
      this.presentStatus(event);
    }
    if (event.announce) this.announceEvent(event);
    return publication;
  }

  announceEvent(event) {
    const live = this.nodes[event.politeness];
    if (!live) return;
    live.textContent = '';
    live.dataset.feedbackId = event.id;
    live.dataset.feedbackRevision = String(event.sequence);
    const render = () => {
      if (live.dataset.feedbackId === event.id) live.textContent = event.message;
    };
    const raf = this.document.defaultView?.requestAnimationFrame || globalThis.requestAnimationFrame;
    if (typeof raf === 'function') raf(render);
    else render();
  }

  scheduleExpiry(event) {
    if (this.timers.has(event.id)) return;
    const setTimer = this.document.defaultView?.setTimeout?.bind(this.document.defaultView) || globalThis.setTimeout;
    if (typeof setTimer !== 'function') return;
    const timer = setTimer(() => {
      this.timers.delete(event.id);
      this.owner.dismiss(event.id, 'presentation-timeout');
    }, event.lifetimeMs);
    this.timers.set(event.id, timer);
  }

  presentStatus(event) {
    const status = this.nodes.status;
    const meta = this.owner.presentationFor(event.id);
    status.textContent = event.message;
    status.dataset.feedbackId = event.id;
    status.dataset.tone = meta?.tone || event.outcome;
  }

  toneFor(event) {
    const requested = this.owner.presentationFor(event.id)?.tone;
    if (['info', 'success', 'warning', 'error'].includes(requested)) return requested;
    if (event.outcome === 'success') return 'success';
    if (event.outcome === 'warning' || event.outcome === 'unavailable') return 'warning';
    if (event.outcome === 'failure' || event.outcome === 'error') return 'error';
    return 'info';
  }

  createToast(event) {
    const meta = this.owner.presentationFor(event.id);
    const title = meta?.title || event.message;
    const detail = meta?.detail || '';
    const tone = this.toneFor(event);
    const toast = this.document.createElement('div');
    toast.className = 'toast';
    toast.dataset.tone = tone;
    toast.dataset.feedbackId = event.id;
    toast.dataset.feedbackPresentationOwner = ACCESSIBILITY_FEEDBACK_OWNER;

    const icon = this.document.createElement('span');
    icon.append(svgUse(this.document, tone === 'error' ? 'i-warn' : 'i-info'));
    const body = this.document.createElement('div');
    const strong = this.document.createElement('strong');
    strong.setAttribute('dir', 'auto');
    strong.textContent = title;
    body.append(strong);
    if (detail) {
      const detailNode = this.document.createElement('span');
      detailNode.setAttribute('dir', 'auto');
      detailNode.textContent = detail;
      body.append(detailNode);
    }
    const close = this.document.createElement('button');
    close.className = 'btn iconbtn';
    close.type = 'button';
    close.setAttribute('aria-label', 'إغلاق الإشعار');
    close.append(svgUse(this.document, 'i-close'));
    close.addEventListener('click', () => this.owner.dismiss(event.id, 'explicit-dismiss'));
    toast.append(icon, body, close);
    return toast;
  }

  syncToasts() {
    const active = this.owner.snapshot().active.filter(event => event.channel === 'toast');
    const activeIds = new Set(active.map(event => event.id));
    for (const child of [...this.nodes.toast.querySelectorAll?.('[data-feedback-id]') || []]) {
      if (!activeIds.has(child.dataset.feedbackId)) child.remove();
    }
    for (const event of active) {
      if (!this.nodes.toast.querySelector?.(`[data-feedback-id="${event.id}"]`)) this.nodes.toast.append(this.createToast(event));
    }
  }

  presentTooltip(event, target = null) {
    const tooltip = this.nodes.tooltip;
    if (this.tooltipEventId && this.tooltipEventId !== event.id) this.owner.dismiss(this.tooltipEventId, 'tooltip-replaced');
    this.unlinkTooltipTarget();
    tooltip.textContent = event.message;
    tooltip.dataset.feedbackId = event.id;
    tooltip.hidden = false;
    this.tooltipEventId = event.id;
    if (target?.setAttribute) {
      this.tooltipTarget = target;
      const current = String(target.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
      if (!current.includes(tooltip.id)) current.push(tooltip.id);
      target.setAttribute('aria-describedby', current.join(' '));
      this.positionTooltip(target);
      this.bindTooltipDismissal(event.id, target);
    }
  }

  positionTooltip(target) {
    const tooltip = this.nodes.tooltip;
    const win = this.document.defaultView || globalThis;
    if (!target?.getBoundingClientRect || !tooltip?.getBoundingClientRect) return;
    const r = target.getBoundingClientRect();
    const tr = tooltip.getBoundingClientRect();
    const width = Number(win.innerWidth) || 1024;
    const height = Number(win.innerHeight) || 768;
    const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));
    const left = clamp(r.left + r.width / 2 - tr.width / 2, 8, width - tr.width - 8);
    let top = r.bottom + 7;
    if (top + tr.height > height - 8) top = r.top - tr.height - 7;
    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.top = `${Math.round(Math.max(8, top))}px`;
  }

  bindTooltipDismissal(eventId, target) {
    this.tooltipCleanup?.();
    const leave = () => {
      if (this.document.activeElement === target) return;
      this.owner.dismiss(eventId, 'tooltip-pointer-leave');
    };
    const blur = () => {
      let hovered = false;
      try { hovered = Boolean(target.matches?.(':hover')); } catch {}
      if (!hovered) this.owner.dismiss(eventId, 'tooltip-focus-out');
    };
    const escape = event => {
      if (event.key === 'Escape' && this.tooltipEventId === eventId) this.owner.dismiss(eventId, 'tooltip-escape');
    };
    target.addEventListener?.('pointerleave', leave);
    target.addEventListener?.('blur', blur);
    this.document.addEventListener?.('keydown', escape, true);
    this.tooltipCleanup = () => {
      target.removeEventListener?.('pointerleave', leave);
      target.removeEventListener?.('blur', blur);
      this.document.removeEventListener?.('keydown', escape, true);
      this.tooltipCleanup = null;
    };
  }

  unlinkTooltipTarget() {
    this.tooltipCleanup?.();
    if (this.tooltipTarget?.getAttribute) {
      const tokens = String(this.tooltipTarget.getAttribute('aria-describedby') || '').split(/\s+/).filter(token => token && token !== this.nodes.tooltip.id);
      if (tokens.length) this.tooltipTarget.setAttribute('aria-describedby', tokens.join(' '));
      else this.tooltipTarget.removeAttribute('aria-describedby');
    }
    this.tooltipTarget = null;
  }

  syncPresentation() {
    if (!this.nodes) return;
    const active = this.owner.snapshot().active;
    const activeIds = new Set(active.map(event => event.id));
    const clearTimer = this.document.defaultView?.clearTimeout?.bind(this.document.defaultView) || globalThis.clearTimeout;
    for (const [id, timer] of this.timers) {
      if (!activeIds.has(id)) {
        if (typeof clearTimer === 'function') clearTimer(timer);
        this.timers.delete(id);
      }
    }
    for (const event of active) this.scheduleExpiry(event);

    const status = [...active].reverse().find(item => item.channel === 'status');
    if (status) this.presentStatus(status);
    else {
      this.nodes.status.textContent = '';
      delete this.nodes.status.dataset.feedbackId;
      delete this.nodes.status.dataset.tone;
    }
    this.syncToasts();

    const tooltip = [...active].reverse().find(item => item.channel === 'tooltip');
    if (tooltip) this.presentTooltip(tooltip, this.owner.presentationFor(tooltip.id)?.target || null);
    else {
      this.nodes.tooltip.textContent = '';
      this.nodes.tooltip.hidden = true;
      delete this.nodes.tooltip.dataset.feedbackId;
      this.tooltipEventId = null;
      this.unlinkTooltipTarget();
    }
  }

  destroy() {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.unlinkTooltipTarget();
    const clearTimer = this.document.defaultView?.clearTimeout?.bind(this.document.defaultView) || globalThis.clearTimeout;
    for (const timer of this.timers.values()) if (typeof clearTimer === 'function') clearTimer(timer);
    this.timers.clear();
    for (const node of this.createdNodes) node.remove?.();
    this.createdNodes.clear();
    this.host = null;
    this.nodes = null;
  }
}
