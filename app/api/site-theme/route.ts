import { NextResponse } from 'next/server';
import { getSiteTheme } from '@/lib/theme/siteTheme';

export const dynamic = 'force-dynamic';

export async function GET() {
  const theme = await getSiteTheme();
  return NextResponse.json({ theme }, { headers: { 'Cache-Control': 'no-store' } });
}
