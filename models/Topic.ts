import mongoose, { Schema, Model } from 'mongoose';
import baseSchema, { BaseDocument } from './Base';

export interface ITopic extends BaseDocument {
  subject: mongoose.Types.ObjectId;
  subjects: mongoose.Types.ObjectId[];
  grade: mongoose.Types.ObjectId;
  chapter: mongoose.Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  subtopics: Array<{
    _id?: mongoose.Types.ObjectId;
    name: string;
    code?: string;
  }>;
  order: number;
  isActive: boolean;
}

const TopicSchema = new Schema<ITopic>(
  {
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    subjects: [{
      type: Schema.Types.ObjectId,
      ref: 'Subject',
    }],
    grade: {
      type: Schema.Types.ObjectId,
      ref: 'Grade',
      required: false,
    },
    chapter: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
      required: false,
    },
    name: {
      type: String,
      required: [true, 'Topic name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Topic code is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subtopics: [{
      name: { type: String, required: true, trim: true },
      code: { type: String, trim: true },
    }],
    order: {
      type: Number,
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

TopicSchema.index({ subject: 1, grade: 1, chapter: 1, code: 1 });
TopicSchema.index({ order: 1 });
TopicSchema.index({ isActive: 1 });

if (mongoose.models.Topic) {
  delete mongoose.models.Topic;
}

const TopicModel: Model<ITopic> = mongoose.model<ITopic>('Topic', TopicSchema);

export default TopicModel;
