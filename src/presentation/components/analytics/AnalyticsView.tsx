'use client';

import { AnalyticsViewModel } from '@/src/presentation/presenters/analytics/AnalyticsPresenter';
import { useAnalyticsPresenter } from '@/src/presentation/presenters/analytics/useAnalyticsPresenter';
import { animated, config, useSpring } from '@react-spring/web';
import { MainLayout } from '../layout/MainLayout';
import { JellyButton } from '../ui/JellyButton';
import { JellyCard } from '../ui/JellyCard';
import { BarChart, DonutChart, LineChart } from '../ui/SimpleChart';
import { ProgressBar, TrendIndicator } from '../ui/TrendIndicator';

interface AnalyticsViewProps {
  initialViewModel?: AnalyticsViewModel;
}

/**
 * AnalyticsView - Analytics dashboard with charts and insights
 * ✅ Clean View - All logic moved to useAnalyticsPresenter hook
 */
export function AnalyticsView({ initialViewModel }: AnalyticsViewProps) {
  // ✅ All state and logic comes from hook
  const [state, actions] = useAnalyticsPresenter(initialViewModel);

  const headerSpring = useSpring({
    from: { opacity: 0, y: -20 },
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

  // ✅ Single Source of Truth - All data comes from viewModel via hook
  const viewModel = state.viewModel;
  const stats = viewModel?.stats || {
    totalContents: 0,
    publishedCount: 0,
    scheduledCount: 0,
    draftCount: 0,
    totalLikes: 0,
    totalShares: 0,
  };
  const weeklyData = viewModel?.weeklyData || [];
  const monthlyData = viewModel?.monthlyData || [];
  const contentTypeData = viewModel?.contentTypeData || [];
  const topPerformers = viewModel?.topPerformers || [];

  return (
    <MainLayout showBubbles={false}>
      <div className="h-full overflow-auto scrollbar-thin">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          
          {/* Header */}
          <animated.div style={headerSpring} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text-purple">Analytics</h1>
              <p className="text-sm text-muted">ภาพรวมและประสิทธิภาพคอนเทนต์ของคุณ</p>
            </div>
            
            {/* Date Range */}
            <div className="flex gap-1 p-1 glass-card rounded-lg">
              {(['today', 'week', 'month', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => actions.setDateRange(range)}
                  className={`px-4 py-2 text-sm rounded-md transition-all ${
                    state.dateRange === range
                      ? 'bg-violet-600 text-white'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {range === 'today' ? 'วันนี้' : range === 'week' ? 'สัปดาห์' : range === 'month' ? 'เดือน' : 'ปี'}
                </button>
              ))}
            </div>
          </animated.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              label="คอนเทนต์ทั้งหมด"
              value={stats.totalContents}
              icon="📝"
              color="#8B5CF6"
              trend={12.5}
              delay={100}
            />
            <StatCard
              label="Likes"
              value={`${(stats.totalLikes / 1000).toFixed(1)}K`}
              icon="❤️"
              color="#EC4899"
              trend={24.8}
              delay={150}
            />
            <StatCard
              label="Shares"
              value={`${(stats.totalShares / 1000).toFixed(1)}K`}
              icon="🔗"
              color="#8B5CF6"
              trend={18.3}
              delay={200}
            />
            <StatCard
              label="Published"
              value={stats.publishedCount}
              icon="✅"
              color="#06B6D4"
              trend={32.1}
              delay={250}
            />
            <StatCard
              label="Scheduled"
              value={stats.scheduledCount}
              icon="📅"
              color="#10B981"
              trend={5.2}
              delay={300}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Trend */}
            <JellyCard className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">📊 Engagement Trend</h3>
                <span className="text-xs text-muted">Last 7 days</span>
              </div>
              <LineChart
                data={weeklyData}
                height={200}
                strokeColor="#8B5CF6"
                fillGradient
              />
            </JellyCard>

            {/* Content Performance */}
            <JellyCard className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">📈 Performance</h3>
                <span className="text-xs text-muted">Weekly</span>
              </div>
              <BarChart
                data={monthlyData}
                height={200}
                showLabels
                showValues
              />
            </JellyCard>
          </div>

          {/* Content Type & Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Content by Type */}
            <JellyCard className="glass-card p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">🏷️ Content by Type</h3>
              <div className="flex justify-center mb-4">
                <DonutChart
                  data={contentTypeData}
                  size={160}
                  strokeWidth={20}
                  centerValue={stats.totalContents}
                  centerLabel="Total"
                />
              </div>
              <div className="space-y-2">
                {contentTypeData.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted">{item.label}</span>
                    </div>
                    <span className="text-foreground font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </JellyCard>

            {/* Top Performing Content */}
            <JellyCard className="glass-card p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">🏆 Top Performers</h3>
                <JellyButton variant="ghost" size="sm">
                  ดูทั้งหมด →
                </JellyButton>
              </div>
              <div className="space-y-3">
                {topPerformers.map((content, index) => (
                  <div
                    key={content.title}
                    className="flex items-center gap-4 p-3 rounded-xl glass-card hover:bg-violet-500/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-sm font-bold text-violet-400">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {content.title}
                      </div>
                      <div className="text-xs text-muted">{content.type}</div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-pink-400">❤️ {content.likes}</span>
                      <span className="text-violet-400">🔗 {content.shares}</span>
                    </div>
                  </div>
                ))}
              </div>
            </JellyCard>
          </div>

          {/* Goals */}
          <JellyCard className="glass-card p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4">🎯 Monthly Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted">Contents Created</span>
                  <span className="text-foreground">28 / 30</span>
                </div>
                <ProgressBar value={28} max={30} color="from-violet-500 to-fuchsia-500" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted">Likes Target</span>
                  <span className="text-foreground">8.5K / 10K</span>
                </div>
                <ProgressBar value={8500} max={10000} color="from-pink-500 to-rose-500" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted">Engagement Rate</span>
                  <span className="text-foreground">8.4% / 10%</span>
                </div>
                <ProgressBar value={8.4} max={10} color="from-cyan-500 to-blue-500" />
              </div>
            </div>
          </JellyCard>
        </div>
      </div>
    </MainLayout>
  );
}

/**
 * StatCard - Individual stat card
 */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: number;
  delay: number;
}

function StatCard({ label, value, icon, color, trend, delay }: StatCardProps) {
  const spring = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay,
    config: config.gentle,
  });

  return (
    <animated.div style={spring}>
      <JellyCard className="glass-card p-4">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
          {trend !== undefined && (
            <TrendIndicator value={100 + trend} previousValue={100} size="sm" />
          )}
        </div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted">{label}</div>
      </JellyCard>
    </animated.div>
  );
}
