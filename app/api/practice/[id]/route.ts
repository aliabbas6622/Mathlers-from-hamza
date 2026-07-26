import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import PracticeSetModel from '@/models/PracticeSet';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid practice set' }, { status: 400 });
  }

  await connectDB();

  const practiceSet = await PracticeSetModel.findOne({
    _id: id,
    isPublished: true,
  })
    .populate({
      path: 'questions',
      match: { status: 'active' },
      select: 'question options difficulty marks estimatedTime',
    })
    .populate('subject', 'name')
    .populate('grade', 'name');

  if (!practiceSet) {
    return NextResponse.json({ error: 'Practice set not found' }, { status: 404 });
  }

  return NextResponse.json({
    practiceSet: {
      id: practiceSet._id.toString(),
      name: practiceSet.name,
      type: practiceSet.type,
      subject: (practiceSet.subject as any)?.name || 'General',
      grade: (practiceSet.grade as any)?.name || 'All Grades',
      timeLimit: practiceSet.timeLimit,
      attemptsAllowed: practiceSet.attemptsAllowed,
      questions: (practiceSet.questions as any[]).map((question) => ({
        id: question._id.toString(),
        question: question.question,
        options: question.options,
        difficulty: question.difficulty,
        marks: question.marks,
        estimatedTime: question.estimatedTime,
      })),
    },
  });
}
