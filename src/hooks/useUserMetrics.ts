'use client';

import useSWR from 'swr';

const fetcher = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  });

export function useUserMetrics() {
  const { data, error, isLoading } = useSWR('/api/metrics/users', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 min cache
  });
  return { data, error, isLoading };
}

export function useMembers() {
  const { data, error, isLoading } = useSWR('/api/members', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600000, // 10 min cache
  });
  return { data, error, isLoading };
}
