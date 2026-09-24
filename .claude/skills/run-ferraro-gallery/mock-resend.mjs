#!/usr/bin/env node
// Local stand-in for the Resend HTTP API. The resend SDK honours RESEND_BASE_URL, so starting
// Next with RESEND_BASE_URL=http://127.0.0.1:<port> sends every email/contact call here instead
// of api.resend.com. Each request is appended as one JSON line to the capture file, which the
// driver reads back to assert what the server action would have sent.
//   node mock-resend.mjs [--port 4199] [--out /tmp/ferraro-resend.jsonl] [--fail]
// --fail answers every call with a 422 so the form error states can be exercised.
import { createServer } from 'node:http';
import { appendFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const args = process.argv.slice(2);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const port = Number(opt('--port', '4199'));
const out = opt('--out', '/tmp/ferraro-resend.jsonl');
const fail = args.includes('--fail');
writeFileSync(out, '');

createServer((req, res) => {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', () => {
    let json = null;
    try { json = body ? JSON.parse(body) : null; } catch { json = body; }
    appendFileSync(out, JSON.stringify({ at: new Date().toISOString(), method: req.method, path: req.url, body: json }) + '\n');
    res.setHeader('content-type', 'application/json');
    if (fail) {
      res.statusCode = 422;
      res.end(JSON.stringify({ statusCode: 422, name: 'validation_error', message: 'mock-resend --fail' }));
      return;
    }
    res.end(JSON.stringify({ id: randomUUID(), object: req.url?.startsWith('/contacts') ? 'contact' : 'email' }));
  });
}).listen(port, '127.0.0.1', () => console.log(`mock-resend listening on http://127.0.0.1:${port} -> ${out}`));
