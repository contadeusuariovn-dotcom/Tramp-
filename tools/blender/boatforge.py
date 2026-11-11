# boatforge.py - Gerador parametrico de modelos 3D (jetskis e lanchas)
# Lancha Jet Quadriciclo - Rifaina/SP
#
# Uso (Blender headless):
#   blender --background --factory-startup --python boatforge.py -- <modo> <outdir> [slug]
#   modos: preview | export | all
#   slug: nome do produto na CONFIG ou ALL
#
# Saidas:
#   <outdir>/<slug>.glb          (modo export/all)
#   <outdir>/previews/<slug>.png (modo preview/all)

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector

PI = math.pi

# ============================================================
# HELPERS MATEMATICOS
# ============================================================

def smooth(u):
    u = max(0.0, min(1.0, u))
    return u * u * (3.0 - 2.0 * u)


def anchors(points):
    """Interpolacao suave entre pontos [(t, v), ...] com t em 0..1."""
    pts = sorted(points)

    def f(t):
        if t <= pts[0][0]:
            return pts[0][1]
        if t >= pts[-1][0]:
            return pts[-1][1]
        for i in range(len(pts) - 1):
            t0, v0 = pts[i]
            t1, v1 = pts[i + 1]
            if t0 <= t <= t1:
                u = (t - t0) / (t1 - t0) if t1 > t0 else 0.0
                return v0 + (v1 - v0) * smooth(u)
        return pts[-1][1]
    return f


def srgb(hexstr):
    """'#rrggbb' -> tupla linear RGB para Blender."""
    h = hexstr.lstrip('#')
    r, g, b = (int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))

    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lin(r), lin(g), lin(b))

# ============================================================
# MATERIAIS
# ============================================================

def mat_simple(name, color, rough=0.35, metal=0.0, alpha=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    c = (color[0], color[1], color[2])
    bsdf.inputs['Base Color'].default_value = (*c, 1.0)
    bsdf.inputs['Roughness'].default_value = rough
    if 'Metallic' in bsdf.inputs:
        bsdf.inputs['Metallic'].default_value = metal
    if alpha < 1.0:
        bsdf.inputs['Alpha'].default_value = alpha
        try:
            m.blend_method = 'BLEND'
        except AttributeError:
            pass
    return m

# ============================================================
# CONSTRUCAO DE MALHAS
# ============================================================

def smooth_all(ob):
    for p in ob.data.polygons:
        p.use_smooth = True


def fix_normals(ob):
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(ob.data)
    bm.free()
    ob.data.update()


def link(ob, mat=None):
    bpy.context.collection.objects.link(ob)
    if mat is not None:
        ob.data.materials.append(mat)
    return ob


def mesh_from_data(name, verts, faces, mat=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.validate()
    ob = bpy.data.objects.new(name, me)
    link(ob, mat)
    smooth_all(ob)
    fix_normals(ob)
    return ob


def build_strip(name, rings, mat=None):
    """Malha de faixa: rings = lista de estacoes, cada uma lista de verts."""
    verts = []
    faces = []
    for ring in rings:
        verts.extend(ring)
    n = len(rings[0])
    for i in range(len(rings) - 1):
        for k in range(n - 1):
            a = i * n + k
            b = (i + 1) * n + k
            c = (i + 1) * n + k + 1
            d = i * n + k + 1
            faces.append((a, b, c, d))
    return mesh_from_data(name, verts, faces, mat)


def rounded_box(name, size, loc, rot=(0, 0, 0), mat=None, bevel=0.035, segs=3):
    """Cubo com bevel; size=(dx,dy,dz) dimensoes finais, loc=(x,y,z) centro."""
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (size[0], size[1], size[2])
    ob.rotation_euler = rot
    if bevel > 0:
        bev = ob.modifiers.new('bevel', 'BEVEL')
        bev.width = bevel
        bev.segments = segs
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(50)
    if mat is not None:
        ob.data.materials.append(mat)
    return ob


def cylinder(name, r, h, loc, rot=(0, 0, 0), mat=None, verts=24):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=verts, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    ob.rotation_euler = rot
    if mat is not None:
        ob.data.materials.append(mat)
    smooth_all(ob)
    return ob


def torus(name, R, r, loc, rot=(0, 0, 0), mat=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc)
    ob = context_active()
    ob.name = name
    ob.rotation_euler = rot
    if mat is not None:
        ob.data.materials.append(mat)
    smooth_all(ob)
    return ob


def context_active():
    return bpy.context.active_object


def sweep_tube(name, pts, r, mat=None, sides=8):
    """Varre um tubo circular por uma polilinha (pts em metros)."""
    verts = []
    faces = []
    n = len(pts)
    up = Vector((0, 0, 1))
    for i, p in enumerate(pts):
        if i == 0:
            t = Vector(pts[1]) - Vector(pts[0])
        elif i == n - 1:
            t = Vector(pts[-1]) - Vector(pts[-2])
        else:
            t = Vector(pts[i + 1]) - Vector(pts[i - 1])
        t = t.normalized()
        ref = up if abs(t.dot(up)) < 0.92 else Vector((0, 1, 0))
        A = t.cross(ref).normalized()
        Bv = t.cross(A).normalized()
        pv = Vector(p)
        for s in range(sides):
            ang = 2 * PI * s / sides
            off = A * math.cos(ang) + Bv * math.sin(ang)
            q = pv + off * r
            verts.append((q.x, q.y, q.z))
    for i in range(n - 1):
        for s in range(sides):
            k1 = i * sides + s
            k2 = i * sides + (s + 1) % sides
            k3 = (i + 1) * sides + (s + 1) % sides
            k4 = (i + 1) * sides + s
            faces.append((k1, k2, k3, k4))
    return mesh_from_data(name, verts, faces, mat)

# ============================================================
# CASCO PARAMETRICO (comum a lanchas e jetskis)
# ============================================================

def section_point(s, w, z0, z1, rc):
    """Secao transversal: s=0 quilha, s=1 borda (gunwale)."""
    if s <= 0.55:
        u = s / 0.55
        y = 0.82 * w * (u ** 0.8)
        z = z0 + rc * (z1 - z0) * (u ** 1.6)
    else:
        u = (s - 0.55) / 0.45
        sm = smooth(u)
        y = 0.82 * w + (1.03 * w - 0.82 * w) * sm
        zc = z0 + rc * (z1 - z0)
        z = zc + (z1 - zc) * (sm ** 0.9)
    return y, z


def build_hull(name, L, mat, hw_pts, keel_pts, chine_pts, sheer_k=0.42, F=0.9):
    """Casco fechado (fundo + painel de popa + proa), comprimento L no eixo +X."""
    NS, M = 30, 9
    hw = anchors(hw_pts)
    zk = anchors(keel_pts)
    rc = anchors(chine_pts)
    verts = []
    faces = []
    for i in range(NS):
        t = i / (NS - 1)
        w = hw(t)
        z0 = zk(t)
        z1 = F * (1.0 + sheer_k * (t ** 2.4))
        rcv = rc(t)
        ring = []
        for j in range(M):            # bore: gunwale -> quilha
            s = 1.0 - j / (M - 1)
            y, z = section_point(s, w, z0, z1, rcv)
            ring.append((t * L, y, z))
        for j in range(1, M):         # bombordo: quilha -> gunwale
            s = j / (M - 1)
            y, z = section_point(s, w, z0, z1, rcv)
            ring.append((t * L, -y, z))
        verts.extend(ring)
    RING = 2 * M - 1
    for i in range(NS - 1):
        for k in range(RING - 1):
            a = i * RING + k
            b = (i + 1) * RING + k
            c = (i + 1) * RING + k + 1
            d = i * RING + k + 1
            faces.append((a, b, c, d))
    faces.append(tuple(range(0, RING)))
    base = (NS - 1) * RING
    faces.append(tuple(range(base, base + RING)))
    ob = mesh_from_data(name, verts, faces, mat)
    sub = ob.modifiers.new('subsurf', 'SUBSURF')
    sub.levels = 1
    sub.render_levels = 1
    return ob

# ============================================================
# LANCHAS
# ============================================================

def build_lancha(cfg, mats):
    L = cfg['L']
    B = cfg.get('B', max(2.0, min(3.0, L * 0.37)))
    D = L * 0.095
    F = L * 0.135
    obh = cfg.get('accentDeck', False)

    hw_pts = [(0, 0.46 * B), (0.16, 0.49 * B), (0.35, 0.50 * B),
              (0.55, 0.45 * B), (0.75, 0.31 * B), (0.90, 0.16 * B), (1.0, 0.012 * B)]
    keel_pts = [(0, -0.78 * D), (0.25, -0.88 * D), (0.5, -0.68 * D),
                (0.75, -0.40 * D), (0.9, -0.14 * D), (1.0, -0.02 * D)]
    chine_pts = [(0, 0.30), (0.4, 0.42), (0.75, 0.62), (1.0, 0.78)]

    hull = build_hull('Casco', L, mats['hull'], hw_pts, keel_pts, chine_pts, F=F)

    # ----- curvas utilitarias -----
    hw = anchors(hw_pts)
    z_g = lambda t: F * (1.0 + 0.42 * (t ** 2.4))

    x1, x2 = (0.18 * L, 0.46 * L) if cfg.get('archetype') == 'cabin' else (0.16 * L, 0.74 * L)
    rim_w = 0.26 if cfg.get('archetype') != 'cabin' else 0.34
    z_floor = z_g(0.02) * 0.30

    def w_out(x):
        return hw(x / L)

    def w_in(x):
        return max(0.30, w_out(x) - rim_w)

    def z_deck(x):
        return z_g(x / L)

    # ----- deck (pavinho) em faixas -----
    rings_aft = []
    for x in [0.015 * L + (x1 - 0.015 * L) * i / 7 for i in range(8)]:
        w0 = w_out(x)
        rings_aft.append([(x, -w0, z_deck(x)), (x, 0, z_deck(x) + 0.03), (x, w0, z_deck(x))])
    deck_aft = build_strip('DeckPopa', rings_aft, mats['deck'])

    rings_rim_p, rings_rim_b = [], []
    for x in [x1 + (x2 - x1) * i / 14 for i in range(15)]:
        wo, wi = w_out(x), w_in(x)
        zd = z_deck(x)
        rings_rim_p.append([(x, -wo, zd), (x, -wi, zd)])
        rings_rim_b.append([(x, wi, zd), (x, wo, zd)])

    rings_bow = []
    for x in [x2 + (0.985 * L - x2) * i / 11 for i in range(12)]:
        w0 = w_out(x)
        rings_bow.append([(x, -w0, z_deck(x)), (x, 0, z_deck(x) + 0.03), (x, w0, z_deck(x))])
    deck_bow = build_strip('DeckProa', rings_bow, mats['deck'])

    # ----- interior: paredes + piso -----
    rings_wall_p, rings_wall_b, rings_floor = [], [], []
    for x in [x1 + (x2 - x1) * i / 14 for i in range(15)]:
        wi = w_in(x)
        rings_wall_p.append([(x, -wi, z_deck(x) - 0.01), (x, -wi, z_floor)])
        rings_wall_b.append([(x, wi, z_deck(x) - 0.01), (x, wi, z_floor)])
        rings_floor.append([(x, -wi, z_floor), (x, 0, z_floor - 0.02), (x, wi, z_floor)])
    build_strip('ParedeBore', rings_wall_p, mats['deck'])
    build_strip('ParedeBombordo', rings_wall_b, mats['deck'])
    build_strip('Piso', rings_floor, mats['deck'])
    borda_p = build_strip('BordaBore', rings_rim_p, mats['deck'])
    borda_b = build_strip('BordaBombordo', rings_rim_b, mats['deck'])

    # ----- detalhes comuns -----
    add_rub_rail(L, hw, z_g, mats)
    objs = add_lancha_details(cfg, mats, L, B, x1, x2, w_in, w_out, z_deck, z_floor, z_g)

    return [hull, deck_aft, borda_p, borda_b, deck_bow] + objs


def add_rub_rail(L, hw, z_g, mats):
    pts_b, pts_p = [], []
    for i in range(34):
        t = 0.03 + 0.94 * i / 33
        x = t * L
        y = hw(t) + 0.02
        z = z_g(t) - 0.05
        pts_b.append((x, y, z))
        pts_p.append((x, -y, z))
    sweep_tube('VelaRebordeBore', pts_b, 0.028, mats['black'])
    sweep_tube('VelaRebordeBomb', pts_p, 0.028, mats['black'])


def add_lancha_details(cfg, mats, L, B, x1, x2, w_in, w_out, z_deck, z_floor, z_g):
    objs = []
    arch = cfg.get('archetype', 'open')
    x_helm = x2 - 0.10 * L
    y_helm = w_in(x_helm) * 0.45

    # ---- console + volante ----
    zc = z_deck(x_helm)
    console = rounded_box('Console', (0.62, 0.55, 0.42),
                          (x_helm, y_helm, z_floor + 0.62), mat=mats['deck'])
    objs.append(console)
    dash = rounded_box('Painel', (0.10, 0.50, 0.16),
                       (x_helm + 0.28, y_helm, z_floor + 0.74), mat=mats['black'])
    objs.append(dash)
    wheel = torus('Volante', 0.155, 0.018,
                  (x_helm + 0.30, y_helm, z_floor + 0.80),
                  rot=(0, PI / 2, 0), mat=mats['black'])
    objs.append(wheel)

    if arch != 'cabin':
        # parabrisa em arco
        xw = x2 + 0.02 * L
        yspan = min(w_in(x2) * 0.92, 0.46 * B + 0.15)
        zb = z_deck(xw)
        glass_pts_top, glass_pts_bot = [], []
        NA = 20
        for i in range(NA + 1):
            a = -1 + 2 * i / NA
            y = a * yspan
            zt = zb + 0.52 * math.cos(a * 0.85) ** 0.8
            glass_pts_top.append((xw - 0.16, y, zt))
            glass_pts_bot.append((xw + 0.42, y, zb + 0.03))
        ws = build_strip('Parabrisa', [glass_pts_top, glass_pts_bot], mats['glass'])
        objs.append(ws)
        fr = [(p[0], p[1], p[2] + 0.015) for p in glass_pts_top]
        objs.append(sweep_tube('Moldura', fr, 0.030, mats['black']))

    # ---- assentos ----
    if arch == 'cabin':
        # banco no cockpit + cabine no terco dianteiro
        bench_x = x1 + 0.14 * L
        bench = rounded_box('Banco', (0.55, w_in(bench_x) * 1.7, 0.42),
                            (bench_x, 0, z_floor + 0.24), mat=mats['uph'])
        objs.append(bench)
        back = rounded_box('EncostoBanco', (0.14, w_in(bench_x) * 1.7, 0.52),
                           (bench_x - 0.30, 0, z_floor + 0.62), rot=(0, 0.22, 0), mat=mats['uph'])
        objs.append(back)
        bucket = rounded_box('Timao', (0.46, 0.44, 0.36),
                             (x_helm - 0.12, y_helm, z_floor + 0.20), mat=mats['uph'])
        objs.append(bucket)
        cb0, cb1 = 0.47 * L, 0.72 * L
        cab_len = cb1 - cb0
        zc0 = z_deck((cb0 + cb1) / 2)
        cab = rounded_box('Cabine', (cab_len, B * 0.55, 0.80),
                          ((cb0 + cb1) / 2, 0, zc0 + 0.30), mat=mats['hull'])
        objs.append(cab)
        wb = rounded_box('JanelaCabine', (cab_len * 0.70, B * 0.585, 0.28),
                         ((cb0 + cb1) / 2, 0, zc0 + 0.46), mat=mats['glassDark'])
        objs.append(wb)
        door = rounded_box('PortaCabine', (0.06, 0.52, 0.62),
                           (cb0 + 0.03, 0, zc0 + 0.20), mat=mats['black'])
        objs.append(door)
        # parabrisa inclinado na frente da cabine
        xf = cb1 + 0.02 * L
        yw = B * 0.26
        ws_top, ws_bot = [], []
        for i in range(9):
            a = -1 + 2 * i / 8
            y = a * yw
            ws_top.append((xf - 0.10, y, zc0 + 0.62))
            ws_bot.append((xf + 0.30, y, z_deck(xf) + 0.02))
        objs.append(build_strip('ParabrisaCabine', [ws_top, ws_bot], mats['glass']))
    else:
        bench_x = x1 + 0.30 * L
        bench = rounded_box('Banco', (0.55, w_in(bench_x) * 1.75, 0.42),
                            (bench_x, 0, z_floor + 0.24), mat=mats['uph'])
        objs.append(bench)
        back = rounded_box('EncostoBanco', (0.14, w_in(bench_x) * 1.75, 0.55),
                           (bench_x - 0.32, 0, z_floor + 0.64), rot=(0, 0.22, 0), mat=mats['uph'])
        objs.append(back)
        stripe = rounded_box('ListraBanco', (0.16, w_in(bench_x) * 1.75, 0.06),
                             (bench_x - 0.32, 0, z_floor + 0.93), rot=(0, 0.22, 0), mat=mats['accent'])
        objs.append(stripe)
        wbench = w_in(x_helm - 0.45)
        hb = rounded_box('BancoTimao', (0.50, wbench * 1.30, 0.40),
                         (x_helm - 0.45, 0, z_floor + 0.22), mat=mats['uph'])
        objs.append(hb)
        hbk = rounded_box('EncostoTimao', (0.12, wbench * 1.30, 0.55),
                          (x_helm - 0.63, 0, z_floor + 0.60), rot=(0, 0.25, 0), mat=mats['uph'])
        objs.append(hbk)
        hst = rounded_box('ListraTimao', (0.14, wbench * 1.30, 0.06),
                          (x_helm - 0.63, 0, z_floor + 0.90), rot=(0, 0.25, 0), mat=mats['accent'])
        objs.append(hst)

    # ---- colchao de proa (sunpad) ----
    if arch != 'cabin':
        sp0, sp1 = x2 + 0.10 * L, 0.955 * L
        wmid = w_out((sp0 + sp1) / 2) * 0.86
        sp = rounded_box('ColchaoProa', (sp1 - sp0, wmid * 1.9, 0.24),
                         ((sp0 + sp1) / 2, 0, z_deck((sp0 + sp1) / 2) + 0.10), mat=mats['uph'])
        objs.append(sp)
        sps = rounded_box('ListraProa', (sp1 - sp0, wmid * 1.9, 0.05),
                          ((sp0 + sp1) / 2, 0, z_deck((sp0 + sp1) / 2) + 0.235), mat=mats['accent'])
        objs.append(sps)

    # ---- torre (arch) ----
    if cfg.get('tower'):
        xt = 0.48 * L
        R = B * 0.47
        z0 = z_g(xt / L) + 0.05
        ztop = z0 + 1.05
        pts = []
        for i in range(21):
            a = PI * i / 20
            pts.append((xt, R * math.cos(a), z0 + (ztop - z0) * math.sin(a)))
        objs.append(sweep_tube('Torre', pts, 0.045, mats['black']))
        objs.append(rounded_box('PrateleiraTorre', (0.35, 0.5, 0.06),
                                (xt, 0, ztop + 0.03), mat=mats['black']))

    # ---- motor de popa ou plataforma ----
    if cfg.get('motor') == 'outboard':
        zt = z_g(0.01)
        cowl = rounded_box('MotorCarenagem', (0.62, 0.34, 0.40),
                           (-0.22, 0, zt + 0.22), rot=(0, -0.18, 0), mat=mats['motor'])
        objs.append(cowl)
        shaft = cylinder('MotorHaste', 0.045, 0.78, (-0.20, 0, zt - 0.28), mat=mats['motor'])
        objs.append(shaft)
        gear = cylinder('MotorTurbina', 0.055, 0.36, (-0.26, 0, zt - 0.62),
                        rot=(0, PI / 2, 0), mat=mats['motor'])
        objs.append(gear)
        skeg = rounded_box('MotorSkeg', (0.18, 0.025, 0.16),
                           (-0.30, 0, zt - 0.80), mat=mats['motor'], bevel=0.012)
        objs.append(skeg)
        prop = cylinder('Helice', 0.17, 0.04, (-0.45, 0, zt - 0.62),
                        rot=(0, PI / 2, 0), mat=mats['steel'], verts=16)
        objs.append(prop)
    else:
        plat = rounded_box('Plataforma', (0.55, B * 0.78, 0.06),
                           (-0.24, 0, z_g(0.01) - 0.10), mat=mats['deck'])
        objs.append(plat)

    return objs

# ============================================================
# JET SKI
# ============================================================

def build_jetski(cfg, mats):
    L = cfg.get('L', 3.45)
    B = 1.26
    F = 0.62

    hw_pts = [(0, 0.42 * B), (0.14, 0.46 * B), (0.38, 0.46 * B),
              (0.68, 0.34 * B), (0.88, 0.15 * B), (1.0, 0.02 * B)]
    keel_pts = [(0, -0.26), (0.3, -0.30), (0.6, -0.20), (0.85, -0.06), (1.0, 0.02)]
    chine_pts = [(0, 0.55), (0.5, 0.62), (1.0, 0.85)]

    hull = build_hull('Casco', L, mats['hull'], hw_pts, keel_pts, chine_pts,
                      sheer_k=0.55, F=F)
    hw = anchors(hw_pts)

    def z_top(t):
        return F * (1.0 + 0.55 * (t ** 2.5))

    # tampo fechando o casco
    rings = []
    for i in range(17):
        t = 0.02 + 0.96 * i / 16
        x = t * L
        w = hw(t) - 0.03
        zt = z_top(t)
        rings.append([(x, -w, zt), (x, 0, zt + 0.02), (x, w, zt)])
    deck = build_strip('Tampo', rings, mats['accent'] if cfg.get('accentDeck') else mats['deck'])

    # plataformas de pe (footwells) escurecidas
    for side in (1, -1):
        fw = rounded_box('ApoioPe', (1.15, 0.30, 0.05),
                         (0.44 * L, side * 0.36, z_top(0.44) + 0.035), mat=mats['black'], bevel=0.02)
        # (visual de recesso)

    # banco em dois degraus (assentado no tampo e no degrau anterior)
    zb1 = z_top(0.46)
    seat1 = rounded_box('Banco1', (0.85, 0.42, 0.18), (0.46 * L, 0, zb1 + 0.10), mat=mats['seatDark'])
    seat2 = rounded_box('Banco2', (0.55, 0.38, 0.16), (0.35 * L, 0, zb1 + 0.27), mat=mats['seatDark'])
    stripe = rounded_box('ListraBanco', (0.90, 0.45, 0.04), (0.46 * L, 0, zb1 + 0.03),
                         mat=mats['accent'], bevel=0.012)

    # console + guidao
    xc = 0.72 * L
    con = rounded_box('Console', (0.30, 0.38, 0.34), (xc, 0, z_top(0.72) + 0.17), mat=mats['black'])
    stem = cylinder('HasteGuidao', 0.022, 0.26, (xc - 0.02, 0, z_top(0.72) + 0.47),
                    rot=(0.35, 0, 0), mat=mats['black'])
    bar = cylinder('Guidao', 0.017, 0.62, (xc - 0.02, 0, z_top(0.72) + 0.58),
                   rot=(PI / 2, 0, 0), mat=mats['black'])
    grips = []
    for side in (1, -1):
        g = cylinder('Manopla', 0.031, 0.11, (xc - 0.02, side * 0.27, z_top(0.72) + 0.58),
                     rot=(PI / 2, 0, 0), mat=mats['black'], verts=12)
        grips.append(g)
    # defletor de vento
    defl_pts_top, defl_pts_bot = [], []
    for i in range(11):
        a = -1 + 2 * i / 10
        y = a * 0.30
        zt = z_top(0.72) + 0.24 * math.cos(a * 0.8) ** 0.8
        defl_pts_top.append((xc - 0.06, y, zt))
        defl_pts_bot.append((xc + 0.10, y, z_top(0.72) + 0.02))
    defl = build_strip('Defletor', [defl_pts_top, defl_pts_bot], mats['glass'])

    # plataforma de popa com acento
    plat = rounded_box('PlataformaPopa', (0.55, 0.82, 0.06),
                       (0.16 * L, 0, z_top(0.16) + 0.045), mat=mats['accent'], bevel=0.02)

    # sponsons
    for side in (1, -1):
        sp = rounded_box('Sponson', (0.55, 0.10, 0.16),
                         (0.30 * L, side * (hw(0.30) - 0.02), z_top(0.30) - 0.05), mat=mats['black'], bevel=0.02)

    return [hull, deck, seat1, seat2, stripe, con, stem, bar] + grips + [defl, plat]

# ============================================================
# CONFIG POR PRODUTO (29)
# ============================================================

WHITE = '#e9ebeb'
BLACK_HULL = '#1b1d20'

CONFIG = {
    # ---------------- JET SKIS ----------------
    'sea-doo-explorer-pro-230': dict(kind='jetski', L=3.55, hull=WHITE, accent='#7a7f5e', accentDeck=True),
    'sea-doo-gtx-170-2025': dict(kind='jetski', L=3.45, hull=WHITE, accent='#8e979c'),
    'sea-doo-gtx-230-2025': dict(kind='jetski', L=3.55, hull=WHITE, accent='#274b77'),
    'sea-doo-wake-pro-230-2024': dict(kind='jetski', L=3.55, hull=WHITE, accent='#b3272d', accentDeck=True),
    'sea-doo-rxtx-325': dict(kind='jetski', L=3.50, hull=WHITE, accent='#c1272d', accentDeck=True),
    'sea-doo-gtx-limited-325-2025': dict(kind='jetski', L=3.55, hull=WHITE, accent='#b49a5e'),
    'sea-doo-gtx-325-limited-2025': dict(kind='jetski', L=3.55, hull=WHITE, accent='#b49a5e'),
    'sea-doo-gti-90-2018': dict(kind='jetski', L=3.35, hull=WHITE, accent='#2f6da8'),
    'sea-doo-gtx-170-2022': dict(kind='jetski', L=3.45, hull=WHITE, accent='#2f6da8'),
    'sea-doo-wake-155-2013': dict(kind='jetski', L=3.40, hull=WHITE, accent='#2f6da8'),

    # ---------------- LANCHAS ----------------
    'lancha-mestra-198-2015': dict(kind='lancha', archetype='open', L=6.0, motor='sterndrive', hull=WHITE, accent='#274b77'),
    'lancha-ventura-195-2013': dict(kind='lancha', archetype='open', L=5.9, motor='outboard', hull=WHITE, accent='#2f6da8'),
    'lancha-ventura-210-2021': dict(kind='lancha', archetype='open', L=6.4, motor='outboard', hull=WHITE, accent='#274b77'),
    'lancha-ventura-215-2009': dict(kind='lancha', archetype='open', L=6.5, motor='outboard', hull=WHITE, accent='#444a4f'),
    'lancha-ventura-190-2008': dict(kind='lancha', archetype='open', L=5.8, motor='outboard', hull=WHITE, accent='#2f6da8'),
    'lancha-ventura-210-comfort-2014': dict(kind='lancha', archetype='open', L=6.4, motor='outboard', hull=WHITE, accent='#274b77'),
    'lancha-ventura-175-2011': dict(kind='lancha', archetype='open', L=5.3, motor='outboard', hull=WHITE, accent='#8e979c'),
    'lancha-ventura-195-2012': dict(kind='lancha', archetype='open', L=5.9, motor='outboard', hull=WHITE, accent='#2f6da8'),
    'lancha-ventura-195-crossover-2022': dict(kind='lancha', archetype='open', L=5.9, motor='outboard', hull=WHITE, accent='#6e7a82'),
    'lancha-triton-240-open-sport-2014': dict(kind='lancha', archetype='open', L=7.3, motor='sterndrive', tower=True, hull=WHITE, accent='#1f3a5f'),
    'lancha-focker-255-gto-2024': dict(kind='lancha', archetype='open', L=7.7, motor='outboard', hull=WHITE, accent='#b3272d'),
    'lancha-focker-230-cabinada': dict(kind='lancha', archetype='cabin', L=7.0, motor='outboard', hull=WHITE, accent='#2f6da8'),
    'lancha-ventura-250-comfort-2021': dict(kind='lancha', archetype='open', L=7.6, motor='sterndrive', hull=WHITE, accent='#274b77'),
    'lancha-fs-230-scappare-2011': dict(kind='lancha', archetype='open', L=7.0, motor='outboard', hull=WHITE, accent='#444a4f'),
    'lancha-fs-275-wide-2021': dict(kind='lancha', archetype='open', L=8.3, motor='sterndrive', wide=True, hull=WHITE, accent='#6e7a82'),
    'lancha-focker-230-black-2018': dict(kind='lancha', archetype='open', L=7.0, motor='outboard', hull=BLACK_HULL, accent='#b3272d'),
    'lancha-mestra-230-2021': dict(kind='lancha', archetype='cabin', L=7.0, motor='sterndrive', hull=WHITE, accent='#274b77'),
    'lancha-focker-222-2003': dict(kind='lancha', archetype='open', L=6.7, motor='outboard', hull=WHITE, accent='#2f6da8'),
    'lancha-ventura-1992': dict(kind='lancha', archetype='open', L=5.9, motor='outboard', hull=WHITE, accent='#8e979c'),
}

# Ajuste fino: FS 275 Wide mais largo
for k, v in CONFIG.items():
    if v.get('wide'):
        v['B'] = v['L'] * 0.42

# ============================================================
# CENA / PREVIEW / EXPORT
# ============================================================

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def make_mats(cfg):
    mats = {
        'hull': mat_simple('Casco', srgb(cfg['hull']), rough=0.16, metal=0.05),
        'deck': mat_simple('Deck', srgb('#d8d9d6'), rough=0.75),
        'accent': mat_simple('Acento', srgb(cfg['accent']), rough=0.30),
        'uph': mat_simple('Estofado', srgb('#d5c9b2'), rough=0.62),
        'black': mat_simple('Preto', srgb('#1a1c1e'), rough=0.45),
        'glass': mat_simple('Vidro', srgb('#bcd7de'), rough=0.06, alpha=0.34),
        'glassDark': mat_simple('VidroEscuro', srgb('#223038'), rough=0.10, alpha=0.55),
        'motor': mat_simple('MotorPreto', srgb('#141517'), rough=0.42),
        'steel': mat_simple('Inox', srgb('#cfd2d4'), rough=0.28, metal=1.0),
        'seatDark': mat_simple('EstofadoEscuro', srgb('#2e3236'), rough=0.55),
    }
    return mats


def scene_bbox():
    bpy.context.view_layer.update()
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for ob in bpy.data.objects:
        if ob.type == 'MESH':
            for c in ob.bound_box:
                w = ob.matrix_world @ Vector(c)
                lo = Vector((min(lo.x, w.x), min(lo.y, w.y), min(lo.z, w.z)))
                hi = Vector((max(hi.x, w.x), max(hi.y, w.y), max(hi.z, w.z)))
    return lo, hi


def normalize_model():
    """Centraliza X/Y e assenta o fundo do modelo em z=0 (previsivel no viewer)."""
    lo, hi = scene_bbox()
    if lo.x > 1e8:
        return
    center = (lo + hi) / 2
    dx, dy, dz = -center.x, -center.y, -lo.z
    for ob in bpy.data.objects:
        if ob.type == 'MESH':
            ob.location.x += dx
            ob.location.y += dy
            ob.location.z += dz
    bpy.context.view_layer.update()


def snapshot_product_names():
    return {ob.name for ob in bpy.data.objects if ob.type == 'MESH'}


def cleanup_non_product(names):
    for ob in list(bpy.data.objects):
        if (ob.type == 'MESH' and ob.name not in names) or ob.type in ('LIGHT', 'CAMERA'):
            bpy.data.objects.remove(ob, do_unlink=True)


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


def add_lights_and_camera(L, plo, phi):
    center = (plo + phi) / 2
    size = (phi - plo)
    print('CAM-DEBUG bbox lo=%s hi=%s' % (tuple(round(v, 2) for v in plo), tuple(round(v, 2) for v in phi)))
    print('CAM-DEBUG size=%s center=%s' % (tuple(round(v, 2) for v in size), tuple(round(v, 2) for v in center)))

    # piso (apos medir o produto)
    bpy.ops.mesh.primitive_plane_add(size=L * 8, location=(center.x, center.y, -0.02))
    floor = context_active()
    floor.name = 'Piso'
    fm = mat_simple('PisoMat', (0.45, 0.46, 0.48, 1.0), rough=0.9)
    floor.data.materials.append(fm)

    def area_light(name, loc, size, energy):
        ld = bpy.data.lights.new(name, 'AREA')
        ld.size = size
        ld.energy = energy
        ob = bpy.data.objects.new(name, ld)
        ob.location = loc
        bpy.context.collection.objects.link(ob)
        return ob

    area_light('LuzPrincipal', (L * 0.4, -L * 0.85, L * 0.45 + 0.8), L * 0.7, 1200 * (L / 6.5))
    area_light('LuzPreenchimento', (L * 0.3, L * 0.95, L * 0.30 + 0.6), L * 0.9, 380 * (L / 6.5))
    area_light('LuzTopo', (L * 0.55, 0, L * 0.75 + 0.8), L * 0.8, 500 * (L / 6.5))

    dist = max(size.x, size.y) * 1.5 + 0.3
    campos = center + Vector((size.x * 0.45, -dist * 0.9, size.z * 0.7 + 0.6))
    target = center + Vector((-size.x * 0.10, 0, -size.z * 0.05))
    cam_data = bpy.data.cameras.new('Cam')
    cam_data.lens = 42
    cam = bpy.data.objects.new('Cam', cam_data)
    cam.location = campos
    direction = target - campos  # aponta DA camera PARA o alvo
    cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    print('CAM-DEBUG dist=%.2f campos=%s target=%s' % (dist, tuple(round(v, 2) for v in campos), tuple(round(v, 2) for v in target)))


def second_camera(plo, phi):
    """Angulo alto (3/4 de cima) para inspecionar o cockpit."""
    center = (plo + phi) / 2
    size = (phi - plo)
    dist = max(size.x, size.y) * 1.5 + 0.3
    campos = center + Vector((size.x * 0.05, -dist * 0.95, size.z * 1.35 + 0.9))
    target = center + Vector((-size.x * 0.05, 0, -size.z * 0.10))
    cam_data = bpy.data.cameras.new('CamTop')
    cam_data.lens = 42
    cam = bpy.data.objects.new('CamTop', cam_data)
    cam.location = campos
    direction = target - campos
    cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam


def build_product(slug):
    cfg = CONFIG[slug]
    mats = make_mats(cfg)
    if cfg['kind'] == 'jetski':
        return build_jetski(cfg, mats)
    return build_lancha(cfg, mats)


def export_glb(path):
    try:
        bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_apply=True)
    except TypeError:
        try:
            bpy.ops.export_scene.gltf(filepath=path, export_format='GLB')
        except TypeError:
            bpy.ops.export_scene.gltf(filepath=path)


def main():
    argv = sys.argv
    if '--' in argv:
        args = argv[argv.index('--') + 1:]
    else:
        args = []
    mode = args[0] if args else 'preview'
    outdir = args[1] if len(args) > 1 else os.path.dirname(os.path.abspath(__file__))
    slug = args[2] if len(args) > 2 else 'ALL'

    targets = list(CONFIG.keys()) if slug == 'ALL' else ([slug] if slug in CONFIG else [])
    if not targets:
        print('SLUG INVALIDO: ' + slug)
        return

    prevdir = os.path.join(outdir, 'previews')
    os.makedirs(outdir, exist_ok=True)
    os.makedirs(prevdir, exist_ok=True)

    for s in targets:
        reset_scene()
        objs = build_product(s)
        normalize_model()
        names = snapshot_product_names()
        print('OK build:', s, '| objetos:', len(objs))
        if mode in ('preview', 'all'):
            setup_render()
            L = CONFIG[s].get('L', 6.0)
            plo, phi = scene_bbox()
            add_lights_and_camera(L, plo, phi)
            bpy.context.scene.render.filepath = os.path.join(prevdir, s + '.png')
            bpy.ops.render.render(write_still=True)
            second_camera(plo, phi)
            bpy.context.scene.render.filepath = os.path.join(prevdir, s + '-top.png')
            bpy.ops.render.render(write_still=True)
            print('OK preview:', s)
            cleanup_non_product(names)
        if mode in ('export', 'all'):
            export_glb(os.path.join(outdir, s + '.glb'))
            print('OK export:', s)


main()
