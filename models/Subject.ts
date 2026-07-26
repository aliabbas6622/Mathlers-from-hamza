import mongoose, { Schema, Model } from 'mongoose';
import baseSchema, { BaseDocument } from './Base';

export interface ISubject extends BaseDocument {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
    },
    color: {
      type: String,
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

SubjectSchema.index({ code: 1 });
SubjectSchema.index({ order: 1 });
SubjectSchema.index({ isActive: 1 });

const SubjectModel: Model<ISubject> = mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);

export default SubjectModel;
