import { NextRequest, NextResponse } from 'next/server';
import { auth, isSuperAdmin } from '@mathlers/lib/auth';
import connectDB from '@mathlers/lib/db';
import TopicModel from '@mathlers/models/Topic';
import SubjectModel from '@mathlers/models/Subject';
import QuestionModel from '@mathlers/models/Question';
import GradeModel from '@mathlers/models/Grade';
import ChapterModel from '@mathlers/models/Chapter';
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
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid topic' }, { status: 400 });
    const body = await request.json() as {
      name?: string; code?: string; description?: string; grade?: unknown; chapter?: unknown; subjects?: unknown;
      subtopics?: Array<{ name?: string; code?: string }>; order?: number; isActive?: boolean;
    };
    if (body.subjects !== undefined && !validIds(body.subjects)) return NextResponse.json({ error: 'Subjects must be valid identifiers' }, { status: 400 });
    if (body.grade !== undefined && (typeof body.grade !== 'string' || !mongoose.isValidObjectId(body.grade))) return NextResponse.json({ error: 'Invalid grade' }, { status: 400 });
    if (body.chapter !== undefined && (typeof body.chapter !== 'string' || !mongoose.isValidObjectId(body.chapter))) return NextResponse.json({ error: 'Invalid chapter' }, { status: 400 });
    const subjects = body.subjects === undefined ? undefined : [...new Set(body.subjects)];
    const subjectDocs = subjects?.length ? await SubjectModel.find({ _id: { $in: subjects } }).select('grades') : [];
    if (subjects?.length && subjectDocs.length !== subjects.length) {
      return NextResponse.json({ error: 'One or more subjects are invalid' }, { status: 400 });
    }
    if (body.grade && !await GradeModel.exists({ _id: body.grade })) return NextResponse.json({ error: 'Invalid grade' }, { status: 400 });
    if (body.grade && subjectDocs.some((subject) => subject.grades?.length && !subject.grades.some((item) => item.toString() === body.grade))) {
      return NextResponse.json({ error: 'One or more subjects are not available for this grade' }, { status: 400 });
    }
    if (body.chapter && !await ChapterModel.exists({ _id: body.chapter })) return NextResponse.json({ error: 'Invalid chapter' }, { status: 400 });
    const subtopics = body.subtopics?.filter((item) => item.name?.trim()).map((item) => ({
      name: item.name!.trim(), code: item.code?.trim(),
    }));
    const topic = await TopicModel.findByIdAndUpdate(id, {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.code !== undefined && { code: body.code.trim() }),
      ...(body.description !== undefined && { description: body.description.trim() }),
      ...(body.grade !== undefined && { grade: body.grade }),
      ...(body.chapter !== undefined && { chapter: body.chapter }),
      ...(subjects?.length && { subjects, subject: subjects[0] }),
      ...(subtopics !== undefined && { subtopics }),
      ...(body.order !== undefined && { order: Number(body.order) || 0 }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    }, { returnDocument: 'after', runValidators: true }).populate('grade', 'name').populate('subjects', 'name').populate('subject', 'name');
    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: topic });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update topic' }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid topic' }, { status: 400 });
  if (await QuestionModel.exists({ topic: id })) {
    return NextResponse.json({ error: 'This topic is used by the question bank and cannot be deleted.' }, { status: 409 });
  }
  const topic = await TopicModel.findByIdAndDelete(id);
  if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
