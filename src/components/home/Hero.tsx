"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { Price } from "@/components/shop/Price";
import { VariantToggle } from "@/components/shop/VariantToggle";
import { useShell } from "@/components/site/SiteShell";
import { ProductStage } from "@/components/three/ProductStage";
import { getSingle, productHref } from "@/lib/commerce/catalog";

export function Hero() {
  const { homeVariant, setHomeVariant } = useShell();
  const product = getSingle(homeVariant);

  const purchase = (
    <>
      <Price amount={product.price} className="text-[1.375rem]" />
      <AddToCartButton productId={product.id} />
      <Link href={productHref(product)} className="link-line text-[0.9375rem]">
        Részletek
      </Link>
    </>
  );

  return (
    <section aria-label="mono – nyitószakasz">
      <div className="relative h-[calc(100svh-9.5rem)] max-h-[47.5rem] min-h-[35rem] lg:h-[calc(100svh-6.25rem)] lg:max-h-[58rem] lg:min-h-[40rem]">
        <ProductStage variant={homeVariant} hero scrollLinked className="absolute inset-0" />

        <div className="wrap pointer-events-none relative z-10 flex h-full flex-col pt-8 lg:justify-center lg:pb-[13%] lg:pt-0">
          <div className="max-w-[36rem]">
            <p className="eyebrow rise">Folyékony étrend-kiegészítő · {product.volume}</p>
            <h1 className="display-xl rise mt-4 lowercase lg:mt-6" style={{ "--i": 1 } as React.CSSProperties}>
              egy üveg.
              <br />
              egy mozdulat.
              <br />
              minden{" "}
              <em key={product.id} className="rise inline-block font-serif font-normal italic tracking-[-0.02em]">
                {product.routine.word}.
              </em>
            </h1>
            <p
              className="lead rise mt-6 hidden max-w-[27rem] text-muted lg:block"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              {product.summary}
            </p>
            <div className="rise pointer-events-auto mt-5 w-fit lg:mt-9" style={{ "--i": 3 } as React.CSSProperties}>
              <VariantToggle value={homeVariant} onChange={setHomeVariant} />
            </div>
            <div
              className="rise pointer-events-auto mt-8 hidden w-fit items-center gap-6 lg:flex"
              style={{ "--i": 4 } as React.CSSProperties}
            >
              {purchase}
            </div>
          </div>
        </div>
      </div>

      {/* Mobilon a vásárlás a színpad alatt kap helyet. */}
      <div className="wrap border-b border-line py-6 lg:hidden">
        <p className="prose-serif text-muted">{product.summary}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-4">{purchase}</div>
      </div>
    </section>
  );
}
