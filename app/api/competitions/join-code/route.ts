import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel from '@/models/Competition';
import EnrollmentModel from '@/models/Enrollment';
import UserModel from '@/models/User';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ error: 'Competition code is required' }, { status: 400 });
    }

    await connectDB();

    const normalizedCode = code.trim().toUpperCase();

    // Find competition matching code (case-insensitive)
    const competition = await CompetitionModel.findOne({
      'registration.accessCode': { $regex: `^${normalizedCode}$`, $options: 'i' },
    });

    if (!competition) {
      return NextResponse.json({ error: 'Invalid competition code. No competition found with this code.' }, { status: 404 });
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
    if (hasValidId) {
      const student = await UserModel.findById(userId);
      if (student) studentGrade = student.grade || '';
    }

    const allowedGrades = competition.eligibility?.grades || [];
    const isGradeEligible = allowedGrades.length === 0 || allowedGrades.includes('All') || (!!studentGrade && allowedGrades.includes(studentGrade));

    return NextResponse.json({
      ok: true,
      competition: {
        _id: competition._id.toString(),
        name: competition.name,
        category: competition.category,
        description: competition.description,
        organizer: competition.organizer,
        difficultyLevel: competition.difficultyLevel,
        eligibility: competition.eligibility,
        registration: competition.registration,
        schedule: competition.schedule,
        rulebook: competition.rulebook,
        prizeDetails: competition.prizeDetails,
        sectionsCount: competition.sections?.length || 0,
        totalDuration: competition.sections?.reduce((sum: number, s: any) => sum + (s.settings?.duration || 0), 0) || 30,
      },
      eligibilityCheck: {
        isEnrolled,
        isFull,
        isGradeEligible,
        status: competition.status,
        canEnroll: !isEnrolled && !isFull && (competition.status === 'registration_open' || competition.status === 'draft'),
        existingParticipantId: existingEnrollment?.participantId || null,
      },
    });
  } catch (error: any) {
    console.error('Join with code error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
