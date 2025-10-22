/**
 * LES AUDIT COMPARISON PAGE
 * 
 * Compare two audits side-by-side to see changes month-to-month
 * URL: /dashboard/paycheck-audit/compare?id1=[uuid]&id2=[uuid]
 * 
 * Use Cases:
 * - Track pay changes after PCS
 * - Verify promotion reflected correctly
 * - Monitor COLA adjustments
 * - Compare before/after corrections
 */

import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ComparisonClient from './ComparisonClient';

export const metadata: Metadata = {
  title: 'Compare LES Audits | Garrison Ledger',
  description: 'Side-by-side comparison of two LES audits to track pay changes.'
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function CompareAuditsPage({
  searchParams
}: {
  searchParams: { id1?: string; id2?: string }
}) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const { id1, id2 } = searchParams;

  if (!id1 || !id2) {
    redirect('/dashboard/paycheck-audit');
  }

  // Fetch both audits
  const [audit1Result, audit2Result] = await Promise.all([
    supabase
      .from('les_uploads')
      .select('*, pay_flags (*), les_lines (*)')
      .eq('id', id1)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single(),
    supabase
      .from('les_uploads')
      .select('*, pay_flags (*), les_lines (*)')
      .eq('id', id2)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()
  ]);

  if (audit1Result.error || audit2Result.error || !audit1Result.data || !audit2Result.data) {
    redirect('/dashboard/paycheck-audit');
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ComparisonClient 
            audit1={audit1Result.data}
            audit2={audit2Result.data}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}

