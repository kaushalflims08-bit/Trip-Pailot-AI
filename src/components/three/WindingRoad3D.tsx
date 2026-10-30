import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTripStore } from '../../store/useTripStore';

interface WindingRoad3DProps {
  riskLevel: 'low' | 'medium' | 'high';
  className?: string;
}

export const WindingRoad3D: React.FC<WindingRoad3DProps> = ({
  riskLevel = 'low',
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { reduceAnimations } = useTripStore();

  useEffect(() => {
    if (!mountRef.current || reduceAnimations) return;

    const width = mountRef.current.clientWidth || 300;
    const height = 180;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(4, 8, 4);
    scene.add(dirLight);

    // Color by risk
    let roadGlowColor = 0x14b8a6; // green
    if (riskLevel === 'medium') roadGlowColor = 0xf59e0b; // amber
    if (riskLevel === 'high') roadGlowColor = 0xef4444; // red

    // 1. Winding Road Path
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3, 0, 3),
      new THREE.Vector3(-1.5, 0.3, 1),
      new THREE.Vector3(1.5, 0.6, 0),
      new THREE.Vector3(-0.5, 0.9, -1.8),
      new THREE.Vector3(2.5, 1.2, -3.5),
    ]);

    const roadGeo = new THREE.TubeGeometry(curve, 40, 0.35, 4, false);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      flatShading: true,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    scene.add(road);

    // Glowing guard rails
    const railMat = new THREE.MeshBasicMaterial({ color: roadGlowColor });
    const railGeo = new THREE.TubeGeometry(curve, 40, 0.05, 4, false);
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.y = 0.2;
    scene.add(rail);

    // 2. Low-Poly Mountain Terrains
    for (let i = 0; i < 5; i++) {
      const coneGeo = new THREE.ConeGeometry(0.8 + Math.random() * 0.4, 2 + Math.random(), 5);
      const coneMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        flatShading: true,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set((i - 2) * 2 + (Math.random() - 0.5), 0, -2 - Math.random() * 2);
      scene.add(cone);
    }

    // 3. Low-Poly Car
    const carGroup = new THREE.Group();
    const carBodyGeo = new THREE.BoxGeometry(0.4, 0.15, 0.6);
    const carMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, flatShading: true });
    const carBody = new THREE.Mesh(carBodyGeo, carMat);
    carGroup.add(carBody);

    const cabinGeo = new THREE.BoxGeometry(0.3, 0.14, 0.32);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 0.12, -0.05);
    carGroup.add(cabin);

    scene.add(carGroup);

    let progress = 0;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      progress += 0.003;
      if (progress > 1) progress = 0;

      const pos = curve.getPointAt(progress);
      carGroup.position.copy(pos);
      carGroup.position.y += 0.25;

      const lookAhead = curve.getPointAt(Math.min(progress + 0.02, 1));
      lookAhead.y += 0.25;
      carGroup.lookAt(lookAhead);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      roadGeo.dispose();
      roadMat.dispose();
      railGeo.dispose();
      railMat.dispose();
      carBodyGeo.dispose();
      cabinGeo.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [riskLevel, reduceAnimations]);

  if (reduceAnimations) {
    return (
      <div className="h-28 rounded-xl bg-slate-900/40 border border-slate-700 flex items-center justify-center text-xs text-slate-400">
        3D Simulation Paused (Reduce Animations active)
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`w-full h-[180px] rounded-xl overflow-hidden relative ${className}`}
    />
  );
};
