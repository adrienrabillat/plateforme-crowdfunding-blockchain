"use client";
import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

// ── Step 0 — Account: floating sphere + orbital halo ──────────────────
function ShapeAccount() {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z = clock.elapsedTime * 0.4;
    ringRef.current.rotation.x = Math.PI / 2 + Math.sin(clock.elapsedTime * 0.6) * 0.15;
  });
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.72, 32, 32]} />
        <meshStandardMaterial
          color="#E8D5F5"
          roughness={0.15}
          metalness={0.35}
          envMapIntensity={1.5}
        />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.15, 0.055, 16, 80]} />
        <meshStandardMaterial
          color="#C4A6E0"
          roughness={0.08}
          metalness={0.6}
          emissive="#C4A6E0"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Small decorative dots on the halo */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 1.15, Math.sin(angle) * 1.15, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#C4A6E0" emissive="#C4A6E0" emissiveIntensity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

// ── Step 1 — Asset: minimalist building cluster ───────────────────────
function ShapeAsset() {
  return (
    <group position={[0, -0.15, 0]}>
      {/* Main tower */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.7, 1.5, 0.7]} />
        <meshStandardMaterial color="#FFE4D6" roughness={0.25} metalness={0.25} envMapIntensity={1.2} />
      </mesh>
      {/* Left wing */}
      <mesh position={[-0.65, -0.05, 0]}>
        <boxGeometry args={[0.45, 0.95, 0.45]} />
        <meshStandardMaterial color="#FFB899" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Right wing */}
      <mesh position={[0.65, -0.15, 0]}>
        <boxGeometry args={[0.38, 0.75, 0.38]} />
        <meshStandardMaterial color="#FFE4D6" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Base plate */}
      <mesh position={[0, -0.7, 0]}>
        <boxGeometry args={[1.8, 0.08, 0.8]} />
        <meshStandardMaterial color="#FFB899" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Rooftop accent */}
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.08, 0.18, 0.3, 8]} />
        <meshStandardMaterial color="#FFB899" emissive="#FFB899" emissiveIntensity={0.3} roughness={0.1} metalness={0.5} />
      </mesh>
    </group>
  );
}

// ── Step 2 — Token: spinning coin ────────────────────────────────────
function ShapeToken() {
  const coinRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!coinRef.current) return;
    coinRef.current.rotation.y = clock.elapsedTime * 0.9;
    coinRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.2;
  });
  return (
    <group ref={coinRef}>
      {/* Coin body */}
      <mesh>
        <cylinderGeometry args={[1.0, 1.0, 0.18, 64]} />
        <meshStandardMaterial
          color="#D5F0E8"
          roughness={0.08}
          metalness={0.75}
          envMapIntensity={2}
          emissive="#8FD4BE"
          emissiveIntensity={0.1}
        />
      </mesh>
      {/* Rim edge */}
      <mesh>
        <torusGeometry args={[1.0, 0.09, 16, 64]} />
        <meshStandardMaterial color="#8FD4BE" roughness={0.05} metalness={0.9} emissive="#8FD4BE" emissiveIntensity={0.2} />
      </mesh>
      {/* Inner circle engraving */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.02, 32]} />
        <meshStandardMaterial color="#8FD4BE" roughness={0.1} metalness={0.8} emissive="#8FD4BE" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

// ── Animated scene with step transitions ──────────────────────────────
const SHAPES = [ShapeAccount, ShapeAsset, ShapeToken];

function StepScene({ activeStep }: { activeStep: number }) {
  const refs  = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const scls  = useRef([1.0, 0.0, 0.0]); // start with step 0 visible
  const groupRef = useRef<THREE.Group>(null);
  const mouseT   = useRef({ x: 0, y: 0 });
  const mouseL   = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseT.current.x =  (e.clientX / window.innerWidth  - 0.5) * 0.4;
      mouseT.current.y = -(e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((_, delta) => {
    // Mouse parallax on the whole group
    if (groupRef.current) {
      mouseL.current.x += (mouseT.current.x - mouseL.current.x) * 0.04;
      mouseL.current.y += (mouseT.current.y - mouseL.current.y) * 0.04;
      groupRef.current.rotation.x = mouseL.current.y;
      groupRef.current.rotation.y = mouseL.current.x;
    }

    refs.forEach((ref, i) => {
      if (!ref.current) return;
      const target = i === activeStep ? 1 : 0;
      scls.current[i] = THREE.MathUtils.lerp(scls.current[i], target, delta * 4.5);
      const s = scls.current[i];
      ref.current.scale.setScalar(s < 0.001 ? 0.001 : s);
      // Fade visibility
      ref.current.visible = s > 0.01;
    });
  });

  return (
    <group ref={groupRef}>
      {SHAPES.map((Shape, i) => (
        <group key={i} ref={refs[i]} scale={i === 0 ? 1 : 0.001}>
          <Shape />
        </group>
      ))}
    </group>
  );
}

// ── Canvas export ──────────────────────────────────────────────────────
export default function ProcessScene({ activeStep }: { activeStep: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const mobile   = window.innerWidth < 768;
    const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!mobile && !noMotion) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 4]} intensity={2.2} />
        <directionalLight position={[-3, -2, 1]} intensity={0.9} color="#C4A6E0" />
        <pointLight position={[0, 2, 2]} intensity={1.2} color="#8FD4BE" />
        <Environment preset="studio" />
        <StepScene activeStep={activeStep} />
      </Canvas>
    </div>
  );
}
