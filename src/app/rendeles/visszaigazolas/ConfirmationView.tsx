"use client";

import Link from "next/link";
import { EmbossLine } from "@/components/site/EmbossLine";
import { useHydrated } from "@/lib/commerce/cart-store";
import { getLastDemoOrder } from "@/lib/commerce/checkout";
import { formatPrice } from "@/lib/commerce/format";

export function ConfirmationView() {
  const hydrated = useHydrated();
  if (!hydrated) return <p className="text-muted">Betöltés…</p>;

  const order = getLastDemoOrder();

  if (!order) {
    return (
      <div className="max-w-2xl">
        <p className="eyebrow">Demó rendelés</p>
        <h1 className="display-lg mt-3 lowercase">itt nincs megjeleníthető rendelés.</h1>
        <p className="lead mt-6 text-muted">
          A demó rendelések adatait nem tároljuk, ezért az oldal újratöltése után a visszaigazolás
          már nem érhető el. Valódi rendelés nem jött létre.
        </p>
        <Link href="/termekek" className="btn btn-primary mt-8">
          Vissza a termékekhez
        </Link>
      </div>
    );
  }

  const { customer } = order;

  return (
    <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <p className="eyebrow">Demó rendelés · {order.number}</p>
        <h1 className="display-lg mt-3">köszönjük, {customer.firstName.trim()}.</h1>
        <p className="lead mt-6 max-w-xl text-muted">
          A demó rendelésed végigment a folyamaton. Ez csak bemutató: valódi rendelés nem jött
          létre, fizetés nem történt, és e-mailt sem küldtünk.
        </p>
        <EmbossLine className="mt-10 h-24 w-full max-w-md" />

        <dl className="mt-10 grid gap-8 text-[0.9375rem] sm:grid-cols-2">
          <div>
            <dt className="eyebrow">Kapcsolat</dt>
            <dd className="mt-2 break-words">
              {customer.email.trim()}
              <br />
              {customer.phone.trim()}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Szállítási cím</dt>
            <dd className="mt-2">
              {customer.lastName.trim()} {customer.firstName.trim()}
              <br />
              {customer.zip.trim()} {customer.city.trim()}
              <br />
              {customer.address.trim()}
            </dd>
          </div>
        </dl>
        <p className="mt-8 max-w-xl text-sm text-muted">
          Ezek az adatok csak ennek az oldalnak a memóriájában élnek. Újratöltés vagy bezárás után
          nyomtalanul eltűnnek.
        </p>
        <Link href="/" className="btn btn-outline mt-8">
          Vissza a főoldalra
        </Link>
      </div>

      <aside aria-label="A demó rendelés tételei" className="lg:col-span-5 xl:col-span-4 xl:col-start-9">
        <div className="bg-surface p-6">
          <h2 className="text-lg font-medium">Tételek</h2>
          <ul className="mt-5 divide-y divide-line border-y border-line text-[0.9375rem]">
            {order.lines.map((line) => (
              <li key={line.name} className="flex justify-between gap-4 py-3">
                <span>
                  {line.name}
                  <span className="text-muted tabular-nums"> × {line.quantity}</span>
                </span>
                <span className="shrink-0 tabular-nums">{formatPrice(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2.5 text-[0.9375rem]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Részösszeg</dt>
              <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Szállítás</dt>
              <dd className="tabular-nums">
                {order.shippingFee === 0 ? "Ingyenes" : formatPrice(order.shippingFee)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-line pt-4 text-lg font-medium">
              <dt>Összesen</dt>
              <dd className="tabular-nums">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
