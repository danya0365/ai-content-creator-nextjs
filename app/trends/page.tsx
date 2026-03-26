import { GoogleTrendsService } from '@/src/infrastructure/services/GoogleTrendsService';
import TrendsView from '@/src/presentation/components/trends/TrendsView';

export const metadata = {
  title: 'Google Trends Explorer | AI Content Creator',
  description: 'Explore realtime search trends in Thailand and instantly generate AI content.',
};

export const revalidate = 3600; // revalidate at most every hour

export default async function TrendsPage() {
  const initialTrends = await GoogleTrendsService.getDetailedTrends(20);

  return (
    <main className="min-h-screen bg-background flex flex-col pt-16 md:pt-20 pb-20 md:pb-6 relative overflow-hidden">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col h-full">
        <TrendsView initialTrends={initialTrends} />
      </div>
      
      {/* Background Decorators */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '6s' }} />
    </main>
  );
}
