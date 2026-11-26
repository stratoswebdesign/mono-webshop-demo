"""
mono cseppentős üveg – részletes modell, valós méretben (milliméterben megadva).

Minden alkatrész forgástestként, kódból épül, hogy a méretek egy helyen
legyenek és a modell bármikor újragenerálható legyen. Elöl = -Y irány
(glTF exportnál ebből lesz a three.js +Z, vagyis a kamera felé néző oldal).
"""
import math

import bmesh
import bpy

MM = 0.001

# ── Fő méretek (mm) ────────────────────────────────────────────────────────
BODY_R = 16.5          # az üvegtest külső sugara (33 mm átmérő)
WALL = 1.6             # falvastagság
SHOULDER_Z = 61.0      # a váll kezdete
NECK_R = 7.6
NECK_START_Z = 72.97
LIP_Z = 84.5
FILL_Z = 56.5          # folyadékszint

RING_Z0, RING_Z1, RING_R = 74.7, 78.0, 10.95       # garanciazáró gyűrű
COLLAR_Z0, COLLAR_Z1, COLLAR_R = 78.35, 90.6, 10.2  # bordázott kupak
RIBS = 64
BULB_Z0 = 90.6
TOTAL_Z = 114.0

LABEL_Z0 = 14.4
LABEL_H = 45.9
LABEL_R = BODY_R + 0.07
LABEL_ARC = 2.0 * LABEL_H / LABEL_R   # 2:1 arányú textúrához (kb. 317°)


def arc(cx, cz, r, a0, a1, n):
    """Körív pontjai (fokban), a végpontokkal együtt."""
    pts = []
    for i in range(n + 1):
        a = math.radians(a0 + (a1 - a0) * i / n)
        pts.append((cx + r * math.cos(a), cz + r * math.sin(a)))
    return pts


def clean(points, eps=1e-5):
    out = []
    for p in points:
        if not out or abs(p[0] - out[-1][0]) > eps or abs(p[1] - out[-1][1]) > eps:
            out.append(p)
    return out


def line(p0, p1, n):
    return [(p0[0] + (p1[0] - p0[0]) * i / n, p0[1] + (p1[1] - p0[1]) * i / n) for i in range(n + 1)]


def _finish(bm, name, smooth=True):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    if smooth:
        for poly in mesh.polygons:
            poly.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def lathe(name, profile, segments=128, closed=False, flip=False):
    """Forgástest (r, z) mm-profilból. r≈0 pontok egyetlen tengelycsúccsá olvadnak."""
    profile = clean(profile)
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    thetas = [-math.pi + 2 * math.pi * i / segments for i in range(segments)]

    lengths = [0.0]
    for a, b in zip(profile, profile[1:]):
        lengths.append(lengths[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    total = lengths[-1] or 1.0

    rings = []
    for r, z in profile:
        if r < 1e-6:
            rings.append([bm.verts.new((0.0, 0.0, z * MM))])
        else:
            rings.append([bm.verts.new((r * MM * math.sin(t), -r * MM * math.cos(t), z * MM)) for t in thetas])

    def quad(ia, ib):
        a, b = rings[ia], rings[ib]
        va, vb = lengths[ia] / total, lengths[ib] / total
        if len(a) == 1 and len(b) == 1:
            return
        for i in range(segments):
            j = (i + 1) % segments
            u0, u1 = i / segments, (i + 1) / segments
            if len(a) == 1:
                face = bm.faces.new((a[0], b[i], b[j]))
                uvs = [((u0 + u1) / 2, va), (u0, vb), (u1, vb)]
            elif len(b) == 1:
                face = bm.faces.new((a[i], a[j], b[0]))
                uvs = [(u0, va), (u1, va), ((u0 + u1) / 2, vb)]
            else:
                face = bm.faces.new((a[i], a[j], b[j], b[i]))
                uvs = [(u0, va), (u1, va), (u1, vb), (u0, vb)]
            for loop, coord in zip(face.loops, uvs):
                loop[uv].uv = coord

    for i in range(len(rings) - 1):
        quad(i, i + 1)
    if closed:
        quad(len(rings) - 1, 0)
    obj = _finish(bm, name)
    if flip:
        obj.data.flip_normals()
    return obj


# ── Üvegtest ───────────────────────────────────────────────────────────────

def _shoulder(offset=0.0, n=20):
    """A váll két érintő körívből: domború, majd homorú átmenet a nyakba."""
    r1, r2 = 9.5 - offset, 3.0 + offset
    c1 = (BODY_R - 9.5, SHOULDER_Z)
    c2 = (NECK_R + 3.0, NECK_START_Z)
    ang = math.degrees(math.atan2(c2[1] - c1[1], c2[0] - c1[0]))
    return arc(c1[0], c1[1], r1, 0, ang, n) + arc(c2[0], c2[1], r2, 180 + ang, 180, max(6, n // 2))[1:]


def glass_outer_profile():
    pts = [(0.0, 1.9)]
    pts += [(3.5, 1.85), (7.0, 1.6), (9.8, 1.0), (11.4, 0.35)]   # homorú talp (benyomás)
    pts += arc(12.4, 0.75, 0.75, 215, 270, 5)                      # felfekvő perem
    pts += [(13.2, 0.0)]
    pts += arc(13.2, 3.3, 3.3, 270, 360, 14)                       # sarok lekerekítése
    pts += line((BODY_R, 3.3), (BODY_R, SHOULDER_Z), 2)[1:]
    pts += _shoulder(0.0)[1:]
    pts += [(NECK_R, 73.6)]
    pts += arc(7.9, 75.6, 1.75, -60, 60, 10)                       # nyakgyűrű (perem a kupak alatt)
    pts += [(NECK_R + 0.25, 77.75), (NECK_R + 0.25, 83.4)]
    pts += arc(NECK_R + 0.25 - 1.0, 83.5, 1.0, 0, 90, 6)           # száj külső íve
    return clean(pts)


def glass_inner_profile():
    """A belső üreg alulról felfelé (a tengelytől a szájig)."""
    inner_r = BODY_R - WALL
    pts = [(0.0, 5.3), (5.0, 5.15), (9.5, 4.75)]
    pts += arc(inner_r - 3.2, 7.9, 3.2, 270, 360, 10)
    pts += line((inner_r, 7.9), (inner_r, SHOULDER_Z), 2)[1:]
    pts += _shoulder(WALL)[1:]
    neck_inner = NECK_R - WALL
    pts += [(neck_inner, 74.5), (neck_inner, 83.6)]
    pts += arc(neck_inner + 0.8, 83.7, 0.8, 180, 90, 5)[1:]
    return clean(pts)


def build_glass(segments=160):
    """Tömör üvegtest: külső palást + száj + belső üreg (zárt, vízzáró háló)."""
    outer = glass_outer_profile()
    inner = glass_inner_profile()
    return lathe("Glass", outer + inner[::-1], segments)


def build_glass_shell(segments=128):
    """Csak a külső palást – valós idejű megjelenítéshez (three.js)."""
    return lathe("GlassShell", glass_outer_profile(), segments)


def build_glass_cavity(segments=96):
    """A belső üreg felülete – valós idejű megjelenítéshez, vastagságérzethez."""
    return lathe("GlassCavity", glass_inner_profile(), segments, flip=True)


def build_liquid(segments=128):
    """Folyadék: a belső üreget tölti ki a szintig, a fal mentén meniszkusszal.
    Kicsit belelóg az üvegbe (átfedés), hogy ne maradjon légrés a két közeg közt."""
    grow = 0.06
    inner = glass_inner_profile()
    pts = []
    for r, z in inner:
        if z > FILL_Z:
            break
        pts.append((r + (grow if r > 0 else 0.0), z - grow))
    wall_r = BODY_R - WALL + grow
    pts.append((wall_r, FILL_Z + 0.9))                 # meniszkusz a falnál
    pts += [(wall_r - 0.25, FILL_Z + 0.45), (wall_r - 0.7, FILL_Z + 0.15), (wall_r - 1.6, FILL_Z)]
    pts += [(5.6, FILL_Z), (4.4, FILL_Z + 0.12), (3.6, FILL_Z + 0.5), (0.0, FILL_Z + 0.5)]
    return lathe("Liquid", pts, segments)


# ── Üvegpipetta ────────────────────────────────────────────────────────────

def build_pipette(segments=48, shell_only=False):
    r_out, r_in = 3.3, 2.5
    top, taper_z, tip_z = 88.5, 15.0, 5.9
    outer = [(0.0, tip_z - 0.05)] if shell_only else []
    outer += [(0.75, tip_z)] + arc(1.05, tip_z + 0.5, 0.5, 270, 345, 4)[1:]
    outer += [(1.7, tip_z + 1.6), (2.3, tip_z + 4.2), (2.95, taper_z - 3.0), (r_out, taper_z), (r_out, top)]
    if shell_only:
        return lathe("PipetteShell", clean(outer), segments)
    inner = [(r_in, top), (r_in, taper_z), (2.1, taper_z - 3.2), (1.45, tip_z + 4.2), (0.9, tip_z + 1.6)]
    return lathe("Pipette", clean(outer + inner), segments, closed=True)


# ── Kupak ──────────────────────────────────────────────────────────────────

def build_ring(segments=128):
    """Garanciazáró gyűrű a kupak alatt, enyhén kihajló alsó peremmel."""
    pts = [(8.4, RING_Z0 + 0.5)]
    pts += [(RING_R - 0.9, RING_Z0)] + arc(RING_R - 0.45, RING_Z0 + 0.45, 0.45, 270, 360, 5)[1:]
    pts += [(RING_R - 0.12, RING_Z1 - 0.55)] + arc(RING_R - 0.5, RING_Z1 - 0.4, 0.4, 0, 90, 5)[1:]
    pts += [(8.4, RING_Z1)]
    return lathe("CapRing", clean(pts), segments, closed=True)


def build_collar(per_rib=8):
    """Bordázott kupak: a bordák a felső letörésnél és az alsó sávnál kifutnak."""
    segments = RIBS * per_rib
    depth = 0.46
    # (z, sugár, bordamélység 0..1)
    rows = [
        (COLLAR_Z0 + 0.25, 8.6, 0.0),
        (COLLAR_Z0, 9.3, 0.0),
        (COLLAR_Z0, COLLAR_R - 0.35, 0.0),
        (COLLAR_Z0 + 0.3, COLLAR_R - 0.08, 0.0),
        (COLLAR_Z0 + 1.1, COLLAR_R, 0.0),
        (COLLAR_Z0 + 1.6, COLLAR_R, 0.55),
        (COLLAR_Z0 + 2.2, COLLAR_R, 1.0),
        (COLLAR_Z0 + 5.0, COLLAR_R, 1.0),
        (COLLAR_Z1 - 2.6, COLLAR_R, 1.0),
        (COLLAR_Z1 - 1.5, COLLAR_R, 1.0),
        (COLLAR_Z1 - 0.95, COLLAR_R - 0.12, 0.7),
        (COLLAR_Z1 - 0.45, COLLAR_R - 0.5, 0.25),
        (COLLAR_Z1 - 0.12, COLLAR_R - 1.05, 0.0),
        (COLLAR_Z1, COLLAR_R - 1.7, 0.0),
        (COLLAR_Z1, 7.9, 0.0),
        (COLLAR_Z1 - 0.5, 7.55, 0.0),
        (COLLAR_Z1 - 2.5, 7.5, 0.0),
    ]
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    rings = []
    for z, radius, amount in rows:
        ring = []
        for i in range(segments):
            t = (i % per_rib) / per_rib
            crest = (0.5 * (1.0 + math.cos(2 * math.pi * t))) ** 0.55   # széles hát, keskeny horony
            r = radius - depth * amount * (1.0 - crest)
            theta = -math.pi + 2 * math.pi * i / segments
            ring.append(bm.verts.new((r * MM * math.sin(theta), -r * MM * math.cos(theta), z * MM)))
        rings.append(ring)
    for k in range(len(rings) - 1):
        a, b = rings[k], rings[k + 1]
        for i in range(segments):
            j = (i + 1) % segments
            face = bm.faces.new((a[i], a[j], b[j], b[i]))
            v0, v1 = k / (len(rings) - 1), (k + 1) / (len(rings) - 1)
            for loop, coord in zip(face.loops, [(i / segments, v0), ((i + 1) / segments, v0), ((i + 1) / segments, v1), (i / segments, v1)]):
                loop[uv].uv = coord
    return _finish(bm, "CapCollar")


def build_bulb(segments=96):
    """Gumipipetta: szélesebb talpgyűrű, enyhén szűkülő test, lekerekített tető."""
    z0 = BULB_Z0
    pts = [(7.2, z0 - 2.2), (7.45, z0 - 0.4)]
    pts += arc(7.45, z0 + 0.55, 0.55, 270, 360, 5)[1:]              # talpgyűrű alsó íve
    pts += [(8.0, z0 + 1.9)]
    pts += arc(7.35, z0 + 1.9, 0.65, 0, 90, 6)[1:]                  # talpgyűrű felső íve
    pts += [(6.95, z0 + 2.56), (6.55, z0 + 2.75)]
    pts += arc(6.55, z0 + 3.35, 0.6, 270, 180, 5)[1:]               # homorú átmenet a testbe
    pts += [(5.98, z0 + 5.0), (6.02, z0 + 8.5), (6.0, z0 + 12.5), (5.86, z0 + 16.0)]
    top_c = TOTAL_Z - 5.75
    pts += [(5.75 * math.cos(math.radians(a)), top_c + 5.75 * math.sin(math.radians(a))) for a in range(6, 90, 6)]
    pts += [(0.0, TOTAL_Z)]
    return lathe("Bulb", clean(pts), segments)


# ── Címke ──────────────────────────────────────────────────────────────────

def build_label(seg_u=256, seg_v=64, thickness=0.11):
    """Papírcímke: hengerpalást-szelet 0..1 UV-val, hátul illesztési hézaggal."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    grid = []
    for iv in range(seg_v + 1):
        z = LABEL_Z0 + LABEL_H * iv / seg_v
        row = []
        for iu in range(seg_u + 1):
            theta = -LABEL_ARC / 2 + LABEL_ARC * iu / seg_u
            row.append(bm.verts.new((LABEL_R * MM * math.sin(theta), -LABEL_R * MM * math.cos(theta), z * MM)))
        grid.append(row)
    for iv in range(seg_v):
        for iu in range(seg_u):
            face = bm.faces.new((grid[iv][iu], grid[iv][iu + 1], grid[iv + 1][iu + 1], grid[iv + 1][iu]))
            coords = [(iu / seg_u, iv / seg_v), ((iu + 1) / seg_u, iv / seg_v), ((iu + 1) / seg_u, (iv + 1) / seg_v), (iu / seg_u, (iv + 1) / seg_v)]
            for loop, coord in zip(face.loops, coords):
                loop[uv].uv = coord
    obj = _finish(bm, "Label")
    if thickness:
        mod = obj.modifiers.new("Thickness", "SOLIDIFY")
        mod.thickness = thickness * MM
        mod.offset = 1.0
    return obj
