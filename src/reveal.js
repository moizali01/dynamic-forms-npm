/**
 * Reveal engine. Wires the progressive-disclosure graph declared by each
 * field's `reveal` descriptor, driven entirely by the schema so that any
 * installer-selected subset of fields still behaves correctly.
 *
 * Robustness to partial selections:
 *  - A trigger whose source `field` was filtered out is dropped.
 *  - If a reveal field ends up with no surviving triggers at all, it is shown
 *    from the start (otherwise it would be permanently unreachable).
 *  - `hideSiblings` entries that were filtered out are ignored.
 *
 * The engine calls `onReveal(fieldKey)` / `onHide(fieldKey)` so the telemetry
 * layer can stamp reveal timestamps and attach reaction listeners — this is
 * the same reveal→interaction signal the original research pages measured.
 */

const TESTS = {
  minLen2: (v) => v.trim().length >= 2,
  minLen4: (v) => v.trim().length >= 4,
  nonEmpty: (v) => v.trim().length > 0,
  checked: (_v, elm) => !!(elm && elm.checked),
};

function makeTest(spec) {
  if (!spec) return () => true;
  if (TESTS[spec]) return TESTS[spec];
  if (spec.startsWith('eq:')) {
    const want = spec.slice(3);
    return (v) => v === want;
  }
  if (spec.startsWith('neq:')) {
    const want = spec.slice(4);
    return (v) => v !== '' && v !== want;
  }
  return () => true;
}

export function initReveal(schema, fieldEls, { onReveal, onHide, onProgress }) {
  const present = new Set(Object.keys(fieldEls));
  const visible = new Set();

  function isRevealWrapper(key) {
    const node = fieldEls[key];
    return node && node.classList.contains('pf-reveal');
  }

  function show(key) {
    const node = fieldEls[key];
    if (!node || !node.classList.contains('pf-reveal')) return;
    if (node.classList.contains('pf-visible')) return;
    node.classList.add('pf-visible');
    visible.add(key);
    onReveal && onReveal(key, node);
    onProgress && onProgress();
  }

  function hide(key) {
    const node = fieldEls[key];
    if (!node || !node.classList.contains('pf-reveal')) return;
    node.classList.remove('pf-visible');
    visible.delete(key);
    onHide && onHide(key, node);
    onProgress && onProgress();
  }

  // Index fields by key for trigger lookups.
  const byKey = {};
  for (const f of schema.fields) byKey[f.key] = f;

  // Some triggers reference a control nested inside another field (e.g. the
  // pledge `social_handle` lives inside the `awareness_platforms` field, and
  // `custom_amount` is its own field). We resolve a trigger's DOM source by
  // looking for a matching field wrapper, else a control by name/id anywhere.
  function resolveTriggerNodes(sourceKey) {
    const wrapper = fieldEls[sourceKey];
    if (wrapper) return wrapper;
    return null;
  }

  for (const field of schema.fields) {
    if (!present.has(field.key)) continue;
    if (!field.reveal) continue; // `always` fields, no wiring needed
    if (!isRevealWrapper(field.key)) continue;

    const triggers = (field.reveal.on || []).filter((t) => present.has(t.field));
    const hideSiblings = (field.reveal.hideSiblings || []).filter((k) => present.has(k));

    if (triggers.length === 0) {
      // Source field(s) were filtered out — make this reachable anyway.
      show(field.key);
      continue;
    }

    for (const trig of triggers) {
      const sourceNode = resolveTriggerNodes(trig.field);
      if (!sourceNode) continue;
      const test = makeTest(trig.test);

      const handler = (e) => {
        const target = e.target;
        if (!isFormControl(target)) return;
        const value = controlValue(target);
        if (!test(value, target)) {
          // For exclusive switches (radio/select with eq: tests), a
          // non-matching value means hide this branch again.
          if (isExclusiveTest(trig.test)) hide(field.key);
          return;
        }
        // Hide sibling branches before showing this one.
        for (const sib of hideSiblings) hide(sib);
        show(field.key);
      };

      sourceNode.addEventListener(trig.event, handler, true);
    }
  }

  return { show, hide, visibleCount: () => visible.size };
}

function isFormControl(elm) {
  return elm && ['INPUT', 'SELECT', 'TEXTAREA'].includes(elm.tagName);
}

function controlValue(elm) {
  if (elm.type === 'checkbox' || elm.type === 'radio') return elm.value;
  return elm.value || '';
}

function isExclusiveTest(spec) {
  return typeof spec === 'string' && (spec.startsWith('eq:') || spec.startsWith('neq:'));
}
