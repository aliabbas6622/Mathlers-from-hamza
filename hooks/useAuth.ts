'use client';

import { useSession } from 'next-auth/react';
import { UserRole } from '@/lib/constants/roles';

export function useAuth() {
  const { data: session, status, update } = useSession();

  const user = session?.user;
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!user?.role) return false;
    const roleHierarchy: Record<UserRole, number> = {
      [UserRole.STUDENT]: 1,
      [UserRole.TEACHER]: 2,
      [UserRole.COORDINATOR]: 3,
      [UserRole.ADMIN]: 4,
      [UserRole.SUPER_ADMIN]: 5,
    };
    return roleHierarchy[user.role as UserRole] >= roleHierarchy[requiredRole];
  };

  const isStudent = user?.role === UserRole.STUDENT;
  const isAdmin = hasRole(UserRole.ADMIN);
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    hasRole,
    isStudent,
    isAdmin,
    isSuperAdmin,
    update,
  };
}
