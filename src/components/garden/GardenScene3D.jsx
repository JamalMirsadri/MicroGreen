import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const STAGE_CONFIG = {
  seed: { scale: 0.55, height: 0.15 },
  sprout: { scale: 0.75, height: 0.55 },
  leaf: { scale: 1, height: 1.1 },
  bloom: { scale: 1.15, height: 1.45 },
  forest_master: { scale: 1.35, height: 2.2 },
};

function leafMaterial(emissive = 0x2d8a3e) {
  return new THREE.MeshPhysicalMaterial({
    color: 0x3cb85a,
    emissive,
    emissiveIntensity: 0.35,
    roughness: 0.45,
    metalness: 0.05,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    side: THREE.DoubleSide,
  });
}

function disposeObject(obj) {
  obj.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
      else child.material.dispose();
    }
  });
}

function addLeaf(group, x, y, z, rotY, rotZ, scale = 1) {
  const geo = new THREE.SphereGeometry(0.22 * scale, 16, 12);
  geo.scale(1.4, 0.35, 0.9);
  const mesh = new THREE.Mesh(geo, leafMaterial(0x1a6b2e));
  mesh.position.set(x, y, z);
  mesh.rotation.set(0.3, rotY, rotZ);
  mesh.castShadow = true;
  mesh.userData.sway = { phase: Math.random() * Math.PI * 2, amp: 0.08 + Math.random() * 0.06 };
  group.add(mesh);
  return mesh;
}

function buildPlant(stage, group) {
  disposeObject(group);
  group.clear();

  const cfg = STAGE_CONFIG[stage] || STAGE_CONFIG.seed;
  group.scale.setScalar(cfg.scale);

  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 1.05, 0.18, 32),
    new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.95, metalness: 0 })
  );
  soil.position.y = 0.09;
  soil.receiveShadow = true;
  group.add(soil);

  const stemMat = new THREE.MeshPhysicalMaterial({
    color: 0x2a6b34,
    roughness: 0.6,
    metalness: 0.1,
    emissive: 0x143d1a,
    emissiveIntensity: 0.2,
  });

  if (stage === 'seed') {
    const seed = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 24, 24),
      new THREE.MeshPhysicalMaterial({
        color: 0x8b6914,
        roughness: 0.4,
        metalness: 0.15,
        clearcoat: 0.8,
      })
    );
    seed.position.y = 0.28;
    seed.castShadow = true;
    group.add(seed);
    group.userData.swayMeshes = [];
    return;
  }

  const stemH = cfg.height;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, stemH, 16), stemMat);
  stem.position.y = 0.18 + stemH / 2;
  stem.castShadow = true;
  group.add(stem);

  const swayMeshes = [];

  if (stage === 'sprout') {
    swayMeshes.push(addLeaf(group, 0.12, 0.55, 0, 0.6, 0.4, 0.7));
    swayMeshes.push(addLeaf(group, -0.1, 0.62, 0.05, -0.5, -0.3, 0.65));
  }

  if (stage === 'leaf' || stage === 'bloom' || stage === 'forest_master') {
    const layers = stage === 'leaf' ? 3 : stage === 'bloom' ? 4 : 5;
    for (let i = 0; i < layers; i++) {
      const y = 0.45 + (stemH * 0.55 * i) / layers;
      const s = 0.85 + i * 0.08;
      swayMeshes.push(addLeaf(group, 0.2 * s, y, 0.05, 0.5 + i * 0.3, 0.35, s));
      swayMeshes.push(addLeaf(group, -0.18 * s, y + 0.08, -0.04, -0.6 - i * 0.25, -0.4, s * 0.95));
      swayMeshes.push(addLeaf(group, 0.02, y + 0.12, 0.22 * s, 0.1, 0.2, s * 0.8));
    }
  }

  if (stage === 'bloom' || stage === 'forest_master') {
    const flowerY = 0.18 + stemH + 0.05;
    const petalMat = new THREE.MeshPhysicalMaterial({
      color: 0xff6eb4,
      emissive: 0xff4080,
      emissiveIntensity: 0.5,
      roughness: 0.35,
      metalness: 0.1,
      clearcoat: 0.9,
    });
    for (let i = 0; i < 8; i++) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), petalMat);
      petal.scale.set(0.5, 1.2, 0.35);
      const a = (i / 8) * Math.PI * 2;
      petal.position.set(Math.cos(a) * 0.2, flowerY, Math.sin(a) * 0.2);
      petal.rotation.y = a;
      petal.castShadow = true;
      group.add(petal);
    }
    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshPhysicalMaterial({
        color: 0xffdd57,
        emissive: 0xffaa00,
        emissiveIntensity: 0.8,
        roughness: 0.3,
      })
    );
    center.position.y = flowerY + 0.05;
    group.add(center);
  }

  if (stage === 'forest_master') {
    const canopy = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55, 2),
      new THREE.MeshPhysicalMaterial({
        color: 0x2ecc71,
        emissive: 0x1a8040,
        emissiveIntensity: 0.4,
        roughness: 0.5,
        metalness: 0.05,
      })
    );
    canopy.position.y = 0.18 + stemH + 0.35;
    canopy.castShadow = true;
    group.add(canopy);

    [-1.1, 1.15].forEach((x) => {
      const mini = new THREE.Group();
      const mStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.5, 10), stemMat);
      mStem.position.y = 0.35;
      mini.add(mStem);
      const mCanopy = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.22, 1),
        leafMaterial(0x226b30)
      );
      mCanopy.position.y = 0.65;
      mini.position.set(x, 0, 0.3);
      mini.scale.setScalar(0.9);
      group.add(mini);
    });
  }

  group.userData.swayMeshes = swayMeshes;
}

function createParticles(scene) {
  const count = 180;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = Math.random() * 4 + 0.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x9eff7a,
    size: 0.045,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const baseY = new Float32Array(count);
  for (let i = 0; i < count; i++) baseY[i] = positions[i * 3 + 1];
  const points = new THREE.Points(geo, mat);
  points.userData.baseY = baseY;
  scene.add(points);
  return points;
}

export default function GardenScene3D({ level = 'seed', className = '' }) {
  const containerRef = useRef(null);
  const levelRef = useRef(level);
  const rebuildRef = useRef(null);
  const swayRef = useRef([]);

  useEffect(() => {
    levelRef.current = level;
    rebuildRef.current?.();
  }, [level]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const getSize = () => ({
      w: container.clientWidth || 400,
      h: container.clientHeight || 420,
    });

    let { w, h } = getSize();
    const maxDpr = 2.5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050f08);
    scene.fog = new THREE.FogExp2(0x050f08, 0.04);

    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 80);
    camera.position.set(0.15, 2.4, 6.2);

    const ambient = new THREE.HemisphereLight(0x8fd4a0, 0x1a3020, 0.55);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff0d0, 2.2);
    sun.position.set(5, 10, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 25;
    sun.shadow.camera.left = -6;
    sun.shadow.camera.right = 6;
    sun.shadow.camera.top = 6;
    sun.shadow.camera.bottom = -6;
    sun.shadow.bias = -0.0002;
    scene.add(sun);

    const fill = new THREE.PointLight(0x5cff8a, 1.4, 18);
    fill.position.set(-4, 3, 2);
    scene.add(fill);

    const backGlow = new THREE.PointLight(0x2a8fff, 0.6, 12);
    backGlow.position.set(0, 2, -4);
    scene.add(backGlow);

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.4, 0.12, 64),
      new THREE.MeshPhysicalMaterial({
        color: 0x0d2412,
        roughness: 0.35,
        metalness: 0.4,
        clearcoat: 1,
        emissive: 0x0a3018,
        emissiveIntensity: 0.15,
      })
    );
    platform.position.y = 0.06;
    platform.receiveShadow = true;
    scene.add(platform);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.05, 0.02, 16, 80),
      new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.35 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.13;
    scene.add(ring);

    const plantGroup = new THREE.Group();
    plantGroup.position.y = 0.12;
    scene.add(plantGroup);

    const particles = createParticles(scene);

    rebuildRef.current = () => {
      buildPlant(levelRef.current, plantGroup);
      swayRef.current = plantGroup.userData.swayMeshes || [];
    };
    rebuildRef.current();

    const target = new THREE.Vector3(0, 1.15, 0);
    const camOrbit = { theta: 0.35, phi: 0.15 };

    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      camOrbit.theta += 0.0018;
      const radius = 6.2;
      camera.position.x = Math.sin(camOrbit.theta) * radius * 0.12 + 0.15;
      camera.position.z = Math.cos(camOrbit.theta) * radius * 0.04 + 6.1;
      camera.position.y = 2.35 + Math.sin(t * 0.4) * 0.06;
      camera.lookAt(target);

      plantGroup.rotation.y = Math.sin(t * 0.35) * 0.06;
      ring.rotation.z = t * 0.15;

      swayRef.current.forEach((mesh) => {
        const { phase, amp } = mesh.userData.sway || { phase: 0, amp: 0.05 };
        mesh.rotation.z += Math.sin(t * 2 + phase) * amp * 0.02;
        mesh.rotation.x = 0.3 + Math.sin(t * 1.5 + phase) * amp;
      });

      particles.rotation.y = t * 0.05;
      const pos = particles.geometry.attributes.position;
      const baseY = particles.userData.baseY;
      for (let i = 0; i < pos.count; i++) {
        pos.array[i * 3 + 1] = baseY[i] + Math.sin(t * 0.9 + i * 0.15) * 0.12;
      }
      pos.needsUpdate = true;

      sun.position.x = 5 + Math.sin(t * 0.2) * 0.8;
      fill.intensity = 1.2 + Math.sin(t * 1.2) * 0.3;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      ({ w, h } = getSize());
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(container);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      disposeObject(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-2xl ${className}`}
      style={{ minHeight: 420, height: 'min(52vh, 520px)' }}
      aria-label="3D garden visualization"
    />
  );
}
