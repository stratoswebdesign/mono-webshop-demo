import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { Price } from "@/components/shop/Price";
import { ShippingNote } from "@/components/shop/ShippingNote";
import { Photo } from "@/components/site/Photo";
import { routines } from "@/data/routines";
import {
  bundleSaving,
  getBundle,
  getSingleBySlug,
  listSingles,
  productHref,
} from "@/lib/commerce/catalog";
import { formatPrice } from "@/lib/commerce/format";
import { cn } from "@/lib/cn";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return listSingles().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = getSingleBySlug((await params).slug);
  return product ? { title: product.name, description: product.summary } : {};
}

export default async function ProductPage({ params }: Params) {
  const product = getSingleBySlug((await params).slug);
  if (!product) notFound();

  const bundle = getBundle();
  const routine = routines[product.id];
  const other = listSingles().find((p) => p.id !== product.id)!;

  return (
    <>
      <div className="wrap grid gap-x-14 gap-y-8 pt-6 lg:grid-cols-12 lg:pt-10">
        <div className="lg:col-span-7">
          <ProductGallery product={product} />
        </div>

        <div className="lg:col-span-5 lg:pt-6">
          <nav aria-label="Morzsamenü" className="text-sm text-muted">
            <Link href="/termekek" className="link-line">
              Termékek
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{product.shortName}</span>
          </nav>

          <p className="eyebrow mt-8">Folyékony étrend-kiegészítő · {product.volume}</p>
          <h1 className="display-lg mt-3">{product.name}</h1>
          <Price amount={product.price} className="mt-5 text-[1.625rem]" />

          <div className="prose-serif mt-6 max-w-md space-y-3 text-muted">
            {product.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium" id="valtozat-cim">
              Változat
            </p>
            <ul aria-labelledby="valtozat-cim" className="mt-2.5 grid max-w-md grid-cols-2 gap-2.5">
              {listSingles().map((option) => {
                const current = option.id === product.id;
                return (
                  <li key={option.id}>
                    <Link
                      href={productHref(option)}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "block rounded-[2px] border px-4 py-3 transition-colors",
                        current ? "border-fg" : "border-line text-muted hover:border-muted hover:text-fg",
                      )}
                    >
                      <span className="block font-medium">{option.shortName}</span>
                      <span className="block text-sm">{option.routine.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-8">
            <PurchasePanel productId={product.id} name={product.name} />
            <ShippingNote className="mt-3 text-sm text-muted" />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-y border-line py-4 text-[0.9375rem]">
            <p>
              Páros csomagban a {other.name} üveggel:{" "}
              <strong className="font-medium tabular-nums">{formatPrice(bundle.price)}</strong>
              <span className="text-muted"> ({formatPrice(bundleSaving(bundle))} megtakarítás)</span>
            </p>
            <Link href="/paros-csomag" className="link-line font-medium">
              Megnézem a csomagot
            </Link>
          </div>
        </div>
      </div>

      <ProductDetails product={product} />

      <section className="wrap mt-24 lg:mt-36" aria-labelledby="rutin-cim">
        <div className="grid items-center gap-x-14 gap-y-10 lg:grid-cols-12">
          <Photo
            image={routine.heroImage}
            focus={routine.heroFocus}
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="aspect-[4/5] lg:col-span-6"
          />
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="eyebrow">{routine.eyebrow}</p>
            <h2 id="rutin-cim" className="display-lg mt-4 lowercase">
              {routine.title}
            </h2>
            <p className="lead mt-6 text-muted">{routine.intro}</p>
            <Link href={product.routine.href} className="btn btn-outline mt-8">
              {product.routine.label}
            </Link>
          </div>
        </div>
      </section>

      <section className="wrap mt-24 lg:mt-36" aria-labelledby="masik-cim">
        <div className="grid items-end gap-x-14 gap-y-8 border-t border-line pt-14 lg:grid-cols-12 lg:pt-20">
          <div className="lg:col-span-6">
            <p className="eyebrow">{other.routine.label}</p>
            <h2 id="masik-cim" className="display-lg mt-4 lowercase">
              a párja: {other.name}.
            </h2>
            <p className="lead mt-5 max-w-md text-muted">{other.summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 lg:col-span-6 lg:justify-end">
            <Price amount={other.price} className="text-[1.375rem]" />
            <AddToCartButton productId={other.id} label={`${other.shortName} a kosárba`} />
            <Link href={productHref(other)} className="link-line text-[0.9375rem]">
              Részletek
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
