import { ContentEditView } from "@/src/presentation/components/content/ContentEditView";
import { createServerContentEditPresenter } from "@/src/presentation/presenters/content/ContentEditPresenterServerFactory";
import type { Metadata } from "next";
import Link from "next/link";

// Tell Next.js this is a dynamic page
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface ContentEditPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generate metadata for the content edit page
 */
export async function generateMetadata({
  params,
}: ContentEditPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const presenter = await createServerContentEditPresenter();
  return presenter.generateMetadata(resolvedParams.id);
}

/**
 * Content Edit page - Server Component for SEO optimization
 * Uses presenter pattern following Clean Architecture
 */
export default async function ContentEditPage({ params }: ContentEditPageProps) {
  const resolvedParams = await params;
  const presenter = await createServerContentEditPresenter();

  try {
    const viewModel = await presenter.getViewModel(resolvedParams.id);
    return <ContentEditView contentId={resolvedParams.id} initialViewModel={viewModel} />;
  } catch (error) {
    console.error("Error fetching content for edit:", error);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            เกิดข้อผิดพลาด
          </h1>
          <p className="text-muted mb-4">ไม่สามารถโหลดข้อมูลคอนเทนต์เพื่อแก้ไขได้</p>
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
