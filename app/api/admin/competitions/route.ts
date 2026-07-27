import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel, { CompetitionStatus } from '@/models/Competition';

const roundSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['online', 'physical']),
  timer: z.coerce.number().min(1),
  passingScore: z.coerce.number().min(0).max(100),
  numberOfQualifiers: z.coerce.number().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  venue: z.string().optional(),
  hall: z.string().optional(),
  room: z.string().optional(),
});

const competitionSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  organizer: z.string().min(2),
  contact: z.string().min(5),
  rulebook: z.string().min(10),
  grades: z.array(z.string()).min(1),
  minAge: z.union([z.literal(''), z.coerce.number().min(1)]).optional(),
  maxAge: z.union([z.literal(''), z.coerce.number().min(1)]).optional(),
  registrationStartDate: z.string().min(1),
  registrationEndDate: z.string().min(1),
  competitionStartDate: z.string().min(1),
  competitionEndDate: z.string().min(1),
  maxParticipants: z.coerce.number().min(1),
  prizeDetails: z.string().min(3),
  status: z.nativeEnum(CompetitionStatus),
  rounds: z.array(roundSchema).min(1),
});

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = competitionSchema.parse(await request.json());

    await connectDB();

    const competition = await CompetitionModel.create({
      name: data.name,
      description: data.description,
      organizer: data.organizer,
      contact: data.contact,
      rulebook: data.rulebook,
      eligibility: {
        grades: data.grades,
        minAge: data.minAge === '' ? undefined : data.minAge,
        maxAge: data.maxAge === '' ? undefined : data.maxAge,
      },
      registration: {
        startDate: new Date(data.registrationStartDate),
        endDate: new Date(data.registrationEndDate),
        maxParticipants: data.maxParticipants,
      },
      competition: {
        startDate: new Date(data.competitionStartDate),
        endDate: new Date(data.competitionEndDate),
      },
      prizeDetails: data.prizeDetails,
      status: data.status,
      rounds: data.rounds.map((round) => ({
        ...round,
        startDate: new Date(round.startDate),
        endDate: new Date(round.endDate),
      })),
      createdBy: session.user.id.startsWith('bypass-') 
        ? '000000000000000000000000' 
        : session.user.id,
    });

    return NextResponse.json({ id: competition._id.toString() }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues);
      return NextResponse.json({ error: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') }, { status: 400 });
    }

    console.error('Create competition error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create competition' 
    }, { status: 500 });
  }
}
