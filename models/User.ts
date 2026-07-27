import mongoose, { Schema, Model } from 'mongoose';
import baseSchema, { BaseDocument } from './Base';

export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  COORDINATOR = 'coordinator',
}

export interface IUser extends BaseDocument {
  fullName: string;
  fatherName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  password: string;
  school?: mongoose.Types.ObjectId;
  schoolName?: string;
  city: string;
  grade: string;
  role: UserRole;
  playerId: string;
  profilePicture?: string;
  isEmailVerified: boolean;
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
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    fatherName: {
      type: String,
      required: [true, 'Father name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
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
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
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
      required: [true, 'City is required'],
      trim: true,
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
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
    emailVerificationToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
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

UserSchema.pre('save', async function (this: IUser) {
  if (!this.playerId) {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await mongoose.model('User').countDocuments();
    const sequence = String(count + 1).padStart(6, '0');
    this.playerId = `MTH-${year}-${sequence}`;
  }
});

const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
