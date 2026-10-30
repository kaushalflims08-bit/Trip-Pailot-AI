import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTripStore } from '../../store/useTripStore';

interface Globe3DProps {
  className?: string;
  size?: number;
  highlightIndia?: boolean;
}

export const Globe3D: React.FC<Globe3DProps> = ({
  className = '',
  size = 320,
  highlightIndia = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { reduceAnimations, darkMode } = useTripStore();

  useEffect(() => {
    if (!mountRef.current || reduceAnimations) return;

    const width = mountRef.current.clientWidth || size;
    const height = mountRef.current.clientHeight || size;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xff7a1a, 1.8);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x14b8a6, 2, 10);
    blueLight.position.set(-5, -2, -2);
    scene.add(blueLight);

    // 3. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Base Low-Poly Earth Sphere
    const earthGeo = new THREE.IcosahedronGeometry(1, 3);
    const earthMat = new THREE.MeshStandardMaterial({
      color: darkMode ? 0x0b1f3a : 0x1e3a8a,
      roughness: 0.7,
      metalness: 0.1,
      flatShading: true,
      wireframe: false,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earth);

    // Wireframe overlay for tech aesthetics
    const wireGeo = new THREE.IcosahedronGeometry(1.002, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: darkMode ? 0x14b8a6 : 0x60a5fa,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireframe);

    // Helper: convert lat/long to 3D sphere coordinate
    const latLongToVector3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // 4. Highlight India (approx lat 20.59, lon 78.96)
    if (highlightIndia) {
      const indiaPos = latLongToVector3(20.59, 78.96, 1.02);
      const markerGeo = new THREE.ConeGeometry(0.04, 0.12, 5);
      markerGeo.rotateX(Math.PI / 2);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0xff7a1a });
      const indiaMarker = new THREE.Mesh(markerGeo, markerMat);
      indiaMarker.position.copy(indiaPos);
      indiaMarker.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(indiaMarker);

      // Glowing India Aura disk
      const diskGeo = new THREE.RingGeometry(0.04, 0.09, 16);
      const diskMat = new THREE.MeshBasicMaterial({
        color: 0xff7a1a,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const disk = new THREE.Mesh(diskGeo, diskMat);
      disk.position.copy(indiaPos);
      disk.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(disk);
    }

    // 5. Curved Flight Route Arcs (Chennai to Delhi, Mumbai, Kolkata)
    const routes = [
      { from: [13.08, 80.27], to: [28.61, 77.20] }, // Chennai -> Delhi
      { from: [13.08, 80.27], to: [19.07, 72.87] }, // Chennai -> Mumbai
      { from: [13.08, 80.27], to: [22.57, 88.36] }, // Chennai -> Kolkata
    ];

    routes.forEach((r) => {
      const v1 = latLongToVector3(r.from[0], r.from[1], 1.02);
      const v2 = latLongToVector3(r.to[0], r.to[1], 1.02);
      const mid = v1.clone().add(v2).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(1.22); // arch height

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const points = curve.getPoints(24);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xff7a1a,
        transparent: true,
        opacity: 0.8,
        linewidth: 2,
      });
      const arc = new THREE.Line(lineGeo, lineMat);
      globeGroup.add(arc);
    });

    // 6. Low-poly Plane circling the globe
    const planeGroup = new THREE.Group();
    const bodyGeo = new THREE.ConeGeometry(0.03, 0.1, 4);
    bodyGeo.rotateX(Math.PI / 2);
    const wingGeo = new THREE.BoxGeometry(0.12, 0.005, 0.03);
    const planeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(bodyGeo, planeMat);
    const wing = new THREE.Mesh(wingGeo, planeMat);
    planeGroup.add(body);
    planeGroup.add(wing);
    globeGroup.add(planeGroup);

    // Initial orientation facing India
    globeGroup.rotation.y = 1.2;
    globeGroup.rotation.x = 0.2;

    // 7. Animation loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Soft rotation
      globeGroup.rotation.y += 0.003;

      // Orbit plane
      const orbitAngle = elapsedTime * 0.8;
      const r = 1.25;
      planeGroup.position.set(
        Math.cos(orbitAngle) * r,
        Math.sin(orbitAngle * 0.6) * 0.4,
        Math.sin(orbitAngle) * r
      );
      planeGroup.lookAt(
        Math.cos(orbitAngle + 0.1) * r,
        Math.sin((orbitAngle + 0.1) * 0.6) * 0.4,
        Math.sin(orbitAngle + 0.1) * r
      );

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [reduceAnimations, darkMode, highlightIndia, size]);

  if (reduceAnimations) {
    return (
      <div className={`flex items-center justify-center p-6 ${className}`}>
        <div className="w-32 h-32 rounded-full border-4 border-[#FF7A1A]/40 bg-gradient-to-tr from-[#0B1F3A] to-[#14B8A6] flex items-center justify-center shadow-xl">
          <span className="text-white text-xs font-bold uppercase tracking-widest">TripPilot</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative flex items-center justify-center overflow-hidden pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
};
