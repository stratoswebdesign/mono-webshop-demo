import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { ProductTile } from "@/components/shop/ProductTile";
import { ShippingNote } from "@/components/shop/ShippingNote";
import { routines } from "@/data/routines";
import { asset } from "@/lib/asset";
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
  const [, macroLabel, macroCap] = product.gallery;

  return (
    <>
      <div className="lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <ProductGallery product={product} />

        <div className="flex flex-col justify-center px-5 py-12 md:px-10 lg:min-h-svh lg:px-14 lg:pb-20 lg:pt-32 xl:px-20">
          <div className="max-w-md">
            <nav aria-label="Morzsamenü" className="label text-muted">
              <Link href="/termekek" className="link-line">
                Termékek
              </Link>
              <span aria-hidden="true"> / </span>
              <span aria-current="page">{product.shortName}</span>
            </nav>

            <h1 className="statement-lg mt-8">{product.name}</h1>
            <p className="label mt-4 text-muted">Folyékony étrend-kiegészítő · {product.volume}</p>
            <p className="mt-6 text-[1.25rem] tabular-nums">{formatPrice(product.price)}</p>

            <div className="copy mt-6 space-y-3 text-muted">
              {product.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-9">
              <p className="label text-muted" id="valtozat-cim">
                Változat
              </p>
              <ul aria-labelledby="valtozat-cim" className="mt-3 flex gap-8">
                {listSingles().map((option) => {
                  const current = option.id === product.id;
                  return (
                    <li key={option.id}>
                      <Link
                        href={productHref(option)}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                          "relative block pb-2.5 transition-opacity duration-500",
                          current
                            ? "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-fg"
                            : "opacity-50 hover:opacity-100",
                        )}
                      >
                        <span className="block">{option.shortName}</span>
                        <span className="block text-[0.75rem] text-muted">{option.routine.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-9">
              <PurchasePanel productId={product.id} name={product.name} />
              <ShippingNote className="mt-4 text-[0.8125rem] text-muted" />
            </div>

            <p className="mt-8 text-[0.8125rem]">
              <Link href="/paros-csomag" className="link-line">
                Páros csomagban a {other.name} üveggel {formatPrice(bundle.price)}
              </Link>
              <span className="text-muted"> – {formatPrice(bundleSaving(bundle))} megtakarítás</span>
            </p>

            <div className="mt-12">
              <ProductDetails product={product} />
            </div>
          </div>
        </div>
      </div>

      {/* Részletek közelről */}
      <section aria-label="Részletek közelről" className="mt-px grid gap-px md:grid-cols-2">
        {[
          { image: macroLabel, label: "A vonal", text: "Dombornyomás, nem nyomat." },
          { image: macroCap, label: "Pipetta", text: "Bordázott kupak, gumipipetta, üvegcső." },
        ].map((item) => (
          <figure key={item.label} className="relative aspect-[3/2] overflow-hidden bg-surface">
            <Image
              src={asset(item.image.src)}
              alt={item.image.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <figcaption className="on-image absolute bottom-0 left-0 p-5 md:p-8">
              <p className="label">{item.label}</p>
              <p className="copy mt-1 opacity-80">{item.text}</p>
            </figcaption>
          </figure>
        ))}
      </section>

      {/* A rutin */}
      <section aria-labelledby="rutin-cim" className="relative mt-px flex min-h-[80svh] items-end overflow-hidden">
        <Image
          src={asset(routine.heroImage.src)}
          alt={routine.heroImage.alt}
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: routine.heroFocus }}
        />
        <div className="wrap relative pb-12 pt-40 lg:pb-16">
          <div className="on-image max-w-[21rem]">
            <p className="label">{routine.eyebrow}</p>
            <h2 id="rutin-cim" className="statement-lg mt-3 lowercase">
              {routine.title}
            </h2>
            <p className="copy mt-4 opacity-85">{routine.intro}</p>
            <Link href={product.routine.href} className="btn btn-outline mt-7">
              {product.routine.label}
            </Link>
          </div>
        </div>
      </section>

      {/* A párja */}
      <ProductTile
        product={other}
        sizes="100vw"
        className="mt-px aspect-[4/5] md:aspect-auto md:h-[80svh] md:min-h-[32rem]"
      />
    </>
  );
}
