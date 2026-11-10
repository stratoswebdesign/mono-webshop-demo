import type { Metadata } from "next";
import Link from "next/link";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { Price } from "@/components/shop/Price";
import { ShippingNote } from "@/components/shop/ShippingNote";
import { EmbossLine } from "@/components/site/EmbossLine";
import { Photo } from "@/components/site/Photo";
import { supplementNotice } from "@/data/pending";
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
      <div className="wrap pt-6 lg:pt-10">
        <Photo
          image={bundle.heroImage}
          sizes="100vw"
          priority
          className="aspect-[1568/1003] lg:aspect-auto lg:h-[min(70svh,46rem)]"
        />
      </div>

      <section className="wrap mt-12 grid gap-x-14 gap-y-12 lg:mt-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow">Páros csomag · 2 × 30 ml</p>
          <h1 className="display-xl mt-4 lowercase">
            reggelre és estére, <em className="font-serif font-normal italic tracking-[-0.02em]">együtt.</em>
          </h1>
          <div className="lead mt-8 max-w-xl space-y-4 text-muted">
            {bundle.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <EmbossLine className="mt-10 h-24 w-full max-w-md lg:h-32" />
        </div>

        <div className="lg:col-span-5 xl:col-span-4 xl:col-start-9">
          <div className="lg:sticky lg:top-24">
            <h2 className="eyebrow">A csomag tartalma</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {items.map((item) => (
                <li key={item.id} className="flex items-baseline justify-between gap-6 py-4">
                  <div>
                    <Link href={productHref(item)} className="link-line font-medium">
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-muted">
                      {item.routine.label} · {item.volume}
                    </p>
                  </div>
                  <span className="shrink-0 tabular-nums text-muted">{formatPrice(item.price)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 text-[0.9375rem]">
              <div className="flex justify-between gap-6">
                <dt className="text-muted">Külön vásárolva</dt>
                <dd className="tabular-nums">{formatPrice(listPrice)}</dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="text-muted">Megtakarítás</dt>
                <dd className="tabular-nums">{formatPrice(-saving)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6 border-t border-line pt-4">
                <dt className="text-lg font-medium">Páros csomag</dt>
                <dd>
                  <Price amount={bundle.price} className="text-[1.625rem] font-medium" />
                </dd>
              </div>
            </dl>

            <div className="mt-7">
              <PurchasePanel productId={bundle.id} name={bundle.name} />
              <ShippingNote className="mt-3 text-sm text-muted" />
            </div>
          </div>
        </div>
      </section>

      <section className="wrap mt-24 lg:mt-36" aria-label="A két rutin">
        <div className="grid gap-x-14 border-t border-line md:grid-cols-2">
          {items.map((item, index) => (
            <Link
              key={item.id}
              href={item.routine.href}
              className={
                index === 0
                  ? "group block border-b border-line py-10 md:border-b-0 md:border-r md:pr-14 lg:py-14"
                  : "group block py-10 lg:py-14"
              }
            >
              <p className="eyebrow">{item.routine.label}</p>
              <p className="display-md mt-3">{item.name}</p>
              <p className="prose-serif mt-3 max-w-sm text-muted">{item.summary}</p>
              <span className="link-line mt-5 inline-block text-[0.9375rem] group-hover:decoration-current">
                {index === 0 ? "A reggel" : "Az este"}
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted">{supplementNotice}</p>
      </section>
    </>
  );
}
