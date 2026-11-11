# preview_candidates.py - Inspeciona GLBs candidatos (import, medir, renderizar)
# Lancha Jet Quadriciclo - Rifaina/SP
#
# Uso (Blender headless):
#   blender --background --factory-startup --python preview_candidates.py -- <indir> <outdir>
#
# Saidas:
#   <outdir>/<nome>.png        (3/4 lateral)
#   <outdir>/<nome>-top.png    (3/4 de cima)
#   stdout: linhas 'CAND-INFO {...}' com dims/tris/materiais p/ parse

import bpy
import json
import math
import os
import sys
from mathutils import Vector


def read_factory():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def collect_meshes():
    return [ob for ob in bpy.context.scene.objects if ob.type == 'MESH']


def scene_bbox():
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    bpy.context.view_layer.update()
    for ob in collect_meshes():
        for c in ob.bound_box:
            w = ob.matrix_world @ Vector(c)
            lo = Vector((min(lo.x, w.x), min(lo.y, w.y), min(lo.z, w.z)))
            hi = Vector((max(hi.x, w.x), max(hi.y, w.y), max(hi.z, w.z)))
    return lo, hi


def tri_count():
    total = 0
    dg = bpy.context.evaluated_depsgraph_get()
    for ob in collect_meshes():
        ev = ob.evaluated_get(dg)
        me = ev.to_mesh()
        total += sum(len(p.vertices) - 2 for p in me.polygons)
        ev.to_mesh_clear()
    return total


def import_glb(path):
    bpy.ops.import_scene.gltf(filepath=path)


def orient_to_x():
    """Garante comprimento no eixo X (rotaciona 90 graus se o eixo maior for Y)."""
    bpy.context.view_layer.update()
    lo, hi = scene_bbox()
    size = hi - lo
    if size.y > size.x:
        root = bpy.data.objects.new('OrientRoot', None)
        bpy.context.scene.collection.objects.link(root)
        for ob in list(bpy.context.scene.objects):
            if ob != root and ob.parent is None and ob.type in ('MESH', 'EMPTY'):
                ob.parent = root
        root.rotation_euler = (0.0, 0.0, math.radians(90.0))
        bpy.context.view_layer.update()


def material_info():
    info = []
    for m in bpy.data.materials:
        tex = ''
        if m.use_nodes:
            for n in m.node_tree.nodes:
                if n.type == 'TEX_IMAGE' and n.image:
                    tex = os.path.basename(n.image.filepath or n.image.name)
                    break
        info.append({'name': m.name, 'tex': tex})
    return info


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
    area_light('LuzTopo', (L * 0.55, 0, lo.z + L * 0.75 + 0.8), L * 0.8, 500 * (L / 6.5))

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
    bpy.context.scene.camera = cam
    cam_top = make_cam('CamTop', center + Vector((size.x * 0.05, -dist * 0.95, size.z * 1.35 + 0.9)),
                       center + Vector((-size.x * 0.05, 0.0, -size.z * 0.10)))
    return cam, cam_top


def preview_candidate(glb_path, outdir):
    name = os.path.splitext(os.path.basename(glb_path))[0]
    read_factory()
    import_glb(glb_path)
    orient_to_x()
    lo, hi = scene_bbox()
    size = hi - lo
    L = max(size.x, size.y, size.z, 0.1)

    setup_render()
    cam, cam_top = add_stage(L, lo, hi)

    os.makedirs(outdir, exist_ok=True)
    sc = bpy.context.scene
    sc.camera = cam
    sc.render.filepath = os.path.join(outdir, name + '.png')
    bpy.ops.render.render(write_still=True)
    sc.camera = cam_top
    sc.render.filepath = os.path.join(outdir, name + '-top.png')
    bpy.ops.render.render(write_still=True)

    info = {
        'name': name,
        'dims_xyz': [round(v, 2) for v in (size.x, size.y, size.z)],
        'zmin': round(lo.z, 3),
        'tris': tri_count(),
        'materials': material_info(),
        'meshes': len(collect_meshes()),
    }
    print('CAND-INFO ' + json.dumps(info, ensure_ascii=True))


def main():
    argv = sys.argv
    args = argv[argv.index('--') + 1:] if '--' in argv else []
    indir = args[0] if args else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'in')
    outdir = args[1] if len(args) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out', 'candidates')

    glbs = sorted(f for f in os.listdir(indir) if f.lower().endswith('.glb'))
    if not glbs:
        print('NENHUM GLB EM ' + indir)
        return
    for f in glbs:
        try:
            preview_candidate(os.path.join(indir, f), outdir)
            print('OK preview: ' + f)
        except Exception as exc:
            print('FALHA preview: %s -> %r' % (f, exc))


main()
