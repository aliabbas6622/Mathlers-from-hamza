import mongoose, { Schema, Model } from 'mongoose';
import baseSchema, { BaseDocument } from './Base';

export enum BadgeType {
  SPEED_SOLVER = 'speed_solver',
  MATH_WARRIOR = 'math_warrior',
  CHAMPION = 'champion',
  DAILY_STREAK = 'daily_streak',
  WEEKLY_CHAMPION = 'weekly_champion',
  PERFECT_SCORE = 'perfect_score',
  TOP_RANKER = 'top_ranker',
  QUICK_LEARNER = 'quick_learner',
}

export interface IBadge extends BaseDocument {
  name: string;
  type: BadgeType;
  description: string;
  icon: string;
  color: string;
  target: number;
  targetDescription: string;
  points: number;
  isActive: boolean;
}

const BadgeSchema = new Schema<IBadge>(
  {
    name: {
      type: String,
      required: [true, 'Badge name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Badge type is required'],
      enum: Object.values(BadgeType),
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    icon: {
      type: String,
      required: [true, 'Icon is required'],
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
    },
    target: {
      type: Number,
      required: [true, 'Target is required'],
    },
    targetDescription: {
      type: String,
      required: [true, 'Target description is required'],
      trim: true,
    },
    points: {
      type: Number,
      required: [true, 'Points is required'],
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

BadgeSchema.index({ type: 1 });
BadgeSchema.index({ isActive: 1 });

const BadgeModel: Model<IBadge> = mongoose.models.Badge || mongoose.model<IBadge>('Badge', BadgeSchema);

export default BadgeModel;
