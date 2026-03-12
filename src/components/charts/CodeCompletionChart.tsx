'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { OrgDayTotals } from '@/lib/types';

interface CodeCompletionChartProps {
  data: OrgDayTotals[];
}

function fmtDay(day: string) {
  const d = new Date(day + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function CodeCompletionChart({ data }: CodeCompletionChartProps) {
  if (!data.length) return <p className="text-sm text-[hsl(var(--muted-foreground))]">No data</p>;

  const chartData = data.map((d) => ({
    day: fmtDay(d.day),
    Suggested: d.code_generation_activity_count,
    Accepted: d.code_acceptance_activity_count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(224, 71%, 4%)',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
            color: 'hsl(var(--foreground))',
          }}
        />
        <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
        <Bar dataKey="Suggested" fill="hsl(220, 70%, 50%)" fillOpacity={0.5} radius={[4, 4, 0, 0]} />
        <Bar dataKey="Accepted" fill="hsl(220, 70%, 50%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
