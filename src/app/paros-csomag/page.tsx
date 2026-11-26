import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { ProductTile } from "@/components/shop/ProductTile";
import { ShippingNote } from "@/components/shop/ShippingNote";
import { supplementNotice } from "@/data/pending";
import { asset } from "@/lib/asset";
import {
  bundleListPrice,
  bundleSaving,
  getBundle,
  getSingle,
  productHref,
} from "@/lib/commerce/catalog";
import { formatPrice } from "@/lib/commerce/format";

const bundle = getBundle();

export const metadata: Metadata = {
  title: "Páros csomag",
  description: bundle.summary,
};

export default function BundlePage() {
  const items = bundle.contains.map(getSingle);
  const listPrice = bundleListPrice(bundle);
  const saving = bundleSaving(bundle);

  return (
    <>
      <section className="relative flex min-h-svh items-end overflow-hidden">
        <Image
          src={asset(bundle.heroImage.src)}
          alt={bundle.heroImage.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="wrap relative flex flex-wrap items-end justify-between gap-x-10 gap-y-8 pb-10 pt-40 lg:pb-14">
          <div className="on-image max-w-[22rem]">
            <p className="label rise">Páros csomag · 2 × 30 ml</p>
            <h1 className="statement-lg rise mt-3 lowercase" style={{ "--i": 1 } as React.CSSProperties}>
              reggelre és estére.
            </h1>
            <p className="copy rise mt-4 opacity-85" style={{ "--i": 2 } as React.CSSProperties}>
              {bundle.summary}
            </p>
          </div>
          <div className="rise w-full max-w-[19rem]" style={{ "--i": 3 } as React.CSSProperties}>
            <p className="on-image text-[1.25rem] tabular-nums">
              {formatPrice(bundle.price)}
              <s className="ml-3 text-[0.8125rem] opacity-60">
                <span className="sr-only">Külön vásárolva: </span>
                {formatPrice(listPrice)}
              </s>
            </p>
            <div className="mt-4">
              <PurchasePanel productId={bundle.id} name={bundle.name} />
            </div>
          </div>
        </div>
      </section>

      <section className="wrap grid gap-x-20 gap-y-14 py-24 lg:grid-cols-2 lg:py-40">
        <div className="max-w-md">
          <h2 className="statement lowercase">a két üveg, együtt.</h2>
          <div className="copy mt-6 space-y-3 text-muted">
            {bundle.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <ShippingNote className="mt-6 text-[0.8125rem] text-muted" />
        </div>

        <div className="max-w-md lg:justify-self-end">
          <h2 className="label text-muted">A csomag tartalma</h2>
          <ul className="mt-4 border-t border-line">
            {items.map((item) => (
              <li key={item.id} className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                <div>
                  <Link href={productHref(item)} className="link-line">
                    {item.name}
                  </Link>
                  <p className="text-[0.8125rem] text-muted">
                    {item.routine.label} · {item.volume}
                  </p>
                </div>
                <span className="shrink-0 tabular-nums text-muted">{formatPrice(item.price)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2">
            <div className="flex justify-between gap-6">
              <dt className="text-muted">Külön vásárolva</dt>
              <dd className="tabular-nums">{formatPrice(listPrice)}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="text-muted">Megtakarítás</dt>
              <dd className="tabular-nums">{formatPrice(-saving)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-t border-line pt-4 text-[1.125rem]">
              <dt>Páros csomag</dt>
              <dd className="tabular-nums">{formatPrice(bundle.price)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* A csomagolás */}
      <section aria-labelledby="csomagolas-cim" className="relative flex min-h-[70svh] items-end overflow-hidden">
        <Image
          src={asset(bundle.boxImage.src)}
          alt={bundle.boxImage.alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="wrap relative pb-10 pt-40 lg:pb-14">
          <div className="on-image max-w-[21rem]">
            <p className="label">A csomagolás</p>
            <h2 id="csomagolas-cim" className="statement mt-3 lowercase">
              a vonal a dobozon folytatódik.
            </h2>
          </div>
        </div>
      </section>

      <section aria-label="A két termék" className="mt-px grid gap-px md:grid-cols-2">
        {items.map((item) => (
          <ProductTile
            key={item.id}
            product={item}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[4/5] md:aspect-auto md:h-[80svh] md:min-h-[32rem]"
          />
        ))}
      </section>
      <p className="wrap pt-10 text-[0.8125rem] text-muted">{supplementNotice}</p>
    </>
  );
}
