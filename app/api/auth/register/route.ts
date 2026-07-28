import { NextResponse } from 'next/server';

export const POST = () => NextResponse.json({ error: 'This authentication endpoint has been retired. Request organization access or use an invitation.' }, { status: 410 });
