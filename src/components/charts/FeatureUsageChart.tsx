'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { OrgDayTotals } from '@/lib/types';

interface FeatureUsageChartProps {
  data: OrgDayTotals[];
}

const COLORS = [
  'hsl(220, 70%, 50%)',
  'hsl(160, 60%, 45%)',
  'hsl(30, 80%, 55%)',
  'hsl(280, 65%, 60%)',
  'hsl(340, 75%, 55%)',
  'hsl(190, 70%, 50%)',
  'hsl(50, 80%, 50%)',
];

function prettifyFeature(name: string) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function FeatureUsageChart({ data }: FeatureUsageChartProps) {
  if (!data.length) return <p className="text-sm text-[hsl(var(--muted-foreground))]">No data</p>;

  const featureMap = new Map<string, number>();
  for (const day of data) {
    for (const f of day.totals_by_feature ?? []) {
      featureMap.set(f.feature, (featureMap.get(f.feature) ?? 0) + f.code_generation_activity_count);
    }
  }

  const chartData = Array.from(featureMap.entries())
    .map(([name, value]) => ({ name: prettifyFeature(name), value }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  if (!chartData.length) return <p className="text-sm text-[hsl(var(--muted-foreground))]">No data</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          dataKey="value"
          paddingAngle={2}
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(224, 71%, 4%)',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
            color: 'hsl(var(--foreground))',
          }}
        />
        <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
