import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import PracticeSetModel from '@/models/PracticeSet';

type QuestionPayload = {
  _id: { toString(): string };
  question?: unknown;
  options?: Record<string, unknown>;
  difficulty?: string;
  marks?: number;
  estimatedTime?: number;
};

type PracticeSetPayload = {
  _id: { toString(): string };
  name: string;
  type: string;
  timeLimit: number;
  attemptsAllowed: number;
  subject?: { name?: string };
  grade?: { name?: string };
  questions?: QuestionPayload[];
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'student') {
    return NextResponse.json({ error: 'Student access is required' }, { status: 403 });
  }

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid practice set' }, { status: 400 });
  }

  try {
    await connectDB();
    const now = new Date();
    const practiceSet = await PracticeSetModel.findOne({
      _id: id,
      isPublished: true,
      $or: [
        { 'availability.startDate': { $exists: false } },
        { 'availability.startDate': { $lte: now } }
      ],
      $and: [
        { $or: [{ 'availability.endDate': { $exists: false } }, { 'availability.endDate': { $gte: now } }] }
      ]
    })
      .populate({
        path: 'questions',
        match: { status: 'active' },
        select: 'question options difficulty marks estimatedTime',
      })
      .populate('subject', 'name')
      .populate('grade', 'name')
      .lean() as unknown as PracticeSetPayload | null;

    if (!practiceSet) {
      return NextResponse.json({ error: 'Practice set not found or is no longer available' }, { status: 404 });
    }

    const questions = (practiceSet.questions || []).flatMap((question) => {
      const options = question.options;
      const hasOptions = ['A', 'B', 'C', 'D'].every((key) => typeof options?.[key] === 'string' && options[key].trim());

      return typeof question.question === 'string' && question.question.trim() && hasOptions
        ? [{
            id: question._id.toString(),
            question: question.question,
            options,
            difficulty: question.difficulty,
            marks: question.marks,
            estimatedTime: question.estimatedTime,
          }]
        : [];
    });

    return NextResponse.json({
      practiceSet: {
        id: practiceSet._id.toString(),
        name: practiceSet.name,
        type: practiceSet.type,
        subject: practiceSet.subject?.name || 'General',
        grade: practiceSet.grade?.name || 'All Grades',
        timeLimit: practiceSet.timeLimit,
        attemptsAllowed: practiceSet.attemptsAllowed,
        questions,
      },
    });
  } catch (error) {
    console.error('Unable to load practice set', error);
    return NextResponse.json({ error: 'Unable to load this practice set. Please try again.' }, { status: 500 });
  }
}
