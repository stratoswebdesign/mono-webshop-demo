# mono – webshopdemó

A mono étrend-kiegészítő márka végigkattintható webshopdemója: főoldal 3D nyitószakasszal,
terméklista, két termékoldal, reggeli és esti landing, páros csomag, történet, GYIK, kapcsolat,
kosár, demó pénztár és demó visszaigazolás.

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
React Three Fiberrel.

## Hol mit találsz

| Mit szeretnél módosítani | Fájl |
| --- | --- |
| Árak, terméknevek, leírások, képek | `src/data/products.ts` |
| Szállítási díj, ingyenes szállítás küszöbe, max. mennyiség | `src/data/shop-config.ts` |
| **Véglegesítésre váró szakmai/jogi tartalmak** (összetevők, adagolás, cégadatok…) | `src/data/pending.ts` |
| Reggeli és esti landing szövegei | `src/data/routines.ts` |
| GYIK | `src/data/faq.ts` |
| Navigáció | `src/data/site.ts` |
| Színek, tipográfia, a 3D színpad elhelyezése | `src/app/globals.css` |
| A dombornyomott vonalmotívum rajza | `src/lib/motif.ts` |

### Véglegesítésre váró tartalom

A demó szándékosan nem tartalmaz kitalált összetevőt, adagolást, hatást, értékelést, tanúsítványt
vagy cégadatot. Ami hiányzik, az a `src/data/pending.ts` központi listájában szerepel, és a
felületen „Véglegesítésre vár” jelölést kap. Ha egy mező `text` értékét kitöltöd, a jelölés
helyén automatikusan a végleges szöveg jelenik meg.

## Felépítés

```
src/
  data/                 demóadatok (termékek, beállítások, szövegek, pending lista)
  lib/commerce/         kereskedelmi logika – a felülettől elkülönítve
    catalog.ts            termékek lekérdezése
    cart.ts               kosárszámítás (tiszta függvények) + cart.test.ts
    cart-store.ts         kosár tárolása (localStorage), useCart() hook
    checkout.ts           pénztár mezőellenőrzés, demó rendelés (csak memóriában)
    format.ts             árformázás
  components/
    three/              3D termékmegjelenítés
    shop/               kosár, ár, mennyiségválasztó, kosárba gomb
    site/               fejléc, lábléc, logó, vaknyomás-vonal
  app/                  oldalak (útvonalak)
```

## 3D termékmegjelenítés

- **A modell procedurális:** az üveg, a kupak és a pipetta kódból épül
  (`components/three/bottle-geometry.ts`), a referenciafotók arányai alapján. Ez nem végleges,
  fotórealisztikus modell – kész GLB érkezésekor a `BottleModel.tsx` cserélendő.
- **A címke külön réteg:** a szöveg a termékadatokból, futásidőben rajzolódik
  (`label-texture.ts`), ezért a feliratok mindig pontosak. Nyomdai grafika érkezésekor itt
  tölthető be kép helyette.
- **Fokozatos betöltés** (`ProductStage.tsx`): azonnal megjelenik egy rajzolt helyettesítő kép,
  a three.js csak tétlen időben és láthatóvá váláskor töltődik. WebGL-hiba esetén a helyettesítő
  kép marad, az oldal teljesen használható.
- Csökkentett mozgás beállításnál nincs automatikus ringás, görgetéshez kötött mozgás és
  váltáskori fordulat. Mobilon egyszerűbb üveganyag és kevesebb sokszög fut.

## WooCommerce-átállás

Lásd: [docs/woocommerce-atallas.md](docs/woocommerce-atallas.md).
