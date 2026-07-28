import { NextResponse } from 'next/server';

export const POST = () => NextResponse.json({ error: 'This authentication endpoint has been retired. Use Clerk sign-in.' }, { status: 410 });
