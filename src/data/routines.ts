/**
 * A reggeli és az esti landing oldal szövegei és képei.
 * Csak a rutinról, a megjelenésről és a tényszerű jellemzőkről szólnak –
 * hatásra, összetételre vagy adagolásra vonatkozó állítás nincs bennük.
 */
import type { ProductImage, Variant } from "./products";

export interface Routine {
  eyebrow: string;
  title: string;
  intro: string;
  heroImage: ProductImage;
  /** A kép kivágásának súlypontja (CSS object-position). */
  heroFocus: string;
  moments: { title: string; text: string }[];
  secondImage: ProductImage;
  secondFocus: string;
  closing: { title: string; text: string };
  other: { question: string; label: string; href: string };
}

export const routines: Record<Variant, Routine> = {
  classic: {
    eyebrow: "Reggeli rutin",
    title: "a nap első mozdulata.",
    intro:
      "Felkel a nap, a fény oldalról éri a kőpultot. A mono menthol drops ott áll, ahol tegnap hagytad: kéznél, szem előtt.",
    heroImage: {
      src: "/images/reggel-napfeny.webp",
      alt: "mono menthol drops üveg kőpulton, a falon a felkelő nap fényével",
      width: 1122,
      height: 1402,
    },
    heroFocus: "50% 55%",
    moments: [
      {
        title: "Kéznél van",
        text: "Az üveg a mosdó mellett a helyén van. Nem kell keresni, és nem kell eldugni: a törtfehér címke a kő és a törölköző mellett is nyugodt marad.",
      },
      {
        title: "Egy mozdulat",
        text: "Lecsavarod a kupakot, a pipetta megtelik. Ennyi a rutin: rövid, és minden reggel ugyanaz.",
      },
      {
        title: "Aztán indul a nap",
        text: "Visszacsavarod, és mész tovább. Az üveg a pulton marad holnap reggelig.",
      },
    ],
    secondImage: {
      src: "/images/reggel-furdoszoba.webp",
      alt: "mono menthol drops üveg a fürdőszobai kőpulton, meleg fényben",
      width: 1122,
      height: 1402,
    },
    secondFocus: "40% 60%",
    closing: {
      title: "a pulton a helye.",
      text: "Borostyánbarna üveg, fekete pipettás kupak, törtfehér texturált címke. 30 ml.",
    },
    other: { question: "És este?", label: "Az esti rutin: mono sleep", href: "/este" },
  },

  sleep: {
    eyebrow: "Esti rutin",
    title: "a nap utolsó mozdulata.",
    intro:
      "Lekapcsolod a nagy lámpát, csak az éjjeli fény marad. A mono sleep a fa éjjeliszekrényen áll, a párna mellett.",
    heroImage: {
      src: "/images/este-ejjeliszekreny.webp",
      alt: "mono sleep üveg fa éjjeliszekrényen, mellette párna és vastag takaró",
      width: 1122,
      height: 1402,
    },
    heroFocus: "45% 55%",
    moments: [
      {
        title: "Halvány fényben is megvan",
        text: "A mély erdőzöld címke nem világít ki a sötétből, az üveg mégis kézre esik az éjjeliszekrény szélén.",
      },
      {
        title: "Egy mozdulat",
        text: "Lecsavarod a kupakot, a pipetta megtelik. Ennyi a rutin: rövid, és minden este ugyanaz.",
      },
      {
        title: "Aztán villanyoltás",
        text: "Visszacsavarod, leteszed. Az üveg az éjjeliszekrényen marad holnap estig.",
      },
    ],
    secondImage: {
      src: "/images/sleep-doboz.webp",
      alt: "mono sleep üveg a mély erdőzöld doboza előtt",
      width: 650,
      height: 940,
    },
    secondFocus: "50% 50%",
    closing: {
      title: "az éjjeliszekrényen a helye.",
      text: "Borostyánbarna üveg, fekete pipettás kupak, mély erdőzöld texturált címke. 30 ml.",
    },
    other: { question: "És reggel?", label: "A reggeli rutin: mono menthol drops", href: "/reggel" },
  },
};
