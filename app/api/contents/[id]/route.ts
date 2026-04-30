import { createServerContentPresenter } from '@/src/presentation/presenters/content/ContentPresenterServerFactory';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const presenter = createServerContentPresenter();

    const content = await presenter.getById(id);
    if (!content) {
      return NextResponse.json({ error: 'ไม่พบคอนเทนต์' }, { status: 404 });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('[API Content ID] GET Error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    const presenter = createServerContentPresenter();
    
    const content = await presenter.update(id, data);
    return NextResponse.json(content);
  } catch (error) {
    console.error('[API Content ID] PUT Error:', error);
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปเดตคอนเทนต์';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const presenter = createServerContentPresenter();

    const success = await presenter.delete(id);
    if (!success) {
      return NextResponse.json({ error: 'ไม่สามารถลบคอนเทนต์ได้' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Content ID] DELETE Error:', error);
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบคอนเทนต์';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
