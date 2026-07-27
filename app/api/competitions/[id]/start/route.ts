import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel from '@/models/Competition';
import EnrollmentModel, { EnrollmentStatus } from '@/models/Enrollment';
import { isValidObjectId } from '@/lib/utils/isValidObjectId';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !isValidObjectId(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const competition = await CompetitionModel.findById(id).populate({
      path: 'sections.questions',
      model: 'Question',
      select: 'question options difficulty type marks explanation',
    });

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    const enrollment = await EnrollmentModel.findOne({
      competition: id,
      student: session.user.id,
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'You are not enrolled in this competition' }, { status: 403 });
    }

    if (enrollment.status === 'completed') {
      return NextResponse.json({ error: 'You have already submitted this competition exam' }, { status: 400 });
    }

    if (!enrollment.startTime) {
      enrollment.startTime = new Date();
      enrollment.status = EnrollmentStatus.IN_PROGRESS;
      await enrollment.save();
    }

    return NextResponse.json({
      success: true,
      competition: {
        _id: competition._id,
        name: competition.name,
        description: competition.description,
        sections: competition.sections,
      },
      enrollment: {
        participantId: enrollment.participantId,
        startTime: enrollment.startTime,
        status: enrollment.status,
      },
    });
  } catch (error: unknown) {
    console.error('Error starting competition test:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
