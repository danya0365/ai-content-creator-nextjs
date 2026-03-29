'use client';

import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { JellyCard } from '../ui/JellyCard';

/**
 * GallerySkeleton
 * Loading layout for the gallery grid page
 */
export function GallerySkeleton() {
  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8 animate-fade-in">
        
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Skeleton width={300} height={36} />
            <Skeleton width={180} height={16} />
          </div>
          <div className="flex items-center gap-3">
             <Skeleton width={100} height={40} className="rounded-xl" />
             <Skeleton width={100} height={40} className="rounded-xl" />
          </div>
        </div>

        {/* Filter Toolbar Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 glass-card rounded-2xl border border-white/5">
           <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
             {[1, 2, 3, 4, 5].map((i) => (
               <Skeleton key={i} width={100} height={36} className="rounded-xl flex-shrink-0" />
             ))}
           </div>
           <div className="flex gap-2 w-full md:w-auto">
             <Skeleton width="100%" height={40} className="md:w-48 rounded-xl" />
             <Skeleton width={40} height={40} className="rounded-xl" />
           </div>
        </div>

        {/* Gallery Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <JellyCard key={i} className="glass-card overflow-hidden group border border-white/5 space-y-4 p-0">
               {/* Image placeholder */}
               <Skeleton width="100%" height={240} className="rounded-none" />
               
               {/* Content placeholder */}
               <div className="p-4 space-y-3">
                 <div className="flex justify-between items-center">
                   <Skeleton width="60%" height={20} />
                   <Skeleton width={24} height={24} className="rounded-full" />
                 </div>
                 <Skeleton width="100%" height={14} />
                 <Skeleton width="80%" height={14} />
                 
                 <div className="pt-2 flex justify-between items-center border-t border-white/5">
                   <Skeleton width={80} height={12} />
                   <div className="flex gap-2">
                     <Skeleton width={30} height={12} />
                     <Skeleton width={30} height={12} />
                   </div>
                 </div>
               </div>
            </JellyCard>
          ))}
        </div>
      </div>
    </div>
  );
}
