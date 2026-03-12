'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface Entry {
  label: string;
  value: number;
}

interface Props {
  title: string;
  data: Entry[];
}

const COLORS = [
  'hsl(220 70% 50%)',
  'hsl(160 60% 45%)',
  'hsl(30 80% 55%)',
  'hsl(280 65% 60%)',
  'hsl(340 75% 55%)',
  'hsl(190 70% 50%)',
  'hsl(50 80% 50%)',
  'hsl(0 65% 50%)',
];

export default function BreakdownPieChart({ title, data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
        No data
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(224 71% 4%)',
              border: '1px solid hsl(216 34% 17%)',
              borderRadius: 8,
              color: 'hsl(213 31% 91%)',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: 'hsl(215.4 16.3% 56.9%)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
