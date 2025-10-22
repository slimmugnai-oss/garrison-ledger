'use client';

/**
 * AUDIT COMPARISON CLIENT
 * Side-by-side comparison of two LES audits
 */

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';
import AnimatedCard from '@/app/components/ui/AnimatedCard';

interface Props {
  audit1: any;
  audit2: any;
}

export default function ComparisonClient({ audit1, audit2 }: Props) {
  // Helper to get line amount
  const getLineAmount = (audit: any, code: string) => {
    const line = audit.les_lines.find((l: any) => l.line_code === code);
    return line?.amount_cents || 0;
  };

  // Compute totals for each audit
  const computeTotals = (audit: any) => {
    const allowances = audit.les_lines
      .filter((l: any) => l.section === 'ALLOWANCE')
      .reduce((sum: number, l: any) => sum + l.amount_cents, 0);
    const taxes = audit.les_lines
      .filter((l: any) => l.section === 'TAX')
      .reduce((sum: number, l: any) => sum + l.amount_cents, 0);
    const deductions = audit.les_lines
      .filter((l: any) => l.section === 'DEDUCTION')
      .reduce((sum: number, l: any) => sum + l.amount_cents, 0);
    
    return { allowances, taxes, deductions, net: allowances - taxes - deductions };
  };

  const totals1 = computeTotals(audit1);
  const totals2 = computeTotals(audit2);

  // Calculate differences
  const differences = {
    basepay: getLineAmount(audit2, 'BASEPAY') - getLineAmount(audit1, 'BASEPAY'),
    bah: getLineAmount(audit2, 'BAH') - getLineAmount(audit1, 'BAH'),
    bas: getLineAmount(audit2, 'BAS') - getLineAmount(audit1, 'BAS'),
    cola: getLineAmount(audit2, 'COLA') - getLineAmount(audit1, 'COLA'),
    net: totals2.net - totals1.net
  };

  // Common line codes to compare
  const compareLines = [
    { code: 'BASEPAY', label: 'Base Pay' },
    { code: 'BAH', label: 'BAH' },
    { code: 'BAS', label: 'BAS' },
    { code: 'COLA', label: 'COLA' },
    { code: 'TSP', label: 'TSP' },
    { code: 'SGLI', label: 'SGLI' },
    { code: 'TAX_FED', label: 'Federal Tax' },
    { code: 'TAX_STATE', label: 'State Tax' },
    { code: 'FICA', label: 'FICA' },
    { code: 'MEDICARE', label: 'Medicare' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard/paycheck-audit"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <Icon name="ChevronLeft" className="h-4 w-4 mr-1" />
          Back to LES Auditor
        </Link>
        
        <h1 className="text-4xl font-serif font-black text-text-headings mb-2">
          Compare Audits
        </h1>
        <p className="text-text-body">
          Side-by-side comparison of {audit1.month}/{audit1.year} vs {audit2.month}/{audit2.year}
        </p>
      </div>

      {/* Key Changes Summary */}
      {(differences.basepay !== 0 || differences.bah !== 0 || differences.net !== 0) && (
        <AnimatedCard className="mb-8 bg-blue-50 border-2 border-blue-200 p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Key Changes</h2>
          <div className="grid grid-cols-3 gap-4">
            {differences.basepay !== 0 && (
              <div>
                <div className="text-sm text-blue-700">Base Pay Change</div>
                <div className={`text-2xl font-black ${differences.basepay > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {differences.basepay > 0 ? '+' : ''}${(Math.abs(differences.basepay) / 100).toFixed(2)}
                </div>
              </div>
            )}
            {differences.bah !== 0 && (
              <div>
                <div className="text-sm text-blue-700">BAH Change</div>
                <div className={`text-2xl font-black ${differences.bah > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {differences.bah > 0 ? '+' : ''}${(Math.abs(differences.bah) / 100).toFixed(2)}
                </div>
              </div>
            )}
            {differences.net !== 0 && (
              <div>
                <div className="text-sm text-blue-700">Net Pay Change</div>
                <div className={`text-2xl font-black ${differences.net > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {differences.net > 0 ? '+' : ''}${(Math.abs(differences.net) / 100).toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </AnimatedCard>
      )}

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Audit 1 */}
        <AnimatedCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {audit1.month}/{audit1.year}
              </h2>
              <Link href={`/dashboard/paycheck-audit/${audit1.id}`}>
                <Badge variant="neutral">View Details</Badge>
              </Link>
            </div>
            
            <div className="space-y-3">
              {compareLines.map(({ code, label }) => {
                const amount = getLineAmount(audit1, code);
                return (
                  <div key={code} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">{label}</span>
                    <span className="font-semibold">${(amount / 100).toFixed(2)}</span>
                  </div>
                );
              })}
              <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-gray-300 mt-2 pt-2">
                <span>Net Pay</span>
                <span>${(totals1.net / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex gap-2">
                <Badge variant={audit1.red_flags_count > 0 ? 'danger' : audit1.yellow_flags_count > 0 ? 'warning' : 'success'}>
                  {audit1.red_flags_count || 0} red
                </Badge>
                <Badge variant="warning">
                  {audit1.yellow_flags_count || 0} yellow
                </Badge>
                <Badge variant="success">
                  {audit1.green_flags_count || 0} green
                </Badge>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Audit 2 */}
        <AnimatedCard delay={100}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {audit2.month}/{audit2.year}
              </h2>
              <Link href={`/dashboard/paycheck-audit/${audit2.id}`}>
                <Badge variant="neutral">View Details</Badge>
              </Link>
            </div>
            
            <div className="space-y-3">
              {compareLines.map(({ code, label }) => {
                const amount = getLineAmount(audit2, code);
                const amount1 = getLineAmount(audit1, code);
                const diff = amount - amount1;
                
                return (
                  <div key={code} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">${(amount / 100).toFixed(2)}</span>
                      {diff !== 0 && (
                        <span className={`text-sm ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ({diff > 0 ? '+' : ''}${(diff / 100).toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-gray-300 mt-2 pt-2">
                <span>Net Pay</span>
                <div className="flex items-center gap-2">
                  <span>${(totals2.net / 100).toFixed(2)}</span>
                  {differences.net !== 0 && (
                    <span className={`text-sm ${differences.net > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({differences.net > 0 ? '+' : ''}${(differences.net / 100).toFixed(2)})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex gap-2">
                <Badge variant={audit2.red_flags_count > 0 ? 'danger' : audit2.yellow_flags_count > 0 ? 'warning' : 'success'}>
                  {audit2.red_flags_count || 0} red
                </Badge>
                <Badge variant="warning">
                  {audit2.yellow_flags_count || 0} yellow
                </Badge>
                <Badge variant="success">
                  {audit2.green_flags_count || 0} green
                </Badge>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Detailed Changes */}
      <AnimatedCard delay={200}>
        <div className="p-6">
          <h2 className="text-2xl font-serif font-black text-text-headings mb-6">
            Change Analysis
          </h2>
          
          <div className="space-y-4">
            {/* Only show lines that changed */}
            {compareLines.filter(({ code }) => {
              const diff = getLineAmount(audit2, code) - getLineAmount(audit1, code);
              return diff !== 0;
            }).map(({ code, label }) => {
              const amount1 = getLineAmount(audit1, code);
              const amount2 = getLineAmount(audit2, code);
              const diff = amount2 - amount1;
              const percentChange = amount1 > 0 ? ((diff / amount1) * 100) : 0;
              
              return (
                <div key={code} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">{label}</div>
                    <div className="text-sm text-gray-600">
                      ${(amount1 / 100).toFixed(2)} → ${(amount2 / 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {diff > 0 ? '+' : ''}${(Math.abs(diff) / 100).toFixed(2)}
                    </div>
                    {percentChange !== 0 && amount1 > 0 && (
                      <div className="text-sm text-gray-600">
                        ({percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {compareLines.filter(({ code }) => {
              const diff = getLineAmount(audit2, code) - getLineAmount(audit1, code);
              return diff !== 0;
            }).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No changes detected between these two audits
              </div>
            )}
          </div>
        </div>
      </AnimatedCard>

      {/* Flag Comparison */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        <AnimatedCard delay={250}>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {audit1.month}/{audit1.year} Flags
            </h3>
            <div className="space-y-2">
              {audit1.pay_flags.slice(0, 5).map((flag: any) => (
                <div key={flag.id} className="flex items-start gap-2">
                  <Badge 
                    variant={flag.severity === 'red' ? 'danger' : flag.severity === 'yellow' ? 'warning' : 'success'}
                    size="sm"
                  >
                    {flag.severity}
                  </Badge>
                  <span className="text-sm text-gray-700">{flag.message}</span>
                </div>
              ))}
              {audit1.pay_flags.length === 0 && (
                <p className="text-sm text-gray-500">No flags</p>
              )}
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={300}>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {audit2.month}/{audit2.year} Flags
            </h3>
            <div className="space-y-2">
              {audit2.pay_flags.slice(0, 5).map((flag: any) => (
                <div key={flag.id} className="flex items-start gap-2">
                  <Badge 
                    variant={flag.severity === 'red' ? 'danger' : flag.severity === 'yellow' ? 'warning' : 'success'}
                    size="sm"
                  >
                    {flag.severity}
                  </Badge>
                  <span className="text-sm text-gray-700">{flag.message}</span>
                </div>
              ))}
              {audit2.pay_flags.length === 0 && (
                <p className="text-sm text-gray-500">No flags</p>
              )}
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}

