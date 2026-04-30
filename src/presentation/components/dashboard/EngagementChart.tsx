'use client';

import { animated, config, useSpring } from '@react-spring/web';
import { useState } from 'react';
import { JellyCard } from '../ui/JellyCard';
import { BarChart, LineChart } from '../ui/SimpleChart';

type ChartDataPoint = { label: string; value: number };
type EngagementByTypeDataPoint = { label: string; value: number; color: string };

type ChartType = 'line' | 'bar';
type DateRange = 'week' | 'month';

interface EngagementChartProps {
  className?: string;
  weeklyData?: ChartDataPoint[];
  typeData?: EngagementByTypeDataPoint[];
}

/**
 * EngagementChart - Weekly engagement visualization
 */
export function EngagementChart({ className = '', weeklyData = [], typeData = [] }: EngagementChartProps) {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [dateRange, setDateRange] = useState<DateRange>('week');

  const headerSpring = useSpring({
    from: { opacity: 0, y: -10 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  // Calculate totals
  const totalEngagement = weeklyData.reduce((sum, d) => sum + d.value, 0);
  const avgEngagement = weeklyData.length > 0 ? Math.round(totalEngagement / weeklyData.length) : 0;

  return (
    <animated.div style={headerSpring}>
      <JellyCard className={`glass-card p-5 ${className}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">📊 Engagement Overview</h3>
            <p className="text-xs text-muted">
              รวม {totalEngagement.toLocaleString()} • เฉลี่ย {avgEngagement}/วัน
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Chart type toggle */}
            <div className="flex gap-1 p-1 glass-card rounded-lg">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  chartType === 'line'
                    ? 'bg-violet-600 text-white'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                📈 Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  chartType === 'bar'
                    ? 'bg-violet-600 text-white'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                📊 Bar
              </button>
            </div>

            {/* Date range */}
            <div className="flex gap-1 p-1 glass-card rounded-lg">
              <button
                onClick={() => setDateRange('week')}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  dateRange === 'week'
                    ? 'bg-fuchsia-600 text-white'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                สัปดาห์
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  dateRange === 'month'
                    ? 'bg-fuchsia-600 text-white'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                เดือน
              </button>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[180px] mb-4">
          {chartType === 'line' ? (
            <LineChart
              data={weeklyData}
              height={180}
              strokeColor="#8B5CF6"
              fillGradient
            />
          ) : (
            <BarChart
              data={weeklyData}
              height={180}
              showLabels
              showValues
            />
          )}
        </div>

        {/* Engagement breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {typeData.map((item) => (
            <div
              key={item.label}
              className="glass-card p-3 rounded-xl text-center"
            >
              <div className="text-lg font-bold text-foreground">
                {item.value.toLocaleString()}
              </div>
              <div className="text-xs text-muted flex items-center justify-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </JellyCard>
    </animated.div>
  );
}
