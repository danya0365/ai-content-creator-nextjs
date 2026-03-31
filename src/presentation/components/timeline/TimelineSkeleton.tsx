'use client';

import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { JellyCard } from '../ui/JellyCard';
import { usePreferencesStore } from '../../stores/usePreferencesStore';

/**
 * TimelineVerticalSkeleton - Skeleton for the vertical flow
 */
function TimelineVerticalSkeleton() {
  return (
    <div className="relative">
      {/* Central line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/5 transform -translate-x-1/2" />
      
      <div className="space-y-12">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-8">
            <div className="flex justify-center">
              <Skeleton width={180} height={40} className="rounded-2xl" />
            </div>
            <div className={`flex gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className="flex-1 max-w-md">
                <JellyCard className="glass-card p-6 space-y-4 border border-white/5">
                  <div className="flex justify-between">
                    <Skeleton width={100} height={16} />
                    <Skeleton width={60} height={20} className="rounded-full" />
                  </div>
                  <Skeleton width="100%" height={24} />
                  <Skeleton width="100%" height={200} className="rounded-xl" />
                </JellyCard>
              </div>
              <div className="w-4 h-4 rounded-full bg-white/10 mt-12 z-10" />
              <div className="flex-1 max-w-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * TimelineListSkeleton - Skeleton for the list view
 */
function TimelineListSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((group) => (
        <div key={group} className="space-y-4">
          <div className="flex items-center gap-4 pl-2">
            <Skeleton width={100} height={12} />
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="grid gap-3">
            {[1, 2, 3].map((item) => (
              <JellyCard key={item} className="glass-card p-4 flex items-center gap-4 border border-white/5">
                <Skeleton width={48} height={48} className="rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton width="40%" height={16} />
                  <Skeleton width="70%" height={12} />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton width={40} height={10} />
                  <Skeleton width={60} height={16} className="rounded-full" />
                </div>
              </JellyCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * TimelineSkeleton
 * Loading layout for the timeline view
 */
export function TimelineSkeleton() {
  const preferences = usePreferencesStore();
  const mode = preferences.timelineViewMode;

  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-8 animate-fade-in relative">
        
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton width={220} height={32} />
            <Skeleton width={280} height={14} />
          </div>
          <Skeleton width={180} height={40} className="rounded-lg" />
        </div>

        {/* Filter Toolbar Skeleton */}
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={100} height={36} className="rounded-xl" />
          ))}
        </div>

        {/* Mode-Aware Content Skeleton */}
        {mode === 'vertical' ? (
          <TimelineVerticalSkeleton />
        ) : (
          <TimelineListSkeleton />
        )}
      </div>
    </div>
  );
}
