// TODO: Refactor according to CREATE_PAGE_PATTERN.md - Move business logic and direct DB/Repository access to Server Presenter
import { SupabaseProfileRepository } from '@/src/infrastructure/repositories/supabase/SupabaseProfileRepository';
import { createClient } from '@/src/infrastructure/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const repository = new SupabaseProfileRepository(supabase);
    
    const profiles = await repository.getProfiles();
    return NextResponse.json(profiles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'รหัสข้อผิดพลาดของเซิร์ฟเวอร์' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();
    const repository = new SupabaseProfileRepository(supabase);
    
    const profile = await repository.createProfile(body);
    if (!profile) {
      return NextResponse.json({ error: 'ไม่สามารถสร้างโปรไฟล์ได้' }, { status: 400 });
    }
    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'รหัสข้อผิดพลาดของเซิร์ฟเวอร์' }, { status: 500 });
  }
}
