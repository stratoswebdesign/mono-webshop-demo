/**
 * Procedurális cseppentős üveg – a referenciafotók arányai alapján.
 *
 * Mértékegység: az üvegtest sugara = 1. Minden méret itt van egy helyen,
 * hogy a helyettesítő rajz (BottleIllustration) és a jelenet fedésben legyen.
 *
 * Ez egyszerű, kódból épített modell, nem végleges fotórealisztikus asset.
 * Kész GLB modell érkezésekor a BottleModel komponens cserélendő.
 */
import * as THREE from "three";

export const BOTTLE = {
  /** Teljes magasság a talptól a gumipipetta tetejéig. */
  height: 6.9,
  shoulderStart: 3.72,
  neckRadius: 0.5,
  neckTop: 4.5,
  ring: { y: 4.32, height: 0.2, radius: 0.66 },
  collar: { y: 4.52, height: 0.74, radius: 0.61 },
  bulbY: 5.26,
  label: {
    bottom: 0.87,
    height: 2.78,
    radius: 1.004,
    /** Ívhossz radiánban – a 2:1 arányú címketextúrához igazítva. */
    arc: 5.538,
  },
} as const;

const v = (x: number, y: number) => new THREE.Vector2(x, y);

/** Az üvegtest külső palástja (forgástest). */
export function createGlassGeometry(segments: number): THREE.LatheGeometry {
  const points: THREE.Vector2[] = [v(0, 0.07), v(0.55, 0.03), v(0.84, 0)];
  for (let i = 0; i <= 6; i++) {
    const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2);
    points.push(v(0.86 + Math.cos(a) * 0.14, 0.14 + Math.sin(a) * 0.14));
  }
  points.push(v(1, BOTTLE.shoulderStart));
  const shoulder = new THREE.CubicBezierCurve(
    v(1, BOTTLE.shoulderStart),
    v(1, 4.06),
    v(0.6, 4.1),
    v(BOTTLE.neckRadius, 4.3),
  );
  points.push(...shoulder.getPoints(14).slice(1));
  points.push(v(BOTTLE.neckRadius, BOTTLE.neckTop));
  return new THREE.LatheGeometry(points, segments);
}

/** Bordázott fekete kupakgallér. */
export function createCollarGeometry(ribs: number): THREE.CylinderGeometry {
  const { radius, height } = BOTTLE.collar;
  const geometry = new THREE.CylinderGeometry(radius, radius, height, ribs * 2, 1, false);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const r = Math.hypot(x, z);
    if (r < radius * 0.5) continue;
    const step = Math.round((Math.atan2(z, x) / Math.PI) * ribs);
    const scale = step % 2 === 0 ? 1 : 0.95;
    position.setX(i, x * scale);
    position.setZ(i, z * scale);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Gumipipetta: szélesebb talpgyűrű, enyhén szűkülő test, lekerekített tető. */
export function createBulbGeometry(segments: number): THREE.LatheGeometry {
  const points = [
    v(0.5, 0), v(0.5, 0.13), v(0.47, 0.17), v(0.4, 0.19), v(0.37, 0.25),
    v(0.355, 0.5), v(0.36, 0.86), v(0.345, 1.1), v(0.31, 1.27),
    v(0.235, 1.4), v(0.12, 1.475), v(0, 1.49),
  ];
  const curve = new THREE.SplineCurve(points.slice(4));
  return new THREE.LatheGeometry([...points.slice(0, 4), ...curve.getPoints(28)], segments);
}

/** A címke: nyitott hengerpalást, középpontja a kamera felé néz. */
export function createLabelGeometry(radius: number, segments: number): THREE.CylinderGeometry {
  const { height, arc } = BOTTLE.label;
  return new THREE.CylinderGeometry(radius, radius, height, segments, 1, true, -arc / 2, arc);
}
