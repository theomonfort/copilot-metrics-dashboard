'use client';

import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <div
      className={cn(
        'bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6',
        className,
      )}
    >
      <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-4">{title}</h3>
      {children}
    </div>
  );
}
