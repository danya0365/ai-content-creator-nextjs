'use client';

import { animated, config, useSpring } from '@react-spring/web';
import { useMemo } from 'react';

// Types
interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BaseChartProps {
  data: ChartDataPoint[];
  height?: number;
  className?: string;
  animate?: boolean;
}

/**
 * BarChart - Simple animated bar chart using pure CSS
 */
interface BarChartProps extends BaseChartProps {
  showLabels?: boolean;
  showValues?: boolean;
}

export function BarChart({
  data,
  height = 200,
  className = '',
  animate = true,
  showLabels = true,
  showValues = true,
}: BarChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value)), [data]);

  return (
    <div className={`flex items-end gap-2 ${className}`} style={{ height }}>
      {data.map((point, index) => (
        <BarChartItem
          key={point.label}
          point={point}
          maxValue={maxValue}
          height={height}
          index={index}
          animate={animate}
          showLabels={showLabels}
          showValues={showValues}
        />
      ))}
    </div>
  );
}

interface BarChartItemProps {
  point: ChartDataPoint;
  maxValue: number;
  height: number;
  index: number;
  animate: boolean;
  showLabels: boolean;
  showValues: boolean;
}

function BarChartItem({
  point,
  maxValue,
  height,
  index,
  animate,
  showLabels,
  showValues,
}: BarChartItemProps) {
  const barHeight = (point.value / maxValue) * (height - 40);

  const spring = useSpring({
    from: { height: 0, opacity: 0 },
    to: { height: barHeight, opacity: 1 },
    delay: animate ? index * 50 : 0,
    config: config.gentle,
  });

  const defaultColor = `hsl(${260 + index * 20}, 70%, 60%)`;

  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      {showValues && (
        <span className="text-xs text-muted">{point.value}</span>
      )}
      <animated.div
        style={{
          height: spring.height,
          opacity: spring.opacity,
          background: `linear-gradient(to top, ${point.color || defaultColor}cc, ${point.color || defaultColor})`,
        }}
        className="w-full rounded-t-lg min-h-[4px]"
      />
      {showLabels && (
        <span className="text-xs text-muted truncate max-w-full">{point.label}</span>
      )}
    </div>
  );
}

/**
 * LineChart - SVG-based line chart with gradient fill
 */
interface LineChartProps extends BaseChartProps {
  strokeColor?: string;
  fillGradient?: boolean;
}

export function LineChart({
  data,
  height = 150,
  className = '',
  animate = true,
  strokeColor = '#8B5CF6',
  fillGradient = true,
}: LineChartProps) {
  const width = 300;
  const padding = 10;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value)), [data]);
  const minValue = useMemo(() => Math.min(...data.map((d) => d.value)), [data]);
  const range = maxValue - minValue || 1;

  // Generate path
  const points = useMemo(() => {
    return data.map((point, i) => {
      const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight;
      return { x, y };
    });
  }, [data, chartWidth, chartHeight, padding, minValue, range]);

  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((path, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${path} L ${point.x} ${point.y}`;
    }, '');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const closePath = `L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;
    return `${linePath} ${closePath}`;
  }, [linePath, points, height, padding]);

  const spring = useSpring({
    from: { dashOffset: 1000, opacity: 0 },
    to: { dashOffset: 0, opacity: 1 },
    config: { duration: animate ? 1000 : 0 },
  });

  return (
    <div className={className}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {fillGradient && (
          <animated.path
            d={areaPath}
            fill="url(#lineGradient)"
            style={{ opacity: spring.opacity }}
          />
        )}
        
        <animated.path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: spring.dashOffset,
          }}
        />

        {/* Data points */}
        {points.map((point, i) => (
          <animated.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={strokeColor}
            style={{ opacity: spring.opacity }}
          />
        ))}
      </svg>
    </div>
  );
}

/**
 * MiniSparkline - Tiny inline chart for stats
 */
interface MiniSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function MiniSparkline({
  data,
  width = 60,
  height = 24,
  color = '#8B5CF6',
}: MiniSparklineProps) {
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * DonutChart - Simple donut/pie chart
 */
interface DonutChartProps {
  data: ChartDataPoint[];
  size?: number;
  strokeWidth?: number;
  className?: string;
  centerLabel?: string;
  centerValue?: string | number;
}

export function DonutChart({
  data,
  size = 120,
  strokeWidth = 12,
  className = '',
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  const segments = useMemo(() => {
    let offset = 0;
    return data.map((point, i) => {
      const percentage = point.value / total;
      const dashArray = `${circumference * percentage} ${circumference * (1 - percentage)}`;
      const dashOffset = -offset * circumference;
      offset += percentage;
      
      const defaultColor = `hsl(${260 + i * 40}, 70%, 60%)`;
      
      return {
        ...point,
        dashArray,
        dashOffset,
        color: point.color || defaultColor,
      };
    });
  }, [data, total, circumference]);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface"
        />
        
        {/* Segments */}
        {segments.map((segment, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={segment.dashArray}
            strokeDashoffset={segment.dashOffset}
            strokeLinecap="round"
          />
        ))}
      </svg>
      
      {/* Center content */}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <div className="text-xl font-bold text-foreground">{centerValue}</div>
          )}
          {centerLabel && (
            <div className="text-xs text-muted">{centerLabel}</div>
          )}
        </div>
      )}
    </div>
  );
}
