import type { Variant } from "@/data/products";
import { getSingle } from "@/lib/commerce/catalog";
import { MOTIF_PATH } from "@/lib/motif";
import { LABEL_COLORS } from "./label-colors";

/**
 * Azonnal megjelenő, rajzolt helyettesítő termékkép. Arányai megegyeznek a
 * 3D modellével (bottle-geometry.ts), így a 3D betöltésekor fedésben vált.
 * WebGL nélkül ez marad a termék képe.
 */
export function BottleIllustration({
  variant,
  className,
  title,
}: {
  variant: Variant;
  className?: string;
  title?: string;
}) {
  const product = getSingle(variant);
  const colors = LABEL_COLORS[variant];
  const id = `bottle-${variant}`;
  const font = { fontFamily: "var(--font-outfit), sans-serif" } as const;

  return (
    <svg
      viewBox="0 0 240 690"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#3c1c07" />
          <stop offset="0.14" stopColor="#7a3f10" />
          <stop offset="0.3" stopColor="#a8631f" />
          <stop offset="0.55" stopColor="#7c3f10" />
          <stop offset="0.86" stopColor="#4a2409" />
          <stop offset="1" stopColor="#2e1505" />
        </linearGradient>
        <linearGradient id={`${id}-cap`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#060606" />
          <stop offset="0.28" stopColor="#2c2c2c" />
          <stop offset="0.5" stopColor="#141414" />
          <stop offset="1" stopColor="#050505" />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.22" />
          <stop offset="0.25" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
        <pattern id={`${id}-ribs`} width="5" height="10" patternUnits="userSpaceOnUse">
          <rect width="2" height="10" fill="#000" opacity="0.55" />
        </pattern>
      </defs>

      {/* Gumipipetta */}
      <path
        d="M84 147 C83 110 82 70 86 44 C90 14 106 1 120 1 C134 1 150 14 154 44 C158 70 157 110 156 147 Z"
        fill={`url(#${id}-cap)`}
      />
      <rect x="70" y="145" width="100" height="20" rx="3" fill={`url(#${id}-cap)`} />
      {/* Bordázott gallér és zárógyűrű */}
      <rect x="59" y="164" width="122" height="75" rx="2" fill={`url(#${id}-cap)`} />
      <rect x="59" y="164" width="122" height="75" rx="2" fill={`url(#${id}-ribs)`} />
      <rect x="54" y="238" width="132" height="20" rx="2" fill={`url(#${id}-cap)`} />

      {/* Üvegtest */}
      <path
        d="M70 250 L170 250 L170 262 C172 292 220 284 220 322 L220 676 Q220 690 206 690 L34 690 Q20 690 20 676 L20 322 C20 284 68 292 70 262 Z"
        fill={`url(#${id}-glass)`}
      />
      <rect x="112" y="600" width="16" height="62" rx="8" fill="#c98a42" opacity="0.35" />

      {/* Címke */}
      <rect x="20" y="325" width="200" height="278" fill={colors.paper} />
      <g fill={colors.ink} style={font}>
        <text x="40" y="390" fontSize="58" fontWeight="500" letterSpacing="-1.5">
          mono
        </text>
        <text x="41" y="427" fontSize="26.5" fontWeight="300">
          {product.labelLine}
        </text>
        <text x="41.5" y="457" fontSize="11.2">
          Folyékony étrend-kiegészítő
        </text>
        <text x="41.5" y="585" fontSize="13">
          {product.volume}
        </text>
      </g>
      <svg x="20" y="481" width="200" height="76" viewBox="166 0 668 360" preserveAspectRatio="none">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" vectorEffect="non-scaling-stroke">
          <path d={MOTIF_PATH} stroke={colors.lo} transform="translate(3 6)" vectorEffect="non-scaling-stroke" />
          <path d={MOTIF_PATH} stroke={colors.hi} transform="translate(-3 -5)" vectorEffect="non-scaling-stroke" />
          <path d={MOTIF_PATH} stroke={colors.face} vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
      <rect x="20" y="325" width="200" height="278" fill={`url(#${id}-shade)`} />
    </svg>
  );
}
