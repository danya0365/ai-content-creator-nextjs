'use client';

import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { JellyCard } from '../ui/JellyCard';

/**
 * AnalyticsSkeleton
 * Loading layout for the analytics dashboard
 */
export function AnalyticsSkeleton() {
  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-8 animate-fade-in">
        
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton width={200} height={32} />
            <Skeleton width={300} height={16} />
          </div>
          <div className="flex gap-1 p-1 glass-card rounded-lg">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width={80} height={36} className="rounded-md" />
            ))}
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <JellyCard key={i} className="glass-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton width={40} height={40} className="rounded-xl" />
                <Skeleton width="40%" height={12} />
              </div>
              <Skeleton width="80%" height={28} />
              <Skeleton width="40%" height={12} />
            </JellyCard>
          ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <JellyCard key={i} className="glass-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton width={180} height={24} />
                <Skeleton width={80} height={14} />
              </div>
              <Skeleton width="100%" height={200} className="rounded-2xl" />
            </JellyCard>
          ))}
        </div>

        {/* Content Type & Top Performers Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content by Type Skeleton */}
          <JellyCard className="glass-card p-5 space-y-6">
            <Skeleton width={150} height={24} />
            <div className="flex justify-center p-4">
              <Skeleton width={160} height={160} className="rounded-full" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton width={12} height={12} className="rounded-full" />
                    <Skeleton width={80} height={12} />
                  </div>
                  <Skeleton width={40} height={12} />
                </div>
              ))}
            </div>
          </JellyCard>

          {/* Top Performers Skeleton */}
          <JellyCard className="glass-card p-5 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton width={180} height={24} />
              <Skeleton width={80} height={32} />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-white/5">
                  <Skeleton width={32} height={32} className="rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton width="60%" height={14} />
                    <Skeleton width="30%" height={10} />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton width={40} height={14} />
                    <Skeleton width={40} height={14} />
                  </div>
                </div>
              ))}
            </div>
          </JellyCard>
        </div>

        {/* Goals Skeleton */}
        <JellyCard className="glass-card p-5 space-y-4">
          <Skeleton width={150} height={24} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton width={100} height={12} />
                  <Skeleton width={40} height={12} />
                </div>
                <Skeleton width="100%" height={8} className="rounded-full" />
              </div>
            ))}
          </div>
        </JellyCard>
      </div>
    </div>
  );
}
