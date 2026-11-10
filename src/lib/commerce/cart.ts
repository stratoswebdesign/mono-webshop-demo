/**
 * Kosárlogika – tiszta függvények, felület és tárolás nélkül.
 * A számítások tesztjei: cart.test.ts
 */
import { shopConfig, type ShippingConfig } from "@/data/shop-config";
import type { Product, ProductId } from "@/data/products";
import { bundleSaving, getBundle, getProduct, isProductId } from "./catalog";

export interface CartLine {
  productId: ProductId;
  quantity: number;
}

export interface Cart {
  lines: CartLine[];
}

export const emptyCart: Cart = { lines: [] };

const MAX = shopConfig.maxQuantityPerLine;

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 0;
  return Math.min(MAX, Math.max(0, Math.floor(quantity)));
}

export function addItem(cart: Cart, productId: ProductId, quantity = 1): Cart {
  const existing = cart.lines.find((l) => l.productId === productId);
  if (!existing) {
    const q = clampQuantity(quantity);
    return q > 0 ? { lines: [...cart.lines, { productId, quantity: q }] } : cart;
  }
  return setQuantity(cart, productId, existing.quantity + quantity);
}

/** 0 vagy kisebb mennyiség eltávolítja a sort. */
export function setQuantity(cart: Cart, productId: ProductId, quantity: number): Cart {
  const q = clampQuantity(quantity);
  if (q === 0) return removeItem(cart, productId);
  return {
    lines: cart.lines.map((l) => (l.productId === productId ? { ...l, quantity: q } : l)),
  };
}

export function removeItem(cart: Cart, productId: ProductId): Cart {
  return { lines: cart.lines.filter((l) => l.productId !== productId) };
}

/** Tárolóból visszaolvasott, nem megbízható adat ellenőrzése. */
export function sanitizeCart(raw: unknown): Cart {
  const rawLines = (raw as { lines?: unknown } | null)?.lines;
  if (!Array.isArray(rawLines)) return emptyCart;
  let cart = emptyCart;
  for (const line of rawLines) {
    const id = (line as CartLine | null)?.productId;
    const quantity = Number((line as CartLine | null)?.quantity);
    if (isProductId(id) && quantity > 0) cart = addItem(cart, id, quantity);
  }
  return cart;
}

function quantityOf(cart: Cart, productId: ProductId): number {
  return cart.lines.find((l) => l.productId === productId)?.quantity ?? 0;
}

/**
 * Ha a kosárban külön szerepel a csomag minden eleme, hány csomaggá
 * vonható össze, és mennyit spórol vele a vásárló.
 */
export function bundleSuggestion(cart: Cart): { pairs: number; saving: number } | null {
  const bundle = getBundle();
  const pairs = Math.min(...bundle.contains.map((id) => quantityOf(cart, id)));
  const room = MAX - quantityOf(cart, "bundle");
  const usable = Math.min(pairs, room);
  const saving = usable * bundleSaving(bundle);
  return usable > 0 && saving > 0 ? { pairs: usable, saving } : null;
}

/** A külön betett párokat páros csomagra cseréli. */
export function convertPairsToBundle(cart: Cart): Cart {
  const suggestion = bundleSuggestion(cart);
  if (!suggestion) return cart;
  let next = cart;
  for (const id of getBundle().contains) {
    next = setQuantity(next, id, quantityOf(next, id) - suggestion.pairs);
  }
  return addItem(next, "bundle", suggestion.pairs);
}

export interface CartTotalsLine {
  product: Product;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CartTotals {
  lines: CartTotalsLine[];
  /** Összes darabszám. */
  itemCount: number;
  /** Termékek összege (a csomag már csomagáron). */
  subtotal: number;
  /** A csomagárból adódó megtakarítás – tájékoztató adat, a részösszeg már tartalmazza. */
  bundleSavings: number;
  shippingFee: number;
  /** Ennyi hiányzik az ingyenes szállításhoz; `null`, ha nincs küszöb. */
  freeShippingRemaining: number | null;
  total: number;
}

export function computeTotals(
  cart: Cart,
  shipping: ShippingConfig = shopConfig.shipping,
): CartTotals {
  const lines = cart.lines.map((line) => {
    const product = getProduct(line.productId);
    return {
      product,
      quantity: line.quantity,
      unitPrice: product.price,
      lineTotal: product.price * line.quantity,
    };
  });

  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const bundleSavings = lines.reduce(
    (sum, l) => (l.product.kind === "bundle" ? sum + bundleSaving(l.product) * l.quantity : sum),
    0,
  );

  const threshold = shipping.freeThreshold;
  const qualifiesFree = threshold !== null && subtotal >= threshold;
  const shippingFee = itemCount === 0 || qualifiesFree ? 0 : shipping.fee;
  const freeShippingRemaining =
    threshold === null ? null : Math.max(0, threshold - subtotal);

  return {
    lines,
    itemCount,
    subtotal,
    bundleSavings,
    shippingFee,
    freeShippingRemaining,
    total: subtotal + shippingFee,
  };
}
