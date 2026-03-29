'use client';

import React from 'react';

/**
 * Global Root Loading UI
 * Shown during initial app load or for routes without a specific loading.tsx
 */
export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="relative group">
        {/* Animated Orbs */}
        <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 animate-pulse"></div>
        
        {/* Spinner */}
        <div className="relative flex flex-col items-center gap-6">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full animate-spin text-violet-500" viewBox="0 0 100 100">
              <circle
                className="opacity-10"
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-80"
                fill="currentColor"
                d="M50 8A42 42 0 0 1 92 50h-4A38 38 0 0 0 50 12z"
              />
            </svg>
            
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              ✨
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-lg font-bold gradient-text-purple tracking-wider animate-pulse">
              AI CONTENT CREATOR
            </h2>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-violet-500/50 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
