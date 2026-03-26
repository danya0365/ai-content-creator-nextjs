import { createServerTrendsPresenter } from '@/src/presentation/presenters/trends/TrendsPresenterServerFactory';
import TrendsView from '@/src/presentation/components/trends/TrendsView';

export async function generateMetadata() {
  const presenter = createServerTrendsPresenter();
  return presenter.generateMetadata();
}

export const revalidate = 3600; // revalidate at most every hour

export default async function TrendsPage() {
  const presenter = createServerTrendsPresenter();
  const viewModel = await presenter.getViewModel(20);

  return <TrendsView initialViewModel={viewModel} />;
}
