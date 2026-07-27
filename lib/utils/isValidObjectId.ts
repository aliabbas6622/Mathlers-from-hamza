import mongoose from 'mongoose';

/**
 * Checks if a string is a valid MongoDB ObjectId.
 * Used to guard bypass-login IDs (e.g. "bypass-student") from being
 * passed to Mongoose queries, which would throw a CastError.
 */
export function isValidObjectId(id: string | undefined | null): boolean {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}
