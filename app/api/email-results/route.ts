import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Helper to format currency
const fmt = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Email templates for each calculator
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templates: Record<string, (data: { inputs: any; outputs: any }) => string> = {
  tsp: (data) => `
    <h2>Your TSP Allocation Analysis</h2>
    <div style="background: #f0f4ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3>Your Inputs:</h3>
      <ul>
        <li>Current Age: ${data.inputs.age}</li>
        <li>Retirement Age: ${data.inputs.retire}</li>
        <li>Current Balance: ${fmt(data.inputs.balance)}</li>
        <li>Monthly Contribution: ${fmt(data.inputs.monthly)}</li>
        <li>Allocation: C${data.inputs.mix.C}% / S${data.inputs.mix.S}% / I${data.inputs.mix.I}% / F${data.inputs.mix.F}% / G${data.inputs.mix.G}%</li>
      </ul>
    </div>
    <div style="background: #e7f5ec; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3>Your Results:</h3>
      <ul>
        <li><strong>Projected Balance at Retirement:</strong> ${fmt(data.outputs.endCustom || 0)}</li>
        <li><strong>Difference vs Default Allocation:</strong> ${fmt(data.outputs.diff || 0)}</li>
      </ul>
    </div>
  `,
  
  sdp: (data) => `
    <h2>Your SDP Strategy Analysis</h2>
    <div style="background: #f0f4ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3>Your Inputs:</h3>
      <ul>
        <li>Deployment Duration: ${data.inputs.months} months</li>
        <li>SDP Deposit: ${fmt(data.inputs.deposit)}</li>
      </ul>
    </div>
    <div style="background: #e7f5ec; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3>Your Results:</h3>
      <ul>
        <li><strong>SDP Interest Earned:</strong> ${fmt(data.outputs.interest || 0)}</li>
        <li><strong>Total Payout:</strong> ${fmt(data.outputs.total || 0)}</li>
      </ul>
    </div>
  `,
  
  'house-hacking': (data) => `
    <h2>Your House Hacking Analysis</h2>
    <div style="background: #f0f4ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3>Your Inputs:</h3>
      <ul>
        <li>Purchase Price: ${fmt(data.inputs.price || 0)}</li>
        <li>Monthly Rent: ${fmt(data.inputs.rent || 0)}</li>
        <li>Down Payment: ${data.inputs.down || 0}%</li>
      </ul>
    </div>
    <div style="background: #e7f5ec; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3>Your Results:</h3>
      <ul>
        <li><strong>Monthly Cash Flow:</strong> ${fmt(data.outputs.cashFlow || 0)}</li>
        <li><strong>Annual ROI:</strong> ${(data.outputs.roi || 0).toFixed(1)}%</li>
      </ul>
    </div>
  `,
  
  pcs: (data) => `
    <h2>Your PCS Financial Plan</h2>
    <div style="background: #f0f4ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3>Your Income:</h3>
      <ul>
        <li>DLA: ${fmt(data.outputs.totalIncome || 0)}</li>
        <li>Total Income: ${fmt(data.outputs.totalIncome || 0)}</li>
      </ul>
    </div>
    <div style="background: #fff4e6; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3>Your Expenses:</h3>
      <ul>
        <li>Total Expenses: ${fmt(data.outputs.totalExpenses || 0)}</li>
      </ul>
    </div>
    <div style="background: #e7f5ec; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3>Net Result:</h3>
      <p style="font-size: 24px; font-weight: bold; color: ${data.outputs.netEstimate >= 0 ? '#059669' : '#DC2626'};">
        ${fmt(data.outputs.netEstimate || 0)}
      </p>
      ${data.outputs.netProfit > 0 ? `<p><strong>PPM Profit:</strong> ${fmt(data.outputs.netProfit)}</p>` : ''}
    </div>
  `,
  
  savings: (data) => `
    <h2>Your Annual Savings Analysis</h2>
    <div style="background: #e7f5ec; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3>Your Total Annual Savings:</h3>
      <p style="font-size: 32px; font-weight: bold; color: #059669;">
        ${fmt(data.outputs.grandTotal || 0)}
      </p>
    </div>
    <div style="background: #f0f4ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3>Breakdown:</h3>
      <ul>
        <li>Commissary Savings: ${fmt(data.outputs.totalCommissarySavings || 0)}</li>
        <li>Exchange Savings: ${fmt(data.outputs.totalExchangeSavings || 0)}</li>
      </ul>
    </div>
  `,
  
  career: (data) => `
    <h2>Your Career Opportunity Analysis</h2>
    <div style="background: #f0f4ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3>Comparison:</h3>
      <ul>
        <li>Current Position: ${fmt(data.inputs.currentData.salary)}</li>
        <li>New Opportunity: ${fmt(data.inputs.newData.salary)}</li>
      </ul>
    </div>
    <div style="background: #e7f5ec; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h3>After Adjustments:</h3>
      <p style="font-size: 24px; font-weight: bold; color: ${data.outputs.isPositive ? '#059669' : '#DC2626'};">
        ${data.outputs.isPositive ? '+' : ''}${fmt(data.outputs.netDifference || 0)}
      </p>
      <p style="margin-top: 10px;">${data.outputs.executiveSummary}</p>
    </div>
  `
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Get user email from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      logger.warn('[EmailResults] User email not found', { userId });
      throw Errors.invalidInput("User email not found in account");
    }

    const { tool, data } = await req.json();

    if (!tool || !data) {
      throw Errors.invalidInput("Tool and data are required");
    }

    // Get template function
    const templateFn = templates[tool as keyof typeof templates];
    if (!templateFn) {
      throw Errors.invalidInput(`Invalid tool: ${tool}. Must be one of: ${Object.keys(templates).join(', ')}`);
    }

    // Generate email HTML
    const toolNames: Record<string, string> = {
      tsp: 'TSP Allocation Modeler',
      sdp: 'SDP Payout Strategist',
      'house-hacking': 'House Hacking Calculator',
      pcs: 'PCS Financial Planner',
      savings: 'Annual Savings Command Center',
      career: 'Career Opportunity Analyzer'
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #0A2463; color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">Garrison Ledger</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${toolNames[tool] || 'Calculator'} Results</p>
          </div>

          <div style="background: white; padding: 20px;">
            ${templateFn(data)}
          </div>

          <div style="background: #f7f8fa; padding: 20px; border-radius: 10px; margin-top: 30px; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #666;">
              Want to update your calculations or try other tools?
            </p>
            <a href="https://garrisonledger.com/dashboard" style="display: inline-block; background: #0A2463; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
              Garrison Ledger - Financial Planning for Military Families
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
              <a href="https://garrisonledger.com" style="color: #0A2463; text-decoration: none;">garrisonledger.com</a>
            </p>
          </div>
        </body>
      </html>
    `;

    // Check if Resend is configured
    if (!resend) {
      logger.error('[EmailResults] RESEND_API_KEY not configured');
      throw Errors.externalApiError("Resend", "Email service not configured");
    }

    // Send email using Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Garrison Ledger <noreply@garrisonledger.com>',
      to: userEmail,
      subject: `Your ${toolNames[tool]} Results - Garrison Ledger`,
      html: emailHtml
    });

    if (emailError) {
      logger.error('[EmailResults] Failed to send email', emailError, { userId, tool, userEmail: userEmail.split('@')[1] });
      throw Errors.externalApiError("Resend", "Failed to send email");
    }

    const duration = Date.now() - startTime;
    logger.info('[EmailResults] Email sent', { userId, tool, emailId: emailData?.id, duration });
    
    return NextResponse.json({
      success: true,
      emailId: emailData?.id
    });
  } catch (error) {
    return errorResponse(error);
  }
}

