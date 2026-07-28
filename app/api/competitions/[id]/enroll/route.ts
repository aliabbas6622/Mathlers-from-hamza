import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel, { CompetitionStatus, RegistrationType } from '@/models/Competition';
import EnrollmentModel, { EnrollmentStatus } from '@/models/Enrollment';
import UserModel from '@/models/User';
import { isValidObjectId } from '@/lib/utils/isValidObjectId';

type EnrollmentRequest = { accessCode?: string; rulebookAccepted?: boolean };

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== 'student' || !isValidObjectId(session.user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as EnrollmentRequest;
    await connectDB();
    const { id } = await params;
    if (!isValidObjectId(id)) return NextResponse.json({ error: 'Competition not found' }, { status: 404 });

    const [competition, student, existing] = await Promise.all([
      CompetitionModel.findById(id),
      UserModel.findById(session.user.id),
      EnrollmentModel.findOne({ competition: id, student: session.user.id }),
    ]);
    if (!competition) return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    if (!student) return NextResponse.json({ error: 'Your profile is unavailable.' }, { status: 409 });
    if (existing) return NextResponse.json({ error: 'You are already enrolled.' }, { status: 409 });

    const now = new Date();
    if (competition.status !== CompetitionStatus.REGISTRATION_OPEN || now < competition.registration.startDate || now >= competition.registration.endDate) {
      return NextResponse.json({ error: 'Registration is not currently open.' }, { status: 409 });
    }
    if (competition.rulebook.acceptanceRequired && body.rulebookAccepted !== true) {
      return NextResponse.json({ error: 'You must accept the competition rules before enrolling.' }, { status: 400 });
    }
    if (competition.registration.type === RegistrationType.ACCESS_CODE && body.accessCode?.trim().toUpperCase() !== competition.registration.accessCode?.trim().toUpperCase()) {
      return NextResponse.json({ error: 'A valid competition access code is required.' }, { status: 403 });
    }
    if (competition.eligibility.type === 'selected_schools' && (!student.school || !competition.eligibility.schools?.some((school) => school.toString() === student.school?.toString()))) {
      return NextResponse.json({ error: 'Your school is not eligible for this competition.' }, { status: 403 });
    }
    const grades = competition.eligibility.grades || [];
    if ((competition.eligibility.type === 'selected_grades' || grades.length > 0) && !grades.includes('All') && (!student.grade || !grades.includes(student.grade))) {
      return NextResponse.json({ error: 'Your grade is not eligible for this competition.' }, { status: 403 });
    }
    if (student.dateOfBirth) {
      const age = now.getFullYear() - student.dateOfBirth.getFullYear() - (now < new Date(now.getFullYear(), student.dateOfBirth.getMonth(), student.dateOfBirth.getDate()) ? 1 : 0);
      if ((competition.eligibility.minAge && age < competition.eligibility.minAge) || (competition.eligibility.maxAge && age > competition.eligibility.maxAge)) {
        return NextResponse.json({ error: 'You do not meet the age requirement for this competition.' }, { status: 403 });
      }
    } else if (competition.eligibility.minAge || competition.eligibility.maxAge) {
      return NextResponse.json({ error: 'Complete your profile before enrolling in this competition.' }, { status: 409 });
    }

    const maxParticipants = competition.eligibility.maxParticipants;
    const reserved = await CompetitionModel.findOneAndUpdate(
      { _id: id, 'analytics.totalRegistrations': { $lt: maxParticipants } },
      { $inc: { 'analytics.totalRegistrations': 1 } },
      { new: true },
    );
    if (!reserved) return NextResponse.json({ error: 'This competition is full.' }, { status: 409 });

    const status = competition.registration.type === RegistrationType.MANUAL_APPROVAL ? EnrollmentStatus.PENDING : EnrollmentStatus.APPROVED;
    const participantId = `MTH-${randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`;
    try {
      const enrollment = await EnrollmentModel.create({
        competition: id,
        student: session.user.id,
        status,
        rulebookAccepted: body.rulebookAccepted === true,
        participantId,
        qrCode: participantId,
      });
      await UserModel.updateOne({ _id: session.user.id }, { $inc: { competitionsJoined: 1 } });
      return NextResponse.json({ ok: true, participantId, enrollmentId: enrollment._id.toString(), status });
    } catch (error: unknown) {
      await CompetitionModel.updateOne({ _id: id }, { $inc: { 'analytics.totalRegistrations': -1 } });
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) return NextResponse.json({ error: 'You are already enrolled.' }, { status: 409 });
      throw error;
    }
  } catch (error) {
    console.error('Competition enrollment error:', error);
    return NextResponse.json({ error: 'Unable to enroll in this competition.' }, { status: 500 });
  }
}
