'use client';

import { Content } from '@/src/application/repositories/IContentRepository';
import { ContentFilter, GalleryViewModel } from '@/src/presentation/presenters/gallery/GalleryPresenter';
import { useGalleryPresenter, ViewMode } from '@/src/presentation/presenters/gallery/useGalleryPresenter';
import { animated, config, useSpring } from '@react-spring/web';
import { MainLayout } from '../layout/MainLayout';
import { JellyButton } from '../ui/JellyButton';
import { JellyCard } from '../ui/JellyCard';
import { SmartImage } from '../ui/SmartImage';

// Types
type SortOption = 'newest' | 'oldest' | 'likes' | 'shares';

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
  content: Content;
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
        <JellyButton
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 w-8 h-8 rounded-full"
        >
          ✕
        </JellyButton>

        <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-fuchsia-500/30 mb-4 flex items-center justify-center overflow-hidden relative">
          <SmartImage
            src={content.imageUrl}
            alt={content.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 500px"
            emojiClassName="text-6xl"
            containerClassName="w-full h-full flex items-center justify-center absolute inset-0"
          />
        </div>

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

          <JellyCard className="glass-card p-3">
            <div className="text-xs text-muted mb-1">AI Prompt:</div>
            <div className="text-sm text-foreground">{content.prompt}</div>
          </JellyCard>

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
  content: Content;
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
      <JellyCard onClick={onClick} className="glass-card-hover p-4 group">
        <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-fuchsia-500/20 mb-3 flex items-center justify-center overflow-hidden relative">
          <SmartImage
            src={content.imageUrl}
            alt={content.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 33vw"
            containerClassName="w-full h-full flex items-center justify-center absolute inset-0"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-10">
            <span className="text-white text-sm font-medium">View Details</span>
          </div>
        </div>

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

/**
 * GalleryListCard - List view card with more details
 */
interface GalleryListCardProps {
  content: Content;
  onClick: () => void;
  delay: number;
}

function GalleryListCard({ content, onClick, delay }: GalleryListCardProps) {
  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-400',
    scheduled: 'bg-blue-500/20 text-blue-400',
    published: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
  };

  const spring = useSpring({
    from: { opacity: 0, x: -20 },
    to: { opacity: 1, x: 0 },
    delay,
    config: config.gentle,
  });

  return (
    <animated.div style={spring}>
      <JellyCard onClick={onClick} className="glass-card-hover p-4 group">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-fuchsia-500/20 flex items-center justify-center overflow-hidden relative">
            <SmartImage
              src={content.imageUrl}
              alt={content.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="80px"
              emojiClassName="text-2xl group-hover:scale-110 transition-transform"
              containerClassName="w-full h-full flex items-center justify-center absolute inset-0"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[content.status]}`}>
                {content.status}
              </span>
              <span className="text-xs text-muted">{content.timeSlot}</span>
            </div>
            <h4 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-violet-400 transition-colors mb-1">
              {content.title}
            </h4>
            <p className="text-xs text-muted line-clamp-2">{content.description}</p>
          </div>

          {/* Stats */}
          {content.status === 'published' && (
            <div className="flex-shrink-0 text-right">
              <div className="text-sm font-bold text-foreground">❤️ {content.likes}</div>
              <div className="text-xs text-muted">🔗 {content.shares}</div>
            </div>
          )}
        </div>
      </JellyCard>
    </animated.div>
  );
}

/**
 * ViewModeToggle - Grid/List view toggle
 */
function ViewModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
  return (
    <div className="flex gap-1 p-1 glass-card rounded-lg">
      <button
        onClick={() => onChange('grid')}
        className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1 ${
          mode === 'grid'
            ? 'bg-violet-600 text-white'
            : 'text-muted hover:text-foreground'
        }`}
      >
        <span>▦</span> Grid
      </button>
      <button
        onClick={() => onChange('list')}
        className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1 ${
          mode === 'list'
            ? 'bg-violet-600 text-white'
            : 'text-muted hover:text-foreground'
        }`}
      >
        <span>☰</span> List
      </button>
    </div>
  );
}

/**
 * SortSelector - Sorting options dropdown
 */
function SortSelector({ sort, onChange }: { sort: SortOption; onChange: (sort: SortOption) => void }) {
  const sortOptions: { value: SortOption; label: string; icon: string }[] = [
    { value: 'newest', label: 'ใหม่สุด', icon: '🕐' },
    { value: 'oldest', label: 'เก่าสุด', icon: '📅' },
    { value: 'likes', label: 'Likes มากสุด', icon: '❤️' },
    { value: 'shares', label: 'Shares มากสุด', icon: '🔗' },
  ];

  return (
    <select
      value={sort}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className="px-3 py-2 text-sm rounded-lg glass-card text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer"
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.icon} {option.label}
        </option>
      ))}
    </select>
  );
}

interface GalleryViewProps {
  initialViewModel?: GalleryViewModel;
}

/**
 * GalleryView component
 * Content gallery with Grid/List toggle and sorting
 * ✅ Clean View - All logic moved to useGalleryPresenter hook
 */
export function GalleryView({ initialViewModel }: GalleryViewProps) {
  // ✅ All state and logic comes from hook
  const [state, actions] = useGalleryPresenter(initialViewModel);
  
  const viewModel = state.viewModel || {
    contents: [],
    contentTypes: [],
    filter: 'all' as ContentFilter,
    totalCount: 0,
  };

  const headerSpring = useSpring({
    from: { opacity: 0, y: -10 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  // Loading state
  if (state.loading && !state.viewModel) {
    return (
      <MainLayout showBubbles={false}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-muted">กำลังโหลด...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (state.error) {
    return (
      <MainLayout showBubbles={false}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{state.error}</p>
            <JellyButton onClick={actions.refresh} variant="primary">
              ลองใหม่
            </JellyButton>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showBubbles={false}>
      <div className="h-full overflow-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto px-3 py-4 md:px-6 md:py-6 space-y-4 md:space-y-6">
          
          {/* Header */}
          <animated.div style={headerSpring} className="space-y-3 md:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold gradient-text-purple">Gallery</h1>
                <p className="text-xs md:text-sm text-muted">
                  รวมคอนเทนต์ทั้งหมด {viewModel.totalCount} รายการ
                </p>
              </div>
              
              {/* View controls */}
              <div className="flex items-center gap-2 md:gap-3">
                <SortSelector sort={state.sortBy} onChange={actions.setSortBy} />
                <ViewModeToggle mode={state.viewMode} onChange={actions.setViewMode} />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-1.5 md:gap-2 flex-wrap overflow-x-auto pb-1 scrollbar-hide">
              <FilterButton label="ทั้งหมด" value="all" count={state.counts.all} isActive={state.filter === 'all'} onClick={() => actions.setFilter('all')} />
              <FilterButton label="Published" value="published" count={state.counts.published} isActive={state.filter === 'published'} onClick={() => actions.setFilter('published')} />
              <FilterButton label="Scheduled" value="scheduled" count={state.counts.scheduled} isActive={state.filter === 'scheduled'} onClick={() => actions.setFilter('scheduled')} />
              <FilterButton label="Draft" value="draft" count={state.counts.draft} isActive={state.filter === 'draft'} onClick={() => actions.setFilter('draft')} />
            </div>
          </animated.div>

          {/* Content Grid/List */}
          {state.filteredAndSortedContents.length > 0 ? (
            state.viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                {state.filteredAndSortedContents.map((content, index) => (
                  <GalleryCard
                    key={content.id}
                    content={content}
                    onClick={() => actions.selectContent(content)}
                    delay={50 + index * 30}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {state.filteredAndSortedContents.map((content, index) => (
                  <GalleryListCard
                    key={content.id}
                    content={content}
                    onClick={() => actions.selectContent(content)}
                    delay={50 + index * 30}
                  />
                ))}
              </div>
            )
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
      {state.selectedContent && (
        <ContentDetailModal
          content={state.selectedContent}
          onClose={() => actions.selectContent(null)}
        />
      )}
    </MainLayout>
  );
}
