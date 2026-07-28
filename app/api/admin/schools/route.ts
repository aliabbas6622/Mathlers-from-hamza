import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth, isSuperAdmin } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import SchoolModel from '@/models/School';

const schoolSchema = z.object({
  name: z.string().trim().min(2).max(150),
  city: z.string().trim().min(2).max(100),
  address: z.string().trim().min(5).max(300),
  contactNumber: z.string().trim().min(7).max(30),
  email: z.string().trim().email().optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isSuperAdmin(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const input = schoolSchema.parse(await request.json());
    await connectDB();
    if (await SchoolModel.exists({ name: input.name, city: input.city })) return NextResponse.json({ error: 'This school already exists in the selected city.' }, { status: 409 });
    const school = await SchoolModel.create({ ...input, email: input.email || undefined });
    return NextResponse.json({ school: { id: school._id.toString(), name: school.name } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: 'Unable to create school.' }, { status: 500 });
  }
}
