'use client';

import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { JellyCard } from '../ui/JellyCard';
import { usePreferencesStore } from '../../stores/usePreferencesStore';

/**
 * GalleryGridSkeleton - Skeleton for the grid view
 */
function GalleryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <JellyCard key={i} className="glass-card overflow-hidden border border-white/5 space-y-3 p-3">
          <Skeleton width="100%" height={0} className="aspect-square rounded-xl" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton width={50} height={16} className="rounded-full" />
              <Skeleton width={40} height={12} />
            </div>
            <Skeleton width="100%" height={16} />
          </div>
        </JellyCard>
      ))}
    </div>
  );
}

/**
 * GalleryListSkeleton - Skeleton for the list view
 */
function GalleryListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <JellyCard key={i} className="glass-card p-4 flex gap-4 border border-white/5">
          <Skeleton width={80} height={80} className="rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="flex gap-2">
              <Skeleton width={60} height={16} className="rounded-full" />
              <Skeleton width={40} height={12} />
            </div>
            <Skeleton width="40%" height={18} />
            <Skeleton width="90%" height={12} />
          </div>
        </JellyCard>
      ))}
    </div>
  );
}

/**
 * GalleryTableSkeleton - Skeleton for the table view
 */
function GalleryTableSkeleton() {
  return (
    <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
      <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} width={80} height={12} />)}
      </div>
      <div className="divide-y divide-white/5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-4">
            <Skeleton width={40} height={40} className="rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton width="30%" height={14} />
              <Skeleton width="20%" height={10} />
            </div>
            <Skeleton width={60} height={16} className="rounded-full" />
            <Skeleton width={80} height={14} />
            <Skeleton width={60} height={14} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * GallerySkeleton
 * Loading layout for the gallery grid page
 */
export function GallerySkeleton() {
  const preferences = usePreferencesStore();
  const mode = preferences.galleryViewMode;

  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto px-3 py-4 md:px-6 md:py-6 space-y-4 md:space-y-6 animate-fade-in">
        
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
          <div className="space-y-2">
            <Skeleton width={180} height={28} />
            <Skeleton width={200} height={14} />
          </div>
          <div className="flex items-center gap-2">
             <Skeleton width={120} height={36} className="rounded-lg" />
             <Skeleton width={150} height={36} className="rounded-lg" />
          </div>
        </div>

        {/* Filter Toolbar Skeleton */}
        <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={90} height={32} className="rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Mode-Aware Content Skeleton */}
        {mode === 'grid' ? (
          <GalleryGridSkeleton />
        ) : mode === 'list' ? (
          <GalleryListSkeleton />
        ) : (
          <GalleryTableSkeleton />
        )}
      </div>
    </div>
  );
}
