'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, User, CreditCard, 
  Target, Trophy, TrendingUp, 
  Award, FileText, Bell, Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/student/dashboard' },
  { icon: User, label: 'My Profile', href: '/student/profile' },
  { icon: CreditCard, label: 'Player Card', href: '/student/player-card' },
  { icon: Target, label: 'Practice Arena', href: '/student/practice' },
  { icon: Trophy, label: 'Competitions', href: '/student/competitions' },
  { icon: TrendingUp, label: 'Leaderboards', href: '/student/leaderboard' },
  { icon: Award, label: 'Achievements', href: '/student/achievements' },
  { icon: FileText, label: 'Certificates', href: '/student/certificates' },
  { icon: Bell, label: 'Notifications', href: '/student/notifications' },
  { icon: Settings, label: 'Settings', href: '/student/settings' },
];

export default function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col overflow-hidden border-r border-gray-200/50 bg-white/80 backdrop-blur-xl">
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <Link href="/student/dashboard" className="mb-8 flex shrink-0 items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">Mathlers</span>
        </Link>

        <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pb-2 pr-1 overscroll-contain">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                  isActive
                    ? 'bg-brand-primary text-white shadow-lg'
                    : 'text-gray-700 hover:bg-brand-lighter hover:text-brand-primary'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
