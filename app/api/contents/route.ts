import { createServerContentPresenter } from '@/src/presentation/presenters/content/ContentPresenterServerFactory';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const presenter = createServerContentPresenter();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // 1. Specialized Actions
    if (action === 'stats') {
      const stats = await presenter.getStats();
      return NextResponse.json(stats);
    }

    if (action === 'analytics') {
      const metrics = await presenter.getAnalytics();
      return NextResponse.json(metrics);
    }

    if (action === 'recentPublished') {
      const limit = parseInt(searchParams.get('limit') || '5');
      const contents = await presenter.getRecentPublished(limit);
      return NextResponse.json(contents);
    }

    if (action === 'scheduled') {
      const contents = await presenter.getScheduled();
      return NextResponse.json(contents);
    }

    // 2. Paginated or Filtered List
    const status = searchParams.get('status');
    const timeSlot = searchParams.get('timeSlot');
    const contentTypeId = searchParams.get('contentTypeId');
    const page = searchParams.get('page');
    const perPage = searchParams.get('perPage');

    const filter: any = {
      status: status || undefined,
      timeSlot: timeSlot || undefined,
      contentTypeId: contentTypeId || undefined,
    };

    if (page && perPage) {
      const result = await presenter.getPaginated(parseInt(page), parseInt(perPage), filter);
      return NextResponse.json(result);
    }

    const contents = await presenter.getAll(filter);
    return NextResponse.json(contents);
    
  } catch (error) {
    console.error('[API Contents] GET Error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const presenter = createServerContentPresenter();
    
    const content = await presenter.create(data);
    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('[API Contents] POST Error:', error);
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างคอนเทนต์';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
