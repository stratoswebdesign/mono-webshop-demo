import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import { shopConfig } from "@/data/shop-config";
import {
  addItem,
  bundleSuggestion,
  computeTotals,
  convertPairsToBundle,
  emptyCart,
  removeItem,
  sanitizeCart,
  setQuantity,
} from "./cart";
import { bundleListPrice, bundleSaving } from "./catalog";
import { emptyCheckoutValues, validateCheckout } from "./checkout";
import { formatPrice } from "./format";

const classic = products.classic.price;
const sleep = products.sleep.price;
const bundle = products.bundle.price;
const shipping = { label: "teszt", fee: 1490, freeThreshold: 20000 };

describe("kosárműveletek", () => {
  it("új sort ad hozzá, meglévőnél növeli a mennyiséget", () => {
    let cart = addItem(emptyCart, "classic");
    cart = addItem(cart, "classic", 2);
    cart = addItem(cart, "sleep");
    expect(cart.lines).toEqual([
      { productId: "classic", quantity: 3 },
      { productId: "sleep", quantity: 1 },
    ]);
  });

  it("a mennyiséget a megengedett legnagyobb értéken megfogja", () => {
    const cart = addItem(emptyCart, "classic", 999);
    expect(cart.lines[0].quantity).toBe(shopConfig.maxQuantityPerLine);
  });

  it("nulla mennyiség eltávolítja a sort", () => {
    const cart = setQuantity(addItem(emptyCart, "sleep", 2), "sleep", 0);
    expect(cart.lines).toHaveLength(0);
  });

  it("eltávolítás után a többi sor megmarad", () => {
    const cart = removeItem(addItem(addItem(emptyCart, "classic"), "sleep"), "classic");
    expect(cart.lines).toEqual([{ productId: "sleep", quantity: 1 }]);
  });

  it("a tárolóból érkező hibás adatot kiszűri", () => {
    expect(sanitizeCart(null)).toEqual(emptyCart);
    expect(sanitizeCart({ lines: "x" })).toEqual(emptyCart);
    expect(
      sanitizeCart({
        lines: [
          { productId: "classic", quantity: 2 },
          { productId: "ismeretlen", quantity: 1 },
          { productId: "sleep", quantity: -3 },
          { productId: "bundle", quantity: "2" },
        ],
      }).lines,
    ).toEqual([
      { productId: "classic", quantity: 2 },
      { productId: "bundle", quantity: 2 },
    ]);
  });
});

describe("összesítés", () => {
  it("üres kosárnál minden nulla, szállítási díj sincs", () => {
    const totals = computeTotals(emptyCart, shipping);
    expect(totals).toMatchObject({ itemCount: 0, subtotal: 0, shippingFee: 0, total: 0 });
  });

  it("egy termék: részösszeg + szállítás", () => {
    const totals = computeTotals(addItem(emptyCart, "classic"), shipping);
    expect(totals.subtotal).toBe(classic);
    expect(totals.shippingFee).toBe(1490);
    expect(totals.total).toBe(classic + 1490);
    expect(totals.freeShippingRemaining).toBe(20000 - classic);
  });

  it("a küszöb elérésekor ingyenes a szállítás", () => {
    const totals = computeTotals(addItem(emptyCart, "classic", 2), shipping);
    expect(totals.subtotal).toBe(classic * 2);
    expect(totals.shippingFee).toBe(0);
    expect(totals.freeShippingRemaining).toBe(0);
    expect(totals.total).toBe(classic * 2);
  });

  it("pontosan a küszöbön már ingyenes", () => {
    const totals = computeTotals(addItem(emptyCart, "classic"), {
      ...shipping,
      freeThreshold: classic,
    });
    expect(totals.shippingFee).toBe(0);
  });

  it("küszöb nélkül mindig van szállítási díj", () => {
    const totals = computeTotals(addItem(emptyCart, "bundle", 3), {
      ...shipping,
      freeThreshold: null,
    });
    expect(totals.shippingFee).toBe(1490);
    expect(totals.freeShippingRemaining).toBeNull();
  });

  it("a páros csomag csomagáron számol, és jelzi a megtakarítást", () => {
    const totals = computeTotals(addItem(emptyCart, "bundle", 2), shipping);
    expect(totals.subtotal).toBe(bundle * 2);
    expect(totals.bundleSavings).toBe((classic + sleep - bundle) * 2);
    expect(totals.itemCount).toBe(2);
  });

  it("vegyes kosár összege", () => {
    let cart = addItem(emptyCart, "bundle");
    cart = addItem(cart, "sleep", 2);
    const totals = computeTotals(cart, shipping);
    expect(totals.subtotal).toBe(bundle + sleep * 2);
    expect(totals.total).toBe(bundle + sleep * 2);
  });

  it("a demóárakból számolt csomagkedvezmény", () => {
    expect(bundleListPrice()).toBe(classic + sleep);
    expect(bundleSaving()).toBe(classic + sleep - bundle);
  });
});

describe("páros csomagra váltás", () => {
  it("külön betett párnál felajánlja a csomagot", () => {
    let cart = addItem(emptyCart, "classic", 2);
    cart = addItem(cart, "sleep", 1);
    expect(bundleSuggestion(cart)).toEqual({ pairs: 1, saving: classic + sleep - bundle });
  });

  it("csak egyféle terméknél nincs ajánlat", () => {
    expect(bundleSuggestion(addItem(emptyCart, "classic", 3))).toBeNull();
  });

  it("a váltás a párokat csomagra cseréli, a maradékot meghagyja", () => {
    let cart = addItem(emptyCart, "classic", 3);
    cart = addItem(cart, "sleep", 2);
    const before = computeTotals(cart, shipping).subtotal;
    const next = convertPairsToBundle(cart);
    expect(next.lines).toEqual([
      { productId: "classic", quantity: 1 },
      { productId: "bundle", quantity: 2 },
    ]);
    const after = computeTotals(next, shipping).subtotal;
    expect(before - after).toBe((classic + sleep - bundle) * 2);
  });
});

describe("pénztár mezőellenőrzés", () => {
  const valid = {
    ...emptyCheckoutValues,
    email: "teszt@example.com",
    lastName: "Teszt",
    firstName: "Elek",
    phone: "+36 30 123 4567",
    zip: "1011",
    city: "Budapest",
    address: "Fő utca 1.",
    demoAck: true,
  };

  it("helyes adatoknál nincs hiba", () => {
    expect(validateCheckout(valid)).toEqual({});
  });

  it("üres űrlapnál minden kötelező mező hibát jelez", () => {
    const errors = validateCheckout(emptyCheckoutValues);
    expect(Object.keys(errors).sort()).toEqual(
      ["address", "city", "demoAck", "email", "firstName", "lastName", "phone", "zip"].sort(),
    );
  });

  it("hibás formátumokat jelez", () => {
    const errors = validateCheckout({
      ...valid,
      email: "teszt@",
      phone: "12",
      zip: "101",
      address: "Fő utca",
    });
    expect(Object.keys(errors).sort()).toEqual(["address", "email", "phone", "zip"]);
  });
});

describe("árformázás", () => {
  it("ezres tagolással, Ft jelöléssel", () => {
    expect(formatPrice(10990)).toBe("10 990 Ft");
    expect(formatPrice(990)).toBe("990 Ft");
    expect(formatPrice(1234567)).toBe("1 234 567 Ft");
    expect(formatPrice(0)).toBe("0 Ft");
  });
});
