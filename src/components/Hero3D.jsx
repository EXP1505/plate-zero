import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Sphere, MeshDistortMaterial, Stars, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const FloatingShapes = () => {
  const group = useRef();

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.1;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  return (
    <group ref={group}>
      {/* Central Abstract Sphere representing 'Data Core' */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#10b981"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            emissive="#059669"
            emissiveIntensity={0.5}
            clearcoat={1}
          />
        </Sphere>
      </Float>

      {/* Orbiting Elements representing 'Food Categories' */}
      {[
        { color: '#3b82f6', pos: [3, 1, -2], size: 0.5, speed: 3 },
        { color: '#8b5cf6', pos: [-3, -1, 1], size: 0.4, speed: 2 },
        { color: '#f43f5e', pos: [1, 3, 2], size: 0.6, speed: 4 },
        { color: '#f59e0b', pos: [-2, 2, -3], size: 0.3, speed: 2.5 },
      ].map((item, idx) => (
        <Float key={idx} speed={item.speed} rotationIntensity={2} floatIntensity={3}>
          <mesh position={item.pos}>
            <octahedronGeometry args={[item.size, 0]} />
            <meshStandardMaterial
              color={item.color}
              roughness={0.1}
              metalness={0.5}
              emissive={item.color}
              emissiveIntensity={0.4}
              wireframe
            />
          </mesh>
        </Float>
      ))}

      {/* Background Sparkles representing 'Data Points' */}
      <Sparkles count={200} scale={12} size={4} speed={0.4} opacity={0.6} color="#ffffff" />
    </group>
  );
};

const Hero3D = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#10b981" />
        <Environment preset="city" />
        <FloatingShapes />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
};

export default Hero3D;
