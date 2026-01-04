'use client';

import { GeneratedContent } from '@/src/data/mock/mockContents';
import { ContentFilter, GalleryViewModel } from '@/src/presentation/presenters/gallery/GalleryPresenter';
import { animated, config, useSpring } from '@react-spring/web';
import { useMemo, useState } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { JellyButton } from '../ui/JellyButton';
import { JellyCard } from '../ui/JellyCard';

interface FilterButtonProps {
  label: string;
  value: ContentFilter;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function FilterButton({ label, count, isActive, onClick }: FilterButtonProps) {
  return (
    <JellyButton
      onClick={onClick}
      variant={isActive ? 'primary' : 'secondary'}
      size="sm"
    >
      {label} <span className="opacity-60">({count})</span>
    </JellyButton>
  );
}

interface ContentDetailModalProps {
  content: GeneratedContent;
  onClose: () => void;
}

function ContentDetailModal({ content, onClose }: ContentDetailModalProps) {
  const backdropSpring = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: config.gentle,
  });

  const modalSpring = useSpring({
    from: { opacity: 0, scale: 0.9, y: 20 },
    to: { opacity: 1, scale: 1, y: 0 },
    config: config.gentle,
  });

  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-400',
    scheduled: 'bg-blue-500/20 text-blue-400',
    published: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
  };

  return (
    <animated.div
      style={backdropSpring}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <animated.div
        style={modalSpring}
        className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <JellyButton
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 w-8 h-8 rounded-full"
        >
          ✕
        </JellyButton>

        {/* Image */}
        <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-fuchsia-500/30 mb-4 flex items-center justify-center">
          <span className="text-6xl">🎨</span>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-3 py-1 rounded-full ${statusColors[content.status]}`}>
              {content.status.toUpperCase()}
            </span>
            <span className="text-xs text-muted">{content.timeSlot}</span>
          </div>

          <h2 className="text-xl font-bold text-foreground">{content.title}</h2>
          <p className="text-sm text-muted">{content.description}</p>

          {content.status === 'published' && (
            <div className="flex items-center gap-6 py-3 border-t border-b border-border/30">
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">{content.likes}</div>
                <div className="text-xs text-muted">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">{content.shares}</div>
                <div className="text-xs text-muted">Shares</div>
              </div>
            </div>
          )}

          {/* Prompt */}
          <JellyCard className="glass-card p-3">
            <div className="text-xs text-muted mb-1">AI Prompt:</div>
            <div className="text-sm text-foreground">{content.prompt}</div>
          </JellyCard>

          {/* Actions */}
          <div className="flex gap-2">
            <JellyButton variant="primary" className="flex-1">
              ✨ Regenerate
            </JellyButton>
            <JellyButton variant="secondary">
              📤 Share
            </JellyButton>
          </div>
        </div>
      </animated.div>
    </animated.div>
  );
}

interface GalleryCardProps {
  content: GeneratedContent;
  onClick: () => void;
  delay: number;
}

function GalleryCard({ content, onClick, delay }: GalleryCardProps) {
  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-400',
    scheduled: 'bg-blue-500/20 text-blue-400',
    published: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
  };

  const spring = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay,
    config: config.gentle,
  });

  return (
    <animated.div style={spring}>
      <JellyCard
        onClick={onClick}
        className="glass-card-hover p-4 group"
      >
        {/* Image */}
        <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-fuchsia-500/20 mb-3 flex items-center justify-center overflow-hidden relative">
          <span className="text-4xl group-hover:scale-125 transition-transform duration-500">🎨</span>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-white text-sm font-medium">View Details</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[content.status]}`}>
              {content.status}
            </span>
            <span className="text-xs text-muted">{content.timeSlot}</span>
          </div>
          <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-violet-400 transition-colors">
            {content.title}
          </h4>
          {content.status === 'published' && (
            <div className="flex items-center gap-3 text-xs text-muted">
              <span>❤️ {content.likes}</span>
              <span>🔗 {content.shares}</span>
            </div>
          )}
        </div>
      </JellyCard>
    </animated.div>
  );
}

interface GalleryViewProps {
  initialViewModel?: GalleryViewModel;
}

/**
 * GalleryView component
 * Content gallery with jelly animations
 */
export function GalleryView({ initialViewModel }: GalleryViewProps) {
  const viewModel = initialViewModel || {
    contents: [],
    contentTypes: [],
    filter: 'all' as ContentFilter,
    totalCount: 0,
  };

  const [filter, setFilter] = useState<ContentFilter>(viewModel.filter);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);

  // Filter contents with useMemo
  const filteredContents = useMemo(() => {
    return filter === 'all'
      ? viewModel.contents
      : viewModel.contents.filter((c) => c.status === filter);
  }, [viewModel.contents, filter]);

  // Get counts for each filter
  const counts = useMemo(() => ({
    all: viewModel.contents.length,
    published: viewModel.contents.filter((c) => c.status === 'published').length,
    scheduled: viewModel.contents.filter((c) => c.status === 'scheduled').length,
    draft: viewModel.contents.filter((c) => c.status === 'draft').length,
  }), [viewModel.contents]);

  const headerSpring = useSpring({
    from: { opacity: 0, y: -10 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  return (
    <MainLayout showBubbles={false}>
      <div className="h-full overflow-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          
          {/* Header */}
          <animated.div style={headerSpring} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text-purple">Gallery</h1>
              <p className="text-sm text-muted">
                รวมคอนเทนต์ทั้งหมด {viewModel.totalCount} รายการ
              </p>
            </div>
            
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <FilterButton label="ทั้งหมด" value="all" count={counts.all} isActive={filter === 'all'} onClick={() => setFilter('all')} />
              <FilterButton label="Published" value="published" count={counts.published} isActive={filter === 'published'} onClick={() => setFilter('published')} />
              <FilterButton label="Scheduled" value="scheduled" count={counts.scheduled} isActive={filter === 'scheduled'} onClick={() => setFilter('scheduled')} />
              <FilterButton label="Draft" value="draft" count={counts.draft} isActive={filter === 'draft'} onClick={() => setFilter('draft')} />
            </div>
          </animated.div>

          {/* Content Grid */}
          {filteredContents.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredContents.map((content, index) => (
                <GalleryCard
                  key={content.id}
                  content={content}
                  onClick={() => setSelectedContent(content)}
                  delay={50 + index * 30}
                />
              ))}
            </div>
          ) : (
            <JellyCard className="glass-card p-12 text-center">
              <span className="text-5xl mb-4 block">🎨</span>
              <h3 className="text-lg font-semibold text-foreground mb-2">ไม่พบคอนเทนต์</h3>
              <p className="text-muted mb-4">ยังไม่มีคอนเทนต์ในหมวดหมู่นี้</p>
              <JellyButton variant="primary">
                ✨ สร้างคอนเทนต์ใหม่
              </JellyButton>
            </JellyCard>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedContent && (
        <ContentDetailModal
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      )}
    </MainLayout>
  );
}
