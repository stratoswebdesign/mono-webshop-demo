"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TotalsRows } from "@/components/shop/CartParts";
import { shopConfig } from "@/data/shop-config";
import { cartActions, useCart } from "@/lib/commerce/cart-store";
import {
  emptyCheckoutValues,
  placeDemoOrder,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutValues,
} from "@/lib/commerce/checkout";
import { formatPrice } from "@/lib/commerce/format";

type TextField = Exclude<keyof CheckoutValues, "demoAck">;

/** A mezők sorrendje – hibánál az első hibás mezőre ugrik a fókusz. */
const FIELD_ORDER: (keyof CheckoutValues)[] = [
  "email",
  "phone",
  "lastName",
  "firstName",
  "zip",
  "city",
  "address",
  "demoAck",
];

export function CheckoutView() {
  const router = useRouter();
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const { totals, hydrated } = useCart();
  // A beírt adatok csak ebben az állapotban élnek: nincs tárolás, nincs hálózati küldés.
  const [values, setValues] = useState<CheckoutValues>(emptyCheckoutValues);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitting, setSubmitting] = useState(false);

  if (!hydrated) {
    return <p className="mt-10 text-muted" aria-live="polite">A pénztár betöltése…</p>;
  }

  if (totals.itemCount === 0 && !submitting) {
    return (
      <div className="mt-10 max-w-xl">
        <p className="lead text-muted">A pénztárhoz előbb tegyél valamit a kosárba.</p>
        <Link href="/termekek" className="btn btn-primary mt-8">
          Termékek megtekintése
        </Link>
      </div>
    );
  }

  const fieldId = (name: keyof CheckoutValues) => `${formId}-${name}`;

  const set = (name: TextField) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((current) => ({ ...current, [name]: event.target.value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateCheckout(values);
    setErrors(nextErrors);
    const firstInvalid = FIELD_ORDER.find((name) => nextErrors[name]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(fieldId(firstInvalid))}`)?.focus();
      return;
    }
    setSubmitting(true);
    placeDemoOrder(totals, values);
    cartActions.clear();
    router.push("/rendeles/visszaigazolas");
  };

  const field = (
    name: TextField,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
    className?: string,
  ) => (
    <div className={className}>
      <label htmlFor={fieldId(name)} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={fieldId(name)}
        name={name}
        value={values[name]}
        onChange={set(name)}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${fieldId(name)}-hiba` : undefined}
        className="field-input"
        {...props}
      />
      {errors[name] && (
        <p id={`${fieldId(name)}-hiba`} className="field-error mt-1.5 text-sm">
          {errors[name]}
        </p>
      )}
    </div>
  );

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <div className="mt-10 grid gap-x-16 gap-y-12 lg:grid-cols-12">
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="lg:col-span-7">
        <p className="border-l-2 border-notice py-1 pl-4 text-[0.9375rem]">
          Ez egy demó pénztár. Rendelés nem jön létre, fizetés nem történik, bankkártyaadatot nem
          kérünk. A beírt adatokat nem tároljuk és nem továbbítjuk – az oldal bezárásával eltűnnek.
        </p>

        {errorCount > 0 && (
          <p role="alert" className="field-error mt-6 text-[0.9375rem] font-medium">
            {errorCount} mezőt még javítani kell a rendelés leadásához.
          </p>
        )}

        <fieldset className="mt-10">
          <legend className="display-md lowercase">kapcsolat</legend>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {field("email", "E-mail-cím", { type: "email", autoComplete: "email", inputMode: "email" })}
            {field("phone", "Telefonszám", {
              type: "tel",
              autoComplete: "tel",
              inputMode: "tel",
              placeholder: "+36 30 123 4567",
            })}
          </div>
        </fieldset>

        <fieldset className="mt-12">
          <legend className="display-md lowercase">szállítási cím</legend>
          <div className="mt-6 grid gap-5 sm:grid-cols-6">
            {field("lastName", "Vezetéknév", { autoComplete: "family-name" }, "sm:col-span-3")}
            {field("firstName", "Keresztnév", { autoComplete: "given-name" }, "sm:col-span-3")}
            {field(
              "zip",
              "Irányítószám",
              { autoComplete: "postal-code", inputMode: "numeric", maxLength: 4 },
              "sm:col-span-2",
            )}
            {field("city", "Település", { autoComplete: "address-level2" }, "sm:col-span-4")}
            {field("address", "Utca, házszám", { autoComplete: "street-address" }, "sm:col-span-6")}
            <div className="sm:col-span-6">
              <label htmlFor={fieldId("note")} className="mb-1.5 block text-sm font-medium">
                Megjegyzés a futárnak <span className="font-normal text-muted">(nem kötelező)</span>
              </label>
              <textarea
                id={fieldId("note")}
                name="note"
                rows={3}
                value={values.note}
                onChange={set("note")}
                className="field-input resize-y"
              />
            </div>
          </div>
        </fieldset>

        <section className="mt-12" aria-labelledby={`${formId}-szallitas`}>
          <h2 id={`${formId}-szallitas`} className="display-md lowercase">
            szállítás és fizetés
          </h2>
          <dl className="mt-6 divide-y divide-line border-y border-line text-[0.9375rem]">
            <div className="flex justify-between gap-6 py-4">
              <dt>{shopConfig.shipping.label}</dt>
              <dd className="tabular-nums">
                {totals.shippingFee === 0 ? "Ingyenes" : formatPrice(totals.shippingFee)}
              </dd>
            </div>
            <div className="flex justify-between gap-6 py-4">
              <dt>Fizetés</dt>
              <dd className="text-right text-muted">A demóban nincs fizetés</dd>
            </div>
          </dl>
        </section>

        <div className="mt-8">
          <label className="flex items-start gap-3">
            <input
              id={fieldId("demoAck")}
              type="checkbox"
              checked={values.demoAck}
              onChange={(event) => {
                setValues((current) => ({ ...current, demoAck: event.target.checked }));
                setErrors((current) => ({ ...current, demoAck: undefined }));
              }}
              aria-invalid={errors.demoAck ? true : undefined}
              aria-describedby={errors.demoAck ? `${fieldId("demoAck")}-hiba` : undefined}
              className="mt-1 h-5 w-5 shrink-0 accent-[var(--accent)]"
            />
            <span className="text-[0.9375rem]">
              Tudomásul veszem, hogy ez demó rendelés: terméket nem kapok, és fizetnem sem kell.
            </span>
          </label>
          {errors.demoAck && (
            <p id={`${fieldId("demoAck")}-hiba`} className="field-error mt-1.5 text-sm">
              {errors.demoAck}
            </p>
          )}
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary mt-8 w-full sm:w-auto">
          {submitting ? "Demó rendelés rögzítése…" : "Demó rendelés leadása"}
        </button>
      </form>

      <aside aria-label="Rendelés összesítése" className="lg:col-span-5 xl:col-span-4 xl:col-start-9">
        <div className="bg-surface p-6 lg:sticky lg:top-24">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-medium">A rendelésed</h2>
            <Link href="/kosar" className="link-line text-sm">
              Módosítás
            </Link>
          </div>
          <ul className="mt-5 divide-y divide-line border-y border-line text-[0.9375rem]">
            {totals.lines.map((line) => (
              <li key={line.product.id} className="flex justify-between gap-4 py-3">
                <span>
                  {line.product.name}
                  <span className="text-muted tabular-nums"> × {line.quantity}</span>
                </span>
                <span className="shrink-0 tabular-nums">{formatPrice(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <TotalsRows totals={totals} className="mt-5" />
        </div>
      </aside>
    </div>
  );
}
