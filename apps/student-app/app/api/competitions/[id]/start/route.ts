import { randomInt } from 'crypto';
import { NextResponse } from 'next/server';
import { auth } from '@mathlers/lib/auth';
import connectDB from '@mathlers/lib/db';
import CompetitionModel, { CompetitionCategory, CompetitionStatus, ISection } from '@mathlers/models/Competition';
import EnrollmentModel, { EnrollmentStatus } from '@mathlers/models/Enrollment';
import CompetitionRoundAttemptModel, { CompetitionRoundAttemptStatus } from '@mathlers/models/CompetitionRoundAttempt';
import { activeChampionshipRound, isQualifiedForRound } from '@mathlers/lib/competition';
import { isValidObjectId } from '@mathlers/lib/utils';

type Question = { _id: { toString(): string }; question: string; options: Record<string, string>; marks: number; status: string };

function shuffle<T>(items: T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function toSafeSections(sections: ISection[]) {
  return sections.map((section) => {
    const questions = (section.questions as unknown as Question[])
      .filter((question) => question.status === 'active')
      .map((question) => ({
        _id: question._id.toString(),
        question: question.question,
        marks: question.marks,
        options: Object.entries(question.options).map(([key, optionText]) => ({ key, optionText })),
      }));
    const orderedQuestions = section.settings.shuffleQuestions ? shuffle(questions) : questions;
    return {
      name: section.name,
      settings: { duration: section.settings.duration, negativeMarking: section.settings.negativeMarking, negativeMarkValue: section.settings.negativeMarkValue },
      questions: section.settings.shuffleOptions ? orderedQuestions.map((question) => ({ ...question, options: shuffle(question.options) })) : orderedQuestions,
    };
  });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'student' || !isValidObjectId(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    if (!isValidObjectId(id)) return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    const competition = await CompetitionModel.findById(id)
      .populate({ path: 'sections.questions', model: 'Question', select: 'question options marks status' })
      .populate({ path: 'rounds.sections.questions', model: 'Question', select: 'question options marks status' });
    if (!competition) return NextResponse.json({ error: 'Competition not found' }, { status: 404 });

    const now = new Date();
    const enrollment = await EnrollmentModel.findOne({ competition: id, student: session.user.id });
    if (!enrollment || ![EnrollmentStatus.APPROVED, EnrollmentStatus.IN_PROGRESS].includes(enrollment.status)) {
      return NextResponse.json({ error: 'An approved enrollment is required to start.' }, { status: 403 });
    }

    const championship = competition.category === CompetitionCategory.CHAMPIONSHIP;
    const activeRound = championship ? activeChampionshipRound(competition.rounds, now) : undefined;
    if (championship && (competition.status !== CompetitionStatus.IN_PROGRESS || !activeRound)) return NextResponse.json({ error: 'No championship round is currently running.' }, { status: 409 });
    if (!championship && (competition.status !== CompetitionStatus.IN_PROGRESS || now < competition.schedule.competitionStartDate || now >= competition.schedule.competitionEndDate)) {
      return NextResponse.json({ error: 'This competition is not currently running.' }, { status: 409 });
    }

    const roundNumber = activeRound?.roundNumber;
    if (activeRound && !(await isQualifiedForRound({ competition: id, student: session.user.id, rounds: competition.rounds, roundNumber: activeRound.roundNumber }))) {
      return NextResponse.json({ error: 'You have not qualified for this championship round.' }, { status: 403 });
    }

    const sections = activeRound ? activeRound.sections : competition.sections;
    const durationMinutes = sections.reduce((total, section) => total + section.settings.duration, 0);
    const scheduleEnd = activeRound ? new Date(activeRound.schedule.endDate) : competition.schedule.competitionEndDate;
    let startTime = enrollment.startTime;
    let endsAt: Date;

    if (activeRound) {
      let attempt = await CompetitionRoundAttemptModel.findOne({ competition: id, student: session.user.id, round: roundNumber });
      let startedCompetition = false;
      if (attempt?.status === CompetitionRoundAttemptStatus.COMPLETED) return NextResponse.json({ error: 'This round has already been submitted.' }, { status: 409 });
      if (!attempt) {
        endsAt = new Date(Math.min(now.getTime() + durationMinutes * 60_000, scheduleEnd.getTime()));
        try {
          attempt = await CompetitionRoundAttemptModel.create({ competition: id, student: session.user.id, round: roundNumber, startedAt: now, endsAt });
          startedCompetition = roundNumber === 1;
        } catch (error: unknown) {
          if (!(error && typeof error === 'object' && 'code' in error && error.code === 11000)) throw error;
          attempt = await CompetitionRoundAttemptModel.findOne({ competition: id, student: session.user.id, round: roundNumber });
        }
      }
      if (!attempt) throw new Error('Could not create championship attempt');
      startTime = attempt.startedAt;
      endsAt = attempt.endsAt;
      await EnrollmentModel.updateOne({ _id: enrollment._id }, { $set: { status: EnrollmentStatus.IN_PROGRESS, currentRound: roundNumber } });
      if (startedCompetition) await CompetitionModel.updateOne({ _id: id }, { $inc: { 'analytics.studentsStarted': 1 } });
    } else {
      if (enrollment.status === EnrollmentStatus.COMPLETED) return NextResponse.json({ error: 'This attempt has already been submitted.' }, { status: 409 });
      if (!startTime) {
        startTime = now;
        await EnrollmentModel.updateOne({ _id: enrollment._id }, { $set: { startTime, status: EnrollmentStatus.IN_PROGRESS } });
        await CompetitionModel.updateOne({ _id: id }, { $inc: { 'analytics.studentsStarted': 1 } });
      }
      endsAt = new Date(Math.min(startTime.getTime() + durationMinutes * 60_000, scheduleEnd.getTime()));
    }

    if (now >= endsAt) return NextResponse.json({ error: 'Your allowed exam time has ended.' }, { status: 409 });
    return NextResponse.json({
      competition: { _id: competition._id.toString(), name: competition.name, round: activeRound ? { number: activeRound.roundNumber, name: activeRound.name } : undefined, sections: toSafeSections(sections) },
      enrollment: { participantId: enrollment.participantId, startTime, endsAt },
    });
  } catch (error) {
    console.error('Competition start error:', error);
    return NextResponse.json({ error: 'Unable to start this competition.' }, { status: 500 });
  }
}
