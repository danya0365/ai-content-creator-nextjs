'use client';

import { CONTENT_TYPES, TIME_SLOTS } from '@/src/data/master/contentTypes';
import { getContentStats } from '@/src/data/mock/mockContents';
import { animated, config, useSpring } from '@react-spring/web';
import { MainLayout } from '../layout/MainLayout';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  delay: number;
}

function FeatureCard({ icon, title, description, color, delay }: FeatureCardProps) {
  const springProps = useSpring({
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0 },
    delay,
    config: config.gentle,
  });

  return (
    <animated.div
      style={springProps}
      className="glass-card-hover p-6 group cursor-pointer"
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300"
        style={{ backgroundColor: `${color}20` }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
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
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1 },
    delay,
    config: config.wobbly,
  });

  return (
    <animated.div
      style={springProps}
      className="glass-card p-4 text-center"
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold gradient-text-purple">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </animated.div>
  );
}

/**
 * HomeView component
 * Landing page for AI Content Creator
 */
export function HomeView() {
  const stats = getContentStats();

  const heroSpring = useSpring({
    from: { opacity: 0, y: -20 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  const ctaSpring = useSpring({
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 1, scale: 1 },
    delay: 400,
    config: config.gentle,
  });

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Hero Section */}
        <section className="flex-shrink-0 px-6 py-8 md:py-12">
          <animated.div style={heroSpring} className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-violet-400">Powered by Gemini AI</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="gradient-text-purple">AI Content Creator</span>
            </h1>
            <h2 className="text-xl md:text-2xl text-muted mb-6">
              สร้างคอนเทนต์ Pixel Art อัตโนมัติ ตามช่วงเวลา
            </h2>

            {/* Description */}
            <p className="text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
              Generate รูปภาพ pixel art น่ารักๆ พร้อมโพสต์ตาม schedule อัตโนมัติ
              ไม่ว่าจะเป็นสรุปข่าวเช้า รูปอาหาร หรือมีมตลกๆ ตอนเย็น
            </p>

            {/* CTA Buttons */}
            <animated.div style={ctaSpring} className="flex flex-wrap justify-center gap-4">
              <button className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  <span>✨</span>
                  <span>เริ่มสร้างคอนเทนต์</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              <button className="px-8 py-4 rounded-2xl glass-card-hover text-foreground font-semibold flex items-center gap-2">
                <span>📖</span>
                <span>ดูตัวอย่าง</span>
              </button>
            </animated.div>
          </animated.div>
        </section>

        {/* Stats Section */}
        <section className="flex-shrink-0 px-6 py-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={stats.totalContents} label="Total Contents" icon="📝" delay={200} />
            <StatCard value={stats.publishedCount} label="Published" icon="✅" delay={300} />
            <StatCard value={stats.totalLikes} label="Total Likes" icon="❤️" delay={400} />
            <StatCard value={stats.totalShares} label="Total Shares" icon="🔗" delay={500} />
          </div>
        </section>

        {/* Features Grid */}
        <section className="flex-1 px-6 py-6 overflow-auto scrollbar-thin">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-xl font-semibold text-center mb-6 gradient-text-cyan">
              ประเภทคอนเทนต์ที่รองรับ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CONTENT_TYPES.map((type, index) => (
                <FeatureCard
                  key={type.id}
                  icon={type.icon}
                  title={type.nameTh}
                  description={type.descriptionTh}
                  color={type.color}
                  delay={100 * (index + 1)}
                />
              ))}
            </div>

            {/* Time Slots */}
            <div className="mt-8 mb-4">
              <h3 className="text-xl font-semibold text-center mb-6 gradient-text-purple">
                ช่วงเวลาโพสต์อัตโนมัติ
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {TIME_SLOTS.map((slot) => (
                  <div
                    key={slot.id}
                    className="glass-card px-6 py-3 flex items-center gap-3"
                  >
                    <span className="text-2xl">{slot.emoji}</span>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{slot.nameTh}</div>
                      <div className="text-xs text-muted">
                        {slot.startHour}:00 - {slot.endHour}:00
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
