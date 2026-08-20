import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import os from 'os';

const require = createRequire(import.meta.url);
const express = require('express');
const { collector } = require('./server.cjs');

const logDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pf-logs-'));

const app = express();
app.use(collector({ logDir, cors: true, quiet: true }));
const server = app.listen(0);
await new Promise((r) => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}`;

let failures = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) failures++; };

async function post(route, body) {
  const res = await fetch(base + route, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res;
}
function readLines(file) {
  const p = path.join(logDir, file);
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

console.log('\n[collector] reaction-timing route');
let res = await post('/log-interaction', {
  sessionId: 's1', formType: 'pledge-form', userAgent: 'UA',
  summary: { count: 1, minMs: 10, maxMs: 10, meanMs: 10, medianMs: 10 },
  reactions: [{ fieldId: 'email', reactionMs: 10, eventType: 'focus', isTrusted: true }],
});
ok(res.status === 200 && (await res.json()).ok, 'POST /log-interaction → {ok:true}');
ok(res.headers.get('access-control-allow-origin') === '*', 'CORS header present');

console.log('\n[collector] tracker route');
res = await post('/tracker_endpoint', {
  session_id: 'sess_x', formType: 'dynamic-form', url: '/signup',
  events: [{ type: 'field_revealed', field_id: 'country', timestamp: 1 }],
});
ok(res.status === 200, 'POST /tracker_endpoint → 200');

console.log('\n[collector] CORS preflight');
res = await fetch(base + '/log-interaction', { method: 'OPTIONS' });
ok(res.status === 204, 'OPTIONS preflight → 204');

console.log('\n[collector] log files');
const pledge = readLines('pledge-form-interactions.jsonl');
ok(pledge.length === 1 && pledge[0].formType === 'pledge-form', 'pledge interaction line written to right file');
ok(pledge[0].serverReceivedAt && pledge[0].ip, 'entry enriched with serverReceivedAt + ip');
const tracker = readLines('tracker-dynamic-form.jsonl');
ok(tracker.length === 1 && tracker[0].events[0].type === 'field_revealed', 'dynamic tracker line written to right file');

// unknown formType falls back to default file
await post('/log-interaction', { sessionId: 's2', formType: 'mystery' });
ok(readLines('interaction-log.jsonl').length === 1, 'unknown formType → default interaction file');

server.close();
fs.rmSync(logDir, { recursive: true, force: true });
console.log(`\n${failures === 0 ? 'ALL PASSED' : failures + ' FAILURE(S)'}`);
process.exit(failures === 0 ? 0 : 1);
