# texture_palette.py - Paleta dominante das texturas basecolor dos GLBs
# Ajuda a desenhar recolors seletivos por faixa de cor.
#
# Uso:
#   blender --background --factory-startup --python texture_palette.py -- <glb> [glb2 ...]

import bpy
import colorsys
import json
import os
import sys

import numpy as np


def rgb_to_hsv_vec(rgb):
    """rgb float array Nx3 em 0..1 (aprox sRGB) -> H,S,V arrays."""
    r, g, b = rgb[:, 0], rgb[:, 1], rgb[:, 2]
    mx = np.max(rgb, axis=1)
    mn = np.min(rgb, axis=1)
    v = mx
    delta = mx - mn
    s = np.where(mx > 0, delta / np.maximum(mx, 1e-9), 0.0)
    h = np.zeros_like(mx)
    d = np.where(delta > 0, delta, 1e-9)
    rc = (mx - r) / d
    gc = (mx - g) / d
    bc = (mx - b) / d
    h = np.where(mx == r, bc - gc, np.where(mx == g, 2.0 + rc - bc, 4.0 + gc - rc))
    h = (h / 6.0) % 1.0
    h = np.where(delta > 0, h, 0.0)
    return h, s, v


def dominant(img, topn=28):
    w, h, ch = img.size[0], img.size[1], img.channels
    buf = np.empty(w * h * ch, dtype=np.float32)
    img.pixels.foreach_get(buf)
    px = buf.reshape(-1, ch)[:, :3]
    # linear -> sRGB aprox (pixels do Blender vem linear)
    px = np.clip(px, 0.0, 1.0) ** (1.0 / 2.2)
    # ignora alpha ~0 (transparente) e amostra a cada N pixels p/ velocidade
    step = max(1, len(px) // 400000)
    px = px[::step]
    hh, ss, vv = rgb_to_hsv_vec(px)
    qh = (hh * 24).astype(np.int32)
    qs = np.minimum((ss * 6).astype(np.int32), 5)
    qv = np.minimum((vv * 6).astype(np.int32), 5)
    key = qh * 36 + qs * 6 + qv
    uniq, cnt = np.unique(key, return_counts=True)
    order = np.argsort(-cnt)[:topn]
    out = []
    total = float(cnt.sum())
    for i in order:
        k = uniq[i]
        qh2, qs2, qv2 = int(k) // 36, (int(k) % 36) // 6, int(k) % 6
        mask = key == k
        mean = px[mask].mean(axis=0)
        out.append({
            'pct': round(100.0 * cnt[i] / total, 1),
            'hex': '%02x%02x%02x' % tuple(int(round(c * 255)) for c in mean),
            'h': round(qh2 / 24.0, 2),
            's': round(qs2 / 6.0, 2),
            'v': round(qv2 / 6.0, 2),
        })
    return out


def main():
    argv = sys.argv
    args = argv[argv.index('--') + 1:] if '--' in argv else []
    for glb in args:
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.ops.import_scene.gltf(filepath=glb)
        found = []
        for m in bpy.data.materials:
            if not m.use_nodes:
                continue
            for n in m.node_tree.nodes:
                if n.type == 'TEX_IMAGE' and n.image:
                    found.append({'mat': m.name, 'img': n.image.name, 'size': list(n.image.size), 'palette': dominant(n.image)})
        print('TEXPALETTE ' + json.dumps({'glb': os.path.basename(glb), 'textures': found}, ensure_ascii=True))


main()
