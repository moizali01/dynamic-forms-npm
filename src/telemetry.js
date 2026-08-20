/**
 * Telemetry — a faithful port of the two data streams the research pages
 * emitted, retargeted at an installer-configured endpoint base.
 *
 *  1. Reaction timing  → POST {base}/log-interaction
 *     For every revealed field, measures the delay from reveal to the user's
 *     first interaction with it. Flushed on submit and on tab-hide/pagehide
 *     (via sendBeacon) so autofill-only runs that never submit still report.
 *
 *  2. Full tracker      → POST {base}/tracker_endpoint  (batched every 2s)
 *     Field-reveal events, field completions, mouse moves/clicks, input
 *     capture, and keypress dwell times.
 *
 * Payload shapes match the originals (same keys: sessionId/formType/summary/
 * reactions for stream 1; session_id/formType/events for stream 2) so an
 * installer's collector can reuse the existing server.js routes unchanged.
 */

export function createTelemetry(opts) {
  const {
    endpoint,
    formType,
    reactionTiming = true,
    tracker = true,
    trackerBatchMs = 2000,
    mouseThrottleMs = 40,
    root, // scope tracker DOM listeners to the mounted form
    onEvent,
  } = opts;

  const base = String(endpoint || '').replace(/\/+$/, '');
  const sessionId = 'sess_' + Math.random().toString(36).slice(2, 11);
  const reactionSessionId = Date.now() + '-' + Math.random().toString(36).slice(2, 8);

  /* ── Stream 1: reaction timing ─────────────────────────────── */
  const revealTimes = {};
  const reactionLog = [];
  const reactedFields = new Set();
  let logSent = false;

  function onFieldRevealed(fieldKey, node) {
    if (!reactionTiming) return;
    revealTimes[fieldKey] = Date.now();
    attachReactionListeners(fieldKey, node);
  }

  function onFieldHidden(fieldKey) {
    delete revealTimes[fieldKey];
    reactedFields.delete(fieldKey);
  }

  function attachReactionListeners(fieldKey, node) {
    const targets = node.querySelectorAll('input, select, textarea, button');
    const EVENTS = ['focus', 'mousedown', 'touchstart', 'change', 'input'];

    function onFirst(e) {
      if (reactedFields.has(fieldKey)) return;
      reactedFields.add(fieldKey);
      const now = Date.now();
      const revealedAt = revealTimes[fieldKey];
      const entry = {
        sessionId: reactionSessionId,
        fieldId: node.getAttribute('data-pf-field') || fieldKey,
        revealedAt,
        firstInteractAt: now,
        reactionMs: revealedAt != null ? now - revealedAt : null,
        eventType: e.type,
        triggerElement: e.target.tagName + (e.target.id ? '#' + e.target.id : ''),
        isTrusted: e.isTrusted,
      };
      reactionLog.push(entry);
      onEvent && onEvent('reaction', entry);
      targets.forEach((t) => EVENTS.forEach((ev) => t.removeEventListener(ev, onFirst)));
    }

    targets.forEach((t) =>
      EVENTS.forEach((ev) => t.addEventListener(ev, onFirst, { passive: true }))
    );
  }

  function buildReactionPayload() {
    const delays = reactionLog.map((r) => r.reactionMs).filter((n) => n != null);
    const summary = delays.length
      ? {
          count: delays.length,
          minMs: Math.min(...delays),
          maxMs: Math.max(...delays),
          meanMs: Math.round(delays.reduce((a, b) => a + b, 0) / delays.length),
          medianMs: delays.slice().sort((a, b) => a - b)[Math.floor(delays.length / 2)],
        }
      : null;
    return {
      sessionId: reactionSessionId,
      submittedAt: Date.now(),
      userAgent: navigator.userAgent,
      formType,
      summary,
      reactions: reactionLog,
    };
  }

  function sendReactionLog(useBeacon) {
    if (!reactionTiming || logSent || reactionLog.length === 0) return;
    logSent = true;
    post(base + '/log-interaction', buildReactionPayload(), useBeacon);
  }

  /* ── Stream 2: full tracker ────────────────────────────────── */
  let queue = [];
  let batchTimer = null;
  let lastMouseMove = 0;
  const activeKeys = {};
  const scope = root || document;

  function enqueue(evt) {
    if (!tracker) return;
    queue.push(evt);
  }

  function flushTracker() {
    if (queue.length === 0) return;
    const batch = queue.splice(0, 50);
    post(
      base + '/tracker_endpoint',
      {
        session_id: sessionId,
        formType,
        url: typeof location !== 'undefined' ? location.pathname : '',
        events: batch,
      },
      false,
      true // keepalive
    );
  }

  // Field-reveal events also feed the tracker stream (parity with the
  // original MutationObserver that watched for `.visible`).
  function trackReveal(fieldKey, node) {
    enqueue({
      type: 'field_revealed',
      field_id: node.getAttribute('data-pf-field') || fieldKey,
      timestamp: Date.now(),
    });
  }

  function onChange(e) {
    const t = e.target;
    if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(t.tagName)) return;
    enqueue({
      type: 'field_completed',
      field_name: t.name || t.id,
      input_type: t.type,
      timestamp: Date.now(),
    });
  }

  function onMouseMove(e) {
    const now = Date.now();
    if (now - lastMouseMove <= mouseThrottleMs) return;
    lastMouseMove = now;
    enqueue({ type: 'mouse_move', x: Math.round(e.pageX), y: Math.round(e.pageY), timestamp: now });
  }

  function onMouseDown(e) {
    let btn = 'left';
    if (e.button === 1) btn = 'middle';
    if (e.button === 2) btn = 'right';
    enqueue({
      type: 'mouse_click',
      button: btn,
      x: Math.round(e.pageX),
      y: Math.round(e.pageY),
      target_element: e.target.tagName,
      target_id: e.target.id || '',
      is_trusted: e.isTrusted,
      timestamp: Date.now(),
    });
  }

  function onInput(e) {
    const t = e.target;
    if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA') return;
    if (t.type === 'password') return;
    enqueue({
      type: 'input_capture',
      field_name: t.name || t.id || 'unnamed_field',
      value: t.value,
      is_trusted: e.isTrusted,
      timestamp: Date.now(),
    });
  }

  function onKeyDown(e) {
    if (e.repeat) return;
    activeKeys[e.code] = Date.now();
  }

  function onKeyUp(e) {
    const start = activeKeys[e.code];
    if (!start) return;
    delete activeKeys[e.code];
    enqueue({
      type: 'keypress_dwell_time',
      key: e.code,
      duration_ms: Date.now() - start,
      is_trusted: e.isTrusted,
      timestamp: Date.now(),
    });
  }

  /* ── Lifecycle ─────────────────────────────────────────────── */
  function start() {
    if (tracker) {
      scope.addEventListener('change', onChange, true);
      scope.addEventListener('input', onInput, true);
      scope.addEventListener('keydown', onKeyDown, true);
      scope.addEventListener('keyup', onKeyUp, true);
      // Mouse tracking is naturally page-wide.
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mousedown', onMouseDown);
      batchTimer = setInterval(flushTracker, trackerBatchMs);
    }
    window.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
  }

  function onVisibility() {
    if (document.visibilityState === 'hidden') {
      sendReactionLog(true);
      flushTracker();
    }
  }
  function onPageHide() {
    sendReactionLog(true);
    flushTracker();
  }

  function onSubmit() {
    sendReactionLog(false);
    flushTracker();
  }

  function destroy() {
    if (batchTimer) clearInterval(batchTimer);
    scope.removeEventListener('change', onChange, true);
    scope.removeEventListener('input', onInput, true);
    scope.removeEventListener('keydown', onKeyDown, true);
    scope.removeEventListener('keyup', onKeyUp, true);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', onPageHide);
  }

  return {
    start,
    destroy,
    onSubmit,
    // hooks consumed by the reveal engine:
    onReveal: (key, node) => {
      onFieldRevealed(key, node);
      trackReveal(key, node);
    },
    onHide: onFieldHidden,
    sessionId,
    reactionSessionId,
  };
}

function post(url, payload, useBeacon, keepalive) {
  const body = JSON.stringify(payload);
  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    return;
  }
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: !!keepalive,
  }).catch((err) => console.warn('[panda-forms] telemetry post failed:', err));
}
