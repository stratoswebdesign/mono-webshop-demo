/**
 * Központi demóbeállítások.
 *
 * Minden érték ideiglenes és itt szerkeszthető. Az éles webshopban ezek a
 * WooCommerce beállításaiból (szállítási zónák, díjak) érkeznek majd.
 */
export const shopConfig = {
  /** Demó mód: nincs valódi rendelés, fizetés vagy adatküldés. */
  isDemo: true,

  shipping: {
    /** Megjelenített szállítási mód neve. */
    label: "Házhozszállítás futárral",
    /** Szállítási díj forintban (bruttó). */
    fee: 1490,
    /**
     * Ingyenes szállítás küszöbe forintban (bruttó részösszeg).
     * `null` értékkel az ingyenes szállítás kikapcsolható.
     */
    freeThreshold: 20000 as number | null,
  },

  /** Egy kosársorban megengedett legnagyobb mennyiség. */
  maxQuantityPerLine: 10,
} as const;

export type ShippingConfig = {
  label: string;
  fee: number;
  freeThreshold: number | null;
};
