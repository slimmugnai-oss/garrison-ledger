/**
 * LES AUDIT CLONE API
 * 
 * POST /api/les/audit/[id]/clone
 * Clones audit data to new manual entry (for re-auditing/editing)
 * 
 * Security: User can only clone their own audits
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

  // Fetch original audit with all data
  const { data: original, error } = await supabase
    .from('les_uploads')
    .select(`
      *,
      les_lines (*),
      expected_pay_snapshot (*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single();

  if (error || !original) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  // Create new manual entry (clone)
  const { data: newUpload, error: uploadError } = await supabase
    .from('les_uploads')
    .insert({
      user_id: user.id,
      entry_type: 'manual',
      month: original.month,
      year: original.year,
      audit_status: 'draft',
      profile_snapshot: original.profile_snapshot || {},
      original_filename: `Re-audit of ${original.month}/${original.year}`,
      size_bytes: 0,
      storage_path: '',
      parsed_ok: false
    })
    .select()
    .single();

  if (uploadError || !newUpload) {
    console.error('[CLONE AUDIT] Error creating new upload:', uploadError);
    return NextResponse.json(
      { error: 'Failed to clone audit' },
      { status: 500 }
    );
  }

  // Clone line items
  if (original.les_lines && original.les_lines.length > 0) {
    const clonedLines = original.les_lines.map((line: any) => ({
      upload_id: newUpload.id,
      line_code: line.line_code,
      description: line.description,
      amount_cents: line.amount_cents,
      section: line.section,
      taxability: line.taxability || { fed: false, state: false, oasdi: false, medicare: false },
      raw: line.raw
    }));

    await supabase.from('les_lines').insert(clonedLines);
  }

  // Clone expected snapshot (optional)
  if (original.expected_pay_snapshot && original.expected_pay_snapshot.length > 0) {
    const snapshot = original.expected_pay_snapshot[0];
    await supabase.from('expected_pay_snapshot').insert({
      user_id: user.id,
      upload_id: newUpload.id,
      month: snapshot.month,
      year: snapshot.year,
      paygrade: snapshot.paygrade,
      mha_or_zip: snapshot.mha_or_zip,
      with_dependents: snapshot.with_dependents,
      yos: snapshot.yos,
      expected_bah_cents: snapshot.expected_bah_cents,
      expected_bas_cents: snapshot.expected_bas_cents,
      expected_cola_cents: snapshot.expected_cola_cents,
      expected_base_pay_cents: snapshot.expected_base_pay_cents,
      expected_specials: snapshot.expected_specials,
      taxable_bases: snapshot.taxable_bases || { fed: 0, state: 0, oasdi: 0, medicare: 0 }
    });
  }

  // Emit analytics event
  await supabase.from('analytics_events').insert({
    user_id: user.id,
    event_name: 'les_audit_cloned',
    properties: {
      original_id: id,
      new_id: newUpload.id,
      month: original.month,
      year: original.year
    }
  });

  return NextResponse.json({
    success: true,
    auditId: newUpload.id,
    message: 'Audit cloned successfully. You can now edit and re-run.'
  });
}

