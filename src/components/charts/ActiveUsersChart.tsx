'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { OrgDayTotals } from '@/lib/types';

interface ActiveUsersChartProps {
  data: OrgDayTotals[];
}

function fmtDay(day: string) {
  const d = new Date(day + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function ActiveUsersChart({ data }: ActiveUsersChartProps) {
  if (!data.length) return <p className="text-sm text-[hsl(var(--muted-foreground))]">No data</p>;

  const chartData = data.map((d) => ({
    day: fmtDay(d.day),
    DAU: d.daily_active_users,
    WAU: d.weekly_active_users,
    MAU: d.monthly_active_users,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
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
        <Line type="monotone" dataKey="DAU" stroke="hsl(220, 70%, 50%)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="WAU" stroke="hsl(160, 60%, 45%)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="MAU" stroke="hsl(280, 65%, 60%)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
