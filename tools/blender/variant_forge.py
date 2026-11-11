# variant_forge.py - Gera variantes coloridas de GLBs base (recolor HSV + normalize)
# Lancha Jet Quadriciclo - Rifaina/SP
#
# Uso (Blender headless):
#   blender --background --factory-startup --python variant_forge.py -- <modo> <outdir> [slug|ALL]
#   modos: preview | export | all
#
# Pipeline por variante:
#   1. importa o GLB base
#   2. bake de transforms (tudo em mesh data, sem hierarquia)
#   3. recolor da textura basecolor por regras HSV (tint/set, preserva sombreado)
#   4. escala uniforme p/ comprimento alvo + normaliza (XY centrado, min z=0)
#   5. renderiza 2 previews (3/4 e de cima)
#   6. exporta GLB

import bpy
import json
import math
import os
import sys

import numpy as np
from mathutils import Vector, Matrix

# ============================================================
# CONFIG: slug -> base + regras + comprimento alvo (m)
# h em 0..1 (wrap ok), s/v em 0..1; cores sRGB 0..1
# ============================================================

BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'in')

B = {
    'jetski': os.path.join(BASE_DIR, 'grab3d-jet-ski.glb'),
    'motorboat': os.path.join(BASE_DIR, 'grab3d-motorboat.glb'),
    'speedboat': os.path.join(BASE_DIR, 'grab3d-speedboat.glb'),
    'yacht': os.path.join(BASE_DIR, 'grab3d-yacht.glb'),
}

# --- regras comuns -------------------------------------------------------
# brancos/claros neutros (casco + deck) -> tint do casco
W = {'s': [0.0, 0.07], 'v': [0.55, 1.01]}
# mint (capo do jet-ski)
MINT = {'h': [0.36, 0.52], 's': [0.07, 0.35], 'v': [0.55, 1.01]}
# coral (listras/poltronas/rodado)
CORAL = {'h': [0.94, 0.09], 's': [0.08, 0.45], 'v': [0.5, 1.01]}
# azul-céu (casco do speedboat)
SKYBLUE = {'h': [0.48, 0.63], 's': [0.08, 0.40], 'v': [0.5, 1.01]}

WHITE = (0.93, 0.93, 0.92)
RED = (0.72, 0.11, 0.10)
NAVY = (0.07, 0.20, 0.50)
GRAPHITE = (0.21, 0.23, 0.26)
GREEN = (0.13, 0.32, 0.24)
ORANGE = (0.85, 0.35, 0.07)
BLUE = (0.09, 0.34, 0.66)
SAND = (0.88, 0.82, 0.68)
LIGHTGREY = (0.80, 0.82, 0.84)
MIDNIGHT = (0.06, 0.10, 0.24)
CRIMSON = (0.60, 0.08, 0.10)
TEAL = (0.03, 0.36, 0.40)
BURGUNDY = (0.37, 0.07, 0.13)
SKYBLUE_LIGHT = (0.60, 0.78, 0.88)
FOREST = (0.11, 0.32, 0.20)

# ============================================================
# PRODUCTS: os 29 produtos do catálogo (slug = nome do GLB)
# lengths derivados dos nomes em pés (ft * 0.3048)
# ============================================================

PRODUCTS = {
    # --- 10 jetskis Sea-Doo (base grab3d jet-ski) ---
    'sea-doo-explorer-pro-230': {'base': 'jetski', 'len': 3.70,
        'rules': [{'m': W, 'op': 'set', 'c': GRAPHITE}, {'m': MINT, 'op': 'set', 'c': ORANGE}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'sea-doo-gtx-170-2025': {'base': 'jetski', 'len': 3.58,
        'rules': [{'m': W, 'op': 'set', 'c': NAVY}, {'m': MINT, 'op': 'set', 'c': LIGHTGREY}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'sea-doo-gtx-230-2025': {'base': 'jetski', 'len': 3.58,
        'rules': [{'m': W, 'op': 'set', 'c': BLUE}, {'m': MINT, 'op': 'set', 'c': WHITE}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'sea-doo-wake-pro-230-2024': {'base': 'jetski', 'len': 3.68,
        'rules': [{'m': W, 'op': 'set', 'c': NAVY}, {'m': MINT, 'op': 'set', 'c': (0.95, 0.90, 0.10)}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'sea-doo-rxtx-325': {'base': 'jetski', 'len': 3.58,
        'rules': [{'m': W, 'op': 'set', 'c': RED}, {'m': MINT, 'op': 'set', 'c': WHITE}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'sea-doo-gtx-limited-325-2025': {'base': 'jetski', 'len': 3.58,
        'rules': [{'m': W, 'op': 'set', 'c': MIDNIGHT}, {'m': MINT, 'op': 'set', 'c': (0.80, 0.66, 0.30)}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'sea-doo-gtx-325-limited-2025': {'base': 'jetski', 'len': 3.58,
        'rules': [{'m': W, 'op': 'set', 'c': MIDNIGHT}, {'m': MINT, 'op': 'set', 'c': LIGHTGREY}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'sea-doo-gti-90-2018': {'base': 'jetski', 'len': 3.35,
        'rules': [{'m': W, 'op': 'set', 'c': TEAL}, {'m': MINT, 'op': 'set', 'c': WHITE}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'sea-doo-gtx-170-2022': {'base': 'jetski', 'len': 3.58,
        'rules': [{'m': W, 'op': 'set', 'c': CRIMSON}, {'m': MINT, 'op': 'set', 'c': WHITE}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'sea-doo-wake-155-2013': {'base': 'jetski', 'len': 3.50,
        'rules': [{'m': W, 'op': 'set', 'c': SKYBLUE_LIGHT}, {'m': MINT, 'op': 'set', 'c': NAVY}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    # --- lanchas open pequenas/médias (base grab3d motorboat) ---
    'lancha-mestra-198-2015': {'base': 'motorboat', 'len': 6.03,
        'rules': [{'m': W, 'op': 'set', 'c': NAVY}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'lancha-ventura-195-2013': {'base': 'motorboat', 'len': 5.94,
        'rules': [{'m': W, 'op': 'set', 'c': GRAPHITE}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'lancha-ventura-210-2021': {'base': 'motorboat', 'len': 6.40,
        'rules': [{'m': W, 'op': 'set', 'c': RED}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'lancha-ventura-215-2009': {'base': 'motorboat', 'len': 6.55,
        'rules': [{'m': W, 'op': 'set', 'c': FOREST}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'lancha-ventura-190-2008': {'base': 'motorboat', 'len': 5.79,
        'rules': [{'m': W, 'op': 'set', 'c': BLUE}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'lancha-ventura-210-comfort-2014': {'base': 'motorboat', 'len': 6.40,
        'rules': [{'m': W, 'op': 'set', 'c': SAND}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'lancha-ventura-175-2011': {'base': 'motorboat', 'len': 5.33,
        'rules': [{'m': W, 'op': 'set', 'c': TEAL}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'lancha-ventura-195-2012': {'base': 'motorboat', 'len': 5.94,
        'rules': [{'m': W, 'op': 'set', 'c': ORANGE}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'lancha-ventura-195-crossover-2022': {'base': 'motorboat', 'len': 5.94,
        'rules': [{'m': W, 'op': 'set', 'c': SKYBLUE_LIGHT}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'lancha-focker-222-2003': {'base': 'motorboat', 'len': 6.77,
        'rules': [{'m': W, 'op': 'set', 'c': BURGUNDY}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'lancha-ventura-1992': {'base': 'motorboat', 'len': 5.70,
        'rules': [{'m': W, 'op': 'set', 'c': LIGHTGREY}, {'m': CORAL, 'op': 'set', 'c': NAVY}]},
    # --- esportivas / grandes (base grab3d speedboat) ---
    'lancha-triton-240-open-sport-2014': {'base': 'speedboat', 'len': 7.32,
        'rules': [{'m': SKYBLUE, 'op': 'set', 'c': RED}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'lancha-focker-255-gto-2024': {'base': 'speedboat', 'len': 7.77,
        'rules': [{'m': SKYBLUE, 'op': 'set', 'c': GRAPHITE}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'lancha-ventura-250-comfort-2021': {'base': 'speedboat', 'len': 7.62,
        'rules': [{'m': SKYBLUE, 'op': 'set', 'c': NAVY}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'lancha-fs-275-wide-2021': {'base': 'speedboat', 'len': 8.38,
        'rules': [{'m': SKYBLUE, 'op': 'set', 'c': MIDNIGHT}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    'lancha-focker-230-black-2018': {'base': 'speedboat', 'len': 7.01,
        'rules': [{'m': SKYBLUE, 'op': 'set', 'c': GRAPHITE}, {'m': CORAL, 'op': 'set', 'c': CRIMSON}]},
    'lancha-mestra-230-2021': {'base': 'speedboat', 'len': 7.01,
        'rules': [{'m': SKYBLUE, 'op': 'set', 'c': BLUE}, {'m': CORAL, 'op': 'set', 'c': WHITE}]},
    # --- cabinadas (base grab3d yacht) ---
    'lancha-focker-230-cabinada': {'base': 'yacht', 'len': 7.01,
        'rules': [{'m': SKYBLUE, 'op': 'set', 'c': MIDNIGHT}, {'m': CORAL, 'op': 'set', 'c': RED}]},
    'lancha-fs-230-scappare-2011': {'base': 'yacht', 'len': 7.01,
        'rules': [{'m': SKYBLUE, 'op': 'set', 'c': NAVY}, {'m': CORAL, 'op': 'set', 'c': NAVY}]},
}

TESTS = {
    'test-js-red': {
        'base': 'jetski', 'len': 3.35,
        'rules': [
            {'m': W, 'op': 'set', 'c': RED},
            {'m': MINT, 'op': 'set', 'c': WHITE},
            {'m': CORAL, 'op': 'set', 'c': WHITE},
        ],
    },
    'test-js-navy': {
        'base': 'jetski', 'len': 3.35,
        'rules': [
            {'m': W, 'op': 'set', 'c': NAVY},
            {'m': MINT, 'op': 'set', 'c': LIGHTGREY},
            {'m': CORAL, 'op': 'set', 'c': WHITE},
        ],
    },
    'test-js-graphite': {
        'base': 'jetski', 'len': 3.35,
        'rules': [
            {'m': W, 'op': 'set', 'c': GRAPHITE},
            {'m': MINT, 'op': 'set', 'c': RED},
            {'m': CORAL, 'op': 'set', 'c': WHITE},
        ],
    },
    'test-mb-navy': {
        'base': 'motorboat', 'len': 6.2,
        'rules': [
            {'m': W, 'op': 'set', 'c': NAVY},
            {'m': CORAL, 'op': 'set', 'c': WHITE},
        ],
    },
    'test-mb-graphite': {
        'base': 'motorboat', 'len': 6.2,
        'rules': [
            {'m': W, 'op': 'set', 'c': GRAPHITE},
            {'m': CORAL, 'op': 'set', 'c': WHITE},
        ],
    },
    'test-sb-red': {
        'base': 'speedboat', 'len': 7.8,
        'rules': [
            {'m': SKYBLUE, 'op': 'set', 'c': RED},
            {'m': CORAL, 'op': 'set', 'c': WHITE},
        ],
    },
    'test-yt-navy': {
        'base': 'yacht', 'len': 7.6,
        'rules': [
            {'m': SKYBLUE, 'op': 'set', 'c': MIDNIGHT},
            {'m': CORAL, 'op': 'set', 'c': RED},
        ],
    },
}

# ============================================================
# HSV vetorizado (sRGB)
# ============================================================

def rgb_to_hsv_vec(rgb):
    r, g, b = rgb[:, 0], rgb[:, 1], rgb[:, 2]
    mx = np.max(rgb, axis=1)
    mn = np.min(rgb, axis=1)
    v = mx
    delta = mx - mn
    s = np.where(mx > 0, delta / np.maximum(mx, 1e-9), 0.0)
    d = np.where(delta > 0, delta, 1e-9)
    rc = (mx - r) / d
    gc = (mx - g) / d
    bc = (mx - b) / d
    h = np.where(mx == r, bc - gc, np.where(mx == g, 2.0 + rc - bc, 4.0 + gc - rc))
    h = (h / 6.0) % 1.0
    h = np.where(delta > 0, h, 0.0)
    return h, s, v


def hsv_to_rgb_vec(h, s, v):
    i = np.floor(h * 6.0)
    f = h * 6.0 - i
    p = v * (1.0 - s)
    q = v * (1.0 - f * s)
    t = v * (1.0 - (1.0 - f) * s)
    i = i.astype(np.int32) % 6
    r = np.choose(i, [v, q, p, p, t, v])
    g = np.choose(i, [t, v, v, q, p, p])
    b = np.choose(i, [p, p, t, v, v, q])
    return np.stack([r, g, b], axis=1)


def srgb_to_lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lin_to_srgb(c):
    c = np.clip(c, 0.0, 1.0)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * (c ** (1.0 / 2.4)) - 0.055)

# ============================================================
# RECOLOR
# ============================================================


def recolor_image(img, rules, tag):
    w, h, ch = img.size[0], img.size[1], img.channels
    if w == 0 or h == 0:
        print('RECOLOR skip (sem imagem): ' + tag)
        return
    buf = np.empty(w * h * ch, dtype=np.float32)
    img.pixels.foreach_get(buf)
    px = buf.reshape(-1, ch)
    rgb_s = lin_to_srgb(np.clip(px[:, :3], 0.0, 1.0))
    hh, ss, vv = rgb_to_hsv_vec(rgb_s)
    new = rgb_s.copy()
    n_changed_total = 0
    for rule in rules:
        mask = np.ones(len(rgb_s), dtype=bool)
        if 'h' in rule['m']:
            lo, hi = rule['m']['h']
            mask &= (hh >= lo) & (hh < hi) if lo < hi else ((hh >= lo) | (hh < hi))
        for key, arr in (('s', ss), ('v', vv)):
            if key in rule['m']:
                lo, hi = rule['m'][key]
                mask &= (arr >= lo) & (arr < hi)
        if not mask.any():
            continue
        n = int(mask.sum())
        n_changed_total += n
        if rule['op'] == 'tint':
            new[mask] = np.clip(new[mask] * np.array(rule['c'], dtype=np.float32), 0.0, 1.0)
        elif rule['op'] == 'set':
            c = np.array(rule['c'], dtype=np.float32).reshape(1, 3)
            th, ts, tv = rgb_to_hsv_vec(c)
            # escala o brilho: V_original * (V_alvo / vref) preserva sombreado
            # e ancora a cor no tom alvo (vref = V tipico da area de origem)
            vref = rule.get('vref', 0.85)
            new_v = np.clip(vv[mask] * (tv[0] / vref), 0.0, 1.0)
            new[mask] = hsv_to_rgb_vec(np.full(n, th[0]), np.full(n, ts[0]), new_v)
    px_out = buf.reshape(-1, ch)
    px_out[:, :3] = srgb_to_lin(new)
    img.pixels.foreach_set(px_out.ravel())
    img.update()
    try:
        img.pack()
    except Exception:
        pass
    print('RECOLOR %s: %d px alterados' % (tag, n_changed_total))


def recolor_materials(rules):
    for m in bpy.data.materials:
        if not m.use_nodes:
            continue
        for n in m.node_tree.nodes:
            if n.type == 'TEX_IMAGE' and n.image and 'basecolor' in (n.image.name or '').lower():
                recolor_image(n.image, rules, n.image.name)

# ============================================================
# BAKE / NORMALIZE / ESCALA
# ============================================================


def bake_world():
    bpy.context.view_layer.update()
    meshes = [ob for ob in bpy.context.scene.objects if ob.type == 'MESH']
    for ob in meshes:
        mw = ob.matrix_world.copy()
        ob.data.transform(mw)
    for ob in meshes:
        ob.parent = None
        ob.matrix_world = Matrix()
    for ob in list(bpy.context.scene.objects):
        if ob.type == 'EMPTY':
            bpy.data.objects.remove(ob, do_unlink=True)
    bpy.context.view_layer.update()


def orient_length_to_x():
    bpy.context.view_layer.update()
    lo, hi = bbox()
    if (hi - lo).y > (hi - lo).x:
        root = bpy.data.objects.new('OrientRoot', None)
        bpy.context.scene.collection.objects.link(root)
        for ob in list(bpy.context.scene.objects):
            if ob != root and ob.parent is None and ob.type in ('MESH', 'EMPTY'):
                ob.parent = root
        root.rotation_euler = (0.0, 0.0, math.radians(90.0))
        bpy.context.view_layer.update()
        bake_world()


def bbox():
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for ob in bpy.context.scene.objects:
        if ob.type != 'MESH':
            continue
        for c in ob.bound_box:
            w = ob.matrix_world @ Vector(c)
            lo = Vector((min(lo.x, w.x), min(lo.y, w.y), min(lo.z, w.z)))
            hi = Vector((max(hi.x, w.x), max(hi.y, w.y), max(hi.z, w.z)))
    return lo, hi


def scale_to_length(target):
    bpy.context.view_layer.update()
    lo, hi = bbox()
    cur = max((hi - lo).x, (hi - lo).y)
    if cur < 1e-6:
        return
    s = target / cur
    for ob in bpy.context.scene.objects:
        if ob.type == 'MESH':
            ob.data.transform(Matrix.Diagonal((s, s, s, 1.0)))
    bpy.context.view_layer.update()


def normalize():
    bpy.context.view_layer.update()
    lo, hi = bbox()
    if lo.x > 1e8:
        return
    center = (lo + hi) / 2
    dx, dy, dz = -center.x, -center.y, -lo.z
    for ob in bpy.context.scene.objects:
        if ob.type == 'MESH':
            ob.data.transform(Matrix.Translation((dx, dy, dz)))
    bpy.context.view_layer.update()

# ============================================================
# RENDER (mesmo padrao do preview_candidates.py)
# ============================================================


def setup_render():
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.samples = 48
    try:
        sc.cycles.use_denoising = True
    except Exception:
        pass
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for dtype in ('OPTIX', 'CUDA'):
        try:
            prefs.compute_device_type = dtype
            prefs.get_devices()
            ok = False
            for d in prefs.devices:
                d.use = True
                ok = True
            if ok:
                sc.cycles.device = 'GPU'
                break
        except Exception:
            continue
    sc.render.resolution_x = 960
    sc.render.resolution_y = 540
    sc.render.image_settings.file_format = 'PNG'
    world = bpy.data.worlds.new('Mundo')
    sc.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get('Background')
    bg.inputs[0].default_value = (0.72, 0.75, 0.79, 1.0)
    bg.inputs[1].default_value = 1.0


def mat_floor():
    m = bpy.data.materials.new('PisoMat')
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (0.45, 0.46, 0.48, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.9
    return m


def add_stage(L, lo, hi):
    center = (lo + hi) / 2
    size = hi - lo
    bpy.ops.mesh.primitive_plane_add(size=L * 8, location=(center.x, center.y, lo.z - 0.02))
    floor = bpy.context.view_layer.objects.active
    floor.name = 'Piso'
    floor.data.materials.append(mat_floor())

    def area_light(name, loc, size_, energy):
        ld = bpy.data.lights.new(name, 'AREA')
        ld.size = size_
        ld.energy = energy
        ob = bpy.data.objects.new(name, ld)
        ob.location = loc
        bpy.context.collection.objects.link(ob)
        return ob

    area_light('LuzPrincipal', (L * 0.4, -L * 0.85, lo.z + L * 0.45 + 0.8), L * 0.7, 1200 * (L / 6.5))
    area_light('LuzPreenchimento', (L * 0.3, L * 0.95, lo.z + L * 0.30 + 0.6), L * 0.9, 380 * (L / 6.5))
    area_light('LuzTopo', (L * 0.55, 0.0, lo.z + L * 0.75 + 0.8), L * 0.8, 500 * (L / 6.5))

    def make_cam(name, campos, target):
        cam_data = bpy.data.cameras.new(name)
        cam_data.lens = 42
        cam = bpy.data.objects.new(name, cam_data)
        cam.location = campos
        direction = target - campos
        cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
        bpy.context.collection.objects.link(cam)
        return cam

    dist = max(size.x, size.y) * 1.5 + 0.3
    cam = make_cam('Cam', center + Vector((size.x * 0.45, -dist * 0.9, size.z * 0.7 + 0.6)),
                   center + Vector((-size.x * 0.10, 0.0, -size.z * 0.05)))
    cam_top = make_cam('CamTop', center + Vector((size.x * 0.05, -dist * 0.95, size.z * 1.35 + 0.9)),
                       center + Vector((-size.x * 0.05, 0.0, -size.z * 0.10)))
    return cam, cam_top


def snapshot_product_names():
    return {ob.name for ob in bpy.context.scene.objects if ob.type == 'MESH'}


def cleanup_stage(names):
    for ob in list(bpy.context.scene.objects):
        if (ob.type == 'MESH' and ob.name not in names) or ob.type in ('LIGHT', 'CAMERA'):
            bpy.data.objects.remove(ob, do_unlink=True)

# ============================================================
# EXPORT
# ============================================================


def export_glb(path):
    try:
        bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_apply=True)
    except TypeError:
        try:
            bpy.ops.export_scene.gltf(filepath=path, export_format='GLB')
        except TypeError:
            bpy.ops.export_scene.gltf(filepath=path)

# ============================================================
# MAIN
# ============================================================


def build_variant(slug, cfg, outdir, prevdir, mode):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=B[cfg['base']])
    bake_world()
    orient_length_to_x()
    recolor_materials(cfg['rules'])
    scale_to_length(cfg['len'])
    normalize()

    lo, hi = bbox()
    info = {
        'slug': slug,
        'dims_xyz': [round(v, 2) for v in ((hi - lo).x, (hi - lo).y, (hi - lo).z)],
        'meshes': len([ob for ob in bpy.context.scene.objects if ob.type == 'MESH']),
    }

    names = snapshot_product_names()
    if mode in ('preview', 'all'):
        setup_render()
        L = max((hi - lo).x, (hi - lo).y, (hi - lo).z, 0.1)
        cam, cam_top = add_stage(L, lo, hi)
        sc = bpy.context.scene
        sc.camera = cam
        sc.render.filepath = os.path.join(prevdir, slug + '.png')
        bpy.ops.render.render(write_still=True)
        sc.camera = cam_top
        sc.render.filepath = os.path.join(prevdir, slug + '-top.png')
        bpy.ops.render.render(write_still=True)
        cleanup_stage(names)

    if mode in ('export', 'all'):
        export_glb(os.path.join(outdir, slug + '.glb'))
    print('VARIANT-INFO ' + json.dumps(info, ensure_ascii=True))


def main():
    argv = sys.argv
    args = argv[argv.index('--') + 1:] if '--' in argv else []
    mode = args[0] if args else 'preview'
    outdir = args[1] if len(args) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out', 'test')
    slug = args[2] if len(args) > 2 else 'ALL'

    targets = []
    catalog = None
    if slug == 'ALL':
        catalog = TESTS
    elif slug == 'PRODUCTS:ALL':
        catalog = PRODUCTS
    elif slug in TESTS:
        catalog = {slug: TESTS[slug]}
    elif slug in PRODUCTS:
        catalog = {slug: PRODUCTS[slug]}
    if not catalog:
        print('SLUG INVALIDO: ' + slug)
        return
    targets = list(catalog.keys())
    os.makedirs(outdir, exist_ok=True)
    prevdir = os.path.join(outdir, 'previews')
    os.makedirs(prevdir, exist_ok=True)
    for s in targets:
        try:
            build_variant(s, catalog[s], outdir, prevdir, mode)
            print('OK variant: ' + s)
        except Exception as exc:
            print('FALHA variant: %s -> %r' % (s, exc))


main()
