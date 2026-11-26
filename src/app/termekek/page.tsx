import type { Metadata } from "next";
import { ProductTile } from "@/components/shop/ProductTile";
import { ShippingNote } from "@/components/shop/ShippingNote";
import { getBundle, listSingles } from "@/lib/commerce/catalog";

export const metadata: Metadata = {
  title: "Termékek",
  description: "mono menthol drops, mono sleep és a páros csomag.",
};

export default function ProductsPage() {
  const bundle = getBundle();
  return (
    <>
      <div className="wrap flex flex-wrap items-end justify-between gap-x-10 gap-y-4 pb-8 pt-32 lg:pb-10 lg:pt-40">
        <div>
          <p className="label text-muted">Termékek</p>
          <h1 className="statement-lg mt-3 lowercase">két üveg és egy páros.</h1>
        </div>
        <ShippingNote className="copy max-w-xs text-muted" />
      </div>

      <div className="grid gap-px md:grid-cols-2">
        {listSingles().map((product) => (
          <ProductTile
            key={product.id}
            product={product}
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
            className="aspect-[4/5] md:aspect-auto md:h-[88svh] md:min-h-[34rem]"
          />
        ))}
      </div>
      <ProductTile
        product={bundle}
        image={bundle.heroImage}
        sizes="100vw"
        className="mt-px aspect-[4/5] md:aspect-auto md:h-[80svh] md:min-h-[32rem]"
      />
    </>
  );
}
