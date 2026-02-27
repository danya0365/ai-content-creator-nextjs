'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Scene } from './3d/Scene';

interface AiAssistantWidgetProps {
  isGenerating?: boolean;
}

/**
 * AiAssistantWidget
 * Wrapper component that decides whether to render the heavy 3D Scene
 * or a lighter 2D CSS-based animation based on device capabilities.
 */
export function AiAssistantWidget({ isGenerating = false }: AiAssistantWidgetProps) {
  const [isHardwareLowSpec, setIsHardwareLowSpec] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Global User Preference
  const { enable3DGraphics, toggle3DGraphics } = useSettingsStore();

  useEffect(() => {
    setIsMounted(true);

    // Hardware Detection Heuristics
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    // @ts-ignore - deviceMemory is not yet standard in TS DOM, but works in Chromium
    const deviceMemory = navigator.deviceMemory || 4;
    
    // Accessibility preference
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If the device has less than 4 cores, less than 4GB of RAM, or prefers reduced motion
    if (hardwareConcurrency < 4 || deviceMemory < 4 || reducedMotion) {
      setIsHardwareLowSpec(true);
    }
  }, []);

  // Prevent SSR hydration mismatch by rendering nothing until mounted
  if (!isMounted) return <div className="w-full h-full min-h-[300px] bg-surface rounded-xl animate-pulse" />;

  // Determine actual render mode: User setting overrides hardware detect, 
  // but if user has it ON and hardware is bad, it still falls back
  const shouldRender3D = enable3DGraphics && !isHardwareLowSpec;

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden group">
      
      {/* 3D/2D Content */}
      {shouldRender3D ? (
        <Suspense fallback={<AiAssistant2D isGenerating={isGenerating} />}>
          <Scene isGenerating={isGenerating} />
        </Suspense>
      ) : (
        <AiAssistant2D isGenerating={isGenerating} />
      )}

      {/* Toggle Button (Appears on Hover) */}
      <button
        onClick={toggle3DGraphics}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/20 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-all z-10"
        title={shouldRender3D ? "ปิดโหมด 3D (ลื่นไหลขึ้น)" : "เปิดโหมด 3D (สวยงามขึ้น)"}
      >
        {shouldRender3D ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        )}
      </button>
    </div>
  );
}

/**
 * Secondary 2D Fallback Component
 * Uses CSS transitions and animations instead of WebGL
 */
function AiAssistant2D({ isGenerating }: { isGenerating: boolean }) {
  return (
    <div className={`w-full h-full min-h-[300px] relative rounded-xl flex items-center justify-center overflow-hidden transition-colors duration-700 bg-gradient-to-br ${isGenerating ? 'from-pink-500/10 via-rose-500/5 to-red-500/10' : 'from-indigo-500/10 via-purple-500/5 to-pink-500/10'}`}>
      
      {/* Central Animated Element */}
      <div className="relative flex items-center justify-center">
        
        {/* Outer glowing ripple (active only when generating) */}
        <div 
          className={`absolute rounded-full border-2 transition-all duration-700 ${
            isGenerating ? 'border-pink-400 w-40 h-40 animate-ping opacity-30' : 'border-indigo-400 w-24 h-24 opacity-0'
          }`} 
        />
        
        {/* Middle ring */}
        <div 
          className={`absolute rounded-full border border-dashed transition-all duration-1000 ${
            isGenerating ? 'border-pink-300 w-28 h-28 animate-[spin_3s_linear_infinite] opacity-50' : 'border-indigo-300 w-24 h-24 animate-[spin_10s_linear_infinite] opacity-30'
          }`} 
        />

        {/* Inner solid orb */}
        <div 
          className={`rounded-full shadow-2xl transition-all duration-500 ${
            isGenerating 
              ? 'w-20 h-20 bg-gradient-to-tr from-pink-500 to-rose-400 animate-pulse shadow-pink-500/50' 
              : 'w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-400 shadow-indigo-500/30'
          }`} 
        />
      </div>

      {/* Overlay Status Text */}
      <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none">
        <p className={`text-sm font-medium transition-colors duration-300 ${isGenerating ? 'text-pink-400 animate-pulse' : 'text-indigo-400'}`}>
          {isGenerating ? 'AI IS GENERATING...' : 'AI ASSISTANT READY'}
        </p>
      </div>
    </div>
  );
}
