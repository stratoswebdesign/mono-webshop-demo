import Link from "next/link";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { Price } from "@/components/shop/Price";
import { EmbossLine } from "@/components/site/EmbossLine";
import { Photo } from "@/components/site/Photo";
import { routines } from "@/data/routines";
import { bundleListPrice, bundleSaving, getBundle, getSingle } from "@/lib/commerce/catalog";
import { formatPrice } from "@/lib/commerce/format";

/** Két napszak: a reggeli és az esti világ, környezetbe helyezett üveggel. */
export function TwoRoutines() {
  const morning = getSingle("classic");
  const evening = getSingle("sleep");
  return (
    <section className="wrap py-24 lg:py-40" aria-labelledby="ket-napszak">
      <div className="grid gap-x-10 gap-y-6 lg:grid-cols-12">
        <h2 id="ket-napszak" className="display-lg lowercase lg:col-span-7">
          reggel az egyik,
          <br />
          este a másik.
        </h2>
        <p className="lead self-end text-muted lg:col-span-4 lg:col-start-9">
          Két üveg, két napszak. A törtfehér címkés a fürdőszobapulton kezdi a napot, a mély
          erdőzöld az éjjeliszekrényen zárja.
        </p>
      </div>

      <div className="mt-14 grid gap-x-10 gap-y-16 lg:mt-24 lg:grid-cols-12">
        <Link href={morning.routine.href} className="group block lg:col-span-7">
          <Photo
            image={routines.classic.heroImage}
            focus="50% 58%"
            sizes="(min-width: 1024px) 56vw, 100vw"
            className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[6/5]"
          />
          <div className="mt-5 flex items-baseline justify-between gap-6">
            <div>
              <p className="eyebrow">{morning.routine.label}</p>
              <p className="display-md mt-1.5">{morning.name}</p>
            </div>
            <span className="link-line shrink-0 text-[0.9375rem] group-hover:decoration-current">
              A reggel
            </span>
          </div>
        </Link>

        <Link href={evening.routine.href} className="group block lg:col-span-5 lg:mt-48">
          <Photo
            image={routines.sleep.heroImage}
            focus="45% 55%"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="aspect-[4/5]"
          />
          <div className="mt-5 flex items-baseline justify-between gap-6">
            <div>
              <p className="eyebrow">{evening.routine.label}</p>
              <p className="display-md mt-1.5">{evening.name}</p>
            </div>
            <span className="link-line shrink-0 text-[0.9375rem] group-hover:decoration-current">
              Az este
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}

/** Anyagok: a csomagolás tényszerű, tapintható részletei. */
export function Materials() {
  const details = [
    {
      title: "Borostyánüveg",
      text: "30 ml-es, borostyánbarna cseppentős üveg. Oldalfényben felmelegszik a színe, a pulton borostyán fényfoltot vet.",
    },
    {
      title: "Pipettás kupak",
      text: "Fekete, bordázott gallér és gumipipetta, benne üvegcső. Csavarod, szív, cseppent.",
    },
    {
      title: "Papír és vonal",
      text: "Texturált papírcímke és -doboz. A szabálytalan vonal nem nyomat, hanem dombornyomás: a fény rajzolja ki, és az ujjad is megtalálja.",
    },
  ];
  return (
    <section className="bg-surface" aria-labelledby="anyagok">
      <div className="wrap py-24 lg:py-36" style={{ "--emboss-face": "var(--surface)" } as React.CSSProperties}>
        <p className="eyebrow">A csomagolás</p>
        <h2 id="anyagok" className="display-lg mt-4 max-w-3xl lowercase">
          anyagok, amiket jó kézbe venni.
        </h2>
        <EmbossLine wide className="mt-12 lg:mt-10" />
        <dl className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-3 lg:mt-14">
          {details.map((detail) => (
            <div key={detail.title} className="border-t border-line pt-5">
              <dt className="text-xl font-medium">{detail.title}</dt>
              <dd className="prose-serif mt-3 max-w-sm text-muted">{detail.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Páros csomag ajánlat – az árak a központi termékadatokból számolódnak. */
export function BundleOffer() {
  const bundle = getBundle();
  return (
    <section className="wrap py-24 lg:py-40" aria-labelledby="paros-ajanlat">
      <div className="grid items-end gap-x-12 gap-y-10 lg:grid-cols-12">
        <Link href="/paros-csomag" className="block lg:col-span-8" aria-label="A páros csomag részletei">
          <Photo
            image={bundle.heroImage}
            sizes="(min-width: 1024px) 64vw, 100vw"
            className="aspect-[1568/1003]"
          />
        </Link>
        <div className="lg:col-span-4 lg:pb-2">
          <p className="eyebrow">Páros csomag</p>
          <h2 id="paros-ajanlat" className="display-lg mt-4 lowercase">
            reggelre és estére, együtt.
          </h2>
          <p className="prose-serif mt-5 text-muted">{bundle.summary}</p>
          <Price
            amount={bundle.price}
            compareAt={bundleListPrice(bundle)}
            className="mt-7 text-[1.625rem]"
          />
          <p className="mt-1 text-sm text-muted">
            {formatPrice(bundleSaving(bundle))} megtakarítás a külön vásárláshoz képest
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
            <AddToCartButton productId="bundle" label="Páros csomag a kosárba" />
            <Link href="/paros-csomag" className="link-line text-[0.9375rem]">
              Részletek
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Rövid átvezető a márkatörténet oldalra. */
export function StoryTeaser() {
  return (
    <section className="wrap" aria-labelledby="tortenet-atvezeto">
      <div className="grid gap-x-10 gap-y-8 border-t border-line pt-14 lg:grid-cols-12 lg:pt-20">
        <h2 id="tortenet-atvezeto" className="display-lg lowercase lg:col-span-7">
          egy dolog, a helyén.
        </h2>
        <div className="lg:col-span-4 lg:col-start-9">
          <p className="lead text-muted">
            A mono kevés elemből áll: üveg, pipetta, papír és egy vonal. Arról, hogy miért épp
            ezekből, a történet oldalon írunk.
          </p>
          <Link href="/tortenet" className="btn btn-outline mt-7">
            A mono története
          </Link>
        </div>
      </div>
    </section>
  );
}
