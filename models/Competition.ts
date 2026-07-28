import { randomBytes } from 'crypto';
import mongoose, { Schema, Model } from 'mongoose';
import { BaseDocument } from './Base';

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum CompetitionCategory {
  PUBLIC = 'public',
  GRADE = 'grade',
  CHAMPIONSHIP = 'championship',
}

export enum CompetitionStatus {
  DRAFT = 'draft',
  REGISTRATION_OPEN = 'registration_open',
  REGISTRATION_CLOSED = 'registration_closed',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
}

export enum RegistrationType {
  AUTOMATIC = 'automatic',
  MANUAL_APPROVAL = 'manual_approval',
  ACCESS_CODE = 'access_code',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

// ─── Section Interface ───────────────────────────────────────────────────────

export interface ISection {
  name: string;
  description?: string;
  questions: mongoose.Types.ObjectId[];
  settings: {
    duration: number; // minutes
    totalMarks: number;
    passingMarks: number;
    negativeMarking: boolean;
    negativeMarkValue?: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    calculatorAllowed: boolean;
    skipAllowed: boolean;
    reviewAllowed: boolean;
  };
  order: number;
}

// ─── Championship Round Interface ────────────────────────────────────────────

export interface IChampionshipRound {
  name: string;
  roundNumber: number;
  type: 'qualifier' | 'quarter_final' | 'semi_final' | 'final' | 'custom';
  sections: ISection[];
  qualificationCriteria: {
    topN?: number;           // top N qualify
    minimumScore?: number;   // minimum score to qualify
    minimumPercentage?: number;
  };
  schedule: {
    startDate: Date;
    endDate: Date;
  };
  status: 'upcoming' | 'in_progress' | 'completed';
}

// ─── Main Competition Interface ──────────────────────────────────────────────

export interface ICompetition extends BaseDocument {
  // Basic Info
  name: string;
  category: CompetitionCategory;
  banner?: string;
  logo?: string;
  description: string;
  organizer: string;
  contact: string;
  language: string;
  difficultyLevel: DifficultyLevel;

  // Eligibility
  eligibility: {
    type: 'public' | 'selected_grades' | 'selected_schools' | 'invite_only';
    grades: string[];
    schools?: mongoose.Types.ObjectId[];
    minAge?: number;
    maxAge?: number;
    maxParticipants: number;
  };

  // Registration
  registration: {
    startDate: Date;
    endDate: Date;
    type: RegistrationType;
    accessCode?: string;
  };

  // Schedule
  schedule: {
    competitionStartDate: Date;
    competitionEndDate: Date;
  };

  // Rulebook
  rulebook: {
    content: string;     // rich text or markdown
    pdfUrl?: string;
    acceptanceRequired: boolean;
  };

  // Prize
  prizeDetails: string;

  // Structure — for Public & Grade competitions
  sections: ISection[];

  // Structure — for Championship competitions
  rounds: IChampionshipRound[];

  // Status
  status: CompetitionStatus;
  createdBy: mongoose.Types.ObjectId;

  // Analytics
  analytics: {
    totalRegistrations: number;
    dailyRegistrations: Map<string, number>;
    attendance: number;
    liveParticipants: number;
    studentsStarted: number;
    studentsCompleted: number;
    dropOffRate: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    medianScore: number;
    passRate: number;
    qualificationRate: number;
    averageCompletionTime: number;
    gradeWiseParticipation: Map<string, number>;
    gradeWiseAvgScore: Map<string, number>;
    schoolWiseParticipation: Map<string, number>;
    schoolWiseAvgScore: Map<string, number>;
  };
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const SectionSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  settings: {
    duration: { type: Number, required: true, default: 30 },
    totalMarks: { type: Number, required: true, default: 100 },
    passingMarks: { type: Number, required: true, default: 40 },
    negativeMarking: { type: Boolean, default: false },
    negativeMarkValue: { type: Number, default: 0 },
    shuffleQuestions: { type: Boolean, default: true },
    shuffleOptions: { type: Boolean, default: true },
    calculatorAllowed: { type: Boolean, default: false },
    skipAllowed: { type: Boolean, default: true },
    reviewAllowed: { type: Boolean, default: true },
  },
  order: { type: Number, required: true, default: 0 },
}, { _id: true });

const ChampionshipRoundSchema = new Schema({
  name: { type: String, required: true, trim: true },
  roundNumber: { type: Number, required: true },
  type: {
    type: String,
    required: true,
    enum: ['qualifier', 'quarter_final', 'semi_final', 'final', 'custom'],
  },
  sections: [SectionSchema],
  qualificationCriteria: {
    topN: { type: Number },
    minimumScore: { type: Number },
    minimumPercentage: { type: Number },
  },
  schedule: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  status: {
    type: String,
    enum: ['upcoming', 'in_progress', 'completed'],
    default: 'upcoming',
  },
}, { _id: true });

const CompetitionSchema = new Schema<ICompetition>(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, 'Competition name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Competition category is required'],
      enum: Object.values(CompetitionCategory),
      default: CompetitionCategory.PUBLIC,
    },
    banner: { type: String },
    logo: { type: String },
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
    language: {
      type: String,
      default: 'English',
      trim: true,
    },
    difficultyLevel: {
      type: String,
      required: true,
      enum: Object.values(DifficultyLevel),
      default: DifficultyLevel.INTERMEDIATE,
    },

    // Eligibility
    eligibility: {
      type: {
        type: String,
        required: true,
        enum: ['public', 'selected_grades', 'selected_schools', 'invite_only'],
        default: 'public',
      },
      grades: {
        type: [String],
        default: [],
      },
      schools: [{
        type: Schema.Types.ObjectId,
        ref: 'School',
      }],
      minAge: { type: Number },
      maxAge: { type: Number },
      maxParticipants: {
        type: Number,
        required: [true, 'Max participants is required'],
        default: 500,
      },
    },

    // Registration
    registration: {
      startDate: {
        type: Date,
        required: [true, 'Registration start date is required'],
      },
      endDate: {
        type: Date,
        required: [true, 'Registration end date is required'],
      },
      type: {
        type: String,
        required: true,
        enum: Object.values(RegistrationType),
        default: RegistrationType.AUTOMATIC,
      },
      accessCode: { type: String, trim: true, uppercase: true },
    },

    // Schedule
    schedule: {
      competitionStartDate: {
        type: Date,
        required: [true, 'Competition start date is required'],
      },
      competitionEndDate: {
        type: Date,
        required: [true, 'Competition end date is required'],
      },
    },

    // Rulebook
    rulebook: {
      content: {
        type: String,
        required: [true, 'Rulebook content is required'],
      },
      pdfUrl: { type: String },
      acceptanceRequired: {
        type: Boolean,
        default: true,
      },
    },

    // Prize
    prizeDetails: {
      type: String,
      required: [true, 'Prize details are required'],
    },

    // Structure
    sections: [SectionSchema],
    rounds: [ChampionshipRoundSchema],

    // Status
    status: {
      type: String,
      required: true,
      enum: Object.values(CompetitionStatus),
      default: CompetitionStatus.DRAFT,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },

    // Analytics
    analytics: {
      totalRegistrations: { type: Number, default: 0 },
      dailyRegistrations: { type: Map, of: Number, default: new Map() },
      attendance: { type: Number, default: 0 },
      liveParticipants: { type: Number, default: 0 },
      studentsStarted: { type: Number, default: 0 },
      studentsCompleted: { type: Number, default: 0 },
      dropOffRate: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      highestScore: { type: Number, default: 0 },
      lowestScore: { type: Number, default: 0 },
      medianScore: { type: Number, default: 0 },
      passRate: { type: Number, default: 0 },
      qualificationRate: { type: Number, default: 0 },
      averageCompletionTime: { type: Number, default: 0 },
      gradeWiseParticipation: { type: Map, of: Number, default: new Map() },
      gradeWiseAvgScore: { type: Map, of: Number, default: new Map() },
      schoolWiseParticipation: { type: Map, of: Number, default: new Map() },
      schoolWiseAvgScore: { type: Map, of: Number, default: new Map() },
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────

CompetitionSchema.index({ status: 1 });
CompetitionSchema.index({ category: 1 });
CompetitionSchema.index({ 'registration.startDate': 1, 'registration.endDate': 1 });
CompetitionSchema.index({ 'schedule.competitionStartDate': 1, 'schedule.competitionEndDate': 1 });
CompetitionSchema.index({ 'registration.accessCode': 1 }, { unique: true, sparse: true });

// ─── Access Code Generation ─────────────────────────────────────────────────

CompetitionSchema.pre('save', function () {
  if (
    this.category === CompetitionCategory.GRADE &&
    this.registration.type === RegistrationType.ACCESS_CODE &&
    !this.registration.accessCode
  ) {
    const gradeTag = this.eligibility.grades[0]?.replace(/\s/g, '') || 'GX';
    const randomPart = randomBytes(8).toString('hex').toUpperCase();
    this.registration.accessCode = `MTH-${gradeTag}-${randomPart}`;
  }
});

const CompetitionModel: Model<ICompetition> = mongoose.models.Competition || mongoose.model<ICompetition>('Competition', CompetitionSchema);

export default CompetitionModel;
