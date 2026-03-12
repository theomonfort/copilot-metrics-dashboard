'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import type { OrgDayTotals } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { LANGUAGE_COLORS, capitalize } from './shared';

interface Props {
  data: OrgDayTotals[];
}

export default function LanguageDistribution({ data }: Props) {
  const langMap = new Map<string, number>();
  for (const day of data) {
    for (const entry of day.totals_by_language_feature ?? []) {
      langMap.set(entry.language, (langMap.get(entry.language) ?? 0) + entry.loc_added_sum);
    }
  }

  const sorted = [...langMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([language, loc]) => ({ language, loc }));

  if (sorted.length === 0) {
    return <p className="text-sm text-[hsl(var(--muted-foreground))]">No language data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, sorted.length * 32)}>
      <BarChart data={sorted} layout="vertical" margin={{ left: 10, right: 20, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="hsl(216, 34%, 17%)" />
        <XAxis
          type="number"
          tickFormatter={formatNumber}
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="language"
          tickFormatter={capitalize}
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          width={100}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [formatNumber(Number(value)), 'LOC Added']}
          labelFormatter={(label) => String(label).replace(/\b\w/g, (c) => c.toUpperCase())}
          contentStyle={{
            backgroundColor: '#111827',
            border: '1px solid #374151',
            borderRadius: 8,
            fontSize: 12,
          }}
          itemStyle={{ color: '#e5e7eb' }}
          labelStyle={{ color: '#e5e7eb', fontWeight: 600, marginBottom: 2 }}
        />
        <Bar dataKey="loc" radius={[0, 4, 4, 0]}>
          {sorted.map((entry) => (
            <Cell
              key={entry.language}
              fill={LANGUAGE_COLORS[entry.language.toLowerCase()] ?? LANGUAGE_COLORS.unknown}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
