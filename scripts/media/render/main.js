import * as THREE from 'three';
import { createRenderer, studioEnvironment, studioLights } from './studio.js';
import { createPhone } from './phone.js';
import { createScreenCanvas, drawHeroScreen } from './screen.js';
import { OBJECTS } from './objects.js';

await Promise.all([400, 500, 600, 700].map((w) => document.fonts.load(`${w} 40px Inter`)));

const renderer = createRenderer();
const scene = new THREE.Scene();
scene.environment = studioEnvironment(renderer);
scene.add(studioLights());

const screenCanvas = createScreenCanvas();
const phone = createPhone(screenCanvas);
const rig = new THREE.Group();
rig.add(phone.group);
scene.add(rig);

const camera = new THREE.PerspectiveCamera();

/*
 * Phone pose across the scroll: [p, rotateY, rotateX, rotateZ, dz].
 * The screen faces the viewer the whole way — the back of the phone never shows,
 * since this is a page about the assistant, not about a phone. It starts turned
 * away at an angle, squares up as the chat begins, leans for the call, and
 * settles closer for the last beat.
 */
const KEYS = [
  [0.0, -1.02, 0.09, -0.09, -0.5],
  [0.08, -0.84, 0.05, -0.06, -0.34],
  [0.25, -0.42, -0.03, 0.04, 0],
  [0.46, -0.26, -0.02, 0.02, 0.05],
  [0.6, -0.56, 0.04, -0.03, 0.1],
  [0.76, -0.38, 0.02, 0, 0.13],
  [0.9, -0.18, -0.06, 0.05, 0.3],
  [1.0, -0.12, -0.08, 0.06, 0.36],
];

/** Non-uniform Catmull–Rom through the keyframes, so motion never stops at a key. */
function pose(p) {
  const n = KEYS.length;
  let i = 0;
  while (i < n - 2 && p > KEYS[i + 1][0]) i++;
  const k0 = KEYS[Math.max(i - 1, 0)];
  const k1 = KEYS[i];
  const k2 = KEYS[i + 1];
  const k3 = KEYS[Math.min(i + 2, n - 1)];
  const dt = k2[0] - k1[0];
  const u = Math.min(1, Math.max(0, (p - k1[0]) / dt));
  const u2 = u * u;
  const u3 = u2 * u;
  return k1.slice(1).map((_, j) => {
    const v1 = k1[j + 1];
    const v2 = k2[j + 1];
    const m1 = ((k2[j + 1] - k0[j + 1]) / (k2[0] - k0[0] || 1)) * dt;
    const m2 = ((k3[j + 1] - k1[j + 1]) / (k3[0] - k1[0] || 1)) * dt;
    return (2 * u3 - 3 * u2 + 1) * v1 + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * v2 + (u3 - u2) * m2;
  });
}

/** Framing per frame set: landscape puts the phone right of the copy, portrait below it. */
const FRAMING = {
  landscape: { fov: 24, distance: 4.7, x: 0.6, y: 0.0 },
  portrait: { fov: 30, distance: 5.9, x: 0, y: -0.5 },
};

const output = document.createElement('canvas');
const outputContext = output.getContext('2d');

function capture(subject, width, height, quality, supersample, type = 'image/webp') {
  renderer.setSize(Math.round(width * supersample), Math.round(height * supersample), false);
  renderer.render(subject, camera);
  output.width = width;
  output.height = height;
  outputContext.clearRect(0, 0, width, height);
  outputContext.imageSmoothingQuality = 'high';
  outputContext.drawImage(renderer.domElement, 0, 0, width, height);
  return output.toDataURL(type, quality);
}

window.renderHeroFrame = (frame, total, variant, width, height, quality = 0.82, supersample = 1.5) => {
  const p = frame / (total - 1);
  const f = FRAMING[variant];
  drawHeroScreen(screenCanvas, p, frame);
  phone.texture.needsUpdate = true;

  const [ry, rx, rz, dz] = pose(p);
  phone.group.rotation.set(rx, ry, rz, 'YXZ');
  rig.position.set(f.x, f.y, dz);
  // Reflections drift across the body as the page scrolls.
  scene.environmentRotation.set(0, -0.5 + p * 0.9, 0);

  camera.fov = f.fov;
  camera.aspect = width / height;
  camera.position.set(0, 0, f.distance);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();

  renderer.setClearColor(0x000000, 1);
  return capture(scene, width, height, quality, supersample);
};

// Service objects: same studio, brighter light, and no background at all.
const stills = new THREE.Scene();
stills.environment = studioEnvironment(renderer, 'light');
stills.add(studioLights('light'));
let placed = null;

window.renderObject = (name, width, height, supersample = 2) => {
  if (placed) stills.remove(placed);
  const spec = OBJECTS[name]();
  placed = spec.group;
  stills.add(placed);
  camera.fov = spec.fov;
  camera.aspect = width / height;
  camera.position.set(...spec.position);
  camera.lookAt(...spec.target);
  camera.updateProjectionMatrix();
  renderer.setClearColor(0x000000, 0);
  return capture(stills, width, height, 1, supersample, 'image/png');
};

window.glInfo = () => {
  const gl = renderer.getContext();
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
};

window.__ready = true;
