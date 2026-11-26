/** A böngészős modell címketextúrái – a label-art rajzából, futásidőben. */
import * as THREE from "three";
import type { Variant } from "@/data/products";
import { drawLabelColor, drawLabelHeight, heightToNormal, loadLabelFonts } from "@/components/scene/label-art";

export interface LabelTextures {
  classic: THREE.CanvasTexture;
  sleep: THREE.CanvasTexture;
  /** A dombornyomott vonal normáltérképe – a két címkén azonos. */
  normal: THREE.CanvasTexture;
  dispose: () => void;
}

export async function createLabelTextures(family: string, width: 2048 | 4096): Promise<LabelTextures> {
  await loadLabelFonts(family).catch(() => undefined);

  const color = (variant: Variant) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = width / 2;
    drawLabelColor(canvas, variant, family, { grain: true, bakedEmboss: 0.22 });
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    texture.flipY = false; // a GLB UV-ja felülről számol
    return texture;
  };

  const heightCanvas = document.createElement("canvas");
  heightCanvas.width = 2048;
  heightCanvas.height = 1024;
  drawLabelHeight(heightCanvas);
  const normal = new THREE.CanvasTexture(heightToNormal(heightCanvas, 3.2));
  normal.anisotropy = 8;
  normal.flipY = false;

  const classic = color("classic");
  const sleep = color("sleep");
  return {
    classic,
    sleep,
    normal,
    dispose: () => {
      classic.dispose();
      sleep.dispose();
      normal.dispose();
    },
  };
}
