'use client';

import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { JellyCard } from '../ui/JellyCard';

/**
 * ContentDetailSkeleton
 * Loading layout for the content detail page (/content/[id])
 */
export function ContentDetailSkeleton() {
  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="max-w-6xl mx-auto px-6 py-6 animate-fade-in">
        
        {/* Breadcrumb Skeleton */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton width={60} height={14} />
            <Skeleton width={10} height={14} />
            <Skeleton width={140} height={14} />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton width={32} height={32} className="rounded-lg" />
              <div className="space-y-2">
                <Skeleton width={200} height={24} />
                <Skeleton width={100} height={14} />
              </div>
            </div>

            <div className="flex gap-2">
              <Skeleton width={80} height={40} className="rounded-xl" />
              <Skeleton width={100} height={40} className="rounded-xl" />
            </div>
          </div>
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Preview Placeholder */}
            <JellyCard className="glass-card p-0 overflow-hidden border border-white/5 shadow-inner shadow-white/5">
              <Skeleton width="100%" height={0} className="pb-[56.25%]" />
              
              {/* Status Bar Placeholder */}
              <div className="p-4 flex items-center justify-between border-t border-white/5 bg-white/5">
                <div className="flex items-center gap-3">
                  <Skeleton width={100} height={28} className="rounded-full" />
                  <Skeleton width={120} height={12} />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton width={40} height={14} />
                  <Skeleton width={40} height={14} />
                </div>
              </div>
            </JellyCard>

            {/* Description Placeholder */}
            <JellyCard className="glass-card p-5 space-y-3">
               <Skeleton width={130} height={20} />
               <div className="space-y-2 pt-2">
                  <Skeleton width="100%" height={14} />
                  <Skeleton width="100%" height={14} />
                  <Skeleton width="80%" height={14} />
               </div>
            </JellyCard>

            {/* AI Prompt Placeholder */}
            <JellyCard className="glass-card p-5 space-y-3">
               <Skeleton width={110} height={20} />
               <Skeleton width="100%" height={80} className="rounded-xl" />
            </JellyCard>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Engagement Stats Placeholder */}
            <JellyCard className="glass-card p-5 space-y-4">
              <Skeleton width={120} height={20} />
              <div className="flex justify-center p-4">
                 <Skeleton width={160} height={160} className="rounded-full" />
              </div>
              <div className="space-y-3">
                 {[1, 2, 3].map((i) => (
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

            {/* Performance Placeholder */}
            <JellyCard className="glass-card p-5 space-y-6">
               <Skeleton width={130} height={20} />
               {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex justify-between text-xs mb-1">
                        <Skeleton width={100} height={10} />
                        <Skeleton width={40} height={10} />
                     </div>
                     <Skeleton width="100%" height={8} className="rounded-full" />
                  </div>
               ))}
            </JellyCard>

            {/* Quick Actions Placeholder */}
            <JellyCard className="glass-card p-5 space-y-4">
              <Skeleton width={120} height={20} />
              <div className="space-y-2">
                {[1, 2].map((i) => (
                   <Skeleton key={i} width="100%" height={40} className="rounded-xl" />
                ))}
                <Skeleton width="100%" height={40} className="rounded-xl opacity-50" />
              </div>
            </JellyCard>
          </div>
        </div>
      </div>
    </div>
  );
}
