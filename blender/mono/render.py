"""Renderbeállítások és segédfüggvények."""
import math

import bpy
from mathutils import Vector


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    if scene.world is None:
        scene.world = bpy.data.worlds.new("World")
    return scene


def engine_id(kind):
    items = {i.identifier for i in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items}
    if kind == "eevee":
        return "BLENDER_EEVEE" if "BLENDER_EEVEE" in items else "BLENDER_EEVEE_NEXT"
    return {"cycles": "CYCLES", "workbench": "BLENDER_WORKBENCH"}[kind]


def use_cycles(scene, samples=256, gpu=True):
    scene.render.engine = "CYCLES"
    cycles = scene.cycles
    if gpu:
        try:
            prefs = bpy.context.preferences.addons["cycles"].preferences
            prefs.compute_device_type = "METAL"
            prefs.get_devices()
            for device in prefs.devices:
                device.use = device.type == "METAL"   # csak GPU: a gép közben használható marad
            cycles.device = "GPU"
        except Exception as error:  # CPU-ra esik vissza
            print("GPU nem elérhető:", error)
    cycles.samples = samples
    cycles.use_adaptive_sampling = True
    cycles.adaptive_threshold = 0.01
    cycles.use_denoising = True
    # Sok egymásba ágyazott üvegfelület: bőven kell törés- és átlátszósági mélység.
    cycles.max_bounces = 32
    cycles.transmission_bounces = 32
    cycles.glossy_bounces = 16
    cycles.transparent_max_bounces = 32
    cycles.volume_bounces = 2
    cycles.caustics_reflective = True
    cycles.caustics_refractive = True
    cycles.blur_glossy = 0.3
    cycles.sample_clamp_indirect = 12.0


def use_eevee(scene, samples=64):
    scene.render.engine = engine_id("eevee")
    eevee = scene.eevee
    for attr, value in (("taa_render_samples", samples), ("use_raytracing", True), ("use_shadows", True)):
        if hasattr(eevee, attr):
            setattr(eevee, attr, value)


def use_workbench(scene, matcap="clay_studio.exr", cavity=True):
    scene.render.engine = "BLENDER_WORKBENCH"
    shading = scene.display.shading
    shading.light = "MATCAP"
    shading.studio_light = matcap
    shading.color_type = "SINGLE"
    shading.single_color = (0.8, 0.8, 0.8)
    shading.show_cavity = cavity
    shading.cavity_type = "BOTH"
    shading.show_backface_culling = False
    shading.show_object_outline = False
    scene.display.render_aa = "16"


def color_management(scene, look="AgX - Medium High Contrast", exposure=0.0):
    scene.view_settings.view_transform = "AgX"
    try:
        scene.view_settings.look = look
    except TypeError:
        scene.view_settings.look = "None"
    scene.view_settings.exposure = exposure
    scene.display_settings.display_device = "sRGB"


def output(scene, path, width, height, fmt="PNG"):
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.filepath = path
    scene.render.image_settings.file_format = fmt
    if fmt == "PNG":
        scene.render.image_settings.color_mode = "RGB"
        scene.render.image_settings.compression = 30
    elif fmt == "JPEG":
        scene.render.image_settings.quality = 92


def render(scene, path, width, height, fmt="PNG"):
    output(scene, path, width, height, fmt)
    bpy.ops.render.render(write_still=True)
    print("RENDER KÉSZ:", path)


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def add_camera(scene, name, location, target, lens=85.0, sensor=36.0, fstop=None, focus=None, ortho_scale=None):
    data = bpy.data.cameras.new(name)
    data.lens = lens
    data.sensor_width = sensor
    data.sensor_fit = "AUTO"
    data.clip_start = 0.005
    data.clip_end = 50.0
    if ortho_scale:
        data.type = "ORTHO"
        data.ortho_scale = ortho_scale
    cam = bpy.data.objects.new(name, data)
    cam.location = location
    scene.collection.objects.link(cam)
    look_at(cam, target)
    if fstop:
        data.dof.use_dof = True
        data.dof.aperture_fstop = fstop
        data.dof.focus_distance = focus if focus else (Vector(target) - Vector(location)).length
    return cam


def add_area_light(scene, name, location, target, power, size, size_y=None, color=(1, 1, 1), spread=None):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = power
    data.color = color
    if size_y:
        data.shape = "RECTANGLE"
        data.size = size
        data.size_y = size_y
    else:
        data.shape = "DISK"
        data.size = size
    if spread is not None:
        data.spread = math.radians(spread)
    light = bpy.data.objects.new(name, data)
    light.location = location
    scene.collection.objects.link(light)
    look_at(light, target)
    return light


def set_world(scene, color=(0.05, 0.05, 0.05), strength=1.0):
    world = scene.world
    world.use_nodes = True
    nodes = world.node_tree.nodes
    nodes.clear()
    out = nodes.new("ShaderNodeOutputWorld")
    bg = nodes.new("ShaderNodeBackground")
    bg.inputs["Color"].default_value = (*color, 1.0)
    bg.inputs["Strength"].default_value = strength
    world.node_tree.links.new(bg.outputs[0], out.inputs["Surface"])
    world.color = color
