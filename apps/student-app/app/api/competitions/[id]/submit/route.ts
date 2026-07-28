import { NextResponse } from 'next/server';
import { auth } from '@mathlers/lib/auth';
import connectDB from '@mathlers/lib/db';
import CompetitionModel, { CompetitionCategory, CompetitionStatus, ISection } from '@mathlers/models/Competition';
import EnrollmentModel, { EnrollmentStatus } from '@mathlers/models/Enrollment';
import CompetitionRoundAttemptModel, { CompetitionRoundAttemptStatus } from '@mathlers/models/CompetitionRoundAttempt';
import ResultModel, { ResultType } from '@mathlers/models/Result';
import { activeChampionshipRound } from '@mathlers/lib/competition';
import { isValidObjectId } from '@mathlers/lib/utils';
import mongoose from 'mongoose';

type AnswerMap = Record<string, string | null>;
type Question = { _id: { toString(): string }; correctAnswer: string; marks: number };
type ProcessedAnswer = { questionId: string; userAnswer: string | null; isCorrect: boolean; marksObtained: number };

function grade(sections: ISection[], answers: AnswerMap) {
  let rawScore = 0;
  let totalMarks = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let skipped = 0;
  const processedAnswers: ProcessedAnswer[] = [];
  for (const section of sections) {
    for (const question of section.questions as unknown as Question[]) {
      const questionId = question._id.toString();
      const answer = answers[questionId] ?? null;
      const marks = question.marks || 1;
      totalMarks += marks;
      const isCorrect = answer === question.correctAnswer;
      if (answer === null) skipped += 1;
      else if (isCorrect) {
        rawScore += marks;
        correctAnswers += 1;
      } else {
        wrongAnswers += 1;
        if (section.settings.negativeMarking) rawScore -= section.settings.negativeMarkValue || 0;
      }
      processedAnswers.push({ questionId, userAnswer: answer, isCorrect, marksObtained: isCorrect ? marks : 0 });
    }
  }
  const score = Math.max(0, rawScore);
  return { score, totalMarks, correctAnswers, wrongAnswers, skipped, percentage: totalMarks ? Math.round((score / totalMarks) * 10_000) / 100 : 0, processedAnswers };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'student' || !isValidObjectId(session.user.id)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json() as { answers?: unknown };
    const answers: AnswerMap = body.answers && typeof body.answers === 'object' && !Array.isArray(body.answers) ? body.answers as AnswerMap : {};
    if (Object.values(answers).some((answer) => answer !== null && !['A', 'B', 'C', 'D'].includes(answer))) return NextResponse.json({ error: 'Invalid answer payload.' }, { status: 400 });

    await connectDB();
    const { id } = await params;
    if (!isValidObjectId(id)) return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    const competition = await CompetitionModel.findById(id)
      .populate({ path: 'sections.questions', model: 'Question', select: 'correctAnswer marks status' })
      .populate({ path: 'rounds.sections.questions', model: 'Question', select: 'correctAnswer marks status' });
    if (!competition) return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    const enrollment = await EnrollmentModel.findOne({ competition: id, student: session.user.id });
    if (!enrollment || enrollment.status !== EnrollmentStatus.IN_PROGRESS) return NextResponse.json({ error: 'No active competition attempt was found.' }, { status: 409 });

    const now = new Date();
    const championship = competition.category === CompetitionCategory.CHAMPIONSHIP;
    const activeRound = championship ? activeChampionshipRound(competition.rounds, now) : undefined;
    if (championship && !activeRound) return NextResponse.json({ error: 'The championship round is no longer accepting submissions.' }, { status: 409 });
    if (!championship && (competition.status !== CompetitionStatus.IN_PROGRESS || now > competition.schedule.competitionEndDate)) return NextResponse.json({ error: 'The submission window has closed.' }, { status: 409 });

    const sections = activeRound ? activeRound.sections : competition.sections;
    const activeAttempt = activeRound
      ? await CompetitionRoundAttemptModel.findOne({ competition: id, student: session.user.id, round: activeRound.roundNumber, status: CompetitionRoundAttemptStatus.IN_PROGRESS })
      : undefined;
    if (activeRound && !activeAttempt) return NextResponse.json({ error: 'No active competition attempt was found.' }, { status: 409 });
    const startedAt = activeAttempt?.startedAt || enrollment.startTime;
    if (!startedAt) return NextResponse.json({ error: 'No active competition attempt was found.' }, { status: 409 });
    const endsAt = activeAttempt?.endsAt || new Date(Math.min(startedAt.getTime() + sections.reduce((total, section) => total + section.settings.duration, 0) * 60_000, competition.schedule.competitionEndDate.getTime()));
    if (now > endsAt) return NextResponse.json({ error: 'The submission window has closed.' }, { status: 409 });

    const scored = grade(sections, answers);
    const timeTaken = Math.max(0, Math.round((now.getTime() - startedAt.getTime()) / 1000));
    if (activeRound) {
      const completedAttempt = await CompetitionRoundAttemptModel.findOneAndUpdate(
        { _id: activeAttempt!._id, status: CompetitionRoundAttemptStatus.IN_PROGRESS },
        { $set: { status: CompetitionRoundAttemptStatus.COMPLETED, completedAt: now, timeTaken, ...scored, answers: scored.processedAnswers.map((answer) => ({ questionId: answer.questionId, selectedAnswer: answer.userAnswer, isCorrect: answer.isCorrect, marksObtained: answer.marksObtained })) } },
        { new: true },
      );
      if (!completedAttempt) return NextResponse.json({ error: 'This round has already been submitted.' }, { status: 409 });
      const finalRound = Math.max(...competition.rounds.map((round) => round.roundNumber));
      const final = activeRound.roundNumber === finalRound;
      await EnrollmentModel.updateOne(
        { _id: enrollment._id },
        { $set: final ? { status: EnrollmentStatus.COMPLETED, endTime: now, score: scored.score, totalMarks: scored.totalMarks, percentage: scored.percentage, answers: scored.processedAnswers } : { status: EnrollmentStatus.APPROVED, currentRound: activeRound.roundNumber } },
      );
      if (final) {
        await ResultModel.create({
          student: session.user.id, type: ResultType.COMPETITION, competition: id, round: activeRound.roundNumber, score: scored.score, totalMarks: scored.totalMarks,
          correctAnswers: scored.correctAnswers, wrongAnswers: scored.wrongAnswers, skipped: scored.skipped,
          accuracy: Math.round((scored.correctAnswers / (scored.correctAnswers + scored.wrongAnswers || 1)) * 10_000) / 100, timeTaken,
          answers: scored.processedAnswers.map((answer) => ({ questionId: new mongoose.Types.ObjectId(answer.questionId), selectedAnswer: answer.userAnswer as 'A' | 'B' | 'C' | 'D' | null, isCorrect: answer.isCorrect, timeSpent: 0 })), completedAt: now,
        });
        await CompetitionModel.updateOne({ _id: id }, { $inc: { 'analytics.studentsCompleted': 1 } });
      }
      return NextResponse.json({ success: true, completed: final, round: activeRound.roundNumber, score: scored.score, totalMarks: scored.totalMarks, percentage: scored.percentage });
    }

    const completed = await EnrollmentModel.findOneAndUpdate(
      { _id: enrollment._id, status: EnrollmentStatus.IN_PROGRESS },
      { $set: { status: EnrollmentStatus.COMPLETED, endTime: now, score: scored.score, totalMarks: scored.totalMarks, percentage: scored.percentage, answers: scored.processedAnswers } },
      { new: true },
    );
    if (!completed) return NextResponse.json({ error: 'This attempt has already been submitted.' }, { status: 409 });
    await ResultModel.create({
      student: session.user.id, type: ResultType.COMPETITION, competition: id, score: scored.score, totalMarks: scored.totalMarks,
      correctAnswers: scored.correctAnswers, wrongAnswers: scored.wrongAnswers, skipped: scored.skipped,
      accuracy: Math.round((scored.correctAnswers / (scored.correctAnswers + scored.wrongAnswers || 1)) * 10_000) / 100, timeTaken,
      answers: scored.processedAnswers.map((answer) => ({ questionId: new mongoose.Types.ObjectId(answer.questionId), selectedAnswer: answer.userAnswer as 'A' | 'B' | 'C' | 'D' | null, isCorrect: answer.isCorrect, timeSpent: 0 })), completedAt: now,
    });
    await CompetitionModel.updateOne({ _id: id }, { $inc: { 'analytics.studentsCompleted': 1 } });
    return NextResponse.json({ success: true, completed: true, score: scored.score, totalMarks: scored.totalMarks, percentage: scored.percentage });
  } catch (error) {
    console.error('Competition submit error:', error);
    return NextResponse.json({ error: 'Unable to submit this competition.' }, { status: 500 });
  }
}
