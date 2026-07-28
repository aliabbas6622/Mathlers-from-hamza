import { auth as clerkAuth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import UserModel, { UserRole } from '@/models/User';

export type MathlersSession = {
  user: { id: string; email: string; name: string; role: UserRole; playerId: string };
};

/** Resolves Clerk identities to the Mongo ObjectIds used by Mathlers records. */
export async function auth(): Promise<MathlersSession | null> {
  const { userId } = await clerkAuth();
  if (!userId) return null;

  await connectDB();
  let user = await UserModel.findOne({ clerkId: userId });

  if (!user) {
    const clerkUser = await currentUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress?.toLowerCase();
    if (!clerkUser || !email || clerkUser.primaryEmailAddress?.verification?.status !== 'verified') return null;

    const existing = await UserModel.findOne({ email });
    if (existing) {
      if (existing.clerkId && existing.clerkId !== userId) return null;
      existing.clerkId = userId;
      existing.isEmailVerified = true;
      await existing.save();
      user = existing;
    } else return null;
  }

  if (!user.isActive || user.isSuspended) return null;
  return { user: { id: user._id.toString(), email: user.email, name: user.fullName, role: user.role, playerId: user.playerId } };
}

export const isAdmin = (role?: string) => role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
export const isSuperAdmin = (role?: string) => role === UserRole.SUPER_ADMIN;
export const isTeacher = (role?: string) => role === UserRole.TEACHER;
export const canManageContent = (role?: string) => isTeacher(role) || isAdmin(role);
export const canManageSchoolOperations = (role?: string) => isAdmin(role);
