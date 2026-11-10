"use client";

/**
 * Kosártároló: a böngésző localStorage-ában őrzi a kosár tartalmát
 * (csak termékazonosító + mennyiség, személyes adat nincs benne).
 *
 * WooCommerce-átálláskor a `cartActions` belseje cserélhető a Store API
 * hívásaira – a komponensek csak a `useCart()` hookot és az akciókat ismerik.
 */
import { useMemo, useSyncExternalStore } from "react";
import type { ProductId } from "@/data/products";
import {
  addItem,
  computeTotals,
  convertPairsToBundle,
  emptyCart,
  removeItem,
  sanitizeCart,
  setQuantity,
  type Cart,
} from "./cart";

const STORAGE_KEY = "mono.cart.v1";

let cart: Cart = emptyCart;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function parse(value: string | null): Cart {
  try {
    return sanitizeCart(JSON.parse(value ?? "null"));
  } catch {
    return emptyCart;
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    cart = parse(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    // Letiltott tároló (pl. privát mód): a kosár a munkamenet idejére a memóriában él.
  }
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    cart = parse(event.newValue);
    emit();
  });
}

function commit(next: Cart) {
  if (next === cart) return;
  cart = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // lásd fent
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Cart {
  ensureLoaded();
  return cart;
}

function getServerSnapshot(): Cart {
  return emptyCart;
}

export const cartActions = {
  add(productId: ProductId, quantity = 1) {
    commit(addItem(getSnapshot(), productId, quantity));
  },
  setQuantity(productId: ProductId, quantity: number) {
    commit(setQuantity(getSnapshot(), productId, quantity));
  },
  remove(productId: ProductId) {
    commit(removeItem(getSnapshot(), productId));
  },
  convertPairsToBundle() {
    commit(convertPairsToBundle(getSnapshot()));
  },
  clear() {
    commit(emptyCart);
  },
};

const noopSubscribe = () => () => {};

/** Igaz, ha a komponens már a böngészőben él (a kosár beolvasható). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function useCart() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useHydrated();
  const totals = useMemo(() => computeTotals(current), [current]);
  return { cart: current, totals, hydrated };
}
