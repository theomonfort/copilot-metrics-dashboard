'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { OrgDayTotals } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { LANGUAGE_COLORS, capitalize } from './shared';

interface Props {
  data: OrgDayTotals[];
}

export default function LanguagePerDayChart({ data }: Props) {
  // Aggregate total LOC per language to find top N
  const langTotals = new Map<string, number>();
  for (const day of data) {
    for (const entry of day.totals_by_language_feature ?? []) {
      langTotals.set(entry.language, (langTotals.get(entry.language) ?? 0) + entry.loc_added_sum);
    }
  }

  const topLangs = [...langTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([lang]) => lang);

  if (topLangs.length === 0) {
    return <p className="text-sm text-[hsl(var(--muted-foreground))]">No language data available</p>;
  }

  // Build daily series: { day, typescript: 120, python: 80, ... }
  const chartData = data.map((day) => {
    const point: Record<string, string | number> = { day: day.day };
    const dayLangs = new Map<string, number>();
    for (const entry of day.totals_by_language_feature ?? []) {
      dayLangs.set(entry.language, (dayLangs.get(entry.language) ?? 0) + entry.loc_added_sum);
    }
    for (const lang of topLangs) {
      point[lang] = dayLangs.get(lang) ?? 0;
    }
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ left: 0, right: 10, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(216, 34%, 17%)" />
        <XAxis
          dataKey="day"
          tickFormatter={(d: string) => d.slice(5)} // MM-DD
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
          formatter={(value: unknown, name: unknown) => [formatNumber(Number(value)), capitalize(String(name))]}
          labelFormatter={(label) => `Date: ${String(label)}`}
        />
        {topLangs.map((lang) => (
          <Area
            key={lang}
            type="monotone"
            dataKey={lang}
            stackId="1"
            stroke={LANGUAGE_COLORS[lang.toLowerCase()] ?? '#8b8b8b'}
            fill={LANGUAGE_COLORS[lang.toLowerCase()] ?? '#8b8b8b'}
            fillOpacity={0.6}
            name={lang}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
