'use client';

import { animated, useSpring } from '@react-spring/web';
import { useState } from 'react';

interface JellyCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  as?: 'div' | 'button' | 'article';
  hoverScale?: number;
  clickScale?: number;
  tiltAmount?: number;
}

/**
 * JellyCard - Card wrapper with jelly-like bounce animations
 * Provides hover scale, tilt, and click bounce effects
 */
export function JellyCard({
  children,
  onClick,
  className = '',
  as: Component = 'div',
  hoverScale = 1.02,
  clickScale = 0.98,
  tiltAmount = 1,
}: JellyCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const spring = useSpring({
    scale: isPressed ? clickScale : isHovered ? hoverScale : 1,
    rotateX: isHovered ? (mousePos.y - 0.5) * -tiltAmount * 10 : 0,
    rotateY: isHovered ? (mousePos.x - 0.5) * tiltAmount * 10 : 0,
    config: {
      tension: 300,
      friction: 10,
      mass: 1,
    },
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  const AnimatedComponent = animated[Component] as typeof animated.div;

  return (
    <AnimatedComponent
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
        setMousePos({ x: 0.5, y: 0.5 });
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        transform: spring.scale.to(
          (s) => `perspective(1000px) scale(${s}) rotateX(${spring.rotateX.get()}deg) rotateY(${spring.rotateY.get()}deg)`
        ),
        transformStyle: 'preserve-3d',
      }}
      className={`transition-shadow duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </AnimatedComponent>
  );
}

/**
 * JellyIconButton - Small icon button with jelly bounce
 */
interface JellyIconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  label?: string;
}

export function JellyIconButton({ icon, onClick, className = '', label }: JellyIconButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const spring = useSpring({
    scale: isPressed ? 0.85 : isHovered ? 1.15 : 1,
    rotate: isPressed ? -5 : isHovered ? 5 : 0,
    config: {
      tension: 400,
      friction: 10,
    },
  });

  return (
    <animated.button
      onClick={onClick}
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
      className={`p-2 rounded-lg transition-colors ${className}`}
      aria-label={label}
    >
      {icon}
    </animated.button>
  );
}

/**
 * JellyWrapper - Simple wrapper for adding jelly effect to any element
 */
interface JellyWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function JellyWrapper({ children, className = '' }: JellyWrapperProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const spring = useSpring({
    scale: isPressed ? 0.95 : isHovered ? 1.03 : 1,
    config: {
      tension: 350,
      friction: 12,
    },
  });

  return (
    <animated.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        transform: spring.scale.to((s) => `scale(${s})`),
      }}
      className={className}
    >
      {children}
    </animated.div>
  );
}
