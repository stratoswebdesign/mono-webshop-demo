import type { Metadata } from "next";
import Link from "next/link";
import { PendingNote } from "@/components/shop/PendingNote";
import { faq } from "@/data/faq";

export const metadata: Metadata = {
  title: "Gyakori kérdések",
  description: "Kérdések és válaszok a mono termékeiről, a páros csomagról és a rendelésről.",
};

export default function FaqPage() {
  return (
    <div className="wrap pt-12 lg:pt-20">
      <div className="grid gap-x-14 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <h1 className="display-lg lowercase">gyakori kérdések</h1>
            <p className="lead mt-6 text-muted">Nem találod, amit keresel?</p>
            <Link href="/kapcsolat" className="btn btn-outline mt-6">
              Írj nekünk
            </Link>
          </div>
        </div>

        <div className="space-y-14 lg:col-span-7 lg:col-start-6">
          {faq.map((group) => (
            <section key={group.title} aria-labelledby={`gyik-${group.title}`}>
              <h2 id={`gyik-${group.title}`} className="eyebrow">
                {group.title}
              </h2>
              <div className="mt-4 border-t border-line">
                {group.items.map((item) => (
                  <details key={item.question} className="border-b border-line">
                    <summary className="flex items-start justify-between gap-6 py-5 text-[1.0625rem] font-medium">
                      {item.question}
                      <span aria-hidden="true" className="details-mark text-xl font-light leading-none">
                        +
                      </span>
                    </summary>
                    <div className="mb-6 max-w-2xl">
                      {item.answer && <p className="prose-serif text-muted">{item.answer}</p>}
                      {item.pending && <PendingNote field={item.pending} />}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
