# mono – webshopdemó

A mono étrend-kiegészítő márka végigkattintható webshopdemója: főoldal görgetéssel vezérelt 3D
termékutazással, terméklista, két termékoldal forgatható 3D nézettel, reggeli és esti landing,
páros csomag, történet, GYIK, kapcsolat, kosár, demó pénztár és demó visszaigazolás.

**Ez demó.** Nincs valódi rendelés, fizetés, e-mail-küldés vagy külső szolgáltatás. A pénztárban
megadott adatok csak a böngésző memóriájában élnek, újratöltéskor eltűnnek.

## Indítás

```bash
npm install
npm run dev        # http://localhost:3000
```

További parancsok:

```bash
npm test           # kosárszámítás, csomagár, szállítás, mezőellenőrzés tesztjei
npm run typecheck  # TypeScript-ellenőrzés
npm run build      # éles build
```

Technológia: Next.js (App Router) + TypeScript + Tailwind CSS v4, a 3D-hez Three.js
React Three Fiberrel, a modellhez és a jelenetekhez Blender.

## Hol mit találsz

| Mit szeretnél módosítani | Fájl |
| --- | --- |
| Árak, terméknevek, leírások, képek | `src/data/products.ts` |
| Szállítási díj, ingyenes szállítás küszöbe, max. mennyiség | `src/data/shop-config.ts` |
| **Véglegesítésre váró szakmai/jogi tartalmak** (összetevők, adagolás, cégadatok…) | `src/data/pending.ts` |
| A főoldali termékutazás fejezetei és szövegei | `src/data/journey.ts` |
| Reggeli és esti landing szövegei | `src/data/routines.ts` |
| GYIK | `src/data/faq.ts` |
| Navigáció | `src/data/site.ts` |
| Színek, tipográfia, a 3D színpad elhelyezése | `src/app/globals.css` |
| A dombornyomott vonalmotívum rajza | `src/lib/motif.ts` |
| A címke rajza (böngésző és Blender közös forrása) | `src/components/scene/label-art.ts` |
| Az üvegmodell, az anyagok és a jelenetek | `blender/` (lásd [blender/README.md](blender/README.md)) |

### Véglegesítésre váró tartalom

A demó szándékosan nem tartalmaz kitalált összetevőt, adagolást, hatást, értékelést, tanúsítványt
vagy cégadatot. Ami hiányzik, az a `src/data/pending.ts` központi listájában szerepel, és a
felületen „Véglegesítésre vár” jelölést kap. Ha egy mező `text` értékét kitöltöd, a jelölés
helyén automatikusan a végleges szöveg jelenik meg.

## Arculat

Csendes, képközpontú felület: teljes képernyős jelenetek, apró betű, sok üres tér. Két betűtípus:
Outfit (a csomagolás hangja – címkék, felület) és Cormorant Garamond (oldalanként egy-két halk
kijelentés). A reggel/este hangulat (`data-tone`) az egész oldal színeit váltja.

## Felépítés

```
blender/                az üvegmodell és a jelenetek forrása (Blender, Python)
public/
  models/               a böngészős üvegmodell (GLB)
  journey/              jelenetenként: háttér, kép az üveggel, panoráma
  images/               közeli renderek és a környezeti fotók
src/
  data/                 demóadatok (termékek, beállítások, szövegek, pending lista)
  lib/commerce/         kereskedelmi logika – a felülettől elkülönítve
    catalog.ts            termékek lekérdezése
    cart.ts               kosárszámítás (tiszta függvények) + cart.test.ts
    cart-store.ts         kosár tárolása (localStorage), useCart() hook
    checkout.ts           pénztár mezőellenőrzés, demó rendelés (csak memóriában)
    format.ts             árformázás
  components/
    scene/              valós idejű 3D: jelenet, kamera, üveganyagok, címke
    journey/            a főoldali termékutazás és a vásárlósáv
    shop/               kosár, termékcsempe, mennyiségválasztó, kosárba gomb
    site/               fejléc, lábléc, logó, vaknyomás-vonal
  app/                  oldalak (útvonalak)
```

## 3D termékmegjelenítés

- **A modell Blenderben készült**, valós méretben: üvegtest falvastagsággal és vastag talppal,
  folyadék, üvegpipetta, bordázott kupak, gumipipetta, papírcímke. A böngésző ennek GLB exportját
  tölti be. Kódból épül, a referenciafotók arányai alapján – gyártási rajz vagy beszkennelt
  termék érkezésekor a `blender/mono/geometry.py` méretei pontosíthatók.
- **Renderelt háttér, élő termék:** a jelenetek (reggeli kőpult, esti éjjeliszekrény, műterem)
  Blenderben, fizikai fényszámítással készülnek. A böngészőben a háttér a kész kép, előtte az
  üveg valós időben forog, a jelenet saját panorámájával megvilágítva – ezért ül bele pontosan a
  fénybe. A „közelítés” a rögzített kamera képének nagyítása, így a kettő mindig fedésben marad.
- **Termékutazás** (`components/journey`, `components/scene/journey-director.ts`): a görgetés
  viszi végig a kamerát a nyitótól a részleteken és az estén át a párosig. A kulcskockák egy
  listában vannak, tesztekkel.
- **A címke külön réteg:** a szöveg a termékadatokból, futásidőben rajzolódik
  (`label-art.ts`), ezért a feliratok mindig pontosak.
- **Fokozatos betöltés** (`SceneStage.tsx`): azonnal megjelenik a jelenet renderelt képe
  (ugyanabból a kamerából), a three.js csak tétlen időben és láthatóvá váláskor töltődik.
  WebGL-hiba esetén a renderelt kép marad.
- **Csökkentett mozgás / WebGL nélkül** a főoldal ugyanazt a történetet álló, renderelt képekkel
  mutatja (`JourneyStatic.tsx`). Ha a képkockasebesség tartósan alacsony, a jelenet egyszerűbb
  üveganyagra és kisebb felbontásra vált.

## GitHub Pages

A `main` ágra kerülő változások után a `.github/workflows/pages.yml` lefuttatja a teszteket,
statikus exportot készít, és közzéteszi GitHub Pagesen. A build ilyenkor a `PAGES_BASE_PATH`
környezeti változóból kapja az alútvonalat (a repó nevét); helyben ez nincs beállítva, így a
fejlesztés változatlan. Helyi kipróbálás:

```bash
PAGES_BASE_PATH=/mono-webshop-demo npm run build   # az eredmény az out/ mappában
```

## WooCommerce-átállás

Lásd: [docs/woocommerce-atallas.md](docs/woocommerce-atallas.md).
