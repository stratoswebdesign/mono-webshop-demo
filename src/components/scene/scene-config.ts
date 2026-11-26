/**
 * A Blenderben renderelt jelenetek és a böngészős 3D közös adatai.
 *
 * A három jelenet (blender/mono/scenes.py) ugyanazzal a kamerával készült,
 * négyzetes képre. A böngésző ugyanezt a kamerát használja, és a négyzetből
 * vág a képernyőhöz illő részletet – így a valós idejű üveg pontosan a
 * renderelt háttérbe és annak fényébe ül bele.
 *
 * Koordináták: méter, three.js tengelyekkel (Blender x, z, -y).
 */
import type { Tone, Variant } from "@/data/products";

export type SceneId = "reggel" | "este" | "paros";

export interface SceneDef {
  tone: Tone;
  /** Háttérkép az üveg nélkül (az árnyékával és fényfoltjával). */
  plate: string;
  /** Ugyanez a kép az üveggel – helyettesítő kép és WebGL nélküli változat. */
  still: string;
  /** Körpanoráma az üveg helyéről: ez világítja meg a böngészős modellt. */
  env: string;
  envIntensity: number;
  /** Expozíció – a Blender-jelenet beállításával egyezően. */
  exposure: number;
  /** A jelenet pontszerű fő fénye (nap, lámpa); a lágy fények a panorámában vannak. */
  key: { position: [number, number, number]; color: string; intensity: number };
  /** Melyik címkével áll az üveg ebben a jelenetben. */
  variant: Variant;
}

export const SCENES: Record<SceneId, SceneDef> = {
  reggel: {
    tone: "day",
    plate: "/journey/reggel-plate.webp",
    still: "/journey/reggel-still.webp",
    env: "/journey/reggel-env.exr",
    envIntensity: 1.0,
    exposure: 1.11,
    key: { position: [-0.8, 0.34, 0.5], color: "#ffdab0", intensity: 5.2 },
    variant: "classic",
  },
  este: {
    tone: "night",
    plate: "/journey/este-plate.webp",
    still: "/journey/este-still.webp",
    env: "/journey/este-env.exr",
    envIntensity: 1.0,
    exposure: 1.46,
    key: { position: [-0.3, 0.195, 0.3], color: "#ffdab4", intensity: 0.85 },
    variant: "sleep",
  },
  paros: {
    tone: "day",
    plate: "/journey/paros-plate.webp",
    still: "/journey/paros-still.webp",
    env: "/journey/paros-env.exr",
    envIntensity: 1.0,
    exposure: 1.0,
    key: { position: [-0.75, 0.62, 0.55], color: "#fff0dc", intensity: 0.0 },
    variant: "sleep",
  },
};

/** A közös kamera (blender/mono/scenes.py CAMERA). */
export const CAMERA = {
  position: [0, 0.16, 1.07] as [number, number, number],
  target: [0, 0.057, 0] as [number, number, number],
  /** Függőleges látószög a négyzetes képen: 2·atan(18 / 85). */
  fov: 23.913,
};

/** A páros jelenetben a két üveg távolsága a középtől (méter). */
export const PAIR_OFFSET = 0.028;

/** Az üveg nevezetes pontjai (méter) – ezekre közelít a kamera. */
export const POINTS = {
  center: [0, 0.057, 0] as [number, number, number],
  shoulder: [0, 0.07, 0.012] as [number, number, number],
  emboss: [0, 0.03, 0.0166] as [number, number, number],
  cap: [0, 0.0915, 0.01] as [number, number, number],
  wordmark: [0, 0.047, 0.0166] as [number, number, number],
};

/** Egy „beállítás”: mit és honnan mutat a kamera egy adott pillanatban. */
export interface Shot {
  scene: SceneId;
  /** Áttűnés a következő jelenetbe (0..1). */
  nextScene: SceneId;
  blend: number;
  /** Nagyítás: 1 = a négyzetes kép éppen kitölti a képernyőt. */
  zoom: number;
  /** A világ e pontja kerül a képernyő `anchor` pontjára. */
  focus: [number, number, number];
  /** Képernyőarány (0..1): x balról, y felülről. */
  anchor: [number, number];
  /** Az üveg elfordulása (radián). */
  yaw: number;
  /** A kamera kitérése a fókuszpont körül (azimut, emelkedés) – közelin. */
  orbit: [number, number];
  /** Címke: 0 = klasszikus, 1 = sleep. */
  label: number;
  /** A második üveg jelenléte (0..1) a páros jelenethez. */
  pair: number;
  /** A fókusz a fő üveggel együtt mozog, amikor az a páros helyére csúszik. */
  followMain?: boolean;
}
