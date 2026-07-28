import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { takeRateLimit } from '@/lib/security/rate-limit';

const mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function sensitiveApiLimit(pathname: string) {
  if (pathname === '/api/admin/provision-users' || pathname === '/api/admin/schools') return { key: 'admin-provisioning', limit: 10 };
  if (/^\/api\/competitions\/[^/]+\/(enroll|start|submit)$/.test(pathname)) return { key: 'competition-attempt', limit: 30 };
  if (pathname === '/api/competitions/join-code') return { key: 'competition-code', limit: 30 };
  return undefined;
}

function clientAddress(request: Request) {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

/** Reject cross-site browser writes before they reach an authenticated API route. */
export default clerkMiddleware((_auth, request) => {
  if (!request.nextUrl.pathname.startsWith('/api/') || !mutatingMethods.has(request.method)) return;

  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Cross-site requests are not allowed.' }, { status: 403 });
  }

  const rule = sensitiveApiLimit(request.nextUrl.pathname);
  if (rule) {
    const rateLimit = takeRateLimit(`${rule.key}:${clientAddress(request)}`, rule.limit, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
      );
    }
  }
}, {
  contentSecurityPolicy: {
    strict: true,
    directives: {
      'base-uri': ["'self'"],
      'object-src': ["'none'"],
      'frame-ancestors': ["'none'"],
    },
  },
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
