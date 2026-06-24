# Tiny placeholder model for the hand-model handoff slot, so dropping a glb into
# public/models/ visibly appears in the hall. Max replaces placeholder.glb with
# his own hand-modeled .glb (same loader, no rewiring). See docs/ASSET_PIPELINE.md.
import bpy, os, math
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public/models/placeholder.glb")
bpy.ops.wm.read_factory_settings(use_empty=True)

# a small tapered obelisk on a plinth
bpy.ops.mesh.primitive_cube_add(size=1)
plinth = bpy.context.object
plinth.scale = (1.1, 0.5, 1.1)
plinth.location = (0, 0, 0.5)

bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.55, radius2=0.12, depth=3.4)
shaft = bpy.context.object
shaft.location = (0, 0, 2.7)
shaft.rotation_euler = (0, 0, math.radians(45))

bpy.ops.object.select_all(action="SELECT")
bpy.context.view_layer.objects.active = plinth
bpy.ops.object.join()
o = bpy.context.object
mat = bpy.data.materials.new("stone"); mat.use_nodes = True
mat.node_tree.nodes.get("Principled BSDF").inputs["Base Color"].default_value = (0.4, 0.33, 0.24, 1)
o.data.materials.append(mat)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_apply=True)
print("KB_PLACEHOLDER_OK", OUT)
