'use client';

import { ContentDetailViewModel } from '@/src/presentation/presenters/content/ContentDetailPresenter';
import { useContentDetailPresenter } from '@/src/presentation/presenters/content/useContentDetailPresenter';
import { animated, config, useSpring } from '@react-spring/web';
import Link from 'next/link';
import { JellyButton } from '../ui/JellyButton';
import { JellyCard } from '../ui/JellyCard';
import { DonutChart } from '../ui/SimpleChart';
import { TrendIndicator } from '../ui/TrendIndicator';
import { ContentDetailSkeleton } from './ContentDetailSkeleton';

interface ContentDetailViewProps {
  contentId: string;
  initialViewModel?: ContentDetailViewModel;
}

/**
 * ContentDetailView - Full content detail page with stats and actions
 * ✅ Clean View - All data comes from useContentDetailPresenter hook (Single Source of Truth)
 */
export function ContentDetailView({ contentId, initialViewModel }: ContentDetailViewProps) {
  // ✅ All state and data comes from hook
  const [state, actions] = useContentDetailPresenter(contentId, initialViewModel);

  const headerSpring = useSpring({
    from: { opacity: 0, y: -20 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  const contentSpring = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay: 100,
    config: config.gentle,
  });

  const sidebarSpring = useSpring({
    from: { opacity: 0, x: 20 },
    to: { opacity: 1, x: 0 },
    delay: 200,
    config: config.gentle,
  });

  // Loading state
  if (state.loading && !state.viewModel) {
    return <ContentDetailSkeleton />;
  }

  // Error state
  if (state.error) {
    return (
      <>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{state.error}</p>
            <JellyButton onClick={() => actions.refresh(contentId)} variant="primary">
              ลองใหม่
            </JellyButton>
          </div>
        </div>
      </>
    );
  }

  // Not found state
  if (!state.viewModel?.content) {
    return (
      <>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl mb-4 block">🔍</span>
            <h2 className="text-xl font-bold text-foreground mb-2">ไม่พบคอนเทนต์</h2>
            <p className="text-muted mb-4">คอนเทนต์นี้อาจถูกลบไปแล้ว</p>
            <Link href="/gallery">
              <JellyButton variant="primary">กลับไปหน้า Gallery</JellyButton>
            </Link>
          </div>
        </div>
      </>
    );
  }

  // ✅ Single Source of Truth - All data comes from viewModel
  const { content, contentTypeName, contentTypeIcon, engagementData } = state.viewModel;

  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    published: 'bg-green-500/20 text-green-400 border-green-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const statusIcons = {
    draft: '📝',
    scheduled: '📅',
    published: '✅',
    failed: '❌',
  };

  return (
    <>
      <div className="h-full overflow-auto scrollbar-thin">
        <div className="max-w-6xl mx-auto px-6 py-6">
          
          {/* Breadcrumb */}
          <animated.div style={headerSpring} className="mb-6">
            <div className="flex items-center gap-2 text-sm text-muted mb-4">
              <Link href="/gallery" className="hover:text-violet-400 transition-colors">
                Gallery
              </Link>
              <span>/</span>
              <span className="text-foreground">{content.title}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{contentTypeIcon}</span>
                <div>
                  <h1 className="text-2xl font-bold gradient-text-purple">{content.title}</h1>
                  <p className="text-sm text-muted">{contentTypeName}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/content/${content.id}/edit`}>
                  <JellyButton variant="secondary">
                    ✏️ แก้ไข
                  </JellyButton>
                </Link>
                <JellyButton variant="primary">
                  🚀 Publish
                </JellyButton>
              </div>
            </div>
          </animated.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Content */}
            <animated.div style={contentSpring} className="lg:col-span-2 space-y-6">
              {/* Image Preview */}
              <JellyCard className="glass-card p-0 overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-fuchsia-500/30 flex items-center justify-center">
                  {content.imageUrl ? (
                    <img 
                      src={content.imageUrl} 
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">🎨</span>
                  )}
                </div>
                
                {/* Status Bar */}
                <div className="p-4 flex items-center justify-between border-t border-border/30">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm border ${statusColors[content.status as keyof typeof statusColors]}`}>
                      {statusIcons[content.status as keyof typeof statusIcons]} {content.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-muted">
                      {new Date(content.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-pink-400">❤️ {content.likes?.toLocaleString() || 0}</span>
                    <span className="text-violet-400">🔗 {content.shares?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </JellyCard>

              {/* Description */}
              <JellyCard className="glass-card p-5">
                <h3 className="text-lg font-semibold text-foreground mb-3">📝 Description</h3>
                <p className="text-muted whitespace-pre-wrap">{content.description}</p>
              </JellyCard>

              {/* AI Prompt */}
              <JellyCard className="glass-card p-5">
                <h3 className="text-lg font-semibold text-foreground mb-3">🤖 AI Prompt</h3>
                <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-700/50 font-mono text-sm text-gray-300">
                  {content.prompt}
                </div>
              </JellyCard>
            </animated.div>

            {/* Sidebar */}
            <animated.div style={sidebarSpring} className="space-y-6">
              {/* Engagement Stats */}
              <JellyCard className="glass-card p-5">
                <h3 className="text-lg font-semibold text-foreground mb-4">📊 Engagement</h3>
                <DonutChart data={engagementData} />
                <div className="mt-4 space-y-3">
                  {engagementData.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted">{item.label}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </JellyCard>

              {/* Performance */}
              <JellyCard className="glass-card p-5">
                <h3 className="text-lg font-semibold text-foreground mb-4">📈 Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted">Engagement Rate</span>
                      <TrendIndicator value={12.5} />
                    </div>
                    <div className="h-2 rounded-full bg-gray-700/50 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        style={{ width: '68%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted">Click Rate</span>
                      <TrendIndicator value={8.3} />
                    </div>
                    <div className="h-2 rounded-full bg-gray-700/50 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
                        style={{ width: '45%' }}
                      />
                    </div>
                  </div>
                </div>
              </JellyCard>

              {/* Quick Actions */}
              <JellyCard className="glass-card p-5">
                <h3 className="text-lg font-semibold text-foreground mb-4">⚡ Quick Actions</h3>
                <div className="space-y-2">
                  <JellyButton variant="secondary" className="w-full justify-start">
                    📅 Schedule
                  </JellyButton>
                  <JellyButton variant="secondary" className="w-full justify-start">
                    📋 Duplicate
                  </JellyButton>
                  <JellyButton variant="ghost" className="w-full justify-start text-red-400 hover:bg-red-500/10">
                    🗑️ Delete
                  </JellyButton>
                </div>
              </JellyCard>
            </animated.div>
          </div>
        </div>
      </div>
    </>
  );
}
