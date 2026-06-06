import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Sparkles, Stars } from '@react-three/drei';

const ParticleBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <color attach="background" args={['#0B1120']} />
        <ambientLight intensity={0.5} />
        {/* Subtle, floating particles in the foreground */}
        <Sparkles 
          count={400} 
          scale={15} 
          size={2} 
          speed={0.4} 
          opacity={0.5} 
          color="#10b981" 
        />
        {/* Distant star-like particles for depth */}
        <Stars 
          radius={50} 
          depth={50} 
          count={3000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1} 
        />
      </Canvas>
    </div>
  );
};

export default ParticleBackground;
