'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { OrgDayTotals } from '@/lib/types';

interface LocChartProps {
  data: OrgDayTotals[];
}

function fmtDay(day: string) {
  const d = new Date(day + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function LocChart({ data }: LocChartProps) {
  if (!data.length) return <p className="text-sm text-[hsl(var(--muted-foreground))]">No data</p>;

  const chartData = data.map((d) => ({
    day: fmtDay(d.day),
    Suggested: d.loc_suggested_to_add_sum,
    Added: d.loc_added_sum,
    Deleted: -(d.loc_deleted_sum || 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
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
        <Area
          type="monotone"
          dataKey="Suggested"
          stroke="hsl(220, 70%, 50%)"
          fill="hsl(220, 70%, 50%)"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="Added"
          stroke="hsl(160, 60%, 45%)"
          fill="hsl(160, 60%, 45%)"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="Deleted"
          stroke="hsl(340, 75%, 55%)"
          fill="hsl(340, 75%, 55%)"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
