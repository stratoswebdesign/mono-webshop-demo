"use client";

import Link from "next/link";
import type { ProductId } from "@/data/products";
import { cartActions } from "@/lib/commerce/cart-store";
import { bundleListPrice, getProduct, productHref } from "@/lib/commerce/catalog";
import { formatPrice } from "@/lib/commerce/format";
import { cn } from "@/lib/cn";
import { useShell } from "@/components/site/SiteShell";

/**
 * Vásárlósáv: az utazás közben mindig kéznél van az a termék, amelyet a
 * látogató éppen néz – egy mozdulattal kosárba tehető.
 */
export function BuyBar({ productId, visible }: { productId: ProductId; visible: boolean }) {
  const { openCart, cartOpen } = useShell();
  const product = getProduct(productId);
  const compareAt = product.kind === "bundle" ? bundleListPrice(product) : null;
  const shown = visible && !cartOpen;

  return (
    <div
      aria-hidden={!shown}
      inert={!shown}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-3 transition-[opacity,transform] duration-700 ease-[var(--ease-quiet)] sm:pb-5",
        shown ? "opacity-100" : "translate-y-3 opacity-0",
      )}
    >
      <div
        className={cn(
          "flex w-full max-w-[34rem] items-center gap-4 border border-[color-mix(in_srgb,var(--fg)_14%,transparent)] bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] py-2 pl-5 pr-2 backdrop-blur-xl",
          shown && "pointer-events-auto",
        )}
      >
        <Link href={productHref(product)} className="min-w-0 flex-1">
          <span key={product.id} className="fade block truncate text-[0.8125rem]">
            {product.name}
          </span>
        </Link>
        <span key={`${product.id}-price`} className="fade shrink-0 text-[0.8125rem] tabular-nums">
          {compareAt !== null && compareAt > product.price && (
            <s className="mr-2 text-muted">
              <span className="sr-only">Külön vásárolva: </span>
              {formatPrice(compareAt)}
            </s>
          )}
          {formatPrice(product.price)}
        </span>
        <button
          type="button"
          className="btn btn-primary min-h-10 shrink-0 px-5"
          onClick={() => {
            cartActions.add(product.id);
            openCart();
          }}
        >
          Kosárba
        </button>
      </div>
    </div>
  );
}
