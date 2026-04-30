'use client';

import {
    TIMELINE_CATEGORIES,
    TimelineEntry,
    TimelineFilter,
    TimelineGroup,
    TimelineStatusFilter,
    TimelineViewModel,
} from '@/src/presentation/presenters/timeline/TimelinePresenter';
import { useTimelinePresenter, TimelineViewMode } from '@/src/presentation/presenters/timeline/useTimelinePresenter';
import { animated, config, useSpring } from '@react-spring/web';
import { JellyButton } from '../ui/JellyButton';
import { JellyCard } from '../ui/JellyCard';
import { SmartImage } from '../ui/SmartImage';
import { ContentDetailModal } from '../shared/ContentDetailModal';
import { TimelineSkeleton } from './TimelineSkeleton';
import { LoadMoreButton } from '../ui/LoadMoreButton';
import React from 'react';

/**
 * FilterButton Sub-component
 */
interface FilterButtonProps {
  label: string;
  emoji?: string;
  isActive: boolean;
  onClick: () => void;
}

function FilterButton({ label, emoji, isActive, onClick }: FilterButtonProps) {
  return (
    <JellyButton
      onClick={onClick}
      variant={isActive ? 'primary' : 'secondary'}
      size="sm"
    >
      {emoji && <span>{emoji}</span>}
      {label}
    </JellyButton>
  );
}

/**
 * StatusBadge Sub-component
 */
interface StatusBadgeProps {
  status: 'published' | 'scheduled' | 'draft';
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles = {
    published: 'bg-green-500/20 text-green-400 border-green-500/30',
    scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const statusLabels = {
    published: 'Published',
    scheduled: 'Scheduled',
    draft: 'Draft',
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

/**
 * TimelineCard Sub-component
 */
interface TimelineCardProps {
  entry: TimelineEntry;
  isLeft: boolean;
  onClick: (entry: TimelineEntry) => void;
}

function TimelineCard({ entry, isLeft, onClick }: TimelineCardProps) {
  const categoryConfig = TIMELINE_CATEGORIES[entry.category];
  
  const time = new Date(entry.createdAt).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex items-center gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'} animate-fade-in`}>
      {/* Card */}
      <JellyCard 
        className="flex-1 glass-card-hover p-5 rounded-2xl group max-w-md cursor-pointer border border-transparent hover:border-violet-500/30 transition-all"
        onClick={() => onClick(entry)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${categoryConfig.color} flex items-center justify-center text-white text-sm`}>
              {categoryConfig.emoji}
            </span>
            <span className="text-xs text-muted">{categoryConfig.labelTh}</span>
          </div>
          <StatusBadge status={entry.status} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-violet-400 transition-colors line-clamp-2">
          {entry.title}
        </h3>

        {/* Image */}
        {entry.imageUrl && (
          <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 mb-4 flex items-center justify-center overflow-hidden relative">
            <SmartImage
              src={entry.imageUrl}
              alt={entry.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 400px"
              emojiClassName="text-4xl"
              containerClassName="w-full h-full flex items-center justify-center absolute inset-0"
            />
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted mb-4 line-clamp-2">
          {entry.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">{time}</span>
          
          {entry.status === 'published' && (
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1">
                <span>❤️</span>
                <span>{entry.likes.toLocaleString()}</span>
              </span>
              <span className="flex items-center gap-1">
                <span>🔗</span>
                <span>{entry.shares.toLocaleString()}</span>
              </span>
            </div>
          )}
        </div>
      </JellyCard>

      {/* Timeline dot */}
      <div className="relative flex-shrink-0">
        <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${categoryConfig.color} shadow-lg shadow-violet-500/30 z-10 relative`}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 animate-ping opacity-20" />
        </div>
      </div>

      {/* Spacer for opposite side */}
      <div className="flex-1 max-w-md" />
    </div>
  );
}

/**
 * TimelineDateHeader Component
 */
function TimelineDateHeader({ group }: { group: TimelineGroup }) {
  return (
    <div className="flex justify-center my-6 animate-fade-in relative z-10">
      <JellyCard className={`px-6 py-3 rounded-2xl font-semibold flex items-center gap-3 ${
        group.isToday
          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/25'
          : group.isYesterday
          ? 'glass-card text-violet-400 border border-violet-500/30'
          : 'glass-card text-foreground'
      }`}>
        {group.isToday && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
        <span>{group.dateLabel}</span>
        <span className="text-sm opacity-60">({group.entries.length} รายการ)</span>
      </JellyCard>
    </div>
  );
}

/**
 * ViewModeToggle Component
 */
function ViewModeToggle({ mode, onChange }: { mode: TimelineViewMode; onChange: (mode: TimelineViewMode) => void }) {
  return (
    <div className="flex gap-1 p-1 glass-card rounded-lg self-end">
      <button
        onClick={() => onChange('vertical')}
        className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1 ${
          mode === 'vertical'
            ? 'bg-violet-600 text-white shadow-md'
            : 'text-muted hover:text-foreground hover:bg-white/5'
        }`}
      >
        <span>⇅</span> Vertical
      </button>
      <button
        onClick={() => onChange('list')}
        className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1 ${
          mode === 'list'
            ? 'bg-violet-600 text-white shadow-md'
            : 'text-muted hover:text-foreground hover:bg-white/5'
        }`}
      >
        <span>☰</span> List
      </button>
    </div>
  );
}

/**
 * TimelineListView Sub-component
 */
function TimelineListView({ groups, onClick }: { groups: TimelineGroup[]; onClick: (e: TimelineEntry) => void }) {
  return (
    <div className="space-y-8 animate-fade-in">
      {groups.map((group) => (
        <div key={group.date} className="space-y-4">
          <div className="flex items-center gap-4 text-xs font-bold text-muted uppercase tracking-widest pl-2">
            <span>{group.dateLabel}</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="grid gap-3">
            {group.entries.map((entry) => (
              <JellyCard 
                key={entry.id}
                onClick={() => onClick(entry)}
                className="glass-card-hover p-4 group flex items-center gap-4 border border-white/5"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden relative flex-shrink-0">
                  <SmartImage src={entry.imageUrl} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-violet-400 transition-colors">
                    {entry.title}
                  </h4>
                  <p className="text-xs text-muted truncate">{entry.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                   <div className="text-[10px] uppercase font-bold text-violet-400/60 mb-1">
                     {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </div>
                   <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter
                    ${entry.status === 'published' ? 'bg-green-500/20 text-green-400' :
                      entry.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'}
                  `}>
                    {entry.status}
                  </span>
                </div>
              </JellyCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * StatsCard Sub-component
 */
interface StatsCardProps {
  icon: string;
  label: string;
  value: number;
  color: string;
  delay: number;
}

function StatsCard({ icon, label, value, color, delay }: StatsCardProps) {
  const spring = useSpring({
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 1, scale: 1 },
    delay,
    config: config.gentle,
  });

  return (
    <animated.div style={spring}>
      <JellyCard className="glass-card p-4 flex items-center gap-3">
        <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg`}>
          {icon}
        </span>
        <div>
          <div className="text-xl font-bold text-foreground">{value.toLocaleString()}</div>
          <div className="text-xs text-muted">{label}</div>
        </div>
      </JellyCard>
    </animated.div>
  );
}

interface TimelineViewProps {
  initialViewModel?: TimelineViewModel;
}

/**
 * TimelineView component
 */
export function TimelineView({ initialViewModel }: TimelineViewProps) {
  const [state, actions] = useTimelinePresenter(initialViewModel);
  
  const viewModel = state.viewModel || {
    groups: [],
    categories: [],
    filter: 'all' as TimelineFilter,
    statusFilter: 'all' as TimelineStatusFilter,
    totalCount: 0,
    stats: {
      total: 0,
      published: 0,
      scheduled: 0,
      draft: 0,
      totalLikes: 0,
      totalShares: 0,
      totalComments: 0,
    },
  };

  const headerSpring = useSpring({
    from: { opacity: 0, y: -20 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  if (state.loading && !state.viewModel) {
    return <TimelineSkeleton />;
  }

  if (state.error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{state.error}</p>
          <JellyButton onClick={actions.refresh} variant="primary">
            ลองใหม่
          </JellyButton>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full overflow-auto scrollbar-thin">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
          
          {/* Header */}
          <animated.div style={headerSpring} className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold gradient-text-purple">Timeline</h1>
                <p className="text-sm text-muted">
                  ประวัติคอนเทนต์ทั้งหมด {viewModel.stats.total} รายการ
                </p>
              </div>
              <ViewModeToggle mode={state.viewMode} onChange={actions.setViewMode} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard
                icon="📝"
                label="คอนเทนต์ทั้งหมด"
                value={viewModel.stats.total}
                color="from-violet-500 to-fuchsia-500"
                delay={100}
              />
              <StatsCard
                icon="❤️"
                label="ยอดไลค์รวม"
                value={viewModel.stats.totalLikes}
                color="from-pink-500 to-rose-500"
                delay={200}
              />
              <StatsCard
                icon="🔗"
                label="ยอดแชร์รวม"
                value={viewModel.stats.totalShares}
                color="from-blue-500 to-cyan-500"
                delay={300}
              />
              <StatsCard
                icon="💬"
                label="ยอดคอมเมนต์"
                value={viewModel.stats.totalComments}
                color="from-emerald-500 to-teal-500"
                delay={400}
              />
            </div>
          </animated.div>

          {/* Filters */}
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <FilterButton
                label="ทั้งหมด"
                emoji="📋"
                isActive={state.filter === 'all'}
                onClick={() => actions.setFilter('all')}
              />
              {viewModel.categories.map((cat) => (
                <FilterButton
                  key={cat.id}
                  label={cat.labelTh}
                  emoji={cat.emoji}
                  isActive={state.filter === cat.id}
                  onClick={() => actions.setFilter(cat.id)}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <FilterButton
                label="ทุกสถานะ"
                isActive={state.statusFilter === 'all'}
                onClick={() => actions.setStatusFilter('all')}
              />
              <FilterButton
                label="Published"
                emoji="✅"
                isActive={state.statusFilter === 'published'}
                onClick={() => actions.setStatusFilter('published')}
              />
              <FilterButton
                label="Scheduled"
                emoji="📅"
                isActive={state.statusFilter === 'scheduled'}
                onClick={() => actions.setStatusFilter('scheduled')}
              />
              <FilterButton
                label="Draft"
                emoji="📝"
                isActive={state.statusFilter === 'draft'}
                onClick={() => actions.setStatusFilter('draft')}
              />
            </div>
          </div>

          <div className="text-sm text-muted">
            แสดง {state.filteredCount} รายการ
          </div>

          {/* Timeline View */}
          {state.filteredGroups.length > 0 ? (
            state.viewMode === 'vertical' ? (
              <div className="relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 via-fuchsia-500 to-purple-500 opacity-30 transform -translate-x-1/2" />
                <div className="space-y-4 relative">
                  {state.filteredGroups.map((group) => (
                    <div key={group.date}>
                      <TimelineDateHeader group={group} />
                      {group.entries.map((entry, entryIndex) => (
                        <TimelineCard
                          key={entry.id}
                          entry={entry}
                          isLeft={entryIndex % 2 === 0}
                          onClick={actions.viewEntry}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                <LoadMoreButton 
                  onClick={actions.loadMore}
                  loading={state.loadingMore}
                  hasMore={state.hasMore}
                />
              </div>
            ) : (
              <div className="space-y-8">
                <TimelineListView 
                  groups={state.filteredGroups} 
                  onClick={actions.viewEntry}
                />
                <LoadMoreButton 
                  onClick={actions.loadMore}
                  loading={state.loadingMore}
                  hasMore={state.hasMore}
                />
              </div>
            )
          ) : (
            <JellyCard className="glass-card p-12 text-center">
              <span className="text-5xl mb-4 block">🔍</span>
              <h3 className="text-lg font-semibold text-foreground mb-2">ไม่พบคอนเทนต์</h3>
              <p className="text-muted mb-4">ลองปรับ filter เพื่อดูคอนเทนต์อื่น</p>
              <JellyButton
                onClick={actions.resetFilters}
                variant="primary"
              >
                ดูทั้งหมด
              </JellyButton>
            </JellyCard>
          )}
        </div>
      </div>

      {state.selectedEntry && (
        <ContentDetailModal
          content={state.selectedEntry}
          onClose={actions.closeEntry}
        />
      )}
    </>
  );
}
