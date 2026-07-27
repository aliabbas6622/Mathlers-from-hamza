import mongoose, { Schema, Model } from 'mongoose';
import baseSchema, { BaseDocument } from './Base';

export interface IGrade extends BaseDocument {
  name: string;
  code: string;
  order: number;
  isActive: boolean;
}

const GradeSchema = new Schema<IGrade>(
  {
    name: {
      type: String,
      required: [true, 'Grade name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Grade code is required'],
      unique: true,
      uppercase: true,
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

GradeSchema.index({ order: 1 });
GradeSchema.index({ isActive: 1 });

const GradeModel: Model<IGrade> = mongoose.models.Grade || mongoose.model<IGrade>('Grade', GradeSchema);

export default GradeModel;
