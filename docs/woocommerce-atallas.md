# WooCommerce-átállás – mit kell majd lecserélni

A demóban nincs WooCommerce-kapcsolat és nincs saját backend. A kereskedelmi rész szándékosan
kevés, jól körülhatárolt modulban él, hogy a bekötéshez ne kelljen a felületet újraírni.

A két lehetséges irány (hagyományos WooCommerce-téma, illetve különálló frontend a WooCommerce
API-jára kötve) közül **még nincs döntés** – az alábbi lista mindkettőnél érvényes kiindulópont.

## Demóadatok – ezek WooCommerce-ből jönnek majd

| Demóban | Fájl | WooCommerce-ben |
| --- | --- | --- |
| Termékek: név, ár, leírás, képek | `src/data/products.ts` | Termékek (a páros csomag csomagtermékként vagy kedvezményszabályként) |
| Szállítási díj, ingyenes küszöb | `src/data/shop-config.ts` | Szállítási zónák és módok |
| Összetevők, adagolás, figyelmeztetések | `src/data/pending.ts` | Termékattribútumok / egyedi mezők |
| Jogi és cégadatok | `src/data/pending.ts` | Oldalak, bolti beállítások |

## Cserélendő modulok

| Modul | Most | Átálláskor |
| --- | --- | --- |
| `lib/commerce/catalog.ts` | A `data/products.ts`-ből olvas | Termékek lekérése a WooCommerce-ből; a függvények neve és visszatérési alakja maradhat |
| `lib/commerce/cart-store.ts` | localStorage, `cartActions` | A `cartActions` belseje a WooCommerce kosárműveleteit hívja; a `useCart()` felülete maradhat |
| `lib/commerce/cart.ts` | Helyben számol részösszeget, szállítást | A végösszegeket a WooCommerce adja (adó, kuponok, szállítás); a helyi számítás legfeljebb azonnali visszajelzésre marad |
| `lib/commerce/checkout.ts` | `placeDemoOrder` – csak memóriában | Valódi rendelésleadás és fizetési szolgáltató; a mezőellenőrzés újrahasznosítható |
| `app/penztar`, `app/rendeles/visszaigazolas` | Demó felület | A mezők és az elrendezés megtartható, a demó jelölések törlendők |

A megjelenítő komponensek (`components/`, oldalak) csak ezeken a modulokon keresztül érik el az
adatokat – árat, szállítási díjat egyik sem tartalmaz beégetve.

## Az éles induláshoz még szükséges

- Jóváhagyott terméktartalom: összetevők, hatóanyag-táblázat, adagolás, figyelmeztetések,
  tárolás (`data/pending.ts`).
- Étrend-kiegészítőkre vonatkozó kötelező jelölések és a megfogalmazások szakmai/jogi
  ellenőrzése.
- Cégadatok, elérhetőségek, ÁSZF, adatkezelési tájékoztató, sütikezelés.
- Végleges árak, szállítási módok és díjak, fizetési módok, számlázás.
- Végleges termékfotók és – ha lesz – kész 3D modell; a nyomdai címkegrafika és a dombornyomott
  vonal végleges rajza (`src/lib/motif.ts`).
- Rendelés-visszaigazoló e-mailek, készletkezelés, analitika.
- A demó jelölések eltávolítása, a keresőrobotok engedélyezése (`app/layout.tsx`, `robots`).
