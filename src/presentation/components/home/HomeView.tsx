'use client';

import { CONTENT_TYPES, TIME_SLOTS } from '@/src/data/master/contentTypes';
import { HomeViewModel } from '@/src/presentation/presenters/home/HomePresenter';
import { useHomePresenter } from '@/src/presentation/presenters/home/useHomePresenter';
import { animated, config, useSpring } from '@react-spring/web';
import Link from 'next/link';
import { MainLayout } from '../layout/MainLayout';
import { JellyButton } from '../ui/JellyButton';
import { JellyCard } from '../ui/JellyCard';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  delay: number;
}

function FeatureCard({ icon, title, description, color, delay }: FeatureCardProps) {
  const springProps = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay,
    config: config.gentle,
  });

  return (
    <animated.div style={springProps}>
      <JellyCard className="glass-card-hover p-5 h-full">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-3"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted leading-relaxed line-clamp-2">{description}</p>
      </JellyCard>
    </animated.div>
  );
}

interface StatCardProps {
  value: string | number;
  label: string;
  icon: string;
  delay: number;
}

function StatCard({ value, label, icon, delay }: StatCardProps) {
  const springProps = useSpring({
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 1, scale: 1 },
    delay,
    config: config.gentle,
  });

  return (
    <animated.div style={springProps}>
      <JellyCard className="glass-card p-4 text-center">
        <div className="text-xl mb-1">{icon}</div>
        <div className="text-xl font-bold gradient-text-purple">{value}</div>
        <div className="text-xs text-muted">{label}</div>
      </JellyCard>
    </animated.div>
  );
}

interface QuickLinkProps {
  href: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  delay: number;
}

function QuickLink({ href, icon, title, description, color, delay }: QuickLinkProps) {
  const springProps = useSpring({
    from: { opacity: 0, x: -20 },
    to: { opacity: 1, x: 0 },
    delay,
    config: config.gentle,
  });

  return (
    <animated.div style={springProps}>
      <Link href={href}>
        <JellyCard className="glass-card-hover p-4 flex items-center gap-4 group">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl shadow-lg`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground group-hover:text-violet-400 transition-colors">{title}</h4>
            <p className="text-xs text-muted truncate">{description}</p>
          </div>
          <span className="text-muted group-hover:text-violet-400 transition-colors">→</span>
        </JellyCard>
      </Link>
    </animated.div>
  );
}

interface HomeViewProps {
  initialViewModel?: HomeViewModel;
}

// Default stats fallback
const defaultStats = {
  totalContents: 0,
  publishedCount: 0,
  scheduledCount: 0,
  draftCount: 0,
  totalLikes: 0,
  totalShares: 0,
};

/**
 * Landing page for AI Content Creator - With Jelly Animations
 */
export function HomeView({ initialViewModel }: HomeViewProps) {
  const [{ viewModel, loading, error }] = useHomePresenter(initialViewModel);
  const stats = viewModel?.stats || defaultStats;

  const heroSpring = useSpring({
    from: { opacity: 0, y: -20 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  return (
    <MainLayout showBubbles={true}>
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-8">
        
        {loading && !viewModel && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-muted animate-pulse">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <p className="font-semibold mb-1">เกิดข้อผิดพลาด</p>
            <p>{error}</p>
          </div>
        )}

        {viewModel && (
          <>
            {/* Hero Section */}
            <animated.div style={heroSpring} className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-violet-400">Powered by Gemini AI (Live Status)</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                <span className="gradient-text-purple">AI Content Creator</span>
              </h1>
              <p className="text-lg text-muted mb-6 max-w-xl mx-auto">
                สร้างคอนเทนต์ Pixel Art อัตโนมัติ ตาม schedule ได้ทันที
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/dashboard">
                  <JellyButton variant="primary" size="lg">
                    <span>✨</span>
                    <span>เริ่มสร้างคอนเทนต์</span>
                  </JellyButton>
                </Link>
                <Link href="/gallery">
                  <JellyButton variant="secondary" size="lg">
                    <span>🖼️</span>
                    <span>ดูแกลเลอรี่</span>
                  </JellyButton>
                </Link>
              </div>
            </animated.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard value={stats.totalContents} label="Total Contents" icon="📝" delay={100} />
              <StatCard value={stats.publishedCount} label="Published" icon="✅" delay={150} />
              <StatCard value={stats.totalLikes} label="Total Likes" icon="❤️" delay={200} />
              <StatCard value={stats.totalShares} label="Total Shares" icon="🔗" delay={250} />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Quick Links */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="text-lg font-semibold gradient-text-purple mb-4">Quick Links</h3>
                <QuickLink
                  href="/timeline"
                  icon="📜"
                  title="Timeline"
                  description="ดูประวัติคอนเทนต์ทั้งหมด"
                  color="from-violet-500 to-purple-600"
                  delay={100}
                />
                <QuickLink
                  href="/schedule"
                  icon="📅"
                  title="Schedule"
                  description="จัดตาราง auto-post"
                  color="from-blue-500 to-cyan-500"
                  delay={150}
                />
                <QuickLink
                  href="/gallery"
                  icon="🖼️"
                  title="Gallery"
                  description="รวมคอนเทนต์ที่สร้างแล้ว"
                  color="from-pink-500 to-rose-500"
                  delay={200}
                />
                <QuickLink
                  href="/settings"
                  icon="⚙️"
                  title="Settings"
                  description="ตั้งค่าระบบ"
                  color="from-gray-500 to-slate-600"
                  delay={250}
                />

                {/* Time Slots */}
                <JellyCard className="glass-card p-4 mt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">⏰ ช่วงเวลาโพสต์</h4>
                  <div className="space-y-2">
                    {TIME_SLOTS.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-3 text-sm">
                        <span className="text-lg">{slot.emoji}</span>
                        <span className="text-foreground">{slot.nameTh}</span>
                        <span className="text-xs text-muted ml-auto">
                          {slot.startHour}:00-{slot.endHour}:00
                        </span>
                      </div>
                    ))}
                  </div>
                </JellyCard>
              </div>

              {/* Content Types Grid */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold gradient-text-cyan mb-4">ประเภทคอนเทนต์ที่รองรับ</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CONTENT_TYPES.map((type, index) => (
                    <FeatureCard
                      key={type.id}
                      icon={type.icon}
                      title={type.nameTh}
                      description={type.descriptionTh}
                      color={type.color}
                      delay={50 * (index + 1)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <JellyCard className="glass-card p-6 text-center">
              <h3 className="text-xl font-bold gradient-text-purple mb-2">พร้อมเริ่มสร้างคอนเทนต์?</h3>
              <p className="text-sm text-muted mb-4">เริ่มต้นสร้าง Pixel Art content อัตโนมัติได้เลย</p>
              <div className="flex justify-center">
                <Link href="/dashboard">
                  <JellyButton variant="primary" size="lg">
                    <span>🚀</span>
                    <span>ไปหน้า Dashboard</span>
                  </JellyButton>
                </Link>
              </div>
            </JellyCard>
          </>
        )}
      </div>
    </MainLayout>
  );
}
