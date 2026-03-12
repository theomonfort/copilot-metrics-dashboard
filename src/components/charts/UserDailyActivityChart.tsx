'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { UserDayMetrics } from '@/lib/types';

interface Props {
  days: UserDayMetrics[];
}

export default function UserDailyActivityChart({ days }: Props) {
  const data = [...days]
    .sort((a, b) => a.day.localeCompare(b.day))
    .map(d => ({
      day: d.day,
      Generations: d.code_generation_activity_count,
      Acceptances: d.code_acceptance_activity_count,
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
        No activity data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(216 34% 17%)" />
        <XAxis
          dataKey="day"
          tick={{ fill: 'hsl(215.4 16.3% 56.9%)', fontSize: 12 }}
          tickFormatter={v => v.slice(5)}
          stroke="hsl(216 34% 17%)"
        />
        <YAxis
          tick={{ fill: 'hsl(215.4 16.3% 56.9%)', fontSize: 12 }}
          stroke="hsl(216 34% 17%)"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(224 71% 4%)',
            border: '1px solid hsl(216 34% 17%)',
            borderRadius: 8,
            color: 'hsl(213 31% 91%)',
          }}
        />
        <Legend
          wrapperStyle={{ color: 'hsl(215.4 16.3% 56.9%)' }}
        />
        <Line
          type="monotone"
          dataKey="Generations"
          stroke="hsl(220 70% 50%)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="Acceptances"
          stroke="hsl(160 60% 45%)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
