'use client';

import type { OrgDayTotals } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { LANGUAGE_COLORS, capitalize, FEATURE_LABELS } from './shared';

interface Props {
  data: OrgDayTotals[];
}

export default function LanguageFeatureMatrix({ data }: Props) {
  // Aggregate language × feature → loc_added_sum
  const matrix = new Map<string, Map<string, number>>();
  const featureSet = new Set<string>();
  const langTotals = new Map<string, number>();

  for (const day of data) {
    for (const entry of day.totals_by_language_feature ?? []) {
      featureSet.add(entry.feature);
      if (!matrix.has(entry.language)) matrix.set(entry.language, new Map());
      const langMap = matrix.get(entry.language)!;
      langMap.set(entry.feature, (langMap.get(entry.feature) ?? 0) + entry.loc_added_sum);
      langTotals.set(entry.language, (langTotals.get(entry.language) ?? 0) + entry.loc_added_sum);
    }
  }

  const topLangs = [...langTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([lang]) => lang);

  const features = [...featureSet].sort();

  if (topLangs.length === 0 || features.length === 0) {
    return <p className="text-sm text-[hsl(var(--muted-foreground))]">No language × feature data available</p>;
  }

  // Find max value for color scaling
  let maxVal = 0;
  for (const lang of topLangs) {
    const langMap = matrix.get(lang);
    if (!langMap) continue;
    for (const f of features) {
      const v = langMap.get(f) ?? 0;
      if (v > maxVal) maxVal = v;
    }
  }

  function cellColor(value: number): string {
    if (maxVal === 0 || value === 0) return 'transparent';
    const intensity = Math.min(value / maxVal, 1);
    // Blue scale from dim to bright
    const alpha = 0.15 + intensity * 0.85;
    return `rgba(49, 120, 198, ${alpha.toFixed(2)})`;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left py-2 pr-3 text-[hsl(var(--muted-foreground))] font-medium">Language</th>
            {features.map((f) => (
              <th key={f} className="px-2 py-2 text-center text-[hsl(var(--muted-foreground))] font-medium whitespace-nowrap">
                {FEATURE_LABELS[f] ?? capitalize(f)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {topLangs.map((lang) => {
            const langMap = matrix.get(lang);
            const color = LANGUAGE_COLORS[lang.toLowerCase()] ?? LANGUAGE_COLORS.unknown;
            return (
              <tr key={lang} className="border-t border-[hsl(var(--border))]">
                <td className="py-2 pr-3 font-medium flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  {capitalize(lang)}
                </td>
                {features.map((f) => {
                  const val = langMap?.get(f) ?? 0;
                  return (
                    <td
                      key={f}
                      className="px-2 py-2 text-center rounded"
                      title={`${capitalize(lang)} · ${FEATURE_LABELS[f] ?? f}: ${val.toLocaleString()} LOC`}
                    >
                      <span
                        className="inline-block rounded px-2 py-1 min-w-[48px] text-center"
                        style={{ backgroundColor: cellColor(val), color: val > 0 ? '#e5e7eb' : '#6b7280' }}
                      >
                        {val > 0 ? formatNumber(val) : '–'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
