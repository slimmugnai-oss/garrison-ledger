/**
 * LES AUDIT DETAIL PAGE
 * 
 * Dedicated page for viewing a single audit with full details
 * URL: /dashboard/paycheck-audit/[id]
 * 
 * Shows:
 * - Summary cards (flags, delta, verdict)
 * - All flags with full details
 * - Expected vs actual breakdown
 * - Math proof
 * - Actions: Delete, Re-Audit, Export
 */

import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AuditDetailClient from './AuditDetailClient';

export const metadata: Metadata = {
  title: 'LES Audit Details | Garrison Ledger',
  description: 'View detailed LES audit results with flags, recommendations, and math proof.'
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AuditDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const { id } = params;

  // Fetch full audit data
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
    redirect('/dashboard/paycheck-audit');
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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AuditDetailClient 
            upload={upload}
            linesBySection={linesBySection}
            flagsBySeverity={flagsBySeverity}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}

