# panda-forms

Embeddable version of the two panda-conservation research forms. Drop one onto
any signup page, pick which fields to show, and the same reveal-timing and
interaction telemetry the research pages collected streams to a server **you**
control.

Two forms, same data: **`dynamic`** uses dropdowns, **`pledge`** uses
radio/checkbox cards.

---

## Setup

### 1. Install

**From npm:**

```bash
npm install panda-forms      # client
npm install panda-forms      # server (for the collector)
```

**Or from a local build:**

```bash
# in the package folder
npm install && npm run build          # → dist/panda-forms.esm.js + .umd.js
# then, from your project(s)
npm install /path/to/panda-forms
```

### 2. Add the form to a page

The form goes into any element on any page you choose — **you don't need a
dedicated route**. Pick the path that matches your project:

<details open>
<summary><strong>React (Vite, CRA, Next client component…)</strong></summary>

`PandaForm.mount()` is a plain DOM mounter, so mount it into a ref and
`destroy()` on unmount:

```jsx
import { useEffect, useRef } from 'react'
import { PandaForm } from 'panda-forms'

export default function Signup() {
  const ref = useRef(null)

  useEffect(() => {
    const instance = PandaForm.mount(ref.current, {
      form: 'dynamic',                 // 'pledge' | 'dynamic'
      endpoint: '/api',                // base URL your server listens on
      onSubmit: (values) => console.log(values),
    })
    return () => instance.destroy()
  }, [])

  return <div ref={ref} />
}
```

Render `<Signup />` wherever your signup page lives.
</details>

<details>
<summary><strong>No framework (plain HTML / vanilla JS)</strong></summary>

Add a target element, then mount into it by CSS selector.

With a bundler (Vite, webpack…):

```html
<div id="signup"></div>
```
```js
import { PandaForm } from 'panda-forms'
PandaForm.mount('#signup', { form: 'dynamic', endpoint: '/api' })
```

Or with a plain `<script>` tag — no build step, `PandaForm` is a global:

```html
<div id="signup"></div>
<script src="https://unpkg.com/panda-forms/dist/panda-forms.umd.js"></script>
<script>
  PandaForm.mount('#signup', { form: 'dynamic', endpoint: '/api' })
</script>
```
</details>

### 3. Collect the telemetry (server)

The package ships a drop-in Express collector implementing both telemetry
routes. Add it where you register routes:

```js
import pandaServer from 'panda-forms/server'
const { collector } = pandaServer
// CommonJS: const { collector } = require('panda-forms/server')

app.use(collector({ logDir: './logs', basePath: '/api' }))
```

It writes one JSON line per request to per-form `.jsonl` files under `logDir`.

> **`basePath` must match the widget's `endpoint`.** With `endpoint: '/api'`
> above, use `basePath: '/api'` so the routes line up
> (`/api/log-interaction`, `/api/tracker_endpoint`). Drop both if the form page
> and server share an origin at the root. If they're on **different** origins,
> pass `cors: true`.

That's the whole loop: form → `endpoint` → collector → `.jsonl` files.

---

## Pick which fields to show

Pass `fields` with the field keys you want; omit it for all. The reveal graph
re-wires itself around whatever you keep. List a form's keys with:

```js
PandaForm.listFields('pledge')
// → [{ key: 'full_name', label: 'Full Name', type: 'text', required: true, always: true }, …]
```
```js
PandaForm.mount(el, {
  form: 'pledge',
  fields: ['full_name', 'email', 'support_type', 'frequency', 'additional_comments'],
  endpoint: '/api',
})
```

Drop a field that would have revealed another, and the dependent one just shows
from the start (never stuck hidden). Exclusive branches still hide each other.

---

## Options

**Widget** — `PandaForm.mount(el, options)`:

| Option | Default | Description |
| --- | --- | --- |
| `form` | `'dynamic'` | `'pledge'` (cards) or `'dynamic'` (dropdowns). |
| `fields` | all | Array of field keys to include. |
| `endpoint` | `''` (origin) | Base URL telemetry is POSTed to. |
| `title` / `intro` | schema default | Override heading text. |
| `showProgress` | `true` | Show the progress dots. |
| `reactionTiming` | `true` | Enable reveal→interaction stream. |
| `tracker` | `true` | Enable mouse/keystroke/input stream. |
| `onSubmit(values, ctx)` | — | Called on submit with collected values. |
| `onEvent(kind, data)` | — | Called on each captured event. |

`mount()` returns `{ root, formEl, getValues(), destroy() }`.

**Collector** — `collector(options)`:

| Option | Default | Description |
| --- | --- | --- |
| `logDir` | `./logs` | Where `.jsonl` files are written. |
| `basePath` | `''` | Route prefix, e.g. `'/api'`. Match your `endpoint`. |
| `cors` | `false` | `true`, or an origin string / array / `(origin)=>bool`, for cross-origin. |
| `quiet` | `false` | Suppress the per-submit console summary. |
| `bodyLimit` | `'10mb'` | `express.json` body size limit. |

The collector installs its own `express.json()` parser and needs `express` as
an (optional) peer dependency.

---

## Telemetry payloads

Two streams POST to your `endpoint`, matching the original research server's
shapes.

**Reaction timing** → `POST {endpoint}/log-interaction` (on submit + on
tab-hide/close via `sendBeacon`, so autofill-only runs still report):

```json
{
  "sessionId": "1720000000000-ab12cd",
  "formType": "pledge-form",
  "summary": { "count": 6, "minMs": 120, "maxMs": 4300, "meanMs": 900, "medianMs": 610 },
  "reactions": [
    { "fieldId": "email", "revealedAt": 1720000001000, "firstInteractAt": 1720000001400,
      "reactionMs": 400, "eventType": "focus", "triggerElement": "INPUT#pf-email", "isTrusted": true }
  ]
}
```

**Full tracker** → `POST {endpoint}/tracker_endpoint` (batched every 2s):

```json
{
  "session_id": "sess_ab12cd34e",
  "formType": "pledge-form",
  "url": "/signup",
  "events": [
    { "type": "field_revealed", "field_id": "email", "timestamp": 1720000001000 },
    { "type": "mouse_move", "x": 421, "y": 88, "timestamp": 1720000001040 },
    { "type": "keypress_dwell_time", "key": "KeyA", "duration_ms": 92, "is_trusted": true, "timestamp": 1720000001120 },
    { "type": "input_capture", "field_name": "email", "value": "j@x.co", "is_trusted": true, "timestamp": 1720000001200 }
  ]
}
```

The collector writes these to per-form files (`serverReceivedAt` + `ip` added):

| formType | interaction file | tracker file |
| --- | --- | --- |
| pledge | `logs/pledge-form-interactions.jsonl` | `logs/tracker-pledge-form.jsonl` |
| dynamic | `logs/dynamic-form-interactions.jsonl` | `logs/tracker-dynamic-form.jsonl` |
| other | `logs/interaction-log.jsonl` | `logs/tracker-log.jsonl` |

---

## Privacy / research note

This package captures keystroke timing, input values, and mouse activity for
behavioral research (distinguishing human from automated form completion). Only
deploy it where participants are appropriately informed and consent is handled
per your study's approved protocol.
