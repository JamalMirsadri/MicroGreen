import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

/* ── XP → visual stage (unchanged game logic) ────────────────── */
export function xpToStage(xp) {
  if (xp >= 1000) return 'golden';
  if (xp >= 750)  return 'healthy';
  if (xp >= 500)  return 'young';
  if (xp >= 250)  return 'sprout';
  if (xp >= 100)  return 'germinating';
  return 'seed';
}

/* ─────────────────────────────────────────────────────────────── *
 *  ENVIRONMENT
 * ─────────────────────────────────────────────────────────────── */

/**
 * Displaced cylinder geometry that looks like a moist soil patch.
 * Top-face vertices are perturbed with layered sine noise so the
 * surface is naturally uneven.  Edge profile is also slightly
 * jagged to break the perfect circle.
 */
function SoilPatch() {
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(2.1, 2.35, 0.32, 52, 12);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const r = Math.sqrt(x * x + z * z);
      const angle = Math.atan2(z, x);

      if (y > 0.06) {
        // Multi-octave noise on the top surface
        const n =
          Math.sin(x * 4.5 + z * 3.1)   * 0.02  +
          Math.cos(x * 8.2 - z * 6.8)   * 0.012 +
          Math.sin(x * 14  + z * 11)     * 0.005 +
          Math.cos(x * 22  - z * 19)     * 0.002;
        pos.setY(i, y + n);
      }

      // Roughen the outer edge so it doesn't look perfectly round
      if (r > 1.85 && y > -0.1) {
        const edgeNoise = Math.sin(angle * 9 + 0.7) * 0.06 + Math.cos(angle * 14) * 0.03;
        pos.setX(i, x + Math.cos(angle) * edgeNoise * 0.4);
        pos.setZ(i, z + Math.sin(angle) * edgeNoise * 0.4);
      }
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} receiveShadow position={[0, 0, 0]}>
      <meshStandardMaterial
        color="#221208"
        roughness={0.97}
        metalness={0.0}
      />
    </mesh>
  );
}

/** Flat ground plane surrounding the soil patch */
function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.025, 0]} receiveShadow>
      <planeGeometry args={[24, 24]} />
      <meshStandardMaterial color="#170e07" roughness={1.0} metalness={0} />
    </mesh>
  );
}

/** Pre-computed stone positions & orientations – stable across renders */
const STONE_DATA = [
  { p: [ 0.65,  0.14,  0.82], s: [0.056, 0.043, 0.061], r: [0.28, 1.24, 0.12] },
  { p: [-0.80,  0.14,  0.60], s: [0.071, 0.041, 0.066], r: [0.10, 2.52, 0.42] },
  { p: [ 1.10,  0.12, -0.20], s: [0.064, 0.039, 0.056], r: [0.64, 0.78, 0.22] },
  { p: [-1.00,  0.13, -0.48], s: [0.051, 0.044, 0.059], r: [0.21, 3.84, 0.51] },
  { p: [ 0.42,  0.13, -1.05], s: [0.082, 0.044, 0.071], r: [0.38, 1.72, 0.14] },
  { p: [-0.30,  0.13,  0.98], s: [0.046, 0.036, 0.051], r: [0.71, 0.34, 0.31] },
  { p: [ 1.28,  0.12,  0.72], s: [0.055, 0.040, 0.059], r: [0.14, 2.14, 0.58] },
  { p: [-1.42,  0.12,  0.12], s: [0.060, 0.039, 0.064], r: [0.52, 4.01, 0.19] },
  { p: [ 0.92,  0.12, -0.88], s: [0.049, 0.041, 0.052], r: [0.33, 1.55, 0.44] },
  { p: [-0.62,  0.13, -1.18], s: [0.069, 0.043, 0.067], r: [0.22, 3.21, 0.11] },
  { p: [ 1.55,  0.11, -0.55], s: [0.042, 0.033, 0.046], r: [0.45, 2.88, 0.35] },
  { p: [-1.20,  0.12,  0.95], s: [0.058, 0.038, 0.062], r: [0.19, 1.40, 0.67] },
];

function Stones() {
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4a3e34',
    roughness: 0.92,
    metalness: 0.04,
  }), []);

  return (
    <>
      {STONE_DATA.map((stone, i) => (
        <mesh
          key={i}
          geometry={geo}
          material={mat}
          position={stone.p}
          rotation={stone.r}
          scale={stone.s}
          castShadow
          receiveShadow
        />
      ))}
    </>
  );
}

/**
 * Floating dust & pollen motes drifting upward in the morning light.
 * Each particle slowly oscillates horizontally while rising.
 */
function DustParticles({ count = 140 }) {
  const ref = useRef();

  const { geo, basePos, phases } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const ph  = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r     = Math.sqrt((i * 7.3 % 10) / 10) * 2.8;
      const theta = (i / count) * Math.PI * 2 + ((i * 1.7) % 1.0);
      pos[i * 3]     = Math.cos(theta) * r;
      pos[i * 3 + 1] = ((i * 3.1) % 10) / 10 * 3.2 + 0.1;
      pos[i * 3 + 2] = Math.sin(theta) * r;
      ph[i] = (i * 0.63) % (Math.PI * 2);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos.slice(), 3));
    return { geo: g, basePos: pos, phases: ph };
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t   = clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      // Slow upward drift that loops every ~20 s
      const drift = (t * 0.04 + phases[i] * 0.6) % 1.0;
      pos.array[i * 3]     = basePos[i * 3]     + Math.sin(t * 0.22 + phases[i]) * 0.14;
      pos.array[i * 3 + 1] = basePos[i * 3 + 1] + drift * 1.2 - 0.6;
      pos.array[i * 3 + 2] = basePos[i * 3 + 2] + Math.cos(t * 0.18 + phases[i]) * 0.12;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        color="#f0ead8"
        size={0.016}
        transparent
        opacity={0.32}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ─────────────────────────────────────────────────────────────── *
 *  PLANT GROWTH STAGES
 *  Each stage is a self-contained component.
 *  All are positioned relative to the soil surface (y ≈ 0.16).
 * ─────────────────────────────────────────────────────────────── */

/* Stage 1 ── Dormant seed on dark soil */
function SeedPlant() {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    // Nearly imperceptible slow rotation – catches the light differently
    meshRef.current.rotation.y = clock.elapsedTime * 0.07;
  });

  return (
    <group position={[0, 0.175, 0]}>
      {/* Main seed body: ovoid organic shape */}
      <mesh ref={meshRef} castShadow scale={[0.88, 1.0, 0.74]}>
        <sphereGeometry args={[0.075, 32, 24]} />
        <meshPhysicalMaterial
          color="#7b5a2e"
          roughness={0.72}
          metalness={0.0}
          clearcoat={0.22}
          clearcoatRoughness={0.85}
          emissive="#3a1f08"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Seed suture / ridge – fine line running lengthwise */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0.25]} position={[0.01, 0.005, 0.068]}>
        <cylinderGeometry args={[0.0035, 0.0035, 0.135, 6]} />
        <meshStandardMaterial color="#50320e" roughness={0.95} />
      </mesh>

      {/* Dark soil disturbance ring – seed nestled in the earth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.052, 0]}>
        <ringGeometry args={[0.075, 0.16, 28]} />
        <meshStandardMaterial
          color="#160a02"
          roughness={1}
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* Stage 2 ── Germinating seed: crack, emerging radicle */
function GerminatingPlant() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.12;
  });

  return (
    <group ref={ref} position={[0, 0.18, 0]}>
      <mesh castShadow scale={[0.88, 0.95, 0.74]}>
        <sphereGeometry args={[0.075, 28, 20]} />
        <meshPhysicalMaterial
          color="#7b5a2e" roughness={0.72} clearcoat={0.18}
          emissive="#2a1408" emissiveIntensity={0.06}
        />
      </mesh>
      {/* Crack */}
      <mesh rotation={[0, 0, 0.38]} position={[0, 0.01, 0.07]}>
        <boxGeometry args={[0.009, 0.14, 0.009]} />
        <meshStandardMaterial color="#38200a" roughness={1} />
      </mesh>
      {/* Radicle / primary root tip */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.009, 0.004, 0.16, 8]} />
        <meshStandardMaterial color="#ded5b0" roughness={0.88} />
      </mesh>
      <mesh position={[0.022, -0.19, 0]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#cdc498" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <ringGeometry args={[0.07, 0.15, 24]} />
        <meshStandardMaterial color="#160a02" roughness={1} transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* Stage 3 ── First sprout breaking soil */
function SproutPlant() {
  const leavesRef = useRef();
  useFrame(({ clock }) => {
    if (!leavesRef.current) return;
    const t = clock.elapsedTime;
    leavesRef.current.children.forEach((leaf, i) => {
      leaf.rotation.z = Math.sin(t * 1.7 + i * Math.PI) * 0.07;
    });
  });
  return (
    <group position={[0, 0.18, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.018, 0.028, 0.50, 10]} />
        <meshStandardMaterial color="#3a8a25" roughness={0.62} emissive="#1a4510" emissiveIntensity={0.14} />
      </mesh>
      <group ref={leavesRef} position={[0, 0.28, 0]}>
        {[
          [-0.14, 0, 0, 0.30, 0, -0.34],
          [ 0.14, 0, 0, 0.30, 0,  0.34],
        ].map(([x, y, z, rx, ry, rz], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[rx, ry, rz]} castShadow>
            <sphereGeometry args={[0.092, 14, 10]} />
            <meshPhysicalMaterial color="#5cd62a" emissive="#2a7010" emissiveIntensity={0.18}
              roughness={0.52} clearcoat={0.5} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* Stage 4 ── Young MicroGreen cluster */
function YoungPlant() {
  const groupRef = useRef();
  const stems = useMemo(() => Array.from({ length: 11 }, (_, i) => {
    const r = ((i * 7.3 + 1) % 10) / 10 * 0.78;
    const theta = (i / 11) * Math.PI * 2 + (i * 0.43) % 0.8;
    return { x: Math.cos(theta) * r, z: Math.sin(theta) * r, h: 0.48 + ((i * 3.7) % 10) / 22, phase: (i * 0.58) % (Math.PI * 2) };
  }), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((stem, i) => {
      if (stems[i]) {
        stem.rotation.x = Math.sin(t * 1.5 + stems[i].phase) * 0.05;
        stem.rotation.z = Math.cos(t * 1.3 + stems[i].phase) * 0.04;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0.18, 0]}>
      {stems.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]}>
          <mesh castShadow position={[0, s.h / 2, 0]}>
            <cylinderGeometry args={[0.014, 0.022, s.h, 8]} />
            <meshStandardMaterial color="#3cc828" roughness={0.58} emissive="#1a7010" emissiveIntensity={0.18} />
          </mesh>
          {[[-0.09, 0, 0, 0.3, 0, -0.34], [0.09, 0, 0, 0.3, 0, 0.34]].map(([lx, ly, lz, rx, ry, rz], j) => (
            <mesh key={j} position={[lx, s.h - 0.04, lz]} rotation={[rx, ry, rz]} castShadow>
              <sphereGeometry args={[0.07, 12, 8]} />
              <meshPhysicalMaterial color="#5ae630" emissive="#2a8a10" emissiveIntensity={0.22} roughness={0.48} clearcoat={0.5} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* Stage 5 ── Healthy / Mature MicroGreen */
function HealthyPlant() {
  const groupRef = useRef();
  const stems = useMemo(() => Array.from({ length: 19 }, (_, i) => {
    const r = ((i * 6.1 + 0.5) % 10) / 10 * 1.12;
    const theta = (i / 19) * Math.PI * 2 + (i * 0.37) % 0.7;
    return { x: Math.cos(theta) * r, z: Math.sin(theta) * r, h: 0.72 + ((i * 4.1) % 10) / 15, phase: (i * 0.62) % (Math.PI * 2) };
  }), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((stem, i) => {
      if (stems[i]) {
        stem.rotation.x = Math.sin(t * 1.4 + stems[i].phase) * 0.06;
        stem.rotation.z = Math.cos(t * 1.2 + stems[i].phase) * 0.045;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0.18, 0]}>
      {stems.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]}>
          <mesh castShadow position={[0, s.h / 2, 0]}>
            <cylinderGeometry args={[0.015, 0.026, s.h, 8]} />
            <meshStandardMaterial color="#28b818" roughness={0.52} emissive="#126808" emissiveIntensity={0.28} />
          </mesh>
          {[[-0.11, 0, 0, 0.32, 0, -0.38], [0.11, 0, 0, 0.32, 0, 0.38], [0, 0, 0.09, 0.28, 0, 0.1]].map(([lx, ly, lz, rx, ry, rz], j) => (
            <mesh key={j} position={[lx, s.h - 0.05, lz]} rotation={[rx, j * 0.8, rz]} castShadow>
              <sphereGeometry args={[0.088, 12, 8]} />
              <meshPhysicalMaterial color="#40d020" emissive="#1a7810" emissiveIntensity={0.3} roughness={0.44} clearcoat={0.65} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* Stage 6 ── Premium Golden MicroGreen */
function GoldenPlant() {
  const groupRef = useRef();
  const stems = useMemo(() => Array.from({ length: 24 }, (_, i) => {
    const r = ((i * 5.7 + 0.8) % 10) / 10 * 1.35;
    const theta = (i / 24) * Math.PI * 2 + (i * 0.33) % 0.6;
    return { x: Math.cos(theta) * r, z: Math.sin(theta) * r, h: 0.88 + ((i * 3.9) % 10) / 12, phase: (i * 0.55) % (Math.PI * 2) };
  }), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((stem, i) => {
      if (stems[i]) {
        stem.rotation.x = Math.sin(t * 1.2 + stems[i].phase) * 0.07;
        stem.rotation.z = Math.cos(t * 1.0 + stems[i].phase) * 0.055;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0.18, 0]}>
      {stems.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]}>
          <mesh castShadow position={[0, s.h / 2, 0]}>
            <cylinderGeometry args={[0.016, 0.028, s.h, 8]} />
            <meshStandardMaterial color="#88cc20" roughness={0.42} emissive="#4a8800" emissiveIntensity={0.5} />
          </mesh>
          {[[-0.13, 0, 0, 0.34, 0, -0.4], [0.13, 0, 0, 0.34, 0, 0.4], [0, 0, 0.11, 0.3, 0, 0.1]].map(([lx, ly, lz, rx, ry, rz], j) => (
            <mesh key={j} position={[lx, s.h - 0.04, lz]} rotation={[rx, j * 0.9, rz]} castShadow>
              <sphereGeometry args={[0.096, 14, 10]} />
              <meshPhysicalMaterial color="#c8e820" emissive="#d4a000" emissiveIntensity={0.9} roughness={0.28} metalness={0.1} clearcoat={1.0} side={THREE.DoubleSide} />
            </mesh>
          ))}
          <mesh position={[0, s.h + 0.04, 0]}>
            <sphereGeometry args={[0.034, 8, 8]} />
            <meshBasicMaterial color="#ffd700" transparent opacity={0.82} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.65, 0]} castShadow>
        <sphereGeometry args={[0.19, 16, 14]} />
        <meshPhysicalMaterial color="#ffe040" emissive="#ffaa00" emissiveIntensity={1.4} roughness={0.25} clearcoat={1.0} />
      </mesh>
    </group>
  );
}

/* ── Stage dispatcher ────────────────────────────────────────── */
function GrowthPlant({ stage }) {
  switch (stage) {
    case 'germinating': return <GerminatingPlant />;
    case 'sprout':      return <SproutPlant />;
    case 'young':       return <YoungPlant />;
    case 'healthy':     return <HealthyPlant />;
    case 'golden':      return <GoldenPlant />;
    default:            return <SeedPlant />;
  }
}

/* ─────────────────────────────────────────────────────────────── *
 *  LIGHTING  – warm morning sun
 * ─────────────────────────────────────────────────────────────── */
function MorningLighting({ stage }) {
  const isGolden = stage === 'golden';
  return (
    <>
      {/* Sky / ground hemisphere – cool morning sky vs dark earth */}
      <hemisphereLight args={['#c8dff5', '#2e1608', 0.48]} />

      {/* Primary morning sun: warm, angled from upper-right */}
      <directionalLight
        castShadow
        position={[7, 9, 4]}
        intensity={isGolden ? 2.8 : 1.9}
        color={isGolden ? '#fff0a0' : '#fff8d0'}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={22}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0003}
        shadow-normalBias={0.022}
      />

      {/* Cool rim fill from opposite side – separates shapes */}
      <directionalLight
        position={[-4.5, 3.5, -3.5]}
        intensity={0.38}
        color="#c0d8f0"
      />

      {/* Subtle warm ground bounce */}
      <pointLight position={[0, -0.5, 0]} intensity={0.18} color="#8a4515" distance={6} />

      {/* Extra golden glow at max stage */}
      {isGolden && (
        <pointLight position={[0, 2.2, 0]} intensity={1.6} color="#ffcc44" distance={7} />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────── *
 *  SCENE
 * ─────────────────────────────────────────────────────────────── */
function Scene({ xp = 0 }) {
  const stage     = xpToStage(xp);
  const isGolden  = stage === 'golden';

  return (
    <>
      {/* Deep forest-floor background */}
      <color attach="background" args={['#090c07']} />

      {/* Very light ground-hugging mist */}
      <fog attach="fog" args={['#0d1009', 10, 26]} />

      <MorningLighting stage={stage} />

      {/* Terrain */}
      <GroundPlane />
      <SoilPatch />
      <Stones />

      {/* Plant for this XP level */}
      <GrowthPlant stage={stage} />

      {/* Floating dust & pollen motes */}
      <DustParticles count={140} />

      {/* Camera: slow cinematic orbit, user can still drag/zoom */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.28}
        enablePan={false}
        minDistance={2.2}
        maxDistance={7.5}
        minPolarAngle={0.28}
        maxPolarAngle={Math.PI / 2.08}
        target={[0, 0.22, 0]}
        dampingFactor={0.055}
        enableDamping
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={isGolden ? 1.1 : 0.25}
          luminanceThreshold={isGolden ? 0.45 : 0.75}
          luminanceSmoothing={0.82}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────── *
 *  EXPORTED COMPONENT
 * ─────────────────────────────────────────────────────────────── */
export default function GardenScene3D({ xp = 0, className = '' }) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${className}`}
      style={{ minHeight: 440, height: 'min(54vh, 540px)' }}
      aria-label="3D garden visualization"
    >
      <Canvas
        shadows
        camera={{ position: [3.2, 2.85, 4.4], fov: 36 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene xp={xp} />
        </Suspense>
      </Canvas>
    </div>
  );
}
