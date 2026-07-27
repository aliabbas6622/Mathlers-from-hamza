'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, School, BookOpen, 
  Target, FileText, Trophy, Award, 
  BarChart3, Bell, Settings, Layers3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Users, label: 'Students', href: '/admin/students' },
  { icon: School, label: 'Schools', href: '/admin/schools' },
  { icon: BookOpen, label: 'Learning', href: '/admin/learning' },
  { icon: Target, label: 'Question Bank', href: '/admin/questions' },
  { icon: Layers3, label: 'Subjects & Topics', href: '/admin/content' },
  { icon: FileText, label: 'Practice Sets', href: '/admin/practice' },
  { icon: Trophy, label: 'Competitions', href: '/admin/competitions' },
  { icon: Award, label: 'Results', href: '/admin/results' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col overflow-hidden border-r border-gray-200/50 bg-white/80 backdrop-blur-xl">
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <Link href="/admin/dashboard" className="mb-8 flex shrink-0 items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900">Mathlers</span>
            <p className="text-xs text-gray-500">Admin Portal</p>
          </div>
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
