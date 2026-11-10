import type { Metadata } from "next";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShippingNote } from "@/components/shop/ShippingNote";
import { getBundle, listSingles } from "@/lib/commerce/catalog";

export const metadata: Metadata = {
  title: "Termékek",
  description: "mono menthol drops, mono sleep és a páros csomag.",
};

export default function ProductsPage() {
  return (
    <div className="wrap pt-12 lg:pt-20">
      <div className="grid gap-x-10 gap-y-5 lg:grid-cols-12">
        <h1 className="display-lg lowercase lg:col-span-7">két üveg és egy páros.</h1>
        <div className="self-end lg:col-span-4 lg:col-start-9">
          <p className="lead text-muted">
            Folyékony étrend-kiegészítők 30 ml-es borostyánüvegben, pipettás kupakkal.
          </p>
          <ShippingNote className="mt-3 text-sm text-muted" />
        </div>
      </div>

      <div className="mt-14 grid gap-x-10 gap-y-20 md:grid-cols-2 lg:mt-20">
        {listSingles().map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            aspect="aspect-[4/5]"
            sizes="(min-width: 768px) 48vw, 100vw"
            priority
          />
        ))}
        <div className="md:col-span-2">
          <ProductCard product={getBundle()} aspect="aspect-[1568/1003] lg:aspect-[2/1]" sizes="100vw" />
        </div>
      </div>
    </div>
  );
}
