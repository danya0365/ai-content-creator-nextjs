'use client';

import { animated, useSpring } from '@react-spring/web';
import { useEffect, useState } from 'react';

type TrendDirection = 'up' | 'down' | 'neutral';

interface TrendIndicatorProps {
  value: number;
  previousValue?: number;
  suffix?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * TrendIndicator - Shows trend direction with animated percentage change
 */
export function TrendIndicator({
  value,
  previousValue = 0,
  suffix = '',
  showPercentage = true,
  size = 'md',
  className = '',
}: TrendIndicatorProps) {
  const change = previousValue !== 0 ? ((value - previousValue) / previousValue) * 100 : 0;
  const direction: TrendDirection = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  const absChange = Math.abs(change);

  const trendConfig = {
    up: {
      icon: '↑',
      bgClass: 'bg-green-500/20',
      textClass: 'text-green-400',
    },
    down: {
      icon: '↓',
      bgClass: 'bg-red-500/20',
      textClass: 'text-red-400',
    },
    neutral: {
      icon: '→',
      bgClass: 'bg-gray-500/20',
      textClass: 'text-gray-400',
    },
  };

  const sizeConfig = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const config = trendConfig[direction];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgClass} ${config.textClass} ${sizeConfig[size]} ${className}`}
    >
      <span>{config.icon}</span>
      {showPercentage && <span>{absChange.toFixed(1)}%</span>}
      {suffix && <span>{suffix}</span>}
    </span>
  );
}

/**
 * AnimatedNumber - Smoothly animates number changes
 */
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: AnimatedNumberProps) {
  const spring = useSpring({
    number: value,
    from: { number: 0 },
    config: { duration },
  });

  return (
    <animated.span className={className}>
      {spring.number.to((n) => `${prefix}${n.toFixed(decimals)}${suffix}`)}
    </animated.span>
  );
}

/**
 * TrendStatValue - Stat value with trend indicator
 */
interface TrendStatValueProps {
  current: number;
  previous: number;
  label?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function TrendStatValue({
  current,
  previous,
  label,
  prefix = '',
  suffix = '',
  className = '',
}: TrendStatValueProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <AnimatedNumber
          value={mounted ? current : 0}
          prefix={prefix}
          suffix={suffix}
          className="text-2xl font-bold text-foreground"
        />
        <TrendIndicator
          value={current}
          previousValue={previous}
          size="sm"
        />
      </div>
      {label && <div className="text-sm text-muted mt-0.5">{label}</div>}
    </div>
  );
}

/**
 * ProgressBar - Animated progress bar
 */
interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: string;
  height?: number;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  color = 'from-violet-500 to-fuchsia-500',
  height = 8,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const spring = useSpring({
    width: `${percentage}%`,
    from: { width: '0%' },
    config: { tension: 200, friction: 20 },
  });

  return (
    <div className={className}>
      <div
        className="w-full bg-surface rounded-full overflow-hidden"
        style={{ height }}
      >
        <animated.div
          style={spring}
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-muted">
          <span>{value.toLocaleString()}</span>
          <span>{max.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

/**
 * StatComparison - Compare two stats side by side
 */
interface StatComparisonProps {
  label1: string;
  value1: number;
  label2: string;
  value2: number;
  color1?: string;
  color2?: string;
  className?: string;
}

export function StatComparison({
  label1,
  value1,
  label2,
  value2,
  color1 = '#8B5CF6',
  color2 = '#EC4899',
  className = '',
}: StatComparisonProps) {
  const total = value1 + value2;
  const percentage1 = total > 0 ? (value1 / total) * 100 : 50;

  return (
    <div className={className}>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-muted">
          <span style={{ color: color1 }}>●</span> {label1}: {value1}
        </span>
        <span className="text-muted">
          {label2}: {value2} <span style={{ color: color2 }}>●</span>
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden flex">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${percentage1}%`, backgroundColor: color1 }}
        />
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${100 - percentage1}%`, backgroundColor: color2 }}
        />
      </div>
    </div>
  );
}
