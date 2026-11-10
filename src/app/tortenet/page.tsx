import type { Metadata } from "next";
import Link from "next/link";
import { PendingNote } from "@/components/shop/PendingNote";
import { EmbossLine } from "@/components/site/EmbossLine";
import { Photo } from "@/components/site/Photo";
import { getBundle } from "@/lib/commerce/catalog";

export const metadata: Metadata = {
  title: "Történet",
  description: "Üveg, pipetta, papír és egy vonal – a mono felépítése.",
};

export default function StoryPage() {
  return (
    <>
      <section className="wrap pt-12 lg:pt-24">
        <p className="eyebrow">A mono-ról</p>
        <h1 className="display-xl mt-5 max-w-5xl lowercase">
          egy dolog, <em className="font-serif font-normal italic tracking-[-0.02em]">a helyén.</em>
        </h1>
        <div className="mt-10 grid gap-x-14 gap-y-6 lg:mt-16 lg:grid-cols-12">
          <p className="lead lg:col-span-6 lg:col-start-7">
            Egy üveg, egy napszak. A mono két terméke ugyanarra az egyszerű gondolatra épül: reggel
            az egyik, este a másik – és egyiket sem kell elrakni, mert jó ránézni.
          </p>
        </div>
      </section>

      <section className="mt-20 bg-surface lg:mt-32" aria-labelledby="vonal-cim">
        <div
          className="wrap py-20 lg:py-32"
          style={{ "--emboss-face": "var(--surface)" } as React.CSSProperties}
        >
          <EmbossLine wide />
          <div className="mt-12 grid gap-x-14 gap-y-6 lg:grid-cols-12">
            <h2 id="vonal-cim" className="display-lg lowercase lg:col-span-5">
              a vonal.
            </h2>
            <div className="prose-serif space-y-4 text-muted lg:col-span-6 lg:col-start-7">
              <p>
                A címkén és a dobozon ugyanaz a szabálytalan vonal fut végig: az üvegről indul, és a
                dobozon folytatódik.
              </p>
              <p>
                Nem nyomat, hanem dombornyomás. Színe nincs, a papírból emelkedik ki – ezért a fény
                rajzolja meg, és az ujjad is megtalálja.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap mt-20 lg:mt-32" aria-labelledby="anyag-cim">
        <div className="grid items-center gap-x-14 gap-y-10 lg:grid-cols-12">
          <Photo
            image={getBundle().heroImage}
            sizes="(min-width: 1024px) 56vw, 100vw"
            className="aspect-[1568/1003] lg:col-span-7"
          />
          <div className="lg:col-span-5">
            <h2 id="anyag-cim" className="display-lg lowercase">
              kevés elem.
            </h2>
            <div className="prose-serif mt-6 space-y-4 text-muted">
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
        </div>
      </section>

      <section className="wrap mt-20 lg:mt-32" aria-labelledby="hatter-cim">
        <div className="grid gap-x-14 gap-y-8 border-t border-line pt-14 lg:grid-cols-12 lg:pt-20">
          <h2 id="hatter-cim" className="display-md lowercase lg:col-span-5">
            kik állnak a mono mögött
          </h2>
          <div className="space-y-6 lg:col-span-6 lg:col-start-7">
            <PendingNote field="brandStory" />
            <PendingNote field="company" />
          </div>
        </div>
      </section>
    </>
  );
}
