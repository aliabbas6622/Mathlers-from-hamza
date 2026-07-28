import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import UserModel from '@/models/User';
import SchoolModel from '@/models/School';
import QuestionModel from '@/models/Question';
import CompetitionModel, { CompetitionStatus } from '@/models/Competition';

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
