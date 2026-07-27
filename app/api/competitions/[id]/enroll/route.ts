import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel, { CompetitionStatus } from '@/models/Competition';
import EnrollmentModel, { EnrollmentStatus } from '@/models/Enrollment';
import UserModel from '@/models/User';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const { id } = await params;
  const [competition, existingEnrollment, student] = await Promise.all([
    CompetitionModel.findById(id),
    EnrollmentModel.findOne({ competition: id, student: session.user.id }),
    UserModel.findById(session.user.id),
  ]);

  if (!competition) {
    return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
  }

  if (existingEnrollment) {
    return NextResponse.json({ error: 'Already enrolled' }, { status: 400 });
  }

  if (!student || !competition.eligibility.grades.includes(student.grade)) {
    return NextResponse.json({ error: 'You are not eligible for this competition' }, { status: 400 });
  }

  if (competition.status !== CompetitionStatus.REGISTRATION_OPEN) {
    return NextResponse.json({ error: 'Registration is not open' }, { status: 400 });
  }

  const registrations = await EnrollmentModel.countDocuments({ competition: id });
  if (registrations >= competition.registration.maxParticipants) {
    return NextResponse.json({ error: 'Competition is full' }, { status: 400 });
  }

  const participantId = `CMP-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  await EnrollmentModel.create({
    competition: id,
    student: session.user.id,
    status: EnrollmentStatus.APPROVED,
    rulebookAccepted: true,
    participantId,
    qrCode: participantId,
  });

  await CompetitionModel.findByIdAndUpdate(id, { $inc: { 'analytics.registrations': 1 } });
  await UserModel.findByIdAndUpdate(session.user.id, { $inc: { competitionsJoined: 1 } });

  return NextResponse.json({ ok: true, participantId });
}
