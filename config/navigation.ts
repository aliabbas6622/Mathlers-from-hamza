import { UserRole } from '@/lib/constants/roles';

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  roles?: UserRole[];
  children?: NavItem[];
}

export const studentNavigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/student/dashboard',
    icon: '📊',
  },
  {
    title: 'Practice',
    href: '/student/practice',
    icon: '✏️',
  },
  {
    title: 'Competitions',
    href: '/student/competitions',
    icon: '🏆',
  },
  {
    title: 'Leaderboard',
    href: '/student/leaderboard',
    icon: '📈',
  },
  {
    title: 'Results',
    href: '/student/results',
    icon: '📋',
  },
  {
    title: 'Certificates',
    href: '/student/certificates',
    icon: '🎓',
  },
  {
    title: 'Analytics',
    href: '/student/analytics',
    icon: '📉',
  },
  {
    title: 'Profile',
    href: '/student/profile',
    icon: '👤',
  },
];

export const adminNavigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: '📊',
  },
  {
    title: 'Students',
    href: '/admin/students',
    icon: '👥',
  },
  {
    title: 'Questions',
    href: '/admin/questions',
    icon: '❓',
  },
  {
    title: 'Competitions',
    href: '/admin/competitions',
    icon: '🏆',
  },
  {
    title: 'Results',
    href: '/admin/results',
    icon: '📋',
  },
];

export const publicNavigation: NavItem[] = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Features',
    href: '/#features',
  },
  {
    title: 'Login',
    href: '/login',
  },
  {
    title: 'Register',
    href: '/register',
  },
];

export function getNavigationForRole(role?: UserRole): NavItem[] {
  switch (role) {
    case UserRole.STUDENT:
      return studentNavigation;
    case UserRole.ADMIN:
    case UserRole.SUPER_ADMIN:
    case UserRole.COORDINATOR:
      return adminNavigation;
    default:
      return publicNavigation;
  }
}
