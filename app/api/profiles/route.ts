import { createServerProfilePresenter } from '@/src/presentation/presenters/profile/ProfilePresenterServerFactory';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const presenter = await createServerProfilePresenter();
    const profiles = await presenter.getProfiles();
    return NextResponse.json(profiles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'รหัสข้อผิดพลาดของเซิร์ฟเวอร์' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const presenter = await createServerProfilePresenter();
    
    const profile = await presenter.createProfile(body);
    if (!profile) {
      return NextResponse.json({ error: 'ไม่สามารถสร้างโปรไฟล์ได้' }, { status: 400 });
    }
    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'รหัสข้อผิดพลาดของเซิร์ฟเวอร์' }, { status: 500 });
  }
}
