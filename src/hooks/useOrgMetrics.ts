'use client';

import useSWR from 'swr';

const fetcher = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  });

export function useOrgMetrics() {
  const { data, error, isLoading } = useSWR('/api/metrics/org', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 min cache
  });
  return { data, error, isLoading };
}
