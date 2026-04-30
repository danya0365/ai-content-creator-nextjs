'use client';

import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'rect' | 'circle' | 'text';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable Skeleton component
 * Following Atomic Design - this is an Atom
 */
export function Skeleton({ 
  width, 
  height, 
  variant = 'rect', 
  className = '', 
  style 
}: SkeletonProps) {
  const baseClass = 'skeleton animate-shimmer';
  
  const variantClass = 
    variant === 'circle' ? 'rounded-full' : 
    variant === 'text' ? 'rounded w-full h-4' : 
    'rounded-xl';

  const combinedStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style
  };

  return (
    <div 
      className={`${baseClass} ${variantClass} ${className}`}
      style={combinedStyle}
      aria-hidden="true"
    />
  );
}
