import { PendingNote } from "@/components/shop/PendingNote";
import { pendingContent, supplementNotice } from "@/data/pending";
import type { SingleProduct } from "@/data/products";

/** Tényszerű jellemzők + a véglegesítésre váró szakmai mezők. */
export function ProductDetails({ product }: { product: SingleProduct }) {
  return (
    <section className="wrap mt-24 lg:mt-36" aria-labelledby="termekadatok">
      <div className="grid gap-x-16 gap-y-14 border-t border-line pt-14 lg:grid-cols-12 lg:pt-20">
        <div className="lg:col-span-5">
          <h2 id="termekadatok" className="display-md lowercase">
            termékjellemzők
          </h2>
          <dl className="mt-7 divide-y divide-line border-y border-line text-[0.9375rem]">
            {product.facts.map((fact) => (
              <div key={fact.label} className="grid grid-cols-[8.5rem_1fr] gap-4 py-3.5">
                <dt className="text-muted">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <h2 className="display-md lowercase">összetétel és használat</h2>
          <div className="mt-7 border-t border-line">
            {product.pending.map((key, index) => (
              <details key={key} className="group border-b border-line" open={index === 0}>
                <summary className="flex items-center justify-between gap-6 py-4 text-[1.0625rem] font-medium">
                  {pendingContent[key].label}
                  <span aria-hidden="true" className="details-mark text-xl font-light leading-none">
                    +
                  </span>
                </summary>
                <PendingNote field={key} className="mb-6" />
              </details>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">{supplementNotice}</p>
        </div>
      </div>
    </section>
  );
}
