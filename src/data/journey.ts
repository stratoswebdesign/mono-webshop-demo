/**
 * A főoldali termékutazás fejezetei és szövegei.
 * Csak a megjelenésről és a tényszerű jellemzőkről szólnak.
 */
import type { ProductId, Tone } from "./products";

export interface JourneyChapter {
  id: string;
  /** A görgetés mely szakaszán aktív (0..1). */
  from: number;
  to: number;
  label: string;
  statement: string;
  text?: string;
  tone: Tone;
  /** Melyik termék „van kéznél” a vásárlósávban. */
  product: ProductId;
  /** Kép a WebGL nélküli (álló) változathoz. */
  image: string;
  imageAlt: string;
}

export const journeyChapters: JourneyChapter[] = [
  {
    id: "nyitany",
    from: 0,
    to: 0.13,
    label: "mono menthol drops · 30 ml",
    statement: "egy üveg.\negy mozdulat.",
    text: "Folyékony étrend-kiegészítő a reggeli rutinhoz.",
    tone: "day",
    product: "classic",
    image: "/journey/reggel-still.webp",
    imageAlt: "mono menthol drops üveg kőpulton, a falon reggeli napfénnyel",
  },
  {
    id: "uveg",
    from: 0.13,
    to: 0.33,
    label: "Borostyánüveg",
    statement: "a fényben felmelegszik.",
    text: "30 ml-es, borostyánbarna cseppentős üveg, vastag talppal. Oldalfényben borostyán fényfoltot vet a pultra.",
    tone: "day",
    product: "classic",
    image: "/images/reggel-macro-base.webp",
    imageAlt: "A borostyánüveg talpa közelről, benne a pipetta vége",
  },
  {
    id: "vonal",
    from: 0.33,
    to: 0.51,
    label: "A vonal",
    statement: "nem nyomat.\ndombornyomás.",
    text: "A szabálytalan vonal a papírból emelkedik ki: a fény rajzolja meg, és az ujjad is megtalálja.",
    tone: "day",
    product: "classic",
    image: "/images/reggel-macro-label.webp",
    imageAlt: "A papírcímke dombornyomott vonala közelről",
  },
  {
    id: "pipetta",
    from: 0.51,
    to: 0.69,
    label: "Pipetta",
    statement: "csavarod, szív, cseppent.",
    text: "Fekete, bordázott kupak, gumipipetta, benne üvegcső.",
    tone: "day",
    product: "classic",
    image: "/images/reggel-macro-cap.webp",
    imageAlt: "A bordázott fekete kupak és a gumipipetta közelről",
  },
  {
    id: "este",
    from: 0.69,
    to: 0.91,
    label: "mono sleep · 30 ml",
    statement: "aztán este lesz.",
    text: "Ugyanaz az üveg, mély erdőzöld címkével – az éjjeliszekrényen, lámpafényben.",
    tone: "night",
    product: "sleep",
    image: "/journey/este-still.webp",
    imageAlt: "mono sleep üveg diófa éjjeliszekrényen, meleg lámpafényben",
  },
  {
    id: "paros",
    from: 0.91,
    to: 1.01,
    label: "Páros csomag",
    statement: "reggelre és estére.",
    text: "A két üveg együtt, a saját dobozában.",
    tone: "day",
    product: "bundle",
    image: "/journey/paros-still.webp",
    imageAlt: "mono menthol drops és mono sleep üveg egymás mellett",
  },
];

export function chapterAt(progress: number): number {
  const index = journeyChapters.findIndex((c) => progress >= c.from && progress < c.to);
  return index === -1 ? journeyChapters.length - 1 : index;
}
