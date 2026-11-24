import * as THREE from 'three';
import type { Artwork } from '../artworks';
type CameraPose = { x: number; y: number; z: number; f: number; sx: number; sy: number };
export type FloorRoom = Awaited<ReturnType<typeof createRoom>>;

// The open floor: ten glass easels standing in a long low hall, each a step further back and to
// the left. The camera always looks straight down the hall (verticals stay vertical) and uses a
// shifted lens so the painting in front lands exactly on the DOM image's box. At rest that DOM
// image is what you see; the 3D copy only shows while walking and for the easels further back.

// Composition: every number a fix might need, in metres unless noted.
const LONG = 0.9;                       // long side of each canvas; photos keep their own ratio
const CENTRE = 1.3;                     // painting centre height
const STEP = { x: -1.2, z: -3.3 };      // offset from one easel to the next
// lift: eye above the painting centre. dist: camera to painting. aside: camera stands this far
// right of the easel, which moves the vanishing point right and lifts the next easels into view.
const VIEW = {
  wide: { lift: 0.55, dist: 2.6, aside: 0 },     // horizon just above the painting's top edge
  tall: { lift: 1.05, dist: 2.2, aside: 0.5 },   // phones in portrait: next easels rise above it
};
const TALL_BELOW = 0.8;                 // width/height under which the tall view applies
const MOVE_MS = 1400;
const MAX_DPR = 1.75;
const FOG = { color: 0x0f0e0d, near: 7, far: 40 };
const CEILING = 4.4;
const STRIPS = [-10, -6, -2, 2];        // x of the ceiling light lines (they run down the hall)
const FLOOR = { x0: -24, width: 40, z: -25, depth: 90 };
const BASE = { w: 0.46, h: 0.34 };      // concrete block each glass pane stands in
const FACE_Z = 0.04;                    // painting face in front of its glass (clear of depth fighting)

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function canvasTexture(width: number, height: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d')!, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const radial = (rgb: string) => canvasTexture(128, 128, (g, w) => {
  const grad = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  grad.addColorStop(0, `rgba(${rgb}, 1)`);
  grad.addColorStop(1, `rgba(${rgb}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, w, w);
});

export async function createRoom(canvas: HTMLCanvasElement, works: Artwork[], { onLost }: { onLost: () => void }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  let lost = false;
  let disposed = false;
  let suspended = document.hidden;
  let frameId = 0;
  let finishMove: (() => void) | undefined;
  const stopMove = () => { cancelAnimationFrame(frameId); finishMove?.(); finishMove = undefined; };
  const contextLost = (event: Event) => { event.preventDefault(); lost = true; stopMove(); onLost(); };
  canvas.addEventListener('webglcontextlost', contextLost);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(FOG.color);
  scene.fog = new THREE.Fog(FOG.color, FOG.near, FOG.far);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 120);

  // Floor: dark polished concrete; the ceiling lines show in it as soft streaks.
  const floorMap = canvasTexture(1024, 4, (g, w, h) => {
    g.fillStyle = '#171615';
    g.fillRect(0, 0, w, h);
    for (const x of STRIPS) {
      const u = ((x - FLOOR.x0) / FLOOR.width) * w;
      const grad = g.createLinearGradient(u - 16, 0, u + 16, 0);
      grad.addColorStop(0, 'rgba(66, 63, 58, 0)');
      grad.addColorStop(0.5, 'rgba(66, 63, 58, 1)');
      grad.addColorStop(1, 'rgba(66, 63, 58, 0)');
      g.fillStyle = grad;
      g.fillRect(u - 16, 0, 32, h);
    }
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(FLOOR.width, FLOOR.depth), new THREE.MeshBasicMaterial({ map: floorMap }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(FLOOR.x0 + FLOOR.width / 2, 0, FLOOR.z);
  scene.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(FLOOR.width, FLOOR.depth), new THREE.MeshBasicMaterial({ color: 0x0c0b0b }));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(FLOOR.x0 + FLOOR.width / 2, CEILING, FLOOR.z);
  scene.add(ceiling);

  const stripGeo = new THREE.BoxGeometry(0.14, 0.03, FLOOR.depth);
  const stripMat = new THREE.MeshBasicMaterial({ color: 0xe8e1d5 });
  for (const x of STRIPS) {
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.position.set(x, CEILING - 0.02, FLOOR.z);
    scene.add(strip);
  }

  // Easels
  const baseGeo = new THREE.BoxGeometry(BASE.w, BASE.h, BASE.w);
  const baseMats = [0x45423e, 0x3b3936, 0x6b6761, 0x222120, 0x504c47, 0x34322f].map(color => new THREE.MeshBasicMaterial({ color }));
  const glassMat = new THREE.MeshBasicMaterial({ color: 0xb4c2be, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide });
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xcfd6d2, transparent: true, opacity: 0.3 });
  const bodyMat = new THREE.MeshBasicMaterial({ color: 0x1c1a18 });
  const shadowMat = new THREE.MeshBasicMaterial({ map: radial('0, 0, 0'), transparent: true, opacity: 0.6, depthWrite: false });
  const poolMat = new THREE.MeshBasicMaterial({ map: radial('236, 230, 220'), transparent: true, opacity: 0.08, depthWrite: false });
  const decalGeo = new THREE.PlaneGeometry(1, 1);

  const easels = works.map((work, i) => {
    const h = (work.width > work.height) ? (LONG * work.height) / work.width : LONG;
    const w = (work.width > work.height) ? LONG : (LONG * work.width) / work.height;
    const x = STEP.x * i;
    const z = STEP.z * i;
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    scene.add(group);

    const base = new THREE.Mesh(baseGeo, baseMats);
    base.position.y = BASE.h / 2;
    const glassH = CENTRE + h / 2 + 0.2 - BASE.h;
    const glassGeo = new THREE.PlaneGeometry(w + 0.16, glassH);
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.y = BASE.h + glassH / 2;
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(glassGeo), edgeMat);
    edge.position.copy(glass.position);
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.025), bodyMat);
    body.position.set(0, CENTRE, FACE_Z - 0.0205);
    // The photo: unlit, untoned, unfogged. Dark until its texture arrives, never white.
    const faceMat = new THREE.MeshBasicMaterial({ color: 0x1a1816, toneMapped: false, fog: false });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), faceMat);
    face.position.set(0, CENTRE, FACE_Z);

    const shadow = new THREE.Mesh(decalGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.scale.set(1.3, 1.3, 1);
    shadow.position.y = 0.002;
    const pool = new THREE.Mesh(decalGeo, poolMat);
    pool.rotation.x = -Math.PI / 2;
    pool.scale.set(2.6, 2, 1);
    pool.position.set(0, 0.003, 0.9);

    group.add(pool, shadow, base, glass, edge, body, face);
    return { work, x, z, h, face, faceMat, loaded: false };
  });

  // Far wall: a dim lit band where the hall ends, so the horizon has an edge.
  const endMap = canvasTexture(4, 256, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#121110');
    grad.addColorStop(0.55, '#24221f');
    grad.addColorStop(1, '#1a1917');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  });
  const end = new THREE.Mesh(new THREE.PlaneGeometry(FLOOR.width, CEILING), new THREE.MeshBasicMaterial({ map: endMap, fog: false }));
  end.position.set(FLOOR.x0 + FLOOR.width / 2, CEILING / 2, FLOOR.z - FLOOR.depth / 2 + 0.01);
  scene.add(end);

  let cam: CameraPose | null = null;
  let hidden = -1;
  let width = 0;
  let height = 0;

  const draw = () => { if (!lost && !disposed && !suspended && cam) renderer.render(scene, camera); };

  const loader = new THREE.TextureLoader();
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  for (const easel of easels) {
    loader.load(easel.work.src, texture => {
      if (disposed) { texture.dispose(); return; }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = anisotropy;
      easel.faceMat.map = texture;
      easel.faceMat.color.set(0xffffff);
      easel.faceMat.needsUpdate = true;
      easel.loaded = true;
      draw();
    });
  }

  function size() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w !== width || h !== height) {
      width = w;
      height = h;
      renderer.setSize(w, h, false);
    }
  }

  // Camera that puts easel i's painting exactly on the given screen box.
  function solve(i: number, rect: DOMRect) {
    const view = width / height < TALL_BELOW ? VIEW.tall : VIEW.wide;
    const easel = easels[i];
    const pxPerMetre = rect.height / easel.h;
    const f = (2 * view.dist * pxPerMetre) / height;          // 1 / tan(fov / 2)
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Lens shift: move the frustum so the painting, seen from (aside, lift), lands on the box.
    return {
      x: easel.x + view.aside,
      y: CENTRE + view.lift,
      z: easel.z + FACE_Z + view.dist,
      f,
      sx: (2 * cx) / width - 1 + (f * height * view.aside) / (width * view.dist),
      sy: 1 - (2 * cy) / height + (f * view.lift) / view.dist,
    };
  }

  function apply(c: CameraPose) {
    cam = c;
    camera.position.set(c.x, c.y, c.z);
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(1 / c.f));
    camera.aspect = width / height;
    camera.setViewOffset(width, height, (-c.sx * width) / 2, (c.sy * height) / 2, width, height);
    // Never show a painting above its native pixel height, including mid-walk.
    easels.forEach((easel, i) => {
      const depth = c.z - (easel.z + FACE_Z);
      const px = depth > 0.05 ? (easel.h * c.f * height) / (2 * depth) : Infinity;
      easel.face.visible = i !== hidden && px <= easel.work.height + 0.5;
    });
  }

  return {
    // Rendering is demand-only; an interrupted walk settles to its DOM image.
    suspend(value: boolean) { suspended = value; if (value) stopMove(); else draw(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      stopMove();
      canvas.removeEventListener('webglcontextlost', contextLost);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      const textures = new Set<THREE.Texture>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          geometries.add(object.geometry);
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            materials.add(material);
            if ('map' in material && material.map instanceof THREE.Texture) textures.add(material.map);
          }
        }
      });
      textures.forEach(texture => texture.dispose());
      materials.forEach(material => material.dispose());
      geometries.forEach(geometry => geometry.dispose());
      scene.clear();
      renderer.dispose();
    },
    ready: (a: number, b: number) => easels[a].loaded && easels[b].loaded,
    // At rest the DOM image covers easel i, so its 3D copy is hidden.
    place(i: number, rect: DOMRect) {
      size();
      hidden = i;
      apply(solve(i, rect));
      draw();
    },
    lift() {
      hidden = -1;
      if (cam) apply(cam);
      draw();
    },
    move(a: number, b: number, rect: DOMRect) {
      size();
      const from = cam!;
      const to = solve(b, rect);
      const forward = b > a;
      return new Promise<void>(resolve => {
        finishMove = resolve;
        const start = performance.now();
        const frame = (now: number) => {
          if (lost || disposed || suspended) { resolve(); return; }
          const t = Math.min(1, (now - start) / MOVE_MS);
          const u = easeInOut(t);
          // Sidestep while beside the nearer easel, so the walk never passes through a pane.
          const early = 1 - Math.pow(1 - u, 2.5);
          const late = Math.pow(u, 2.5);
          apply({
            x: lerp(from.x, to.x, forward ? early : late),
            z: lerp(from.z, to.z, forward ? late : early),
            y: lerp(from.y, to.y, u),
            f: lerp(from.f, to.f, u),
            sx: lerp(from.sx, to.sx, u),
            sy: lerp(from.sy, to.sy, u),
          });
          draw();
          if (t < 1) frameId = requestAnimationFrame(frame);
          else { finishMove = undefined; resolve(); }
        };
        frameId = requestAnimationFrame(frame);
      });
    },
  };
}
