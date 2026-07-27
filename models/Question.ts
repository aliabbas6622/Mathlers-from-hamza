import mongoose, { Schema, Model } from 'mongoose';
import baseSchema, { BaseDocument } from './Base';

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export interface IQuestion extends BaseDocument {
  subject: mongoose.Types.ObjectId;
  grade: mongoose.Types.ObjectId;
  chapter: mongoose.Types.ObjectId;
  topic: mongoose.Types.ObjectId;
  subtopic?: mongoose.Types.ObjectId;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: Difficulty;
  marks: number;
  estimatedTime: number;
  status: 'active' | 'inactive' | 'archived';
  createdBy: mongoose.Types.ObjectId;
  analytics: {
    totalAttempts: number;
    totalCorrect: number;
    totalIncorrect: number;
    correctPercentage: number;
    incorrectPercentage: number;
    averageTime: number;
    fastestCorrectAnswer: number;
    slowestCorrectAnswer: number;
    skipCount: number;
    numberOfTimesUsed: number;
    lastUsedDate: Date;
    usageInPractice: number;
    usageInTests: number;
    usageInCompetitions: number;
    mostSelectedWrongOption: 'A' | 'B' | 'C' | 'D' | null;
    difficultyIndex: number;
    successRateByGrade: Map<string, number>;
    successRateBySchool: Map<string, number>;
  };
}

const QuestionSchema = new Schema<IQuestion>(
  {
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    grade: {
      type: Schema.Types.ObjectId,
      ref: 'Grade',
      required: [true, 'Grade is required'],
    },
    chapter: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Chapter is required'],
    },
    topic: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic is required'],
    },
    subtopic: {
      type: Schema.Types.ObjectId,
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    options: {
      A: {
        type: String,
        required: [true, 'Option A is required'],
        trim: true,
      },
      B: {
        type: String,
        required: [true, 'Option B is required'],
        trim: true,
      },
      C: {
        type: String,
        required: [true, 'Option C is required'],
        trim: true,
      },
      D: {
        type: String,
        required: [true, 'Option D is required'],
        trim: true,
      },
    },
    correctAnswer: {
      type: String,
      required: [true, 'Correct answer is required'],
      enum: ['A', 'B', 'C', 'D'],
    },
    explanation: {
      type: String,
      required: [true, 'Explanation is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: Object.values(Difficulty),
      default: Difficulty.MEDIUM,
    },
    marks: {
      type: Number,
      required: [true, 'Marks is required'],
      default: 1,
    },
    estimatedTime: {
      type: Number,
      required: [true, 'Estimated time is required'],
      default: 60,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },
    analytics: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      totalCorrect: {
        type: Number,
        default: 0,
      },
      totalIncorrect: {
        type: Number,
        default: 0,
      },
      correctPercentage: {
        type: Number,
        default: 0,
      },
      incorrectPercentage: {
        type: Number,
        default: 0,
      },
      averageTime: {
        type: Number,
        default: 0,
      },
      fastestCorrectAnswer: {
        type: Number,
        default: 0,
      },
      slowestCorrectAnswer: {
        type: Number,
        default: 0,
      },
      skipCount: {
        type: Number,
        default: 0,
      },
      numberOfTimesUsed: {
        type: Number,
        default: 0,
      },
      lastUsedDate: {
        type: Date,
        default: Date.now,
      },
      usageInPractice: {
        type: Number,
        default: 0,
      },
      usageInTests: {
        type: Number,
        default: 0,
      },
      usageInCompetitions: {
        type: Number,
        default: 0,
      },
      mostSelectedWrongOption: {
        type: String,
        enum: ['A', 'B', 'C', 'D', null],
        default: null,
      },
      difficultyIndex: {
        type: Number,
        default: 0,
      },
      successRateByGrade: {
        type: Map,
        of: Number,
        default: new Map(),
      },
      successRateBySchool: {
        type: Map,
        of: Number,
        default: new Map(),
      },
    },
  },
  {
    timestamps: true,
  }
);

QuestionSchema.index({ subject: 1, grade: 1, chapter: 1, topic: 1, subtopic: 1 });
QuestionSchema.index({ difficulty: 1 });
QuestionSchema.index({ status: 1 });
QuestionSchema.index({ 'analytics.totalAttempts': -1 });
QuestionSchema.index({ 'analytics.correctPercentage': -1 });

const QuestionModel: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

export default QuestionModel;
