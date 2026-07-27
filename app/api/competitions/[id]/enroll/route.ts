import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel, { CompetitionStatus } from '@/models/Competition';
import EnrollmentModel, { EnrollmentStatus } from '@/models/Enrollment';
import UserModel from '@/models/User';
import mongoose from 'mongoose';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Guard against bypass/dev user IDs that aren't valid ObjectIds
  if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
    return NextResponse.json({ error: 'Cannot enroll with a bypass account. Please log in with a real account.' }, { status: 400 });
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

  // Grade eligibility check
  const allowedGrades = competition.eligibility?.grades || [];
  if (
    allowedGrades.length > 0 && 
    !allowedGrades.includes('All') && 
    student?.grade && 
    !allowedGrades.includes(student.grade)
  ) {
    return NextResponse.json({ error: `Not eligible: This competition is restricted to ${allowedGrades.join(', ')}` }, { status: 400 });
  }

  if (competition.status !== CompetitionStatus.REGISTRATION_OPEN && competition.status !== CompetitionStatus.DRAFT) {
    return NextResponse.json({ error: 'Registration is closed or not open yet' }, { status: 400 });
  }

  const registrations = await EnrollmentModel.countDocuments({ competition: id });
  const maxParts = competition.eligibility?.maxParticipants || 500;
  if (registrations >= maxParts) {
    return NextResponse.json({ error: 'Competition participant limit reached' }, { status: 400 });
  }

  const participantId = `MTH-P-${Math.floor(100000 + Math.random() * 900000)}`;

  const enrollment = await EnrollmentModel.create({
    competition: id,
    student: session.user.id,
    status: EnrollmentStatus.APPROVED,
    rulebookAccepted: true,
    participantId,
    qrCode: participantId,
  });

  await CompetitionModel.findByIdAndUpdate(id, { $inc: { 'analytics.totalRegistrations': 1 } });
  await UserModel.findByIdAndUpdate(session.user.id, { $inc: { competitionsJoined: 1 } });

  return NextResponse.json({ 
    ok: true, 
    participantId,
    enrollmentId: enrollment._id.toString(),
    accessCode: competition.registration?.accessCode || undefined,
  });
}
