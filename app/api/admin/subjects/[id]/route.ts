import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import SubjectModel from '@/models/Subject';
import TopicModel from '@/models/Topic';
import ChapterModel from '@/models/Chapter';
import QuestionModel from '@/models/Question';
import GradeModel from '@/models/Grade';

const isAdmin = async () => {
  const session = await auth();
  return session && ['admin', 'super_admin'].includes(session.user.role);
};

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json() as { name?: string; code?: string; grades?: string[]; description?: string; color?: string; order?: number; isActive?: boolean };
    const grades = body.grades === undefined ? undefined : [...new Set(body.grades.filter(Boolean))];
    if (grades && grades.length && await GradeModel.countDocuments({ _id: { $in: grades } }) !== grades.length) {
      return NextResponse.json({ error: 'One or more grades are invalid' }, { status: 400 });
    }
    const subject = await SubjectModel.findByIdAndUpdate(
      id,
      {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.code !== undefined && { code: body.code.trim().toUpperCase() }),
        ...(grades !== undefined && { grades }),
        ...(body.description !== undefined && { description: body.description.trim() }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.order !== undefined && { order: Number(body.order) || 0 }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
      { returnDocument: 'after', runValidators: true }
    ).populate('grades', 'name code');
    if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: subject });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update subject' }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const [questions, chapters, topics] = await Promise.all([
    QuestionModel.countDocuments({ subject: id }),
    ChapterModel.countDocuments({ subject: id }),
    TopicModel.countDocuments({ $or: [{ subject: id }, { subjects: id }] }),
  ]);
  if (questions || chapters || topics) {
    return NextResponse.json({ error: 'This subject is already used by the question bank or its curriculum. Remove those links first.' }, { status: 409 });
  }

  const subject = await SubjectModel.findByIdAndDelete(id);
  if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
