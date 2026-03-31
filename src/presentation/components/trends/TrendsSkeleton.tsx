'use client';

import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { JellyCard } from '../ui/JellyCard';

/**
 * TrendsSkeleton
 * Loading layout for the Trends dashboard
 */
export function TrendsSkeleton() {
  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-8 space-y-12 animate-fade-in">
        
        {/* Header Section Skeleton */}
        <div className="text-center max-w-2xl mx-auto space-y-6 mb-12">
           <div className="flex justify-center">
              <Skeleton width={64} height={64} className="rounded-2xl" />
           </div>
           <div className="space-y-3">
              <Skeleton width={300} height={42} className="mx-auto" />
              <Skeleton width="90%" height={16} className="mx-auto" />
              <Skeleton width="60%" height={16} className="mx-auto" />
           </div>
        </div>

        {/* Grid of Trends Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
           {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <JellyCard key={i} className="group relative h-80 overflow-hidden glass-card flex flex-col justify-end p-0 border border-white/5">
                 {/* Traffic Badge Placeholder */}
                 <div className="absolute top-4 left-4">
                    <Skeleton width={80} height={28} className="rounded-full flex-shrink-0" />
                 </div>
                 
                 {/* Source Placeholder */}
                 <div className="absolute top-4 right-4">
                    <Skeleton width={60} height={12} className="rounded-sm" />
                 </div>

                 {/* Content Area Skeleton */}
                 <div className="relative z-10 p-5 space-y-4">
                    <div className="space-y-2">
                       <Skeleton width="90%" height={24} />
                       <Skeleton width="60%" height={24} />
                    </div>
                    
                    <div className="space-y-2">
                       <Skeleton width="100%" height={12} />
                       <Skeleton width="100%" height={12} />
                       <Skeleton width="80%" height={12} />
                    </div>
                    
                    <Skeleton width="100%" height={40} className="rounded-xl mt-4" />
                 </div>
              </JellyCard>
           ))}
        </div>
      </div>
    </div>
  );
}
