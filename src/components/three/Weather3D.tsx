import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTripStore } from '../../store/useTripStore';

interface Weather3DProps {
  type: 'rain' | 'sun';
  className?: string;
}

export const Weather3D: React.FC<Weather3DProps> = ({ type = 'rain', className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { reduceAnimations } = useTripStore();

  useEffect(() => {
    if (!mountRef.current || reduceAnimations) return;

    const width = 160;
    const height = 130;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    let animGroup = new THREE.Group();
    scene.add(animGroup);

    let raindrops: THREE.Mesh[] = [];

    if (type === 'rain') {
      // Low-poly cloud made of merged spheres
      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.8,
        flatShading: true,
      });

      const sphere1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.65, 1), cloudMat);
      sphere1.position.set(0, 0.6, 0);
      animGroup.add(sphere1);

      const sphere2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.48, 1), cloudMat);
      sphere2.position.set(-0.55, 0.45, 0.1);
      animGroup.add(sphere2);

      const sphere3 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.52, 1), cloudMat);
      sphere3.position.set(0.55, 0.48, -0.1);
      animGroup.add(sphere3);

      // Falling raindrops
      const dropGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 3);
      const dropMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

      for (let i = 0; i < 18; i++) {
        const drop = new THREE.Mesh(dropGeo, dropMat);
        drop.position.set((Math.random() - 0.5) * 1.6, Math.random() * 0.8 - 0.2, (Math.random() - 0.5) * 0.5);
        drop.rotation.z = 0.1;
        animGroup.add(drop);
        raindrops.push(drop);
      }
    } else {
      // Golden Sun with rotating rays
      const sunGeo = new THREE.IcosahedronGeometry(0.7, 2);
      const sunMat = new THREE.MeshStandardMaterial({
        color: 0xffa500,
        emissive: 0xff7a1a,
        emissiveIntensity: 0.6,
        flatShading: true,
      });
      const sun = new THREE.Mesh(sunGeo, sunMat);
      animGroup.add(sun);

      // Sun rays
      const rayGeo = new THREE.ConeGeometry(0.08, 0.45, 4);
      const rayMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const ray = new THREE.Mesh(rayGeo, rayMat);
        ray.position.set(Math.cos(angle) * 1.05, Math.sin(angle) * 1.05, 0);
        ray.rotation.z = angle - Math.PI / 2;
        animGroup.add(ray);
      }
    }

    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (type === 'rain') {
        raindrops.forEach((drop) => {
          drop.position.y -= 0.04;
          if (drop.position.y < -1.4) {
            drop.position.y = 0.3;
          }
        });
      } else {
        animGroup.rotation.z += 0.008;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [type, reduceAnimations]);

  return <div ref={mountRef} className={`w-[160px] h-[130px] flex items-center justify-center pointer-events-none ${className}`} />;
};
