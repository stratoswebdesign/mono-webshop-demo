/**
 * A címke textúrája – futásidőben rajzolva, a központi termékadatok
 * szövegével. Így a feliratok mindig pontosak, és a címke külön cserélhető:
 * kész nyomdai grafika érkezésekor elég itt egy képet betölteni helyette.
 */
import * as THREE from "three";
import type { Variant } from "@/data/products";
import { getSingle } from "@/lib/commerce/catalog";
import { MOTIF_HEIGHT, MOTIF_PATH, MOTIF_WIDTH } from "@/lib/motif";
import { LABEL_COLORS } from "./label-colors";

const W = 2048;
const H = 1024;

const DESCRIPTOR = "Folyékony étrend-kiegészítő";

export interface LabelTextures {
  map: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
}

/** Megvárja, hogy a címkén használt betűváltozatok betöltődjenek. */
export async function loadLabelFonts(family: string): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all([
    document.fonts.load(`500 64px ${family}`, "mono"),
    document.fonts.load(`300 64px ${family}`, "menthol drops sleep"),
    document.fonts.load(`400 64px ${family}`, `${DESCRIPTOR} 30 ml`),
  ]);
}

function addGrain(ctx: CanvasRenderingContext2D, strength: number) {
  const image = ctx.getImageData(0, 0, W, H);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * strength;
    data[i] += n;
    data[i + 1] += n;
    data[i + 2] += n;
  }
  ctx.putImageData(image, 0, 0);
}

/** A vonalmotívum a címke koordinátáiban: körbefut, a torony elöl, jobbra áll. */
function motifPath(): Path2D {
  const x0 = 380;
  const width = 1288;
  const y0 = 574;
  const height = 280;
  const path = new Path2D();
  path.addPath(
    new Path2D(MOTIF_PATH),
    new DOMMatrix().translate(x0, y0).scale(width / MOTIF_WIDTH, height / MOTIF_HEIGHT),
  );
  // A vonal a címke két széléig folytatódik.
  path.moveTo(0, y0 + height * 0.94);
  path.bezierCurveTo(130, y0 + height * 0.9, 250, y0 + height * 0.97, x0, y0 + height * (335 / MOTIF_HEIGHT));
  path.moveTo(x0 + width, y0 + height * (297 / MOTIF_HEIGHT));
  path.bezierCurveTo(1790, y0 + height * 0.86, 1920, y0 + height * 0.8, W, y0 + height * 0.84);
  return path;
}

export function createLabelTextures(variant: Variant, family: string): LabelTextures {
  const product = getSingle(variant);
  const colors = LABEL_COLORS[variant];
  const motif = motifPath();

  // ── Színtérkép
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = colors.paper;
  ctx.fillRect(0, 0, W, H);
  addGrain(ctx, variant === "classic" ? 9 : 7);

  // A szövegblokk bal széle: elölnézetben a palást bal harmadánál.
  const left = 740;
  ctx.fillStyle = colors.ink;
  ctx.textBaseline = "alphabetic";

  // Szóvédjegy
  const wordSize = 212;
  const wordBaseline = 234;
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
  ctx.font = `300 100px ${family}`;
  ctx.fillText(product.labelLine, left + 4, 372);
  ctx.font = `400 43px ${family}`;
  ctx.fillText(DESCRIPTOR, left + 5, 474);
  ctx.font = `400 50px ${family}`;
  ctx.fillText(product.volume, left + 5, 958);

  // Dombornyomott vonal – a színtérképen fény–árnyék párral előrajzolva
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 9;
  ctx.save();
  ctx.translate(3, 4.5);
  ctx.strokeStyle = colors.lo;
  ctx.stroke(motif);
  ctx.restore();
  ctx.save();
  ctx.translate(-2.5, -3);
  ctx.strokeStyle = colors.hi;
  ctx.stroke(motif);
  ctx.restore();
  ctx.strokeStyle = colors.face;
  ctx.stroke(motif);

  // ── Domborzattérkép: papírrost + kiemelkedő vonal
  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = W;
  bumpCanvas.height = H;
  const bctx = bumpCanvas.getContext("2d", { willReadFrequently: true })!;
  bctx.fillStyle = "rgb(110,110,110)";
  bctx.fillRect(0, 0, W, H);
  addGrain(bctx, 34);
  bctx.lineCap = "round";
  bctx.lineJoin = "round";
  const ridge: [number, number][] = [
    [22, 135],
    [16, 165],
    [10, 200],
    [5, 235],
  ];
  for (const [width, level] of ridge) {
    bctx.lineWidth = width;
    bctx.strokeStyle = `rgb(${level},${level},${level})`;
    bctx.stroke(motif);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.anisotropy = 4;
  return { map, bump };
}

/** Lágy, kör alakú folt (árnyékhoz, fényfolthoz). */
export function createBlobTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.62)");
  gradient.addColorStop(0.7, "rgba(255,255,255,0.16)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/** Ablakon beeső reggeli fény: lágy szélű, osztott fényfolt a falon. */
export function createWindowLightTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  // A téglalapokat a vásznon kívülre rajzoljuk, csak az elmosott árnyékuk
  // esik a képre – így a ctx.filter nélkül is lágy szélű foltot kapunk.
  const far = 2000;
  ctx.shadowColor = "rgba(255,255,255,0.9)";
  ctx.shadowBlur = 26;
  ctx.shadowOffsetX = far;
  ctx.fillStyle = "#fff";
  const cols = 2;
  const rows = 3;
  const gap = 22;
  const paneW = 150;
  const paneH = 112;
  const startX = (size - (cols * paneW + (cols - 1) * gap)) / 2;
  const startY = (size - (rows * paneH + (rows - 1) * gap)) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillRect(startX + c * (paneW + gap) - far, startY + r * (paneH + gap), paneW, paneH);
    }
  }
  return new THREE.CanvasTexture(canvas);
}
