import type { Variant } from "@/data/products";

/**
 * A címkék színei – a 3D textúra és a rajzolt helyettesítő kép közös forrása.
 * (Külön fájl, hogy a rajzhoz ne kelljen betölteni a three.js-t.)
 */
export const LABEL_COLORS: Record<
  Variant,
  { paper: string; ink: string; face: string; hi: string; lo: string }
> = {
  classic: {
    paper: "#ebe3d3",
    ink: "#26221e",
    face: "#f0e9db",
    hi: "rgba(255,255,255,0.95)",
    lo: "rgba(92,72,40,0.45)",
  },
  sleep: {
    paper: "#1f3b30",
    ink: "#efe6d3",
    face: "#234236",
    hi: "rgba(160,200,180,0.32)",
    lo: "rgba(0,0,0,0.55)",
  },
};
