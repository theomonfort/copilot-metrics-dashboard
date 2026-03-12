'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, TrendingUp, Code, Calendar } from 'lucide-react';
import { useUserMetrics, useMembers } from '@/hooks/useUserMetrics';
import { formatNumber, formatPercent } from '@/lib/utils';
import UserDailyActivityChart from '@/components/charts/UserDailyActivityChart';
import BreakdownPieChart from '@/components/charts/BreakdownPieChart';
import type { UserDayMetrics, BreakdownEntry } from '@/lib/types';

function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        <span className="text-xs text-[hsl(var(--muted-foreground))]">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function FeatureBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={
        active
          ? 'inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400'
          : 'inline-flex items-center rounded-full bg-[hsl(var(--accent))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--muted-foreground))]'
      }
    >
      {active ? '✓' : '–'} {label}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-[hsl(var(--accent))]" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-[hsl(var(--accent))]" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-[hsl(var(--accent))]" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-red-400 font-medium">Failed to load data</p>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{message}</p>
      </div>
    </div>
  );
}

function aggregateBreakdown(
  days: UserDayMetrics[],
  accessor: (d: UserDayMetrics) => { label: string; value: number }[]
): BreakdownEntry[] {
  const map = new Map<string, number>();
  for (const d of days) {
    for (const entry of accessor(d)) {
      map.set(entry.label, (map.get(entry.label) ?? 0) + entry.value);
    }
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

export default function UserDetailPage() {
  const { login } = useParams<{ login: string }>();
  const { data, isLoading, error } = useUserMetrics();
  const { data: membersData } = useMembers();

  const userDays = useMemo(
    () => (data?.data?.filter((d: UserDayMetrics) => d.user_login === login) ?? []) as UserDayMetrics[],
    [data, login]
  );

  const member = useMemo(
    () => membersData?.find((m: { login: string }) => m.login === login),
    [membersData, login]
  );

  const totals = useMemo(() => {
    let generations = 0;
    let acceptances = 0;
    let locAdded = 0;
    let locSuggested = 0;
    let interactions = 0;
    let usedAgent = false;
    let usedChat = false;
    let usedCli = false;

    for (const d of userDays) {
      generations += d.code_generation_activity_count;
      acceptances += d.code_acceptance_activity_count;
      locAdded += d.loc_added_sum;
      locSuggested += d.loc_suggested_to_add_sum;
      interactions += d.user_initiated_interaction_count;
      if (d.used_agent) usedAgent = true;
      if (d.used_chat) usedChat = true;
      if (d.used_cli) usedCli = true;
    }

    return {
      generations,
      acceptances,
      rate: generations > 0 ? acceptances / generations : 0,
      locAdded,
      locSuggested,
      interactions,
      activeDays: userDays.length,
      usedAgent,
      usedChat,
      usedCli,
    };
  }, [userDays]);

  const languageData = useMemo(
    () =>
      aggregateBreakdown(userDays, d =>
        d.totals_by_language_feature.map(lf => ({
          label: lf.language,
          value: lf.code_generation_activity_count,
        }))
      ),
    [userDays]
  );

  const ideData = useMemo(
    () =>
      aggregateBreakdown(userDays, d =>
        d.totals_by_ide.map(ide => ({
          label: ide.ide,
          value: ide.code_generation_activity_count,
        }))
      ),
    [userDays]
  );

  const featureData = useMemo(
    () =>
      aggregateBreakdown(userDays, d =>
        d.totals_by_feature.map(f => ({
          label: f.feature,
          value: f.code_generation_activity_count,
        }))
      ),
    [userDays]
  );

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error.message} />;

  if (userDays.length === 0) {
    return (
      <div className="space-y-6">
        <Link href="/users" className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Link>
        <div className="flex items-center justify-center h-64">
          <p className="text-[hsl(var(--muted-foreground))]">No data found for <strong className="text-white">{login}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/users" className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </Link>

      {/* Profile header */}
      <div className="flex items-center gap-4">
        {member?.avatar_url ? (
          <img src={member.avatar_url} alt="" className="h-16 w-16 rounded-full" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-2xl font-medium text-[hsl(var(--muted-foreground))]">
            {login[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">{login}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {totals.activeDays} active day{totals.activeDays !== 1 ? 's' : ''} · {data?.startDay} — {data?.endDay}
          </p>
          <div className="mt-1.5 flex gap-1.5">
            <FeatureBadge active={totals.usedAgent} label="Agent" />
            <FeatureBadge active={totals.usedChat} label="Chat" />
            <FeatureBadge active={totals.usedCli} label="CLI" />
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Generations" value={formatNumber(totals.generations)} icon={Activity} />
        <KpiCard label="Acceptances" value={formatNumber(totals.acceptances)} icon={TrendingUp} />
        <KpiCard label="Acceptance Rate" value={formatPercent(totals.rate)} icon={TrendingUp} />
        <KpiCard label="LOC Added" value={formatNumber(totals.locAdded)} icon={Code} />
      </div>

      {/* Daily activity chart */}
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <h2 className="mb-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
          <Calendar className="mr-1.5 inline h-4 w-4" />
          Daily Activity
        </h2>
        <UserDailyActivityChart days={userDays} />
      </div>

      {/* Breakdown charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <BreakdownPieChart title="Language Usage" data={languageData} />
        </div>
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <BreakdownPieChart title="IDE Usage" data={ideData} />
        </div>
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <BreakdownPieChart title="Feature Usage" data={featureData} />
        </div>
      </div>
    </div>
  );
}
