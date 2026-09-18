#!/usr/bin/env node
// Media encoding for the site. Uses the installed Google Chrome to decode and
// encode, so no ffmpeg or image tooling is needed.
//
//   node scripts/media/encode.mjs objects <dir-of-pngs> [--out public/media/objects] [--sizes 900,1800]
//     -> <out>/<name>-900.webp and <out>/<name>-1800.webp, cropped to the subject,
//        and the width/height of each, to paste into src/content/media.ts
//
//   node scripts/media/encode.mjs frames <video.mp4> [--count 120] [--out public/media/sequence]
//     -> <out>/landscape/frame_001.webp … and <out>/portrait/frame_001.webp …
//        (only for footage; the site's own hero comes from scripts/media/render.mjs)
//
// Set CHROME_PATH if Chrome is not at the default macOS location.

import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { launch, saveDataUrl } from './chrome.mjs';

const [mode, input, ...rest] = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : fallback;
};

if (!['objects', 'frames'].includes(mode) || !input) {
  console.error('Usage:\n  encode.mjs objects <dir> [--out dir] [--sizes 900,1800]\n  encode.mjs frames <video.mp4> [--count 120] [--out dir]');
  process.exit(1);
}

const ENCODER = `<!doctype html><html><body><script>
let video;
window.loadVideo = async (src) => {
  video = document.createElement('video'); video.muted = true; video.preload = 'auto';
  video.src = URL.createObjectURL(await (await fetch(src)).blob());
  await new Promise((r, j) => { video.onloadeddata = r; video.onerror = () => j(new Error('video failed to load')); });
  return { duration: video.duration, width: video.videoWidth, height: video.videoHeight };
};
const toDataUrl = (blob) => new Promise((r) => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(blob); });
window.frameAt = async (t, w, h, q) => {
  video.currentTime = t; await new Promise((r) => (video.onseeked = r));
  const c = new OffscreenCanvas(w, h), ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(video, 0, 0, w, h);
  return toDataUrl(await c.convertToBlob({ type: 'image/webp', quality: q }));
};
// Crops a transparent image to its subject, then writes it at the width given.
window.trim = async (src) => {
  const img = new Image(); img.src = src; await img.decode();
  const c = new OffscreenCanvas(img.naturalWidth, img.naturalHeight), ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  let top = c.height, left = c.width, right = -1, bottom = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    if (data[(y * c.width + x) * 4 + 3] > 8) {
      if (y < top) top = y; if (y > bottom) bottom = y;
      if (x < left) left = x; if (x > right) right = x;
    }
  }
  if (right < 0) throw new Error('image is fully transparent');
  window.__trim = { img, left, top, width: right - left + 1, height: bottom - top + 1 };
  return { width: window.__trim.width, height: window.__trim.height };
};
window.write = async (longest, q) => {
  const t = window.__trim, scale = Math.min(1, longest / Math.max(t.width, t.height));
  const w = Math.round(t.width * scale), h = Math.round(t.height * scale);
  const c = new OffscreenCanvas(w, h), ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(t.img, t.left, t.top, t.width, t.height, 0, 0, w, h);
  return toDataUrl(await c.convertToBlob({ type: 'image/webp', quality: q }));
};
window.__ready = true;
</script></body></html>`;

const routes = {};
const browser = await launch({ routes, pages: { '/encoder.html': ENCODER } });

try {
  await browser.open('/encoder.html');

  if (mode === 'objects') {
    const dir = resolve(input);
    const out = resolve(flag('out', 'public/media/objects'));
    const sizes = flag('sizes', '900,1800').split(',').map(Number);
    mkdirSync(out, { recursive: true });
    const summary = {};
    for (const file of readdirSync(dir).filter((f) => /\.png$/i.test(f) && statSync(join(dir, f)).isFile())) {
      const name = basename(file, extname(file));
      routes[`/${file}`] = join(dir, file);
      const box = await browser.run(`trim('/${encodeURIComponent(file)}')`);
      const largest = Math.max(...sizes);
      for (const size of sizes) {
        const bytes = saveDataUrl(join(out, `${name}-${size}.webp`), await browser.run(`write(${size}, 0.86)`));
        if (size === largest) {
          const scale = Math.min(1, size / Math.max(box.width, box.height));
          summary[name] = { width: Math.round(box.width * scale), height: Math.round(box.height * scale) };
        }
        console.log(`${name}-${size}.webp  ${(bytes / 1024).toFixed(0)} KB`);
      }
    }
    console.log('\nDimensions for src/content/media.ts:');
    console.log(JSON.stringify(summary, null, 2));
  } else {
    const count = Number(flag('count', 120));
    const out = resolve(flag('out', 'public/media/sequence'));
    routes['/source.mp4'] = resolve(input);
    const meta = await browser.run(`loadVideo('/source.mp4')`);
    const sets = [
      { dir: 'landscape', w: 2400, h: 1350, q: 0.8 },
      { dir: 'portrait', w: 1080, h: 1920, q: 0.8 },
    ];
    const bytes = {};
    for (const set of sets) mkdirSync(join(out, set.dir), { recursive: true });
    for (let i = 0; i < count; i++) {
      const t = (meta.duration - 0.05) * (i / (count - 1));
      for (const set of sets) {
        const name = `frame_${String(i + 1).padStart(3, '0')}.webp`;
        bytes[set.dir] = (bytes[set.dir] ?? 0) + saveDataUrl(join(out, set.dir, name), await browser.run(`frameAt(${t}, ${set.w}, ${set.h}, ${set.q})`));
      }
      process.stdout.write(`\r${i + 1}/${count} frames`);
    }
    console.log(`\nSource ${meta.width}×${meta.height}, ${meta.duration.toFixed(1)}s → ${out}`);
    for (const [dir, size] of Object.entries(bytes)) console.log(`${dir} ${(size / 1e6).toFixed(1)} MB`);
  }
} finally {
  await browser.close();
}
