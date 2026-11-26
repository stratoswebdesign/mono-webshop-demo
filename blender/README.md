# Blender-forrás: a mono üveg és a jelenetek

Minden kódból épül (Blender 5.x, Python), így bármikor újragenerálható. A Blendert
parancssorból, ablak nélkül futtatjuk:

```bash
B=/Applications/Blender.app/Contents/MacOS/Blender
```

## Fájlok

| Fájl | Mit csinál |
| --- | --- |
| `mono/geometry.py` | Az üveg alkatrészei valós méretben (mm): üvegtest falvastagsággal és vastag talppal, folyadék, üvegpipetta, bordázott kupak, garanciagyűrű, gumipipetta, papírcímke |
| `mono/materials.py` | Anyagok: borostyánüveg (térfogati elnyeléssel), műanyag, gumi, papír dombornyomással; travertin, vakolat, dió, vászon |
| `mono/bottle.py` | Az üveg összeállítása – renderhez (tömör, fizikailag helyes) vagy böngészőhöz (csak felületek) |
| `mono/scenes.py` | A három jelenet közös kamerával: `reggel`, `este`, `paros` |
| `test_model.py` | Modellteszt több módban: agyag, normálok, drótháló, metszet, EEVEE, Cycles, közelik |
| `render_scene.py` | Jelenetek renderelése: végleges kép, üveg nélküli háttér, panoráma, közelik |
| `export_glb.py` | A böngészős modell exportja: `public/models/mono-bottle.glb` |
| `render_all.sh` | A weboldal összes renderje egymás után (kb. 20 perc Apple M4-en) |
| `publish.mjs` | A kész rendereket WebP-re alakítva a `public` mappába teszi |
| `textures/` | A címke szín- és magasságtérképe (a weboldal címkerajzából mentve) |

## Gyakori műveletek

```bash
# A modell ellenőrzése több megjelenítési módban (kimenet: blender/out)
$B -b --factory-startup --python blender/test_model.py -- clay normals wire section cycles macro

# Egy jelenet gyors próbája, majd a végleges képei
$B -b --factory-startup --python blender/render_scene.py -- reggel test
$B -b --factory-startup --python blender/render_scene.py -- reggel all --res 2200 --samples 300

# Minden render újra, majd publikálás a weboldalba
sh blender/render_all.sh && node blender/publish.mjs

# A böngészős modell újraexportálása
$B -b --factory-startup --python blender/export_glb.py
```

## Hogyan ül össze a render és a böngészős 3D

Jelenetenként három kép készül ugyanabból a kamerából:

- **still** – a jelenet az üveggel: helyettesítő kép, WebGL nélküli változat, galéria;
- **plate** – ugyanaz az üveg nélkül, de az árnyékával és borostyán fényfoltjával: ez a böngészős
  jelenet háttere;
- **env** – körpanoráma az üveg helyéről: ezzel világítja meg a böngésző a valós idejű modellt.

A kamera adatai a `mono/scenes.py` `CAMERA` szótárában és a weboldal
`src/components/scene/scene-config.ts` fájljában egyeznek. Ha a kamera vagy az üveg helye változik,
mindkettőt módosítani kell, és a jelenetet újra kell renderelni.

## Ami nem végleges

- A címke és a dombornyomott vonal a referenciafotók alapján készült, nem a nyomdai grafikából.
- A környezetek (kőpult, éjjeliszekrény) procedurális anyagokból épülnek, nem beszkennelt
  felületekből.
- A doboz nincs megmodellezve; a csomagolást a `public/images/paros-csomag.webp` fotó mutatja.
