import * as THREE from 'three';

export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setClearColor(0x000000, 0);
  return renderer;
}

/**
 * A black studio lit only by softboxes. Glossy and metal surfaces pick up long,
 * clean highlight strips and everything else falls away, which is what lets an
 * object sit on the page with no background of its own.
 */
const SOFTBOXES = {
  // The hero, on black: only the highlights survive.
  dark: [
    { size: [5, 2.4], position: [-3.2, 4, 4], intensity: 2.6 }, // key: high, front left
    { size: [0.55, 7], position: [5, 0.5, 2.6], intensity: 4.5 }, // tall strip: right
    { size: [0.55, 7], position: [-5, 0, -1.8], intensity: 3 }, // rim strip: behind left
    { size: [0.7, 6], position: [-5, 0.8, 2.2], intensity: 3.2 }, // edge strip: front left
    { size: [7, 0.6], position: [0, 5.2, -3], intensity: 2 }, // top back strip
    { size: [4, 4], position: [0, -5, 3.5], intensity: 0.22 }, // faint bounce from below
  ],
  // The service objects, which sit on white: a bright tent with one hard strip.
  light: [
    { size: [12, 12], position: [0, 0, 9], intensity: 0.7 }, // front fill
    { size: [8, 6], position: [-4.5, 4.5, 4], intensity: 2.4 }, // key
    { size: [7, 7], position: [5, 1.5, 3.5], intensity: 1.1 }, // right fill
    { size: [10, 7], position: [0, 7, -1], intensity: 1.5 }, // top
    { size: [10, 8], position: [0, -6.5, 2.5], intensity: 0.45 }, // bounce
    { size: [0.7, 8], position: [4.6, 0.5, 2.6], intensity: 4 }, // strip highlight
  ],
};

export function studioEnvironment(renderer, preset = 'dark') {
  const env = new THREE.Scene();
  const plane = new THREE.PlaneGeometry(1, 1);
  for (const box of SOFTBOXES[preset]) {
    const mesh = new THREE.Mesh(
      plane,
      new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(box.intensity), side: THREE.DoubleSide }),
    );
    mesh.scale.set(box.size[0], box.size[1], 1);
    mesh.position.set(...box.position);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(env, 0.02).texture;
  pmrem.dispose();
  return texture;
}

/** Direct lights that shape matte surfaces the environment alone leaves flat. */
export function studioLights(preset = 'dark') {
  const group = new THREE.Group();
  const key = new THREE.DirectionalLight(0xffffff, preset === 'dark' ? 1.6 : 1.1);
  key.position.set(-3, 4, 5);
  const rim = new THREE.DirectionalLight(0xffffff, preset === 'dark' ? 2.2 : 0.7);
  rim.position.set(4, 1.5, -4);
  const fill = new THREE.DirectionalLight(0xffffff, 0.35);
  fill.position.set(2, -2, 5);
  group.add(key, rim, fill);
  return group;
}

export function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/** A rounded-rectangle slab with softly rounded edges, centred on the origin. */
export function slab(w, h, r, depth, bevel, segments = 8) {
  const inner = Math.max(depth - 2 * bevel, 0.0001);
  const geometry = new THREE.ExtrudeGeometry(roundedRect(w - 2 * bevel, h - 2 * bevel, Math.max(r - bevel, 0.001)), {
    depth: inner,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: segments,
    curveSegments: 40,
  });
  geometry.translate(0, 0, -inner / 2);
  return geometry;
}

/** Maps a flat shape's UVs to 0–1 across its bounding box. */
export function planarUVs(geometry, w, h) {
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  uv.needsUpdate = true;
  return geometry;
}
