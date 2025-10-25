/**
 * LES AUDIT DETAIL API
 * 
 * GET /api/les/audit/[id]
 * Returns full audit details including flags, expected values, and line items
 * 
 * Security: User can only access their own audits (RLS enforced)
 */

import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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

  // Fetch upload with all related data
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
    return NextResponse.json(
      { error: 'Audit not found' },
      { status: 404 }
    );
  }

  // Group lines by section
  const linesBySection = {
    ALLOWANCE: upload.les_lines.filter((l: any) => l.section === 'ALLOWANCE'),
    TAX: upload.les_lines.filter((l: any) => l.section === 'TAX'),
    DEDUCTION: upload.les_lines.filter((l: any) => l.section === 'DEDUCTION'),
    ALLOTMENT: upload.les_lines.filter((l: any) => l.section === 'ALLOTMENT'),
    DEBT: upload.les_lines.filter((l: any) => l.section === 'DEBT'),
    ADJUSTMENT: upload.les_lines.filter((l: any) => l.section === 'ADJUSTMENT')
  };

  // Group flags by severity
  const flagsBySeverity = {
    red: upload.pay_flags.filter((f: any) => f.severity === 'red'),
    yellow: upload.pay_flags.filter((f: any) => f.severity === 'yellow'),
    green: upload.pay_flags.filter((f: any) => f.severity === 'green')
  };

  // Compute totals
  const totals = {
    allowances: linesBySection.ALLOWANCE.reduce((sum: number, l: any) => sum + l.amount_cents, 0),
    taxes: linesBySection.TAX.reduce((sum: number, l: any) => sum + l.amount_cents, 0),
    deductions: linesBySection.DEDUCTION.reduce((sum: number, l: any) => sum + l.amount_cents, 0),
    allotments: linesBySection.ALLOTMENT.reduce((sum: number, l: any) => sum + l.amount_cents, 0),
    debts: linesBySection.DEBT.reduce((sum: number, l: any) => sum + l.amount_cents, 0),
    adjustments: linesBySection.ADJUSTMENT.reduce((sum: number, l: any) => sum + l.amount_cents, 0)
  };

  return NextResponse.json({
    upload,
    linesBySection,
    flagsBySeverity,
    totals,
    metadata: {
      month: upload.month,
      year: upload.year,
      entryType: upload.entry_type,
      status: upload.audit_status,
      completedAt: upload.audit_completed_at,
      flagCounts: {
        red: upload.red_flags_count || 0,
        yellow: upload.yellow_flags_count || 0,
        green: upload.green_flags_count || 0
      },
      totalDelta: upload.total_delta_cents || 0
    }
  });
}

