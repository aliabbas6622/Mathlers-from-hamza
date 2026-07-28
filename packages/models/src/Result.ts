import mongoose, { Schema, Model } from 'mongoose';
import { BaseDocument } from './Base';

export enum ResultType {
  PRACTICE = 'practice',
  TEST = 'test',
  COMPETITION = 'competition',
}

export interface IResult extends BaseDocument {
  student: mongoose.Types.ObjectId;
  type: ResultType;
  practiceSet?: mongoose.Types.ObjectId;
  test?: mongoose.Types.ObjectId;
  competition?: mongoose.Types.ObjectId;
  round?: number;
  score: number;
  totalMarks: number;
  correctAnswers: number;
  wrongAnswers: number;
  skipped: number;
  accuracy: number;
  timeTaken: number;
  answers: {
    questionId: mongoose.Types.ObjectId;
    selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
    isCorrect: boolean;
    timeSpent: number;
  }[];
  rank?: number;
  isQualified?: boolean;
  completedAt: Date;
}

const ResultSchema = new Schema<IResult>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    type: {
      type: String,
      required: [true, 'Result type is required'],
      enum: Object.values(ResultType),
    },
    practiceSet: {
      type: Schema.Types.ObjectId,
      ref: 'PracticeSet',
    },
    test: {
      type: Schema.Types.ObjectId,
      ref: 'Test',
    },
    competition: {
      type: Schema.Types.ObjectId,
      ref: 'Competition',
    },
    round: {
      type: Number,
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
    },
    correctAnswers: {
      type: Number,
      required: [true, 'Correct answers is required'],
      default: 0,
    },
    wrongAnswers: {
      type: Number,
      required: [true, 'Wrong answers is required'],
      default: 0,
    },
    skipped: {
      type: Number,
      required: [true, 'Skipped is required'],
      default: 0,
    },
    accuracy: {
      type: Number,
      required: [true, 'Accuracy is required'],
      min: 0,
      max: 100,
    },
    timeTaken: {
      type: Number,
      required: [true, 'Time taken is required'],
    },
    answers: [{
      questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
      },
      selectedAnswer: {
        type: String,
        enum: ['A', 'B', 'C', 'D', null],
      },
      isCorrect: {
        type: Boolean,
        required: true,
      },
      timeSpent: {
        type: Number,
        required: true,
      },
    }],
    rank: {
      type: Number,
    },
    isQualified: {
      type: Boolean,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ResultSchema.index({ student: 1, type: 1 });
ResultSchema.index({ competition: 1, round: 1 });
ResultSchema.index({ competition: 1, student: 1, type: 1 }, { unique: true, sparse: true });
ResultSchema.index({ practiceSet: 1 });
ResultSchema.index({ test: 1 });
ResultSchema.index({ score: -1 });
ResultSchema.index({ completedAt: -1 });

const ResultModel: Model<IResult> = mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);

export default ResultModel;
