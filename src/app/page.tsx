import { Journey } from "@/components/journey/Journey";
import { ProductTile } from "@/components/shop/ProductTile";
import { getBundle, listSingles } from "@/lib/commerce/catalog";

export default function HomePage() {
  const bundle = getBundle();
  return (
    <>
      <Journey />

      {/* Az utazás végén: a két üveg és a páros, közvetlenül kosárba tehetően */}
      <section aria-labelledby="valasztas-cim" data-tone="day" className="bg-bg text-fg">
        <div className="wrap pb-10 pt-24 lg:pb-14 lg:pt-36">
          <p className="label text-muted">Válassz</p>
          <h2 id="valasztas-cim" className="statement-lg mt-3 lowercase">
            melyikkel kezded?
          </h2>
        </div>
        <div className="grid gap-px md:grid-cols-2">
          {listSingles().map((product) => (
            <ProductTile
              key={product.id}
              product={product}
              sizes="(min-width: 768px) 50vw, 100vw"
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
      </section>
    </>
  );
}
