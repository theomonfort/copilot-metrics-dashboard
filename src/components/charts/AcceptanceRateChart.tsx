'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { OrgDayTotals } from '@/lib/types';

interface AcceptanceRateChartProps {
  data: OrgDayTotals[];
}

function fmtDay(day: string) {
  const d = new Date(day + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function AcceptanceRateChart({ data }: AcceptanceRateChartProps) {
  if (!data.length) return <p className="text-sm text-[hsl(var(--muted-foreground))]">No data</p>;

  const chartData = data.map((d) => ({
    day: fmtDay(d.day),
    rate:
      d.code_generation_activity_count > 0
        ? Math.round((d.code_acceptance_activity_count / d.code_generation_activity_count) * 100)
        : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <Tooltip
          formatter={(value) => [`${value}%`, 'Acceptance Rate']}
          contentStyle={{
            backgroundColor: 'hsl(224, 71%, 4%)',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
            color: 'hsl(var(--foreground))',
          }}
        />
        <Area
          type="monotone"
          dataKey="rate"
          stroke="hsl(160, 60%, 45%)"
          fill="hsl(160, 60%, 45%)"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
