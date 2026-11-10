"use client";

import { useState } from "react";
import type { ProductId } from "@/data/products";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { QuantityStepper } from "@/components/shop/QuantityStepper";

/** Mennyiségválasztó + kosárba gomb a termék- és csomagoldalon. */
export function PurchasePanel({ productId, name }: { productId: ProductId; name: string }) {
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="flex flex-wrap items-stretch gap-3">
      <QuantityStepper value={quantity} onChange={setQuantity} label={name} />
      <AddToCartButton productId={productId} quantity={quantity} className="min-w-52 flex-1 sm:flex-none" />
    </div>
  );
}
