import { NextResponse } from 'next/server';
import { getUserMetrics } from '@/lib/github';

export async function GET() {
  try {
    const result = await getUserMetrics();
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user metrics';
    const status = message.includes('GITHUB_TOKEN') ? 401 : 
                   message.includes('403') ? 403 :
                   message.includes('404') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
