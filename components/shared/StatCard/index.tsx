import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: string;
  className?: string;
}

export default function StatCard({ icon, value, label, trend, className }: StatCardProps) {
  return (
    <div className={cn('glass-card p-6 rounded-2xl', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-brand-lighter rounded-xl">{icon}</div>
        {trend && (
          <span className={cn(
            'text-sm font-medium',
            trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
          )}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
