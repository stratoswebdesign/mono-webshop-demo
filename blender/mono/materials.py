"""A mono üveg anyagai (Cycles-re hangolva, EEVEE-ben is működnek)."""
import os

import bpy

TEX_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "textures")

LABEL_PAPER = {"classic": (0.83, 0.77, 0.66, 1.0), "sleep": (0.014, 0.043, 0.030, 1.0)}


def _new(name):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    return mat, nodes, mat.node_tree.links, out


def _shadow_transparent(nodes, links, surface_socket, out):
    """Árnyéksugaraknak átlátszó: az árnyékot a térfogati elnyelés színezi,
    így az üveg borostyán fényfoltot vet, nem tömör fekete árnyékot."""
    path = nodes.new("ShaderNodeLightPath")
    clear = nodes.new("ShaderNodeBsdfTransparent")
    mix = nodes.new("ShaderNodeMixShader")
    links.new(path.outputs["Is Shadow Ray"], mix.inputs["Fac"])
    links.new(surface_socket, mix.inputs[1])
    links.new(clear.outputs[0], mix.inputs[2])
    links.new(mix.outputs[0], out.inputs["Surface"])


def glass_amber():
    mat, nodes, links, out = _new("GlassAmber")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = (1, 1, 1, 1)
    bsdf.inputs["Transmission Weight"].default_value = 1.0
    bsdf.inputs["IOR"].default_value = 1.52
    # Enyhe felületi egyenetlenség: a tökéletesen sima CG-üveg hamisnak hat.
    coord = nodes.new("ShaderNodeTexCoord")
    noise = nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 420.0
    noise.inputs["Detail"].default_value = 4.0
    links.new(coord.outputs["Object"], noise.inputs["Vector"])
    ramp = nodes.new("ShaderNodeMapRange")
    ramp.inputs["To Min"].default_value = 0.008
    ramp.inputs["To Max"].default_value = 0.05
    links.new(noise.outputs["Fac"], ramp.inputs["Value"])
    links.new(ramp.outputs["Result"], bsdf.inputs["Roughness"])
    wave = nodes.new("ShaderNodeTexNoise")
    wave.inputs["Scale"].default_value = 55.0
    wave.inputs["Detail"].default_value = 1.5
    links.new(coord.outputs["Object"], wave.inputs["Vector"])
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.035
    bump.inputs["Distance"].default_value = 0.0004
    links.new(wave.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    _shadow_transparent(nodes, links, bsdf.outputs[0], out)
    volume = nodes.new("ShaderNodeVolumeAbsorption")
    volume.inputs["Color"].default_value = (0.82, 0.55, 0.10, 1.0)
    volume.inputs["Density"].default_value = 1500.0
    links.new(volume.outputs[0], out.inputs["Volume"])
    return mat


def glass_clear(name="GlassClear", ior=1.5, tint=(1, 1, 1, 1)):
    mat, nodes, links, out = _new(name)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = tint
    bsdf.inputs["Transmission Weight"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = 0.015
    bsdf.inputs["IOR"].default_value = ior
    _shadow_transparent(nodes, links, bsdf.outputs[0], out)
    return mat


def plastic_black():
    mat, nodes, links, out = _new("CapPlastic")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = (0.007, 0.007, 0.008, 1)
    bsdf.inputs["Roughness"].default_value = 0.34
    bsdf.inputs["IOR"].default_value = 1.49
    coord = nodes.new("ShaderNodeTexCoord")
    noise = nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 2600.0
    noise.inputs["Detail"].default_value = 2.0
    links.new(coord.outputs["Object"], noise.inputs["Vector"])
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.12
    bump.inputs["Distance"].default_value = 0.00003
    links.new(noise.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(bsdf.outputs[0], out.inputs["Surface"])
    return mat


def rubber_black():
    mat, nodes, links, out = _new("BulbRubber")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = (0.010, 0.010, 0.010, 1)
    bsdf.inputs["Roughness"].default_value = 0.6
    bsdf.inputs["IOR"].default_value = 1.52
    bsdf.inputs["Sheen Weight"].default_value = 0.06
    bsdf.inputs["Sheen Roughness"].default_value = 0.5
    coord = nodes.new("ShaderNodeTexCoord")
    noise = nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 3200.0
    noise.inputs["Detail"].default_value = 3.0
    links.new(coord.outputs["Object"], noise.inputs["Vector"])
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.2
    bump.inputs["Distance"].default_value = 0.00004
    links.new(noise.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(bsdf.outputs[0], out.inputs["Surface"])
    return mat


def label_paper(variant):
    """Papírcímke: színtérkép + dombornyomás magasságtérképből, rostos felülettel.
    Ha a textúrák még nincsenek legenerálva, sima papírszínnel dolgozik."""
    mat, nodes, links, out = _new(f"Label_{variant}")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = 0.88
    bsdf.inputs["Sheen Weight"].default_value = 0.12
    bsdf.inputs["Specular IOR Level"].default_value = 0.35
    coord = nodes.new("ShaderNodeTexCoord")

    color_path = os.path.join(TEX_DIR, f"label-{variant}-color.png")
    height_path = os.path.join(TEX_DIR, f"label-{variant}-height.png")

    # Papírrost: finom, irány nélküli zaj
    fiber = nodes.new("ShaderNodeTexNoise")
    fiber.inputs["Scale"].default_value = 1500.0
    fiber.inputs["Detail"].default_value = 6.0
    fiber.inputs["Roughness"].default_value = 0.7
    links.new(coord.outputs["Object"], fiber.inputs["Vector"])
    fiber_bump = nodes.new("ShaderNodeBump")
    fiber_bump.inputs["Strength"].default_value = 0.22
    fiber_bump.inputs["Distance"].default_value = 0.00006
    links.new(fiber.outputs["Fac"], fiber_bump.inputs["Height"])

    if os.path.exists(color_path):
        tex = nodes.new("ShaderNodeTexImage")
        tex.image = bpy.data.images.load(color_path, check_existing=True)
        tex.extension = "EXTEND"
        links.new(coord.outputs["UV"], tex.inputs["Vector"])
        # A rost enyhén a színt is megmozgatja
        tone = nodes.new("ShaderNodeMapRange")
        tone.inputs["To Min"].default_value = 0.93
        tone.inputs["To Max"].default_value = 1.04
        links.new(fiber.outputs["Fac"], tone.inputs["Value"])
        mul = nodes.new("ShaderNodeMix")
        mul.data_type = "RGBA"
        mul.blend_type = "MULTIPLY"
        mul.inputs["Factor"].default_value = 1.0
        links.new(tex.outputs["Color"], mul.inputs["A"])
        links.new(tone.outputs["Result"], mul.inputs["B"])
        links.new(mul.outputs["Result"], bsdf.inputs["Base Color"])
    else:
        bsdf.inputs["Base Color"].default_value = LABEL_PAPER[variant]

    normal_socket = fiber_bump.outputs["Normal"]
    if os.path.exists(height_path):
        height = nodes.new("ShaderNodeTexImage")
        height.image = bpy.data.images.load(height_path, check_existing=True)
        height.image.colorspace_settings.name = "Non-Color"
        height.extension = "EXTEND"
        links.new(coord.outputs["UV"], height.inputs["Vector"])
        emboss = nodes.new("ShaderNodeBump")
        emboss.inputs["Strength"].default_value = 1.0
        emboss.inputs["Distance"].default_value = 0.00035
        links.new(height.outputs["Color"], emboss.inputs["Height"])
        links.new(fiber_bump.outputs["Normal"], emboss.inputs["Normal"])
        normal_socket = emboss.outputs["Normal"]
    links.new(normal_socket, bsdf.inputs["Normal"])
    links.new(bsdf.outputs[0], out.inputs["Surface"])
    return mat


def clay(color=(0.62, 0.6, 0.57, 1)):
    mat, nodes, links, out = _new("Clay")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = 0.6
    links.new(bsdf.outputs[0], out.inputs["Surface"])
    return mat


# ── Környezeti anyagok (a jelenetekhez) ─────────────────────────────────────

def _principled(name):
    mat, nodes, links, out = _new(name)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    links.new(bsdf.outputs[0], out.inputs["Surface"])
    coord = nodes.new("ShaderNodeTexCoord")
    return mat, nodes, links, bsdf, coord


def _mapping(nodes, links, coord, scale=(1, 1, 1), rotation=(0, 0, 0)):
    mapping = nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = scale
    mapping.inputs["Rotation"].default_value = rotation
    links.new(coord.outputs["Object"], mapping.inputs["Vector"])
    return mapping


def _ramp(nodes, stops):
    ramp = nodes.new("ShaderNodeValToRGB")
    elements = ramp.color_ramp.elements
    while len(elements) < len(stops):
        elements.new(0.5)
    for element, (pos, color) in zip(elements, stops):
        element.position = pos
        element.color = color
    return ramp


def travertine():
    """Csiszolt travertin: meleg bézs alap, lágy sávozás, apró üregek."""
    mat, nodes, links, bsdf, coord = _principled("Travertine")
    # Nagy léptékű tónusváltozás
    big = nodes.new("ShaderNodeTexNoise")
    big.inputs["Scale"].default_value = 5.0
    big.inputs["Detail"].default_value = 8.0
    big.inputs["Distortion"].default_value = 0.6
    links.new(coord.outputs["Object"], big.inputs["Vector"])
    tone = _ramp(nodes, [(0.25, (0.50, 0.40, 0.28, 1)), (0.55, (0.60, 0.50, 0.37, 1)), (0.8, (0.69, 0.60, 0.47, 1))])
    links.new(big.outputs["Fac"], tone.inputs["Fac"])
    # Üledékes sávozás, a pult hosszában
    bands_map = _mapping(nodes, links, coord, scale=(1.0, 26.0, 26.0))
    bands = nodes.new("ShaderNodeTexNoise")
    bands.inputs["Scale"].default_value = 3.0
    bands.inputs["Detail"].default_value = 6.0
    bands.inputs["Distortion"].default_value = 1.4
    links.new(bands_map.outputs["Vector"], bands.inputs["Vector"])
    band_tone = _ramp(nodes, [(0.3, (0.80, 0.80, 0.80, 1)), (0.7, (1.0, 1.0, 1.0, 1))])
    links.new(bands.outputs["Fac"], band_tone.inputs["Fac"])
    color = nodes.new("ShaderNodeMix")
    color.data_type = "RGBA"
    color.blend_type = "MULTIPLY"
    color.inputs["Factor"].default_value = 0.85
    links.new(tone.outputs["Color"], color.inputs["A"])
    links.new(band_tone.outputs["Color"], color.inputs["B"])
    # Üregek: Voronoi-cellák, csoportokba rendezve
    cells = nodes.new("ShaderNodeTexVoronoi")
    cells.inputs["Scale"].default_value = 420.0
    links.new(bands_map.outputs["Vector"], cells.inputs["Vector"])
    cluster = nodes.new("ShaderNodeTexNoise")
    cluster.inputs["Scale"].default_value = 28.0
    cluster.inputs["Detail"].default_value = 3.0
    links.new(bands_map.outputs["Vector"], cluster.inputs["Vector"])
    cluster_gate = nodes.new("ShaderNodeMapRange")
    cluster_gate.inputs["From Min"].default_value = 0.56
    cluster_gate.inputs["From Max"].default_value = 0.66
    links.new(cluster.outputs["Fac"], cluster_gate.inputs["Value"])
    pit = nodes.new("ShaderNodeMapRange")
    pit.inputs["From Min"].default_value = 0.0
    pit.inputs["From Max"].default_value = 0.22
    pit.inputs["To Min"].default_value = 1.0
    pit.inputs["To Max"].default_value = 0.0
    links.new(cells.outputs["Distance"], pit.inputs["Value"])
    pits = nodes.new("ShaderNodeMath")
    pits.operation = "MULTIPLY"
    links.new(pit.outputs["Result"], pits.inputs[0])
    links.new(cluster_gate.outputs["Result"], pits.inputs[1])
    dark = nodes.new("ShaderNodeMix")
    dark.data_type = "RGBA"
    dark.blend_type = "MULTIPLY"
    links.new(pits.outputs[0], dark.inputs["Factor"])
    links.new(color.outputs["Result"], dark.inputs["A"])
    dark.inputs["B"].default_value = (0.42, 0.36, 0.3, 1)
    links.new(dark.outputs["Result"], bsdf.inputs["Base Color"])
    # Felület: selyemfényű, az üregekben matt
    rough = nodes.new("ShaderNodeMapRange")
    rough.inputs["To Min"].default_value = 0.36
    rough.inputs["To Max"].default_value = 0.56
    links.new(big.outputs["Fac"], rough.inputs["Value"])
    rough_pit = nodes.new("ShaderNodeMath")
    rough_pit.operation = "MAXIMUM"
    links.new(rough.outputs["Result"], rough_pit.inputs[0])
    links.new(pits.outputs[0], rough_pit.inputs[1])
    links.new(rough_pit.outputs[0], bsdf.inputs["Roughness"])
    grain = nodes.new("ShaderNodeTexNoise")
    grain.inputs["Scale"].default_value = 900.0
    grain.inputs["Detail"].default_value = 4.0
    links.new(coord.outputs["Object"], grain.inputs["Vector"])
    height = nodes.new("ShaderNodeMath")
    height.operation = "SUBTRACT"
    links.new(grain.outputs["Fac"], height.inputs[0])
    pit_depth = nodes.new("ShaderNodeMath")
    pit_depth.operation = "MULTIPLY"
    pit_depth.inputs[1].default_value = 14.0
    links.new(pits.outputs[0], pit_depth.inputs[0])
    links.new(pit_depth.outputs[0], height.inputs[1])
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.5
    bump.inputs["Distance"].default_value = 0.00012
    links.new(height.outputs[0], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def plaster(color=(0.42, 0.38, 0.33, 1), name="Plaster"):
    """Simított vakolat: matt, alig érezhető hullámzással."""
    mat, nodes, links, bsdf, coord = _principled(name)
    bsdf.inputs["Roughness"].default_value = 0.92
    noise = nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 9.0
    noise.inputs["Detail"].default_value = 9.0
    noise.inputs["Roughness"].default_value = 0.65
    links.new(coord.outputs["Object"], noise.inputs["Vector"])
    tone = nodes.new("ShaderNodeMapRange")
    tone.inputs["To Min"].default_value = 0.86
    tone.inputs["To Max"].default_value = 1.08
    links.new(noise.outputs["Fac"], tone.inputs["Value"])
    mul = nodes.new("ShaderNodeMix")
    mul.data_type = "RGBA"
    mul.blend_type = "MULTIPLY"
    mul.inputs["Factor"].default_value = 1.0
    mul.inputs["A"].default_value = color
    links.new(tone.outputs["Result"], mul.inputs["B"])
    links.new(mul.outputs["Result"], bsdf.inputs["Base Color"])
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.35
    bump.inputs["Distance"].default_value = 0.002
    links.new(noise.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def walnut():
    """Olajozott diófa: sötét, hosszanti erezet, selyemfény."""
    mat, nodes, links, bsdf, coord = _principled("Walnut")
    stretch = _mapping(nodes, links, coord, scale=(1.2, 16.0, 16.0))
    rings = nodes.new("ShaderNodeTexNoise")
    rings.inputs["Scale"].default_value = 2.4
    rings.inputs["Detail"].default_value = 7.0
    rings.inputs["Distortion"].default_value = 2.2
    links.new(stretch.outputs["Vector"], rings.inputs["Vector"])
    tone = _ramp(nodes, [(0.22, (0.022, 0.011, 0.006, 1)), (0.5, (0.060, 0.030, 0.015, 1)), (0.78, (0.115, 0.058, 0.028, 1))])
    links.new(rings.outputs["Fac"], tone.inputs["Fac"])
    pores_map = _mapping(nodes, links, coord, scale=(6.0, 900.0, 900.0))
    pores = nodes.new("ShaderNodeTexNoise")
    pores.inputs["Scale"].default_value = 1.0
    pores.inputs["Detail"].default_value = 3.0
    links.new(pores_map.outputs["Vector"], pores.inputs["Vector"])
    pore_tone = nodes.new("ShaderNodeMapRange")
    pore_tone.inputs["From Min"].default_value = 0.35
    pore_tone.inputs["From Max"].default_value = 0.65
    pore_tone.inputs["To Min"].default_value = 0.7
    pore_tone.inputs["To Max"].default_value = 1.05
    links.new(pores.outputs["Fac"], pore_tone.inputs["Value"])
    mul = nodes.new("ShaderNodeMix")
    mul.data_type = "RGBA"
    mul.blend_type = "MULTIPLY"
    mul.inputs["Factor"].default_value = 1.0
    links.new(tone.outputs["Color"], mul.inputs["A"])
    links.new(pore_tone.outputs["Result"], mul.inputs["B"])
    links.new(mul.outputs["Result"], bsdf.inputs["Base Color"])
    rough = nodes.new("ShaderNodeMapRange")
    rough.inputs["To Min"].default_value = 0.3
    rough.inputs["To Max"].default_value = 0.48
    links.new(pores.outputs["Fac"], rough.inputs["Value"])
    links.new(rough.outputs["Result"], bsdf.inputs["Roughness"])
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.4
    bump.inputs["Distance"].default_value = 0.00008
    links.new(pores.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def linen(color=(0.62, 0.55, 0.44, 1)):
    mat, nodes, links, bsdf, coord = _principled("Linen")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = 0.9
    bsdf.inputs["Sheen Weight"].default_value = 0.5
    bsdf.inputs["Sheen Roughness"].default_value = 0.5
    weave = nodes.new("ShaderNodeTexNoise")
    weave.inputs["Scale"].default_value = 500.0
    weave.inputs["Detail"].default_value = 2.0
    links.new(coord.outputs["Object"], weave.inputs["Vector"])
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.4
    bump.inputs["Distance"].default_value = 0.0004
    links.new(weave.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def matte(name, color, roughness=0.85):
    mat, nodes, links, bsdf, coord = _principled(name)
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def emission(name, color, strength):
    mat, nodes, links, out = _new(name)
    emit = nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = color
    emit.inputs["Strength"].default_value = strength
    links.new(emit.outputs[0], out.inputs["Surface"])
    return mat


def blocker():
    """Fényt elnyelő takarás (ablakkeret, lombozat árnyéka)."""
    return matte("Blocker", (0, 0, 0, 1), 1.0)
