import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel from '@/models/Competition';
import EnrollmentModel, { EnrollmentStatus } from '@/models/Enrollment';
import { isValidObjectId } from '@/lib/utils/isValidObjectId';

type StudentAnswer = string | number | string[] | number[] | null;

type CompetitionQuestionOption = {
  optionText?: string;
  isCorrect?: boolean;
};

type CompetitionQuestion = {
  _id: { toString(): string };
  marks?: number;
  options?: CompetitionQuestionOption[];
};

type ProcessedAnswer = {
  questionId: string;
  userAnswer?: StudentAnswer;
  isCorrect: boolean;
  marksObtained: number;
};

export async function POST(
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
    const body = await request.json() as { answers?: unknown };
    const answers = body.answers && typeof body.answers === 'object'
      ? body.answers as Record<string, StudentAnswer>
      : {};

    const competition = await CompetitionModel.findById(id).populate({
      path: 'sections.questions',
      model: 'Question',
    });

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    const enrollment = await EnrollmentModel.findOne({
      competition: id,
      student: session.user.id,
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    let totalScore = 0;
    let totalPossibleMarks = 0;
    const processedAnswers: ProcessedAnswer[] = [];

    // Auto-grade section by section
    for (const section of competition.sections || []) {
      for (const question of (section.questions || []) as unknown as CompetitionQuestion[]) {
        const qId = question._id.toString();
        const marks = question.marks || 1;
        totalPossibleMarks += marks;

        const studentAnswer = answers[qId];
        let isCorrect = false;

        if (studentAnswer !== undefined && studentAnswer !== null) {
          // Compare with correct answer
          if (typeof studentAnswer === 'number') {
            const correctOption = question.options?.findIndex((option) => option.isCorrect);
            if (correctOption === studentAnswer) {
              isCorrect = true;
            }
          } else if (typeof studentAnswer === 'string') {
            const correctText = question.options?.find((option) => option.isCorrect)?.optionText;
            if (correctText && correctText.trim().toLowerCase() === studentAnswer.trim().toLowerCase()) {
              isCorrect = true;
            }
          }
        }

        if (isCorrect) {
          totalScore += marks;
        } else if (studentAnswer !== undefined && section.settings?.negativeMarking) {
          totalScore -= (section.settings.negativeMarkValue || 0);
        }

        processedAnswers.push({
          questionId: qId,
          userAnswer: studentAnswer,
          isCorrect,
          marksObtained: isCorrect ? marks : 0,
        });
      }
    }

    const percentage = totalPossibleMarks > 0 ? (totalScore / totalPossibleMarks) * 100 : 0;

    enrollment.status = EnrollmentStatus.COMPLETED;
    enrollment.endTime = new Date();
    enrollment.score = Math.max(0, totalScore);
    enrollment.totalMarks = totalPossibleMarks;
    enrollment.percentage = Math.round(percentage * 100) / 100;
    enrollment.answers = processedAnswers;
    await enrollment.save();

    // Update competition analytics counters
    if (competition.analytics) {
      competition.analytics.studentsCompleted = (competition.analytics.studentsCompleted || 0) + 1;
      await competition.save();
    }

    return NextResponse.json({
      success: true,
      score: enrollment.score,
      totalMarks: enrollment.totalMarks,
      percentage: enrollment.percentage,
    });
  } catch (error: unknown) {
    console.error('Error submitting competition test:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
