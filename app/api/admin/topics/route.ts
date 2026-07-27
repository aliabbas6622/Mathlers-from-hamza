import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import TopicModel from '@/models/Topic';
import SubjectModel from '@/models/Subject';
import GradeModel from '@/models/Grade';
import ChapterModel from '@/models/Chapter';

const isAdmin = async () => {
  const session = await auth();
  return session && ['admin', 'super_admin'].includes(session.user.role);
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const chapter = searchParams.get('chapter');
    const subject = searchParams.get('subject');

    const query: Record<string, unknown> = {};
    if (chapter) query.chapter = chapter;
    if (subject) query.$or = [{ subject }, { subjects: subject }];

    const topics = await TopicModel.find(query)
      .populate('chapter', 'name')
      .populate('grade', 'name')
      .populate('subject', 'name')
      .populate('subjects', 'name')
      .sort({ order: 1, name: 1 });

    return NextResponse.json({
      success: true,
      data: topics
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const body = await request.json() as {
      name?: string; code?: string; description?: string; grade?: string; chapter?: string;
      subjects?: string[]; subtopics?: Array<{ name?: string; code?: string }>; order?: number; isActive?: boolean;
    };
    const subjects = [...new Set((body.subjects || []).filter(Boolean))];
    const subtopics = (body.subtopics || []).filter((item) => item.name?.trim()).map((item) => ({
      name: item.name!.trim(), code: item.code?.trim(),
    }));

    if (!body.name?.trim() || !body.code?.trim() || !body.grade || !body.chapter || !subjects.length) {
      return NextResponse.json({ error: 'Name, code, grade, chapter, and at least one subject are required' }, { status: 400 });
    }

    const [grade, chapter, subjectDocs] = await Promise.all([
      GradeModel.exists({ _id: body.grade }),
      ChapterModel.exists({ _id: body.chapter }),
      SubjectModel.find({ _id: { $in: subjects } }).select('grades'),
    ]);
    if (!grade || !chapter || subjectDocs.length !== subjects.length) {
      return NextResponse.json({ error: 'One or more curriculum links are invalid' }, { status: 400 });
    }
    if (subjectDocs.some((subject) => subject.grades?.length && !subject.grades.some((item) => item.toString() === body.grade))) {
      return NextResponse.json({ error: 'One or more subjects are not available for this grade' }, { status: 400 });
    }

    const topic = await TopicModel.create({
      name: body.name.trim(), code: body.code.trim(), description: body.description?.trim(),
      grade: body.grade, chapter: body.chapter, subject: subjects[0], subjects, subtopics,
      order: Number(body.order) || 0, isActive: body.isActive ?? true,
    });
    return NextResponse.json({ success: true, data: topic }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create topic' }, { status: 400 });
  }
}
