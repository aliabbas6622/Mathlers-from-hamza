import { UserRole } from '@/models/User';

export const hasRole = (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(userRole);
};

export const isAdmin = (userRole: UserRole): boolean => {
  return userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
};

export const isSuperAdmin = (userRole: UserRole): boolean => {
  return userRole === UserRole.SUPER_ADMIN;
};

export const isStudent = (userRole: UserRole): boolean => {
  return userRole === UserRole.STUDENT;
};

export const isCoordinator = (userRole: UserRole): boolean => {
  return userRole === UserRole.COORDINATOR;
};

export const canAccessStudentPortal = (userRole: UserRole): boolean => {
  return userRole === UserRole.STUDENT;
};

export const canAccessAdminPortal = (userRole: UserRole): boolean => {
  return userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
};

export const canManageUsers = (userRole: UserRole): boolean => {
  return userRole === UserRole.SUPER_ADMIN;
};

export const canManageContent = (userRole: UserRole): boolean => {
  return userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
};

export const canManageCompetitions = (userRole: UserRole): boolean => {
  return userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
};
