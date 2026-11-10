"use client";

import type { Variant } from "@/data/products";
import { listSingles } from "@/lib/commerce/catalog";
import { cn } from "@/lib/cn";

/** Klasszikus / Sleep választó – helyben vált (a főoldali 3D jelenethez). */
export function VariantToggle({
  value,
  onChange,
  className,
}: {
  value: Variant;
  onChange: (variant: Variant) => void;
  className?: string;
}) {
  return (
    <div role="group" aria-label="Termék kiválasztása" className={cn("inline-flex gap-7", className)}>
      {listSingles().map((product) => {
        const selected = product.id === value;
        return (
          <button
            key={product.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(product.id)}
            className={cn(
              "group relative py-2.5 text-left transition-colors",
              selected ? "text-fg" : "text-muted hover:text-fg",
            )}
          >
            <span className="block text-[1.0625rem] font-medium">{product.shortName}</span>
            <span className="block text-[0.8125rem]">{product.routine.label}</span>
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-x-0 bottom-0 h-px origin-left bg-fg transition-transform duration-500",
                selected ? "scale-x-100" : "scale-x-0",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
