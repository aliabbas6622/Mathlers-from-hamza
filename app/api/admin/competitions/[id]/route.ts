import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth, isSuperAdmin } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel, { CompetitionCategory, CompetitionStatus } from '@/models/Competition';
import QuestionModel from '@/models/Question';
import { randomBytes } from 'crypto';

const updateSchema = z.object({
  status: z.nativeEnum(CompetitionStatus).optional(),
  registrationEndDate: z.string().optional(),
  maxParticipants: z.coerce.number().min(1).optional(),
});

const editorSchema = z.object({
  name: z.string().trim().min(3),
  category: z.nativeEnum(CompetitionCategory),
  description: z.string().trim().min(10),
  organizer: z.string().trim().min(2),
  contact: z.string().trim().min(5),
  language: z.string().trim().min(2),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  status: z.nativeEnum(CompetitionStatus),
  eligibilityType: z.enum(['public', 'selected_grades', 'selected_schools', 'invite_only']),
  grades: z.array(z.string()),
  minAge: z.union([z.literal(''), z.coerce.number().min(1)]),
  maxAge: z.union([z.literal(''), z.coerce.number().min(1)]),
  maxParticipants: z.coerce.number().min(1),
  registrationStartDate: z.string().min(1),
  registrationEndDate: z.string().min(1),
  competitionStartDate: z.string().min(1),
  competitionEndDate: z.string().min(1),
  registrationType: z.enum(['automatic', 'manual_approval', 'access_code']),
  rulebookContent: z.string().trim().min(10),
  prizeDetails: z.string().trim().min(3),
  sections: z.array(z.object({
    name: z.string().trim().min(1),
    description: z.string().optional(),
    order: z.number().int().min(0),
    questions: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1),
    settings: z.object({
      duration: z.coerce.number().min(1), totalMarks: z.coerce.number().min(1), passingMarks: z.coerce.number().min(0),
      negativeMarking: z.boolean(), negativeMarkValue: z.coerce.number().min(0), shuffleQuestions: z.boolean(), shuffleOptions: z.boolean(),
      calculatorAllowed: z.boolean(), skipAllowed: z.boolean(), reviewAllowed: z.boolean(),
    }),
  })).default([]),
  rounds: z.array(z.object({
    name: z.string().trim().min(1), roundNumber: z.coerce.number().int().min(1), type: z.enum(['qualifier', 'quarter_final', 'semi_final', 'final', 'custom']),
    sections: z.array(z.object({
      name: z.string().trim().min(1), description: z.string().optional(), order: z.number().int().min(0), questions: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1),
      settings: z.object({ duration: z.coerce.number().min(1), totalMarks: z.coerce.number().min(1), passingMarks: z.coerce.number().min(0), negativeMarking: z.boolean(), negativeMarkValue: z.coerce.number().min(0), shuffleQuestions: z.boolean(), shuffleOptions: z.boolean(), calculatorAllowed: z.boolean(), skipAllowed: z.boolean(), reviewAllowed: z.boolean() }),
    })).min(1),
    qualificationCriteria: z.object({ topN: z.union([z.literal(''), z.coerce.number().int().min(1)]).optional(), minimumScore: z.union([z.literal(''), z.coerce.number().min(0)]).optional(), minimumPercentage: z.union([z.literal(''), z.coerce.number().min(0).max(100)]).optional() }).default({}),
    schedule: z.object({ startDate: z.string().min(1), endDate: z.string().min(1) }),
  })).default([]),
}).superRefine((data, context) => {
  if (data.category === CompetitionCategory.CHAMPIONSHIP && !data.rounds.length) context.addIssue({ code: 'custom', path: ['rounds'], message: 'A championship needs at least one round.' });
  if (data.category !== CompetitionCategory.CHAMPIONSHIP && !data.sections.length) context.addIssue({ code: 'custom', path: ['sections'], message: 'At least one section is required.' });
  if (data.eligibilityType === 'invite_only' && data.registrationType !== 'access_code') context.addIssue({ code: 'custom', path: ['registrationType'], message: 'Invite-only competitions must use an access code.' });
  const rounds = [...data.rounds].sort((a, b) => a.roundNumber - b.roundNumber);
  if (rounds.some((round, index) => round.roundNumber !== index + 1)) context.addIssue({ code: 'custom', path: ['rounds'], message: 'Round numbers must start at 1 with no gaps.' });
  rounds.forEach((round, index) => {
    if (!(new Date(round.schedule.startDate) < new Date(round.schedule.endDate))) context.addIssue({ code: 'custom', path: ['rounds', index, 'schedule'], message: 'Each round must end after it starts.' });
    if (index < rounds.length - 1 && !Object.values(round.qualificationCriteria).some(Boolean)) context.addIssue({ code: 'custom', path: ['rounds', index, 'qualificationCriteria'], message: 'Every non-final round needs a qualification rule.' });
    if (index && new Date(round.schedule.startDate) < new Date(rounds[index - 1].schedule.endDate)) context.addIssue({ code: 'custom', path: ['rounds', index, 'schedule'], message: 'Rounds cannot overlap.' });
  });
});

async function requireSuperAdmin() {
  const session = await auth();
  if (!session) return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (!isSuperAdmin(session.user.role)) return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { session };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireSuperAdmin();
  if ('response' in access) return access.response;
  const { id } = await params;
  await connectDB();
  const competition = await CompetitionModel.findById(id).populate('sections.questions', '_id');
  return competition ? NextResponse.json(competition) : NextResponse.json({ error: 'Competition not found' }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireSuperAdmin();
  if ('response' in access) return access.response;
  try {
    const data = editorSchema.parse(await request.json());
    const registrationStart = new Date(data.registrationStartDate);
    const registrationEnd = new Date(data.registrationEndDate);
    const competitionStart = new Date(data.competitionStartDate);
    const competitionEnd = new Date(data.competitionEndDate);
    if (!(registrationStart < registrationEnd && registrationEnd <= competitionStart && competitionStart < competitionEnd)) {
      return NextResponse.json({ error: 'Registration and competition dates must be in chronological order.' }, { status: 400 });
    }
    await connectDB();
    const { id } = await params;
    if (data.category === CompetitionCategory.CHAMPIONSHIP && data.rounds.some((round) => new Date(round.schedule.startDate) < competitionStart || new Date(round.schedule.endDate) > competitionEnd)) {
      return NextResponse.json({ error: 'Every round must be within the competition schedule.' }, { status: 400 });
    }
    const questionIds = [...new Set([...data.sections.flatMap((section) => section.questions), ...data.rounds.flatMap((round) => round.sections.flatMap((section) => section.questions))])];
    if (await QuestionModel.countDocuments({ _id: { $in: questionIds }, status: 'active' }) !== questionIds.length) {
      return NextResponse.json({ error: 'Every selected question must exist and be active.' }, { status: 400 });
    }
    const existing = await CompetitionModel.findById(id).select('registration.accessCode');
    if (!existing) return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    const competition = await CompetitionModel.findByIdAndUpdate(id, {
      name: data.name, category: data.category, description: data.description, organizer: data.organizer, contact: data.contact,
      language: data.language, difficultyLevel: data.difficultyLevel, status: data.status,
      eligibility: { type: data.eligibilityType, grades: data.grades, minAge: data.minAge || undefined, maxAge: data.maxAge || undefined, maxParticipants: data.maxParticipants },
      registration: {
        startDate: registrationStart, endDate: registrationEnd, type: data.registrationType,
        ...(data.registrationType === 'access_code' && { accessCode: existing.registration.accessCode || `MTH-${randomBytes(8).toString('hex').toUpperCase()}` }),
      },
      schedule: { competitionStartDate: competitionStart, competitionEndDate: competitionEnd },
      rulebook: { content: data.rulebookContent, acceptanceRequired: true }, prizeDetails: data.prizeDetails,
      sections: data.category === CompetitionCategory.CHAMPIONSHIP ? [] : data.sections,
      rounds: data.category === CompetitionCategory.CHAMPIONSHIP ? data.rounds.map((round) => ({
        ...round,
        qualificationCriteria: Object.fromEntries(Object.entries(round.qualificationCriteria).filter(([, value]) => value !== '' && value !== undefined)),
        schedule: { startDate: new Date(round.schedule.startDate), endDate: new Date(round.schedule.endDate) },
      })) : [],
    }, { new: true, runValidators: true });
    return competition ? NextResponse.json(competition) : NextResponse.json({ error: 'Competition not found' }, { status: 404 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    console.error('Competition update error:', error);
    return NextResponse.json({ error: 'Unable to update competition.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isSuperAdmin(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { id } = await params;
    const data = updateSchema.parse(await request.json());
    const update: Record<string, unknown> = {};

    if (data.status) update.status = data.status;
    if (data.registrationEndDate) update['registration.endDate'] = new Date(data.registrationEndDate);
    if (data.maxParticipants) update['eligibility.maxParticipants'] = data.maxParticipants;

    await connectDB();

    const competition = await CompetitionModel.findByIdAndUpdate(id, update, { new: true });

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error('Update competition error:', error);
    return NextResponse.json({ error: 'Failed to update competition' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isSuperAdmin(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();

  const { id } = await params;
  const competition = await CompetitionModel.findByIdAndUpdate(id, { status: CompetitionStatus.ARCHIVED }, { new: true });

  if (!competition) {
    return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
