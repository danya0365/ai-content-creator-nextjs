'use client';

import { animated, config, useSpring, useTrail } from '@react-spring/web';
import { useEffect, useMemo, useState } from 'react';

interface Bubble {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  color: string;
}

const BUBBLE_COLORS = [
  'from-violet-500/30 to-purple-500/10',
  'from-fuchsia-500/25 to-pink-500/10',
  'from-cyan-500/20 to-blue-500/10',
  'from-indigo-500/25 to-violet-500/10',
  'from-purple-500/20 to-fuchsia-500/10',
];

function generateBubbles(count: number): Bubble[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 150 + 50,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 15000 + 10000,
    delay: Math.random() * 3000,
    color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
  }));
}

interface AnimatedBubbleProps {
  bubble: Bubble;
}

function AnimatedBubble({ bubble }: AnimatedBubbleProps) {
  const [targetY, setTargetY] = useState(bubble.y);

  useEffect(() => {
    const interval = setInterval(() => {
      setTargetY(Math.random() * 100);
    }, bubble.duration);

    // Initial animation trigger
    const timeout = setTimeout(() => {
      setTargetY(Math.random() * 100);
    }, bubble.delay);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [bubble.duration, bubble.delay]);

  const springProps = useSpring({
    from: { y: bubble.y, opacity: 0, scale: 0.8 },
    to: { y: targetY, opacity: 1, scale: 1 },
    config: { duration: bubble.duration, ...config.molasses },
    loop: false,
  });

  const floatSpring = useSpring({
    from: { x: bubble.x },
    to: async (next) => {
      while (true) {
        await next({ x: bubble.x + (Math.random() * 10 - 5) });
        await next({ x: bubble.x - (Math.random() * 10 - 5) });
      }
    },
    config: { duration: 5000, ...config.gentle },
  });

  return (
    <animated.div
      className={`absolute rounded-full bg-gradient-to-br ${bubble.color} backdrop-blur-sm border border-white/10 shadow-xl`}
      style={{
        width: bubble.size,
        height: bubble.size,
        left: floatSpring.x.to((x) => `${x}%`),
        top: springProps.y.to((y) => `${y}%`),
        opacity: springProps.opacity,
        transform: springProps.scale.to((s) => `scale(${s})`),
      }}
    >
      {/* Inner glow */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
      {/* Highlight */}
      <div className="absolute top-3 left-3 w-1/4 h-1/4 rounded-full bg-white/30 blur-sm" />
    </animated.div>
  );
}

interface CrystalBubbleAnimationProps {
  bubbleCount?: number;
}

/**
 * Crystal Bubble Animation Component
 * Creates floating glass-like bubbles using react-spring
 */
export function CrystalBubbleAnimation({ bubbleCount = 8 }: CrystalBubbleAnimationProps) {
  const bubbles = useMemo(() => generateBubbles(bubbleCount), [bubbleCount]);

  const trail = useTrail(bubbles.length, {
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: config.slow,
    delay: 500,
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {trail.map((style, index) => (
        <animated.div key={bubbles[index].id} style={style}>
          <AnimatedBubble bubble={bubbles[index]} />
        </animated.div>
      ))}
    </div>
  );
}
