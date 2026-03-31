'use client';

import React from 'react';
import { animated, useSpring, config } from '@react-spring/web';
import { Skeleton } from '../common/Skeleton';

interface LoadMoreButtonProps {
  onClick: () => void;
  loading: boolean;
  hasMore: boolean;
  className?: string;
}

/**
 * LoadMoreButton
 * Professional, glassmorphism-style button for pagination
 * With loading state and crystal shimmer integration
 */
export function LoadMoreButton({ onClick, loading, hasMore, className = '' }: LoadMoreButtonProps) {
  const springProps = useSpring({
    opacity: hasMore ? 1 : 0,
    transform: hasMore ? 'scale(1)' : 'scale(0.9)',
    config: config.gentle,
  });

  if (!hasMore && !loading) return null;

  return (
    <animated.div 
      style={springProps}
      className={`flex justify-center py-12 ${className}`}
    >
      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="w-3 h-3 rounded-full bg-violet-500/50 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-xs text-muted font-medium tracking-widest uppercase opacity-60">
            กำลังโหลดข้อมูลเพิ่ม...
          </p>
        </div>
      ) : (
        <button
          onClick={onClick}
          className="group relative px-8 py-3 rounded-2xl glass-card-hover border border-white/10 overflow-hidden transition-all duration-300"
        >
          {/* Background Gradient Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <span className="relative z-10 flex items-center gap-2 text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
            <span>โหลดเพิ่มเติม</span>
            <span className="group-hover:translate-y-0.5 transition-transform duration-300">
              ↓
            </span>
          </span>
          
          {/* Glossy Reflection Effect */}
          <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000" />
        </button>
      )}
    </animated.div>
  );
}
