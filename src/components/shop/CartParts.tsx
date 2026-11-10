"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import { shopConfig } from "@/data/shop-config";
import { bundleSuggestion, type CartTotals } from "@/lib/commerce/cart";
import { cartActions, useCart } from "@/lib/commerce/cart-store";
import { getSingle, productHref } from "@/lib/commerce/catalog";
import { formatPrice } from "@/lib/commerce/format";
import { cn } from "@/lib/cn";
import { QuantityStepper } from "./QuantityStepper";

function lineDetail(product: Product): string {
  if (product.kind === "bundle") {
    return product.contains.map((id) => getSingle(id).labelLine).join(" + ");
  }
  return `${product.shortName} · ${product.volume}`;
}

/** A kosár sorai mennyiségmódosítással és eltávolítással. */
export function CartLines({ onNavigate }: { onNavigate?: () => void }) {
  const { totals } = useCart();
  return (
    <ul className="divide-y divide-line border-y border-line">
      {totals.lines.map(({ product, quantity, lineTotal }) => (
        <li key={product.id} className="flex gap-4 py-5">
          <Link
            href={productHref(product)}
            onClick={onNavigate}
            tabIndex={-1}
            aria-hidden="true"
            className="relative block h-24 w-[4.5rem] shrink-0 overflow-hidden bg-surface"
          >
            <Image src={product.thumbImage.src} alt="" fill sizes="72px" className="object-cover" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={productHref(product)} onClick={onNavigate} className="font-medium">
                  {product.name}
                </Link>
                <p className="mt-0.5 text-sm text-muted">{lineDetail(product)}</p>
              </div>
              <p className="shrink-0 font-medium tabular-nums">{formatPrice(lineTotal)}</p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <QuantityStepper
                size="sm"
                label={product.name}
                value={quantity}
                onChange={(next) => cartActions.setQuantity(product.id, next)}
              />
              <button
                type="button"
                onClick={() => cartActions.remove(product.id)}
                aria-label={`${product.name} eltávolítása a kosárból`}
                className="link-line py-2 text-sm text-muted hover:text-fg"
              >
                Eltávolítás
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Ha a két üveg külön van a kosárban, felajánlja a kedvezőbb páros csomagot. */
export function BundleHint({ className }: { className?: string }) {
  const { cart } = useCart();
  const suggestion = bundleSuggestion(cart);
  if (!suggestion) return null;
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-surface p-4", className)}>
      <p className="text-[0.9375rem]">
        Páros csomagként <strong className="font-medium">{formatPrice(suggestion.saving)}</strong>{" "}
        kedvezőbb.
      </p>
      <button
        type="button"
        onClick={cartActions.convertPairsToBundle}
        className="link-line text-[0.9375rem] font-medium"
      >
        Váltás páros csomagra
      </button>
    </div>
  );
}

/** Mennyi hiányzik az ingyenes szállításhoz. */
export function FreeShippingMeter({ totals, className }: { totals: CartTotals; className?: string }) {
  const threshold = shopConfig.shipping.freeThreshold;
  if (threshold === null || totals.freeShippingRemaining === null || totals.itemCount === 0) {
    return null;
  }
  const remaining = totals.freeShippingRemaining;
  const progress = Math.min(1, totals.subtotal / threshold);
  return (
    <div className={className}>
      <p className="text-sm">
        {remaining > 0 ? (
          <>
            Még <strong className="font-medium tabular-nums">{formatPrice(remaining)}</strong> az
            ingyenes szállításig.
          </>
        ) : (
          "A szállítás ennél a rendelésnél ingyenes."
        )}
      </p>
      <div className="mt-2 h-px bg-line" aria-hidden="true">
        <div
          className="h-full origin-left bg-fg transition-transform duration-500"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </div>
  );
}

/** Részösszeg, szállítás, végösszeg. */
export function TotalsRows({ totals, className }: { totals: CartTotals; className?: string }) {
  return (
    <dl className={cn("space-y-2.5 text-[0.9375rem]", className)}>
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Részösszeg</dt>
        <dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd>
      </div>
      {totals.bundleSavings > 0 && (
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Csomagkedvezmény (az árban)</dt>
          <dd className="tabular-nums">{formatPrice(-totals.bundleSavings)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Szállítás</dt>
        <dd className="tabular-nums">
          {totals.shippingFee === 0 ? "Ingyenes" : formatPrice(totals.shippingFee)}
        </dd>
      </div>
      <div className="flex items-baseline justify-between gap-4 border-t border-line pt-4 text-lg font-medium">
        <dt>Összesen</dt>
        <dd className="tabular-nums">{formatPrice(totals.total)}</dd>
      </div>
    </dl>
  );
}
