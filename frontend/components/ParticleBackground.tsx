'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { useState, useRef, Suspense, useMemo, useEffect } from 'react';
import * as THREE from 'three';

/**
 * Error boundary fallback for WebGL failures
 */
function FallbackFallback() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
  );
}

/**
 * Power manager - detects reduced motion preference and low battery
 */
function usePerformanceSettings() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);

    // Check battery API (if available)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setIsLowPower(battery.level < 0.2 && !battery.charging);
        battery.addEventListener('levelchange', () => {
          setIsLowPower(battery.level < 0.2 && !battery.charging);
        });
      });
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { isReducedMotion, isLowPower };
}

/**
 * Particle Swarm component with performance safeguards
 */
function ParticleSwarm({
  particleCount = 6000,
  color = '#2563eb',
  rotationSpeed = [1 / 15, 1 / 20],
}: {
  particleCount?: number;
  color?: string;
  rotationSpeed?: [number, number];
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const { invalidate } = useThree();

  const sphere = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    random.inSphere(arr, { radius: 1.5 });
    return arr;
  }, [particleCount]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.x -= delta * rotationSpeed[0];
    pointsRef.current.rotation.y -= delta * rotationSpeed[1];
    // On-demand rendering for performance
    invalidate();
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={pointsRef}
        positions={sphere}
        stride={3}
        frustumCulled={true}
      >
        <PointMaterial
          transparent
          color={color}
          size={0.004}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.8}
        />
      </Points>
    </group>
  );
}

/**
 * Production-ready particle background with error boundary
 */
function ParticleScene({ disabled }: { disabled: boolean }) {
  if (disabled) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 3.5], fov: 60 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: false,
      }}
      dpr={[1, 1.5]} // Cap pixel ratio for performance
      style={{ touchAction: 'none' }}
    >
      <Suspense fallback={null}>
        <ParticleSwarm />
      </Suspense>
    </Canvas>
  );
}

/**
 * Main export - Auto-detects performance constraints
 */
export default function ParticleBackground() {
  const { isReducedMotion, isLowPower } = usePerformanceSettings();
  const disabled = isReducedMotion || isLowPower;

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Suspense fallback={<FallbackFallback />}>
        <ParticleScene disabled={disabled} />
      </Suspense>
      {disabled && <FallbackFallback />}
    </div>
  );
}
