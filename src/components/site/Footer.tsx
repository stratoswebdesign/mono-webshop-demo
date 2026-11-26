import Link from "next/link";
import { pendingContent, supplementNotice } from "@/data/pending";
import { mainNav, secondaryNav } from "@/data/site";
import { EmbossLine } from "./EmbossLine";
import { Logo } from "./Logo";

export function Footer() {
  const links = [...mainNav, ...secondaryNav, { href: "/kosar", label: "Kosár" }];
  return (
    <footer className="mt-24 lg:mt-40">
      <div className="wrap">
        <EmbossLine wide className="opacity-90" />
        <div className="grid gap-12 pb-12 pt-12 lg:grid-cols-[1fr_auto] lg:items-end lg:pt-16">
          <div>
            <Logo className="text-[2.25rem]" />
            <p className="copy mt-4 max-w-xs text-muted">
              Folyékony étrend-kiegészítők borostyánüvegben. Egy üveg reggelre, egy estére.
            </p>
          </div>
          <nav aria-label="Lábléc">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {links.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="label opacity-70 transition-opacity duration-500 hover:opacity-100">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex flex-col gap-2 border-t border-line py-6 text-[0.75rem] text-muted lg:flex-row lg:items-baseline lg:justify-between">
          <p className="max-w-2xl">{supplementNotice}</p>
          <p className="shrink-0">
            Demó webshop – rendelés és fizetés nem történik.
            {pendingContent.legal.text === null && " Jogi dokumentumok: véglegesítésre várnak."}
          </p>
        </div>
      </div>
    </footer>
  );
}
