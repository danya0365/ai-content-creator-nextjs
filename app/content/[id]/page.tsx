import { ContentDetailView } from "@/src/presentation/components/content/ContentDetailView";
import { createServerContentDetailPresenter } from "@/src/presentation/presenters/content/ContentDetailPresenterServerFactory";
import type { Metadata } from "next";
import Link from "next/link";

// Tell Next.js this is a dynamic page
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface ContentDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generate metadata for the content detail page
 */
export async function generateMetadata({
  params,
}: ContentDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const presenter = await createServerContentDetailPresenter();
  return presenter.generateMetadata(resolvedParams.id);
}

/**
 * Content Detail page - Server Component for SEO optimization
 * Uses presenter pattern following Clean Architecture
 */
export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  const resolvedParams = await params;
  const presenter = await createServerContentDetailPresenter();

  try {
    const viewModel = await presenter.getViewModel(resolvedParams.id);
    return <ContentDetailView contentId={resolvedParams.id} initialViewModel={viewModel} />;
  } catch (error) {
    console.error("Error fetching content detail:", error);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            เกิดข้อผิดพลาด
          </h1>
          <p className="text-muted mb-4">ไม่สามารถโหลดข้อมูลคอนเทนต์ได้</p>
          <Link
            href="/gallery"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            กลับ Gallery
          </Link>
        </div>
      </div>
    );
  }
}
