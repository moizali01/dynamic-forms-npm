import { SCHEMAS, listFields } from './schemas.js';
import { renderForm } from './renderer.js';
import { initReveal } from './reveal.js';
import { createTelemetry } from './telemetry.js';
import { buildCss } from './styles.js';

/**
 * PandaForm — framework-agnostic form widget for the panda conservation
 * research study. Renders one of two progressive-disclosure forms, lets the
 * installer pick which fields to include, and streams the same telemetry the
 * original research pages collected to an endpoint the installer controls.
 *
 * Usage:
 *   import { PandaForm } from 'panda-forms';
 *   PandaForm.mount('#signup', {
 *     form: 'pledge',                        // 'pledge' | 'dynamic'
 *     fields: ['full_name','email','phone'], // omit for all fields
 *     endpoint: 'https://collector.example.com',
 *     onSubmit(values) { ... }               // optional
 *   });
 */

let injectedAccent = null;

function injectStyles(accent) {
  const id = 'panda-forms-styles-' + accent;
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = buildCss(accent);
  document.head.appendChild(style);
}

function resolveTarget(target) {
  if (typeof target === 'string') return document.querySelector(target);
  if (target instanceof Element) return target;
  return null;
}

export function mount(target, options = {}) {
  const {
    form = 'dynamic',
    fields = null,
    endpoint = '',
    title,
    intro,
    showProgress = true,
    reactionTiming = true,
    tracker = true,
    onSubmit,
    onEvent,
  } = options;

  const schema = SCHEMAS[form];
  if (!schema) {
    throw new Error(
      `[panda-forms] unknown form "${form}". Use "pledge" or "dynamic".`
    );
  }

  const host = resolveTarget(target);
  if (!host) {
    throw new Error(`[panda-forms] mount target not found: ${target}`);
  }
  if (!endpoint) {
    console.warn('[panda-forms] no `endpoint` set — telemetry will POST to the current origin.');
  }

  injectStyles(schema.accent);
  injectedAccent = schema.accent;

  // Root container (scopes styles + tracker DOM listeners).
  const root = document.createElement('div');
  root.className = 'pf-root';

  const h1 = document.createElement('h1');
  h1.className = 'pf-title';
  h1.textContent = title || schema.title;
  root.appendChild(h1);

  const p = document.createElement('p');
  p.className = 'pf-intro';
  p.textContent = intro || schema.intro;
  root.appendChild(p);

  const { formEl, dotsEl, fieldEls } = renderForm(schema, fields);
  if (showProgress) root.appendChild(dotsEl);
  root.appendChild(formEl);

  const success = document.createElement('div');
  success.className = 'pf-success pf-hidden';
  success.textContent =
    schema.accent === 'green'
      ? "✓ Thank you for your pledge! You're helping protect giant pandas. We'll be in touch soon."
      : '✓ Thank you for registering! We will be in touch soon.';
  root.appendChild(success);

  host.appendChild(root);

  // Telemetry first — the reveal engine needs its reveal/hide hooks.
  const telemetry = createTelemetry({
    endpoint,
    formType: schema.formType,
    reactionTiming,
    tracker,
    root,
    onEvent,
  });

  const progress = createProgress(root, dotsEl);
  initReveal(schema, fieldEls, {
    onReveal: telemetry.onReveal,
    onHide: telemetry.onHide,
    onProgress: showProgress ? progress : () => {},
  });

  telemetry.start();

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    telemetry.onSubmit();
    const values = collectValues(formEl);
    if (typeof onSubmit === 'function') {
      try {
        onSubmit(values, { sessionId: telemetry.sessionId });
      } catch (err) {
        console.error('[panda-forms] onSubmit handler threw:', err);
      }
    }
    formEl.style.display = 'none';
    if (dotsEl) dotsEl.style.display = 'none';
    success.classList.remove('pf-hidden');
  });

  return {
    root,
    formEl,
    destroy() {
      telemetry.destroy();
      root.remove();
    },
    getValues: () => collectValues(formEl),
  };
}

function createProgress(root, dotsEl) {
  if (!dotsEl) return () => {};
  return function update() {
    const total = root.querySelectorAll('.pf-reveal').length || 1;
    const visible = root.querySelectorAll('.pf-reveal.pf-visible').length;
    const dots = dotsEl.querySelectorAll('.pf-dot');
    dots.forEach((dot, i) => {
      const threshold = Math.round(((i + 1) * total) / dots.length);
      dot.classList.toggle('pf-active', visible >= threshold);
    });
  };
}

function collectValues(formEl) {
  const data = new FormData(formEl);
  const out = {};
  for (const [k, v] of data.entries()) {
    if (k in out) {
      out[k] = Array.isArray(out[k]) ? [...out[k], v] : [out[k], v];
    } else {
      out[k] = v;
    }
  }
  return out;
}

export { SCHEMAS, listFields };

export const PandaForm = { mount, listFields, forms: Object.keys(SCHEMAS), SCHEMAS };
export default PandaForm;
