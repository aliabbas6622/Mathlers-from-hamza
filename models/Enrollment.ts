import mongoose, { Schema, Model } from 'mongoose';
import { BaseDocument } from './Base';

export enum EnrollmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WAITING_LIST = 'waiting_list',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface IEnrollment extends BaseDocument {
  competition: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  status: EnrollmentStatus;
  enrollmentDate: Date;
  rulebookAccepted: boolean;
  participantId: string;
  qrCode: string;
  currentRound: number;
  isQualified: boolean;
  startTime?: Date;
  endTime?: Date;
  score?: number;
  totalMarks?: number;
  percentage?: number;
  answers: {
    questionId: string;
    userAnswer?: string | number | string[] | number[] | null;
    isCorrect: boolean;
    marksObtained: number;
  }[];
  attendance: {
    round: number;
    attended: boolean;
    timestamp: Date;
  }[];
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    competition: {
      type: Schema.Types.ObjectId,
      ref: 'Competition',
      required: [true, 'Competition is required'],
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(EnrollmentStatus),
      default: EnrollmentStatus.PENDING,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    rulebookAccepted: {
      type: Boolean,
      default: false,
    },
    participantId: {
      type: String,
      required: [true, 'Participant ID is required'],
      unique: true,
    },
    qrCode: {
      type: String,
      required: [true, 'QR code is required'],
    },
    currentRound: {
      type: Number,
      default: 0,
    },
    isQualified: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    score: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    answers: [{
      questionId: {
        type: String,
        required: true,
      },
      userAnswer: {
        type: Schema.Types.Mixed,
      },
      isCorrect: {
        type: Boolean,
        required: true,
      },
      marksObtained: {
        type: Number,
        required: true,
        default: 0,
      },
    }],
    attendance: [{
      round: {
        type: Number,
        required: true,
      },
      attended: {
        type: Boolean,
        default: false,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

EnrollmentSchema.index({ competition: 1, student: 1 }, { unique: true });
EnrollmentSchema.index({ status: 1 });

const EnrollmentModel: Model<IEnrollment> = mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);

export default EnrollmentModel;
