'use client';

import { useEffect } from 'react';
import { TrendItem } from '@/src/application/repositories/ITrendsRepository';
import { useGenerateStore } from '@/src/presentation/stores/useGenerateStore';
import { useTrendsPresenter } from '@/src/presentation/presenters/trends/useTrendsPresenter';
import { TrendsViewModel } from '@/src/presentation/presenters/trends/TrendsPresenter';
import { useRouter } from 'next/navigation';

import { JellyCard } from '@/src/presentation/components/ui/JellyCard';
import { JellyButton } from '@/src/presentation/components/ui/JellyButton';
import { animated, config, useSpring, useTrail } from '@react-spring/web';

export default function TrendsView({ initialViewModel }: { initialViewModel: TrendsViewModel }) {
  const router = useRouter();
  const openModal = useGenerateStore((state) => state.openModal);
  
  const { trends, setViewModel } = useTrendsPresenter();

  // Hydrate initial state from server
  useEffect(() => {
    setViewModel(initialViewModel);
  }, [initialViewModel, setViewModel]);

  const displayTrends = trends.length > 0 ? trends : initialViewModel.trends;

  const handleCreateContent = (trend: TrendItem) => {
    // Open the modal with the pre-filled topic containing the trend title and context
    openModal({
      topic: `${trend.title}: ${trend.newsTitle || ''}`.trim(),
    });
    // Jump back to dashboard to actually see the widget pop up nicely
    router.push('/dashboard');
  };

  const headerSpring = useSpring({
    from: { opacity: 0, y: -10 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  const trail = useTrail(displayTrends.length, {
    from: { opacity: 0, y: 20, scale: 0.95 },
    to: { opacity: 1, y: 0, scale: 1 },
    config: config.gentle,
    delay: 100,
  });

  return (
    <>
      <div className="h-full overflow-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-8 space-y-6">
          
          {/* Header Section */}
          <animated.div style={headerSpring} className="text-center max-w-2xl mx-auto space-y-4 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-4xl mb-2 text-violet-400 ring-2 ring-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              📈
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold gradient-text-purple">
              Trendjacking AI
            </h1>
            <p className="text-muted text-sm md:text-base">
              สำรวจคำค้นหายอดฮิตในประเทศไทยแบบเรียลไทม์ และนำมาสร้างคอนเทนต์เกาะกระแสได้ทันทีด้วย AI แบบไร้รอยต่อ
            </p>
          </animated.div>

          {/* Grid of Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trail.map((props, index) => {
              const trend = displayTrends[index];
              return (
                <animated.div key={trend.id || index} style={props}>
                  {/* Using our unified JellyCard style */}
                  <JellyCard className="group relative h-80 overflow-hidden glass-card-hover flex flex-col justify-end p-0">
                    
                    {/* Background Image Setup */}
                    {trend.picture ? (
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                        style={{ backgroundImage: `url(${trend.picture})` }} 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 transition-transform duration-700 ease-out group-hover:scale-110" />
                    )}

                    {/* Overlay Gradient (always active to ensure text is readable) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent pointer-events-none" />
                    
                    {/* Traffic Badge */}
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/50 backdrop-blur-md border border-border/50 text-xs font-bold text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                      <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse shadow-[0_0_5px_rgba(217,70,239,0.8)]" />
                      {trend.traffic || 'Trending'}
                    </div>

                    {/* Source Badge */}
                    {trend.pictureSource && (
                      <div className="absolute top-4 right-4 text-[10px] uppercase font-bold text-white/50 tracking-wider">
                        {trend.pictureSource}
                      </div>
                    )}

                    {/* Content Area */}
                    <div className="relative z-10 p-5 transform transition-transform duration-300">
                      <h3 className="text-xl font-bold text-white mb-2 leading-tight line-clamp-2 drop-shadow-md group-hover:text-violet-300 transition-colors">
                        {trend.title}
                      </h3>
                      
                      {/* Hide details unless hovered to keep UI clean, expand on hover */}
                      <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-32 group-hover:opacity-100 group-hover:mb-4 transition-all duration-300">
                        {trend.newsTitle && (
                          <p className="text-sm text-gray-300 line-clamp-3 mb-2 font-medium">
                            {trend.newsTitle}
                          </p>
                        )}
                        {trend.pubDate && (
                          <p className="text-[10px] text-zinc-500 truncate">
                            {new Date(trend.pubDate).toLocaleString('th-TH')}
                          </p>
                        )}
                      </div>

                      {/* Action Button - Glows using our JellyButton system */}
                      <JellyButton 
                        onClick={() => handleCreateContent(trend)} 
                        variant="primary"  
                        size="md" 
                        className="w-full opacity-60 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                      >
                        ⚡ สร้างคอนเทนต์
                      </JellyButton>
                    </div>
                  </JellyCard>
                </animated.div>
              );
            })}
          </div>

          {/* Empty State */}
          {displayTrends.length === 0 && (
            <div className="py-20 text-center text-muted">
              <p>ขณะนี้ไม่พบข้อมูลยอดฮิต กรุณาลองใหม่ในภายหลัง</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
