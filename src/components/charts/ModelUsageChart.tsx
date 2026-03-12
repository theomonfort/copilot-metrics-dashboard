'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import type { OrgDayTotals } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { STACK_PALETTE } from './shared';

interface Props {
  data: OrgDayTotals[];
}

export default function ModelUsageChart({ data }: Props) {
  const modelMap = new Map<string, number>();
  for (const day of data) {
    for (const entry of day.totals_by_model_feature ?? []) {
      const count =
        (entry as Record<string, unknown>).user_initiated_interaction_count as number ??
        (entry as Record<string, unknown>).code_generation_activity_count as number ??
        0;
      modelMap.set(entry.model, (modelMap.get(entry.model) ?? 0) + count);
    }
  }

  const sorted = [...modelMap.entries()]
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([model, count]) => ({ model, count }));

  if (sorted.length === 0) {
    return <p className="text-sm text-[hsl(var(--muted-foreground))]">No model data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sorted} margin={{ left: 0, right: 20, top: 4, bottom: 4 }}>
        <CartesianGrid vertical={false} stroke="hsl(216, 34%, 17%)" />
        <XAxis
          dataKey="model"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tickFormatter={formatNumber}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [formatNumber(Number(value)), 'Interactions']}
          contentStyle={{
            backgroundColor: '#111827',
            border: '1px solid #374151',
            borderRadius: 8,
            fontSize: 12,
          }}
          itemStyle={{ color: '#e5e7eb' }}
          labelStyle={{ color: '#e5e7eb', fontWeight: 600, marginBottom: 2 }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {sorted.map((_, i) => (
            <Cell key={i} fill={STACK_PALETTE[i % STACK_PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
