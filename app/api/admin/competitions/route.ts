import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel, { CompetitionStatus, CompetitionCategory, RegistrationType, DifficultyLevel } from '@/models/Competition';
import mongoose from 'mongoose';

// ─── Validation Schema ──────────────────────────────────────────────────────

const sectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  order: z.number(),
  settings: z.object({
    duration: z.coerce.number().min(1),
    totalMarks: z.coerce.number().min(1),
    passingMarks: z.coerce.number().min(0),
    negativeMarking: z.boolean().default(false),
    negativeMarkValue: z.coerce.number().default(0),
    shuffleQuestions: z.boolean().default(true),
    shuffleOptions: z.boolean().default(true),
    calculatorAllowed: z.boolean().default(false),
    skipAllowed: z.boolean().default(true),
    reviewAllowed: z.boolean().default(true),
  }),
});

const competitionSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  category: z.nativeEnum(CompetitionCategory),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  organizer: z.string().min(2),
  contact: z.string().min(5),
  language: z.string().default('English'),
  difficultyLevel: z.nativeEnum(DifficultyLevel),

  eligibilityType: z.enum(['public', 'selected_grades', 'selected_schools', 'invite_only']),
  grades: z.array(z.string()).default([]),
  minAge: z.union([z.literal(''), z.coerce.number().min(1)]).optional(),
  maxAge: z.union([z.literal(''), z.coerce.number().min(1)]).optional(),
  maxParticipants: z.coerce.number().min(1),

  registrationStartDate: z.string().min(1),
  registrationEndDate: z.string().min(1),
  competitionStartDate: z.string().min(1),
  competitionEndDate: z.string().min(1),
  registrationType: z.nativeEnum(RegistrationType),

  rulebookContent: z.string().min(10, 'Rulebook must be at least 10 characters'),
  prizeDetails: z.string().min(3),

  sections: z.array(sectionSchema).min(1, 'At least one section is required'),
});

// ─── POST — Create Competition ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = competitionSchema.parse(await request.json());

    await connectDB();

    const createdBy = mongoose.Types.ObjectId.isValid(session.user.id)
      ? session.user.id
      : '000000000000000000000000';

    const competition = await CompetitionModel.create({
      name: data.name,
      category: data.category,
      description: data.description,
      organizer: data.organizer,
      contact: data.contact,
      language: data.language,
      difficultyLevel: data.difficultyLevel,
      eligibility: {
        type: data.eligibilityType,
        grades: data.grades.length > 0 ? data.grades : [],
        minAge: data.minAge === '' ? undefined : data.minAge,
        maxAge: data.maxAge === '' ? undefined : data.maxAge,
        maxParticipants: data.maxParticipants,
      },
      registration: {
        startDate: new Date(data.registrationStartDate),
        endDate: new Date(data.registrationEndDate),
        type: data.registrationType,
      },
      schedule: {
        competitionStartDate: new Date(data.competitionStartDate),
        competitionEndDate: new Date(data.competitionEndDate),
      },
      rulebook: {
        content: data.rulebookContent,
        acceptanceRequired: true,
      },
      prizeDetails: data.prizeDetails,
      sections: data.sections.map(s => ({
        ...s,
        questions: [],
      })),
      status: CompetitionStatus.DRAFT,
      createdBy,
    });

    return NextResponse.json({ id: competition._id.toString() }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues);
      return NextResponse.json({
        error: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
      }, { status: 400 });
    }

    console.error('Create competition error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to create competition',
    }, { status: 500 });
  }
}

// ─── GET — List Competitions ────────────────────────────────────────────────

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const competitions = await CompetitionModel.find()
      .sort({ createdAt: -1 })
      .select('name category status schedule analytics eligibility createdAt');
    return NextResponse.json(competitions);
  } catch (error) {
    console.error('List competitions error:', error);
    return NextResponse.json({ error: 'Failed to fetch competitions' }, { status: 500 });
  }
}
