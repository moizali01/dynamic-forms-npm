import { JSDOM } from 'jsdom';

const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="app"></div></body></html>`, {
  url: 'https://host.example.com/signup',
  pretendToBeVisual: true,
});
const { window } = dom;

// Wire globals the widget expects.
global.window = window;
global.document = window.document;
Object.defineProperty(global, 'navigator', { value: window.navigator, configurable: true });
global.Element = window.Element;
global.Blob = window.Blob;
global.FormData = window.FormData;
global.Event = window.Event;
global.setInterval = window.setInterval;
global.clearInterval = window.clearInterval;

// Capture telemetry POSTs.
const posts = [];
global.fetch = window.fetch = (url, opts) => {
  posts.push({ url, body: JSON.parse(opts.body) });
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
};
window.navigator.sendBeacon = () => true;

const { PandaForm } = await import('./dist/panda-forms.esm.js');

let failures = 0;
function assert(cond, msg) {
  if (cond) console.log('  ✓', msg);
  else { console.error('  ✗', msg); failures++; }
}

function fire(el, type) {
  el.dispatchEvent(new window.Event(type, { bubbles: true }));
}

/* ── Test 1: pledge form, subset of fields ─────────────────── */
console.log('\n[pledge] mount with a field subset');
const inst = PandaForm.mount('#app', {
  form: 'pledge',
  fields: ['full_name', 'email', 'phone', 'support_type', 'frequency', 'additional_comments'],
  endpoint: 'https://collector.example.com',
});
const doc = window.document;

assert(doc.querySelector('[data-pf-field="full_name"]'), 'full_name rendered');
assert(doc.querySelector('[data-pf-field="donation_amount"]') === null, 'unselected field (donation_amount) NOT rendered');

const email = doc.querySelector('[data-pf-field="email"]');
assert(!email.classList.contains('pf-visible'), 'email hidden initially');

// Type a name → reveals email.
const nameInput = doc.querySelector('#pf-full_name');
nameInput.value = 'Jane Doe';
fire(nameInput, 'input');
assert(email.classList.contains('pf-visible'), 'email revealed after typing name');

// Type email → reveals phone.
const emailInput = doc.querySelector('#pf-email');
emailInput.value = 'jane@x.co';
fire(emailInput, 'input');
assert(doc.querySelector('[data-pf-field="phone"]').classList.contains('pf-visible'), 'phone revealed after typing email');

// Focus phone → reveals support_type.
const phoneInput = doc.querySelector('#pf-phone');
fire(phoneInput, 'focus');
assert(doc.querySelector('[data-pf-field="support_type"]').classList.contains('pf-visible'), 'support_type revealed on phone focus');

// Pick support_type → reveals frequency (via the support-detail change path is skipped since detail fields were filtered out; frequency has other triggers too). Just check reaction logging works.
const supportRadio = doc.querySelector('#pf-support_type-0');
fire(supportRadio, 'change');
fire(supportRadio, 'focus');

/* ── Test 2: submit fires telemetry to configured endpoint ─── */
console.log('\n[pledge] submit → telemetry');
const form = doc.querySelector('#pledge-form');
fire(form, 'submit');

const reactionPost = posts.find((p) => p.url.endsWith('/log-interaction'));
assert(reactionPost, 'POST to {endpoint}/log-interaction sent on submit');
assert(reactionPost && reactionPost.url === 'https://collector.example.com/log-interaction', 'reaction endpoint is the configured one');
assert(reactionPost && reactionPost.body.formType === 'pledge-form', 'reaction payload has formType=pledge-form');
assert(reactionPost && Array.isArray(reactionPost.body.reactions) && reactionPost.body.reactions.length > 0, 'reaction payload carries reaction entries');
assert(doc.querySelector('.pf-success:not(.pf-hidden)'), 'success message shown after submit');

inst.destroy();

/* ── Test 3: dynamic form, all fields, select-driven reveal ── */
console.log('\n[dynamic] mount all fields, country→role chain');
posts.length = 0;
const inst2 = PandaForm.mount('#app', { form: 'dynamic', endpoint: 'https://c2.example.com' });
const d = window.document;

d.querySelector('#pf-full_name').value = 'Al';
fire(d.querySelector('#pf-full_name'), 'input');
d.querySelector('#pf-email').value = 'al@x.co';
fire(d.querySelector('#pf-email'), 'input');
assert(d.querySelector('[data-pf-field="country"]').classList.contains('pf-visible'), 'country revealed');

const country = d.querySelector('#pf-country');
country.value = 'US';
fire(country, 'change');
assert(d.querySelector('[data-pf-field="us_state"]').classList.contains('pf-visible'), 'US → us_state revealed');
assert(d.querySelector('[data-pf-field="role"]').classList.contains('pf-visible'), 'country pick → role revealed');
assert(!d.querySelector('[data-pf-field="ca_province"]').classList.contains('pf-visible'), 'ca_province stays hidden for US');

// Switch to CA → us_state hidden, ca_province shown (hideSiblings).
country.value = 'CA';
fire(country, 'change');
assert(!d.querySelector('[data-pf-field="us_state"]').classList.contains('pf-visible'), 'switching to CA hides us_state (hideSiblings)');
assert(d.querySelector('[data-pf-field="ca_province"]').classList.contains('pf-visible'), 'CA → ca_province revealed');

/* ── Test 4: full tracker stream batches ───────────────────── */
console.log('\n[dynamic] tracker stream');
fire(d.querySelector('#pf-role'), 'change'); // a field_completed-ish change
d.querySelector('#pf-full_name') && fire(d.querySelector('#pf-full_name'), 'input');
fire(inst2.formEl, 'submit');
const trackerPost = posts.find((p) => p.url.endsWith('/tracker_endpoint'));
assert(trackerPost, 'POST to {endpoint}/tracker_endpoint sent (tracker stream)');
assert(trackerPost && Array.isArray(trackerPost.body.events), 'tracker payload has events array');
assert(trackerPost && trackerPost.body.events.some((e) => e.type === 'field_revealed'), 'tracker events include field_revealed');

inst2.destroy();

/* ── Test 5: listFields helper ─────────────────────────────── */
console.log('\n[api] listFields');
const pledgeFields = PandaForm.listFields('pledge');
assert(pledgeFields.length === 18, `pledge exposes ${pledgeFields.length} selectable fields`);
assert(pledgeFields[0].key === 'full_name' && pledgeFields[0].always, 'first pledge field is always-on full_name');

console.log(`\n${failures === 0 ? 'ALL PASSED' : failures + ' FAILURE(S)'}`);
process.exit(failures === 0 ? 0 : 1);
