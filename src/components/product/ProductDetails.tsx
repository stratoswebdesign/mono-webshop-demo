import { PendingNote } from "@/components/shop/PendingNote";
import { pendingContent, supplementNotice } from "@/data/pending";
import type { SingleProduct } from "@/data/products";

/** Tényszerű jellemzők + a véglegesítésre váró szakmai mezők, lenyíló sorokban. */
export function ProductDetails({ product }: { product: SingleProduct }) {
  return (
    <div>
      <details className="border-t border-line" open>
        <summary className="label flex items-center justify-between gap-6 py-5">
          Termékjellemzők
          <span aria-hidden="true" className="details-mark text-base font-light leading-none">
            +
          </span>
        </summary>
        <dl className="mb-6 space-y-2.5">
          {product.facts.map((fact) => (
            <div key={fact.label} className="grid grid-cols-[7rem_1fr] gap-4">
              <dt className="text-muted">{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </details>
      {product.pending.map((key) => (
        <details key={key} className="border-t border-line">
          <summary className="label flex items-center justify-between gap-6 py-5">
            {pendingContent[key].label}
            <span aria-hidden="true" className="details-mark text-base font-light leading-none">
              +
            </span>
          </summary>
          <PendingNote field={key} className="mb-6" />
        </details>
      ))}
      <p className="border-t border-line pt-5 text-[0.8125rem] text-muted">{supplementNotice}</p>
    </div>
  );
}
