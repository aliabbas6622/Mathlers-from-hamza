import {
  CompetitionRoundAttemptModel,
  CompetitionRoundAttemptStatus,
  type IChampionshipRound,
} from '@mathlers/models';
import mongoose from 'mongoose';

export function activeChampionshipRound(rounds: IChampionshipRound[], now = new Date()) {
  return rounds.find((round) => new Date(round.schedule.startDate) <= now && now < new Date(round.schedule.endDate));
}

export function roundStatus(round: IChampionshipRound, now = new Date()) {
  if (now < new Date(round.schedule.startDate)) return 'upcoming' as const;
  if (now >= new Date(round.schedule.endDate)) return 'completed' as const;
  return 'in_progress' as const;
}

export async function isQualifiedForRound({
  competition,
  student,
  rounds,
  roundNumber,
}: {
  competition: string | mongoose.Types.ObjectId;
  student: string | mongoose.Types.ObjectId;
  rounds: IChampionshipRound[];
  roundNumber: number;
}) {
  const roundIndex = rounds.findIndex((round) => round.roundNumber === roundNumber);
  if (roundIndex <= 0) return true;

  const previousRound = rounds[roundIndex - 1];
  const result = await CompetitionRoundAttemptModel.findOne({
    competition,
    student,
    round: previousRound.roundNumber,
    status: CompetitionRoundAttemptStatus.COMPLETED,
  }).select('score percentage timeTaken');
  if (!result) return false;

  const criteria = previousRound.qualificationCriteria || {};
  const checks: boolean[] = [];
  if (criteria.minimumScore !== undefined) checks.push((result.score || 0) >= criteria.minimumScore);
  if (criteria.minimumPercentage !== undefined) checks.push((result.percentage || 0) >= criteria.minimumPercentage);
  if (criteria.topN !== undefined) {
    const ahead = await CompetitionRoundAttemptModel.countDocuments({
      competition,
      round: previousRound.roundNumber,
      status: CompetitionRoundAttemptStatus.COMPLETED,
      $or: [
        { score: { $gt: result.score || 0 } },
        { score: result.score || 0, timeTaken: { $lt: result.timeTaken || Number.MAX_SAFE_INTEGER } },
        { score: result.score || 0, timeTaken: result.timeTaken || Number.MAX_SAFE_INTEGER, student: { $lt: student } },
      ],
    });
    checks.push(ahead < criteria.topN);
  }
  return checks.length > 0 && checks.every(Boolean);
}
