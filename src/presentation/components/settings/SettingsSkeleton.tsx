'use client';

import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { JellyCard } from '../ui/JellyCard';

/**
 * SettingsSkeleton
 * Loading layout for the settings/profile page
 */
export function SettingsSkeleton() {
  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6 animate-fade-in">
        
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton width={150} height={32} />
            <Skeleton width={200} height={16} />
          </div>
          <Skeleton width={100} height={48} className="rounded-2xl" />
        </div>

        {/* Profile Card Skeleton */}
        <JellyCard className="glass-card p-6">
           <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
              <Skeleton width={96} height={96} className="rounded-full shadow-lg" />
              <div className="flex-1 space-y-4">
                 <div className="space-y-2">
                    <Skeleton width={180} height={24} className="mx-auto sm:mx-0" />
                    <Skeleton width={220} height={14} className="mx-auto sm:mx-0" />
                    <Skeleton width={280} height={12} className="mx-auto sm:mx-0" />
                 </div>
                 
                 <div className="flex gap-4 justify-center sm:justify-start">
                    {[1, 2, 3, 4].map((i) => (
                       <div key={i} className="text-center space-y-1">
                          <Skeleton width={40} height={20} className="mx-auto" />
                          <Skeleton width={60} height={10} className="mx-auto" />
                       </div>
                    ))}
                 </div>
              </div>
              <Skeleton width={80} height={32} className="rounded-xl" />
           </div>
        </JellyCard>

        {/* Settings Sections Skeleton */}
        {[1, 2, 3, 4, 5].map((sectionIndex) => (
          <JellyCard key={sectionIndex} className="glass-card p-5 space-y-6">
             <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                <Skeleton width={24} height={24} className="rounded-lg" />
                <Skeleton width={150} height={24} />
             </div>
             
             <div className="space-y-6">
                {[1, 2].map((rowIndex) => (
                  <div key={rowIndex} className="flex items-center justify-between gap-4">
                     <div className="flex-1 space-y-2">
                        <Skeleton width="40%" height={16} />
                        <Skeleton width="70%" height={12} />
                     </div>
                     <Skeleton width={48} height={24} className="rounded-full" />
                  </div>
                ))}
             </div>
          </JellyCard>
        ))}
      </div>
    </div>
  );
}
