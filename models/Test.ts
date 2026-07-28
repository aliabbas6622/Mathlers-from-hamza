import mongoose, { Schema, Model } from 'mongoose';
import { BaseDocument } from './Base';

export enum TestType {
  CHAPTER_TEST = 'chapter_test',
  PRACTICE_TEST = 'practice_test',
  REVISION_TEST = 'revision_test',
  MOCK_TEST = 'mock_test',
  SPEED_TEST = 'speed_test',
}

export interface ITest extends BaseDocument {
  name: string;
  type: TestType;
  subject: mongoose.Types.ObjectId;
  grade: mongoose.Types.ObjectId;
  chapter?: mongoose.Types.ObjectId;
  topic?: mongoose.Types.ObjectId;
  questions: mongoose.Types.ObjectId[];
  timer: number;
  marks: number;
  attempts: number;
  publishDate: Date;
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  analytics: {
    totalAttempts: number;
    passRate: number;
    failRate: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    averageCompletionTime: number;
  };
}

const TestSchema = new Schema<ITest>(
  {
    name: {
      type: String,
      required: [true, 'Test name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Test type is required'],
      enum: Object.values(TestType),
    },
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
    },
    topic: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
    },
    questions: [{
      type: Schema.Types.ObjectId,
      ref: 'Question',
    }],
    timer: {
      type: Number,
      required: [true, 'Timer is required'],
      default: 1800,
    },
    marks: {
      type: Number,
      required: [true, 'Marks is required'],
      default: 100,
    },
    attempts: {
      type: Number,
      required: [true, 'Attempts is required'],
      default: 1,
    },
    publishDate: {
      type: Date,
      required: [true, 'Publish date is required'],
    },
    isPublished: {
      type: Boolean,
      default: false,
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
      passRate: {
        type: Number,
        default: 0,
      },
      failRate: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      highestScore: {
        type: Number,
        default: 0,
      },
      lowestScore: {
        type: Number,
        default: 0,
      },
      averageCompletionTime: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

TestSchema.index({ subject: 1, grade: 1 });
TestSchema.index({ type: 1 });
TestSchema.index({ isPublished: 1 });
TestSchema.index({ publishDate: 1 });

let TestModel: Model<ITest>;
try {
  TestModel = mongoose.model<ITest>('Test');
} catch {
  TestModel = mongoose.model<ITest>('Test', TestSchema);
}

export default TestModel;
