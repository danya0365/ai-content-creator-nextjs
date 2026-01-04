'use client';

import { animated, useSpring } from '@react-spring/web';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect' | 'card';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

/**
 * Skeleton - Loading placeholder with pulse animation
 */
export function Skeleton({
  className = '',
  variant = 'rect',
  width,
  height,
  animate = true,
}: SkeletonProps) {
  const spring = useSpring({
    from: { opacity: 0.4 },
    to: { opacity: 0.8 },
    loop: { reverse: true },
    config: { duration: 1000 },
    pause: !animate,
  });

  const variantClasses = {
    text: 'rounded-md h-4',
    circle: 'rounded-full aspect-square',
    rect: 'rounded-xl',
    card: 'rounded-2xl',
  };

  const style: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height: height ?? (variant === 'text' ? '1rem' : undefined),
  };

  return (
    <animated.div
      style={{ ...style, opacity: animate ? spring.opacity : 0.6 }}
      className={`bg-gradient-to-r from-surface via-border/30 to-surface ${variantClasses[variant]} ${className}`}
    />
  );
}

/**
 * SkeletonText - Multiple lines of skeleton text
 */
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

export function SkeletonText({
  lines = 3,
  className = '',
  lastLineWidth = '60%',
}: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard - Card-shaped skeleton
 */
interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
}

export function SkeletonCard({
  className = '',
  showImage = true,
  showTitle = true,
  showDescription = true,
}: SkeletonCardProps) {
  return (
    <div className={`glass-card p-4 rounded-2xl ${className}`}>
      {showImage && (
        <Skeleton
          variant="rect"
          className="w-full aspect-square mb-3"
        />
      )}
      {showTitle && (
        <Skeleton variant="text" width="80%" className="mb-2" height="1.25rem" />
      )}
      {showDescription && (
        <SkeletonText lines={2} lastLineWidth="50%" />
      )}
    </div>
  );
}

/**
 * SkeletonAvatar - Circular avatar skeleton
 */
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SkeletonAvatar({ size = 'md', className = '' }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <Skeleton variant="circle" className={`${sizeClasses[size]} ${className}`} />
  );
}

/**
 * SkeletonStats - Stats card skeleton
 */
export function SkeletonStats({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card p-5 flex items-center gap-4 ${className}`}>
      <Skeleton variant="rect" className="w-12 h-12 rounded-xl" />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" height="1.5rem" className="mb-1" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  );
}

/**
 * SkeletonContentCard - Content card skeleton for gallery/dashboard
 */
export function SkeletonContentCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card p-4 rounded-2xl ${className}`}>
      {/* Image placeholder */}
      <Skeleton variant="rect" className="w-full aspect-square rounded-xl mb-3" />
      
      {/* Status and time */}
      <div className="flex items-center justify-between mb-2">
        <Skeleton variant="rect" className="w-20 h-5 rounded-full" />
        <Skeleton variant="text" width={40} />
      </div>
      
      {/* Title */}
      <Skeleton variant="text" width="90%" height="1rem" className="mb-1" />
      <Skeleton variant="text" width="60%" height="1rem" />
    </div>
  );
}

/**
 * SkeletonDashboard - Full dashboard skeleton
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton variant="text" width={150} height="1.5rem" className="mb-1" />
          <Skeleton variant="text" width={200} />
        </div>
        <Skeleton variant="rect" className="w-40 h-12 rounded-xl" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStats key={i} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonContentCard key={i} />
        ))}
      </div>
    </div>
  );
}
