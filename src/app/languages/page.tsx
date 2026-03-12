'use client';

import { useOrgMetrics } from '@/hooks/useOrgMetrics';
import { cn, formatNumber } from '@/lib/utils';
import LanguageDistribution from '@/components/charts/LanguageDistribution';
import LanguagePerDayChart from '@/components/charts/LanguagePerDayChart';
import ModelUsageChart from '@/components/charts/ModelUsageChart';
import LanguageFeatureMatrix from '@/components/charts/LanguageFeatureMatrix';
import IdePerDayChart from '@/components/charts/IdePerDayChart';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import type { OrgDayTotals } from '@/lib/types';

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6', className)}>
      <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
      <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

function computeStats(dayTotals: OrgDayTotals[]) {
  const langTotals = new Map<string, number>();
  const ideSet = new Set<string>();
  const ideTotals = new Map<string, number>();

  for (const day of dayTotals) {
    for (const entry of day.totals_by_language_feature ?? []) {
      langTotals.set(entry.language, (langTotals.get(entry.language) ?? 0) + entry.loc_added_sum);
    }
    for (const entry of day.totals_by_ide ?? []) {
      ideSet.add(entry.ide);
      ideTotals.set(entry.ide, (ideTotals.get(entry.ide) ?? 0) + entry.code_generation_activity_count);
    }
  }

  const topLang = [...langTotals.entries()].sort((a, b) => b[1] - a[1])[0];
  const topIde = [...ideTotals.entries()].sort((a, b) => b[1] - a[1])[0];
  const totalLoc = [...langTotals.values()].reduce((a, b) => a + b, 0);

  return {
    topLanguage: topLang?.[0] ?? '–',
    totalLanguages: langTotals.size,
    topIde: topIde?.[0] ?? '–',
    totalIdes: ideSet.size,
    totalLoc,
  };
}

export default function LanguagesPage() {
  const { data, error, isLoading } = useOrgMetrics();

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error.message} />;

  const dayTotals: OrgDayTotals[] = data?.data?.[0]?.day_totals ?? [];

  if (dayTotals.length === 0) return <EmptyState message="No language or IDE data available for this period." />;
  const stats = computeStats(dayTotals);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Languages &amp; IDE</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {data?.startDay} — {data?.endDay}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Top Language" value={stats.topLanguage} />
        <StatCard label="Total Languages" value={String(stats.totalLanguages)} />
        <StatCard label="Top IDE" value={stats.topIde} />
        <StatCard label="Total IDEs" value={String(stats.totalIdes)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Language Distribution (LOC Added)">
          <LanguageDistribution data={dayTotals} />
        </ChartCard>

        <ChartCard title="IDE Usage Over Time">
          <IdePerDayChart data={dayTotals} />
        </ChartCard>

        <ChartCard title="Language Usage Over Time" className="lg:col-span-2">
          <LanguagePerDayChart data={dayTotals} />
        </ChartCard>

        <ChartCard title="Model Usage">
          <ModelUsageChart data={dayTotals} />
        </ChartCard>

        <ChartCard title="Language × Feature Matrix">
          <LanguageFeatureMatrix data={dayTotals} />
        </ChartCard>
      </div>
    </div>
  );
}
