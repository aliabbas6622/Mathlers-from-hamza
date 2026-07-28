'use client';

import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { UserRole } from '@/lib/constants/roles';

export function useAuth() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const role = clerkUser?.publicMetadata.role as UserRole | undefined;
  const user = clerkUser ? { id: clerkUser.id, email: clerkUser.primaryEmailAddress?.emailAddress, name: clerkUser.fullName, role } : undefined;

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!role) return false;
    const roleHierarchy: Record<UserRole, number> = {
      [UserRole.STUDENT]: 1,
      [UserRole.TEACHER]: 2,
      [UserRole.COORDINATOR]: 3,
      [UserRole.ADMIN]: 4,
      [UserRole.SUPER_ADMIN]: 5,
    };
    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  const isStudent = role === UserRole.STUDENT;
  const isAdmin = hasRole(UserRole.ADMIN);
  const isSuperAdmin = role === UserRole.SUPER_ADMIN;

  return {
    user,
    session: null,
    isAuthenticated: isSignedIn,
    isLoading: !isLoaded,
    hasRole,
    isStudent,
    isAdmin,
    isSuperAdmin,
    update: async () => undefined,
  };
}
