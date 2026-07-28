import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { CompetitionStatus } from '@/models/Competition';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel from '@/models/Competition';
import EnrollmentModel from '@/models/Enrollment';
import UserModel from '@/models/User';
import mongoose from 'mongoose';
import { z } from 'zod';

const joinCodeSchema = z.object({
  code: z.string().trim().min(3).max(64).regex(/^[A-Z0-9-]+$/i),
});

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const parsed = joinCodeSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Competition code is required' }, { status: 400 });
    }

    await connectDB();

    const normalizedCode = parsed.data.code.toUpperCase();

    // Find competition matching code (case-insensitive)
    const competition = await CompetitionModel.findOne({
      'registration.accessCode': { $regex: `^${escapeRegex(normalizedCode)}$`, $options: 'i' },
    });

    if (!competition) return NextResponse.json({ error: 'Invalid competition code.' }, { status: 404 });
    const now = new Date();
    if (competition.status !== CompetitionStatus.REGISTRATION_OPEN || now < competition.registration.startDate || now >= competition.registration.endDate) {
      return NextResponse.json({ error: 'Registration is not currently open.' }, { status: 409 });
    }

    // Eligibility check
    const userId = session.user.id;
    const hasValidId = mongoose.Types.ObjectId.isValid(userId);

    let isEnrolled = false;
    let existingEnrollment = null;

    if (hasValidId) {
      existingEnrollment = await EnrollmentModel.findOne({
        competition: competition._id,
        student: userId,
      });
      isEnrolled = !!existingEnrollment;
    }

    const currentRegistrations = await EnrollmentModel.countDocuments({ competition: competition._id });
    const isFull = currentRegistrations >= (competition.eligibility?.maxParticipants || 500);

    let studentGrade = '';
    let studentSchool = '';
    if (hasValidId) {
      const student = await UserModel.findById(userId).select('grade school');
      if (student) {
        studentGrade = student.grade || '';
        studentSchool = student.school?.toString() || '';
      }
    }

    const allowedGrades = competition.eligibility?.grades || [];
    const isGradeEligible = allowedGrades.length === 0 || allowedGrades.includes('All') || (!!studentGrade && allowedGrades.includes(studentGrade));
    const isSchoolEligible = competition.eligibility?.type !== 'selected_schools'
      || (!!studentSchool && competition.eligibility.schools?.some((school) => school.toString() === studentSchool));

    return NextResponse.json({
      ok: true,
      competition: {
        _id: competition._id.toString(),
        name: competition.name,
        category: competition.category,
        description: competition.description,
        organizer: competition.organizer,
        difficultyLevel: competition.difficultyLevel,
        eligibility: {
          type: competition.eligibility.type,
          grades: competition.eligibility.grades,
          minAge: competition.eligibility.minAge,
          maxAge: competition.eligibility.maxAge,
          maxParticipants: competition.eligibility.maxParticipants,
        },
        registration: {
          startDate: competition.registration.startDate,
          endDate: competition.registration.endDate,
          type: competition.registration.type,
        },
        schedule: competition.schedule,
        rulebook: competition.rulebook,
        prizeDetails: competition.prizeDetails,
        sectionsCount: competition.sections?.length || 0,
        totalDuration: competition.sections?.reduce((sum, section) => sum + (section.settings?.duration || 0), 0) || 30,
      },
      eligibilityCheck: {
        isEnrolled,
        isFull,
        isGradeEligible,
        isSchoolEligible,
        status: competition.status,
        canEnroll: !isEnrolled && !isFull && isGradeEligible && isSchoolEligible,
        existingParticipantId: existingEnrollment?.participantId || null,
      },
    });
  } catch (error) {
    console.error('Join with code error:', error);
    return NextResponse.json({ error: 'Unable to validate this code.' }, { status: 500 });
  }
}
