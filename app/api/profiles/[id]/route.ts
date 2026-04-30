// TODO: Refactor according to CREATE_PAGE_PATTERN.md - Move business logic and direct DB/Repository access to Server Presenter
import { SupabaseProfileRepository } from '@/src/infrastructure/repositories/supabase/SupabaseProfileRepository';
import { createClient } from '@/src/infrastructure/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const repository = new SupabaseProfileRepository(supabase);
    
    const profile = await repository.getProfile(id);
    if (!profile) {
      return NextResponse.json({ error: 'ไม่พบโปรไฟล์' }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'รหัสข้อผิดพลาดของเซิร์ฟเวอร์' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();
    const repository = new SupabaseProfileRepository(supabase);
    
    const profile = await repository.updateProfile(id, body);
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'รหัสข้อผิดพลาดของเซิร์ฟเวอร์' }, { status: 500 });
  }
}
