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
  /** A csomagolás (dobozok) fotója. */
  boxImage: ProductImage;
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
      src: "/images/reggel-close.webp",
      alt: "mono menthol drops üveg kőpulton, reggeli napfényben",
      width: 1500,
      height: 1950,
    },
    thumbImage: {
      src: "/images/reggel-close.webp",
      alt: "mono menthol drops üveg",
      width: 1500,
      height: 1950,
    },
    gallery: [
      {
        src: "/images/reggel-close.webp",
        alt: "mono menthol drops üveg közelről, reggeli fényben",
        width: 1500,
        height: 1950,
      },
      {
        src: "/images/reggel-macro-label.webp",
        alt: "A címke dombornyomott vonala közelről",
        width: 1800,
        height: 1200,
      },
      {
        src: "/images/reggel-macro-cap.webp",
        alt: "A bordázott kupak és a gumipipetta közelről",
        width: 1800,
        height: 1200,
      },
      {
        src: "/images/reggel-napfeny.webp",
        alt: "mono menthol drops üveg a fürdőszobai kőpulton, a falon ablakfénnyel",
        width: 1122,
        height: 1402,
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
      src: "/images/este-close.webp",
      alt: "mono sleep üveg diófa éjjeliszekrényen, lámpafényben",
      width: 1500,
      height: 1950,
    },
    thumbImage: {
      src: "/images/este-close.webp",
      alt: "mono sleep üveg",
      width: 1500,
      height: 1950,
    },
    gallery: [
      {
        src: "/images/este-close.webp",
        alt: "mono sleep üveg közelről, esti lámpafényben",
        width: 1500,
        height: 1950,
      },
      {
        src: "/images/este-macro-label.webp",
        alt: "A mély erdőzöld címke dombornyomott vonala közelről",
        width: 1800,
        height: 1200,
      },
      {
        src: "/images/este-macro-cap.webp",
        alt: "A bordázott kupak és a gumipipetta közelről, esti fényben",
        width: 1800,
        height: 1200,
      },
      {
        src: "/images/este-ejjeliszekreny.webp",
        alt: "mono sleep üveg az éjjeliszekrényen, mellette párna és takaró",
        width: 1122,
        height: 1402,
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
      src: "/images/paros-close.webp",
      alt: "mono menthol drops és mono sleep üveg egymás mellett",
      width: 1500,
      height: 1950,
    },
    thumbImage: {
      src: "/images/paros-close.webp",
      alt: "A két mono üveg",
      width: 1500,
      height: 1950,
    },
    heroImage: {
      src: "/journey/paros-still.webp",
      alt: "mono menthol drops és mono sleep üveg egymás mellett, kőszínű háttér előtt",
      width: 2200,
      height: 2200,
    },
    boxImage: {
      src: "/images/paros-csomag.webp",
      alt: "A két üveg a dobozaikkal",
      width: 1568,
      height: 1003,
    },
  },
};

/** Megjelenítési sorrend a terméklistában. */
export const productOrder: ProductId[] = ["classic", "sleep", "bundle"];
