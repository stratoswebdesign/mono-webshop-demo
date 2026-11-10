import Link from "next/link";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { Price } from "@/components/shop/Price";
import { EmbossLine } from "@/components/site/EmbossLine";
import { Photo } from "@/components/site/Photo";
import type { Variant } from "@/data/products";
import { routines } from "@/data/routines";
import { bundleSaving, getBundle, getSingle, productHref } from "@/lib/commerce/catalog";
import { formatPrice } from "@/lib/commerce/format";

/** A reggeli és az esti landing közös felépítése – a tartalom a data/routines.ts-ből jön. */
export function RoutineLanding({ variant }: { variant: Variant }) {
  const product = getSingle(variant);
  const routine = routines[variant];
  const bundle = getBundle();

  return (
    <>
      <section className="wrap grid items-end gap-x-14 gap-y-8 pt-6 lg:grid-cols-12 lg:pt-10">
        <div className="order-2 lg:order-1 lg:col-span-5 lg:pb-10">
          <p className="eyebrow rise">{routine.eyebrow}</p>
          <h1 className="display-xl rise mt-5 lowercase" style={{ "--i": 1 } as React.CSSProperties}>
            {routine.title}
          </h1>
          <p className="lead rise mt-7 max-w-md text-muted" style={{ "--i": 2 } as React.CSSProperties}>
            {routine.intro}
          </p>
          <div
            className="rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-4"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <AddToCartButton productId={product.id} label={`${product.name} a kosárba`} />
            <Price amount={product.price} className="text-[1.375rem]" />
          </div>
        </div>
        <Photo
          image={routine.heroImage}
          focus={routine.heroFocus}
          sizes="(min-width: 1024px) 56vw, 100vw"
          priority
          className="order-1 aspect-[4/5] lg:order-2 lg:col-span-7 lg:aspect-auto lg:h-[calc(100svh-8.5rem)] lg:max-h-[56rem] lg:min-h-[36rem]"
        />
      </section>

      <section className="wrap mt-24 lg:mt-36" aria-label={routine.eyebrow}>
        <EmbossLine className="h-24 w-full max-w-lg lg:h-32" />
        <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-3">
          {routine.moments.map((moment) => (
            <div key={moment.title} className="border-t border-line pt-5">
              <h2 className="display-md lowercase">{moment.title}</h2>
              <p className="prose-serif mt-4 max-w-sm text-muted">{moment.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-xl text-sm text-muted">
          Az adagolásra a termék címkéjén szereplő útmutatás az irányadó; a részletes leírás a
          termékoldalra kerül.
        </p>
      </section>

      <section className="wrap mt-24 lg:mt-36" aria-labelledby="landing-termek">
        <div className="grid items-center gap-x-14 gap-y-10 lg:grid-cols-12">
          <Photo
            image={routine.secondImage}
            focus={routine.secondFocus}
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="aspect-[4/5] lg:col-span-5"
          />
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="eyebrow">
              {product.name} · {product.volume}
            </p>
            <h2 id="landing-termek" className="display-lg mt-4 lowercase">
              {routine.closing.title}
            </h2>
            <p className="lead mt-6 max-w-md text-muted">{routine.closing.text}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Price amount={product.price} className="text-[1.625rem]" />
              <AddToCartButton productId={product.id} />
              <Link href={productHref(product)} className="link-line text-[0.9375rem]">
                Termékoldal és 3D nézet
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap mt-24 lg:mt-36" aria-label="További ajánlatok">
        <div className="grid gap-x-14 border-t border-line md:grid-cols-2">
          <Link href={routine.other.href} className="group block border-b border-line py-10 md:border-b-0 md:border-r md:pr-14 lg:py-14">
            <p className="eyebrow">{routine.other.question}</p>
            <p className="display-md mt-3 lowercase">{routine.other.label}</p>
            <span className="link-line mt-5 inline-block text-[0.9375rem] group-hover:decoration-current">
              Megnézem
            </span>
          </Link>
          <Link href="/paros-csomag" className="group block py-10 lg:py-14">
            <p className="eyebrow">Páros csomag · {formatPrice(bundle.price)}</p>
            <p className="display-md mt-3 lowercase">
              a két üveg együtt, {formatPrice(bundleSaving(bundle))} megtakarítással
            </p>
            <span className="link-line mt-5 inline-block text-[0.9375rem] group-hover:decoration-current">
              Megnézem
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
