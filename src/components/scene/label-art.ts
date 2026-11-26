/**
 * A címke rajza – tiszta 2D vászonműveletek, three.js nélkül.
 *
 * Ugyanez a kód rajzolja a böngészős 3D címkéjét és a Blender-renderekhez
 * használt textúrákat (blender/textures), így a kettő mindig egyezik, és a
 * feliratok a központi termékadatokból jönnek.
 */
import type { Variant } from "@/data/products";
import { getSingle } from "@/lib/commerce/catalog";
import { MOTIF_HEIGHT, MOTIF_PATH, MOTIF_WIDTH } from "@/lib/motif";
import { LABEL_COLORS } from "./label-colors";

const DESCRIPTOR = "Folyékony étrend-kiegészítő";

/** Megvárja, hogy a címkén használt betűváltozatok betöltődjenek. */
export async function loadLabelFonts(family: string): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all([
    document.fonts.load(`500 64px ${family}`, "mono"),
    document.fonts.load(`400 64px ${family}`, "menthol drops sleep"),
    document.fonts.load(`400 64px ${family}`, `${DESCRIPTOR} 30 ml`),
  ]);
}

/** A vonalmotívum a címke koordinátáiban: körbefut, a torony elöl, jobbra áll. */
function motifPath(width: number, height: number): Path2D {
  const s = width / 2048;
  const x0 = 380 * s;
  const w = 1288 * s;
  const y0 = 574 * s;
  const h = 280 * s;
  const path = new Path2D();
  path.addPath(
    new Path2D(MOTIF_PATH),
    new DOMMatrix().translate(x0, y0).scale(w / MOTIF_WIDTH, h / MOTIF_HEIGHT),
  );
  // A vonal a címke két széléig folytatódik.
  path.moveTo(0, y0 + h * 0.94);
  path.bezierCurveTo(130 * s, y0 + h * 0.9, 250 * s, y0 + h * 0.97, x0, y0 + h * (335 / MOTIF_HEIGHT));
  path.moveTo(x0 + w, y0 + h * (297 / MOTIF_HEIGHT));
  path.bezierCurveTo(1790 * s, y0 + h * 0.86, 1920 * s, y0 + h * 0.8, width, y0 + h * 0.84);
  void height;
  return path;
}

function addGrain(ctx: CanvasRenderingContext2D, width: number, height: number, strength: number) {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * strength;
    data[i] += n;
    data[i + 1] += n;
    data[i + 2] += n;
  }
  ctx.putImageData(image, 0, 0);
}

export interface LabelArtOptions {
  /** Papírszemcse a színtérképen (a Blender ezt anyagból adja, ott nem kell). */
  grain?: boolean;
  /** A dombornyomás fény–árnyék előrajzolása (0 = nincs, 1 = erős). */
  bakedEmboss?: number;
}

/** A címke színtérképe 2:1 arányú vászonra. */
export function drawLabelColor(
  canvas: HTMLCanvasElement,
  variant: Variant,
  family: string,
  { grain = true, bakedEmboss = 0.5 }: LabelArtOptions = {},
) {
  const { width, height } = canvas;
  const s = width / 2048;
  const product = getSingle(variant);
  const colors = LABEL_COLORS[variant];
  const ctx = canvas.getContext("2d", { willReadFrequently: grain })!;

  ctx.fillStyle = colors.paper;
  ctx.fillRect(0, 0, width, height);
  if (grain) addGrain(ctx, width, height, variant === "classic" ? 8 : 6);

  // A szövegblokk bal széle: elölnézetben a palást bal harmadánál.
  const left = 740 * s;
  ctx.fillStyle = colors.ink;
  ctx.textBaseline = "alphabetic";

  // Szóvédjegy
  const wordSize = 212 * s;
  const wordBaseline = 234 * s;
  ctx.font = `500 ${wordSize}px ${family}`;
  ctx.fillText("mono", left, wordBaseline);
  // A záró „o” bevágása
  const prefix = ctx.measureText("mon").width;
  const o = ctx.measureText("o");
  const radius = o.actualBoundingBoxAscent / 2;
  const cx = left + prefix + o.width / 2;
  const cy = wordBaseline - radius;
  const angle = -Math.PI / 4;
  ctx.strokeStyle = colors.paper;
  ctx.lineWidth = wordSize * 0.04;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.moveTo(cx + Math.cos(angle) * radius * 0.5, cy + Math.sin(angle) * radius * 0.5);
  ctx.lineTo(cx + Math.cos(angle) * radius * 1.2, cy + Math.sin(angle) * radius * 1.2);
  ctx.stroke();

  // Terméksor, megnevezés, kiszerelés
  ctx.font = `400 ${98 * s}px ${family}`;
  ctx.fillText(product.labelLine, left + 4 * s, 372 * s);
  ctx.font = `400 ${43 * s}px ${family}`;
  ctx.fillText(DESCRIPTOR, left + 5 * s, 474 * s);
  ctx.font = `400 ${50 * s}px ${family}`;
  ctx.fillText(product.volume, left + 5 * s, 958 * s);

  if (bakedEmboss > 0) {
    const motif = motifPath(width, height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 9 * s;
    ctx.globalAlpha = bakedEmboss;
    ctx.save();
    ctx.translate(3 * s, 4.5 * s);
    ctx.strokeStyle = colors.lo;
    ctx.stroke(motif);
    ctx.restore();
    ctx.save();
    ctx.translate(-2.5 * s, -3 * s);
    ctx.strokeStyle = colors.hi;
    ctx.stroke(motif);
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = colors.face;
    ctx.stroke(motif);
  }
}

/**
 * A dombornyomás magasságtérképe: középszürke papír, belőle lekerekített
 * gerincként emelkedik ki a vonal (világosabb = magasabb).
 */
export function drawLabelHeight(canvas: HTMLCanvasElement) {
  const { width, height } = canvas;
  const s = width / 2048;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgb(96,96,96)";
  ctx.fillRect(0, 0, width, height);
  const motif = motifPath(width, height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // Egymásra rajzolt, szűkülő vonalak adják a gerinc lekerekített keresztmetszetét.
  const steps = 14;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const level = Math.round(96 + (255 - 96) * Math.sin((t * Math.PI) / 2));
    ctx.lineWidth = (22 - 19 * t) * s;
    ctx.strokeStyle = `rgb(${level},${level},${level})`;
    ctx.stroke(motif);
  }
}

/** Magasságtérképből normáltérkép (Sobel), valós idejű megjelenítéshez. */
export function heightToNormal(source: HTMLCanvasElement, strength = 2.2): HTMLCanvasElement {
  const { width, height } = source;
  const src = source.getContext("2d", { willReadFrequently: true })!.getImageData(0, 0, width, height).data;
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d")!;
  const image = ctx.createImageData(width, height);
  const dst = image.data;
  const h = (x: number, y: number) =>
    src[(Math.min(height - 1, Math.max(0, y)) * width + Math.min(width - 1, Math.max(0, x))) * 4] / 255;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength;
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength;
      const inv = 1 / Math.hypot(dx, dy, 1);
      const i = (y * width + x) * 4;
      dst[i] = (-dx * inv * 0.5 + 0.5) * 255;
      dst[i + 1] = (dy * inv * 0.5 + 0.5) * 255;
      dst[i + 2] = (inv * 0.5 + 0.5) * 255;
      dst[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return out;
}
