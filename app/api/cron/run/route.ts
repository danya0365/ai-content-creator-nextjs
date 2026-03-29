import { authorizeCronRequest } from '@/src/infrastructure/auth/cron-auth';
import { createServerSchedulerPresenter } from '@/src/presentation/presenters/scheduler/SchedulerPresenterServerFactory';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Scheduler API Route (Laravel-style)
 * =====================================
 * 
 * VPS cron ต้องเรียก endpoint นี้ทุกนาที:
 * * * * * * curl -s http://localhost:3000/api/cron/run >/dev/null 2>&1
 */

export async function POST(request: NextRequest) {
  const isAuthorized = await authorizeCronRequest(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cronSecret = request.headers.get('x-cron-secret') || process.env.CRON_SECRET || '';
  const result = await createServerSchedulerPresenter().handleRunRequest(cronSecret);
  
  return NextResponse.json(result);
}

export async function GET(request: NextRequest) {
  const isAuthorized = await authorizeCronRequest(request);
  const cronSecret = request.headers.get('x-cron-secret') || process.env.CRON_SECRET || '';

  const result = await createServerSchedulerPresenter().handleStatusRequest(isAuthorized, cronSecret);
  
  if (result.error) {
    return NextResponse.json(result, { status: 401 });
  }

  return NextResponse.json(result);
}
