import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel from '@/models/Competition';
import EnrollmentModel from '@/models/Enrollment';
import QuestionModel from '@/models/Question';
import { isValidObjectId } from '@/lib/utils/isValidObjectId';

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
    const body = await request.json();
    const { answers } = body; // Map of questionId -> selectedOptionIndex (or array)

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
    const processedAnswers: any[] = [];

    // Auto-grade section by section
    for (const section of competition.sections || []) {
      for (const question of (section.questions || []) as any[]) {
        const qId = question._id.toString();
        const marks = question.marks || 1;
        totalPossibleMarks += marks;

        const studentAnswer = answers[qId];
        let isCorrect = false;

        if (studentAnswer !== undefined && studentAnswer !== null) {
          // Compare with correct answer
          if (typeof studentAnswer === 'number') {
            const correctOption = question.options?.findIndex((o: any) => o.isCorrect);
            if (correctOption === studentAnswer) {
              isCorrect = true;
            }
          } else if (typeof studentAnswer === 'string') {
            const correctText = question.options?.find((o: any) => o.isCorrect)?.optionText;
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

    enrollment.status = 'completed';
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
  } catch (error: any) {
    console.error('Error submitting competition test:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
