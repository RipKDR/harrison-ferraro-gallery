"""Build the gallery room for the 3D home: geometry, lights, baked light maps, GLB.

Run headless:  blender -b -P scripts/blender/build-room.py -- preview   (one Cycles still, to judge the look)
               blender -b -P scripts/blender/build-room.py -- bake      (bake + export into public/room/)

Paintings are NOT part of the room. three.js hangs the real photos at runtime, unlit, so their colours stay the
photo's pixels. Placeholder canvases sit in the niches only while baking, so the wall gets their shadows.
"""
import bpy, bmesh, json, math, os, re, sys
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'public', 'room')
MODE = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'preview'
SAMPLES = int(os.environ.get('SAMPLES', '256'))
# bake brighter than the room looks, for 8-bit precision in the dark; three.js scales it back (EXPOSURE)
LIGHT_SCALE = float(os.environ.get('LIGHT_SCALE', '1' if MODE == 'preview' else '2'))
os.makedirs(OUT, exist_ok=True)

# Hang order and orientation come straight from the catalogue.
src = open(os.path.join(ROOT, 'src', 'artworks.ts'), encoding='utf-8').read()
works = [(s, int(w) > int(h)) for s, w, h in re.findall(r"slug: '([^']+)'.*?width: (\d+), height: (\d+)", src)]
assert len(works) == 10, works

# Metres. Blender is Z-up, the wall face is the plane y = 0, the visitor stands at negative y.
H, THICK, DEPTH = 4.2, 0.45, 0.2           # wall height, wall thickness, niche depth
EYE = 1.5                                   # painting centre height
PIER = 0.95                                 # wall between niches
SILL = 0.55                                 # niche floor height
SPRING = 2.0                                # where the pointed arch starts
MOULD = 0.075                               # width of the stone surround

bays, x = [], 0.0
for i, (slug, land) in enumerate(works):
    w = 1.36 if land else 1.0
    if i: x += PIER + w / 2
    bays.append(dict(slug=slug, land=land, w=w, x=x))
    x += w / 2
X0, X1 = -3.0, x + 3.0

# ---------------------------------------------------------------- scene reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'


def arch_outline(cx, w, bottom, grow=0.0, seg=28):
    """Equilateral pointed arch: vertical sides from bottom to SPRING, then two arcs of radius w meeting at the apex."""
    half, r = w / 2, w
    pts = [(cx - half - grow, bottom - grow), (cx + half + grow, bottom - grow)]
    # right arc is centred on the left spring-side centre and vice versa
    cr = (cx + half - r, SPRING)           # centre of the right-hand arc
    apex = math.sqrt(r * r - (r - half) ** 2)
    a_end = math.atan2(apex, cx - cr[0])
    for k in range(seg + 1):
        a = a_end * k / seg
        pts.append((cr[0] + (r + grow) * math.cos(a), cr[1] + (r + grow) * math.sin(a)))
    cl = (cx - half + r, SPRING)
    for k in range(seg + 1):
        a = math.pi - a_end + a_end * k / seg
        pts.append((cl[0] + (r + grow) * math.cos(a), cl[1] + (r + grow) * math.sin(a)))
    # drop the duplicated apex point
    out = []
    for p in pts:
        if not out or (abs(p[0] - out[-1][0]) > 1e-5 or abs(p[1] - out[-1][1]) > 1e-5):
            out.append(p)
    return out


def prism(name, outline, y0, y1):
    """Extrude an x/z outline between y0 and y1 into a closed solid."""
    bm = bmesh.new()
    vs = [bm.verts.new((px, y0, pz)) for px, pz in outline]
    face = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[face])
    moved = [g for g in ext['geom'] if isinstance(g, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=moved, vec=(0, y1 - y0, 0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me)
    scene.collection.objects.link(ob)
    return ob


def box(name, x0, x1, y0, y1, z0, z1):
    return prism(name, [(x0, z0), (x1, z0), (x1, z1), (x0, z1)], y0, y1)


def join(name, obs):
    bpy.ops.object.select_all(action='DESELECT')
    for o in obs: o.select_set(True)
    bpy.context.view_layer.objects.active = obs[0]
    bpy.ops.object.join()
    obs[0].name = name
    return obs[0]


def boolean(target, tool, op):
    m = target.modifiers.new(op, 'BOOLEAN')
    m.operation, m.object, m.solver = op, tool, 'EXACT'
    m.use_self = True
    bpy.context.view_layer.objects.active = target
    bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.data.objects.remove(tool)


def material(name, build):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes['Principled BSDF']
    build(nt, bsdf)
    return mat


def plaster(nt, bsdf):
    """Lime plaster, near-black and warm, mottled by hand."""
    tc = nt.nodes.new('ShaderNodeTexCoord')
    n1 = nt.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 2.2; n1.inputs['Detail'].default_value = 8; n1.inputs['Roughness'].default_value = .62
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (.030, .026, .022, 1)
    ramp.color_ramp.elements[1].color = (.085, .075, .064, 1)
    ramp.color_ramp.elements[0].position, ramp.color_ramp.elements[1].position = .32, .72
    nt.links.new(tc.outputs['Object'], n1.inputs['Vector'])
    nt.links.new(n1.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = .95


def stone(nt, bsdf):
    """Carved surround and sill: a shade lighter than the plaster, so the arch reads."""
    tc = nt.nodes.new('ShaderNodeTexCoord')
    n1 = nt.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 14; n1.inputs['Detail'].default_value = 6
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (.07, .064, .056, 1)
    ramp.color_ramp.elements[1].color = (.13, .118, .10, 1)
    nt.links.new(tc.outputs['Object'], n1.inputs['Vector'])
    nt.links.new(n1.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = .9


def flags(nt, bsdf):
    """Old stone flags: big uneven slabs with dark joints."""
    tc = nt.nodes.new('ShaderNodeTexCoord')
    br = nt.nodes.new('ShaderNodeTexBrick')
    br.inputs['Scale'].default_value = .62
    br.inputs['Mortar Size'].default_value = .008
    br.inputs['Color1'].default_value = (.040, .036, .032, 1)
    br.inputs['Color2'].default_value = (.026, .024, .021, 1)
    br.inputs['Mortar'].default_value = (.008, .007, .006, 1)
    br.offset, br.squash = .5, 1.0
    nt.links.new(tc.outputs['Object'], br.inputs['Vector'])
    nt.links.new(br.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = .6


def flat(rgb, rough=.8, metal=0.0):
    def b(nt, bsdf):
        bsdf.inputs['Base Color'].default_value = (*rgb, 1)
        bsdf.inputs['Roughness'].default_value = rough
        bsdf.inputs['Metallic'].default_value = metal
    return b


M_PLASTER = material('plaster', plaster)
M_STONE = material('stone', stone)
M_FLOOR = material('flags', flags)
M_IRON = material('iron', flat((.012, .011, .010), .5, 1.0))
M_CEIL = material('ceiling', flat((.012, .011, .010), .95))
M_CANVAS = material('canvas', flat((.18, .16, .14), .9))

# ---------------------------------------------------------------- geometry
wall = box('wall', X0, X1, 0, THICK, 0, H)
adds = []
cut = []
for b in bays:
    adds.append(prism('surround', arch_outline(b['x'], b['w'], SILL, MOULD), -0.03, 0.01))
    adds.append(box('sill', b['x'] - b['w'] / 2 - MOULD - .04, b['x'] + b['w'] / 2 + MOULD + .04, -0.07, 0.02, SILL - MOULD - .045, SILL - MOULD + .005))
    cut.append(prism('niche', arch_outline(b['x'], b['w'], SILL), -0.2, DEPTH))
adds.append(box('skirting', X0, X1, -0.025, 0.01, 0, 0.24))
adds_ob = join('adds', adds)
for p in adds_ob.data.polygons: p.material_index = 1
wall.data.materials.append(M_PLASTER); wall.data.materials.append(M_STONE)
adds_ob.data.materials.append(M_PLASTER); adds_ob.data.materials.append(M_STONE)
boolean(wall, adds_ob, 'UNION')
boolean(wall, join('cut', cut), 'DIFFERENCE')

# ceiling, light track and cans
ceil = box('ceiling', X0, X1, -7, THICK, H, H + .05)
ceil.data.materials.append(M_CEIL)
track = box('track', X0, X1, -1.34, -1.30, 3.92, 3.96)
track.data.materials.append(M_IRON)
lights_meta = []
for b in bays:
    pos = Vector((b['x'], -1.32, 3.78))
    aim = Vector((b['x'], DEPTH, EYE + .05))
    bpy.ops.mesh.primitive_cylinder_add(radius=.048, depth=.17, vertices=24, location=pos)
    can = bpy.context.active_object
    can.rotation_euler = (aim - pos).to_track_quat('-Z', 'Y').to_euler()
    can.data.materials.append(M_IRON)
    stem = box('stem', b['x'] - .008, b['x'] + .008, -1.328, -1.312, 3.84, 3.93); stem.data.materials.append(M_IRON)
    lights_meta.append((pos, aim, can, stem))
fixtures = join('fixtures', [track] + [m[2] for m in lights_meta] + [m[3] for m in lights_meta])

floor = box('floor', X0, X1, -4.5, 0.0, -0.05, 0.0)
floor.data.materials.append(M_FLOOR)

# placeholder canvases (bake only): 2.5 cm deep, hung on the niche back
hang = []
for b in bays:
    cw, ch = (.9, .6) if b['land'] else (.6, .9)
    c = box('canvas', b['x'] - cw / 2, b['x'] + cw / 2, DEPTH - .025, DEPTH, EYE - ch / 2, EYE + ch / 2)
    c.data.materials.append(M_CANVAS)
    c['placeholder'] = True
    # three.js is Y-up with the visitor at +z: (x, y, z)blender -> (x, z, -y)
    hang.append(dict(slug=b['slug'], x=round(b['x'], 4), y=EYE, z=round(-(DEPTH - .025), 4), w=cw, h=ch, niche=b['w']))

# ---------------------------------------------------------------- light
world = bpy.data.worlds.new('world'); scene.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (.0025 * LIGHT_SCALE, .0022 * LIGHT_SCALE, .002 * LIGHT_SCALE, 1)
# a low wash from the visitor's side, so the piers and floor are sensed, not black
fill_d = bpy.data.lights.new('fill', 'AREA'); fill_d.shape = 'RECTANGLE'; fill_d.size, fill_d.size_y = X1 - X0, 2.0
fill_d.energy = float(os.environ.get('FILL_W', '40')) * LIGHT_SCALE; fill_d.color = (1.0, .86, .72)
fill = bpy.data.objects.new('fill', fill_d); fill.location = ((X0 + X1) / 2, -5.5, 3.2)
fill.rotation_euler = (Vector((0, 1, -.35))).to_track_quat('-Z', 'Y').to_euler(); scene.collection.objects.link(fill)
for pos, aim, *_ in lights_meta:
    ld = bpy.data.lights.new('spot', 'SPOT')
    ld.energy = float(os.environ.get('SPOT_W', '260')) * LIGHT_SCALE
    ld.color = (1.0, .80, .60)
    ld.spot_size = math.radians(40)
    ld.spot_blend = .75
    ld.shadow_soft_size = .12
    lo = bpy.data.objects.new('spot', ld)
    lo.location = pos + (aim - pos).normalized() * .1
    lo.rotation_euler = (aim - pos).to_track_quat('-Z', 'Y').to_euler()
    scene.collection.objects.link(lo)

scene.render.engine = 'CYCLES'
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for kind in ('ONEAPI', 'OPTIX', 'CUDA', 'HIP', 'METAL'):
        try:
            prefs.compute_device_type = kind
            prefs.get_devices()
            gpus = [d for d in prefs.devices if d.type != 'CPU']
            if gpus:
                for d in prefs.devices: d.use = True
                scene.cycles.device = 'GPU'
                print('cycles device', kind, [d.name for d in gpus])
                break
        except TypeError:
            continue
except Exception as e:
    print('GPU setup skipped:', e)

# ---------------------------------------------------------------- preview
if MODE == 'preview':
    focus = bays[int(os.environ.get('BAY', '5'))]
    cam_d = bpy.data.cameras.new('cam'); cam_d.lens = 30
    cam = bpy.data.objects.new('cam', cam_d); scene.collection.objects.link(cam)
    cam.location = (focus['x'] + float(os.environ.get('CAM_DX', '0')), -float(os.environ.get('CAM_D', '3.4')), 1.45)
    cam.rotation_euler = (Vector((focus['x'], DEPTH, 1.65)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
    scene.camera = cam
    scene.render.resolution_x, scene.render.resolution_y = int(os.environ.get('RES_X', '1280')), int(os.environ.get('RES_Y', '720'))
    scene.cycles.samples = int(os.environ.get('SAMPLES', '96'))
    scene.cycles.use_denoising = True
    scene.view_settings.view_transform = 'Standard'
    scene.render.filepath = os.environ.get('PREVIEW_OUT', os.path.join(ROOT, 'sketches', 'shots', 'blender-preview.png'))
    bpy.ops.render.render(write_still=True)
    print('preview written', scene.render.filepath)
    sys.exit(0)

# ---------------------------------------------------------------- bake
scene.cycles.samples = SAMPLES
scene.render.bake.use_pass_direct = True
scene.render.bake.use_pass_indirect = True
scene.render.bake.use_pass_diffuse = True
scene.render.bake.use_pass_glossy = False
scene.render.bake.use_pass_transmission = False
scene.render.bake.use_pass_emit = True
scene.render.bake.margin = 12

room = join('room', [wall, fixtures])
# drop faces nobody sees (wall back, top, ends) so the light map spends its texels on the room
bm = bmesh.new(); bm.from_mesh(room.data)
dead = [f for f in bm.faces if f.calc_center_median().y > THICK - 1e-3 or f.calc_center_median().z > H - 1e-3
        or abs(f.calc_center_median().x - X0) < 1e-3 or abs(f.calc_center_median().x - X1) < 1e-3]
bmesh.ops.delete(bm, geom=dead, context='FACES')
# cut the wall at the middle of every pier, one bay per piece: each piece unwraps as its own island, so the light map
# is a grid of square-ish bays instead of one 20 m strip, and the cuts fall on flat, evenly lit wall
cuts = [(a['x'] + b['x']) / 2 for a, b in zip(bays, bays[1:])]
for cx in cuts:
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(cx, 0, 0), plane_no=(1, 0, 0))
bm.to_mesh(room.data); bm.free()
pieces = [room]
bpy.ops.object.select_all(action='DESELECT'); room.select_set(True); bpy.context.view_layer.objects.active = room
for cx in reversed(cuts):
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='DESELECT'); bpy.ops.object.mode_set(mode='OBJECT')
    for poly in room.data.polygons: poly.select = poly.center.x > cx
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.separate(type='SELECTED'); bpy.ops.object.mode_set(mode='OBJECT')
    pieces.append([o for o in bpy.context.selected_objects if o is not room and o not in pieces][0])
    bpy.ops.object.select_all(action='DESELECT'); room.select_set(True); bpy.context.view_layer.objects.active = room
targets = [(pieces, 'room-light', int(os.environ.get('ROOM_RES', '4096'))), ([floor], 'floor-light', int(os.environ.get('FLOOR_RES', '2048')))]

for obs, name, res in targets:
    bpy.ops.object.select_all(action='DESELECT')
    for ob in obs: ob.select_set(True)
    bpy.context.view_layer.objects.active = obs[0]
    # all pieces in one edit session: smart project per piece, then one shared pack into the square
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=.003, area_weight=1.0, scale_to_bounds=False)
    bpy.ops.uv.pack_islands(rotate=True, margin=.003, shape_method='CONCAVE')
    bpy.ops.object.mode_set(mode='OBJECT')
    # one object per bake: baking the pieces separately renders the whole image once per piece
    if len(obs) > 1:
        obs[:] = [join(name, obs)]
    img = bpy.data.images.new(name, res, res, alpha=False, float_buffer=True)
    for ob in obs:
        for k, mat in enumerate(ob.data.materials):
            if mat is None: ob.data.materials[k] = M_PLASTER
    for mat in {m for ob in obs for m in ob.data.materials}:
        node = mat.node_tree.nodes.new('ShaderNodeTexImage')
        node.image = img
        mat.node_tree.nodes.active = node
    print('baking', name, res, 'samples', SAMPLES, flush=True)
    bpy.ops.object.bake(type='COMBINED')
    # WebP through the Standard view: plain sRGB encoding of the baked light, no tone curve, dithered against banding
    scene.view_settings.view_transform = 'Standard'
    scene.render.dither_intensity = 1.0
    scene.render.image_settings.file_format = 'WEBP'
    scene.render.image_settings.quality = 88
    path = os.path.join(OUT, name + '.webp')
    img.save_render(path, scene=scene)
    print('saved', path, flush=True)

# export room + floor only (no canvases, no lights), geometry and the single UV set
for o in scene.objects:
    if o.get('placeholder') or o is ceil: bpy.data.objects.remove(o)
room = pieces[0]
bpy.ops.object.select_all(action='DESELECT')
room.select_set(True); floor.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'room.glb'), export_format='GLB', use_selection=True,
                          export_materials='NONE', export_normals=False, export_texcoords=True, export_yup=True)
json.dump(dict(eye=EYE, works=hang, x0=X0, x1=X1), open(os.path.join(OUT, 'hang.json'), 'w'), indent=1)
print('exported room.glb + hang.json')
