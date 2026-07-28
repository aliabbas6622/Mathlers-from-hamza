import mongoose, { Model, Schema } from 'mongoose';
import { BaseDocument } from './Base';

export enum CompetitionRoundAttemptStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface ICompetitionRoundAttempt extends BaseDocument {
  competition: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  round: number;
  status: CompetitionRoundAttemptStatus;
  startedAt: Date;
  endsAt: Date;
  completedAt?: Date;
  score?: number;
  totalMarks?: number;
  percentage?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  skipped?: number;
  timeTaken?: number;
  answers: {
    questionId: mongoose.Types.ObjectId;
    selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
    isCorrect: boolean;
    marksObtained: number;
  }[];
}

const CompetitionRoundAttemptSchema = new Schema<ICompetitionRoundAttempt>({
  competition: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  round: { type: Number, required: true, min: 1 },
  status: { type: String, enum: Object.values(CompetitionRoundAttemptStatus), default: CompetitionRoundAttemptStatus.IN_PROGRESS },
  startedAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  completedAt: Date,
  score: Number,
  totalMarks: Number,
  percentage: Number,
  correctAnswers: Number,
  wrongAnswers: Number,
  skipped: Number,
  timeTaken: Number,
  answers: [{
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedAnswer: { type: String, enum: ['A', 'B', 'C', 'D', null] },
    isCorrect: { type: Boolean, required: true },
    marksObtained: { type: Number, required: true },
  }],
}, { timestamps: true });

CompetitionRoundAttemptSchema.index({ competition: 1, student: 1, round: 1 }, { unique: true });
CompetitionRoundAttemptSchema.index({ competition: 1, round: 1, score: -1, timeTaken: 1 });

let CompetitionRoundAttemptModel: Model<ICompetitionRoundAttempt>;
try {
  CompetitionRoundAttemptModel = mongoose.model<ICompetitionRoundAttempt>('CompetitionRoundAttempt');
} catch {
  CompetitionRoundAttemptModel = mongoose.model<ICompetitionRoundAttempt>('CompetitionRoundAttempt', CompetitionRoundAttemptSchema);
}

export default CompetitionRoundAttemptModel;
