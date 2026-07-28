import mongoose, { Schema, Model } from 'mongoose';
import { BaseDocument } from './Base';

export interface IChapter extends BaseDocument {
  subject: mongoose.Types.ObjectId;
  grade: mongoose.Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  order: number;
  isActive: boolean;
}

const ChapterSchema = new Schema<IChapter>(
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
    name: {
      type: String,
      required: [true, 'Chapter name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Chapter code is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ChapterSchema.index({ subject: 1, grade: 1, code: 1 });
ChapterSchema.index({ order: 1 });
ChapterSchema.index({ isActive: 1 });

let ChapterModel: Model<IChapter>;
try {
  ChapterModel = mongoose.model<IChapter>('Chapter');
} catch {
  ChapterModel = mongoose.model<IChapter>('Chapter', ChapterSchema);
}

export default ChapterModel;
