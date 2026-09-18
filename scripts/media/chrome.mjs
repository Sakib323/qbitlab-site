// Headless Chrome over the DevTools protocol, for media scripts that need a real
// browser to decode video, render WebGL, or encode WebP. Needs nothing beyond
// Node itself and an installed Google Chrome (set CHROME_PATH if it lives elsewhere).

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';

const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Starts a local file server and a headless Chrome pointed at it.
 *
 * `routes` maps URL paths to files or folders on disk (a key ending in "/" serves
 * a folder) and `pages` maps URL paths to inline HTML. Both are read per request,
 * so callers may add routes after launch.
 */
export async function launch({ routes = {}, pages = {} } = {}) {
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(req.url.split('?')[0]));
    if (path in pages) {
      res.writeHead(200, { 'content-type': 'text/html' });
      return res.end(pages[path]);
    }
    for (const [prefix, target] of Object.entries(routes)) {
      const folder = prefix.endsWith('/');
      if (folder ? !path.startsWith(prefix) : path !== prefix) continue;
      const file = folder ? join(target, path.slice(prefix.length)) : target;
      if (!existsSync(file) || !statSync(file).isFile()) continue;
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
      return res.end(readFileSync(file));
    }
    res.writeHead(404).end();
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;

  const profile = mkdtempSync(join(tmpdir(), 'media-chrome-'));
  const port = 9400 + Math.floor(Math.random() * 500);
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--ignore-gpu-blocklist',
      '--enable-unsafe-swiftshader',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  let target;
  for (let i = 0; i < 75 && !target; i++) {
    await sleep(200);
    try {
      target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page');
    } catch {}
  }
  if (!target) {
    chrome.kill();
    server.close();
    throw new Error(`Could not start Chrome at: ${CHROME}`);
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    } else if (m.method === 'Runtime.consoleAPICalled') {
      console.log('[page]', ...m.params.args.map((a) => a.value ?? a.description));
    } else if (m.method === 'Runtime.exceptionThrown') {
      console.error('[page error]', m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
    }
  });
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id;
      pending.set(i, r);
      ws.send(JSON.stringify({ id: i, method, params }));
    });

  const run = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) {
      throw new Error(r.result.exceptionDetails.exception?.description ?? 'evaluation failed');
    }
    return r.result.result.value;
  };

  /** Opens a page and waits until it sets `window.__ready`. */
  const open = async (path, timeoutMs = 30000) => {
    await send('Page.navigate', { url: `${base}${path}` });
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await run('!!window.__ready').catch(() => false)) return;
      await sleep(200);
    }
    throw new Error(`${path} did not become ready`);
  };

  await send('Runtime.enable');
  await send('Page.enable');

  return {
    base,
    routes,
    run,
    send,
    open,
    async close() {
      ws.close();
      const exited = new Promise((r) => chrome.once('exit', r));
      chrome.kill();
      await Promise.race([exited, sleep(3000)]);
      server.close();
      try {
        rmSync(profile, { recursive: true, force: true });
      } catch {}
    },
  };
}

/** Writes a `data:` URL returned from the page to disk and returns its size in bytes. */
export function saveDataUrl(file, dataUrl) {
  const buf = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
  writeFileSync(file, buf);
  return buf.length;
}
