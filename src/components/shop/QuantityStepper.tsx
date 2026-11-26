"use client";

import { shopConfig } from "@/data/shop-config";
import { cn } from "@/lib/cn";

export function QuantityStepper({
  value,
  onChange,
  label,
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  /** Mire vonatkozik a mennyiség – képernyőolvasóknak. */
  label: string;
  size?: "sm" | "md";
}) {
  const max = shopConfig.maxQuantityPerLine;
  const cell = size === "sm" ? "h-9 w-8" : "min-h-[2.875rem] w-10";
  return (
    <div
      role="group"
      aria-label={`${label} mennyisége`}
      className="inline-flex items-stretch border border-[color-mix(in_srgb,var(--fg)_45%,transparent)]"
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Mennyiség csökkentése"
        className={cn(cell, "grid place-items-center transition-opacity disabled:opacity-25")}
      >
        −
      </button>
      <span
        aria-live="polite"
        className={cn(size === "sm" ? "w-6" : "w-7", "grid place-items-center text-[0.8125rem] tabular-nums")}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Mennyiség növelése"
        className={cn(cell, "grid place-items-center transition-opacity disabled:opacity-25")}
      >
        +
      </button>
    </div>
  );
}
