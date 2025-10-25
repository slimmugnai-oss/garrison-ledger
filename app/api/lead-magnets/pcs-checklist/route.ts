import { NextResponse } from "next/server";

import { errorResponse } from '@/lib/api-errors';
import { logger } from '@/lib/logger';

export const runtime = "nodejs";

/**
 * GET /api/lead-magnets/pcs-checklist
 * 
 * Returns PCS Financial Checklist as downloadable content
 * Can be PDF, markdown, or HTML - keeping it simple with HTML for now
 */
export async function GET() {
  try {
    logger.info('Serving PCS checklist lead magnet');
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FREE PCS Financial Checklist - Garrison Ledger</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #374151;
    }
    h1 { color: #2563eb; font-size: 36px; margin-bottom: 8px; }
    h2 { color: #1e40af; font-size: 24px; margin-top: 32px; margin-bottom: 16px; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
    h3 { color: #374151; font-size: 18px; margin-top: 24px; margin-bottom: 12px; }
    .checklist { background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .checklist li { margin: 8px 0; padding-left: 8px; }
    .tip { background: #dbeafe; border-left: 4px solid #2563eb; padding: 16px; margin: 16px 0; border-radius: 4px; }
    .highlight { background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .money { color: #16a34a; font-weight: bold; }
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #2563eb; color: white; padding: 16px; border-radius: 8px; margin-bottom: 32px; text-align: center;">
    <h1 style="color: white; font-size: 24px; margin: 0;">🎁 Your FREE PCS Financial Checklist</h1>
    <p style="margin: 8px 0 0 0; opacity: 0.9;">From Garrison Ledger - Print or save for your move!</p>
  </div>

  <h1>The Ultimate PCS Financial Checklist</h1>
  <p style="font-size: 18px; color: #6b7280; margin-bottom: 32px;">
    <strong>Don't leave $2,000-$5,000 on the table during your PCS move.</strong> Use this checklist to maximize your benefits and avoid costly mistakes.
  </p>

  <div class="highlight">
    <h3 style="margin-top: 0;">💰 Average Savings with This Checklist: $2,500+</h3>
    <p style="margin-bottom: 0;">Service members who follow this guide save an average of $2,500 per PCS through better planning and benefit maximization.</p>
  </div>

  <h2>📋 Pre-Move Planning (60-90 Days Out)</h2>
  <div class="checklist">
    <h3>Financial Preparation</h3>
    <ul>
      <li>☐ Review PCS entitlements on MyPay</li>
      <li>☐ Calculate estimated DLA (Dislocation Allowance) - usually $2,000-$4,000</li>
      <li>☐ Decide: Government move vs PPM (Personally Procured Move)</li>
      <li>☐ If PPM: Get weight tickets BEFORE you load</li>
      <li>☐ Open separate savings account for PCS funds</li>
      <li>☐ Build $3,000 buffer for unexpected costs</li>
    </ul>
    
    <h3>Housing & BAH</h3>
    <ul>
      <li>☐ Research new duty station BAH rates (DFAS BAH Calculator)</li>
      <li>☐ Start house hunting 90 days early (if buying)</li>
      <li>☐ Check rental market if renting</li>
      <li>☐ Calculate housing cost difference (+ or - BAH)</li>
      <li>☐ Consider house hacking (multi-unit properties)</li>
    </ul>
  </div>

  <div class="tip">
    <strong>💡 PRO TIP:</strong> PPM moves can net you <span class="money">$2,000-$5,000 profit</span> if you do it yourself. Get 3 weight tickets (empty, loaded, empty again) and save every receipt!
  </div>

  <h2>💼 TMO & Logistics (30-60 Days Out)</h2>
  <div class="checklist">
    <ul>
      <li>☐ Schedule TMO appointment (do this EARLY - slots fill up)</li>
      <li>☐ Review weight allowance for your rank/dependents</li>
      <li>☐ Decide what to ship, store, or sell</li>
      <li>☐ Get rid of items you don't need (garage sale = extra $500-$1,000)</li>
      <li>☐ Photograph valuable items for insurance</li>
      <li>☐ Backup important documents (scan to cloud)</li>
      <li>☐ Order copies of medical/dental records</li>
      <li>☐ Transfer prescriptions to new base pharmacy</li>
    </ul>
  </div>

  <h2>💰 Hidden PCS Benefits (Don't Miss These!)</h2>
  <div class="checklist">
    <ul>
      <li>☐ <strong>DLA (Dislocation Allowance):</strong> File within 1 year - $2,000-$4,000</li>
      <li>☐ <strong>TLE (Temporary Lodging Expense):</strong> 10 days hotel coverage</li>
      <li>☐ <strong>Advance Pay:</strong> Available if you need upfront cash</li>
      <li>☐ <strong>Mileage:</strong> $0.22/mile for PCS travel (reimbursed)</li>
      <li>☐ <strong>Per Diem:</strong> Daily allowance for travel days</li>
      <li>☐ <strong>Pet Transportation:</strong> Covered up to $550</li>
      <li>☐ <strong>Storage:</strong> 90 days free NTS (Non-Temporary Storage)</li>
    </ul>
  </div>

  <div class="tip">
    <strong>💡 PRO TIP:</strong> Most service members miss out on <span class="money">$500-$1,500</span> in PCS benefits because they don't file for them. Don't be one of them!
  </div>

  <h2>🏦 Financial Moves to Make</h2>
  <div class="checklist">
    <h3>Before You Leave</h3>
    <ul>
      <li>☐ Notify bank of address change (avoid frozen accounts)</li>
      <li>☐ Update SGLI beneficiaries if needed</li>
      <li>☐ Check TSP contribution (don't interrupt compounding)</li>
      <li>☐ File final taxes in current state (if applicable)</li>
      <li>☐ Cancel unnecessary subscriptions ($50-$100/month savings)</li>
      <li>☐ Transfer utilities to new tenant/owner</li>
    </ul>
    
    <h3>At New Duty Station</h3>
    <ul>
      <li>☐ Update BAH rate in MyPay within 30 days</li>
      <li>☐ File state tax exemption (if applicable)</li>
      <li>☐ Update TSP address</li>
      <li>☐ Shop commissary/exchange first month (tax-free savings)</li>
      <li>☐ Research local military discounts</li>
      <li>☐ Update DEERS and ID cards</li>
    </ul>
  </div>

  <h2>📊 PCS Budget Template</h2>
  <div class="checklist">
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="background: #e5e7eb; font-weight: bold;">
        <td style="padding: 12px; border: 1px solid #d1d5db;">Expense Category</td>
        <td style="padding: 12px; border: 1px solid #d1d5db;">Estimated Cost</td>
        <td style="padding: 12px; border: 1px solid #d1d5db;">Reimbursed?</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #d1d5db;">Travel (gas, hotels, food)</td>
        <td style="padding: 12px; border: 1px solid #d1d5db;">$500-$2,000</td>
        <td style="padding: 12px; border: 1px solid #d1d5db;">Yes (per diem)</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #d1d5db;">House hunting trip</td>
        <td style="padding: 12px; border: 1px solid #d1d5db;">$300-$800</td>
        <td style="padding: 12px; border: 1px solid #d1d5db;">Partial</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #d1d5db;">Security deposit + first month rent</td>
        <td style="padding: 12px; border: 1px solid #d1d5db;">$2,000-$4,000</td>
        <td style="padding: 12px; border: 1px solid #d1d5db;">No</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #d1d5db;">Utility deposits</td>
        <td style="padding: 12px; border: 1px solid #d1d5db;">$200-$400</td>
        <td style="padding: 12px; border: 1px solid #d1d5db;">No</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #d1d5db;">Moving supplies (if PPM)</td>
        <td style="padding: 12px; border: 1px solid #d1d5db;">$300-$600</td>
        <td style="padding: 12px; border: 1px solid #d1d5db;">No</td>
      </tr>
      <tr style="background: #e5e7eb; font-weight: bold;">
        <td style="padding: 12px; border: 1px solid #d1d5db;">TOTAL OUT OF POCKET</td>
        <td style="padding: 12px; border: 1px solid #d1d5db;">$3,300-$7,800</td>
        <td style="padding: 12px; border: 1px solid #d1d5db;">-</td>
      </tr>
    </table>
  </div>

  <h2>🎯 Final Checklist</h2>
  <div class="checklist">
    <h3>Week of Move</h3>
    <ul>
      <li>☐ Clean old residence thoroughly (avoid cleaning fees)</li>
      <li>☐ Take photos/video of empty residence</li>
      <li>☐ Forward mail to new address (USPS)</li>
      <li>☐ Keep all PCS receipts in one folder</li>
      <li>☐ Track your expenses in real-time</li>
    </ul>
    
    <h3>First Week at New Duty Station</h3>
    <ul>
      <li>☐ Submit travel voucher within 5 days</li>
      <li>☐ File DLA within 1 year (but do it now!)</li>
      <li>☐ Update MyPay with new BAH rate</li>
      <li>☐ In-process at new unit</li>
      <li>☐ Register vehicle/get new license (if needed)</li>
    </ul>
  </div>

  <div style="background: linear-gradient(to right, #2563eb, #7c3aed); color: white; padding: 32px; border-radius: 12px; margin: 48px 0; text-align: center;">
    <h2 style="color: white; font-size: 28px; margin: 0 0 16px 0;">Want Your Personalized AI Plan?</h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; opacity: 0.95;">
      Get 8-10 expert content blocks curated specifically for your rank, situation, and goals.
    </p>
    <a href="https://garrison-ledger.vercel.app/sign-up" 
       style="display: inline-block; background: white; color: #2563eb; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 18px;">
      Create Free Account →
    </a>
  </div>

  <div style="text-align: center; padding: 24px; background: #f9fafb; border-radius: 8px; margin-top: 48px;">
    <p style="margin: 0; font-size: 12px; color: #6b7280;">
      <strong>Garrison Ledger</strong> · Intelligent Planning for Military Life<br />
      Join 500+ military families building wealth with AI-powered planning
    </p>
  </div>
</body>
</html>
  `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': 'inline; filename="pcs-financial-checklist.html"'
      }
    });
  } catch (error) {
    return errorResponse(error);
  }
}
