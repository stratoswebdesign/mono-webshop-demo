"""
Modellteszt: az üveget több megjelenítési módban rendereli, hogy a forma,
a hálótopológia, a normálok, a falvastagság és az anyagok külön ellenőrizhetők
legyenek.

  Blender -b --factory-startup --python blender/test_model.py -- [módok...] [--variant sleep]
  módok: clay normals wire section eevee cycles macro   (alapból: mind)
"""
import os
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from mono import bottle, materials, render as R  # noqa: E402

OUT = os.path.join(HERE, "out")
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
VARIANT = "sleep" if "--variant" in ARGS and ARGS[ARGS.index("--variant") + 1] == "sleep" else "classic"
MODES = [a for a in ARGS if not a.startswith("--") and a not in ("classic", "sleep")] or [
    "clay", "normals", "wire", "section", "eevee", "cycles", "macro",
]

CENTER = (0.0, 0.0, 0.057)


def studio(scene):
    """Semleges műterem: ívelt háttér, bal oldali kulcsfény, peremfény, derítés."""
    bpy.ops.mesh.primitive_plane_add(size=3.0, location=(0, 0.6, 0))
    floor = bpy.context.active_object
    floor.name = "Backdrop"
    mat = bpy.data.materials.new("Backdrop")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.55, 0.5, 0.43, 1)
    bsdf.inputs["Roughness"].default_value = 0.75
    floor.data.materials.append(mat)
    R.set_world(scene, (0.02, 0.02, 0.022), 1.0)
    R.add_area_light(scene, "Key", (-0.34, -0.22, 0.26), CENTER, 14.0, 0.22, 0.5, color=(1.0, 0.93, 0.84))
    R.add_area_light(scene, "Rim", (0.3, 0.32, 0.2), CENTER, 9.0, 0.1, 0.4, color=(1.0, 0.97, 0.93))
    R.add_area_light(scene, "Top", (0.0, -0.05, 0.5), CENTER, 4.0, 0.5)
    return floor


def cameras(scene):
    return {
        "front": R.add_camera(scene, "Front", (0.0, -0.62, 0.075), CENTER, lens=100),
        "three": R.add_camera(scene, "ThreeQuarter", (0.3, -0.5, 0.2), CENTER, lens=100),
        "low": R.add_camera(scene, "Low", (-0.12, -0.5, 0.03), (0, 0, 0.05), lens=100),
        "cap": R.add_camera(scene, "CapMacro", (0.07, -0.16, 0.115), (0, 0, 0.092), lens=100, fstop=8, focus=0.165),
        "base": R.add_camera(scene, "BaseMacro", (-0.05, -0.17, 0.035), (0, 0, 0.022), lens=100, fstop=8, focus=0.17),
        "label": R.add_camera(scene, "LabelMacro", (0.03, -0.19, 0.045), (0.004, 0, 0.034), lens=100, fstop=8, focus=0.175),
    }


def main():
    scene = R.reset_scene()
    root, parts = bottle.build_bottle(VARIANT)
    backdrop = studio(scene)
    cams = cameras(scene)
    R.color_management(scene)

    stats = {name: (len(obj.data.vertices), len(obj.data.polygons)) for name, obj in parts.items()}
    print("HÁLÓ (csúcs, lap):", stats)

    def shot(name, cam, w=900, h=1200):
        scene.camera = cams[cam]
        R.render(scene, os.path.join(OUT, f"{VARIANT}-{name}.png"), w, h)

    if "clay" in MODES:
        R.use_workbench(scene, "clay_studio.exr")
        backdrop.hide_render = True
        R.set_world(scene, (0.5, 0.5, 0.5))
        scene.world.color = (0.32, 0.32, 0.33)
        for cam in ("front", "three", "low"):
            shot(f"clay-{cam}", cam)

    if "normals" in MODES:
        R.use_workbench(scene, "check_normal+y.exr", cavity=False)
        scene.display.shading.show_backface_culling = True
        backdrop.hide_render = True
        shot("normals-three", "three")
        scene.display.shading.show_backface_culling = False

    if "wire" in MODES:
        R.use_workbench(scene, "basic_grey.exr", cavity=False)
        backdrop.hide_render = True
        added = []
        for obj in parts.values():
            mod = obj.modifiers.new("WireTest", "WIREFRAME")
            mod.thickness = 0.00006
            mod.use_replace = False
            mod.material_offset = 0
            added.append((obj, mod))
        scene.display.shading.color_type = "SINGLE"
        scene.display.shading.single_color = (0.75, 0.75, 0.75)
        shot("wire-three", "three", 1200, 1600)
        shot("wire-cap", "cap", 1200, 1200)
        for obj, mod in added:
            obj.modifiers.remove(mod)

    if "section" in MODES:
        # Metszet: a kamera közeli vágósíkja a tengelyen megy át.
        R.use_workbench(scene, "basic_side.exr")
        scene.display.shading.color_type = "RANDOM"
        backdrop.hide_render = True
        cam = R.add_camera(scene, "Section", (0.0, -0.4, 0.058), (0, 0, 0.058), ortho_scale=0.125)
        cam.data.clip_start = 0.4
        cams["section"] = cam
        shot("section", "section", 900, 1500)
        scene.display.shading.color_type = "SINGLE"

    backdrop.hide_render = False
    R.set_world(scene, (0.02, 0.02, 0.022), 1.0)

    if "eevee" in MODES:
        R.use_eevee(scene)
        shot("eevee-front", "front")

    if "cycles" in MODES:
        R.use_cycles(scene, samples=160)
        shot("cycles-front", "front", 1050, 1400)
        shot("cycles-three", "three", 1050, 1400)

    if "macro" in MODES:
        R.use_cycles(scene, samples=160)
        shot("cycles-cap", "cap", 1200, 1200)
        shot("cycles-base", "base", 1200, 1200)
        shot("cycles-label", "label", 1200, 1200)


main()
