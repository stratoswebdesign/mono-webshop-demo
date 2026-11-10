"use client";

import { useId, useRef, useState } from "react";

type Values = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = { name: "", email: "", message: "" };
const ORDER: (keyof Values)[] = ["name", "email", "message"];

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = "Add meg a neved.";
  if (!values.email.trim()) errors.email = "Add meg az e-mail-címed.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
    errors.email = "Ez nem tűnik érvényes e-mail-címnek.";
  if (values.message.trim().length < 10) errors.message = "Írd le pár szóban, miben segíthetünk.";
  return errors;
}

/** Demó űrlap: ellenőriz, de nem küld és nem tárol semmit. */
export function ContactForm() {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div role="status" className="bg-surface p-8">
        <p className="eyebrow">Demó</p>
        <p className="display-md mt-3 lowercase">az űrlap rendben van.</p>
        <p className="prose-serif mt-4 text-muted">
          Ez a bemutató oldal nem küld üzenetet, ezért amit beírtál, nem jutott el senkihez, és
          nem is tároltuk. Az éles webshopban itt kapsz majd visszaigazolást.
        </p>
        <button
          type="button"
          className="btn btn-outline mt-6"
          onClick={() => {
            setValues(EMPTY);
            setDone(false);
          }}
        >
          Új üzenet írása
        </button>
      </div>
    );
  }

  const set = (name: keyof Values) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((current) => ({ ...current, [name]: event.target.value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const describedBy = (name: keyof Values) => (errors[name] ? `${id}-${name}-hiba` : undefined);
  const error = (name: keyof Values) =>
    errors[name] && (
      <p id={`${id}-${name}-hiba`} className="field-error mt-1.5 text-sm">
        {errors[name]}
      </p>
    );

  return (
    <form
      ref={form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const next = validate(values);
        setErrors(next);
        const firstInvalid = ORDER.find((name) => next[name]);
        if (firstInvalid) {
          form.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
          return;
        }
        setDone(true);
      }}
      className="space-y-5"
    >
      <div>
        <label htmlFor={`${id}-name`} className="mb-1.5 block text-sm font-medium">
          Név
        </label>
        <input
          id={`${id}-name`}
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={set("name")}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describedBy("name")}
          className="field-input"
        />
        {error("name")}
      </div>
      <div>
        <label htmlFor={`${id}-email`} className="mb-1.5 block text-sm font-medium">
          E-mail-cím
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={values.email}
          onChange={set("email")}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describedBy("email")}
          className="field-input"
        />
        {error("email")}
      </div>
      <div>
        <label htmlFor={`${id}-message`} className="mb-1.5 block text-sm font-medium">
          Üzenet
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={6}
          value={values.message}
          onChange={set("message")}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy("message")}
          className="field-input resize-y"
        />
        {error("message")}
      </div>
      <p className="text-sm text-muted">
        Demó űrlap: az üzenetet nem küldjük el, és a beírt adatokat nem tároljuk.
      </p>
      <button type="submit" className="btn btn-primary">
        Űrlap kipróbálása
      </button>
    </form>
  );
}
