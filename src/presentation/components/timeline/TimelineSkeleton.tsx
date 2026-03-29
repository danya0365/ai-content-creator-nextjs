'use client';

import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { JellyCard } from '../ui/JellyCard';

/**
 * TimelineSkeleton
 * Loading layout for the timeline view
 */
export function TimelineSkeleton() {
  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-12 animate-fade-in relative">
        
        {/* Central timeline line skeleton */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500/10 via-fuchsia-500/10 to-purple-500/10 transform -translate-x-1/2" />

        {/* Header Skeleton */}
        <div className="space-y-4 relative z-10 text-center md:text-left">
           <Skeleton width={200} height={36} className="mx-auto md:mx-0" />
           <Skeleton width={300} height={16} className="mx-auto md:mx-0" />
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
             {[1, 2, 3, 4].map((i) => (
                <JellyCard key={i} className="glass-card p-4 flex items-center gap-3">
                   <Skeleton width={40} height={40} className="rounded-xl flex-shrink-0" />
                   <div className="flex-1 space-y-1">
                      <Skeleton width="40%" height={16} />
                      <Skeleton width="80%" height={12} />
                   </div>
                </JellyCard>
             ))}
           </div>
        </div>

        {/* Filter Toolbar Skeleton */}
        <div className="space-y-4 relative z-10">
           <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} width={110} height={36} className="rounded-xl" />
              ))}
           </div>
           <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} width={130} height={32} className="rounded-xl shadow-sm" />
              ))}
           </div>
        </div>

        {/* Timeline Items Skeleton */}
        <div className="space-y-12 relative z-10">
          {[1, 2].map((groupIndex) => (
            <div key={groupIndex} className="space-y-10">
              {/* Date Header Skeleton */}
              <div className="flex justify-center mb-8">
                 <Skeleton width={200} height={48} className="rounded-2xl" />
              </div>

              {/* Items in group */}
              {[1, 2].map((itemIndex) => {
                const isLeft = (groupIndex + itemIndex) % 2 === 0;
                return (
                  <div key={itemIndex} className={`flex items-center gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Card Skeleton */}
                    <div className="flex-1 max-w-md">
                       <JellyCard className="glass-card p-6 space-y-4 rounded-3xl border border-white/5">
                          <div className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                               <Skeleton width={32} height={32} className="rounded-lg" />
                               <Skeleton width={80} height={12} />
                             </div>
                             <Skeleton width={70} height={20} className="rounded-full" />
                          </div>
                          <Skeleton width="100%" height={24} />
                          <Skeleton width="100%" height={220} className="rounded-2xl shadow-inner shadow-white/5" />
                          <div className="space-y-2">
                             <Skeleton width="100%" height={14} />
                             <Skeleton width="80%" height={14} />
                          </div>
                          <div className="flex justify-between items-center pt-2">
                             <Skeleton width={50} height={12} />
                             <div className="flex gap-3">
                                <Skeleton width={30} height={12} />
                                <Skeleton width={30} height={12} />
                             </div>
                          </div>
                       </JellyCard>
                    </div>

                    {/* Timeline dot Skeleton */}
                    <div className="relative flex-shrink-0">
                      <Skeleton width={16} height={16} className="rounded-full bg-white/20" />
                    </div>

                    {/* Vertical Spacer for opposite side */}
                    <div className="flex-1 max-w-md" />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
