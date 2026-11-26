"""A teljes üveg összeállítása az alkatrészekből."""
import bpy

from . import geometry as g
from . import materials as m


def _assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    return obj


def build_bottle(variant="classic", name="Bottle", realtime=False):
    """Felépíti az üveget és egy üres szülőobjektum alá rendezi.

    realtime=False: fizikailag helyes, tömör üveg + folyadék (Cycles renderhez).
    realtime=True: csak felületek, a böngészős megjelenítéshez (GLB export).
    """
    root = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(root)
    parts = {}

    if realtime:
        parts["GlassShell"] = g.build_glass_shell(96)
        parts["Pipette"] = g.build_pipette(32, shell_only=True)
        parts["CapRing"] = g.build_ring(96)
        parts["CapCollar"] = g.build_collar(per_rib=6)
        parts["Bulb"] = g.build_bulb(64)
        parts["Label"] = g.build_label(seg_u=128, seg_v=8, thickness=0.0)
    else:
        parts["Glass"] = _assign(g.build_glass(192), m.glass_amber())
        parts["Liquid"] = _assign(g.build_liquid(160), m.glass_clear("Liquid", ior=1.36, tint=(1.0, 0.985, 0.95, 1)))
        parts["Pipette"] = _assign(g.build_pipette(64), m.glass_clear("PipetteGlass", ior=1.5))
        plastic = m.plastic_black()
        parts["CapRing"] = _assign(g.build_ring(160), plastic)
        parts["CapCollar"] = _assign(g.build_collar(per_rib=10), plastic)
        parts["Bulb"] = _assign(g.build_bulb(128), m.rubber_black())
        parts["Label"] = _assign(g.build_label(), m.label_paper(variant))

    for key, obj in parts.items():
        obj.name = f"{name}_{key}" if not realtime else key
        obj.parent = root
    return root, parts
