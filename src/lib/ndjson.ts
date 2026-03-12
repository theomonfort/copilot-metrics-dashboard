/**
 * Parse NDJSON (newline-delimited JSON) content into an array of objects.
 * Each line in the content is a separate JSON object.
 */
export function parseNDJSON<T>(content: string): T[] {
  return content
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => JSON.parse(line) as T);
}

/**
 * Download and parse NDJSON from a URL.
 * The Copilot metrics API returns download_links pointing to NDJSON files.
 */
export async function fetchAndParseNDJSON<T>(url: string): Promise<T[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download NDJSON: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  // The content might be a JSON array OR NDJSON
  // Try JSON array first, then fall back to NDJSON
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed as T[];
    return [parsed as T];
  } catch {
    return parseNDJSON<T>(text);
  }
}
