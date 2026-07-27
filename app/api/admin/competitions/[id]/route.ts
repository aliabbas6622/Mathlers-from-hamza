import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel, { CompetitionStatus } from '@/models/Competition';

const updateSchema = z.object({
  status: z.nativeEnum(CompetitionStatus).optional(),
  registrationEndDate: z.string().optional(),
  maxParticipants: z.coerce.number().min(1).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = updateSchema.parse(await request.json());
    const update: Record<string, unknown> = {};

    if (data.status) update.status = data.status;
    if (data.registrationEndDate) update['registration.endDate'] = new Date(data.registrationEndDate);
    if (data.maxParticipants) update['registration.maxParticipants'] = data.maxParticipants;

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

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const { id } = await params;
  const competition = await CompetitionModel.findByIdAndDelete(id);

  if (!competition) {
    return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
