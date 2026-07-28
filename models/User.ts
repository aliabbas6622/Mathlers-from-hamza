import mongoose, { Schema, Model } from 'mongoose';
import { BaseDocument } from './Base';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  COORDINATOR = 'coordinator',
}

export interface IUser extends BaseDocument {
  clerkId?: string;
  fullName: string;
  fatherName?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  email: string;
  phone?: string;
  password?: string;
  school?: mongoose.Types.ObjectId;
  schoolName?: string;
  city?: string;
  grade?: string;
  role: UserRole;
  playerId: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  profileComplete: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  level: number;
  points: number;
  nationalRank?: number;
  schoolRank?: number;
  accuracy: number;
  currentStreak: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  competitionsJoined: number;
  competitionsWon: number;
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      unique: true,
      sparse: true,
      immutable: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
    },
    schoolName: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    grade: {
      type: String,
      enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
    playerId: {
      type: String,
      required: true,
      unique: true,
    },
    profilePicture: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    level: {
      type: Number,
      default: 1,
    },
    points: {
      type: Number,
      default: 0,
    },
    nationalRank: {
      type: Number,
    },
    schoolRank: {
      type: Number,
    },
    accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    wrongAnswers: {
      type: Number,
      default: 0,
    },
    competitionsJoined: {
      type: Number,
      default: 0,
    },
    competitionsWon: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ school: 1 });
UserSchema.index({ grade: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ points: -1 });
UserSchema.index({ nationalRank: 1 });

const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
