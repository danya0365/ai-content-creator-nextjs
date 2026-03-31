'use client';

import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { JellyCard } from '../ui/JellyCard';

/**
 * TrendsSkeleton
 * Premium loading layout for the Trends dashboard
 */
export function TrendsSkeleton() {
  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-8 space-y-12 animate-fade-in">
        
        {/* Header Section Skeleton */}
        <div className="text-center max-w-2xl mx-auto space-y-6 mb-12">
           <div className="flex justify-center">
              <div className="relative">
                <Skeleton width={80} height={80} className="rounded-2xl" />
                <div className="absolute -inset-2 rounded-2xl border-2 border-violet-500/20 border-t-transparent animate-spin" />
              </div>
           </div>
           <div className="space-y-4">
              <Skeleton width={380} height={48} className="mx-auto rounded-xl" />
              <div className="space-y-2">
                <Skeleton width="95%" height={16} className="mx-auto" />
                <Skeleton width="65%" height={16} className="mx-auto" />
              </div>
           </div>
           <div className="flex justify-center gap-3 pt-4">
              <Skeleton width={140} height={44} className="rounded-full" />
              <Skeleton width={110} height={44} className="rounded-full" />
           </div>
        </div>

        {/* Categories Bar Skeleton */}
        <div className="flex gap-2 pb-6 overflow-hidden">
           {[...Array(6)].map((_, i) => (
              <Skeleton key={i} width={100} height={38} className="rounded-full flex-shrink-0" />
           ))}
        </div>

        {/* Grid of Trends Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
           {[...Array(8)].map((_, i) => (
              <JellyCard key={i} className="group relative h-[420px] overflow-hidden glass-card flex flex-col p-0 border border-white/5 transition-all duration-300">
                 {/* Image Placeholder */}
                 <div className="relative h-48 bg-white/5 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                       <span className="text-6xl">✨</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4">
                       <Skeleton width={90} height={30} className="rounded-full" />
                    </div>
                    <div className="absolute top-4 right-4">
                       <Skeleton width={36} height={36} className="rounded-xl" />
                    </div>
                 </div>

                 {/* Content Area Skeleton */}
                 <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                       <div className="flex items-center gap-2">
                          <Skeleton width={16} height={16} className="rounded-full" />
                          <Skeleton width={80} height={12} />
                       </div>
                       <div className="space-y-2">
                          <Skeleton width="100%" height={24} />
                          <Skeleton width="70%" height={24} />
                       </div>
                       <div className="space-y-1.5 pt-2">
                          <Skeleton width="100%" height={12} />
                          <Skeleton width="100%" height={12} />
                          <Skeleton width="40%" height={12} />
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="flex items-center justify-between text-xs pt-2">
                          <Skeleton width={100} height={12} />
                          <Skeleton width={60} height={12} />
                       </div>
                       <Skeleton width="100%" height={48} className="rounded-2xl" />
                    </div>
                 </div>
              </JellyCard>
           ))}
        </div>
      </div>
    </div>
  );
}
