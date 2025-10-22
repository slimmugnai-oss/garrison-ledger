/**
 * LES AUDIT EXPORT API
 * 
 * GET /api/les/audit/[id]/export
 * Generates and downloads PDF export of audit results
 * 
 * Security: User can only export their own audits
 * Premium: Export feature available to all users
 */

import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  // Fetch audit data
  const { data: upload, error } = await supabase
    .from('les_uploads')
    .select(`
      *,
      pay_flags (*),
      expected_pay_snapshot (*),
      les_lines (*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single();

  if (error || !upload) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  // For now, return JSON (PDF generation will be added with jsPDF)
  // This allows the feature to work immediately
  const exportData = {
    title: `LES Audit - ${upload.month}/${upload.year}`,
    generatedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || 'N/A'
    },
    audit: {
      month: upload.month,
      year: upload.year,
      entryType: upload.entry_type,
      status: upload.audit_status,
      completedAt: upload.audit_completed_at
    },
    summary: {
      redFlags: upload.red_flags_count || 0,
      yellowFlags: upload.yellow_flags_count || 0,
      greenFlags: upload.green_flags_count || 0,
      totalDelta: upload.total_delta_cents || 0
    },
    flags: upload.pay_flags.map((f: any) => ({
      severity: f.severity,
      code: f.flag_code,
      message: f.message,
      suggestion: f.suggestion,
      delta: f.delta_cents
    })),
    lineItems: upload.les_lines.map((l: any) => ({
      code: l.line_code,
      description: l.description,
      amount: l.amount_cents / 100,
      section: l.section
    })),
    expected: upload.expected_pay_snapshot[0] || null
  };

  // Return as downloadable JSON for now
  // TODO: Implement PDF generation with jsPDF
  const jsonString = JSON.stringify(exportData, null, 2);
  
  // Emit analytics event
  await supabase.from('analytics_events').insert({
    user_id: user.id,
    event_name: 'les_audit_exported',
    properties: {
      audit_id: id,
      format: 'json', // Will be 'pdf' when implemented
      month: upload.month,
      year: upload.year
    }
  });

  return new NextResponse(jsonString, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="les-audit-${upload.month}-${upload.year}.json"`
    }
  });
}

