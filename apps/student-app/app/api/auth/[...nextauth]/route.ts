import { NextResponse } from 'next/server';

const retired = () => NextResponse.json({ error: 'This authentication endpoint has been retired. Use Clerk sign-in.' }, { status: 410 });

export const GET = retired;
export const POST = retired;
