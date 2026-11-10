/**
 * A mono csomagolás dombornyomott vonalmotívuma.
 *
 * A referenciafotók alapján kézzel felvett pontsor: alacsony, hullámzó
 * indulás, két kisebb „bütyök”, jobbra a közép után egy magas, göcsörtös
 * torony, majd egy kisebb púp és lecsengés. Ugyanez az útvonal rajzolódik a
 * 3D címkére és az oldal vaknyomásos díszeire is.
 *
 * A végleges, nyomdai vonalrajz megérkezésekor elég a pontsort (vagy a kész
 * SVG útvonalat) itt lecserélni.
 */
export const MOTIF_WIDTH = 1000;
export const MOTIF_HEIGHT = 360;

const POINTS: [number, number][] = [
  [0, 335], [34, 327], [70, 338], [104, 322], [140, 331], [168, 312],
  // első kis bütyök
  [189, 298], [199, 262], [211, 229], [232, 214], [251, 233], [246, 263], [262, 283], [286, 291],
  // alacsony hullámzás
  [320, 278], [351, 293], [386, 270], [421, 283], [455, 262],
  // közepes bütyök
  [477, 240], [484, 197], [500, 161], [523, 150], [539, 173], [530, 207], [548, 233],
  // a torony
  [574, 223], [591, 181], [584, 141], [603, 105], [598, 65], [617, 29], [641, 15],
  [663, 35], [660, 73], [677, 105], [668, 143], [689, 177], [684, 215], [705, 245],
  // horpadás, jobb oldali púp
  [731, 263], [752, 248], [770, 214], [787, 182], [809, 176], [823, 201], [816, 233], [837, 263],
  // lecsengés
  [871, 281], [906, 272], [941, 291], [975, 284], [1000, 297],
];

/** Catmull–Rom görbe SVG útvonalként – lágy, kézzel húzott hatású vonal. */
function toSmoothPath(points: [number, number][]): string {
  const r = (n: number) => Math.round(n * 10) / 10;
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    d += `C${r(p1[0] + (p2[0] - p0[0]) / 6)} ${r(p1[1] + (p2[1] - p0[1]) / 6)} ${r(
      p2[0] - (p3[0] - p1[0]) / 6,
    )} ${r(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export const MOTIF_PATH = toSmoothPath(POINTS);

/**
 * Széles változat teljes szélességű díszekhez: a motívum két oldalán a vonal
 * alacsonyan, szabálytalanul hullámozva fut tovább – ahogy a csomagoláson az
 * üvegről a dobozra. Így a vonal nyújtás nélkül, arányosan tölti ki a sort.
 */
const TAIL = 600;
export const MOTIF_WIDE_WIDTH = MOTIF_WIDTH + TAIL * 2;

const LEFT_TAIL: [number, number][] = [
  [-600, 322], [-548, 330], [-515, 319], [-455, 327], [-420, 336], [-372, 318], [-345, 329],
  [-282, 334], [-250, 322], [-205, 338], [-150, 331], [-118, 341], [-62, 326], [-30, 337],
];
const RIGHT_TAIL: [number, number][] = [
  [1038, 288], [1090, 304], [1124, 292], [1185, 300], [1222, 312], [1268, 296], [1298, 309],
  [1362, 315], [1394, 302], [1442, 320], [1496, 312], [1530, 323], [1574, 311], [1600, 318],
];

export const MOTIF_WIDE_PATH = toSmoothPath(
  [...LEFT_TAIL, ...POINTS, ...RIGHT_TAIL].map(([x, y]) => [x + TAIL, y] as [number, number]),
);
