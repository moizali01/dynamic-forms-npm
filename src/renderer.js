import { PANEL_TONES } from './styles.js';

/**
 * Render a form from a schema + the installer-selected subset of field keys.
 *
 * Returns { formEl, dotsEl, fieldEls } where fieldEls maps every field key to
 * its wrapper element. Fields flagged `always` render inline; everything else
 * is wrapped in a `.pf-reveal` container the reveal engine toggles.
 *
 * Selection filtering rule: a field is included when its key is in `selected`
 * (or `selected` is null meaning "all"). Reveal triggers that point at a field
 * that was filtered out are dropped later by the engine, so partial selections
 * degrade gracefully — e.g. keeping `email` but dropping `full_name` just makes
 * `email` visible from the start.
 */
export function renderForm(schema, selected) {
  const keep = selected == null ? null : new Set(selected);
  const fields = schema.fields.filter((f) => keep == null || keep.has(f.key));

  const formEl = el('form', { id: schema.id, class: 'pf-form' });
  const fieldEls = {};

  for (const field of fields) {
    const node = buildField(field);
    if (!node) continue;
    fieldEls[field.key] = node;
    formEl.appendChild(node);
  }

  const submit = el('button', {
    type: 'submit',
    class: 'pf-submit',
    'data-pf': 'submit',
  });
  submit.textContent = schema.accent === 'green' ? 'Submit Pledge' : 'Submit Registration';
  formEl.appendChild(submit);

  const dotsEl = buildProgress(fields);
  return { formEl, dotsEl, fieldEls };
}

function buildProgress(fields) {
  const wrap = el('div', { class: 'pf-progress', 'data-pf': 'progress' });
  wrap.appendChild(el('span', { class: 'pf-progress-label' }, 'Progress:'));
  const revealCount = fields.filter((f) => !f.always).length;
  const dots = Math.min(8, Math.max(1, revealCount || 1));
  for (let i = 0; i < dots; i++) {
    wrap.appendChild(el('span', { class: 'pf-dot' + (i === 0 ? ' pf-active' : '') }));
  }
  return wrap;
}

/** Build a single field's wrapper (with reveal wrapper unless `always`). */
function buildField(field) {
  const wrapper = el('div', {
    class: 'pf-field' + (field.always ? '' : ' pf-reveal'),
    'data-pf-field': field.key,
  });

  if (field.note) wrapper.appendChild(buildNote(field.note));

  const inner =
    field.type === 'group'
      ? buildGroup(field)
      : field.panel
      ? buildPanel(field)
      : buildControl(field);

  wrapper.appendChild(inner);
  return wrapper;
}

function buildNote(note) {
  const tone = PANEL_TONES[note.tone] || PANEL_TONES.yellow;
  const box = el('div', {
    class: 'pf-note',
    style: `background:${tone.bg};border:1px solid ${tone.border};color:${tone.text};`,
  });
  box.innerHTML = note.html;
  return box;
}

function buildPanel(field) {
  const tone = PANEL_TONES[field.panel.tone] || PANEL_TONES.blue;
  const panel = el('div', {
    class: 'pf-panel',
    style: `background:${tone.bg};border:1px solid ${tone.border};`,
  });
  const title = el('p', { class: 'pf-panel-title', style: `color:${tone.text};` });
  title.innerHTML = labelText(field);
  panel.appendChild(title);
  panel.appendChild(buildControlBody(field));
  if (field.extra) panel.appendChild(buildSubField(field.extra));
  return panel;
}

function buildGroup(field) {
  const tone = PANEL_TONES[field.panel.tone] || PANEL_TONES.blue;
  const panel = el('div', {
    class: 'pf-panel',
    style: `background:${tone.bg};border:1px solid ${tone.border};`,
  });
  const title = el('p', { class: 'pf-panel-title', style: `color:${tone.text};` });
  title.innerHTML = labelText(field);
  panel.appendChild(title);
  for (const child of field.children) panel.appendChild(buildSubField(child));
  return panel;
}

function buildSubField(child) {
  const wrap = el('div', { class: 'pf-subfield' });
  const label = el('label', { class: 'pf-label', for: idFor(child) });
  label.innerHTML = labelText(child);
  wrap.appendChild(label);
  wrap.appendChild(buildControlBody(child));
  return wrap;
}

/** A standalone (non-panel) field: label + control + optional help. */
function buildControl(field) {
  const frag = document.createDocumentFragment();

  if (field.single) {
    // Single checkbox with inline label (newsletter opt-in style).
    const choice = el('label', { class: 'pf-choice', for: idFor(field) });
    choice.appendChild(control(field));
    const span = el('span');
    span.innerHTML = labelText(field);
    choice.appendChild(span);
    frag.appendChild(choice);
    return wrapFragment(frag);
  }

  const isGroup = field.type === 'radio' || field.type === 'checkbox';
  const label = el(isGroup ? 'p' : 'label', {
    class: 'pf-label',
    ...(isGroup ? {} : { for: idFor(field) }),
  });
  label.innerHTML = labelText(field);
  frag.appendChild(label);
  frag.appendChild(buildControlBody(field));
  if (field.help) frag.appendChild(el('p', { class: 'pf-help' }, field.help));
  return wrapFragment(frag);
}

/** Just the interactive control (no outer label), used by panels/groups too. */
function buildControlBody(field) {
  if (field.type === 'radio' || field.type === 'checkbox') {
    if (field.single) {
      const choice = el('label', { class: 'pf-choice', for: idFor(field) });
      choice.appendChild(control(field));
      const span = el('span');
      span.innerHTML = labelText(field);
      choice.appendChild(span);
      return choice;
    }
    const group = el('div', {
      class: 'pf-choice-group' + (field.inline ? ' pf-inline' : ''),
    });
    (field.options || []).forEach((opt, i) => {
      const cid = `${idFor(field)}-${i}`;
      const choice = el('label', { class: 'pf-choice', for: cid });
      choice.appendChild(
        control(field, { id: cid, value: opt.value, single: true })
      );
      const span = el('span');
      span.textContent = opt.label;
      choice.appendChild(span);
      group.appendChild(choice);
    });
    return group;
  }
  return control(field);
}

/** Create the raw <input>/<select>/<textarea> element. */
function control(field, override = {}) {
  const name = field.name || field.key;
  const id = override.id || idFor(field);

  if (field.type === 'select') {
    const sel = el('select', { id, name, class: 'pf-select' });
    if (field.placeholder) sel.appendChild(el('option', { value: '' }, field.placeholder));
    (field.options || []).forEach((opt) => {
      sel.appendChild(el('option', { value: opt.value }, opt.label));
    });
    return sel;
  }

  if (field.type === 'textarea') {
    const ta = el('textarea', {
      id,
      name,
      class: 'pf-textarea',
      rows: String(field.rows || 3),
      ...(field.placeholder ? { placeholder: field.placeholder } : {}),
    });
    return ta;
  }

  if (field.type === 'radio' || field.type === 'checkbox') {
    return el('input', {
      type: field.type,
      id,
      name,
      value: override.value != null ? override.value : field.value || 'yes',
    });
  }

  // text / email / tel / number / date
  const attrs = { type: field.type, id, name, class: 'pf-input' };
  if (field.placeholder) attrs.placeholder = field.placeholder;
  if (field.autocomplete) attrs.autocomplete = field.autocomplete;
  if (field.min != null) attrs.min = String(field.min);
  return el('input', attrs);
}

function labelText(field) {
  let html = field.label || '';
  if (field.required) html += ' <span class="pf-req">*</span>';
  else if (field.optionalTag) {
    html += ` <span class="pf-optional">${field.optionalHint || '(optional)'}</span>`;
  }
  return html;
}

function idFor(field) {
  return 'pf-' + (field.key || field.name);
}

/* ── tiny DOM helpers ─────────────────────────────────────────── */
function el(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    node.setAttribute(k, v);
  }
  if (text != null) node.textContent = text;
  return node;
}

function wrapFragment(frag) {
  const div = document.createElement('div');
  div.appendChild(frag);
  // Unwrap: return a span container that behaves as the field body.
  return div;
}
