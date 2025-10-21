/**
 * AUDIT PROVENANCE POPOVER
 * 
 * Shows data sources, update dates, and comparison thresholds
 * for LES audit calculations. Transparency for military audience.
 */

'use client';

import { useState } from 'react';
import Icon from '../ui/Icon';
import { ssot } from '@/lib/ssot';

interface AuditProvenancePopoverProps {
  snapshot: {
    month: number;
    year: number;
    paygrade: string;
    mha_or_zip?: string;
    with_dependents: boolean;
    expected: {
      bah_cents?: number;
      bas_cents?: number;
      cola_cents?: number;
    };
  };
}

export default function AuditProvenancePopover({ snapshot }: AuditProvenancePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="relative inline-block">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        aria-label="View data sources"
      >
        <Icon name="Info" className="w-4 h-4" />
        <span>Data Sources</span>
      </button>

      {/* Popover */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popover Content */}
          <div className="absolute left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-6">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Icon name="Database" className="w-5 h-5 text-blue-600" />
                  Data Provenance
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Sources for pay period {snapshot.month}/{snapshot.year}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <Icon name="X" className="w-5 h-5" />
              </button>
            </div>

            {/* Data Sources */}
            <div className="space-y-4">
              
              {/* BAH */}
              {snapshot.expected.bah_cents !== undefined && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-blue-900 text-sm">BAH (Housing Allowance)</h4>
                    <span className="text-blue-700 font-mono text-sm">
                      {formatCents(snapshot.expected.bah_cents)}
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-blue-800">
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span><strong>Source:</strong> DFAS BAH Rates Table</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span><strong>Paygrade:</strong> {snapshot.paygrade}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span><strong>Location:</strong> {snapshot.mha_or_zip || 'Unknown'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span><strong>Dependents:</strong> {snapshot.with_dependents ? 'With' : 'Without'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span><strong>Threshold:</strong> ±${(ssot.militaryPay.comparisonThresholds.bahDeltaCents / 100).toFixed(2)}</span>
                    </li>
                  </ul>
                  <a
                    href="https://www.defensetravel.dod.mil/site/bahCalc.cfm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-700 hover:text-blue-800 font-medium mt-2 inline-flex items-center gap-1"
                  >
                    View Official Calculator
                    <Icon name="ExternalLink" className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* BAS */}
              {snapshot.expected.bas_cents !== undefined && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-green-900 text-sm">BAS (Subsistence Allowance)</h4>
                    <span className="text-green-700 font-mono text-sm">
                      {formatCents(snapshot.expected.bas_cents)}
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-green-800">
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span><strong>Source:</strong> SSOT (lib/ssot.ts)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span><strong>Category:</strong> {snapshot.paygrade.startsWith('O') ? 'Officer' : 'Enlisted'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span><strong>Updated:</strong> {ssot.lastUpdatedISO}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span><strong>Threshold:</strong> ±${(ssot.militaryPay.comparisonThresholds.basDeltaCents / 100).toFixed(2)}</span>
                    </li>
                  </ul>
                  <a
                    href="https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/BAS/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-700 hover:text-green-800 font-medium mt-2 inline-flex items-center gap-1"
                  >
                    View Official Rates
                    <Icon name="ExternalLink" className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* COLA */}
              {snapshot.expected.cola_cents !== undefined && snapshot.expected.cola_cents > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-yellow-900 text-sm">COLA (Cost of Living)</h4>
                    <span className="text-yellow-700 font-mono text-sm">
                      {formatCents(snapshot.expected.cola_cents)}
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-yellow-800">
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span><strong>Source:</strong> CONUS/OCONUS COLA Rates Table</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span><strong>Location:</strong> {snapshot.mha_or_zip || 'Unknown'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="CheckCircle" className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span><strong>Threshold:</strong> ±${(ssot.militaryPay.comparisonThresholds.colaDeltaCents / 100).toFixed(2)}</span>
                    </li>
                  </ul>
                  <a
                    href="https://www.travel.dod.mil/Travel-Transportation-Rates/Per-Diem/COLA-Rates/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-yellow-700 hover:text-yellow-800 font-medium mt-2 inline-flex items-center gap-1"
                  >
                    View Official COLA Rates
                    <Icon name="ExternalLink" className="w-3 h-3" />
                  </a>
                </div>
              )}

            </div>

            {/* Data Policy */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                <Icon name="Shield" className="w-3 h-3 inline mr-1 text-green-600" />
                <strong>Data Integrity Policy:</strong> All rates sourced from official DoD/DFAS tables. 
                We never estimate or randomize pay data.
              </p>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

