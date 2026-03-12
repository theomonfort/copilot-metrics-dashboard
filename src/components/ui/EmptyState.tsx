'use client';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EmptyState({ message, className }: { message?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-[hsl(var(--muted-foreground))]", className)}>
      <BarChart3 className="w-10 h-10 mb-3 opacity-50" />
      <p className="text-sm">{message || 'No data available'}</p>
    </div>
  );
}
