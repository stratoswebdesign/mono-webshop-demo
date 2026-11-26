// Kontaktlap: több tesztrendert rak egy képre, feliratozva.
//   node blender/contact.mjs kimenet.jpg oszlopok cellaSzélesség kép1 kép2 ...
import sharp from "sharp";
import path from "node:path";

const [out, colsArg, cellArg, ...files] = process.argv.slice(2);
const cols = Number(colsArg);
const cellW = Number(cellArg);
const metas = await Promise.all(files.map((f) => sharp(f).metadata()));
const cellH = Math.max(...metas.map((m) => Math.round((cellW * m.height) / m.width)));
const rows = Math.ceil(files.length / cols);
const pad = 8;
const label = 26;
const composites = [];
for (let i = 0; i < files.length; i++) {
  const x = pad + (i % cols) * (cellW + pad);
  const y = pad + Math.floor(i / cols) * (cellH + label + pad);
  const buf = await sharp(files[i]).resize(cellW, cellH, { fit: "contain", background: "#222" }).toBuffer();
  composites.push({ input: buf, left: x, top: y + label });
  const text = path.basename(files[i]).replace(/\.\w+$/, "");
  const svg = `<svg width="${cellW}" height="${label}" xmlns="http://www.w3.org/2000/svg"><text x="2" y="18" font-family="Helvetica" font-size="15" fill="#ddd">${text}</text></svg>`;
  composites.push({ input: Buffer.from(svg), left: x, top: y });
}
await sharp({
  create: { width: pad + cols * (cellW + pad), height: pad + rows * (cellH + label + pad), channels: 3, background: "#111" },
})
  .composite(composites)
  .jpeg({ quality: 88 })
  .toFile(out);
console.log("kontaktlap:", out);
