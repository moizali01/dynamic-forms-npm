'use strict';

/**
 * Drop-in Express collector for panda-forms telemetry.
 *
 * Mounts the two POST routes the client widget sends to — /log-interaction
 * (reaction timing) and /tracker_endpoint (full tracker stream) — and appends
 * one JSON line per request to per-form .jsonl files. The formType routing and
 * payload enrichment match the research server's server.js exactly, so logs
 * are byte-compatible with what that server produces.
 *
 * Usage:
 *   const express = require('express');
 *   const { collector } = require('panda-forms/server');
 *   const app = express();
 *   app.use(collector({ logDir: './logs' }));
 *   app.listen(3000);
 *
 * Options:
 *   logDir   directory for the .jsonl files            (default './logs')
 *   cors     true, or an origin string/array/fn, to add permissive CORS
 *            headers + preflight handling               (default false)
 *   quiet    suppress the interaction-timing console summary (default false)
 *   basePath prefix for the routes, e.g. '/panda'       (default '')
 *   bodyLimit express.json limit                        (default '10mb')
 *
 * Returns an express.Router you `app.use(...)`. The router installs its own
 * express.json() body parser, so it works even if the host app hasn't.
 */

const fs = require('fs');
const path = require('path');
const express = require('express');

function collector(options = {}) {
  const {
    logDir = path.join(process.cwd(), 'logs'),
    cors = false,
    quiet = false,
    basePath = '',
    bodyLimit = '10mb',
  } = options;

  fs.mkdirSync(logDir, { recursive: true });

  const INTERACTION_FILES = {
    'dynamic-form': path.join(logDir, 'dynamic-form-interactions.jsonl'),
    'pledge-form': path.join(logDir, 'pledge-form-interactions.jsonl'),
    default: path.join(logDir, 'interaction-log.jsonl'),
  };
  const TRACKER_FILES = {
    'dynamic-form': path.join(logDir, 'tracker-dynamic-form.jsonl'),
    'pledge-form': path.join(logDir, 'tracker-pledge-form.jsonl'),
    default: path.join(logDir, 'tracker-log.jsonl'),
  };

  function pickFile(files, formType) {
    const t = String(formType || '').toLowerCase().trim();
    if (t.includes('dynamic')) return files['dynamic-form'];
    if (t.includes('pledge')) return files['pledge-form'];
    return files.default;
  }

  function enrich(req, formType) {
    return {
      ...req.body,
      formType,
      serverReceivedAt: Date.now(),
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    };
  }

  function append(file, entry) {
    fs.appendFile(file, JSON.stringify(entry) + '\n', (err) => {
      if (err) console.error('[panda-forms] failed to write log:', err.message);
    });
  }

  const router = express.Router();
  router.use(express.json({ limit: bodyLimit }));

  if (cors) router.use(corsMiddleware(cors));

  const p = (route) => (basePath ? basePath.replace(/\/+$/, '') + route : route);

  router.post(p('/log-interaction'), (req, res) => {
    const formType =
      req.body?.formType || req.body?.formName || req.body?.sourceForm || 'unknown';
    const file = pickFile(INTERACTION_FILES, formType);
    const entry = enrich(req, formType);

    if (!quiet) printSummary(entry, path.basename(file));
    append(file, entry);
    res.json({ ok: true });
  });

  router.post(p('/tracker_endpoint'), (req, res) => {
    const formType =
      req.body?.formType || req.body?.form || req.body?.sourceForm || 'unknown';
    const file = pickFile(TRACKER_FILES, formType);
    append(file, enrich(req, formType));
    res.json({ ok: true });
  });

  return router;
}

function printSummary(entry, fileName) {
  console.log('\n--- INTERACTION TIMING ---');
  console.log('Form    :', entry.formType);
  console.log('Log file:', fileName);
  console.log('Session :', entry.sessionId);
  console.log('UA      :', entry.userAgent);
  if (entry.summary) {
    const s = entry.summary;
    console.log(
      `Summary : n=${s.count}  min=${s.minMs}ms  median=${s.medianMs}ms  mean=${s.meanMs}ms  max=${s.maxMs}ms`
    );
  }
  if (Array.isArray(entry.reactions)) {
    entry.reactions.forEach((r) => {
      console.log(
        `  ${String(r.fieldId).padEnd(28)} ${String(r.reactionMs).padStart(6)}ms  [${r.eventType}]  trusted=${r.isTrusted}`
      );
    });
  }
  console.log('--------------------------\n');
}

function corsMiddleware(cors) {
  return function (req, res, next) {
    const origin = req.headers.origin;
    let allow = '*';
    if (typeof cors === 'string') allow = cors;
    else if (Array.isArray(cors)) allow = cors.includes(origin) ? origin : cors[0] || '*';
    else if (typeof cors === 'function') allow = cors(origin) ? origin || '*' : 'null';

    res.setHeader('Access-Control-Allow-Origin', allow);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  };
}

module.exports = { collector };
