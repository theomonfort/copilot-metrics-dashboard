'use client';

import { useOrgMetrics } from '@/hooks/useOrgMetrics';
import { formatNumber, formatPercent } from '@/lib/utils';
import { MetricCard } from '@/components/cards/MetricCard';
import { ChartCard } from '@/components/cards/ChartCard';
import { ActiveUsersChart } from '@/components/charts/ActiveUsersChart';
import { CodeCompletionChart } from '@/components/charts/CodeCompletionChart';
import { AcceptanceRateChart } from '@/components/charts/AcceptanceRateChart';
import { LocChart } from '@/components/charts/LocChart';
import { FeatureUsageChart } from '@/components/charts/FeatureUsageChart';
import { IdeUsageChart } from '@/components/charts/IdeUsageChart';
import { PullRequestMetrics } from '@/components/charts/PullRequestMetrics';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import { Users, UserCheck, CheckCircle, Code, Bot, MessageSquare } from 'lucide-react';

export default function OverviewPage() {
  const { data, error, isLoading } = useOrgMetrics();

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error.message} />;

  const dayTotals = data?.data?.[0]?.day_totals ?? [];

  if (dayTotals.length === 0) return <EmptyState message="No metrics data available for this period." />;
  const latestDay = dayTotals[dayTotals.length - 1];

  const totalMAU = latestDay?.monthly_active_users ?? 0;
  const latestDAU = latestDay?.daily_active_users ?? 0;
  const totalGenerated = dayTotals.reduce(
    (sum: number, d: { code_generation_activity_count?: number }) =>
      sum + (d.code_generation_activity_count || 0),
    0,
  );
  const totalAccepted = dayTotals.reduce(
    (sum: number, d: { code_acceptance_activity_count?: number }) =>
      sum + (d.code_acceptance_activity_count || 0),
    0,
  );
  const acceptanceRate = totalGenerated > 0 ? totalAccepted / totalGenerated : 0;
  const totalLocAdded = dayTotals.reduce(
    (sum: number, d: { loc_added_sum?: number }) => sum + (d.loc_added_sum || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Theo Personalized Overview Dashboard</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {data?.startDay} — {data?.endDay}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard title="Monthly Active" value={formatNumber(totalMAU)} icon={Users} />
        <MetricCard title="Daily Active" value={latestDAU} icon={UserCheck} />
        <MetricCard title="Acceptance Rate" value={formatPercent(acceptanceRate)} icon={CheckCircle} />
        <MetricCard title="LOC Added" value={formatNumber(totalLocAdded)} icon={Code} />
        <MetricCard title="Agent Users" value={latestDay?.monthly_active_agent_users ?? 0} icon={Bot} />
        <MetricCard
          title="Chat Users"
          value={latestDay?.monthly_active_chat_users ?? 0}
          icon={MessageSquare}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Active Users">
          <ActiveUsersChart data={dayTotals} />
        </ChartCard>
        <ChartCard title="Code Completions">
          <CodeCompletionChart data={dayTotals} />
        </ChartCard>
        <ChartCard title="Acceptance Rate">
          <AcceptanceRateChart data={dayTotals} />
        </ChartCard>
        <ChartCard title="Lines of Code">
          <LocChart data={dayTotals} />
        </ChartCard>
        <ChartCard title="Feature Usage">
          <FeatureUsageChart data={dayTotals} />
        </ChartCard>
        <ChartCard title="IDE Usage">
          <IdeUsageChart data={dayTotals} />
        </ChartCard>
        <ChartCard title="Pull Requests" className="lg:col-span-2">
          <PullRequestMetrics data={dayTotals} />
        </ChartCard>
      </div>
    </div>
  );
}
