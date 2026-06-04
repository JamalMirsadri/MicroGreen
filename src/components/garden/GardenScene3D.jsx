import React, { useRef, useMemo, useLayoutEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Sparkles, Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

/* ── XP → visual stage ───────────────────────────────────────── */
export function xpToStage(xp) {
  if (xp >= 1000) return 'golden';
  if (xp >= 750)  return 'healthy';
  if (xp >= 500)  return 'young';
  if (xp >= 250)  return 'sprout';
  if (xp >= 100)  return 'germinating';
  return 'seed';
}

const STAGE_META = {
  seed:        { rimColor: '#4ade80', rimOpacity: 0.18, soilColor: '#2a1508', isGolden: false },
  germinating: { rimColor: '#86efac', rimOpacity: 0.22, soilColor: '#2d1a0e', isGolden: false },
  sprout:      { rimColor: '#4ade80', rimOpacity: 0.3,  soilColor: '#1e3010', isGolden: false },
  young:       { rimColor: '#22c55e', rimOpacity: 0.4,  soilColor: '#1a3a0a', isGolden: false },
  healthy:     { rimColor: '#16a34a', rimOpacity: 0.55, soilColor: '#153205', isGolden: false },
  golden:      { rimColor: '#fbbf24', rimOpacity: 0.85, soilColor: '#3d2a05', isGolden: true  },
};

/* ── Instanced grass blades ──────────────────────────────────── */
function Grass({ count = 90 }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const blades = useMemo(() => {
    const arr = [];
    let i = 0;
    while (arr.length < count) {
      const r = 2.05 + ((i * 11.3) % 100) / 100;
      const theta = (i / count) * Math.PI * 2 + ((i * 7.1) % 1);
      arr.push({
        x: Math.cos(theta) * r,
        z: Math.sin(theta) * r,
        sy: 0.12 + ((i * 3.7) % 10) / 30,
        ry: (i * 2.4) % (Math.PI * 2),
        rx0: ((i * 1.3) % 10 - 5) * 0.03,
        phase: (i * 0.47) % (Math.PI * 2),
      });
      i++;
    }
    return arr;
  }, [count]);

  useLayoutEffect(() => {
    if (!ref.current) return;
    blades.forEach((b, i) => {
      dummy.position.set(b.x, 0.31, b.z);
      dummy.rotation.set(b.rx0, b.ry, 0);
      dummy.scale.set(1, b.sy, 1);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [blades, dummy]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    let changed = false;
    blades.forEach((b, i) => {
      const sway = Math.sin(t * 1.6 + b.phase) * 0.07;
      dummy.position.set(b.x, 0.31, b.z);
      dummy.rotation.set(b.rx0 + sway, b.ry, Math.cos(t * 1.3 + b.phase) * 0.04);
      dummy.scale.set(1, b.sy, 1);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
      changed = true;
    });
    if (changed) ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} castShadow args={[
      new THREE.CylinderGeometry(0.011, 0.022, 1, 4),
      new THREE.MeshStandardMaterial({ color: '#2d6e14', roughness: 0.95 }),
      count,
    ]} />
  );
}

/* ── Floating island terrain ─────────────────────────────────── */
function IslandTerrain({ stage }) {
  const meta = STAGE_META[stage] || STAGE_META.seed;

  return (
    <>
      {/* Main green top */}
      <mesh receiveShadow>
        <cylinderGeometry args={[3.0, 3.4, 0.55, 8]} />
        <meshStandardMaterial color="#255c10" roughness={0.95} metalness={0.02} />
      </mesh>
      {/* Soil circle for plant */}
      <mesh receiveShadow position={[0, 0.29, 0]}>
        <cylinderGeometry args={[1.65, 1.78, 0.07, 32]} />
        <meshStandardMaterial color={meta.soilColor} roughness={1} metalness={0} />
      </mesh>
      {/* Rocky underbody */}
      <mesh position={[0, -0.55, 0]}>
        <coneGeometry args={[2.6, 1.3, 8]} />
        <meshStandardMaterial color="#1a3a08" roughness={1} metalness={0} />
      </mesh>
      {/* Pointed bottom root */}
      <mesh position={[0, -1.25, 0]}>
        <sphereGeometry args={[1.05, 7, 5]} />
        <meshStandardMaterial color="#0f2206" roughness={1} metalness={0} />
      </mesh>
      {/* Glowing rim */}
      <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.85, 3.1, 64]} />
        <meshBasicMaterial
          color={meta.rimColor}
          transparent
          opacity={meta.rimOpacity}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Grass count={90} />
    </>
  );
}

/* ── Stage 1: Seed ───────────────────────────────────────────── */
function SeedPlant() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 2.1) * 0.045;
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <group ref={ref} position={[0, 0.35, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.13, 24, 18]} />
        <meshPhysicalMaterial
          color="#7a5218" roughness={0.4} metalness={0.12}
          clearcoat={0.8} emissive="#3d2a08" emissiveIntensity={0.35}
        />
      </mesh>
      <mesh position={[0, -0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshBasicMaterial color="#3d8a2a" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ── Stage 2: Germinating ────────────────────────────────────── */
function GerminatingPlant() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.28;
  });
  return (
    <group ref={ref} position={[0, 0.37, 0]}>
      {/* Seed body with crack */}
      <mesh castShadow>
        <sphereGeometry args={[0.13, 20, 14]} />
        <meshPhysicalMaterial
          color="#8a6020" roughness={0.5} metalness={0.05}
          clearcoat={0.55} emissive="#2a4010" emissiveIntensity={0.45}
        />
      </mesh>
      {/* Crack */}
      <mesh rotation={[0, 0, Math.PI / 4]} position={[0, 0, 0.09]}>
        <boxGeometry args={[0.018, 0.24, 0.015]} />
        <meshBasicMaterial color="#e8daa0" />
      </mesh>
      {/* Root emerging down */}
      <mesh position={[0, -0.16, 0]} castShadow>
        <cylinderGeometry args={[0.011, 0.006, 0.24, 8]} />
        <meshStandardMaterial color="#ddd0a0" roughness={0.8} />
      </mesh>
      <mesh position={[0.035, -0.29, 0]} castShadow>
        <sphereGeometry args={[0.014, 8, 8]} />
        <meshStandardMaterial color="#d4c080" roughness={0.9} />
      </mesh>
      {/* Soil glow halo */}
      <mesh position={[0, -0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 32]} />
        <meshBasicMaterial color="#6ade40" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ── Stage 3: Sprout ─────────────────────────────────────────── */
function SproutPlant() {
  const leavesRef = useRef();
  useFrame(({ clock }) => {
    if (!leavesRef.current) return;
    const t = clock.elapsedTime;
    leavesRef.current.children.forEach((leaf, i) => {
      leaf.rotation.z = Math.sin(t * 2.1 + i * Math.PI) * 0.13;
    });
  });
  return (
    <group position={[0, 0.35, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.022, 0.032, 0.52, 10]} />
        <meshStandardMaterial
          color="#3aaa2a" roughness={0.6}
          emissive="#1a5010" emissiveIntensity={0.3}
        />
      </mesh>
      <group ref={leavesRef} position={[0, 0.3, 0]}>
        {[
          [-0.15, 0, 0, 0.4, 0, -0.38],
          [ 0.15, 0, 0, 0.4, 0,  0.38],
        ].map(([x, y, z, rx, ry, rz], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[rx, ry, rz]} castShadow>
            <sphereGeometry args={[0.1, 14, 10]} />
            <meshPhysicalMaterial
              color="#5cd62a" emissive="#2a8010" emissiveIntensity={0.35}
              roughness={0.48} clearcoat={0.65} side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ── Stage 4: Young MicroGreen ───────────────────────────────── */
function YoungPlant() {
  const groupRef = useRef();
  const stems = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => {
      const r = ((i * 7.3 + 1) % 10) / 10 * 0.85;
      const theta = (i / 11) * Math.PI * 2 + (i * 0.43) % 0.8;
      return {
        x: Math.cos(theta) * r,
        z: Math.sin(theta) * r,
        h: 0.48 + ((i * 3.7) % 10) / 22,
        phase: (i * 0.58) % (Math.PI * 2),
      };
    });
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((stem, i) => {
      if (stems[i]) {
        stem.rotation.x = Math.sin(t * 1.8 + stems[i].phase) * 0.065;
        stem.rotation.z = Math.cos(t * 1.5 + stems[i].phase) * 0.045;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0.35, 0]}>
      {stems.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]}>
          <mesh castShadow position={[0, s.h / 2, 0]}>
            <cylinderGeometry args={[0.016, 0.026, s.h, 8]} />
            <meshStandardMaterial
              color="#3cc828" roughness={0.58}
              emissive="#1a7010" emissiveIntensity={0.22}
            />
          </mesh>
          {[[-0.1, 0, 0, 0.3, 0, -0.36], [0.1, 0, 0, 0.3, 0, 0.36]].map(([lx, ly, lz, rx, ry, rz], j) => (
            <mesh key={j} position={[lx, s.h - 0.04, lz]} rotation={[rx, ry, rz]} castShadow>
              <sphereGeometry args={[0.074, 12, 8]} />
              <meshPhysicalMaterial
                color="#5ae630" emissive="#2a8a10" emissiveIntensity={0.28}
                roughness={0.48} clearcoat={0.55} side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ── Stage 5: Healthy MicroGreen ─────────────────────────────── */
function HealthyPlant() {
  const groupRef = useRef();
  const stems = useMemo(() => {
    return Array.from({ length: 19 }, (_, i) => {
      const r = ((i * 6.1 + 0.5) % 10) / 10 * 1.15;
      const theta = (i / 19) * Math.PI * 2 + (i * 0.37) % 0.7;
      return {
        x: Math.cos(theta) * r,
        z: Math.sin(theta) * r,
        h: 0.72 + ((i * 4.1) % 10) / 15,
        phase: (i * 0.62) % (Math.PI * 2),
      };
    });
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((stem, i) => {
      if (stems[i]) {
        stem.rotation.x = Math.sin(t * 1.6 + stems[i].phase) * 0.075;
        stem.rotation.z = Math.cos(t * 1.3 + stems[i].phase) * 0.055;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0.35, 0]}>
      {stems.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]}>
          <mesh castShadow position={[0, s.h / 2, 0]}>
            <cylinderGeometry args={[0.016, 0.028, s.h, 8]} />
            <meshStandardMaterial
              color="#28b818" roughness={0.52}
              emissive="#126808" emissiveIntensity={0.32}
            />
          </mesh>
          {[[-0.12, 0, 0, 0.35, 0, -0.4], [0.12, 0, 0, 0.35, 0, 0.4], [0, 0, 0.1, 0.3, 0, 0.1]].map(([lx, ly, lz, rx, ry, rz], j) => (
            <mesh key={j} position={[lx, s.h - 0.05, lz]} rotation={[rx, j * 0.85, rz]} castShadow>
              <sphereGeometry args={[0.09, 12, 8]} />
              <meshPhysicalMaterial
                color="#40d020" emissive="#1a7810" emissiveIntensity={0.38}
                roughness={0.44} clearcoat={0.7} side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ── Stage 6: Premium Golden MicroGreen ──────────────────────── */
function GoldenPlant() {
  const groupRef = useRef();
  const stems = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const r = ((i * 5.7 + 0.8) % 10) / 10 * 1.35;
      const theta = (i / 24) * Math.PI * 2 + (i * 0.33) % 0.6;
      return {
        x: Math.cos(theta) * r,
        z: Math.sin(theta) * r,
        h: 0.88 + ((i * 3.9) % 10) / 12,
        phase: (i * 0.55) % (Math.PI * 2),
      };
    });
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((stem, i) => {
      if (stems[i]) {
        stem.rotation.x = Math.sin(t * 1.4 + stems[i].phase) * 0.08;
        stem.rotation.z = Math.cos(t * 1.1 + stems[i].phase) * 0.065;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0.35, 0]}>
      {stems.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]}>
          <mesh castShadow position={[0, s.h / 2, 0]}>
            <cylinderGeometry args={[0.018, 0.030, s.h, 8]} />
            <meshStandardMaterial
              color="#88cc20" roughness={0.42}
              emissive="#4a8800" emissiveIntensity={0.55}
            />
          </mesh>
          {[[-0.14, 0, 0, 0.36, 0, -0.42], [0.14, 0, 0, 0.36, 0, 0.42], [0, 0, 0.12, 0.3, 0, 0.1]].map(([lx, ly, lz, rx, ry, rz], j) => (
            <mesh key={j} position={[lx, s.h - 0.04, lz]} rotation={[rx, j * 0.95, rz]} castShadow>
              <sphereGeometry args={[0.1, 14, 10]} />
              <meshPhysicalMaterial
                color="#c8e820" emissive="#d4a000" emissiveIntensity={0.9}
                roughness={0.28} metalness={0.12} clearcoat={1.0}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
          {/* Glowing golden tip */}
          <mesh position={[0, s.h + 0.05, 0]}>
            <sphereGeometry args={[0.038, 8, 8]} />
            <meshBasicMaterial color="#ffd700" transparent opacity={0.85} />
          </mesh>
        </group>
      ))}
      {/* Radiant central bloom */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 14]} />
        <meshPhysicalMaterial
          color="#ffe040" emissive="#ffaa00" emissiveIntensity={1.5}
          roughness={0.25} clearcoat={1.0}
        />
      </mesh>
    </group>
  );
}

/* ── Dispatches to stage component ──────────────────────────── */
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

/* ── Drifting fireflies / spores ─────────────────────────────── */
function Fireflies({ count = 25, stage }) {
  const ref = useRef();
  const { geo, basePos, phases } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const ph  = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 1.2 + ((i * 7.3) % 10) / 10 * 3.5;
      const theta = (i / count) * Math.PI * 2;
      pos[i * 3]     = Math.cos(theta + (i * 0.37) % 1) * r;
      pos[i * 3 + 1] = ((i * 3.1) % 10) / 10 * 2.5 + 0.5;
      pos[i * 3 + 2] = Math.sin(theta + (i * 0.37) % 1) * r;
      ph[i] = (i * 0.63) % (Math.PI * 2);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos.slice(), 3));
    return { geo: g, basePos: pos, phases: ph };
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3]     = basePos[i * 3]     + Math.sin(t * 0.5  + phases[i]) * 0.4;
      pos.array[i * 3 + 1] = basePos[i * 3 + 1] + Math.sin(t * 0.7  + phases[i] * 1.3) * 0.28;
      pos.array[i * 3 + 2] = basePos[i * 3 + 2] + Math.cos(t * 0.58 + phases[i] * 0.9) * 0.4;
    }
    pos.needsUpdate = true;
  });

  const color = stage === 'golden' ? '#ffee44' : '#88ff44';

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        color={color} size={0.06} transparent opacity={0.88}
        blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation
      />
    </points>
  );
}

/* ── Drifting cloud wisps ────────────────────────────────────── */
function CloudWisp({ basePos, scale = 1 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.x = basePos[0] + Math.sin(t * 0.14 + basePos[2]) * 0.55;
    ref.current.position.y = basePos[1] + Math.sin(t * 0.19 + basePos[0]) * 0.12;
  });
  return (
    <mesh ref={ref} position={basePos}>
      <sphereGeometry args={[0.55 * scale, 7, 5]} />
      <meshBasicMaterial color="#e0ffe8" transparent opacity={0.04} depthWrite={false} />
    </mesh>
  );
}

/* ── Lighting ────────────────────────────────────────────────── */
function SceneLighting({ stage }) {
  const isGolden = stage === 'golden';
  return (
    <>
      <hemisphereLight args={['#a8e8b0', '#1a3d12', 0.65]} />
      <directionalLight
        castShadow
        position={[6, 10, 5]}
        intensity={isGolden ? 2.8 : 2.1}
        color={isGolden ? '#fff0a0' : '#fff8d8'}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={28}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0002}
      />
      <pointLight position={[-4, 4, 2.5]} intensity={1.3} color="#5cff88" distance={16} />
      <pointLight position={[0, 3, -5]}   intensity={0.55} color="#3a6fff" distance={12} />
      {isGolden && (
        <pointLight position={[0, 2.5, 0]} intensity={2.2} color="#ffcc44" distance={9} />
      )}
    </>
  );
}

/* ── Full scene ──────────────────────────────────────────────── */
function Scene({ xp = 0 }) {
  const stage = xpToStage(xp);
  const isGolden = stage === 'golden';
  const meta = STAGE_META[stage] || STAGE_META.seed;

  return (
    <>
      <SceneLighting stage={stage} />
      <fog attach="fog" args={['#040e06', 18, 38]} />

      {/* Cosmic starfield */}
      <Stars radius={32} depth={20} count={2000} factor={3} saturation={0.35} fade speed={0.45} />

      {/* Atmospheric wisps */}
      {[[-5.5, 2.8, -4.5], [4.2, 3.5, -3], [-3, 4.2, 2.5], [5.2, 2.2, 3.2]].map((pos, i) => (
        <CloudWisp key={i} basePos={pos} scale={0.8 + i * 0.15} />
      ))}

      {/* Floating island + plant grouped together */}
      <Float speed={1.2} floatIntensity={0.38} rotationIntensity={0.08}>
        <group>
          <IslandTerrain stage={stage} />
          <GrowthPlant stage={stage} />
        </group>
      </Float>

      {/* Ambient sparkles / spores */}
      <Sparkles
        count={isGolden ? 90 : 45}
        scale={isGolden ? 7 : 4.5}
        size={isGolden ? 5 : 2.5}
        speed={0.38}
        opacity={isGolden ? 0.95 : 0.65}
        color={isGolden ? '#ffe060' : '#88ff66'}
      />

      {/* Fireflies */}
      <Fireflies count={isGolden ? 45 : 22} stage={stage} />

      {/* User interaction: orbit + zoom */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.55}
        enablePan={false}
        minDistance={4}
        maxDistance={9.5}
        minPolarAngle={0.22}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 0.5, 0]}
        dampingFactor={0.06}
        enableDamping
      />

      {/* Postprocessing effects */}
      <EffectComposer>
        <Bloom
          intensity={isGolden ? 1.9 : 0.75}
          luminanceThreshold={0.14}
          luminanceSmoothing={0.5}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

/* ── Exported component ──────────────────────────────────────── */
export default function GardenScene3D({ xp = 0, className = '' }) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${className}`}
      style={{ minHeight: 440, height: 'min(54vh, 540px)' }}
      aria-label="3D garden visualization"
    >
      <Canvas
        shadows
        camera={{ position: [4.5, 3.2, 5.5], fov: 40 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.45,
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
