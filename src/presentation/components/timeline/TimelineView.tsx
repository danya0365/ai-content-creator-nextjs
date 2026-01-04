'use client';

import {
  TIMELINE_CATEGORIES,
  TimelineEntry
} from '@/src/data/mock/mockTimeline';
import {
  TimelineFilter,
  TimelineGroup,
  TimelineStatusFilter,
  TimelineViewModel,
} from '@/src/presentation/presenters/timeline/TimelinePresenter';
import { animated, config, useSpring } from '@react-spring/web';
import { useMemo, useState } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { JellyButton } from '../ui/JellyButton';
import { JellyCard } from '../ui/JellyCard';

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

interface TimelineCardProps {
  entry: TimelineEntry;
  isLeft: boolean;
}

function TimelineCard({ entry, isLeft }: TimelineCardProps) {
  const categoryConfig = TIMELINE_CATEGORIES[entry.category];
  
  const time = new Date(entry.createdAt).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex items-center gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'} animate-fade-in`}>
      {/* Card */}
      <JellyCard className="flex-1 glass-card-hover p-5 rounded-2xl group max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${categoryConfig.color} flex items-center justify-center text-white text-sm`}>
              {entry.emoji}
            </span>
            <span className="text-xs text-muted">{categoryConfig.labelTh}</span>
          </div>
          <StatusBadge status={entry.status} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-violet-400 transition-colors line-clamp-2">
          {entry.title}
        </h3>

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
              <span className="flex items-center gap-1">
                <span>💬</span>
                <span>{entry.comments.toLocaleString()}</span>
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/30">
            {entry.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full bg-violet-500/10 text-violet-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
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

interface TimelineDateHeaderProps {
  group: TimelineGroup;
}

function TimelineDateHeader({ group }: TimelineDateHeaderProps) {
  return (
    <div className="flex justify-center my-6 animate-fade-in">
      <JellyCard className={`px-6 py-3 rounded-2xl font-semibold flex items-center gap-3 ${
        group.isToday
          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/25'
          : group.isYesterday
          ? 'glass-card text-violet-400 border border-violet-500/30'
          : 'glass-card text-foreground'
      }`}>
        {group.isToday && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
        <span>{group.dateLabel}</span>
        <span className="text-sm opacity-60">({group.entries.length} items)</span>
      </JellyCard>
    </div>
  );
}

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
 * Beautiful vertical timeline with jelly animations
 */
export function TimelineView({ initialViewModel }: TimelineViewProps) {
  const viewModel = initialViewModel || {
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

  const [filter, setFilter] = useState<TimelineFilter>(viewModel.filter);
  const [statusFilter, setStatusFilter] = useState<TimelineStatusFilter>(viewModel.statusFilter);

  // Memoize filtered data to prevent recalculation loops
  const filteredGroups = useMemo(() => {
    return viewModel.groups
      .map((group) => ({
        ...group,
        entries: group.entries.filter((entry) => {
          const matchesCategory = filter === 'all' || entry.category === filter;
          const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
          return matchesCategory && matchesStatus;
        }),
      }))
      .filter((group) => group.entries.length > 0);
  }, [viewModel.groups, filter, statusFilter]);

  // Count filtered items
  const filteredCount = useMemo(() => {
    return filteredGroups.reduce((sum, g) => sum + g.entries.length, 0);
  }, [filteredGroups]);

  // Animation springs
  const headerSpring = useSpring({
    from: { opacity: 0, y: -20 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  return (
    <MainLayout showBubbles={false}>
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
            {/* Category filters */}
            <div className="flex gap-2 flex-wrap">
              <FilterButton
                label="ทั้งหมด"
                emoji="📋"
                isActive={filter === 'all'}
                onClick={() => setFilter('all')}
              />
              {viewModel.categories.map((cat) => (
                <FilterButton
                  key={cat.id}
                  label={cat.labelTh}
                  emoji={cat.emoji}
                  isActive={filter === cat.id}
                  onClick={() => setFilter(cat.id)}
                />
              ))}
            </div>

            {/* Status filters */}
            <div className="flex gap-2">
              <FilterButton
                label="ทุกสถานะ"
                isActive={statusFilter === 'all'}
                onClick={() => setStatusFilter('all')}
              />
              <FilterButton
                label="Published"
                emoji="✅"
                isActive={statusFilter === 'published'}
                onClick={() => setStatusFilter('published')}
              />
              <FilterButton
                label="Scheduled"
                emoji="📅"
                isActive={statusFilter === 'scheduled'}
                onClick={() => setStatusFilter('scheduled')}
              />
              <FilterButton
                label="Draft"
                emoji="📝"
                isActive={statusFilter === 'draft'}
                onClick={() => setStatusFilter('draft')}
              />
            </div>
          </div>

          {/* Result count */}
          <div className="text-sm text-muted">
            แสดง {filteredCount} รายการ
          </div>

          {/* Timeline */}
          {filteredGroups.length > 0 ? (
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 via-fuchsia-500 to-purple-500 opacity-30 transform -translate-x-1/2" />
              
              {/* Timeline items */}
              <div className="space-y-4 relative">
                {filteredGroups.map((group) => (
                  <div key={group.date}>
                    <TimelineDateHeader group={group} />
                    {group.entries.map((entry, entryIndex) => (
                      <TimelineCard
                        key={entry.id}
                        entry={entry}
                        isLeft={entryIndex % 2 === 0}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <JellyCard className="glass-card p-12 text-center">
              <span className="text-5xl mb-4 block">🔍</span>
              <h3 className="text-lg font-semibold text-foreground mb-2">ไม่พบคอนเทนต์</h3>
              <p className="text-muted mb-4">ลองปรับ filter เพื่อดูคอนเทนต์อื่น</p>
              <JellyButton
                onClick={() => {
                  setFilter('all');
                  setStatusFilter('all');
                }}
                variant="primary"
              >
                ดูทั้งหมด
              </JellyButton>
            </JellyCard>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
