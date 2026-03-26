'use client';

import { useState } from 'react';
import { TrendItem } from '@/src/infrastructure/services/GoogleTrendsService';
import { useGenerateStore } from '@/src/presentation/stores/useGenerateStore';
import { useRouter } from 'next/navigation';

export default function TrendsView({ initialTrends }: { initialTrends: TrendItem[] }) {
  const router = useRouter();
  const openModal = useGenerateStore((state) => state.openModal);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleCreateContent = (trend: TrendItem) => {
    // Open the modal with the pre-filled topic containing the trend title
    openModal({
      topic: `${trend.title}: ${trend.newsTitle || ''}`.trim(),
    });
    // Immediately push back to dashboard where the modal resides
    router.push('/dashboard');
  };

  return (
    <div className="space-y-8 animate-fade-in py-8">
      {/* Header section */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 text-4xl mb-2 ring-1 ring-orange-500/30">
          🔥
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-400 via-red-400 to-rose-400 text-transparent bg-clip-text">
          Google Trends Explorer
        </h1>
        <p className="text-muted text-sm md:text-base">
          สำรวจคำค้นหายอดฮิตในประเทศไทยแบบเรียลไทม์ และนำมาสร้างคอนเทนต์เกาะกระแสได้ทันทีด้วย AI
        </p>
      </div>

      {/* Grid of Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-6">
        {initialTrends.map((trend, index) => (
          <div
            key={index}
            className="group relative h-80 rounded-2xl overflow-hidden glass-card transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 flex flex-col justify-end"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Background Image Setup */}
            {trend.picture && (
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: `url(${trend.picture})` }} 
              />
            )}
            
            {/* Fallback gradient if no picture */}
            {!trend.picture && (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 transition-transform duration-700 ease-out group-hover:scale-110" />
            )}

            {/* Overlay Gradient (always active to ensure text is readable) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent pointer-events-none" />
            
            {/* Traffic Badge */}
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-lg">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {trend.traffic || 'Trending'} Searches
            </div>

            {/* Source Badge */}
            {trend.pictureSource && (
              <div className="absolute top-4 right-4 text-[10px] uppercase font-bold text-white/50 tracking-wider">
                {trend.pictureSource}
              </div>
            )}

            {/* Content Area */}
            <div className="relative z-10 p-5 transform transition-transform duration-300">
              <h3 className="text-xl font-bold text-white mb-2 leading-tight line-clamp-2 drop-shadow-lg">
                {trend.title}
              </h3>
              
              <div className={`transition-all duration-300 overflow-hidden ${hoveredIndex === index ? 'max-h-32 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                {trend.newsTitle && (
                  <p className="text-sm text-gray-300 line-clamp-3 mb-2 font-medium">
                    {trend.newsTitle}
                  </p>
                )}
                {trend.pubDate && (
                  <p className="text-[10px] text-gray-500 truncate">
                    {new Date(trend.pubDate).toLocaleString('th-TH')}
                  </p>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleCreateContent(trend)}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                  hoveredIndex === index 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-500/25 scale-100' 
                    : 'bg-white/10 text-white backdrop-blur-md hover:bg-white/20 scale-95 opacity-80'
                }`}
              >
                <span>🔥</span> สร้างคอนเทนต์เกาะกระแส
              </button>
            </div>
          </div>
        ))}
        {initialTrends.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted">
            <p>ขณะนี้ไม่พบข้อมูลยอดฮิต กรุณาลองใหม่ในภายหลัง</p>
          </div>
        )}
      </div>
    </div>
  );
}
