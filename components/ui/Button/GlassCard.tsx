import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'medium' | 'dark';
  hover?: boolean;
}

export default function GlassCard({ 
  children, 
  className, 
  variant = 'light',
  hover = false 
}: GlassCardProps) {
  const variantStyles = {
    light: 'bg-glass-light backdrop-blur-md',
    medium: 'bg-glass-medium backdrop-blur-lg',
    dark: 'bg-glass-dark backdrop-blur-xl',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/20 shadow-lg',
        variantStyles[variant],
        hover && 'hover:shadow-xl hover:scale-[1.02] transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  );
}
