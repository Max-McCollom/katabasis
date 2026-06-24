# Headless Blender build tool for the Katabasis hall.
# Generates the colonnade procedurally, lightmap-UVs it, bakes COMBINED GI in
# Cycles (warm candle emitters + AO + bounce) to a single atlas, and exports a
# glb. Coordinates match src/world/layout.js so the baked geometry aligns with
# the in-code colliders.  Run:
#   Blender --background --python blender/build_hall.py
# Env: OUT (glb path), LM (lightmap px), SAMPLES (cycles), BAKE (0/1).
import bpy, bmesh, math, os
from mathutils import Vector

BAYS = [28, 20, 12, 4, -4, -12, -20]
COL_X = 6.4
COL_H = 16.0
WALL_X = 10.8
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get("OUT", os.path.join(ROOT, "public/models/hall.glb"))
LM = int(os.environ.get("LM", "2048"))
SAMPLES = int(os.environ.get("SAMPLES", "96"))
DO_BAKE = os.environ.get("BAKE", "1") == "1"

# three(x,y,z) -> blender(x,-z,y)   (three is Y-up, glTF export restores Y-up)
def loc(tx, ty, tz):
    return (tx, -tz, ty)

def cube(sx, sy, sz, tx, ty, tz):
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.object
    o.scale = (sx, sz, sy)  # three (sx,sy,sz) -> blender (sx,sz,sy)
    o.location = loc(tx, ty, tz)
    return o

def fluted_column(tx, tz, h=COL_H, r=0.7, flutes=20):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=96)
    o = bpy.context.object
    o.location = loc(tx, h / 2 + 0.6, tz)
    me = o.data
    bm = bmesh.new(); bm.from_mesh(me)
    for v in bm.verts:
        x, y = v.co.x, v.co.y  # blender column axis is Z; radial is XY
        rr = math.hypot(x, y)
        if rr > 1e-4:
            ang = math.atan2(y, x)
            f = math.cos(ang * flutes) * 0.5 + 0.5
            s = (rr * (1 - 0.07 * f)) / rr
            v.co.x *= s; v.co.y *= s
    bm.to_mesh(me); bm.free()
    return o

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)

reset()
parts = []

# floor + walls
parts.append(cube(2 * WALL_X, 0.4, 69, 0, -0.2, 4.5))
parts.append(cube(1.6, 40, 76, -WALL_X, 12, 4))
parts.append(cube(1.6, 40, 76, WALL_X, 12, 4))

# colonnade: fluted shaft + base + capital + entablature pad per bay
for z in BAYS:
    for sx in (-COL_X, COL_X):
        parts.append(fluted_column(sx, z))
        parts.append(cube(2.2, 0.9, 2.2, sx, 0.45, z))      # base
        parts.append(cube(2.0, 0.9, 2.0, sx, COL_H + 0.35, z))  # capital
# entablature beams
parts.append(cube(2.4, 1.4, 60, -COL_X, COL_H + 1.0, 4))
parts.append(cube(2.4, 1.4, 60, COL_X, COL_H + 1.0, 4))

# voussoir arches: masonry blocks along a semicircle per bay (real AO between
# blocks; reads as a coffered barrel vault receding). Unrotated for robustness.
ARCH_R = COL_X + 1.1
for z in BAYS:
    n = 13
    for k in range(n):
        a = math.pi * (k + 0.5) / n
        ax = ARCH_R * math.cos(a)
        ay = COL_H + 1.8 + ARCH_R * math.sin(a)
        parts.append(cube(1.7, 1.5, 1.7, ax, ay, z))

# join into one mesh
bpy.ops.object.select_all(action="DESELECT")
for p in parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
hall = bpy.context.object
hall.name = "hall"

# UVs: UV0 (smart project) + UV1 lightmap (non-overlapping pack)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
me = hall.data
if "UVMap" not in [l.name for l in me.uv_layers]:
    me.uv_layers.new(name="UVMap")
me.uv_layers.active = me.uv_layers["UVMap"]
bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.02)
lm_uv = me.uv_layers.new(name="Lightmap")
me.uv_layers.active = lm_uv
bpy.ops.uv.lightmap_pack(PREF_MARGIN_DIV=0.2)
bpy.ops.mesh.select_all(action="SELECT")
try:
    bpy.ops.uv.pack_islands(margin=0.01, rotate=True)  # tighten to use the whole atlas
except Exception as e:
    print("pack_islands skipped", e)
bpy.ops.object.mode_set(mode="OBJECT")

# stone material + the bake-target image
img = bpy.data.images.new("hall_lm", LM, LM)
mat = bpy.data.materials.new("stone"); mat.use_nodes = True
nt = mat.node_tree
bsdf = nt.nodes.get("Principled BSDF")
bsdf.inputs["Base Color"].default_value = (0.34, 0.27, 0.19, 1)  # warm stone
bsdf.inputs["Roughness"].default_value = 0.85
if "Metallic" in bsdf.inputs:
    bsdf.inputs["Metallic"].default_value = 0.0
texnode = nt.nodes.new("ShaderNodeTexImage"); texnode.image = img
texnode.select = True; nt.nodes.active = texnode  # bake target
# bake reads the Lightmap UV
for uvn in nt.nodes:
    pass
hall.data.materials.clear(); hall.data.materials.append(mat)
me.uv_layers.active = me.uv_layers["Lightmap"]

# warm candle emitters (light sources for the bake only; not exported)
emitters = []
def emitter(tx, ty, tz, power=120, color=(1.0, 0.55, 0.2)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.25, location=loc(tx, ty, tz))
    e = bpy.context.object
    em = bpy.data.materials.new("emit"); em.use_nodes = True
    n = em.node_tree.nodes; n.clear()
    out = n.new("ShaderNodeOutputMaterial"); emn = n.new("ShaderNodeEmission")
    emn.inputs["Color"].default_value = (*color, 1)
    emn.inputs["Strength"].default_value = power
    em.node_tree.links.new(emn.outputs[0], out.inputs[0])
    e.data.materials.append(em)
    emitters.append(e)
for z in BAYS:
    # two emitters per bay (inboard + a smaller outboard) so both column faces read
    emitter(-COL_X + 1.5, 5.5, z, power=240); emitter(COL_X - 1.5, 5.5, z, power=240)
    emitter(-COL_X - 1.2, 6.5, z, power=80); emitter(COL_X + 1.2, 6.5, z, power=80)
# a cool, dim sky fill so the shadow sides read as deep blue-black, not pure void
world = bpy.data.worlds.new("w"); bpy.context.scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.04, 0.05, 0.07, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.9

if DO_BAKE:
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    try:
        sc.cycles.device = "GPU"
    except Exception:
        pass
    sc.cycles.samples = SAMPLES
    sc.render.bake.use_pass_direct = True
    sc.render.bake.use_pass_indirect = True
    bpy.ops.object.select_all(action="DESELECT")
    hall.select_set(True); bpy.context.view_layer.objects.active = hall
    print("KB_BAKE_START samples", SAMPLES, "lm", LM)
    bpy.ops.object.bake(type="COMBINED", use_clear=True, margin=8)
    print("KB_BAKE_DONE")
    img.filepath_raw = os.path.join(os.path.dirname(OUT), "hall_lm.png")
    img.file_format = "PNG"
    img.save()

    # second pass: pure ambient occlusion -> applied as aoMap over the readable
    # matcap in three (real crevice/contact shadows matcap cannot produce).
    ao_img = bpy.data.images.new("hall_ao", LM, LM)
    texnode.image = ao_img
    texnode.select = True; nt.nodes.active = texnode
    sc.cycles.samples = max(64, SAMPLES // 2)
    print("KB_AO_START")
    bpy.ops.object.bake(type="AO", use_clear=True, margin=8)
    print("KB_AO_DONE")
    ao_img.filepath_raw = os.path.join(os.path.dirname(OUT), "hall_ao.png")
    ao_img.file_format = "PNG"
    ao_img.save()

    # carry the COMBINED bake as the glb base colour (for the dramatic ?baked mode)
    texnode.image = img
    nt.links.new(texnode.outputs["Color"], bsdf.inputs["Base Color"])

# delete emitters before export
bpy.ops.object.select_all(action="DESELECT")
for e in emitters:
    e.select_set(True)
bpy.ops.object.delete()

os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.object.select_all(action="DESELECT")
hall.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=OUT, export_format="GLB", use_selection=True,
    export_apply=True, export_texcoords=True, export_normals=True,
    export_extras=False,
)
print("KB_EXPORT_OK", OUT)
