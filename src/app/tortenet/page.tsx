import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PendingNote } from "@/components/shop/PendingNote";
import { asset } from "@/lib/asset";
import { getBundle } from "@/lib/commerce/catalog";

export const metadata: Metadata = {
  title: "Történet",
  description: "Üveg, pipetta, papír és egy vonal – a mono felépítése.",
};

export default function StoryPage() {
  const bundle = getBundle();
  return (
    <>
      <section className="wrap pb-20 pt-36 lg:pb-32 lg:pt-52">
        <p className="label rise text-muted">A mono-ról</p>
        <h1 className="statement-lg rise mt-4 lowercase" style={{ "--i": 1 } as React.CSSProperties}>
          egy dolog, a helyén.
        </h1>
        <p className="lede rise mt-8 max-w-md text-muted" style={{ "--i": 2 } as React.CSSProperties}>
          Egy üveg, egy napszak. A mono két terméke ugyanarra az egyszerű gondolatra épül: reggel az
          egyik, este a másik – és egyiket sem kell elrakni, mert jó ránézni.
        </p>
      </section>

      {/* A vonal */}
      <section aria-labelledby="vonal-cim" className="relative flex min-h-[86svh] items-end overflow-hidden">
        <Image
          src={asset("/images/reggel-macro-label.webp")}
          alt="A papírcímke dombornyomott vonala közelről"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="wrap relative pb-10 pt-40 lg:pb-14">
          <div className="on-image max-w-[21rem]">
            <p className="label">A vonal</p>
            <h2 id="vonal-cim" className="statement-lg mt-3 whitespace-pre-line lowercase">
              {"nem nyomat.\ndombornyomás."}
            </h2>
            <p className="copy mt-4 opacity-85">
              A címkén és a dobozon ugyanaz a szabálytalan vonal fut végig. Színe nincs, a papírból
              emelkedik ki – ezért a fény rajzolja meg, és az ujjad is megtalálja.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap grid gap-x-20 gap-y-10 py-24 lg:grid-cols-2 lg:py-40" aria-labelledby="anyag-cim">
        <h2 id="anyag-cim" className="statement lowercase">
          kevés elem.
        </h2>
        <div className="max-w-md">
          <div className="copy space-y-4 text-muted">
            <p>
              Borostyánbarna cseppentős üveg, fekete pipettás kupak, texturált papírcímke és
              -doboz. A címkén a név, a termék, a megnevezés és a kiszerelés áll – más nem.
            </p>
            <p>
              A két terméket a címke színe különbözteti meg: a menthol drops törtfehér, a sleep
              mély erdőzöld.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/reggel" className="btn btn-outline">
              A reggel
            </Link>
            <Link href="/este" className="btn btn-outline">
              Az este
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="A két üveg" className="relative min-h-[80svh] overflow-hidden">
        <Image src={asset(bundle.heroImage.src)} alt={bundle.heroImage.alt} fill sizes="100vw" className="object-cover" />
      </section>

      <section className="wrap grid gap-x-20 gap-y-8 pt-24 lg:grid-cols-2 lg:pt-40" aria-labelledby="hatter-cim">
        <h2 id="hatter-cim" className="statement lowercase">
          kik állnak a mono mögött
        </h2>
        <div className="max-w-md space-y-6">
          <PendingNote field="brandStory" />
          <PendingNote field="company" />
        </div>
      </section>
    </>
  );
}
