"use client";

import type { ProductId } from "@/data/products";
import { cartActions } from "@/lib/commerce/cart-store";
import { cn } from "@/lib/cn";
import { useShell } from "@/components/site/SiteShell";

export function AddToCartButton({
  productId,
  quantity = 1,
  label = "Kosárba",
  className,
}: {
  productId: ProductId;
  quantity?: number;
  label?: string;
  className?: string;
}) {
  const { openCart } = useShell();
  return (
    <button
      type="button"
      className={cn("btn btn-primary", className)}
      onClick={() => {
        cartActions.add(productId, quantity);
        openCart();
      }}
    >
      {label}
    </button>
  );
}
