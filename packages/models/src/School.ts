import mongoose, { Schema, Model } from 'mongoose';
import { BaseDocument } from './Base';

export interface ISchool extends BaseDocument {
  name: string;
  address: string;
  city: string;
  coordinator?: mongoose.Types.ObjectId;
  coordinatorName?: string;
  contactNumber: string;
  email?: string;
  totalStudents: number;
  activeStudents: number;
  averageAccuracy: number;
  competitionsParticipated: number;
  competitionsWon: number;
  schoolRank?: number;
  isActive: boolean;
}

const SchoolSchema = new Schema<ISchool>(
  {
    name: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    coordinator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    coordinatorName: {
      type: String,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    activeStudents: {
      type: Number,
      default: 0,
    },
    averageAccuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    competitionsParticipated: {
      type: Number,
      default: 0,
    },
    competitionsWon: {
      type: Number,
      default: 0,
    },
    schoolRank: {
      type: Number,
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

SchoolSchema.index({ name: 1 });
SchoolSchema.index({ city: 1 });
SchoolSchema.index({ coordinator: 1 });
SchoolSchema.index({ totalStudents: -1 });
SchoolSchema.index({ schoolRank: 1 });

const SchoolModel: Model<ISchool> = mongoose.models.School || mongoose.model<ISchool>('School', SchoolSchema);

export default SchoolModel;
