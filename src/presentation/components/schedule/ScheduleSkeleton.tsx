'use client';

import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { JellyCard } from '../ui/JellyCard';

/**
 * ScheduleSkeleton
 * Premium loading layout for the Schedule dashboard
 */
export function ScheduleSkeleton() {
  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10 animate-fade-in">
        
        {/* Header Section Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Skeleton width={320} height={40} className="rounded-xl" />
            <Skeleton width={210} height={16} />
          </div>
          <div className="flex gap-2">
             <Skeleton width={120} height={42} className="rounded-xl" />
             <Skeleton width={120} height={42} className="rounded-xl" />
          </div>
        </div>

        {/* Global Controls Skeleton */}
        <div className="flex items-center gap-4 p-4 glass-card border border-white/5 rounded-2xl">
          <Skeleton width={140} height={20} className="rounded-md" />
          <div className="h-4 w-px bg-white/10" />
          <div className="flex-1 flex gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} width={100} height={32} className="rounded-lg" />
            ))}
          </div>
          <Skeleton width={100} height={32} className="rounded-lg" />
        </div>

        {/* Schedule Grid / List Skeleton */}
        <div className="space-y-12">
          {[...Array(3)].map((_, groupIdx) => (
            <div key={groupIdx} className="space-y-6">
              {/* Date Header Skeleton */}
              <div className="flex items-center gap-4">
                 <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/5">
                    <Skeleton width={24} height={18} />
                    <Skeleton width={18} height={12} className="mt-1" />
                 </div>
                 <div className="space-y-2">
                    <Skeleton width={180} height={24} />
                    <Skeleton width={100} height={14} />
                 </div>
                 <div className="h-px flex-1 bg-white/5 ml-4" />
              </div>

              {/* Items for this date */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[...Array(groupIdx === 0 ? 3 : 2)].map((_, i) => (
                    <JellyCard key={i} className="glass-card-hover p-4 flex gap-4 items-start relative border border-white/5 transition-all duration-300">
                       {/* Time Indicator Skeleton */}
                       <div className="flex flex-col items-center gap-2 pt-1">
                          <Skeleton width={40} height={16} className="rounded-md" />
                          <div className="w-0.5 flex-1 bg-violet-500/20 rounded-full" />
                       </div>
                       
                       {/* Card Content Skeleton */}
                       <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                <Skeleton width={20} height={20} className="rounded-md" />
                                <Skeleton width={80} height={12} />
                             </div>
                             <Skeleton width={12} height={12} className="rounded-full" />
                          </div>
                          <div className="space-y-2">
                             <Skeleton width="100%" height={18} />
                             <Skeleton width="60%" height={18} />
                          </div>
                          
                          <Skeleton width="100%" height={120} className="rounded-xl opacity-30" />
                          
                          <div className="flex justify-between pt-2">
                             <div className="flex gap-3">
                                <Skeleton width={50} height={14} />
                                <Skeleton width={50} height={14} />
                             </div>
                             <Skeleton width={20} height={20} className="rounded-md" />
                          </div>
                       </div>
                    </JellyCard>
                 ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
