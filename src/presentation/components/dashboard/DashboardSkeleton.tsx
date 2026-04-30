'use client';

import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { JellyCard } from '../ui/JellyCard';

/**
 * DashboardSkeleton
 * Loading layout for the main dashboard
 */
export function DashboardSkeleton() {
  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
        
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Skeleton width={300} height={36} className="rounded-lg" />
            <Skeleton width={200} height={16} />
          </div>
          <div className="flex gap-3">
             <Skeleton width={130} height={42} className="rounded-xl" />
             <Skeleton width={130} height={42} className="rounded-xl bg-violet-500/10" />
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <JellyCard key={i} className="glass-card p-5 flex items-center gap-4 border border-white/5">
              <Skeleton width={48} height={48} className="rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton width="40%" height={12} />
                <Skeleton width="80%" height={24} />
              </div>
            </JellyCard>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart Section */}
          <JellyCard className="lg:col-span-2 glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton width={200} height={24} />
              <div className="flex gap-2">
                <Skeleton width={60} height={28} className="rounded-lg" />
                <Skeleton width={60} height={28} className="rounded-lg" />
              </div>
            </div>
            
            {/* Chart Area placeholder */}
            <div className="relative h-[300px] flex items-end gap-3 px-2">
              {[...Array(12)].map((_, i) => (
                <Skeleton 
                  key={i} 
                  width="100%" 
                  height={`${20 + Math.random() * 60}%`} 
                  className="rounded-t-lg opacity-40" 
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton width="50%" height={12} />
                  <Skeleton width="80%" height={20} />
                </div>
              ))}
            </div>
          </JellyCard>

          {/* Sidebar / Activity Feed */}
          <JellyCard className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton width={150} height={24} />
              <Skeleton width={40} height={12} />
            </div>
            
            <div className="space-y-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton width={40} height={40} className="rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <Skeleton width="90%" height={14} />
                    <Skeleton width="40%" height={10} />
                  </div>
                </div>
              ))}
            </div>

            <Skeleton width="100%" height={40} className="rounded-xl mt-4" />
          </JellyCard>
        </div>

        {/* Bottom Section: Recent Content */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
             <Skeleton width={200} height={24} />
             <Skeleton width={100} height={16} />
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
             {[1, 2, 3, 4, 5, 6].map((i) => (
                <JellyCard key={i} className="glass-card-hover p-2 space-y-3 aspect-[3/4] flex flex-col">
                   <Skeleton width="100%" height="70%" className="rounded-xl" />
                   <div className="space-y-2 px-1">
                      <Skeleton width="90%" height={12} />
                      <Skeleton width="40%" height={10} />
                   </div>
                </JellyCard>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
