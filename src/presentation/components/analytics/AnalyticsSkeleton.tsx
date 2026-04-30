'use client';

import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { JellyCard } from '../ui/JellyCard';

/**
 * AnalyticsSkeleton
 * Loading layout for the analytics dashboard with premium "Jelly" design
 */
export function AnalyticsSkeleton() {
  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-8 animate-fade-in">
        
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <Skeleton width={220} height={32} className="rounded-lg" />
            <Skeleton width={320} height={16} />
          </div>
          <div className="flex gap-1 p-1 glass-card rounded-lg">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} width={80} height={36} className="rounded-md" />
            ))}
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <JellyCard key={i} className="glass-card p-4 space-y-4 border border-white/5">
              <div className="flex items-center justify-between">
                <Skeleton width={40} height={40} className="rounded-xl" />
                <Skeleton width={45} height={18} className="rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton width="80%" height={28} />
                <Skeleton width="50%" height={12} />
              </div>
            </JellyCard>
          ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <JellyCard key={i} className="glass-card p-6 space-y-6 border border-white/5">
              <div className="flex items-center justify-between">
                <Skeleton width={180} height={24} />
                <Skeleton width={90} height={14} />
              </div>
              {/* Chart Placeholder */}
              <div className="relative h-[200px] w-full flex items-end justify-between px-2 overflow-hidden">
                 <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/5" />
                 {[...Array(15)].map((_, j) => (
                    <Skeleton 
                      key={j} 
                      width={`${100/15 - 2}%`} 
                      height={`${30 + Math.random() * 50}%`} 
                      className="rounded-t-sm opacity-20" 
                    />
                 ))}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                 </div>
              </div>
            </JellyCard>
          ))}
        </div>

        {/* Content Type & Top Performers Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content by Type Skeleton */}
          <JellyCard className="glass-card p-6 space-y-8 border border-white/5">
            <Skeleton width={160} height={24} />
            <div className="flex justify-center py-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[16px] border-white/5" />
                <div className="absolute inset-0 rounded-full border-[16px] border-violet-500/20 border-t-transparent animate-spin" />
                <div className="flex flex-col items-center gap-1">
                   <Skeleton width={50} height={24} />
                   <Skeleton width={40} height={12} />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Skeleton width={12} height={12} className="rounded-full" />
                    <Skeleton width={90} height={12} />
                  </div>
                  <Skeleton width={45} height={12} />
                </div>
              ))}
            </div>
          </JellyCard>

          {/* Top Performers Skeleton */}
          <JellyCard className="glass-card p-6 lg:col-span-2 space-y-6 border border-white/5">
            <div className="flex items-center justify-between">
              <Skeleton width={180} height={24} />
              <Skeleton width={100} height={36} className="rounded-xl" />
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5">
                  <Skeleton width={36} height={36} className="rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <Skeleton width="70%" height={16} />
                    <Skeleton width="40%" height={12} />
                  </div>
                  <div className="flex gap-6 items-center flex-shrink-0">
                    <div className="flex items-center gap-2">
                       <Skeleton width={16} height={16} className="rounded-full" />
                       <Skeleton width={30} height={14} />
                    </div>
                    <div className="flex items-center gap-2">
                       <Skeleton width={16} height={16} className="rounded-full" />
                       <Skeleton width={30} height={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </JellyCard>
        </div>

        {/* Goals Skeleton */}
        <JellyCard className="glass-card p-6 space-y-6 border border-white/5">
          <Skeleton width={160} height={24} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <Skeleton width={120} height={14} />
                    <Skeleton width={80} height={18} />
                  </div>
                  <Skeleton width={50} height={12} />
                </div>
                <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
                   <Skeleton width={`${60 + Math.random() * 30}%`} height="100%" className="rounded-full bg-violet-500/30" />
                </div>
              </div>
            ))}
          </div>
        </JellyCard>
      </div>
    </div>
  );
}
