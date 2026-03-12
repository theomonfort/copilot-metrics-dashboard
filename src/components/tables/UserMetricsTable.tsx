'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber, formatPercent } from '@/lib/utils';
import type { UserDayMetrics, GitHubMember } from '@/lib/types';

interface UserRow {
  user_login: string;
  user_id: number;
  avatar_url?: string;
  generations: number;
  acceptances: number;
  rate: number;
  loc_added: number;
  loc_suggested: number;
  active_days: number;
  used_agent: boolean;
  used_chat: boolean;
  used_cli: boolean;
  last_active: string;
}

type SortKey = keyof Pick<
  UserRow,
  'user_login' | 'generations' | 'acceptances' | 'rate' | 'loc_added' | 'active_days' | 'last_active'
>;

interface Props {
  users: UserDayMetrics[];
  members: GitHubMember[];
}

function aggregateUsers(users: UserDayMetrics[], members: GitHubMember[]): UserRow[] {
  const memberMap = new Map(members.map(m => [m.login, m]));
  const grouped = new Map<string, UserDayMetrics[]>();

  for (const row of users) {
    const existing = grouped.get(row.user_login);
    if (existing) existing.push(row);
    else grouped.set(row.user_login, [row]);
  }

  const rows: UserRow[] = [];
  for (const [login, days] of grouped) {
    const member = memberMap.get(login);
    let generations = 0;
    let acceptances = 0;
    let locAdded = 0;
    let locSuggested = 0;
    let usedAgent = false;
    let usedChat = false;
    let usedCli = false;
    let lastActive = '';

    for (const d of days) {
      generations += d.code_generation_activity_count;
      acceptances += d.code_acceptance_activity_count;
      locAdded += d.loc_added_sum;
      locSuggested += d.loc_suggested_to_add_sum;
      if (d.used_agent) usedAgent = true;
      if (d.used_chat) usedChat = true;
      if (d.used_cli) usedCli = true;
      if (d.day > lastActive) lastActive = d.day;
    }

    rows.push({
      user_login: login,
      user_id: days[0].user_id,
      avatar_url: member?.avatar_url,
      generations,
      acceptances,
      rate: generations > 0 ? acceptances / generations : 0,
      loc_added: locAdded,
      loc_suggested: locSuggested,
      active_days: days.length,
      used_agent: usedAgent,
      used_chat: usedChat,
      used_cli: usedCli,
      last_active: lastActive,
    });
  }

  return rows;
}

function FeatureBadge({ active, label }: { active: boolean; label: string }) {
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

const COLUMNS: { key: SortKey; label: string; align?: 'right' }[] = [
  { key: 'user_login', label: 'User' },
  { key: 'generations', label: 'Generations', align: 'right' },
  { key: 'acceptances', label: 'Acceptances', align: 'right' },
  { key: 'rate', label: 'Rate', align: 'right' },
  { key: 'loc_added', label: 'LOC Added', align: 'right' },
  { key: 'active_days', label: 'Active Days', align: 'right' },
];

export default function UserMetricsTable({ users, members }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('generations');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterAgent, setFilterAgent] = useState(false);
  const [filterChat, setFilterChat] = useState(false);
  const [filterCli, setFilterCli] = useState(false);

  const allRows = useMemo(() => aggregateUsers(users, members), [users, members]);

  const filtered = useMemo(() => {
    let rows = allRows;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r => r.user_login.toLowerCase().includes(q));
    }
    if (filterAgent) rows = rows.filter(r => r.used_agent);
    if (filterChat) rows = rows.filter(r => r.used_chat);
    if (filterCli) rows = rows.filter(r => r.used_cli);
    return rows;
  }, [allRows, search, filterAgent, filterChat, filterCli]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const na = av as number;
      const nb = bv as number;
      return sortDir === 'asc' ? na - nb : nb - na;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="ml-1 inline h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3" />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-9 pr-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
          />
        </div>
        <label className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] cursor-pointer">
          <input type="checkbox" checked={filterAgent} onChange={e => setFilterAgent(e.target.checked)} className="accent-emerald-500" />
          Agent users
        </label>
        <label className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] cursor-pointer">
          <input type="checkbox" checked={filterChat} onChange={e => setFilterChat(e.target.checked)} className="accent-emerald-500" />
          Chat users
        </label>
        <label className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] cursor-pointer">
          <input type="checkbox" checked={filterCli} onChange={e => setFilterCli(e.target.checked)} className="accent-emerald-500" />
          CLI users
        </label>
        <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">
          {filtered.length} user{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg border border-[hsl(var(--border))]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-[hsl(var(--accent))]">
            <tr>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'cursor-pointer select-none whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]',
                    col.align === 'right' ? 'text-right' : 'text-left'
                  )}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  <SortIcon col={col.key} />
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Features
              </th>
              <th
                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]"
                onClick={() => handleSort('last_active')}
              >
                Last Active
                <SortIcon col="last_active" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))]">
                  No users found
                </td>
              </tr>
            ) : (
              sorted.map(row => (
                <tr
                  key={row.user_login}
                  className="cursor-pointer transition-colors hover:bg-[hsl(var(--accent))]"
                  onClick={() => router.push(`/users/${row.user_login}`)}
                >
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {row.avatar_url ? (
                        <img src={row.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-xs font-medium text-[hsl(var(--muted-foreground))]">
                          {row.user_login[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-white">{row.user_login}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatNumber(row.generations)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatNumber(row.acceptances)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatPercent(row.rate)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatNumber(row.loc_added)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{row.active_days}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex gap-1.5">
                      <FeatureBadge active={row.used_agent} label="Agent" />
                      <FeatureBadge active={row.used_chat} label="Chat" />
                      <FeatureBadge active={row.used_cli} label="CLI" />
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-[hsl(var(--muted-foreground))]">{row.last_active}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
