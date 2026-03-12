'use client';

import { useUserMetrics, useMembers } from '@/hooks/useUserMetrics';
import UserMetricsTable from '@/components/tables/UserMetricsTable';
import { formatNumber, formatPercent } from '@/lib/utils';
import { Activity, Users, TrendingUp, Crown } from 'lucide-react';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import type { UserDayMetrics } from '@/lib/types';
import { useMemo } from 'react';

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

function computeSummary(users: UserDayMetrics[]) {
  const byUser = new Map<string, UserDayMetrics[]>();
  for (const row of users) {
    const existing = byUser.get(row.user_login);
    if (existing) existing.push(row);
    else byUser.set(row.user_login, [row]);
  }

  const totalUsers = byUser.size;
  const activeUsers = [...byUser.values()].filter(days => days.length > 0).length;

  let totalGen = 0;
  let totalAcc = 0;
  let topUser = '';
  let topUserGen = 0;

  for (const [login, days] of byUser) {
    let userGen = 0;
    for (const d of days) {
      totalGen += d.code_generation_activity_count;
      totalAcc += d.code_acceptance_activity_count;
      userGen += d.code_generation_activity_count;
    }
    if (userGen > topUserGen) {
      topUserGen = userGen;
      topUser = login;
    }
  }

  const avgRate = totalGen > 0 ? totalAcc / totalGen : 0;

  return { totalUsers, activeUsers, avgRate, topUser };
}

export default function UsersPage() {
  const { data: metricsData, error: metricsError, isLoading: metricsLoading } = useUserMetrics();
  const { data: membersData, error: membersError, isLoading: membersLoading } = useMembers();

  const isLoading = metricsLoading || membersLoading;
  const error = metricsError || membersError;

  const summary = useMemo(
    () => computeSummary(metricsData?.data ?? []),
    [metricsData]
  );

  if (isLoading) return <TableSkeleton />;
  if (error) return <ErrorState message={error.message} />;

  if ((metricsData?.data ?? []).length === 0) {
    return <EmptyState message="No user metrics data available for this period." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">User Metrics</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {metricsData?.startDay} — {metricsData?.endDay}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Users" value={formatNumber(summary.totalUsers)} icon={Users} />
        <KpiCard label="Active Users" value={formatNumber(summary.activeUsers)} icon={Activity} />
        <KpiCard label="Avg Acceptance Rate" value={formatPercent(summary.avgRate)} icon={TrendingUp} />
        <KpiCard label="Top User" value={summary.topUser || '—'} icon={Crown} />
      </div>

      <UserMetricsTable
        users={metricsData?.data ?? []}
        members={membersData ?? []}
      />
    </div>
  );
}
