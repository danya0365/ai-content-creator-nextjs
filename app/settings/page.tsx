import { SettingsView } from "@/src/presentation/components/settings/SettingsView";
import { createServerSettingsPresenter } from "@/src/presentation/presenters/settings/SettingsPresenterServerFactory";
import type { Metadata } from "next";
import Link from "next/link";

// Tell Next.js this is a dynamic page
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Generate metadata for the settings page
 */
export async function generateMetadata(): Promise<Metadata> {
  const presenter = createServerSettingsPresenter();
  return presenter.generateMetadata();
}

/**
 * Settings page - Server Component for SEO optimization
 * Uses presenter pattern following Clean Architecture
 */
export default async function SettingsPage() {
  const presenter = createServerSettingsPresenter();

  try {
    const viewModel = await presenter.getViewModel();
    return <SettingsView initialViewModel={viewModel} />;
  } catch (error) {
    console.error("Error fetching settings data:", error);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            เกิดข้อผิดพลาด
          </h1>
          <p className="text-muted mb-4">ไม่สามารถโหลดข้อมูล Settings ได้</p>
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
