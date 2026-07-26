import mongoose, { Schema, Model, Document } from 'mongoose';

export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const baseSchema = new Schema<BaseDocument>(
  {
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

baseSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

baseSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

baseSchema.pre('countDocuments', function () {
  this.where({ deletedAt: null });
});

export default baseSchema;
