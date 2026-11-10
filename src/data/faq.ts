/**
 * Gyakori kérdések. A válaszok csak ismert tényekre épülnek; ami még nincs
 * véglegesítve, az a központi pending listára mutat (`pending` kulcs).
 */
import type { PendingKey } from "./pending";
import { products } from "./products";
import { shopConfig } from "./shop-config";
import { formatPrice } from "@/lib/commerce/format";

export interface FaqItem {
  question: string;
  answer?: string;
  pending?: PendingKey;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

const { fee, freeThreshold, label } = shopConfig.shipping;
const saving = products.classic.price + products.sleep.price - products.bundle.price;

export const faq: FaqGroup[] = [
  {
    title: "A termékekről",
    items: [
      {
        question: "Mi a különbség a Klasszikus és a Sleep között?",
        answer:
          "A mono menthol drops (Klasszikus) törtfehér címkével a reggeli, a mono sleep mély erdőzöld címkével az esti rutinhoz készült. Mindkettő 30 ml-es folyékony étrend-kiegészítő borostyánbarna cseppentős üvegben. A pontos összetétel a termékoldalakon lesz olvasható, amint véglegesítettük.",
      },
      {
        question: "Mekkora egy üveg?",
        answer: "Mindkét termék 30 ml-es, pipettás kupakkal zárt üvegben, saját papírdobozban érkezik.",
      },
      { question: "Mit tartalmaznak a cseppek?", pending: "ingredients" },
      { question: "Hogyan kell használni?", pending: "dosage" },
      { question: "Hogyan tároljam, és meddig áll el?", pending: "storage" },
    ],
  },
  {
    title: "Páros csomag",
    items: [
      {
        question: "Mit tartalmaz a páros csomag?",
        answer: `Egy mono menthol drops és egy mono sleep üveget, mindkettőt a saját dobozában. A csomag ára ${formatPrice(products.bundle.price)}, ami ${formatPrice(saving)} megtakarítás a külön vásárláshoz képest.`,
      },
      {
        question: "Mi történik, ha külön teszem a kosárba a két üveget?",
        answer:
          "A kosár jelzi, hogy páros csomagként kedvezőbb, és egy kattintással át tudod váltani.",
      },
    ],
  },
  {
    title: "Rendelés és szállítás",
    items: [
      {
        question: "Mennyibe kerül a szállítás?",
        answer:
          `${label}: ${formatPrice(fee)}.` +
          (freeThreshold !== null ? ` ${formatPrice(freeThreshold)} feletti rendelésnél ingyenes.` : "") +
          " Ezek demóértékek, az éles webshop indulásáig változhatnak.",
      },
      { question: "Mennyi idő alatt érkezik meg a csomag?", pending: "delivery" },
      { question: "Hogyan fizethetek?", pending: "payment" },
      {
        question: "Ez most egy valódi webshop?",
        answer:
          "Még nem. Ez az oldal a mono webshop bemutató változata: a kosár és a pénztár végigpróbálható, de rendelés nem jön létre, fizetés nem történik, és a megadott adatokat nem tároljuk.",
      },
    ],
  },
];
