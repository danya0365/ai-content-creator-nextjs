import { authorizeCronRequest } from '@/src/infrastructure/auth/cron-auth';
import { createAdminCronPublisherPresenter } from '@/src/presentation/presenters/cron/CronPublisherPresenterAdminFactory';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Cron Job API Route for Publishing Scheduled Content
 * POST /api/cron/publish
 * 
 * ✅ Refactored to Clean Architecture (Presenter Pattern)
 */

export async function POST(request: NextRequest) {
  const isAuthorized = await authorizeCronRequest(request);
  
  const presenter = createAdminCronPublisherPresenter();
  const result = await presenter.handlePublishRequest(isAuthorized);

  if (result.status && result.status !== 200) {
    const { status, ...body } = result;
    return NextResponse.json(body, { status });
  }

  return NextResponse.json(result);
}

// Also allow GET for easier testing
export async function GET(request: NextRequest) {
  return POST(request);
}
