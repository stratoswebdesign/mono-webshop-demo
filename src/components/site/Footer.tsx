import Link from "next/link";
import { pendingContent, supplementNotice } from "@/data/pending";
import { mainNav, secondaryNav } from "@/data/site";
import { EmbossLine } from "./EmbossLine";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line lg:mt-36">
      <div className="wrap pt-14 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo className="text-[3.25rem]" />
            <p className="prose-serif mt-5 max-w-sm text-muted">
              Folyékony étrend-kiegészítők borostyánüvegben. Egy üveg reggelre, egy estére.
            </p>
          </div>

          <nav aria-label="Lábléc – termékek és oldalak" className="lg:col-span-3">
            <h2 className="eyebrow">Oldalak</h2>
            <ul className="mt-4 space-y-2.5">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-line">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Lábléc – segítség" className="lg:col-span-4">
            <h2 className="eyebrow">Segítség</h2>
            <ul className="mt-4 space-y-2.5">
              {secondaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-line">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/kosar" className="link-line">
                  Kosár
                </Link>
              </li>
            </ul>
            {pendingContent.legal.text === null && (
              <p className="mt-6 max-w-xs text-sm text-muted">
                {pendingContent.legal.label}: véglegesítésre vár.
              </p>
            )}
          </nav>
        </div>

        <EmbossLine wide className="mt-12" />

        <div className="flex flex-col gap-3 border-t border-line py-6 text-sm text-muted lg:flex-row lg:items-baseline lg:justify-between">
          <p className="max-w-2xl">{supplementNotice}</p>
          <p className="shrink-0">Demó webshop · nem valódi értékesítés</p>
        </div>
      </div>
    </footer>
  );
}
