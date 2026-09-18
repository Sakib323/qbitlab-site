import * as THREE from 'three';
import { planarUVs, roundedRect, slab } from './studio.js';

/** A generic flagship phone in silver, in scene units (1 unit ≈ 100 mm). */
export const PHONE = { width: 0.72, height: 1.48, depth: 0.08, radius: 0.118, bevel: 0.022 };

/** The front glass, which the screen texture covers edge to edge. */
export const GLASS = {
  width: PHONE.width - 2 * PHONE.bevel,
  height: PHONE.height - 2 * PHONE.bevel,
  radius: PHONE.radius - PHONE.bevel,
};

export function createPhone(screenCanvas) {
  const { width: W, height: H, depth: D, bevel: B } = PHONE;
  const group = new THREE.Group();

  const frame = new THREE.MeshPhysicalMaterial({ color: 0xd9dbde, metalness: 1, roughness: 0.22 });
  const back = new THREE.MeshPhysicalMaterial({
    color: 0xececee,
    metalness: 0,
    roughness: 0.42,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
  });
  const lensGlass = new THREE.MeshPhysicalMaterial({
    color: 0x030304,
    metalness: 0,
    roughness: 0.02,
    clearcoat: 1,
    iridescence: 1,
    iridescenceIOR: 1.6,
    iridescenceThicknessRange: [180, 520],
  });

  // Body: the caps take the back glass, the rounded band takes the metal frame.
  group.add(new THREE.Mesh(slab(W, H, PHONE.radius, D, B, 16), [back, frame]));

  // Front glass carrying the screen texture.
  const texture = new THREE.CanvasTexture(screenCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  const screen = new THREE.Mesh(
    planarUVs(new THREE.ShapeGeometry(roundedRect(GLASS.width, GLASS.height, GLASS.radius), 64), GLASS.width, GLASS.height),
    new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      roughness: 0.1,
      metalness: 0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.04,
      emissive: 0xffffff,
      emissiveMap: texture,
    }),
  );
  screen.position.z = D / 2 + 0.0006;
  group.add(screen);

  // Camera plateau on the back, with two lenses, a flash, and a sensor.
  const plate = 0.3;
  const cx = -W / 2 + 0.05 + plate / 2;
  const cy = H / 2 - 0.05 - plate / 2;
  const plateMaterial = back.clone();
  plateMaterial.roughness = 0.22;
  const plateau = new THREE.Mesh(slab(plate, plate, 0.08, 0.02, 0.007, 8), plateMaterial);
  plateau.position.set(cx, cy, -D / 2 - 0.006);
  group.add(plateau);

  const lens = (x, y) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.062, 0.03, 64), frame);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, y, -D / 2 - 0.028);
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.049, 0.049, 0.031, 64), lensGlass);
    glass.rotation.x = Math.PI / 2;
    glass.position.set(x, y, -D / 2 - 0.0285);
    group.add(ring, glass);
  };
  lens(cx - 0.066, cy + 0.066);
  lens(cx - 0.066, cy - 0.066);

  const flash = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.004, 40),
    new THREE.MeshPhysicalMaterial({ color: 0xf3ead2, roughness: 0.35, clearcoat: 1 }),
  );
  flash.rotation.x = Math.PI / 2;
  flash.position.set(cx + 0.075, cy + 0.075, -D / 2 - 0.017);
  const sensor = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 32), lensGlass);
  sensor.rotation.x = Math.PI / 2;
  sensor.position.set(cx + 0.075, cy - 0.075, -D / 2 - 0.017);
  group.add(flash, sensor);

  // Side buttons.
  const button = (x, y, length) => {
    const mesh = new THREE.Mesh(slab(length, 0.028, 0.012, 0.012, 0.004, 4), frame);
    mesh.rotation.set(0, Math.PI / 2, Math.PI / 2);
    mesh.position.set(x, y, 0);
    group.add(mesh);
  };
  button(W / 2 + 0.004, 0.3, 0.2);
  button(-W / 2 - 0.004, 0.5, 0.06);
  button(-W / 2 - 0.004, 0.34, 0.11);
  button(-W / 2 - 0.004, 0.19, 0.11);

  return { group, texture };
}
