import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const adminRoles = new Set(['admin', 'super_admin']);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'mathlers-secret-key-change-in-production',
  });

  if (!token) {
    const login = new URL('/login', request.url);
    login.searchParams.set('callbackUrl', request.nextUrl.href);
    return NextResponse.redirect(login);
  }

  const role = token.role as string | undefined;
  if (pathname.startsWith('/admin') && !adminRoles.has(role || '')) {
    return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }

  if (pathname.startsWith('/student') && role !== 'student') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*'],
};
