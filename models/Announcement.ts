import mongoose, { Schema, Model } from 'mongoose';
import { BaseDocument } from './Base';

export enum AnnouncementType {
  GENERAL = 'general',
  COMPETITION = 'competition',
  MAINTENANCE = 'maintenance',
  FEATURE = 'feature',
}

export interface IAnnouncement extends BaseDocument {
  title: string;
  content: string;
  type: AnnouncementType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: 'all' | 'students' | 'admins' | 'coordinators';
  competition?: mongoose.Types.ObjectId;
  isActive: boolean;
  publishDate: Date;
  expiryDate?: Date;
  createdBy: mongoose.Types.ObjectId;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Announcement type is required'],
      enum: Object.values(AnnouncementType),
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    targetAudience: {
      type: String,
      required: [true, 'Target audience is required'],
      enum: ['all', 'students', 'admins', 'coordinators'],
      default: 'all',
    },
    competition: {
      type: Schema.Types.ObjectId,
      ref: 'Competition',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    publishDate: {
      type: Date,
      required: [true, 'Publish date is required'],
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },
  },
  {
    timestamps: true,
  }
);

AnnouncementSchema.index({ type: 1 });
AnnouncementSchema.index({ targetAudience: 1 });
AnnouncementSchema.index({ isActive: 1, publishDate: 1 });
AnnouncementSchema.index({ expiryDate: 1 });

let AnnouncementModel: Model<IAnnouncement>;
try {
  AnnouncementModel = mongoose.model<IAnnouncement>('Announcement');
} catch {
  AnnouncementModel = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
}

export default AnnouncementModel;
