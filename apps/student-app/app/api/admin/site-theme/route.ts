import { NextRequest, NextResponse } from 'next/server';
import { auth, isSuperAdmin } from '@mathlers/lib/auth';
import { isThemeScope, normalizePalette } from '@mathlers/lib/theme';
import { getSiteTheme, saveThemePalette } from '@mathlers/lib/theme/site';

export const dynamic = 'force-dynamic';

async function canManageTheme() {
  const session = await auth();
  return session && isSuperAdmin(session.user.role);
}

export async function GET() {
  if (!await canManageTheme()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ theme: await getSiteTheme() }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request: NextRequest) {
  if (!await canManageTheme()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json() as { scope?: unknown; palette?: unknown };
    if (!isThemeScope(body.scope)) return NextResponse.json({ error: 'Invalid theme scope' }, { status: 400 });

    const palette = body.palette === null ? null : normalizePalette(body.palette);
    if (body.scope === 'global' && !palette) {
      return NextResponse.json({ error: 'The site-wide palette cannot be removed' }, { status: 400 });
    }
    if (body.palette !== null && !palette) {
      return NextResponse.json({ error: 'Each color must be a six-digit hex value' }, { status: 400 });
    }

    return NextResponse.json({ theme: await saveThemePalette(body.scope, palette) });
  } catch {
    return NextResponse.json({ error: 'Unable to save theme settings' }, { status: 400 });
  }
}
