import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { HallWork } from './Gallery3D';

type Hang = { eye: number; works: { slug: string; x: number; y: number; z: number; w: number; h: number }[] };
type Events = { onChange: (index: number) => void; onOpen: (index: number) => void };

const INK = 0x0b0a09;
// The light maps are baked at twice the room's brightness for 8-bit precision in the dark (LIGHT_SCALE in the Blender
// script); this brings them back, with a small lift tuned by eye against the photos.
const EXPOSURE = .5 * 1.15;

/**
 * The hall built in Blender (scripts/blender/build-room.py): geometry plus baked light, drawn unlit, so a phone does no
 * lighting maths at all. Paintings are the original photos on 2.5 cm deep canvases, unlit and untoned, so every pixel
 * shows as photographed, and the camera never brings one closer than the photo's own pixel size.
 */
export async function createHall(host: HTMLElement, works: HallWork[], events: Events) {
  const [hang, gltf, roomLight, floorLight] = await Promise.all([
    fetch('/room/hang.json').then(r => r.json() as Promise<Hang>),
    new GLTFLoader().loadAsync('/room/room.glb'),
    new THREE.TextureLoader().loadAsync('/room/room-light.webp'),
    new THREE.TextureLoader().loadAsync('/room/floor-light.webp'),
  ]);
  const N = works.length;
  const spots = works.map(w => hang.works.find(h => h.slug === w.slug)!);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.domElement.className = 'art';
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', 'A dark hall of pointed stone niches, a painting by Harrison Ferraro hung in each');
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(INK);
  scene.fog = new THREE.Fog(INK, 4, 12);
  const camera = new THREE.PerspectiveCamera(32, 1, .05, 40);
  const disposables: { dispose: () => void }[] = [renderer, roomLight, floorLight];

  for (const tex of [roomLight, floorLight]) { tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; }
  gltf.scene.traverse(o => {
    if (!(o instanceof THREE.Mesh)) return;
    const mat = new THREE.MeshBasicMaterial({ map: o.name.startsWith('floor') ? floorLight : roomLight, dithering: true });
    mat.color.setScalar(EXPOSURE);
    o.material = mat;
    disposables.push(mat, o.geometry);
  });
  scene.add(gltf.scene);

  // canvases
  const loader = new THREE.TextureLoader();
  const edge = new THREE.MeshBasicMaterial({ color: 0x1c1915 });
  disposables.push(edge);
  const faces: THREE.MeshBasicMaterial[] = [];
  const canvases: THREE.Mesh[] = [];
  const first = works.map((w, i) => {
    const s = spots[i];
    const face = new THREE.MeshBasicMaterial({ toneMapped: false, color: 0x000000 });
    const geo = new THREE.BoxGeometry(s.w, s.h, .025);
    const box = new THREE.Mesh(geo, [edge, edge, edge, edge, face, edge]);
    box.position.set(s.x, s.y, s.z - .0125);
    box.userData.index = i;
    scene.add(box); faces.push(face); canvases.push(box);
    disposables.push(face, geo);
    return loader.loadAsync(w.src).then(tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      face.map = tex; face.needsUpdate = true; disposables.push(tex);
    });
  });
  await first[0];

  // dust in the light
  const motesN = 70, mp = new Float32Array(motesN * 3);
  for (let i = 0; i < motesN; i++) mp.set([(Math.random() - .5) * .9, 1 + Math.random() * 2, Math.random() * .6 + .05], i * 3);
  const motesGeo = new THREE.BufferGeometry(); motesGeo.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const motesMat = new THREE.PointsMaterial({ color: 0xfff1dc, size: .003, transparent: true, opacity: .28, depthWrite: false, blending: THREE.AdditiveBlending });
  const motes = new THREE.Points(motesGeo, motesMat);
  scene.add(motes); disposables.push(motesGeo, motesMat);

  let pos = 0, target = 0, cur = -1, px = 0, py = 0, visible = true, raf = 0;
  const xAt = (p: number) => { const i = Math.max(0, Math.min(N - 2, Math.floor(p))); return spots[i].x + (spots[i + 1].x - spots[i].x) * (p - i); };
  const phone = () => host.clientWidth < 700;

  // One viewing distance for the whole hall (a portrait canvas fills 44% of the height), so the room never zooms
  // between paintings; only a narrow screen steps back further, to fit the canvas across.
  function dist(i: number) {
    const s = spots[i], w = works[i];
    const t = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const fitH = .9 / .44, fitW = s.w / ((phone() ? .74 : .5) * camera.aspect);
    const native = s.h * host.clientHeight / Math.min(w.height, host.clientHeight);
    return Math.max(fitH, fitW, native) / t;
  }

  function resize() {
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(host); resize();
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(host);

  const clock = new THREE.Clock();
  function frame() {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const dt = Math.min(clock.getDelta(), .05);
    pos += (target - pos) * (1 - Math.exp(-dt * 4.5));
    const near = Math.round(pos);
    if (near !== cur) { cur = near; events.onChange(near); }
    const lo = Math.max(0, Math.floor(pos)), hi = Math.min(N - 1, lo + 1), f = pos - lo;
    const d = THREE.MathUtils.lerp(dist(lo), dist(hi), f);
    // between paintings the visitor steps back, so the room shows, then walks in to the next one
    const back = Math.sin(Math.PI * Math.min(1, Math.abs(target - pos))) * (phone() ? .8 : .6);
    const t = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    // Desktop looks a little above the painting, so the pointed arch shows over it. A phone looks below it, so the
    // painting sits in the space between the header and the label.
    const lift = phone() ? d * t * .1 : -.2;
    const cx = xAt(pos);
    camera.position.set(cx + px * .16, hang.eye - lift + py * .08, d + back);
    camera.lookAt(cx, hang.eye - lift, 0);
    faces.forEach((m, i) => { if (m.map) m.color.setScalar(.55 + .45 * Math.max(0, 1 - Math.abs(pos - i))); });
    const time = clock.elapsedTime;
    for (let i = 0; i < motesN; i++) { const k = i * 3 + 1; mp[k] += Math.sin(time * .3 + i) * .0003 + .00015; if (mp[k] > 3) mp[k] = 1; }
    motesGeo.attributes.position.needsUpdate = true;
    motes.position.x = cx;
    renderer.render(scene, camera);
  }
  frame();

  const go = (i: number) => { target = Math.max(0, Math.min(N - 1, i)); };
  const inView = () => { const r = host.getBoundingClientRect(); return r.top > -2 && r.top < innerHeight / 2; };

  // Drag or swipe sideways; vertical swipes still scroll the page (touch-action: pan-y).
  let down: { x: number; p: number; t: number; moved: boolean } | null = null;
  const el = renderer.domElement;
  const onDown = (e: PointerEvent) => { down = { x: e.clientX, p: pos, t: performance.now(), moved: false }; };
  const onMove = (e: PointerEvent) => {
    if (!down) { if (e.pointerType === 'mouse') { px = e.clientX / innerWidth - .5; py = .5 - e.clientY / innerHeight; } return; }
    const dx = e.clientX - down.x;
    if (Math.abs(dx) > 8) { down.moved = true; el.setPointerCapture(e.pointerId); }
    if (down.moved) target = pos = Math.max(-.3, Math.min(N - .7, down.p - dx / (host.clientWidth * .5)));
  };
  const onUp = (e: PointerEvent) => {
    if (!down) return;
    const v = (e.clientX - down.x) / (performance.now() - down.t);
    if (down.moved) go(Math.round(pos - (Math.abs(v) > .35 ? Math.sign(v) * .5 : 0)));
    else {
      const r = el.getBoundingClientRect();
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
      const hit = ray.intersectObjects(canvases)[0];
      if (hit) { const i = hit.object.userData.index as number; if (i === cur) events.onOpen(i); else go(i); }
    }
    down = null;
  };
  const onCancel = () => { if (down?.moved) go(Math.round(pos)); down = null; };

  // The wheel walks the hall while it fills the screen, and lets the page scroll on past either end.
  let lock = 0;
  const onWheel = (e: WheelEvent) => {
    const dir = Math.sign(Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY);
    if (!dir || !inView() || (dir > 0 && target >= N - 1) || (dir < 0 && target <= 0)) return;
    e.preventDefault();
    const now = performance.now();
    if (now - lock < 650) return;
    lock = now; go(target + dir);
  };
  const onKey = (e: KeyboardEvent) => {
    if (!inView() || (e.target as HTMLElement).closest('input, textarea, select')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(target + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(target - 1); }
  };
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onCancel);
  host.addEventListener('wheel', onWheel, { passive: false });
  addEventListener('keydown', onKey);

  return {
    go,
    step: (dir: number) => go(target + dir),
    dispose() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      host.removeEventListener('wheel', onWheel); removeEventListener('keydown', onKey);
      disposables.forEach(d => d.dispose());
      el.remove();
    },
  };
}
