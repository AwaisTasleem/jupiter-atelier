import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scroll } from "./scrollState";
import { vertex, fragment } from "./jupiterShader";

/* ---------- device tier (evaluated once) ---------- */
const isPhone =
  typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;

// Phones: 3 noise octaves instead of 5 (softer, ~40% cheaper per pixel)
const planetFragment = isPhone ? fragment.replace("i<5", "i<3") : fragment;
const SEGMENTS = isPhone ? 48 : 96;

/* ---------- scroll keyframes ---------- */
const KEYS = [
  { x: 0,    y: 0,    cam: [0, 0.4, 9.5],  rot: 1.8 },
  { x: 2.7,  y: 0,    cam: [0, 0.6, 8.0],  rot: 1.2 },
  { x: -2.4, y: 0,    cam: [0, -0.1, 6.0], rot: 0.0 },
  { x: 2.2,  y: 0,    cam: [0, 1.6, 12.5], rot: -0.8 },
  { x: -2.4, y: 0,    cam: [0, 0.3, 8.0],  rot: 2.6 },
  { x: 0,    y: 0,    cam: [0, 0.2, 9.5],  rot: 3.4 },
  { x: 0,    y: -2.4, cam: [0, 0.2, 10],   rot: 4.2 },
];

const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

function sample(p) {
  const f = p * (KEYS.length - 1);
  const i = Math.min(KEYS.length - 2, Math.floor(f));
  const t = smooth(f - i);
  const a = KEYS[i], b = KEYS[i + 1];
  return {
    x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), rot: lerp(a.rot, b.rot, t),
    cam: a.cam.map((v, k) => lerp(v, b.cam[k], t)),
  };
}

const PAL_TARGET = { natural: [1, 0, 0], infrared: [0, 1, 0], ultraviolet: [0, 0, 1] };

/* ---------- ring shader (stylised: real Jovian rings are far fainter) ---------- */
const ringVertex = /* glsl */ `
  varying vec3 vPos;
  void main(){
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const ringFragment = /* glsl */ `
  precision highp float;
  varying vec3 vPos;
  uniform vec3 uPal;
  uniform float uInner;
  uniform float uOuter;
  uniform float uOpacity;

  float hash(float n){ return fract(sin(n) * 43758.5453); }

  void main(){
    float r = length(vPos.xy);
    float t = (r - uInner) / (uOuter - uInner);
    float band = 0.0;
    for (int i = 0; i < 6; i++){
      float fi = float(i);
      float c = hash(fi + 1.0);
      float w = 0.05 + hash(fi + 9.0) * 0.1;
      band += smoothstep(w, 0.0, abs(t - c)) * (0.5 + hash(fi + 3.0) * 0.5);
    }
    float fine = 0.5 + 0.5 * sin(t * 140.0 + sin(t * 31.0) * 2.0);
    float density = clamp(band * 0.8 + fine * 0.18, 0.0, 1.0);
    float edge = smoothstep(0.0, 0.08, t) * smoothstep(1.0, 0.85, t);

    vec3 natural = vec3(0.82, 0.70, 0.55);
    vec3 infra   = vec3(0.95, 0.45, 0.28);
    vec3 ultra   = vec3(0.60, 0.55, 1.00);
    vec3 col = natural * uPal.x + infra * uPal.y + ultra * uPal.z;

    gl_FragColor = vec4(col, density * edge * 0.55 * uOpacity);
  }
`;

function Jupiter({ palette, reduced, ring }) {
  const group = useRef();
  const planet = useRef();
  const ringGroup = useRef();
  const moons = useRef([]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPal: { value: new THREE.Vector3(1, 0, 0) },
    uLightDir: { value: new THREE.Vector3(-0.8, 0.4, 0.7) },
  }), []);

  // ring shares the same palette vector, so swatches recolour both
  const ringUniforms = useMemo(() => ({
    uPal: uniforms.uPal,
    uInner: { value: 2.5 },
    uOuter: { value: 3.3 },
    uOpacity: { value: 1 },
  }), [uniforms]);

  const moonDefs = useMemo(() => [
    { r: 3.9, s: 0.55, size: 0.12, c: "#e8d27a" },
    { r: 4.6, s: 0.40, size: 0.11, c: "#cfd8dc" },
    { r: 5.5, s: 0.28, size: 0.17, c: "#a9a29a" },
    { r: 6.7, s: 0.20, size: 0.15, c: "#6f655c" },
  ], []);

  useFrame((state, dt) => {
    const narrow = state.size.width < 760;
    const k = sample(scroll.p);
    const x = narrow ? 0 : k.x;
    const y = narrow ? 1.1 + k.y * 0.5 : k.y;

    group.current.position.set(x, y, 0);
    planet.current.rotation.y = k.rot; // only the planet spins, not the ring
    state.camera.position.set(k.cam[0], k.cam[1], k.cam[2] + (narrow ? 3.5 : 0));
    state.camera.lookAt(x * 0.15, y * 0.5, 0);

    const target = PAL_TARGET[palette];
    const a = 1 - Math.exp(-dt * 6);
    uniforms.uPal.value.x = lerp(uniforms.uPal.value.x, target[0], a);
    uniforms.uPal.value.y = lerp(uniforms.uPal.value.y, target[1], a);
    uniforms.uPal.value.z = lerp(uniforms.uPal.value.z, target[2], a);

    if (!reduced) uniforms.uTime.value += dt;

    // ring on/off: smooth scale + fade
    const s = lerp(ringGroup.current.scale.x, ring ? 1 : 0.001, 1 - Math.exp(-dt * 8));
    ringGroup.current.scale.setScalar(s);
    ringUniforms.uOpacity.value = s;
    ringGroup.current.visible = s > 0.01;
    if (!reduced) ringGroup.current.rotation.y += dt * 0.02;

    const moonVis = Math.max(0, 1 - Math.abs(scroll.p - 0.5) * 5);
    moons.current.forEach((m, i) => {
      if (!m) return;
      const d = moonDefs[i];
      const ang = reduced ? i * 1.7 : state.clock.elapsedTime * d.s + i * 1.7;
      m.position.set(Math.cos(ang) * d.r, Math.sin(ang * 0.5) * 0.25, Math.sin(ang) * d.r);
      m.scale.setScalar(Math.max(0.0001, moonVis));
    });
  });

  return (
    <group ref={group}>
      <mesh ref={planet}>
        <sphereGeometry args={[2, SEGMENTS, SEGMENTS]} />
        <shaderMaterial vertexShader={vertex} fragmentShader={planetFragment} uniforms={uniforms} />
      </mesh>

      {/* tilt group (fixed) > spin group (slow) > flat ring */}
      <group rotation={[0.32, 0, -0.14]}>
        <group ref={ringGroup}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.5, 3.3, isPhone ? 96 : 192, 1]} />
            <shaderMaterial
              vertexShader={ringVertex}
              fragmentShader={ringFragment}
              uniforms={ringUniforms}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </group>

      {moonDefs.map((d, i) => (
        <mesh key={d.c} ref={(el) => (moons.current[i] = el)}>
          <sphereGeometry args={[d.size, 24, 24]} />
          <meshStandardMaterial color={d.c} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Stars({ count = isPhone ? 500 : 900 }) {
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = (n) => { const s = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453; return s - Math.floor(s); };
      const th = r(1) * Math.PI * 2, ph = Math.acos(2 * r(2) - 1), rad = 30 + r(3) * 40;
      pos.set([rad * Math.sin(ph) * Math.cos(th), rad * Math.cos(ph), rad * Math.sin(ph) * Math.sin(th)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#e9e2d0" size={0.12} sizeAttenuation transparent opacity={0.7} />
    </points>
  );
}

export default function Scene({ palette, reduced, ring }) {
  return (
    <Canvas
      dpr={isPhone ? [1, 1.25] : [1, 1.75]}   // cap rendering resolution
      camera={{ fov: 40, near: 0.1, far: 200, position: [0, 0.4, 9.5] }}
      gl={{ antialias: !isPhone, powerPreference: "high-performance" }}
      aria-hidden="true"
    >
      <color attach="background" args={["#0b0b0d"]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[-6, 3, 5]} intensity={2.2} />
      <Stars />
      <Jupiter palette={palette} reduced={reduced} ring={ring} />
    </Canvas>
  );
}