"use client";
import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";

// ── Orbiting satellites ────────────────────────────────────────────────
const SATELLITES = [
  { color: "#D5F0E8", emissive: "#8FD4BE", r: 2.05, speed: 0.80,  tilt: 0,             size: 0.08 },
  { color: "#FFE4D6", emissive: "#FFB899", r: 2.45, speed: -0.60, tilt: Math.PI / 4,   size: 0.06 },
  { color: "#E8D5F5", emissive: "#C4A6E0", r: 1.85, speed: 0.55,  tilt: -Math.PI / 6,  size: 0.10 },
  { color: "#D5F0E8", emissive: "#8FD4BE", r: 2.25, speed: -0.75, tilt: Math.PI / 3,   size: 0.07 },
];

function OrbitDot({
  cfg,
  baseAngle,
  spRef,
}: {
  cfg: (typeof SATELLITES)[number];
  baseAngle: number;
  spRef: React.MutableRefObject<number>;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const angle = baseAngle + clock.elapsedTime * cfg.speed;
    ref.current.position.set(
      Math.cos(angle) * cfg.r,
      Math.sin(angle) * Math.sin(cfg.tilt) * cfg.r * 0.5,
      Math.sin(angle) * Math.cos(cfg.tilt) * cfg.r * 0.25
    );
    const sp = spRef.current;
    const fadeIn  = Math.min(sp / 0.07, 1);
    const fadeOut = Math.max(0, 1 - Math.max(0, sp - 0.32) / 0.14);
    (ref.current.material as THREE.MeshStandardMaterial).opacity = fadeIn * fadeOut * 0.9;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[cfg.size, 8, 8]} />
      <meshStandardMaterial
        color={cfg.color}
        emissive={cfg.emissive}
        emissiveIntensity={0.5}
        transparent
        opacity={0}
      />
    </mesh>
  );
}

// ── Crystal ────────────────────────────────────────────────────────────
function Crystal({ spRef }: { spRef: React.MutableRefObject<number> }) {
  const wrapRef  = useRef<THREE.Group>(null);
  const meshRef  = useRef<THREE.Mesh>(null);
  const mouseT   = useRef({ x: 0, y: 0 });
  const mouseL   = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseT.current.x =  (e.clientX / window.innerWidth  - 0.5) * 0.55;
      mouseT.current.y = -(e.clientY / window.innerHeight - 0.5) * 0.55;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(({ clock }, delta) => {
    if (!wrapRef.current || !meshRef.current) return;
    const sp = spRef.current;

    // Auto-rotation
    meshRef.current.rotation.y += delta * 0.28;
    meshRef.current.rotation.z += delta * 0.07;

    // Float
    meshRef.current.position.y = Math.sin(clock.elapsedTime * 1.6) * 0.12;

    // Mouse parallax (smoothed)
    mouseL.current.x += (mouseT.current.x - mouseL.current.x) * 0.04;
    mouseL.current.y += (mouseT.current.y - mouseL.current.y) * 0.04;
    wrapRef.current.rotation.x = mouseL.current.y;
    wrapRef.current.rotation.y = mouseL.current.x;

    // Scroll: shrink and float upward
    wrapRef.current.scale.setScalar(Math.max(0.001, 1 - sp * 0.88));
    wrapRef.current.position.y = -sp * 3.5;
  });

  return (
    <group ref={wrapRef} position={[1.8, 0.1, 0]}>
      {/* Central crystal */}
      <mesh ref={meshRef} castShadow>
        <icosahedronGeometry args={[1.1, 1]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.45}
          roughness={0.04}
          transmissionSampler
          chromaticAberration={0.055}
          anisotropy={0.12}
          distortion={0.04}
          distortionScale={0.25}
          temporalDistortion={0.12}
          iridescence={1}
          iridescenceIOR={1.5}
          iridescenceThicknessRange={[0, 1400]}
          color="#E8D5F5"
        />
      </mesh>

      {/* Orbiting dots */}
      {SATELLITES.map((cfg, i) => (
        <OrbitDot
          key={i}
          cfg={cfg}
          baseAngle={(i / SATELLITES.length) * Math.PI * 2}
          spRef={spRef}
        />
      ))}
    </group>
  );
}

// ── Canvas export ──────────────────────────────────────────────────────
export default function HeroScene({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  const [show, setShow]   = useState(false);
  const spRef             = useRef(0);

  useEffect(() => {
    const mobile       = window.innerWidth < 768;
    const noMotion     = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!mobile && !noMotion) setShow(true);

    // Sync MotionValue → ref (no re-render overhead)
    const unsub = scrollProgress.on("change", (v) => { spRef.current = v; });
    return unsub;
  }, [scrollProgress]);

  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.8} />
        <directionalLight position={[-4, -2, 2]} intensity={1.0} color="#C4A6E0" />
        <pointLight position={[0, 3, 3]} intensity={1.2} color="#8FD4BE" />
        <Environment preset="studio" />
        <Crystal spRef={spRef} />
      </Canvas>
    </div>
  );
}
