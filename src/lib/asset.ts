/**
 * A `public` mappában lévő fájl útvonala az oldal alútvonalával együtt.
 * A Next.js a képek `src` értékét nem egészíti ki a basePath-szal, ezért
 * alútvonalon futó kiadásnál (GitHub Pages) ezt itt tesszük meg.
 */
export function asset(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}

/** Útvonal záró perjel nélkül – az összehasonlításokhoz („/este/” → „/este”). */
export function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}
