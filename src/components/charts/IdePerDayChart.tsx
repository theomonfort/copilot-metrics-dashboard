'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { OrgDayTotals } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { STACK_PALETTE, capitalize } from './shared';

interface Props {
  data: OrgDayTotals[];
}

export default function IdePerDayChart({ data }: Props) {
  // Find top IDEs by total code generation activity
  const ideTotals = new Map<string, number>();
  for (const day of data) {
    for (const entry of day.totals_by_ide ?? []) {
      ideTotals.set(entry.ide, (ideTotals.get(entry.ide) ?? 0) + entry.code_generation_activity_count);
    }
  }

  const topIdes = [...ideTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([ide]) => ide);

  if (topIdes.length === 0) {
    return <p className="text-sm text-[hsl(var(--muted-foreground))]">No IDE data available</p>;
  }

  // Build daily series
  const chartData = data.map((day) => {
    const point: Record<string, string | number> = { day: day.day };
    const dayIdes = new Map<string, number>();
    for (const entry of day.totals_by_ide ?? []) {
      dayIdes.set(entry.ide, (dayIdes.get(entry.ide) ?? 0) + entry.code_generation_activity_count);
    }
    for (const ide of topIdes) {
      point[ide] = dayIdes.get(ide) ?? 0;
    }
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ left: 0, right: 10, top: 4, bottom: 4 }}>
        <CartesianGrid vertical={false} stroke="hsl(216, 34%, 17%)" />
        <XAxis
          dataKey="day"
          tickFormatter={(d: string) => d.slice(5)}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatNumber}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111827',
            border: '1px solid #374151',
            borderRadius: 8,
            fontSize: 12,
          }}
          itemStyle={{ color: '#e5e7eb' }}
          labelStyle={{ color: '#e5e7eb', fontWeight: 600, marginBottom: 2 }}
          formatter={(value: unknown, name: unknown) => [formatNumber(Number(value)), String(name)]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, color: '#9ca3af' }}
        />
        {topIdes.map((ide, i) => (
          <Bar
            key={ide}
            dataKey={ide}
            stackId="1"
            fill={STACK_PALETTE[i % STACK_PALETTE.length]}
            name={ide}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
