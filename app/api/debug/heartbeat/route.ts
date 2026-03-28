import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const now = new Date();
  console.log(`[Heartbeat] Received at ${now.toISOString()}`);
  
  return NextResponse.json({
    success: true,
    message: 'Heartbeat received',
    timestamp: now.toISOString(),
  });
}
