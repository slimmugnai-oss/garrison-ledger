/**
 * EXPORT AUDIT PDF
 * 
 * Generates downloadable PDF report of LES audit results.
 * For taking to finance office or personal records.
 * 
 * Uses jsPDF and jspdf-autotable (already in package.json)
 */

'use client';

import { useState } from 'react';

import type { LesAuditResponse } from '@/app/types/les';

import Icon from '../ui/Icon';

interface ExportAuditPDFProps {
  auditResult: LesAuditResponse;
  userProfile: {
    rank?: string;
    currentBase?: string;
  };
}

export default function ExportAuditPDF({ auditResult, userProfile }: ExportAuditPDFProps) {
  const [generating, setGenerating] = useState(false);

  const handleExport = async () => {
    setGenerating(true);

    try {
      // Dynamic import to keep bundle size down
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('LES Audit Report', 14, 20);
      
      // Metadata
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Pay Period: ${auditResult.snapshot.month}/${auditResult.snapshot.year}`, 14, 30);
      doc.text(`Rank: ${userProfile.rank || 'Unknown'}`, 14, 36);
      doc.text(`Base: ${userProfile.currentBase || 'Unknown'}`, 14, 42);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 48);
      
      // Summary
      let yPos = 58;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Audit Summary', 14, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const redCount = auditResult.flags.filter(f => f.severity === 'red').length;
      const yellowCount = auditResult.flags.filter(f => f.severity === 'yellow').length;
      const greenCount = auditResult.flags.filter(f => f.severity === 'green').length;
      
      doc.text(`Critical Issues (Red): ${redCount}`, 14, yPos);
      yPos += 6;
      doc.text(`Warnings (Yellow): ${yellowCount}`, 14, yPos);
      yPos += 6;
      doc.text(`Verified (Green): ${greenCount}`, 14, yPos);
      yPos += 6;
      
      // Expected vs Actual
      yPos += 4;
      doc.setFont('helvetica', 'bold');
      doc.text('Expected vs Actual', 14, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      
      const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
      doc.text(`Expected Total: ${formatCents(auditResult.summary.expectedAllowancesCents)}`, 14, yPos);
      yPos += 6;
      doc.text(`Actual Total: ${formatCents(auditResult.summary.actualAllowancesCents)}`, 14, yPos);
      yPos += 6;
      doc.text(`Delta: ${formatCents(auditResult.summary.deltaCents)}`, 14, yPos);
      yPos += 10;
      
      // Flags Table
      if (auditResult.flags.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Detailed Flags', 14, yPos);
        yPos += 6;
        
        const tableData = auditResult.flags.map(flag => [
          flag.severity.toUpperCase(),
          flag.flag_code,
          flag.message,
          flag.suggestion
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Severity', 'Code', 'Issue', 'Action Required']],
          body: tableData,
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 30 },
            2: { cellWidth: 65 },
            3: { cellWidth: 65 }
          },
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
          didParseCell: function (data) {
            // Color-code severity
            if (data.column.index === 0 && data.section === 'body') {
              const severity = data.cell.raw as string;
              if (severity === 'RED') {
                data.cell.styles.textColor = [220, 38, 38];
                data.cell.styles.fontStyle = 'bold';
              } else if (severity === 'YELLOW') {
                data.cell.styles.textColor = [217, 119, 6];
              } else if (severity === 'GREEN') {
                data.cell.styles.textColor = [5, 150, 105];
              }
            }
          }
        });
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Next Steps
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Next Steps', 14, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const steps = [
        '1. Review all red flags above - these are critical pay issues',
        '2. Contact your finance office for red flags (bring this report)',
        '3. Monitor yellow flags - verify on next LES',
        '4. Save this audit for your records'
      ];
      
      steps.forEach(step => {
        doc.text(step, 14, yPos);
        yPos += 6;
      });
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text('Generated by Garrison Ledger - https://garrisonledger.com', 14, 285);
      doc.text('This report is for informational purposes only. Verify all amounts with your finance office.', 14, 290);
      
      // Download
      const filename = `les-audit-${auditResult.snapshot.year}-${String(auditResult.snapshot.month).padStart(2, '0')}.pdf`;
      doc.save(filename);
      
    } catch {
      // Export error - user already sees error state
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={generating}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {generating ? (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <Icon name="Download" className="w-4 h-4" />
          <span>Download PDF Report</span>
        </>
      )}
    </button>
  );
}

