"""
A böngészős (valós idejű) üvegmodell exportja GLB-be.

  Blender -b --factory-startup --python blender/export_glb.py

Csak a geometriát és az UV-kat viszi ki, valós méretben (méter). Az anyagokat
a weboldal rendeli a hálókhoz név szerint: GlassShell, Pipette, CapRing,
CapCollar, Bulb, Label.
"""
import os
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from mono import bottle, render as R  # noqa: E402

OUT = os.path.join(os.path.dirname(HERE), "public", "models", "mono-bottle.glb")

scene = R.reset_scene()
root, parts = bottle.build_bottle("classic", "Bottle", realtime=True)
total = 0
for name, obj in parts.items():
    tris = sum(len(p.vertices) - 2 for p in obj.data.polygons)
    total += tris
    print(f"HÁLÓ {name}: {len(obj.data.vertices)} csúcs, {tris} háromszög")
print("ÖSSZES HÁROMSZÖG:", total)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    use_selection=False,
    export_apply=True,
    export_yup=True,
    export_normals=True,
    export_texcoords=True,
    export_materials="NONE",
    export_cameras=False,
    export_lights=False,
    export_animations=False,
)
print("EXPORT KÉSZ:", OUT, os.path.getsize(OUT), "bájt")
