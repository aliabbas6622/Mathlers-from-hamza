import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth, isSuperAdmin } from '@mathlers/lib/auth';
import connectDB from '@mathlers/lib/db';
import PracticeSetModel from '@mathlers/models/PracticeSet';

const authorized = async () => {
  const session = await auth();
  return session && isSuperAdmin(session.user.role);
};

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await authorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid practice book' }, { status: 400 });
  await connectDB();
  await PracticeSetModel.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await authorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await request.json() as { isPublished?: boolean };
  if (!mongoose.isValidObjectId(id) || typeof body.isPublished !== 'boolean') {
    return NextResponse.json({ error: 'Invalid practice book update' }, { status: 400 });
  }
  await connectDB();
  const practice = await PracticeSetModel.findByIdAndUpdate(id, { isPublished: body.isPublished }, { returnDocument: 'after' });
  if (!practice) return NextResponse.json({ error: 'Practice book not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: practice });
}
