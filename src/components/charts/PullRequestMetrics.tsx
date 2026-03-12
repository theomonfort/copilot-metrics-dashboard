'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { OrgDayTotals } from '@/lib/types';

interface PullRequestMetricsProps {
  data: OrgDayTotals[];
}

function fmtDay(day: string) {
  const d = new Date(day + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function PullRequestMetrics({ data }: PullRequestMetricsProps) {
  if (!data.length) return <p className="text-sm text-[hsl(var(--muted-foreground))]">No data</p>;

  const chartData = data.map((d) => ({
    day: fmtDay(d.day),
    Created: d.pull_requests?.total_created ?? 0,
    Merged: d.pull_requests?.total_merged ?? 0,
    'Copilot Created': d.pull_requests?.total_created_by_copilot ?? 0,
    'Median Min to Merge': d.pull_requests?.median_minutes_to_merge ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
        <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(224, 71%, 4%)',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
            color: 'hsl(var(--foreground))',
          }}
        />
        <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
        <Bar yAxisId="left" dataKey="Created" fill="hsl(220, 70%, 50%)" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="left" dataKey="Merged" fill="hsl(160, 60%, 45%)" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="left" dataKey="Copilot Created" fill="hsl(280, 65%, 60%)" radius={[4, 4, 0, 0]} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="Median Min to Merge"
          stroke="hsl(30, 80%, 55%)"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
