import mongoose, { Schema, Model } from 'mongoose';
import { BaseDocument } from './Base';

export interface ISubject extends BaseDocument {
  name: string;
  code: string;
  grades: mongoose.Types.ObjectId[];
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
    grades: [{
      type: Schema.Types.ObjectId,
      ref: 'Grade',
    }],
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

SubjectSchema.index({ grades: 1 });
SubjectSchema.index({ order: 1 });
SubjectSchema.index({ isActive: 1 });

const cachedSubject = mongoose.models.Subject as Model<ISubject> | undefined;
if (cachedSubject && !cachedSubject.schema.path('grades')) mongoose.deleteModel('Subject');
let SubjectModel: Model<ISubject>;
try {
  SubjectModel = mongoose.model<ISubject>('Subject');
} catch {
  SubjectModel = mongoose.model<ISubject>('Subject', SubjectSchema);
}

export default SubjectModel;
