import { authorizeCronRequest } from '@/src/infrastructure/auth/cron-auth';
import { createAdminCronGeneratorPresenter } from '@/src/presentation/presenters/cron/CronGeneratorPresenterAdminFactory';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Cron Job API Route for Auto-generating Content
 * POST /api/cron/generate
 * 
 * ✅ Refactored to Clean Architecture (Presenter Pattern)
 */

export async function POST(request: NextRequest) {
  const isAuthorized = await authorizeCronRequest(request);
  
  // Extract requested type if any
  const { searchParams } = new URL(request.url);
  const requestedType = searchParams.get('type');

  const presenter = createAdminCronGeneratorPresenter();
  const result = await presenter.handleGenerateRequest(isAuthorized, requestedType);

  if (!result.success && result.error === 'Unauthorized') {
    return NextResponse.json(result, { status: 401 });
  }

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}

// Also allow GET for easier testing
export async function GET(request: NextRequest) {
  return POST(request);
}
