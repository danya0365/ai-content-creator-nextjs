'use client';

import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { JellyCard } from '../ui/JellyCard';

/**
 * DashboardSkeleton
 * Loading layout for the dashboard page
 */
export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton width={200} height={32} />
          <Skeleton width={300} height={16} />
        </div>
        <Skeleton width={150} height={48} className="rounded-2xl" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <JellyCard key={i} className="glass-card p-6 flex items-center gap-4">
            <Skeleton width={56} height={56} className="rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton width="40%" height={16} />
              <Skeleton width="80%" height={28} />
            </div>
          </JellyCard>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Chart Skeleton */}
        <JellyCard className="lg:col-span-2 glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton width={180} height={24} />
            <Skeleton width={100} height={32} />
          </div>
          <Skeleton width="100%" height={300} className="rounded-2xl" />
        </JellyCard>

        {/* Content Type Stats Skeleton */}
        <JellyCard className="glass-card p-6 space-y-6">
          <Skeleton width={150} height={24} />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton width={32} height={32} className="rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton width="60%" height={12} />
                  <Skeleton width="100%" height={8} />
                </div>
              </div>
            ))}
          </div>
        </JellyCard>
      </div>

      {/* Bottom Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Skeleton */}
        <JellyCard className="glass-card p-6 space-y-4">
          <Skeleton width={180} height={24} />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-white/5">
                <Skeleton width={48} height={48} className="rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton width="70%" height={14} />
                  <Skeleton width="30%" height={10} />
                </div>
              </div>
            ))}
          </div>
        </JellyCard>

        {/* Upcoming Schedule Skeleton */}
        <JellyCard className="glass-card p-6 space-y-4">
          <Skeleton width={180} height={24} />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-white/5">
                <Skeleton width={40} height={40} className="rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton width="50%" height={14} />
                  <Skeleton width="20%" height={10} />
                </div>
                <Skeleton width={60} height={24} className="rounded-full" />
              </div>
            ))}
          </div>
        </JellyCard>
      </div>
    </div>
  );
}
