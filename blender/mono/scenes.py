"""
A termékutazás jelenetei. Mindhárom ugyanazzal a kamerával készül, így az
üveg a képen mindig ugyanott áll – csak a világ változik körülötte.

  reggel – travertin fürdőszobapult, vakolt fal, ablakon beeső reggeli nap
  este   – diófa éjjeliszekrény, lámpafény, párna és takaró a háttérben
  paros  – semleges műterem, a két üveg egymás mellett
"""
import math
import random

import bpy
from mathutils import Vector

from . import bottle
from . import materials as m
from . import render as R

# Közös kamera (méterben). A négyzetes képből a weboldal vág fekvő/álló kivágást.
CAMERA = {
    "location": (0.0, -1.07, 0.16),
    "target": (0.0, 0.0, 0.057),
    "lens": 85.0,
    "sensor": 36.0,
    "fstop": 2.8,
}
ENV_ORIGIN = (0.0, 0.0, 0.057)
WALL_Y = 0.34
PAIR_OFFSET = 0.028


def _plane(name, size_x, size_y, location, rotation=(0, 0, 0), material=None):
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=location, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size_x, size_y, 1.0)
    if material:
        obj.data.materials.append(material)
    return obj


def _box(name, size, location, material=None, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 4
    if material:
        obj.data.materials.append(material)
    return obj


def _camera(scene):
    focus = (Vector((0, -0.0165, 0.057)) - Vector(CAMERA["location"])).length
    cam = R.add_camera(scene, "JourneyCamera", CAMERA["location"], CAMERA["target"],
                       lens=CAMERA["lens"], sensor=CAMERA["sensor"], fstop=CAMERA["fstop"], focus=focus)
    scene.camera = cam
    return cam


def _sun(scene, travel, strength, color, angle_deg):
    data = bpy.data.lights.new("Sun", "SUN")
    data.energy = strength
    data.color = color
    data.angle = math.radians(angle_deg)
    sun = bpy.data.objects.new("Sun", data)
    scene.collection.objects.link(sun)
    sun.rotation_euler = Vector(travel).normalized().to_track_quat("-Z", "Y").to_euler()
    return sun


def _window_gobo(scene, travel, aim, distance=1.7, seed=7):
    """Ablakkeret és lombozat a nap útjában: osztott, lágy szélű fényfoltot vet."""
    travel = Vector(travel).normalized()
    origin = Vector(aim) - travel * distance
    root = bpy.data.objects.new("WindowGobo", None)
    scene.collection.objects.link(root)
    root.location = origin
    root.rotation_euler = travel.to_track_quat("Z", "Y").to_euler()
    black = m.blocker()

    cols, rows = 2, 3
    pane_w, pane_h, bar = 0.25, 0.27, 0.036
    open_w = cols * pane_w + (cols - 1) * bar
    open_h = rows * pane_h + (rows - 1) * bar
    big = 3.0

    def block(name, sx, sy, x, y, z=0.0):
        obj = _plane(name, sx, sy, (0, 0, 0), material=black)
        obj.parent = root
        obj.location = (x, y, z)
        obj.visible_camera = False
        return obj

    # A nyílás körüli fal
    block("WallL", big, big * 2, -(open_w / 2 + big / 2), 0)
    block("WallR", big, big * 2, open_w / 2 + big / 2, 0)
    block("WallT", open_w, big, 0, open_h / 2 + big / 2)
    block("WallB", open_w, big, 0, -(open_h / 2 + big / 2))
    # Osztók
    for c in range(1, cols):
        block(f"BarV{c}", bar, open_h, -open_w / 2 + c * pane_w + (c - 0.5) * bar, 0)
    for r in range(1, rows):
        block(f"BarH{r}", open_w, bar, 0, -open_h / 2 + r * pane_h + (r - 0.5) * bar)
    # Lombozat: szabálytalan levélfoltok a nyílás felső–jobb részén
    rng = random.Random(seed)
    for i in range(46):
        x = rng.uniform(-0.1, open_w / 2 + 0.05)
        y = rng.uniform(0.02, open_h / 2 + 0.05)
        size = rng.uniform(0.035, 0.085)
        bpy.ops.mesh.primitive_circle_add(vertices=12, radius=0.5, fill_type="NGON")
        leaf = bpy.context.active_object
        leaf.name = f"Leaf{i}"
        leaf.data.materials.append(black)
        leaf.parent = root
        leaf.location = (x, y, -0.25 - rng.uniform(0, 0.25))
        leaf.scale = (size, size * rng.uniform(0.35, 0.6), 1.0)
        leaf.rotation_euler = (rng.uniform(-0.5, 0.5), rng.uniform(-0.5, 0.5), rng.uniform(0, math.pi))
        leaf.visible_camera = False
    return root


def reggel(scene):
    """Reggeli fürdőszobapult: kő, vakolat, oldalról beeső meleg nap."""
    R.color_management(scene, exposure=0.15)
    _box("Counter", (3.0, 1.6, 0.05), (0, WALL_Y - 0.8, -0.025), m.travertine())
    _plane("Wall", 5.0, 2.4, (0, WALL_Y, 1.0), rotation=(math.radians(90), 0, 0),
           material=m.plaster((0.40, 0.365, 0.325, 1)))
    travel = (0.80, 0.50, -0.34)
    _sun(scene, travel, strength=5.2, color=(1.0, 0.70, 0.43), angle_deg=1.3)
    _window_gobo(scene, travel, aim=(-0.06, 0.06, 0.10))
    R.set_world(scene, (0.48, 0.56, 0.72), 0.32)   # hűvös égbolt-derítés
    # Lágy derítés jobbról-elölről, hogy az árnyékos oldal se zárjon be
    R.add_area_light(scene, "Fill", (0.7, -0.6, 0.45), (0, 0, 0.06), 6.0, 0.9, color=(0.86, 0.91, 1.0))
    root, parts = bottle.build_bottle("classic", "Bottle")
    return {"bottles": [parts]}


def _pillow(name, location, size, rotation, material, seed=1):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(scale=True)
    sub = obj.modifiers.new("Subdivision", "SUBSURF")
    sub.levels = 4
    sub.render_levels = 4
    tex = bpy.data.textures.new(f"{name}Folds", "CLOUDS")
    tex.noise_scale = 0.16
    tex.noise_depth = 2
    disp = obj.modifiers.new("Folds", "DISPLACE")
    disp.texture = tex
    disp.strength = 0.05
    disp.mid_level = 0.5
    for poly in obj.data.polygons:
        poly.use_smooth = True
    obj.data.materials.append(material)
    return obj


def este(scene):
    """Esti éjjeliszekrény: diófa, lámpafény, vászon ágynemű a háttérben."""
    R.color_management(scene, exposure=0.55)
    wood = m.walnut()
    # Az éjjeliszekrény lapja – jobbra véget ér, mögötte az ágy
    _box("Nightstand", (1.6, 1.3, 0.04), (-0.56, WALL_Y - 0.65, -0.02), wood, bevel=0.003)
    _plane("Wall", 5.0, 2.4, (0, WALL_Y, 1.0), rotation=(math.radians(90), 0, 0),
           material=m.plaster((0.060, 0.047, 0.038, 1), "WallNight"))
    _plane("Floor", 6.0, 6.0, (0, 0, -0.5), material=m.matte("FloorDark", (0.02, 0.016, 0.013, 1)))
    cloth = m.linen()
    _pillow("Pillow", (0.47, 0.13, 0.035), (0.5, 0.32, 0.17), (0.14, -0.1, 0.3), cloth)
    _pillow("Duvet", (0.62, -0.42, -0.05), (0.66, 0.7, 0.14), (0.05, 0.12, -0.2), cloth, seed=3)

    # Lámpa: az ernyő sarka a kép bal felső szélén, alatta meleg fénykör
    lamp_at = Vector((-0.30, -0.30, 0.235))
    bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=0.11, radius2=0.066, depth=0.16,
                                    end_fill_type="NOTHING", location=lamp_at)
    shade = bpy.context.active_object
    shade.name = "LampShade"
    shade.data.materials.append(m.emission("ShadeGlow", (1.0, 0.52, 0.22, 1), 0.45))
    shade.visible_shadow = False      # az áttetsző ernyő nem takarja ki a fényt
    for poly in shade.data.polygons:
        poly.use_smooth = True
    bulb_at = lamp_at + Vector((0, 0, -0.04))
    # Az izzó: minden irányba világít (fal, ágynemű), lágy árnyékkal
    bulb_data = bpy.data.lights.new("Bulb", "POINT")
    bulb_data.energy = 2.6
    bulb_data.color = (1.0, 0.70, 0.45)
    bulb_data.shadow_soft_size = 0.045
    bulb = bpy.data.objects.new("Bulb", bulb_data)
    bulb.location = bulb_at
    scene.collection.objects.link(bulb)
    # Lefelé irányuló fénykör az asztallapon és az üvegen
    spot_data = bpy.data.lights.new("Lamp", "SPOT")
    spot_data.energy = 3.2
    spot_data.color = (1.0, 0.70, 0.45)
    spot_data.spot_size = math.radians(120)
    spot_data.spot_blend = 0.7
    spot_data.shadow_soft_size = 0.04
    spot = bpy.data.objects.new("Lamp", spot_data)
    spot.location = bulb_at
    scene.collection.objects.link(spot)
    R.look_at(spot, (-0.1, -0.08, 0.0))
    # A lámpa szórt fénye a falon és az ágyneműn
    R.add_area_light(scene, "WallGlow", (-0.5, -0.25, 0.3), (-0.22, WALL_Y, 0.2), 2.2, 0.3, color=(1.0, 0.62, 0.34))
    R.add_area_light(scene, "BedGlow", (-0.2, -0.5, 0.42), (0.45, 0.1, 0.08), 3.0, 0.35, color=(1.0, 0.70, 0.46))
    # Alig érezhető hűvös ellenfény jobbról-hátulról, hogy az üveg széle elváljon
    R.add_area_light(scene, "Moon", (0.55, 0.26, 0.3), (0, 0, 0.07), 0.9, 0.4, color=(0.55, 0.68, 1.0))
    R.set_world(scene, (0.03, 0.034, 0.045), 0.6)
    root, parts = bottle.build_bottle("sleep", "Bottle")
    return {"bottles": [parts]}


def paros(scene):
    """Semleges műterem: ívelt, kőszínű háttér, puha oldalfény, a két üveg."""
    R.color_management(scene, exposure=0.0)
    paper = m.plaster((0.40, 0.355, 0.295, 1), "Backdrop")
    paper.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.82
    # Ívelt háttér: padló + fal egy lapból, lekerekített átmenettel
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0, 0, 0))
    sweep = bpy.context.active_object
    sweep.name = "Sweep"
    mesh = sweep.data
    mesh.clear_geometry()
    profile = [(-1.6, 0.0), (WALL_Y + 0.05, 0.0)]
    radius = 0.32
    for i in range(1, 17):
        a = math.radians(-90 + 90 * i / 16)
        profile.append((WALL_Y + 0.05 + radius * math.cos(a), radius + radius * math.sin(a)))
    profile.append((WALL_Y + 0.05 + radius, 2.2))
    verts, faces = [], []
    for y, z in profile:
        verts += [(-2.5, y, z), (2.5, y, z)]
    for i in range(len(profile) - 1):
        faces.append((2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2))
    mesh.from_pydata(verts, [], faces)
    for poly in mesh.polygons:
        poly.use_smooth = True
    mesh.materials.append(paper)
    R.set_world(scene, (0.35, 0.33, 0.31), 0.25)
    R.add_area_light(scene, "Key", (-0.75, -0.55, 0.62), (0, 0, 0.06), 34.0, 0.7, 1.0, color=(1.0, 0.93, 0.84))
    R.add_area_light(scene, "Rim", (0.62, 0.22, 0.36), (0, 0, 0.07), 9.0, 0.16, 0.6, color=(1.0, 0.97, 0.94))
    root_a, parts_a = bottle.build_bottle("classic", "BottleClassic")
    root_a.location.x = -PAIR_OFFSET
    root_b, parts_b = bottle.build_bottle("sleep", "BottleSleep")
    root_b.location.x = PAIR_OFFSET
    return {"bottles": [parts_a, parts_b]}


SCENES = {"reggel": reggel, "este": este, "paros": paros}
