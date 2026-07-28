import { NextRequest, NextResponse } from 'next/server';
import { auth, isSuperAdmin } from '@mathlers/lib/auth';
import connectDB from '@mathlers/lib/db';
import SubjectModel from '@mathlers/models/Subject';
import TopicModel from '@mathlers/models/Topic';
import ChapterModel from '@mathlers/models/Chapter';
import QuestionModel from '@mathlers/models/Question';
import GradeModel from '@mathlers/models/Grade';
import mongoose from 'mongoose';

const requireSuperAdmin = async () => {
  const session = await auth();
  return session && isSuperAdmin(session.user.role);
};

const validIds = (value: unknown): value is string[] => Array.isArray(value)
  && value.every((id) => typeof id === 'string' && mongoose.isValidObjectId(id));

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid subject' }, { status: 400 });
    const body = await request.json() as { name?: string; code?: string; grades?: unknown; description?: string; color?: string; order?: number; isActive?: boolean };
    if (body.grades !== undefined && !validIds(body.grades)) return NextResponse.json({ error: 'Grades must be valid identifiers' }, { status: 400 });
    const grades = body.grades === undefined ? undefined : [...new Set(body.grades)];
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
  if (!await requireSuperAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid subject' }, { status: 400 });
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
