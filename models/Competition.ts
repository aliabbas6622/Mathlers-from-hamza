import mongoose, { Schema, Model } from 'mongoose';
import baseSchema, { BaseDocument } from './Base';

export enum CompetitionStatus {
  DRAFT = 'draft',
  REGISTRATION_OPEN = 'registration_open',
  REGISTRATION_CLOSED = 'registration_closed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface IRound {
  name: string;
  type: 'online' | 'physical';
  questions: mongoose.Types.ObjectId[];
  timer: number;
  passingScore: number;
  numberOfQualifiers: number;
  startDate: Date;
  endDate: Date;
  venue?: string;
  hall?: string;
  room?: string;
  seatAllocation?: Map<string, string>;
  entryQR?: string;
  attendanceQR?: string;
}

export interface ICompetition extends BaseDocument {
  name: string;
  banner?: string;
  description: string;
  organizer: string;
  contact: string;
  rulebook: string;
  eligibility: {
    grades: string[];
    minAge?: number;
    maxAge?: number;
    schools?: mongoose.Types.ObjectId[];
  };
  registration: {
    startDate: Date;
    endDate: Date;
    maxParticipants: number;
  };
  competition: {
    startDate: Date;
    endDate: Date;
  };
  prizeDetails: string;
  status: CompetitionStatus;
  rounds: IRound[];
  createdBy: mongoose.Types.ObjectId;
  analytics: {
    registrations: number;
    attendance: number;
    liveParticipants: number;
    completionRate: number;
    qualificationRate: number;
    gradeWisePerformance: Map<string, number>;
    schoolWisePerformance: Map<string, number>;
  };
}

const CompetitionSchema = new Schema<ICompetition>(
  {
    name: {
      type: String,
      required: [true, 'Competition name is required'],
      trim: true,
    },
    banner: {
      type: String,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    contact: {
      type: String,
      required: [true, 'Contact is required'],
      trim: true,
    },
    rulebook: {
      type: String,
      required: [true, 'Rulebook is required'],
    },
    eligibility: {
      grades: {
        type: [String],
        required: [true, 'Grades are required'],
      },
      minAge: {
        type: Number,
      },
      maxAge: {
        type: Number,
      },
      schools: [{
        type: Schema.Types.ObjectId,
        ref: 'School',
      }],
    },
    registration: {
      startDate: {
        type: Date,
        required: [true, 'Registration start date is required'],
      },
      endDate: {
        type: Date,
        required: [true, 'Registration end date is required'],
      },
      maxParticipants: {
        type: Number,
        required: [true, 'Max participants is required'],
      },
    },
    competition: {
      startDate: {
        type: Date,
        required: [true, 'Competition start date is required'],
      },
      endDate: {
        type: Date,
        required: [true, 'Competition end date is required'],
      },
    },
    prizeDetails: {
      type: String,
      required: [true, 'Prize details are required'],
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(CompetitionStatus),
      default: CompetitionStatus.DRAFT,
    },
    rounds: [{
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
        enum: ['online', 'physical'],
      },
      questions: [{
        type: Schema.Types.ObjectId,
        ref: 'Question',
      }],
      timer: {
        type: Number,
        required: true,
      },
      passingScore: {
        type: Number,
        required: true,
      },
      numberOfQualifiers: {
        type: Number,
        required: true,
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      venue: {
        type: String,
      },
      hall: {
        type: String,
      },
      room: {
        type: String,
      },
      seatAllocation: {
        type: Map,
        of: String,
      },
      entryQR: {
        type: String,
      },
      attendanceQR: {
        type: String,
      },
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },
    analytics: {
      registrations: {
        type: Number,
        default: 0,
      },
      attendance: {
        type: Number,
        default: 0,
      },
      liveParticipants: {
        type: Number,
        default: 0,
      },
      completionRate: {
        type: Number,
        default: 0,
      },
      qualificationRate: {
        type: Number,
        default: 0,
      },
      gradeWisePerformance: {
        type: Map,
        of: Number,
        default: new Map(),
      },
      schoolWisePerformance: {
        type: Map,
        of: Number,
        default: new Map(),
      },
    },
  },
  {
    timestamps: true,
  }
);

CompetitionSchema.index({ status: 1 });
CompetitionSchema.index({ 'registration.startDate': 1, 'registration.endDate': 1 });
CompetitionSchema.index({ 'competition.startDate': 1, 'competition.endDate': 1 });

const CompetitionModel: Model<ICompetition> = mongoose.models.Competition || mongoose.model<ICompetition>('Competition', CompetitionSchema);

export default CompetitionModel;
