"""
Jelenetek renderelése a weboldalhoz.

  Blender -b --factory-startup --python blender/render_scene.py -- <jelenet> <mit> [--res N] [--samples N]

  jelenet: reggel | este | paros
  mit:     test   – gyors, kis felbontású próba az üveggel
           still  – végleges kép az üveggel (helyettesítő kép, galéria)
           plate  – háttérkép az üveg nélkül, de az árnyékával és fényfoltjával
           env    – körpanoráma (EXR) az üveg helyéről, a böngészős 3D megvilágításához
           all    – still + plate + env
"""
import json
import math
import os
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from mono import render as R, scenes  # noqa: E402

ARGS = sys.argv[sys.argv.index("--") + 1:]
NAME, WHAT = ARGS[0], ARGS[1]


def opt(flag, default):
    return int(ARGS[ARGS.index(flag) + 1]) if flag in ARGS else default


RES = opt("--res", 2400)
SAMPLES = opt("--samples", 384)
OUT = os.path.join(HERE, "out", "scenes")
os.makedirs(OUT, exist_ok=True)


def bottle_objects(info):
    return [obj for parts in info["bottles"] for obj in parts.values()]


def main():
    scene = R.reset_scene()
    info = scenes.SCENES[NAME](scene)
    cam = scenes._camera(scene)
    objs = bottle_objects(info)

    if WHAT == "test":
        R.use_cycles(scene, samples=opt("--samples", 96))
        R.render(scene, os.path.join(OUT, f"{NAME}-test.png"), opt("--res", 900), opt("--res", 900))
        return

    shots = {
        # név: (kamera helye, célpont, gyújtótáv, rekesz, szélesség, magasság)
        "close": ((0.06, -0.40, 0.105), (0.0, 0.0, 0.058), 85, 5.6, 1500, 1950),
        "macro-label": ((0.05, -0.150, 0.040), (0.006, -0.0166, 0.0295), 100, 13.0, 1800, 1200),
        "macro-cap": ((0.055, -0.150, 0.118), (0.0, -0.004, 0.093), 100, 7.1, 1800, 1200),
        "macro-base": ((-0.05, -0.165, 0.03), (0.0, -0.008, 0.012), 100, 6.3, 1800, 1200),
    }
    if WHAT in shots:
        # Közeli felvételek: az üveg részletei a jelenet fényében.
        location, target, lens, fstop, width, height = shots[WHAT]
        focus = (scenes.Vector(target) - scenes.Vector(location)).length
        if len(info["bottles"]) == 2 and WHAT == "close":
            location = (0.03, -0.46, 0.105)
        cam_close = R.add_camera(scene, "Close", location, target, lens=lens, fstop=fstop, focus=focus)
        scene.camera = cam_close
        R.use_cycles(scene, samples=opt("--samples", 256))
        scale = opt("--res", width) / width
        R.render(scene, os.path.join(OUT, f"{NAME}-{WHAT}.png"), int(width * scale), int(height * scale))
        return

    if WHAT in ("still", "all"):
        R.use_cycles(scene, samples=SAMPLES)
        R.render(scene, os.path.join(OUT, f"{NAME}-still.png"), RES, RES)

    if WHAT in ("plate", "all"):
        R.use_cycles(scene, samples=SAMPLES)
        for obj in objs:
            obj.visible_camera = False
        R.render(scene, os.path.join(OUT, f"{NAME}-plate.png"), RES, RES)
        for obj in objs:
            obj.visible_camera = True

    if WHAT in ("env", "all"):
        R.use_cycles(scene, samples=min(SAMPLES, 256))
        for obj in objs:
            obj.hide_render = True
        # A lágy területfények (derítés, műtermi fények) a panorámán is látszanak,
        # így az üvegen tükröződnek. A nap és a lámpa pontfénye nem – azokat a
        # weboldal irányfényként adja hozzá (scene-config.ts `key`).
        for obj in scene.objects:
            if obj.type == "LIGHT" and obj.data.type == "AREA":
                obj.visible_camera = True
        data = bpy.data.cameras.new("EnvCamera")
        data.type = "PANO"
        data.panorama_type = "EQUIRECTANGULAR"
        data.clip_start = 0.01
        env_cam = bpy.data.objects.new("EnvCamera", data)
        env_cam.location = scenes.ENV_ORIGIN
        # Ezzel a forgatással a panoráma a világ tengelyeihez igazodik.
        env_cam.rotation_euler = (math.radians(90), 0, math.radians(-90))
        scene.collection.objects.link(env_cam)
        scene.camera = env_cam
        scene.view_settings.view_transform = "Standard"
        scene.view_settings.look = "None"
        scene.view_settings.exposure = 0.0
        # Tömörített (DWAA) EXR: töredéke a nyers HDR méretének, a three.js olvassa.
        R.output(scene, os.path.join(OUT, f"{NAME}-env.exr"), 1024, 512, fmt="OPEN_EXR")
        scene.render.image_settings.color_mode = "RGB"
        scene.render.image_settings.color_depth = "16"
        scene.render.image_settings.exr_codec = "DWAA"
        bpy.ops.render.render(write_still=True)
        print("RENDER KÉSZ:", scene.render.filepath)

    meta = {
        "camera": scenes.CAMERA,
        "envOrigin": scenes.ENV_ORIGIN,
        "pairOffset": scenes.PAIR_OFFSET,
        "exposure": {name: None for name in scenes.SCENES},
    }
    with open(os.path.join(OUT, "camera.json"), "w") as handle:
        json.dump(meta, handle, indent=2)


main()
