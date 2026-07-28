import { NextResponse } from 'next/server';
import connectDB from '@mathlers/lib/db';
import UserModel from '@mathlers/models/User';
import SchoolModel from '@mathlers/models/School';
import QuestionModel from '@mathlers/models/Question';
import CompetitionModel, { CompetitionStatus } from '@mathlers/models/Competition';

export async function GET() {
  try {
    await connectDB();

    const [
      totalStudents,
      totalSchools,
      totalQuestions,
      totalCompetitions,
    ] = await Promise.all([
      UserModel.countDocuments({ isActive: true }),
      SchoolModel.countDocuments({ isActive: true }),
      QuestionModel.countDocuments({ status: 'active' }),
      CompetitionModel.countDocuments({
        status: {
          $in: [
            CompetitionStatus.REGISTRATION_OPEN,
            CompetitionStatus.REGISTRATION_CLOSED,
            CompetitionStatus.IN_PROGRESS,
            CompetitionStatus.COMPLETED,
          ],
        },
      }),
    ]);

    return NextResponse.json({
      totalStudents,
      totalSchools,
      totalQuestions,
      totalCompetitions,
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
