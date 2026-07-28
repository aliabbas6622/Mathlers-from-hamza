'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';
import { cn } from '@mathlers/lib/utils';
import { UserButton } from '@clerk/nextjs';

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col overflow-hidden border-r border-slate-200 bg-slate-950 text-slate-100">
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <Link href="/admin/developer" className="mb-8 flex shrink-0 items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <div>
            <span className="text-xl font-bold text-white">Mathlers</span>
            <p className="text-xs text-slate-400">Developer console</p>
          </div>
        </Link>

        <nav className="scrollbar-hide min-h-0 flex-1 space-y-2 overflow-y-auto pb-2 pr-1 overscroll-contain">
          {[{ icon: Settings, label: 'Developer', href: '/admin/developer' }].map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 transition-colors',
                  isActive
                    ? 'bg-white text-slate-950'
                    : 'text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 flex items-center gap-3 border-t border-slate-800 pt-4">
          <UserButton />
          <span className="text-sm font-medium text-slate-300">Account</span>
        </div>
      </div>
    </aside>
  );
}
