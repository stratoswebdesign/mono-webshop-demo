/**
 * Központi demó termékadatok.
 *
 * Az árak, nevek és képek kizárólag innen származnak – a komponensekben nincs
 * beégetett ár. Az éles webshopban ezt a fájlt a WooCommerce termékadatai
 * váltják ki (lásd docs/woocommerce-atallas.md).
 */
import type { PendingKey } from "./pending";

export type ProductId = "classic" | "sleep" | "bundle";
/** A két önálló termék – a 3D címke és a hangulat (reggel/este) kulcsa is. */
export type Variant = "classic" | "sleep";
export type Tone = "day" | "night";

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface ProductBase {
  id: ProductId;
  /** URL-azonosító. */
  slug: string;
  /** Teljes terméknév, ahogy a csomagoláson szerepel. */
  name: string;
  /** Rövid megnevezés választókhoz, kosárhoz. */
  shortName: string;
  /** Bruttó demóár forintban. */
  price: number;
  /** Egysoros összefoglaló listákhoz. */
  summary: string;
  /** Kártyakép a terméklistához – környezetbe helyezett termék. */
  cardImage: ProductImage;
  /** A kártyakép kivágásának súlypontja (CSS object-position). */
  cardFocus?: string;
  /** Kis bélyegkép a kosárhoz – közeli termékfotó. */
  thumbImage: ProductImage;
}

export interface SingleProduct extends ProductBase {
  kind: "single";
  id: Variant;
  /** A címke második sora. */
  labelLine: string;
  tone: Tone;
  routine: { word: string; href: string; label: string };
  volume: string;
  description: string[];
  /** Tényszerű, a csomagolásról leolvasható jellemzők. */
  facts: { label: string; value: string }[];
  gallery: ProductImage[];
  /** Véglegesítésre váró szakmai mezők (lásd data/pending.ts). */
  pending: PendingKey[];
}

export interface BundleProduct extends ProductBase {
  kind: "bundle";
  id: "bundle";
  /** A csomag tartalma – termékazonosítók. */
  contains: Variant[];
  description: string[];
  heroImage: ProductImage;
}

export type Product = SingleProduct | BundleProduct;

const sharedFacts = [
  { label: "Kiszerelés", value: "30 ml" },
  { label: "Forma", value: "Folyékony étrend-kiegészítő, csepp" },
  { label: "Üveg", value: "Borostyánbarna cseppentős üveg" },
  { label: "Kupak", value: "Fekete pipettás kupak" },
];

const sharedPending: PendingKey[] = [
  "ingredients",
  "nutrition",
  "dosage",
  "warnings",
  "storage",
];

export const products: Record<ProductId, Product> = {
  classic: {
    kind: "single",
    id: "classic",
    slug: "menthol-drops",
    name: "mono menthol drops",
    shortName: "Klasszikus",
    labelLine: "menthol drops",
    price: 10990,
    tone: "day",
    routine: { word: "reggel", href: "/reggel", label: "Reggeli rutin" },
    volume: "30 ml",
    summary: "A reggeli rutin darabja. Törtfehér címke, borostyánüveg, pipetta.",
    description: [
      "A mono menthol drops folyékony étrend-kiegészítő 30 ml-es, borostyánbarna cseppentős üvegben.",
      "A törtfehér, texturált papírcímke és a dombornyomott vonal a fürdőszobapulton is a helyén van: nem kell elrakni, jó ránézni.",
    ],
    facts: [
      ...sharedFacts,
      { label: "Címke", value: "Törtfehér texturált papír, dombornyomott vonallal" },
      { label: "Doboz", value: "Törtfehér texturált papírdoboz" },
    ],
    cardImage: {
      src: "/images/reggel-napfeny.webp",
      alt: "mono menthol drops üveg kőpulton, reggeli napfényben",
      width: 1122,
      height: 1402,
    },
    cardFocus: "50% 60%",
    thumbImage: {
      src: "/images/klasszikus-doboz.webp",
      alt: "mono menthol drops üveg a törtfehér papírdoboza előtt",
      width: 650,
      height: 940,
    },
    gallery: [
      {
        src: "/images/reggel-napfeny.webp",
        alt: "mono menthol drops üveg kőpulton, reggeli napfényben",
        width: 1122,
        height: 1402,
      },
      {
        src: "/images/reggel-furdoszoba.webp",
        alt: "mono menthol drops üveg a fürdőszobai mosdó mellett",
        width: 1122,
        height: 1402,
      },
      {
        src: "/images/klasszikus-doboz.webp",
        alt: "mono menthol drops üveg és doboz",
        width: 650,
        height: 940,
      },
    ],
    pending: sharedPending,
  },

  sleep: {
    kind: "single",
    id: "sleep",
    slug: "sleep",
    name: "mono sleep",
    shortName: "Sleep",
    labelLine: "sleep",
    price: 11990,
    tone: "night",
    routine: { word: "este", href: "/este", label: "Esti rutin" },
    volume: "30 ml",
    summary: "Az esti rutin darabja. Mély erdőzöld címke, borostyánüveg, pipetta.",
    description: [
      "A mono sleep folyékony étrend-kiegészítő 30 ml-es, borostyánbarna cseppentős üvegben.",
      "A mély erdőzöld címke az esti rutinhoz készült: az éjjeliszekrényen, halvány lámpafényben is visszafogott marad.",
    ],
    facts: [
      ...sharedFacts,
      { label: "Címke", value: "Mély erdőzöld texturált papír, dombornyomott vonallal" },
      { label: "Doboz", value: "Mély erdőzöld texturált papírdoboz" },
    ],
    cardImage: {
      src: "/images/este-ejjeliszekreny.webp",
      alt: "mono sleep üveg fa éjjeliszekrényen, lámpafényben",
      width: 1122,
      height: 1402,
    },
    cardFocus: "45% 60%",
    thumbImage: {
      src: "/images/sleep-doboz.webp",
      alt: "mono sleep üveg a mély erdőzöld papírdoboza előtt",
      width: 650,
      height: 940,
    },
    gallery: [
      {
        src: "/images/este-ejjeliszekreny.webp",
        alt: "mono sleep üveg fa éjjeliszekrényen, lámpafényben",
        width: 1122,
        height: 1402,
      },
      {
        src: "/images/sleep-doboz.webp",
        alt: "mono sleep üveg és doboz",
        width: 650,
        height: 940,
      },
    ],
    pending: sharedPending,
  },

  bundle: {
    kind: "bundle",
    id: "bundle",
    slug: "paros-csomag",
    name: "mono páros csomag",
    shortName: "Páros csomag",
    price: 20990,
    contains: ["classic", "sleep"],
    summary: "Egy üveg reggelre, egy estére: menthol drops és sleep együtt.",
    description: [
      "A páros csomagban a két mono üveg együtt érkezik: a törtfehér címkés menthol drops a reggeli, a mély erdőzöld címkés sleep az esti rutinhoz.",
      "Mindkét üveg 30 ml-es, a saját dobozában.",
    ],
    cardImage: {
      src: "/images/paros-csomag.webp",
      alt: "mono menthol drops és mono sleep üveg a dobozaikkal",
      width: 1568,
      height: 1003,
    },
    thumbImage: {
      src: "/images/paros-csomag.webp",
      alt: "mono menthol drops és mono sleep üveg a dobozaikkal",
      width: 1568,
      height: 1003,
    },
    heroImage: {
      src: "/images/paros-csomag.webp",
      alt: "mono menthol drops és mono sleep üveg a dobozaikkal",
      width: 1568,
      height: 1003,
    },
  },
};

/** Megjelenítési sorrend a terméklistában. */
export const productOrder: ProductId[] = ["classic", "sleep", "bundle"];
