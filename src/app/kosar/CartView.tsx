"use client";

import Link from "next/link";
import { ShippingNote } from "@/components/shop/ShippingNote";
import { BundleHint, CartLines, FreeShippingMeter, TotalsRows } from "@/components/shop/CartParts";
import { useCart } from "@/lib/commerce/cart-store";

export function CartView() {
  const { totals, hydrated } = useCart();

  if (!hydrated) {
    return <p className="mt-10 text-muted" aria-live="polite">A kosár betöltése…</p>;
  }

  if (totals.itemCount === 0) {
    return (
      <div className="mt-10 max-w-xl">
        <p className="lead text-muted">
          A kosarad még üres. Nézd meg a két üveget, vagy válaszd együtt a páros csomagban.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/termekek" className="btn btn-primary">
            Termékek megtekintése
          </Link>
          <Link href="/paros-csomag" className="btn btn-outline">
            Páros csomag
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-x-16 gap-y-12 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <CartLines />
        <BundleHint className="mt-6" />
        <p className="mt-6">
          <Link href="/termekek" className="link-line text-[0.9375rem]">
            Vásárlás folytatása
          </Link>
        </p>
      </div>

      <aside aria-label="Összesítés" className="lg:col-span-5 xl:col-span-4 xl:col-start-9">
        <div className="bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-medium">Összesítés</h2>
          <FreeShippingMeter totals={totals} className="mt-5" />
          <TotalsRows totals={totals} className="mt-6" />
          <Link href="/penztar" className="btn btn-primary mt-6 w-full">
            Tovább a pénztárhoz
          </Link>
          <ShippingNote className="mt-4 text-sm text-muted" />
        </div>
      </aside>
    </div>
  );
}
