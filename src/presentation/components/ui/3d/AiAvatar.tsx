'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface AiAvatarProps {
  isGenerating?: boolean;
}

export function AiAvatar({ isGenerating = false }: AiAvatarProps) {
  // Use a group reference to animate the entire avatar
  const groupRef = useRef<THREE.Group>(null);
  
  // Ref for the core sphere material to animate its emissive intensity
  const coreMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Animation values
  const targetRotationSpeed = isGenerating ? 3.0 : 0.5;
  const targetScale = isGenerating ? 1.2 : 1.0;
  
  // Smoothing factors
  const rotationY = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current || !coreMaterialRef.current) return;

    // Smoothly interpolate rotation speed
    rotationY.current = THREE.MathUtils.lerp(
      rotationY.current,
      targetRotationSpeed * delta,
      0.1
    );
    groupRef.current.rotation.y += rotationY.current;

    // Floating animation
    const time = state.clock.elapsedTime;
    const floatHeight = isGenerating ? Math.sin(time * 5) * 0.2 : Math.sin(time * 2) * 0.1;
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      floatHeight,
      0.1
    );

    // Scale animation
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
    groupRef.current.scale.set(newScale, newScale, newScale);

    // Emissive intensity (pulsing when generating)
    const targetEmissive = isGenerating ? 2.0 + Math.sin(time * 10) : 0.5;
    coreMaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      coreMaterialRef.current.emissiveIntensity,
      targetEmissive,
      0.1
    );
  });

  return (
    <group ref={groupRef}>
      {/* Outer Rings */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.5, 0.05, 16, 100]} />
        <meshStandardMaterial 
          color={isGenerating ? '#f472b6' : '#a78bfa'} // Pinkish when generating, purple otherwise
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      <mesh rotation={[-Math.PI / 4, Math.PI / 2, 0]}>
        <torusGeometry args={[1.2, 0.05, 16, 100]} />
        <meshStandardMaterial 
          color={isGenerating ? '#c084fc' : '#818cf8'} 
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Core AI Sphere */}
      <mesh>
        <icosahedronGeometry args={[0.8, 2]} />
        <meshStandardMaterial 
          ref={coreMaterialRef}
          color="#ffffff"
          emissive={isGenerating ? '#f43f5e' : '#6366f1'} // Reddish generating, indigo idle
          emissiveIntensity={0.5}
          metalness={1}
          roughness={0.1}
          wireframe={isGenerating} // Show wireframe when generating for cool matrix effect
        />
      </mesh>

      {/* Lighting for the avatar itself */}
      <pointLight position={[0, 0, 0]} intensity={isGenerating ? 2 : 0.5} color={isGenerating ? '#f43f5e' : '#6366f1'} />
    </group>
  );
}
