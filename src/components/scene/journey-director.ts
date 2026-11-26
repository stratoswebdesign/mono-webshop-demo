/**
 * A főoldali utazás „rendezője”: a görgetés állásából (0..1) megmondja, mit
 * mutat a kamera. Kulcskockák között lágyan interpolál.
 */
import { POINTS, type SceneId, type Shot } from "./scene-config";

export interface StageLayout {
  /** Az alapnagyítás és az üveg helye a színpadon (a CSS-ből). */
  zoom: number;
  ax: number;
  ay: number;
  portrait: boolean;
}

type Vec3 = [number, number, number];

interface Key {
  at: number;
  /** Abszolút nagyítás, vagy az alapnagyítás szorzója (`wide`). */
  zoom: number;
  /** Álló kijelzőn eltérő nagyítás (pl. hogy a két üveg kiférjen). */
  zoomPortrait?: number;
  wide?: boolean;
  focus: Vec3;
  /** Az üveg helye a képernyőn; `null` = az alapelrendezés szerint. */
  anchor: [number, number] | null;
  anchorPortrait?: [number, number];
  yaw: number;
  orbit: [number, number];
  label: number;
  pair: number;
  followMain?: boolean;
}

const TAU = Math.PI * 2;

const KEYS: Key[] = [
  { at: 0.0, zoom: 1, wide: true, focus: POINTS.center, anchor: null, yaw: 0.1, orbit: [0, 0], label: 0, pair: 0 },
  { at: 0.08, zoom: 1.04, wide: true, focus: POINTS.center, anchor: null, yaw: 0.2, orbit: [0, 0], label: 0, pair: 0 },
  // Üveg: közelítés a vállra és a talpra
  { at: 0.2, zoom: 3.3, focus: POINTS.shoulder, anchor: [0.62, 0.5], anchorPortrait: [0.5, 0.4], yaw: -0.5, orbit: [-0.16, 0.05], label: 0, pair: 0 },
  { at: 0.3, zoom: 3.6, focus: POINTS.shoulder, anchor: [0.62, 0.52], anchorPortrait: [0.5, 0.42], yaw: -0.8, orbit: [-0.1, 0.05], label: 0, pair: 0 },
  // A vonal: a címke dombornyomása, súrló fényben
  { at: 0.4, zoom: 6.4, focus: POINTS.emboss, anchor: [0.6, 0.5], anchorPortrait: [0.5, 0.4], yaw: -0.5, orbit: [0.2, 0.02], label: 0, pair: 0 },
  { at: 0.49, zoom: 6.8, focus: POINTS.emboss, anchor: [0.6, 0.5], anchorPortrait: [0.5, 0.4], yaw: -0.4, orbit: [0.12, 0.02], label: 0, pair: 0 },
  // Pipetta: a kupak és a gumi
  { at: 0.58, zoom: 4.7, focus: POINTS.cap, anchor: [0.6, 0.54], anchorPortrait: [0.5, 0.42], yaw: 0.3, orbit: [-0.12, 0.2], label: 0, pair: 0 },
  { at: 0.66, zoom: 5.0, focus: POINTS.cap, anchor: [0.6, 0.54], anchorPortrait: [0.5, 0.42], yaw: 0.7, orbit: [-0.04, 0.16], label: 0.1, pair: 0 },
  // Este: visszahúzódunk, közben az üveg körbefordul és címkét vált
  { at: 0.78, zoom: 1, wide: true, focus: POINTS.center, anchor: null, yaw: TAU + 0.1, orbit: [0, 0], label: 1, pair: 0 },
  { at: 0.87, zoom: 1.05, wide: true, focus: POINTS.center, anchor: null, yaw: TAU + 0.2, orbit: [0, 0], label: 1, pair: 0 },
  // Páros: ráközelítünk a szóvédjegyre, a közelin megérkezik a másik üveg,
  // majd visszahúzódva már ketten állnak.
  { at: 0.905, zoom: 5.2, focus: POINTS.wordmark, anchor: [0.5, 0.5], yaw: TAU + 0.05, orbit: [0, 0], label: 1, pair: 0, followMain: true },
  { at: 0.935, zoom: 5.2, focus: POINTS.wordmark, anchor: [0.5, 0.5], yaw: TAU, orbit: [0, 0], label: 1, pair: 1, followMain: true },
  { at: 0.985, zoom: 1.45, zoomPortrait: 1.12, wide: true, focus: POINTS.center, anchor: null, yaw: TAU, orbit: [0, 0], label: 1, pair: 1 },
  { at: 1.0, zoom: 1.5, zoomPortrait: 1.15, wide: true, focus: POINTS.center, anchor: null, yaw: TAU, orbit: [0, 0], label: 1, pair: 1 },
];

/** Jelenetváltások: [kezdet, vég, honnan, hová]. */
const BLENDS: [number, number, SceneId, SceneId][] = [
  [0.585, 0.665, "reggel", "este"],
  [0.9, 0.935, "este", "paros"],
];

const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export function journeyShot(progress: number, layout: StageLayout, elapsed: number): Shot {
  const p = Math.min(1, Math.max(0, progress));
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].at) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = smooth(Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at))));

  const zoomOf = (k: Key) => {
    const zoom = layout.portrait ? (k.zoomPortrait ?? k.zoom) : k.zoom;
    return k.wide ? zoom * layout.zoom : zoom;
  };
  const anchorOf = (k: Key): [number, number] =>
    k.anchor === null ? [layout.ax, layout.ay] : layout.portrait ? (k.anchorPortrait ?? k.anchor) : k.anchor;
  const anchorA = anchorOf(a);
  const anchorB = anchorOf(b);

  let scene: SceneId = "reggel";
  let nextScene: SceneId = "reggel";
  let blend = 0;
  for (const [from, to, source, target] of BLENDS) {
    if (p >= to) {
      scene = nextScene = target;
    } else if (p > from) {
      scene = source;
      nextScene = target;
      blend = smooth((p - from) / (to - from));
    }
  }

  return {
    scene,
    nextScene,
    blend,
    // A nagyítást logaritmikusan keverjük, hogy a közelítés egyenletesnek hasson.
    zoom: Math.exp(mix(Math.log(zoomOf(a)), Math.log(zoomOf(b)), t)),
    focus: [mix(a.focus[0], b.focus[0], t), mix(a.focus[1], b.focus[1], t), mix(a.focus[2], b.focus[2], t)],
    anchor: [mix(anchorA[0], anchorB[0], t), mix(anchorA[1], anchorB[1], t)],
    yaw: mix(a.yaw, b.yaw, t) + Math.sin(elapsed * 0.32) * 0.05,
    orbit: [mix(a.orbit[0], b.orbit[0], t), mix(a.orbit[1], b.orbit[1], t)],
    label: mix(a.label, b.label, t),
    // A második üveg a közeli közepén „érkezik meg” – nem fokozatosan.
    pair: a.pair === b.pair ? a.pair : t < 0.5 ? a.pair : b.pair,
    followMain: a.followMain || b.followMain,
  };
}
