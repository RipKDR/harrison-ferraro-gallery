'use client';
import { useEffect, useRef } from 'react';

// Domain-warped noise in bone, low alpha, drawn at half resolution: smoke is soft, so the GPU can be too.
// Colour is premultiplied here and the material's normal blending multiplies by alpha again, so brightness goes with alpha
// squared: thin smoke all but vanishes and thick smoke stays bright, which reads as wisps rather than fog. Keep it.
const fragment = `
precision highp float;
uniform float uTime;
uniform vec2 uDrift;
uniform float uStrength;
uniform float uCap;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform vec4 uSource;
// Sine-free hash: sin() on large inputs loses precision on some GPUs and shows as square blocks.
float hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
  return v;
}
// The warp fields are smoother than the smoke: fine octaves fed back through a warp fold the field into hard, jagged cliffs.
float warp(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
  return v / 0.875;
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes.y;
  float t = uTime * 0.025;
  // Sampling lower each second makes the smoke rise. The air sits behind the wall, so it drifts at half the walk.
  vec2 p = uv * 1.7 + vec2(uDrift.x * 0.85, uDrift.y * 0.35 - uTime * 0.035);
  vec2 q = vec2(warp(p + vec2(0.0, t)), warp(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(warp(p + 2.2 * q + vec2(1.7, 9.2) + t * 1.4), warp(p + 2.2 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p + 2.2 * r);
  // The exhale: smoke gathers around the source painting (its box is -1..1 here) and rises off its top edge.
  vec2 d = (uv - uSource.xy) / uSource.zw;
  // Nothing below the frame: the wall label hangs there and must stay readable. The long fade keeps that edge from reading as a ruled line.
  float halo = exp(-0.7 * max(length(d * vec2(0.9, 0.85)) - 1.1, 0.0)) * smoothstep(-1.0, -0.35, d.y);
  float rise = smoothstep(0.2, 1.0, d.y) * exp(-0.3 * max(d.y - 1.0, 0.0)) * exp(-0.7 * abs(d.x));
  float near = smoothstep(0.55, 0.0, distance(uv, uPointer));
  // uCap scales the noise rather than clipping it, so the thickest smoke keeps its texture and text over it keeps its contrast.
  float a = uCap * smoothstep(0.25, 0.8, f) * min(1.0, 0.15 + 0.7 * uStrength * max(halo, rise) + 0.2 * near);
  gl_FragColor = vec4(vec3(0.925, 0.898, 0.847) * a, a);
}`;

/** Peak smoke alpha: the one strength knob. Higher is thicker; contrast was measured at 0.6. */
const CAP = 0.6;

/** How far the home wall has been walked, in px. WalkMotion writes it; the smoke drifts at half that rate. */
export const walk = { x: 0 };

/** Slow smoke hanging around the painting marked [data-smoke-source] and rising off it, with a faint haze on the
 *  rest of the wall that thickens near the pointer. The source moves as you walk, so the smoke settles on whichever
 *  painting you stop at, thicker where that painting's data-smoke asks for it.
 *  Fixed under the grain and every painting. Off with reduced motion, paused in a hidden tab, absent without WebGL. */
export function SmokeWall() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let stop = () => {};
    let cancelled = false;
    import('three').then(THREE => {
      if (cancelled) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' }); } catch { return; }
      renderer.setPixelRatio(0.5);
      const uniforms = { uTime: { value: 0 }, uDrift: { value: new THREE.Vector2() }, uStrength: { value: 1 }, uCap: { value: CAP }, uRes: { value: new THREE.Vector2() }, uPointer: { value: new THREE.Vector2(0.9, 0.6) }, uSource: { value: new THREE.Vector4(-9, -9, 1, 1) } };
      const box4 = new THREE.Vector4();
      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({ uniforms, fragmentShader: fragment, vertexShader: 'void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }', transparent: true });
      const scene = new THREE.Scene();
      scene.add(new THREE.Mesh(geometry, material));
      const camera = new THREE.Camera();
      // Pointer in the shader's units (height = 1, origin bottom left), eased so the smoke leans rather than jumps.
      const target = uniforms.uPointer.value.clone();
      const resize = () => { renderer.setSize(innerWidth, innerHeight, false); renderer.getDrawingBufferSize(uniforms.uRes.value); };
      const onPointer = (e: PointerEvent) => target.set(e.clientX / innerHeight, 1 - e.clientY / innerHeight);
      let frame = 0;
      const start = performance.now();
      const draw = () => {
        frame = requestAnimationFrame(draw);
        uniforms.uTime.value = (performance.now() - start) / 1000;
        uniforms.uDrift.value.set(walk.x / innerHeight, (scrollY - walk.x) / innerHeight);
        uniforms.uPointer.value.lerp(target, 0.04);
        // Eased toward the current source, so the smoke drifts over to a new painting instead of jumping.
        const source = document.querySelector<HTMLElement>('[data-smoke-source]');
        const art = source?.querySelector('img');
        if (source && art) {
          const box = art.getBoundingClientRect();
          box4.set((box.left + box.width / 2) / innerHeight, 1 - (box.top + box.height / 2) / innerHeight, box.width / 2 / innerHeight, box.height / 2 / innerHeight);
          if (uniforms.uSource.value.x < -8) uniforms.uSource.value.copy(box4); else uniforms.uSource.value.lerp(box4, 0.06);
          uniforms.uStrength.value += ((Number(source.dataset.smoke) || 1) - uniforms.uStrength.value) * 0.03;
          // The smoke belongs to the wall: it thins out as the wall scrolls away, so none hangs over the footer.
          const bottom = source.closest('section')?.getBoundingClientRect().bottom ?? innerHeight;
          uniforms.uCap.value = CAP * Math.min(1, Math.max(0, (bottom - 0.4 * innerHeight) / (0.6 * innerHeight)));
        }
        renderer.render(scene, camera);
      };
      const onVisibility = () => { cancelAnimationFrame(frame); if (!document.hidden) draw(); };
      resize();
      draw();
      canvas.classList.add('is-on');
      addEventListener('resize', resize);
      addEventListener('pointermove', onPointer, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);
      stop = () => {
        cancelAnimationFrame(frame);
        removeEventListener('resize', resize);
        removeEventListener('pointermove', onPointer);
        document.removeEventListener('visibilitychange', onVisibility);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
      };
    });
    return () => { cancelled = true; stop(); };
  }, []);
  return <canvas ref={ref} className="smoke" aria-hidden="true" />;
}
