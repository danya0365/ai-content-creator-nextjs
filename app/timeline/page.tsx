import { TimelineView } from "@/src/presentation/components/timeline/TimelineView";
import { createServerTimelinePresenter } from "@/src/presentation/presenters/timeline/TimelinePresenterServerFactory";
import type { Metadata } from "next";
import Link from "next/link";

// Tell Next.js this is a dynamic page
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Generate metadata for the timeline page
 */
export async function generateMetadata(): Promise<Metadata> {
  const presenter = createServerTimelinePresenter();
  return presenter.generateMetadata();
}

/**
 * Timeline page - Server Component for SEO optimization
 * Uses presenter pattern following Clean Architecture
 */
export default async function TimelinePage() {
  const presenter = createServerTimelinePresenter();

  try {
    const viewModel = await presenter.getViewModel();
    return <TimelineView initialViewModel={viewModel} />;
  } catch (error) {
    console.error("Error fetching timeline data:", error);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            เกิดข้อผิดพลาด
          </h1>
          <p className="text-muted mb-4">ไม่สามารถโหลดข้อมูล Timeline ได้</p>
          <Link
            href="/"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }
}
