'use client';

import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { JellyCard } from '../ui/JellyCard';

/**
 * ScheduleSkeleton
 * Loading layout for the schedule calendar view
 */
export function ScheduleSkeleton() {
  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-8 animate-fade-in">
        
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton width={180} height={32} />
            <Skeleton width={260} height={16} />
          </div>
          <Skeleton width={160} height={48} className="rounded-2xl" />
        </div>

        {/* Week Selector Skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <JellyCard key={i} className="flex flex-col items-center p-3 rounded-2xl min-w-[70px] glass-card space-y-2">
              <Skeleton width={24} height={12} />
              <Skeleton width={32} height={24} />
              <div className="flex gap-0.5">
                <Skeleton width={6} height={6} className="rounded-full" />
                <Skeleton width={6} height={6} className="rounded-full" />
              </div>
            </JellyCard>
          ))}
        </div>

        {/* Selected Day Info Skeleton */}
        <JellyCard className="glass-card p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton width={120} height={24} />
              <Skeleton width={180} height={14} />
            </div>
            <Skeleton width={60} height={24} className="rounded-full" />
          </div>

          {/* Time Slots Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-6 items-stretch">
                {/* Time label placeholder */}
                <div className="w-24 flex-shrink-0 py-2 space-y-2">
                   <div className="flex items-center gap-2">
                      <Skeleton width={24} height={24} className="rounded-lg" />
                      <Skeleton width={60} height={16} />
                   </div>
                   <Skeleton width={80} height={12} />
                </div>

                {/* Content area placeholder */}
                <div className="flex-1 min-h-[100px] glass-card rounded-xl p-3 flex gap-3 overflow-hidden">
                   <Skeleton width={192} height="100%" className="rounded-xl" />
                   <Skeleton width={192} height="100%" className="rounded-xl opacity-50" />
                   <div className="flex-1 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center">
                      <Skeleton width={24} height={24} className="rounded-full" />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </JellyCard>

        {/* Quick Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <JellyCard key={i} className="glass-card p-4 flex items-center gap-3">
              <Skeleton width={40} height={40} className="rounded-xl" />
              <div className="space-y-1">
                <Skeleton width={24} height={20} />
                <Skeleton width={48} height={12} />
              </div>
            </JellyCard>
          ))}
        </div>
      </div>
    </div>
  );
}
