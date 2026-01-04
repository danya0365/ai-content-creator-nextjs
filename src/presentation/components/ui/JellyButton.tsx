'use client';

import { animated, useSpring } from '@react-spring/web';
import { useState } from 'react';

interface JellyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit';
}

/**
 * JellyButton - Bouncy button with jelly-like animations
 * Uses react-spring for smooth, physics-based interactions
 */
export function JellyButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
}: JellyButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const spring = useSpring({
    scale: isPressed ? 0.92 : isHovered ? 1.05 : 1,
    rotate: isHovered ? (isPressed ? 0 : 1) : 0,
    config: {
      tension: 400,
      friction: 10,
      mass: 1,
    },
  });

  const variantClasses = {
    primary: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40',
    secondary: 'glass-card text-foreground hover:bg-surface/80',
    ghost: 'text-muted hover:text-foreground hover:bg-surface/50',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  };

  return (
    <animated.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        transform: spring.scale.to((s) => `scale(${s}) rotate(${spring.rotate.get()}deg)`),
      }}
      className={`
        font-semibold transition-all duration-200 
        flex items-center justify-center gap-2
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </animated.button>
  );
}
