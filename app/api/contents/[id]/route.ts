/**
 * Content by ID API Route
 * GET /api/contents/[id] - Get content by ID
 * PUT /api/contents/[id] - Update content
 * DELETE /api/contents/[id] - Delete content
 * 
 * Uses SupabaseContentRepository for single source of truth
 */

import { UpdateContentDTO } from '@/src/application/repositories/IContentRepository';
import { SupabaseContentRepository } from '@/src/infrastructure/repositories/SupabaseContentRepository';
import { createAdminClient } from '@/src/infrastructure/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const supabase = createAdminClient();
    const repo = new SupabaseContentRepository(supabase);

    const content = await repo.getById(id);
    if (!content) {
      return NextResponse.json(
        { error: 'ไม่พบคอนเทนต์' },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const supabase = createAdminClient();
    const repo = new SupabaseContentRepository(supabase);

    const data: UpdateContentDTO = await request.json();
    const content = await repo.update(id, data);

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error updating content:', error);
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปเดตคอนเทนต์';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const supabase = createAdminClient();
    const repo = new SupabaseContentRepository(supabase);

    const success = await repo.delete(id);
    if (!success) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบคอนเทนต์ได้' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบคอนเทนต์';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
