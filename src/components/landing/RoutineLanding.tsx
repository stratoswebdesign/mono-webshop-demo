import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { ProductTile } from "@/components/shop/ProductTile";
import { SCENES } from "@/components/scene/scene-config";
import type { Variant } from "@/data/products";
import { routines } from "@/data/routines";
import { asset } from "@/lib/asset";
import { getBundle, getSingle, productHref } from "@/lib/commerce/catalog";
import { formatPrice } from "@/lib/commerce/format";

/** A reggeli és az esti landing közös felépítése – a tartalom a data/routines.ts-ből jön. */
export function RoutineLanding({ variant }: { variant: Variant }) {
  const product = getSingle(variant);
  const routine = routines[variant];
  const bundle = getBundle();
  const scene = SCENES[product.tone === "night" ? "este" : "reggel"];

  return (
    <>
      {/* Nyitó: a jelenet teljes képernyőn, a sarokban apró szöveggel */}
      <section className="relative flex min-h-svh items-end overflow-hidden">
        <Image
          src={asset(scene.still)}
          alt={`${product.name} üveg – ${routine.eyebrow.toLowerCase()}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="wrap relative flex flex-wrap items-end justify-between gap-x-10 gap-y-8 pb-10 pt-40 lg:pb-14">
          <div className="on-image max-w-[22rem]">
            <p className="label rise">{routine.eyebrow}</p>
            <h1 className="statement-lg rise mt-3 lowercase" style={{ "--i": 1 } as React.CSSProperties}>
              {routine.title}
            </h1>
            <p className="copy rise mt-4 opacity-85" style={{ "--i": 2 } as React.CSSProperties}>
              {routine.intro}
            </p>
          </div>
          <div className="rise flex items-center gap-5" style={{ "--i": 3 } as React.CSSProperties}>
            <p className="on-image text-right">
              <span className="block">{product.name}</span>
              <span className="block tabular-nums opacity-70">{formatPrice(product.price)}</span>
            </p>
            <AddToCartButton productId={product.id} />
          </div>
        </div>
      </section>

      {/* Három pillanat */}
      <section className="wrap py-24 lg:py-40" aria-label={routine.eyebrow}>
        <div className="grid gap-x-16 gap-y-12 md:grid-cols-3">
          {routine.moments.map((moment) => (
            <div key={moment.title} className="max-w-xs">
              <h2 className="statement lowercase">{moment.title}</h2>
              <p className="copy mt-4 text-muted">{moment.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-14 max-w-md text-[0.8125rem] text-muted">
          Az adagolásra a termék címkéjén szereplő útmutatás az irányadó; a részletes leírás a
          termékoldalra kerül.
        </p>
      </section>

      {/* Két kép: a termék közelről és a környezetében */}
      <section aria-label="Képek" className="grid gap-px md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden bg-surface">
          <Image
            src={asset(product.cardImage.src)}
            alt={product.cardImage.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-surface">
          <Image
            src={asset(routine.heroImage.src)}
            alt={routine.heroImage.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            style={{ objectPosition: routine.heroFocus }}
          />
        </div>
      </section>

      {/* Vásárlás */}
      <section className="wrap py-24 lg:py-40" aria-labelledby="landing-termek">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <p className="label text-muted">
            {product.name} · {product.volume}
          </p>
          <h2 id="landing-termek" className="statement-lg mt-4 lowercase">
            {routine.closing.title}
          </h2>
          <p className="copy mt-5 text-muted">{routine.closing.text}</p>
          <p className="mt-7 text-[1.25rem] tabular-nums">{formatPrice(product.price)}</p>
          <AddToCartButton productId={product.id} className="mt-5 w-full max-w-64" />
          <Link href={productHref(product)} className="label link-line mt-6">
            Forgatható 3D nézet
          </Link>
        </div>
      </section>

      {/* Tovább: a másik napszak és a páros */}
      <section aria-label="További ajánlatok" className="grid gap-px md:grid-cols-2">
        <Link
          href={routine.other.href}
          data-tone={product.tone === "night" ? "day" : "night"}
          className="group relative flex aspect-[4/5] items-end overflow-hidden bg-bg text-fg md:aspect-auto md:h-[70svh]"
        >
          <Image
            src={asset(SCENES[product.tone === "night" ? "reggel" : "este"].still)}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-[2400ms] ease-[var(--ease-quiet)] group-hover:scale-[1.025]"
          />
          <div className="on-image relative p-5 md:p-8">
            <p className="label">{routine.other.question}</p>
            <p className="title mt-2">{routine.other.label}</p>
          </div>
        </Link>
        <ProductTile
          product={bundle}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="aspect-[4/5] md:aspect-auto md:h-[70svh]"
        />
      </section>
    </>
  );
}
