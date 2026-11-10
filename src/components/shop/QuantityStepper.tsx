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
  const cell = size === "sm" ? "h-9 w-9" : "h-[3.25rem] w-12";
  return (
    <div
      role="group"
      aria-label={`${label} mennyisége`}
      className="inline-flex items-stretch rounded-[2px] border border-line"
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Mennyiség csökkentése"
        className={cn(cell, "grid place-items-center text-lg transition-opacity disabled:opacity-30")}
      >
        −
      </button>
      <span
        aria-live="polite"
        className={cn(
          size === "sm" ? "w-8" : "w-10",
          "grid place-items-center text-[0.9375rem] font-medium tabular-nums",
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Mennyiség növelése"
        className={cn(cell, "grid place-items-center text-lg transition-opacity disabled:opacity-30")}
      >
        +
      </button>
    </div>
  );
}
