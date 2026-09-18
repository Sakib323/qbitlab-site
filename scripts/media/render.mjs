#!/usr/bin/env node
// Renders the hero's image sequence from the 3D scene in scripts/media/render/,
// using headless Chrome and the three package from node_modules.
//
//   node scripts/media/render.mjs hero [--frames 120] [--out public/media/sequence]
//     -> <out>/landscape/frame_001.webp … (2400×1350) and <out>/portrait/frame_001.webp … (1080×1920)
//
//   node scripts/media/render.mjs stills [--out <dir>] [--size 2000]
//     -> <dir>/<object>.png, transparent, for scripts/media/encode.mjs objects
//
//   node scripts/media/render.mjs preview --p 0.1,0.5 [--variant landscape] [--out dir]
//     -> single frames at those scroll positions, for tuning the scene

import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, saveDataUrl } from './chrome.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');

const [mode, ...rest] = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : fallback;
};

export const SETS = {
  landscape: { width: 2400, height: 1350, quality: 0.82 },
  portrait: { width: 1080, height: 1920, quality: 0.82 },
};

const OBJECT_NAMES = ['speech-bubble', 'laptop', 'megaphone', 'calendar', 'puzzle', 'phone-app', 'phone-call', 'earbud'];

if (!['hero', 'stills', 'preview'].includes(mode)) {
  console.error('Usage:\n  render.mjs hero [--frames 120] [--out dir]\n  render.mjs stills [--out dir] [--size 2000]\n  render.mjs preview --p 0.1,0.5 [--variant landscape] [--out dir]');
  process.exit(1);
}

const browser = await launch({
  routes: {
    '/render/': join(here, 'render'),
    '/three/': join(root, 'node_modules/three'),
  },
});

try {
  await browser.open('/render/index.html', 60000);
  console.log(`WebGL: ${await browser.run('glInfo()')}`);

  if (mode === 'stills') {
    const size = Number(flag('size', 2000));
    const dir = resolve(flag('out', 'objects'));
    mkdirSync(dir, { recursive: true });
    for (const name of flag('only', OBJECT_NAMES.join(',')).split(',')) {
      const file = join(dir, `${name}.png`);
      const bytes = saveDataUrl(file, await browser.run(`renderObject('${name}', ${size}, ${size})`));
      console.log(`${name}.png  ${(bytes / 1e6).toFixed(1)} MB`);
    }
  } else if (mode === 'preview') {
    const variant = flag('variant', 'landscape');
    const total = Number(flag('frames', 120));
    const set = SETS[variant];
    const dir = resolve(flag('out', '.'));
    mkdirSync(dir, { recursive: true });
    for (const p of flag('p', '0').split(',').map(Number)) {
      const frame = Math.round(p * (total - 1));
      const out = join(dir, `${variant}-${String(frame + 1).padStart(3, '0')}.webp`);
      const size = saveDataUrl(out, await browser.run(`renderHeroFrame(${frame}, ${total}, '${variant}', ${set.width}, ${set.height}, ${set.quality})`));
      console.log(`${out}  ${(size / 1024).toFixed(0)} KB`);
    }
  } else {
    const total = Number(flag('frames', 120));
    const out = resolve(flag('out', join(root, 'public/media/sequence')));
    for (const [variant, set] of Object.entries(SETS)) {
      const dir = join(out, variant);
      mkdirSync(dir, { recursive: true });
      let bytes = 0;
      for (let i = 0; i < total; i++) {
        const name = `frame_${String(i + 1).padStart(3, '0')}.webp`;
        bytes += saveDataUrl(
          join(dir, name),
          await browser.run(`renderHeroFrame(${i}, ${total}, '${variant}', ${set.width}, ${set.height}, ${set.quality})`),
        );
        process.stdout.write(`\r${variant} ${i + 1}/${total}`);
      }
      console.log(`  ${(bytes / 1e6).toFixed(1)} MB`);
    }
    console.log(`Update sequence.frames in src/content/media.ts to ${total} if it changed.`);
  }
} finally {
  await browser.close();
}
