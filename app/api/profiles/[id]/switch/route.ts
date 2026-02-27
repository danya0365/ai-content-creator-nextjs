import { SupabaseProfileRepository } from '@/src/infrastructure/repositories/supabase/SupabaseProfileRepository';
import { createClient } from '@/src/infrastructure/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const repository = new SupabaseProfileRepository(supabase);
    
    const success = await repository.switchProfile(id);
    if (!success) {
      return NextResponse.json({ error: 'ไม่สามารถสลับโปรไฟล์ได้' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'รหัสข้อผิดพลาดของเซิร์ฟเวอร์' }, { status: 500 });
  }
}
