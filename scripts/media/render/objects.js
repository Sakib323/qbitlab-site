// One object per service, modelled and lit the same way, so the page reads as a
// single family of images rather than a folder of stock photos. Everything is
// rendered against transparency: the object sits directly on the page.

import * as THREE from 'three';
import { planarUVs, roundedRect, slab } from './studio.js';
import { createPhone } from './phone.js';
import { createScreenCanvas, drawHeroScreen } from './screen.js';

export const SHELL = new THREE.MeshPhysicalMaterial({
  color: 0xf1f1f3,
  roughness: 0.26,
  metalness: 0,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
});

export const DARK = new THREE.MeshPhysicalMaterial({
  color: 0x1d1d1f,
  roughness: 0.34,
  metalness: 0,
  clearcoat: 0.7,
  clearcoatRoughness: 0.14,
});

export const METAL = new THREE.MeshPhysicalMaterial({ color: 0xc6c9ce, metalness: 1, roughness: 0.24 });

function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  return texture;
}

/** A flat panel carrying a texture, for screens and printed faces. */
function panel(width, height, radius, texture, { emissive = false } = {}) {
  const material = emissive
    ? new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        roughness: 0.14,
        clearcoat: 0.35,
        emissive: 0xffffff,
        emissiveMap: texture,
      })
    : new THREE.MeshPhysicalMaterial({ map: texture, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.12 });
  return new THREE.Mesh(planarUVs(new THREE.ShapeGeometry(roundedRect(width, height, radius), 48), width, height), material);
}

function label(ctx, weight, size, color, text, x, y, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Inter`;
  ctx.letterSpacing = `${-0.02 * size}px`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

/** Chatbots and assistants: a speech bubble mid-reply. */
function speechBubble() {
  const w = 1.34;
  const h = 0.98;
  const r = 0.3;
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + 0.3);
  shape.bezierCurveTo(-w / 2 - 0.03, -h / 2 - 0.08, -w / 2 - 0.08, -h / 2 - 0.16, -w / 2 - 0.19, -h / 2 - 0.27);
  shape.bezierCurveTo(-w / 2 + 0.06, -h / 2 - 0.14, -w / 2 + 0.12, -h / 2 - 0.04, -w / 2 + r + 0.04, -h / 2);

  const depth = 0.3;
  const bevel = 0.07;
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: depth - 2 * bevel,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 12,
    curveSegments: 64,
  });
  geometry.translate(0, 0, -(depth - 2 * bevel) / 2);

  const group = new THREE.Group();
  group.add(new THREE.Mesh(geometry, SHELL));
  for (const x of [-0.26, 0, 0.26]) {
    const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.06, 48), DARK);
    dot.rotation.x = Math.PI / 2;
    dot.position.set(x, 0.06, depth / 2 - 0.015);
    group.add(dot);
  }
  group.rotation.set(-0.12, 0.42, 0.04);
  return { group, fov: 26, position: [0.5, 0.55, 4.6], target: [0, -0.04, 0] };
}

/** Websites: a laptop showing a business site. */
function laptop() {
  const site = canvasTexture(1780, 1120, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f5f5f7';
    ctx.fillRect(0, 0, w, 104);
    ctx.fillStyle = '#1d1d1f';
    ctx.beginPath();
    ctx.arc(96, 52, 17, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, 600, 27, '#1d1d1f', 'Your business', 128, 62);
    label(ctx, 400, 25, '#6e6e73', 'Menu', 900, 62);
    label(ctx, 400, 25, '#6e6e73', 'Visit', 1030, 62);
    label(ctx, 400, 25, '#6e6e73', 'Contact', 1140, 62);
    ctx.fillStyle = '#0071e3';
    ctx.beginPath();
    ctx.roundRect(1480, 24, 200, 56, 28);
    ctx.fill();
    label(ctx, 500, 25, '#ffffff', 'Book now', 1580, 61, 'center');

    label(ctx, 600, 92, '#1d1d1f', 'Book a table in', 110, 330);
    label(ctx, 600, 92, '#1d1d1f', 'ten seconds.', 110, 432);
    label(ctx, 400, 32, '#6e6e73', 'Open every day from 8am. Ask us anything —', 110, 510);
    label(ctx, 400, 32, '#6e6e73', 'the assistant replies right here.', 110, 556);
    ctx.fillStyle = '#0071e3';
    ctx.beginPath();
    ctx.roundRect(110, 610, 250, 68, 34);
    ctx.fill();
    label(ctx, 500, 29, '#ffffff', 'Book a table', 235, 653, 'center');

    ctx.fillStyle = '#e8e8ed';
    ctx.beginPath();
    ctx.roundRect(1000, 190, 680, 500, 36);
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#f5f5f7';
      ctx.beginPath();
      ctx.roundRect(110 + i * 530, 790, 480, 250, 28);
      ctx.fill();
    }
    // The site's own chat bubble, bottom right.
    ctx.fillStyle = '#0071e3';
    ctx.beginPath();
    ctx.arc(1600, 960, 62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.roundRect(1568, 938, 64, 44, 16);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(1580, 976);
    ctx.lineTo(1574, 998);
    ctx.lineTo(1602, 980);
    ctx.fill();
  });

  const keys = canvasTexture(1700, 1160, (ctx, w, h) => {
    ctx.fillStyle = '#e9e9ec';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#d3d3d8';
    ctx.beginPath();
    ctx.roundRect(120, 40, w - 240, 560, 26);
    ctx.fill();
    ctx.fillStyle = '#2b2b2e';
    for (let row = 0; row < 5; row++) {
      const count = row === 0 ? 14 : 13;
      const keyWidth = (w - 300) / count;
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.roundRect(150 + i * keyWidth + 4, 70 + row * 104, keyWidth - 10, 88, 12);
        ctx.fill();
      }
    }
    ctx.beginPath();
    ctx.roundRect(560, 590, 580, 88, 12);
    ctx.fill();
    ctx.fillStyle = '#dcdce1';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 330, 720, 660, 400, 22);
    ctx.fill();
  });

  const group = new THREE.Group();
  const base = new THREE.Mesh(slab(1.9, 1.3, 0.1, 0.09, 0.03, 6), SHELL);
  base.rotation.x = -Math.PI / 2;
  group.add(base);
  const deck = panel(1.78, 1.2, 0.06, keys);
  deck.rotation.x = -Math.PI / 2;
  deck.position.set(0, 0.046, 0.02);
  group.add(deck);

  const lid = new THREE.Group();
  lid.position.set(0, 0.03, -0.65);
  lid.rotation.x = -0.2;
  const shell = new THREE.Mesh(slab(1.9, 1.26, 0.1, 0.055, 0.02, 6), SHELL);
  shell.position.y = 0.63;
  lid.add(shell);
  const screen = panel(1.8, 1.16, 0.05, site, { emissive: true });
  screen.position.set(0, 0.63, 0.029);
  lid.add(screen);
  group.add(lid);

  group.rotation.y = 0.42;
  return { group, fov: 26, position: [1.05, 1.8, 4.4], target: [0, 0.42, 0] };
}

/** Landing pages: a megaphone. */
function megaphone() {
  const group = new THREE.Group();
  const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.23, 1.05, 96, 1, true), SHELL.clone());
  horn.material.side = THREE.DoubleSide;
  horn.position.y = 0.1;
  const throat = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.215, 1.02, 96, 1, true),
    new THREE.MeshPhysicalMaterial({ color: 0x232326, roughness: 0.45, side: THREE.DoubleSide }),
  );
  throat.position.y = 0.1;
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.026, 24, 96), METAL);
  lip.position.y = 0.625;
  lip.rotation.x = Math.PI / 2;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.21, 0.34, 64), SHELL);
  body.position.y = -0.58;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.21, 48, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), SHELL);
  cap.position.y = -0.75;
  const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.26, 16, 32), SHELL);
  handle.position.set(0, -0.44, 0.26);
  handle.rotation.x = 1.15;
  const grip = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.05, 20, 64, Math.PI * 1.1), SHELL);
  grip.position.set(0, -0.62, 0.34);
  grip.rotation.set(Math.PI / 2, 0, -0.3);
  const trigger = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.1, 10, 24), DARK);
  trigger.position.set(0, -0.4, 0.35);
  trigger.rotation.x = 1.35;
  group.add(horn, throat, lip, body, cap, handle, grip, trigger);

  group.rotation.set(0.22, 0.3, -0.72);
  return { group, fov: 26, position: [0.15, 0.55, 4.2], target: [0, 0, 0] };
}

/** Subscription: a calendar. */
function calendar() {
  const face = canvasTexture(900, 900, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1d1d1f';
    ctx.fillRect(0, 0, w, 168);
    const cell = 92;
    const left = (w - cell * 7) / 2 + 8;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 7; col++) {
        const day = row * 7 + col;
        const highlighted = day === 17;
        ctx.fillStyle = highlighted ? '#0071e3' : '#e8e8ed';
        ctx.beginPath();
        ctx.roundRect(left + col * cell, 228 + row * cell, cell - 26, cell - 26, 12);
        ctx.fill();
      }
    }
  });

  const group = new THREE.Group();
  const body = new THREE.Mesh(slab(1.18, 1.18, 0.14, 0.26, 0.05, 8), SHELL);
  group.add(body);
  const front = panel(1.1, 1.1, 0.1, face);
  front.position.z = 0.131;
  group.add(front);
  for (const x of [-0.3, 0.3]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.022, 20, 48), METAL);
    ring.position.set(x, 0.6, 0);
    group.add(ring);
  }
  group.rotation.set(-0.16, 0.38, 0.03);
  return { group, fov: 26, position: [0.4, 0.5, 4.4], target: [0, 0.04, 0] };
}

/** Extensions and plugins: a puzzle piece. */
function puzzle() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.5, -0.5);
  shape.lineTo(-0.14, -0.5);
  shape.bezierCurveTo(-0.3, -0.16, 0.3, -0.16, 0.14, -0.5);
  shape.lineTo(0.5, -0.5);
  shape.lineTo(0.5, -0.14);
  shape.bezierCurveTo(0.84, -0.3, 0.84, 0.3, 0.5, 0.14);
  shape.lineTo(0.5, 0.5);
  shape.lineTo(-0.5, 0.5);
  shape.lineTo(-0.5, -0.5);

  const depth = 0.26;
  const bevel = 0.05;
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: depth - 2 * bevel,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 10,
    curveSegments: 64,
  });
  geometry.translate(0, 0, -(depth - 2 * bevel) / 2);
  geometry.scale(1.25, 1.25, 1);

  const group = new THREE.Group();
  group.add(new THREE.Mesh(geometry, SHELL));
  group.rotation.set(-0.24, 0.55, -0.1);
  return { group, fov: 26, position: [0.4, 0.5, 4.5], target: [0, 0, 0] };
}

/** Mobile apps: the same phone as the hero, running the same assistant. */
function phoneApp() {
  const canvas = createScreenCanvas();
  drawHeroScreen(canvas, 1, 119);
  const phone = createPhone(canvas);
  phone.group.rotation.set(-0.06, -0.42, 0.05);
  return { group: phone.group, fov: 26, position: [0, 0, 4.6], target: [0, 0, 0] };
}

export const OBJECTS = {
  'speech-bubble': speechBubble,
  laptop,
  megaphone,
  calendar,
  puzzle,
  'phone-app': phoneApp,
};
