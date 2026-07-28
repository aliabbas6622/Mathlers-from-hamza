import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth, isSuperAdmin } from '@mathlers/lib/auth';
import connectDB from '@mathlers/lib/db';
import PracticeSetModel, { PracticeSetType } from '@mathlers/models/PracticeSet';
import QuestionModel from '@mathlers/models/Question';

const requireSuperAdmin = async () => {
  const session = await auth();
  return session && isSuperAdmin(session.user.role) ? session : null;
};

type SectionInput = {
  name?: string; instructions?: string; subject?: string; grade?: string; chapter?: string; topic?: string; questions?: string[];
};

const validId = (value: unknown): value is string => typeof value === 'string' && mongoose.isValidObjectId(value);

const normalize = async (body: Record<string, unknown>) => {
  const sections = Array.isArray(body.sections) ? body.sections as SectionInput[] : [];
  if (!body.name || typeof body.name !== 'string' || !sections.length) throw new Error('A book name and at least one section are required');
  if (!Object.values(PracticeSetType).includes(body.type as PracticeSetType)) throw new Error('Choose a valid practice type');
  if (!['easy', 'medium', 'hard'].includes(body.difficulty as string)) throw new Error('Choose a valid difficulty');
  if (!Number.isFinite(Number(body.timeLimit)) || Number(body.timeLimit) < 60) throw new Error('Time limit must be at least 60 seconds');
  if (!Number.isInteger(Number(body.attemptsAllowed)) || Number(body.attemptsAllowed) < 1) throw new Error('Attempts allowed must be at least 1');

  const cleaned = await Promise.all(sections.map(async (section) => {
    const questionIds = [...new Set((section.questions || []).filter(validId))];
    if (!section.name?.trim() || !validId(section.subject) || !validId(section.grade) || !questionIds.length) {
      throw new Error('Every section needs a name, subject, grade, and at least one question');
    }
    if ((section.chapter && !validId(section.chapter)) || (section.topic && !validId(section.topic))) throw new Error('A section contains an invalid curriculum link');
    const count = await QuestionModel.countDocuments({ _id: { $in: questionIds }, subject: section.subject, grade: section.grade, status: 'active' });
    if (count !== questionIds.length) throw new Error(`Selected questions in ${section.name} must be active and match its subject and grade`);
    return { name: section.name.trim(), instructions: section.instructions?.trim(), subject: section.subject, grade: section.grade, chapter: section.chapter || undefined, topic: section.topic || undefined, questions: questionIds };
  }));

  const startDate = new Date(String(body.startDate));
  const endDate = new Date(String(body.endDate));
  if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf()) || endDate < startDate) throw new Error('Choose a valid availability period');
  const questions = [...new Set(cleaned.flatMap((section) => section.questions))];
  const first = cleaned[0];
  return {
    name: body.name.trim(), description: typeof body.description === 'string' ? body.description.trim() : '', type: body.type as PracticeSetType,
    difficulty: body.difficulty as 'easy' | 'medium' | 'hard', sections: cleaned, questions, subject: first.subject, grade: first.grade,
    chapter: first.chapter, topic: first.topic, timeLimit: Number(body.timeLimit), attemptsAllowed: Number(body.attemptsAllowed),
    availability: { startDate, endDate }, isPublished: Boolean(body.isPublished),
  };
};

export async function GET() {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const data = await PracticeSetModel.find().populate('subject grade', 'name').populate('sections.subject sections.grade', 'name').sort({ updatedAt: -1 }).lean();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await connectDB();
    const data = await normalize(await request.json() as Record<string, unknown>);
    const practice = await PracticeSetModel.create({ ...data, createdBy: session.user.id, analytics: { totalAttempts: 0, completionRate: 0, averageScore: 0, averageTime: 0 } });
    return NextResponse.json({ success: true, data: practice }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create practice book' }, { status: 400 });
  }
}
