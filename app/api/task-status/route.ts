import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data, error } = await supabase.from('task_statuses').select('content_block_slug,status').eq('user_id', userId);
    if (error) {
      console.error('Task status query error:', error);
      return NextResponse.json({ statuses: {} }); // Return empty instead of 500
    }
    const map: Record<string, 'incomplete'|'complete'> = {};
    (data || []).forEach(r => { map[r.content_block_slug] = r.status as 'incomplete'|'complete'; });
    return NextResponse.json({ statuses: map });
  } catch (err) {
    console.error('Task status error:', err);
    return NextResponse.json({ statuses: {} }); // Graceful degradation
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const slug = String(body?.slug || '');
  const status = body?.status === 'complete' ? 'complete' : 'incomplete';
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabase.from('task_statuses').upsert({ user_id: userId, content_block_slug: slug, status });
  if (error) return NextResponse.json({ error: 'save' }, { status: 500 });
  return NextResponse.json({ ok: true });
}


