'use client';

import { GeneratedContent } from '@/src/data/mock/mockContents';
import { animated, config, useSpring } from '@react-spring/web';
import Link from 'next/link';
import { MainLayout } from '../layout/MainLayout';
import { JellyButton } from '../ui/JellyButton';
import { JellyCard } from '../ui/JellyCard';
import { DonutChart } from '../ui/SimpleChart';
import { TrendIndicator } from '../ui/TrendIndicator';

interface ContentDetailViewProps {
  content?: GeneratedContent;
}

/**
 * ContentDetailView - Full content detail page with stats and actions
 */
export function ContentDetailView({ content }: ContentDetailViewProps) {
  // Mock content for demo
  const mockContent: GeneratedContent = content || {
    id: 'demo-1',
    title: 'สรุปข่าว AI ประจำวัน 🤖',
    description: 'อัพเดทข่าวสาร AI ล่าสุดแบบ Pixel Art สุดน่ารัก พร้อมสรุปเข้าใจง่ายสำหรับทุกคน',
    prompt: 'Create a cute pixel art illustration about AI news today',
    imageUrl: '',
    status: 'published',
    timeSlot: 'morning',
    contentTypeId: 'morning-news',
    scheduledAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    likes: 1247,
    shares: 312,
  };

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

  // Engagement data for chart
  const engagementData = [
    { label: 'Likes', value: mockContent.likes || 0, color: '#EC4899' },
    { label: 'Shares', value: mockContent.shares || 0, color: '#8B5CF6' },
    { label: 'Comments', value: 89, color: '#06B6D4' },
  ];

  return (
    <MainLayout showBubbles={false}>
      <div className="h-full overflow-auto scrollbar-thin">
        <div className="max-w-6xl mx-auto px-6 py-6">
          
          {/* Breadcrumb */}
          <animated.div style={headerSpring} className="mb-6">
            <div className="flex items-center gap-2 text-sm text-muted mb-4">
              <Link href="/gallery" className="hover:text-violet-400 transition-colors">
                Gallery
              </Link>
              <span>/</span>
              <span className="text-foreground">{mockContent.title}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-sm px-3 py-1 rounded-full border ${statusColors[mockContent.status]}`}>
                    {statusIcons[mockContent.status]} {mockContent.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-muted">{mockContent.timeSlot}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {mockContent.title}
                </h1>
                <p className="text-muted">{mockContent.description}</p>
              </div>

              <div className="flex gap-2">
                <Link href={`/content/${mockContent.id}/edit`}>
                  <JellyButton variant="secondary">
                    ✏️ แก้ไข
                  </JellyButton>
                </Link>
                <JellyButton variant="primary">
                  ✨ Regenerate
                </JellyButton>
              </div>
            </div>
          </animated.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Content Preview - 2 columns */}
            <animated.div style={contentSpring} className="lg:col-span-2 space-y-6">
              {/* Image Preview */}
              <JellyCard className="glass-card p-6">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-fuchsia-500/30 flex items-center justify-center mb-4">
                  <span className="text-8xl">🎨</span>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <JellyButton variant="secondary" size="sm">
                    📥 Download
                  </JellyButton>
                  <JellyButton variant="secondary" size="sm">
                    📤 Share
                  </JellyButton>
                  <JellyButton variant="secondary" size="sm">
                    🔗 Copy Link
                  </JellyButton>
                </div>
              </JellyCard>

              {/* AI Prompt */}
              <JellyCard className="glass-card p-5">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span>🤖</span> AI Prompt
                </h3>
                <div className="glass-card p-4 rounded-xl text-sm text-muted">
                  {mockContent.prompt}
                </div>
                <div className="flex gap-2 mt-4">
                  <JellyButton variant="ghost" size="sm">
                    📋 Copy
                  </JellyButton>
                  <JellyButton variant="ghost" size="sm">
                    ♻️ Use Again
                  </JellyButton>
                </div>
              </JellyCard>

              {/* Hashtags */}
              <JellyCard className="glass-card p-5">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span>#</span> Hashtags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['#PixelArt', '#AI', '#Content', '#Creative', '#Tech'].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm rounded-full bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 cursor-pointer transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </JellyCard>
            </animated.div>

            {/* Sidebar - Stats */}
            <animated.div style={sidebarSpring} className="space-y-6">
              {/* Engagement Stats */}
              <JellyCard className="glass-card p-5">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span>📊</span> Engagement
                </h3>
                
                <div className="flex justify-center mb-4">
                  <DonutChart
                    data={engagementData}
                    size={140}
                    strokeWidth={16}
                    centerValue={mockContent.likes! + mockContent.shares! + 89}
                    centerLabel="Total"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="glass-card p-3 rounded-xl">
                    <div className="text-lg font-bold text-pink-400">{mockContent.likes}</div>
                    <div className="text-xs text-muted">Likes</div>
                  </div>
                  <div className="glass-card p-3 rounded-xl">
                    <div className="text-lg font-bold text-violet-400">{mockContent.shares}</div>
                    <div className="text-xs text-muted">Shares</div>
                  </div>
                  <div className="glass-card p-3 rounded-xl">
                    <div className="text-lg font-bold text-cyan-400">89</div>
                    <div className="text-xs text-muted">Comments</div>
                  </div>
                </div>
              </JellyCard>

              {/* Performance */}
              <JellyCard className="glass-card p-5">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span>📈</span> Performance
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Engagement Rate</span>
                    <TrendIndicator value={124} previousValue={100} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Reach</span>
                    <span className="text-sm font-bold text-foreground">12.4K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Impressions</span>
                    <span className="text-sm font-bold text-foreground">45.2K</span>
                  </div>
                </div>
              </JellyCard>

              {/* Details */}
              <JellyCard className="glass-card p-5">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span>📝</span> Details
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Content Type</span>
                    <span className="text-foreground">{mockContent.contentTypeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Created</span>
                    <span className="text-foreground">
                      {new Date(mockContent.createdAt).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                  {mockContent.publishedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted">Published</span>
                      <span className="text-foreground">
                        {new Date(mockContent.publishedAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  )}
                </div>
              </JellyCard>

              {/* Danger Zone */}
              <JellyCard className="glass-card p-5 border border-red-500/20">
                <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <span>⚠️</span> Danger Zone
                </h3>
                <p className="text-xs text-muted mb-3">
                  การลบคอนเทนต์จะไม่สามารถกู้คืนได้
                </p>
                <JellyButton variant="secondary" size="sm" className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10">
                  🗑️ Delete Content
                </JellyButton>
              </JellyCard>
            </animated.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
