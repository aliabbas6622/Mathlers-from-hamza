import mongoose, { Schema, Model } from 'mongoose';
import { BaseDocument } from './Base';

export interface IAchievement extends BaseDocument {
  student: mongoose.Types.ObjectId;
  badge: mongoose.Types.ObjectId;
  earnedDate: Date;
  progress: number;
  target: number;
  isCompleted: boolean;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    badge: {
      type: Schema.Types.ObjectId,
      ref: 'Badge',
      required: [true, 'Badge is required'],
    },
    earnedDate: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
    },
    target: {
      type: Number,
      required: [true, 'Target is required'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

AchievementSchema.index({ student: 1, badge: 1 });
AchievementSchema.index({ isCompleted: 1 });

const AchievementModel: Model<IAchievement> = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);

export default AchievementModel;
