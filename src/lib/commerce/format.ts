const NBSP = " ";

/**
 * Forintösszeg formázása: 10990 → „10 990 Ft”.
 * Saját csoportosítás (nem Intl), hogy a szerver és a böngésző kimenete
 * karakterre azonos legyen.
 */
export function formatPrice(amount: number): string {
  const rounded = Math.round(amount);
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${rounded < 0 ? "−" : ""}${digits}${NBSP}Ft`;
}
