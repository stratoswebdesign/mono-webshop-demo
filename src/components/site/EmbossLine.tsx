import { cn } from "@/lib/cn";
import {
  MOTIF_HEIGHT,
  MOTIF_PATH,
  MOTIF_WIDE_PATH,
  MOTIF_WIDE_WIDTH,
  MOTIF_WIDTH,
} from "@/lib/motif";

/**
 * A csomagolás dombornyomott vonala vaknyomásként: a vonal a háttér
 * színével egyezik, csak a fény–árnyék rajzolja ki.
 *
 * `wide`: teljes szélességű dísz. Széles kijelzőn a hosszú, kétoldalt
 * továbbfutó vonal látszik, keskenyen a motívum maga – mindkettő arányosan.
 */
export function EmbossLine({ className, wide = false }: { className?: string; wide?: boolean }) {
  const base = (
    <svg
      viewBox={`0 0 ${MOTIF_WIDTH} ${MOTIF_HEIGHT}`}
      className={cn("emboss", wide ? "block w-full md:hidden" : className)}
      aria-hidden="true"
      focusable="false"
    >
      <path d={MOTIF_PATH} />
    </svg>
  );
  if (!wide) return base;
  return (
    <div className={className}>
      {base}
      <svg
        viewBox={`0 0 ${MOTIF_WIDE_WIDTH} ${MOTIF_HEIGHT}`}
        className="emboss hidden w-full md:block"
        aria-hidden="true"
        focusable="false"
      >
        <path d={MOTIF_WIDE_PATH} />
      </svg>
    </div>
  );
}
