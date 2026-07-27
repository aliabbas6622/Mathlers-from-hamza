import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import TopicModel from '@/models/Topic';
import SubjectModel from '@/models/Subject';
import QuestionModel from '@/models/Question';
import GradeModel from '@/models/Grade';
import ChapterModel from '@/models/Chapter';

const isAdmin = async () => {
  const session = await auth();
  return session && ['admin', 'super_admin'].includes(session.user.role);
};

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json() as {
      name?: string; code?: string; description?: string; grade?: string; chapter?: string; subjects?: string[];
      subtopics?: Array<{ name?: string; code?: string }>; order?: number; isActive?: boolean;
    };
    const subjects = body.subjects ? [...new Set(body.subjects.filter(Boolean))] : undefined;
    if (subjects?.length && await SubjectModel.countDocuments({ _id: { $in: subjects } }) !== subjects.length) {
      return NextResponse.json({ error: 'One or more subjects are invalid' }, { status: 400 });
    }
    if (body.grade && !await GradeModel.exists({ _id: body.grade })) return NextResponse.json({ error: 'Invalid grade' }, { status: 400 });
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
    }, { new: true, runValidators: true });
    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: topic });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update topic' }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const { id } = await params;
  if (await QuestionModel.exists({ topic: id })) {
    return NextResponse.json({ error: 'This topic is used by the question bank and cannot be deleted.' }, { status: 409 });
  }
  const topic = await TopicModel.findByIdAndDelete(id);
  if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
