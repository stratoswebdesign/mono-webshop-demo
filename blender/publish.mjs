// A kész rendereket a weboldal public mappájába teszi (WebP-re alakítva).
//   node blender/publish.mjs
import sharp from "sharp";
import { copyFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, "out", "scenes");
const journey = path.join(here, "..", "public", "journey");
const images = path.join(here, "..", "public", "images");
await mkdir(journey, { recursive: true });

const exists = (file) => access(file).then(() => true, () => false);

for (const scene of ["reggel", "este", "paros"]) {
  for (const kind of ["plate", "still"]) {
    const input = path.join(src, `${scene}-${kind}.png`);
    if (!(await exists(input))) continue;
    await sharp(input).webp({ quality: kind === "still" ? 88 : 84 }).toFile(path.join(journey, `${scene}-${kind}.webp`));
    console.log("ok", `${scene}-${kind}.webp`);
  }
  const env = path.join(src, `${scene}-env.exr`);
  if (await exists(env)) {
    await copyFile(env, path.join(journey, `${scene}-env.exr`));
    console.log("ok", `${scene}-env.exr`);
  }
  for (const shot of ["close", "macro-label", "macro-cap", "macro-base"]) {
    const input = path.join(src, `${scene}-${shot}.png`);
    if (!(await exists(input))) continue;
    await sharp(input).webp({ quality: 88 }).toFile(path.join(images, `${scene}-${shot}.webp`));
    console.log("ok", `${scene}-${shot}.webp`);
  }
}
