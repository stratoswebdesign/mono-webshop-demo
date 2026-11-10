/**
 * Demó pénztár: mezőellenőrzés és demó rendelés.
 *
 * A megadott személyes adatok kizárólag a böngésző memóriájában élnek az
 * oldal újratöltéséig – nem kerülnek localStorage-ba, sütibe vagy hálózatra.
 * WooCommerce-átálláskor a `placeDemoOrder` helyére kerül a valódi
 * rendelésleadás.
 */
import type { CartTotals } from "./cart";

export interface CheckoutValues {
  email: string;
  lastName: string;
  firstName: string;
  phone: string;
  zip: string;
  city: string;
  address: string;
  note: string;
  demoAck: boolean;
}

export const emptyCheckoutValues: CheckoutValues = {
  email: "",
  lastName: "",
  firstName: "",
  phone: "",
  zip: "",
  city: "",
  address: "",
  note: "",
  demoAck: false,
};

export type CheckoutErrors = Partial<Record<keyof CheckoutValues, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateCheckout(values: CheckoutValues): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const v = {
    ...values,
    email: values.email.trim(),
    lastName: values.lastName.trim(),
    firstName: values.firstName.trim(),
    phone: values.phone.trim(),
    zip: values.zip.trim(),
    city: values.city.trim(),
    address: values.address.trim(),
  };

  if (!v.email) errors.email = "Add meg az e-mail-címed.";
  else if (!EMAIL.test(v.email)) errors.email = "Ez nem tűnik érvényes e-mail-címnek.";

  if (v.lastName.length < 2) errors.lastName = "Add meg a vezetékneved.";
  if (v.firstName.length < 2) errors.firstName = "Add meg a keresztneved.";

  const phoneDigits = v.phone.replace(/\D/g, "");
  if (!v.phone) errors.phone = "Add meg a telefonszámod.";
  else if (!/^[+\d\s()/-]+$/.test(v.phone) || phoneDigits.length < 9 || phoneDigits.length > 12)
    errors.phone = "Ellenőrizd a telefonszámot, például: +36 30 123 4567.";

  if (!v.zip) errors.zip = "Add meg az irányítószámot.";
  else if (!/^\d{4}$/.test(v.zip)) errors.zip = "Az irányítószám négy számjegyből áll.";

  if (v.city.length < 2) errors.city = "Add meg a települést.";

  if (v.address.length < 3) errors.address = "Add meg az utcát és a házszámot.";
  else if (!/\d/.test(v.address)) errors.address = "Add meg a házszámot is.";

  if (!values.demoAck) errors.demoAck = "A demó rendelés leadásához jelöld be ezt a mezőt.";

  return errors;
}

export interface DemoOrder {
  number: string;
  placedAt: Date;
  lines: { name: string; quantity: number; lineTotal: number }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  customer: Omit<CheckoutValues, "demoAck">;
}

let lastOrder: DemoOrder | null = null;

/** Demó rendelés: nem küld adatot sehová, csak a memóriában jegyzi fel. */
export function placeDemoOrder(totals: CartTotals, values: CheckoutValues): DemoOrder {
  const { demoAck: _demoAck, ...customer } = values;
  lastOrder = {
    number: `DEMO-${Math.floor(100000 + Math.random() * 900000)}`,
    placedAt: new Date(),
    lines: totals.lines.map((l) => ({
      name: l.product.name,
      quantity: l.quantity,
      lineTotal: l.lineTotal,
    })),
    subtotal: totals.subtotal,
    shippingFee: totals.shippingFee,
    total: totals.total,
    customer,
  };
  return lastOrder;
}

export function getLastDemoOrder(): DemoOrder | null {
  return lastOrder;
}
