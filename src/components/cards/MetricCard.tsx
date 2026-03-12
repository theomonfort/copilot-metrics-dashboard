'use client';

import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, trendValue }: MetricCardProps) {
  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
          {title}
        </span>
        <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
      </div>
      <div className="text-2xl font-bold text-[hsl(var(--foreground))]">{value}</div>
      {(subtitle || trendValue) && (
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          {trendValue && (
            <span
              className={cn(
                'font-medium mr-1',
                trend === 'up' && 'text-[hsl(160,60%,45%)]',
                trend === 'down' && 'text-[hsl(0,63%,51%)]',
              )}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </span>
          )}
          {subtitle}
        </p>
      )}
    </div>
  );
}
