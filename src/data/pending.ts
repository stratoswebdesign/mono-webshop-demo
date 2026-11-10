/**
 * Véglegesítésre váró szakmai és jogi tartalmak – egyetlen központi lista.
 *
 * A demó szándékosan NEM tartalmaz kitalált összetevőt, adagolást, hatást,
 * cégadatot vagy elérhetőséget. Amíg egy mező `text` értéke `null`, a felület
 * jól látható „Véglegesítésre vár” jelölést mutat a helyén.
 *
 * Véglegesítéskor elég itt kitölteni a `text` mezőt (vagy a WooCommerce-ből
 * érkező adatra cserélni) – a komponensekhez nem kell hozzányúlni.
 */
export type PendingKey =
  | "ingredients"
  | "dosage"
  | "warnings"
  | "storage"
  | "nutrition"
  | "company"
  | "contact"
  | "legal"
  | "payment"
  | "delivery"
  | "brandStory";

export interface PendingField {
  /** A mező megnevezése a felületen. */
  label: string;
  /** Mit kell még pótolni – a vásárló számára is érthető megfogalmazásban. */
  note: string;
  /** A végleges, jóváhagyott szöveg. `null` = még nincs. */
  text: string | null;
}

export const pendingContent: Record<PendingKey, PendingField> = {
  ingredients: {
    label: "Összetevők",
    note: "A jóváhagyott összetevőlista feltöltés alatt áll.",
    text: null,
  },
  dosage: {
    label: "Adagolás és használat",
    note: "A pontos adagolási útmutató feltöltés alatt áll. Addig a termék címkéjén szereplő útmutatás az irányadó.",
    text: null,
  },
  warnings: {
    label: "Figyelmeztetések",
    note: "A termékre vonatkozó figyelmeztetések és ellenjavallatok feltöltés alatt állnak.",
    text: null,
  },
  storage: {
    label: "Tárolás és eltarthatóság",
    note: "A tárolási útmutató és az eltarthatósági adatok feltöltés alatt állnak.",
    text: null,
  },
  nutrition: {
    label: "Hatóanyag-tartalom",
    note: "A napi adagra vetített hatóanyag-táblázat feltöltés alatt áll.",
    text: null,
  },
  company: {
    label: "Forgalmazó adatai",
    note: "A forgalmazó neve, székhelye és nyilvántartási adatai feltöltés alatt állnak.",
    text: null,
  },
  contact: {
    label: "Elérhetőségek",
    note: "Az ügyfélszolgálat e-mail-címe, telefonszáma és nyitvatartása feltöltés alatt áll.",
    text: null,
  },
  legal: {
    label: "Jogi dokumentumok",
    note: "Az általános szerződési feltételek és az adatkezelési tájékoztató feltöltés alatt áll.",
    text: null,
  },
  payment: {
    label: "Fizetési módok",
    note: "A választható fizetési módok az éles webshop indulásakor kerülnek fel.",
    text: null,
  },
  delivery: {
    label: "Szállítási idő",
    note: "A várható szállítási idő és a szállító partner az éles webshop indulásakor kerül fel.",
    text: null,
  },
  brandStory: {
    label: "A márka háttere",
    note: "Az alapítás története és a márka mögött állók bemutatása feltöltés alatt áll.",
    text: null,
  },
};

/**
 * Kötelező jelölés étrend-kiegészítőknél. Nem állítás a termékről, hanem
 * általános figyelmeztetés – az éles indulás előtt a teljes kötelező
 * szövegezést szakértővel kell véglegesíteni (lásd `warnings`).
 */
export const supplementNotice =
  "Az étrend-kiegészítő nem helyettesíti a kiegyensúlyozott, változatos étrendet és az egészséges életmódot.";
