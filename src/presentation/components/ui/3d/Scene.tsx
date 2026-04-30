'use client';

import { ContactShadows, Environment, Float } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { AiAvatar } from './AiAvatar';

interface SceneProps {
  isGenerating?: boolean;
}

export function Scene({ isGenerating = false }: SceneProps) {
  return (
    <div className="w-full h-full min-h-[300px] relative rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        {/* Environment setup for reflections */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          
          <Float 
            speed={isGenerating ? 4 : 2} 
            rotationIntensity={isGenerating ? 2 : 1} 
            floatIntensity={isGenerating ? 2 : 1}
          >
            <AiAvatar isGenerating={isGenerating} />
          </Float>

          {/* Soft shadow underneath */}
          <ContactShadows 
            position={[0, -2, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2} 
            far={4} 
            color={isGenerating ? "#f472b6" : "#a78bfa"}
          />
        </Suspense>
      </Canvas>
      
      {/* Overlay text/status */}
      <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none">
        <p className={`text-sm font-medium transition-colors duration-300 ${isGenerating ? 'text-pink-400 animate-pulse' : 'text-indigo-400'}`}>
          {isGenerating ? 'AI IS GENERATING...' : 'AI ASSISTANT READY'}
        </p>
      </div>
    </div>
  );
}
