import { SchedulerView } from "@/src/presentation/components/scheduler/SchedulerView";
import { createServerSchedulerPresenter } from "@/src/presentation/presenters/scheduler/SchedulerPresenterServerFactory";
import type { Metadata } from "next";
import Link from "next/link";

// Tell Next.js this is a dynamic page
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Generate metadata for the scheduler page
 */
export async function generateMetadata(): Promise<Metadata> {
  const presenter = createServerSchedulerPresenter();
  return presenter.generateMetadata();
}

/**
 * Scheduler Debug page - Server Component for SEO and performance
 * Uses presenter pattern following Clean Architecture
 */
export default async function SchedulerPage() {
  const presenter = createServerSchedulerPresenter();

  try {
    // Get view model from presenter for initial render
    const viewModel = await presenter.getViewModel();

    return (
      <SchedulerView initialViewModel={viewModel} />
    );
  } catch (error) {
    console.error("Error fetching scheduler data:", error);

    // Fallback UI
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌪️</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            เกิดข้อผิดพลาด
          </h1>
          <p className="text-muted mb-6">ไม่สามารถโหลดข้อมูล Scheduler ได้</p>
          <Link
            href="/settings"
            className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/20"
          >
            กลับหน้า Settings
          </Link>
        </div>
      </div>
    );
  }
}
