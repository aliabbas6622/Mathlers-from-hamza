import mongoose, { Schema, Model } from 'mongoose';
import baseSchema, { BaseDocument } from './Base';

export enum CertificateType {
  PARTICIPATION = 'participation',
  FINALIST = 'finalist',
  WINNER = 'winner',
  SPECIAL_AWARD = 'special_award',
}

export interface ICertificate extends BaseDocument {
  student: mongoose.Types.ObjectId;
  competition?: mongoose.Types.ObjectId;
  type: CertificateType;
  certificateId: string;
  qrCode: string;
  issueDate: Date;
  details: {
    eventName: string;
    position?: string;
    date: Date;
    venue?: string;
  };
  template: string;
  signature?: string;
  isDownloaded: boolean;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    competition: {
      type: Schema.Types.ObjectId,
      ref: 'Competition',
    },
    type: {
      type: String,
      required: [true, 'Certificate type is required'],
      enum: Object.values(CertificateType),
    },
    certificateId: {
      type: String,
      required: [true, 'Certificate ID is required'],
      unique: true,
    },
    qrCode: {
      type: String,
      required: [true, 'QR code is required'],
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    details: {
      eventName: {
        type: String,
        required: [true, 'Event name is required'],
      },
      position: {
        type: String,
      },
      date: {
        type: Date,
        required: [true, 'Date is required'],
      },
      venue: {
        type: String,
      },
    },
    template: {
      type: String,
      required: [true, 'Template is required'],
    },
    signature: {
      type: String,
    },
    isDownloaded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

CertificateSchema.index({ student: 1 });
CertificateSchema.index({ competition: 1 });
CertificateSchema.index({ certificateId: 1 });
CertificateSchema.index({ type: 1 });

const CertificateModel: Model<ICertificate> = mongoose.models.Certificate || mongoose.model<ICertificate>('Certificate', CertificateSchema);

export default CertificateModel;
