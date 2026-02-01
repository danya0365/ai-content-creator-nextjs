/**
 * Contents API Route
 * GET /api/contents - Get contents with filters
 * POST /api/contents - Create a new content
 * 
 * Uses SupabaseContentRepository for single source of truth
 */

import { CreateContentDTO } from '@/src/application/repositories/IContentRepository';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const repo = new SupabaseContentRepository(supabase);

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const status = searchParams.get('status');
    const timeSlot = searchParams.get('timeSlot');
    const contentTypeId = searchParams.get('contentTypeId');
    const page = searchParams.get('page');
    const perPage = searchParams.get('perPage');

    // Get stats
    if (action === 'stats') {
      const stats = await repo.getStats();
      return NextResponse.json(stats);
    }

    // Get recent published
    if (action === 'recentPublished') {
      const limit = parseInt(searchParams.get('limit') || '5');
      const contents = await repo.getRecentPublished(limit);
      return NextResponse.json(contents);
    }

    // Get scheduled
    if (action === 'scheduled') {
      const contents = await repo.getScheduled();
      return NextResponse.json(contents);
    }

    // Get paginated
    if (page && perPage) {
      const filter = {
        status: status as 'draft' | 'scheduled' | 'published' | 'failed' | undefined,
        timeSlot: timeSlot as 'morning' | 'lunch' | 'afternoon' | 'evening' | undefined,
        contentTypeId: contentTypeId || undefined,
      };
      const result = await repo.getPaginated(parseInt(page), parseInt(perPage), filter);
      return NextResponse.json(result);
    }

    // Get all with filter
    const filter = {
      status: status as 'draft' | 'scheduled' | 'published' | 'failed' | undefined,
      timeSlot: timeSlot as 'morning' | 'lunch' | 'afternoon' | 'evening' | undefined,
      contentTypeId: contentTypeId || undefined,
    };
    const contents = await repo.getAll(filter);
    return NextResponse.json(contents);
  } catch (error) {
    console.error('Error in contents API:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const repo = new SupabaseContentRepository(supabase);

    const data: CreateContentDTO = await request.json();

    // Validate required fields
    if (!data.contentTypeId || !data.title || !data.description) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const content = await repo.create(data);
    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างคอนเทนต์';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
