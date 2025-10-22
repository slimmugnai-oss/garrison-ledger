/**
 * LES AUDIT DELETE API
 * 
 * POST /api/les/audit/[id]/delete
 * Soft deletes an audit (sets deleted_at timestamp)
 * 
 * Security: User can only delete their own audits
 */

import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  // Verify ownership before deleting
  const { data: upload } = await supabase
    .from('les_uploads')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!upload || upload.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Soft delete (set timestamp)
  const { error } = await supabase
    .from('les_uploads')
    .update({ 
      deleted_at: new Date().toISOString(),
      audit_status: 'archived'
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('[DELETE AUDIT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete audit' },
      { status: 500 }
    );
  }

  // Emit analytics event
  await supabase.from('analytics_events').insert({
    user_id: user.id,
    event_name: 'les_audit_deleted',
    properties: {
      audit_id: id,
      deleted_at: new Date().toISOString()
    }
  });

  return NextResponse.json({ 
    success: true,
    message: 'Audit deleted successfully'
  });
}

