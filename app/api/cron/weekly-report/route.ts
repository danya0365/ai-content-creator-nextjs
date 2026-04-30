import { authorizeCronRequest } from '@/src/infrastructure/auth/cron-auth';
import { createAdminCronWeeklyReportPresenter } from '@/src/presentation/presenters/cron/CronWeeklyReportPresenterAdminFactory';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Cron Job API Route for Weekly Report
 * POST /api/cron/weekly-report
 * 
 * ✅ Refactored to Clean Architecture (Presenter Pattern)
 */

export async function POST(request: NextRequest) {
  const isAuthorized = await authorizeCronRequest(request);
  
  const presenter = createAdminCronWeeklyReportPresenter();
  const result = await presenter.handleGenerateReportRequest(isAuthorized);

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
