import { NextResponse } from 'next/server';
import { getOrgMembers } from '@/lib/github';

export async function GET() {
  try {
    const result = await getOrgMembers();
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch org members';
    const status = message.includes('GITHUB_TOKEN') ? 401 : 
                   message.includes('403') ? 403 :
                   message.includes('404') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
