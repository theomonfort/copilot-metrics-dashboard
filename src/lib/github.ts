import type {
  MetricsReportResponse,
  MetricsReportDayResponse,
  OrgMetricsReport,
  UserDayMetrics,
  GitHubMember,
} from './types';
import { fetchAndParseNDJSON } from './ndjson';

const GITHUB_API_BASE = 'https://api.github.com';
const API_VERSION = '2022-11-28';

function getDefaultOrg(): string {
  return process.env.GITHUB_ORG || 'octodemo';
}

function getHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      'GITHUB_TOKEN environment variable is required. ' +
        'Create a PAT with copilot, read:org, and read:enterprise scopes.'
    );
  }
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': API_VERSION,
  };
}

/**
 * Core fetch helper for GitHub API calls with error handling.
 */
async function githubFetch<T>(
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${GITHUB_API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), { headers: getHeaders() });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      if (rateLimitRemaining === '0') {
        const resetAt = response.headers.get('x-ratelimit-reset');
        const resetDate = resetAt
          ? new Date(Number(resetAt) * 1000).toISOString()
          : 'unknown';
        throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate}`);
      }
      throw new Error(`GitHub API forbidden (403): ${body}`);
    }
    if (response.status === 404) {
      throw new Error(`GitHub API resource not found (404): ${path}`);
    }
    throw new Error(
      `GitHub API error ${response.status} ${response.statusText}: ${body}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Download and merge NDJSON data from all download_links in a report response.
 * The signed URLs do not require authentication headers.
 */
async function fetchMetricsReport<T>(downloadLinks: string[]): Promise<T[]> {
  const results = await Promise.all(
    downloadLinks.map(url => fetchAndParseNDJSON<T>(url))
  );
  return results.flat();
}

// =============================================================================
// Public API Functions
// =============================================================================

/**
 * Get org-level Copilot metrics for the latest 28-day window.
 * Calls `GET /orgs/{org}/copilot/metrics/reports/organization-28-day/latest`
 * and downloads the NDJSON payloads from the returned download links.
 *
 * @param org - GitHub organization slug (defaults to GITHUB_ORG env var or 'octodemo')
 */
export async function getOrgMetrics(
  org?: string
): Promise<{ data: OrgMetricsReport[]; startDay: string; endDay: string }> {
  const orgName = org || getDefaultOrg();
  const report = await githubFetch<MetricsReportResponse>(
    `/orgs/${orgName}/copilot/metrics/reports/organization-28-day/latest`
  );
  const data = await fetchMetricsReport<OrgMetricsReport>(report.download_links);
  return {
    data,
    startDay: report.report_start_day,
    endDay: report.report_end_day,
  };
}

/**
 * Get org-level Copilot metrics for a specific day.
 * Calls `GET /orgs/{org}/copilot/metrics/reports/organization-1-day?day={day}`
 *
 * @param day  - ISO date string (e.g. "2025-01-15")
 * @param org  - GitHub organization slug
 */
export async function getOrgMetricsForDay(
  day: string,
  org?: string
): Promise<{ data: OrgMetricsReport[]; day: string }> {
  const orgName = org || getDefaultOrg();
  const report = await githubFetch<MetricsReportDayResponse>(
    `/orgs/${orgName}/copilot/metrics/reports/organization-1-day`,
    { day }
  );
  const data = await fetchMetricsReport<OrgMetricsReport>(report.download_links);
  return { data, day: report.report_day };
}

/**
 * Get user-level Copilot metrics for the latest 28-day window.
 * Calls `GET /orgs/{org}/copilot/metrics/reports/users-28-day/latest`
 * and downloads the NDJSON payloads from the returned download links.
 *
 * @param org - GitHub organization slug
 */
export async function getUserMetrics(
  org?: string
): Promise<{ data: UserDayMetrics[]; startDay: string; endDay: string }> {
  const orgName = org || getDefaultOrg();
  const report = await githubFetch<MetricsReportResponse>(
    `/orgs/${orgName}/copilot/metrics/reports/users-28-day/latest`
  );
  const data = await fetchMetricsReport<UserDayMetrics>(report.download_links);
  return {
    data,
    startDay: report.report_start_day,
    endDay: report.report_end_day,
  };
}

/**
 * Get user-level Copilot metrics for a specific day.
 * Calls `GET /orgs/{org}/copilot/metrics/reports/users-1-day?day={day}`
 *
 * @param day  - ISO date string (e.g. "2025-01-15")
 * @param org  - GitHub organization slug
 */
export async function getUserMetricsForDay(
  day: string,
  org?: string
): Promise<{ data: UserDayMetrics[]; day: string }> {
  const orgName = org || getDefaultOrg();
  const report = await githubFetch<MetricsReportDayResponse>(
    `/orgs/${orgName}/copilot/metrics/reports/users-1-day`,
    { day }
  );
  const data = await fetchMetricsReport<UserDayMetrics>(report.download_links);
  return { data, day: report.report_day };
}

/**
 * Get all members of a GitHub organization, handling pagination automatically.
 * Calls `GET /orgs/{org}/members?per_page=100` and follows Link header pagination.
 *
 * @param org - GitHub organization slug
 */
export async function getOrgMembers(org?: string): Promise<GitHubMember[]> {
  const orgName = org || getDefaultOrg();
  const members: GitHubMember[] = [];
  let url: string | null =
    `${GITHUB_API_BASE}/orgs/${orgName}/members?per_page=100`;

  while (url) {
    const response = await fetch(url, { headers: getHeaders() });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(
        `GitHub API error ${response.status} fetching members: ${body}`
      );
    }

    const page = (await response.json()) as GitHubMember[];
    members.push(...page);

    // Parse Link header for next page
    const linkHeader = response.headers.get('link');
    url = parseLinkHeaderNext(linkHeader);
  }

  return members;
}

/**
 * Extract the "next" URL from a GitHub Link header.
 * Returns null if there is no next page.
 */
function parseLinkHeaderNext(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
  return match ? match[1] : null;
}
