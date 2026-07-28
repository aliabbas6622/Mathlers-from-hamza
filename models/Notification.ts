import mongoose, { Schema, Model } from 'mongoose';
import { BaseDocument } from './Base';

export enum NotificationType {
  ANNOUNCEMENT = 'announcement',
  COMPETITION_UPDATE = 'competition_update',
  RESULT = 'result',
  DAILY_CHALLENGE = 'daily_challenge',
  WEEKLY_CHALLENGE = 'weekly_challenge',
  ACHIEVEMENT = 'achievement',
  CERTIFICATE = 'certificate',
}

export interface INotification extends BaseDocument {
  recipient: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  sentAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: Object.values(NotificationType),
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ sentAt: -1 });

let NotificationModel: Model<INotification>;
try {
  NotificationModel = mongoose.model<INotification>('Notification');
} catch {
  NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
}

export default NotificationModel;
