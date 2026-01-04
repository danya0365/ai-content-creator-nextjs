'use client';

import { ContentType } from '@/src/data/master/contentTypes';
import { GeneratedContent } from '@/src/data/mock/mockContents';
import { DashboardViewModel } from '@/src/presentation/presenters/dashboard/DashboardPresenter';
import { useGenerateStore } from '@/src/presentation/stores/useGenerateStore';
import { animated, config, useSpring } from '@react-spring/web';
import Link from 'next/link';
import { GenerateContentModal } from '../generate/GenerateContentModal';
import { MainLayout } from '../layout/MainLayout';

interface StatCardProps {
  value: number | string;
  label: string;
  icon: string;
  color: string;
  delay: number;
}

function StatCard({ value, label, icon, color, delay }: StatCardProps) {
  const springProps = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay,
    config: config.gentle,
  });

  return (
    <animated.div
      style={springProps}
      className="glass-card p-5 flex items-center gap-4"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ backgroundColor: `${color}20` }}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-sm text-muted">{label}</div>
      </div>
    </animated.div>
  );
}

interface ContentCardProps {
  content: GeneratedContent;
  delay: number;
}

function ContentCard({ content, delay }: ContentCardProps) {
  const springProps = useSpring({
    from: { opacity: 0, scale: 0.95 },
    to: { opacity: 1, scale: 1 },
    delay,
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
      style={springProps}
      className="glass-card-hover p-4 cursor-pointer group"
    >
      {/* Image placeholder */}
      <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 mb-3 flex items-center justify-center overflow-hidden">
        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🎨</span>
      </div>
      
      {/* Content info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[content.status]}`}>
            {content.status === 'published' ? '✅ Published' : 
             content.status === 'scheduled' ? '📅 Scheduled' : 
             content.status === 'draft' ? '📝 Draft' : '❌ Failed'}
          </span>
          <span className="text-xs text-muted">{content.timeSlot}</span>
        </div>
        <h4 className="text-sm font-semibold text-foreground line-clamp-2">{content.title}</h4>
        {content.status === 'published' && (
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>❤️ {content.likes}</span>
            <span>🔗 {content.shares}</span>
          </div>
        )}
      </div>
    </animated.div>
  );
}

interface QuickGenerateCardProps {
  contentType: ContentType;
  delay: number;
  onClick: () => void;
}

function QuickGenerateCard({ contentType, delay, onClick }: QuickGenerateCardProps) {
  const springProps = useSpring({
    from: { opacity: 0, x: -20 },
    to: { opacity: 1, x: 0 },
    delay,
    config: config.gentle,
  });

  return (
    <animated.button
      style={springProps}
      onClick={onClick}
      className="glass-card-hover p-4 flex items-center gap-3 text-left w-full"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ backgroundColor: `${contentType.color}20` }}
      >
        {contentType.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground">{contentType.nameTh}</div>
        <div className="text-xs text-muted truncate">{contentType.descriptionTh}</div>
      </div>
      <div className="text-muted">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </animated.button>
  );
}

interface DashboardViewProps {
  initialViewModel?: DashboardViewModel;
}

/**
 * DashboardView component
 * Main dashboard for content management
 */
export function DashboardView({ initialViewModel }: DashboardViewProps) {
  // Use initial data or fallback
  const viewModel = initialViewModel || {
    stats: { totalContents: 0, publishedCount: 0, scheduledCount: 0, draftCount: 0, totalLikes: 0, totalShares: 0 },
    recentContents: [],
    scheduledContents: [],
    draftContents: [],
    contentTypes: [],
    timeSlots: [],
    currentTimeSlot: null,
    suggestedContentTypes: [],
  };

  // Zustand store
  const { isModalOpen, openModal, closeModal, generateContent } = useGenerateStore();

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
          <animated.div style={headerSpring} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text-purple">Dashboard</h1>
              <p className="text-sm text-muted">จัดการและติดตามคอนเทนต์ของคุณ</p>
            </div>
            <button 
              onClick={openModal}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
            >
              <span>✨</span>
              <span>สร้างคอนเทนต์ใหม่</span>
            </button>
          </animated.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard value={viewModel.stats.totalContents} label="Total Contents" icon="📝" color="#8B5CF6" delay={100} />
            <StatCard value={viewModel.stats.publishedCount} label="Published" icon="✅" color="#10B981" delay={150} />
            <StatCard value={viewModel.stats.scheduledCount} label="Scheduled" icon="📅" color="#3B82F6" delay={200} />
            <StatCard value={viewModel.stats.totalLikes} label="Total Likes" icon="❤️" color="#EF4444" delay={250} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Contents - 2 columns */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">คอนเทนต์ล่าสุด</h2>
                <Link href="/gallery" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                  ดูทั้งหมด →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {viewModel.recentContents.length > 0 ? (
                  viewModel.recentContents.map((content, index) => (
                    <ContentCard key={content.id} content={content} delay={300 + index * 50} />
                  ))
                ) : (
                  <div className="col-span-full glass-card p-8 text-center">
                    <span className="text-4xl mb-3 block">🎨</span>
                    <p className="text-muted">ยังไม่มีคอนเทนต์ เริ่มสร้างกันเลย!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Quick Generate */}
            <div className="space-y-4">
              {/* Current Time Slot */}
              {viewModel.currentTimeSlot && (
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{viewModel.currentTimeSlot.emoji}</span>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{viewModel.currentTimeSlot.nameTh}</div>
                      <div className="text-xs text-muted">
                        {viewModel.currentTimeSlot.startHour}:00 - {viewModel.currentTimeSlot.endHour}:00
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                      style={{ 
                        width: `${((new Date().getHours() - viewModel.currentTimeSlot.startHour) / 
                                  (viewModel.currentTimeSlot.endHour - viewModel.currentTimeSlot.startHour)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Generate */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">🚀 Quick Generate</h3>
                <div className="space-y-2">
                  {viewModel.suggestedContentTypes.map((type, index) => (
                    <QuickGenerateCard 
                      key={type.id} 
                      contentType={type} 
                      delay={400 + index * 50} 
                      onClick={openModal}
                    />
                  ))}
                </div>
              </div>

              {/* Scheduled */}
              {viewModel.scheduledContents.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">📅 กำลังจะโพสต์</h3>
                  <div className="space-y-2">
                    {viewModel.scheduledContents.slice(0, 3).map((content) => (
                      <div key={content.id} className="glass-card p-3 flex items-center gap-3">
                        <span className="text-xl">🎨</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-foreground truncate">{content.title}</div>
                          <div className="text-xs text-muted">{content.timeSlot}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generate Content Modal */}
      <GenerateContentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onGenerate={generateContent}
      />
    </MainLayout>
  );
}
