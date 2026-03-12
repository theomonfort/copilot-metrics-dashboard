'use client';

import { cn } from '@/lib/utils';
import { formatNumber, formatPercent } from '@/lib/utils';

interface UserCardProps {
  login: string;
  avatarUrl?: string;
  generations: number;
  acceptances: number;
  locAdded: number;
  activeDays: number;
  usedAgent: boolean;
  usedChat: boolean;
  usedCli: boolean;
}

function Badge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        active
          ? 'bg-emerald-500/15 text-emerald-400'
          : 'bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]'
      )}
    >
      {active ? '✓' : '–'} {label}
    </span>
  );
}

export default function UserCard({
  login,
  avatarUrl,
  generations,
  acceptances,
  locAdded,
  activeDays,
  usedAgent,
  usedChat,
  usedCli,
}: UserCardProps) {
  const rate = generations > 0 ? acceptances / generations : 0;

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <div className="flex items-center gap-3 mb-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-12 w-12 rounded-full" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-lg font-medium text-[hsl(var(--muted-foreground))]">
            {login[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-white">{login}</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{activeDays} active day{activeDays !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Generations</p>
          <p className="text-xl font-bold text-white tabular-nums">{formatNumber(generations)}</p>
        </div>
        <div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Acceptances</p>
          <p className="text-xl font-bold text-white tabular-nums">{formatNumber(acceptances)}</p>
        </div>
        <div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Acceptance Rate</p>
          <p className="text-xl font-bold text-white tabular-nums">{formatPercent(rate)}</p>
        </div>
        <div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">LOC Added</p>
          <p className="text-xl font-bold text-white tabular-nums">{formatNumber(locAdded)}</p>
        </div>
      </div>

      <div className="flex gap-1.5">
        <Badge active={usedAgent} label="Agent" />
        <Badge active={usedChat} label="Chat" />
        <Badge active={usedCli} label="CLI" />
      </div>
    </div>
  );
}
