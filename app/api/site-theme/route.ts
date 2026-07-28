import { NextResponse } from 'next/server';
import { getSiteTheme } from '@/lib/theme/siteTheme';

export const revalidate = 60;

export async function GET() {
  const theme = await getSiteTheme();
  return NextResponse.json(
    { theme },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  );
}
