'use client';

import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { JellyCard } from '../ui/JellyCard';

/**
 * ContentDetailSkeleton
 * Premium loading layout for the Content Detail view with glassmorphism styles
 */
export function ContentDetailSkeleton() {
  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12 animate-fade-in">
        
        {/* Navigation / Actions Bar Skeleton */}
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <Skeleton width={120} height={40} className="rounded-xl" />
          <div className="flex gap-3">
             <Skeleton width={42} height={42} className="rounded-xl" />
             <Skeleton width={42} height={42} className="rounded-xl" />
             <Skeleton width={100} height={42} className="rounded-xl" />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Side: Visual Preview Skeleton */}
          <div className="lg:col-span-7 space-y-6">
            <JellyCard className="glass-card aspect-square w-full rounded-2xl border border-white/5 overflow-hidden p-1">
               <div className="relative h-full w-full bg-white/5 flex items-center justify-center opacity-20">
                  <span className="text-8xl">✨</span>
               </div>
            </JellyCard>
            
            {/* Visual Metadata Skeleton */}
            <div className="grid grid-cols-4 gap-4">
               {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} width="100%" height={80} className="rounded-xl" />
               ))}
            </div>
          </div>

          {/* Right Side: Data & Stats Skeleton */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex gap-2">
                 <Skeleton width={100} height={24} className="rounded-full" />
                 <Skeleton width={80} height={24} className="rounded-full" />
              </div>
              <Skeleton width="100%" height={40} className="rounded-lg" />
              <div className="space-y-2">
                 <Skeleton width="30%" height={14} />
                 <Skeleton width="20%" height={12} />
              </div>
            </div>

            {/* Platform Stats Skeleton */}
            <div className="grid grid-cols-2 gap-4">
               {[...Array(4)].map((_, i) => (
                  <JellyCard key={i} className="glass-card p-4 space-y-2 border border-white/5">
                     <Skeleton width={32} height={32} className="rounded-lg" />
                     <Skeleton width="60%" height={24} />
                     <Skeleton width="40%" height={12} />
                  </JellyCard>
               ))}
            </div>

            {/* Description Skeleton */}
            <JellyCard className="glass-card p-6 space-y-4 border border-white/5 bg-white/5">
               <Skeleton width={140} height={20} />
               <div className="space-y-3">
                  <Skeleton width="100%" height={14} />
                  <Skeleton width="100%" height={14} />
                  <Skeleton width="90%" height={14} />
                  <Skeleton width="40%" height={14} />
               </div>
            </JellyCard>

            {/* Prompt Section Skeleton */}
            <JellyCard className="glass-card p-6 space-y-4 border border-white/5 border-dashed">
               <div className="flex items-center gap-2">
                  <Skeleton width={20} height={20} className="rounded-md" />
                  <Skeleton width={100} height={16} />
               </div>
               <div className="space-y-2">
                  <Skeleton width="100%" height={12} />
                  <Skeleton width="80%" height={12} />
               </div>
            </JellyCard>
          </div>
        </div>

        {/* Metrics Row Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/5">
           {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                 <Skeleton width={130} height={16} />
                 <Skeleton width="100%" height={200} className="rounded-2xl opacity-20" />
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}
