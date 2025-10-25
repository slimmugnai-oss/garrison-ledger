import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import Icon from "@/app/components/ui/Icon";

interface SharePageProps {
  params: Promise<{
    tool: string;
    shareId: string;
  }>;
}

// Fetch shared calculation data
async function getSharedCalculation(shareId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://garrisonledger.com';
    const response = await fetch(`${baseUrl}/api/share-calculation?id=${shareId}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { tool } = await params;
  
  const toolNames: Record<string, string> = {
    'tsp-modeler': 'TSP Allocation Analysis',
    'sdp-strategist': 'SDP Strategy',
    'house-hacking': 'House Hacking Analysis',
    'pcs-planner': 'PCS Financial Plan',
    'on-base-savings': 'Annual Savings Breakdown',
    'salary-calculator': 'Career Opportunity Analysis'
  };

  return {
    title: `Shared ${toolNames[tool] || 'Calculator'} - Garrison Ledger`,
    description: 'View shared calculator results and create your own personalized financial plan.'
  };
}

export default async function SharedCalculationPage({ params }: SharePageProps) {
  const { tool, shareId } = await params;
  const sharedData = await getSharedCalculation(shareId);

  if (!sharedData) {
    notFound();
  }

  const toolNames: Record<string, string> = {
    'tsp-modeler': 'TSP Allocation Modeler',
    'sdp-strategist': 'SDP Payout Strategist',
    'house-hacking': 'House Hacking Calculator',
    'pcs-planner': 'PCS Financial Planner',
    'on-base-savings': 'Annual Savings Command Center',
    'salary-calculator': 'Career Opportunity Analyzer'
  };

  const toolPaths: Record<string, string> = {
    'tsp-modeler': '/dashboard/tools/tsp-modeler',
    'sdp-strategist': '/dashboard/tools/sdp-strategist',
    'house-hacking': '/dashboard/tools/house-hacking',
    'pcs-planner': '/dashboard/tools/pcs-planner',
    'on-base-savings': '/dashboard/tools/on-base-savings',
    'salary-calculator': '/dashboard/tools/salary-calculator'
  };

  const { data, createdAt, viewCount } = sharedData;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          {/* Shared Badge */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-4">
              <Icon name="Share2" className="h-3 w-3" />
              Shared Calculation
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-3">
              {toolNames[tool] || 'Calculator Results'}
            </h1>
            <p className="text-body mb-2">
              Someone shared their calculator results with you
            </p>
            <p className="text-sm text-muted">
              Shared {new Date(createdAt).toLocaleDateString()} • {viewCount} views
            </p>
          </div>

          {/* Results Display */}
          <div className="bg-card rounded-xl p-8 border border-border mb-8">
            <h2 className="text-2xl font-bold text-primary mb-6">Shared Results</h2>
            
            {/* Dynamic content based on tool */}
            {tool === 'tsp-modeler' && data.outputs && (
              <div className="space-y-4">
                <div className="bg-info-subtle border border-info rounded-lg p-4">
                  <h3 className="font-bold text-blue-900 mb-2">Inputs:</h3>
                  <ul className="text-info text-sm space-y-1">
                    <li>Age: {data.inputs.age} → Retirement: {data.inputs.retire}</li>
                    <li>Current Balance: ${data.inputs.balance?.toLocaleString()}</li>
                    <li>Monthly Contribution: ${data.inputs.monthly?.toLocaleString()}</li>
                    {data.inputs.mix && (
                      <li>Allocation: C{data.inputs.mix.C}% / S{data.inputs.mix.S}% / I{data.inputs.mix.I}% / F{data.inputs.mix.F}% / G{data.inputs.mix.G}%</li>
                    )}
                  </ul>
                </div>
                <div className="bg-success-subtle border border-success rounded-lg p-4">
                  <h3 className="font-bold text-success mb-2">Results:</h3>
                  <p className="text-2xl font-bold text-success">
                    ${data.outputs.endCustom?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-success mt-1">
                    Projected balance at retirement
                  </p>
                </div>
              </div>
            )}

            {tool === 'pcs-planner' && data.outputs && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-info-subtle border border-info rounded-lg p-4">
                    <p className="text-sm text-info mb-1">Total Income</p>
                    <p className="text-2xl font-bold text-info">
                      ${data.outputs.totalIncome?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="bg-warning-subtle border border-warning rounded-lg p-4">
                    <p className="text-sm text-warning mb-1">Total Expenses</p>
                    <p className="text-2xl font-bold text-warning">
                      ${data.outputs.totalExpenses?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className={`${data.outputs.netEstimate >= 0 ? 'bg-success-subtle border-success' : 'bg-danger-subtle border-danger'} border rounded-lg p-4`}>
                    <p className={`text-sm ${data.outputs.netEstimate >= 0 ? 'text-success' : 'text-danger'} mb-1`}>Net Estimate</p>
                    <p className={`text-2xl font-bold ${data.outputs.netEstimate >= 0 ? 'text-success' : 'text-danger'}`}>
                      ${data.outputs.netEstimate?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {tool === 'on-base-savings' && data.outputs && (
              <div className="space-y-4">
                <div className="bg-success-subtle border border-success rounded-lg p-6 text-center">
                  <p className="text-sm text-success mb-2">Total Annual Savings</p>
                  <p className="text-4xl font-bold text-success">
                    ${data.outputs.grandTotal?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-info-subtle border border-info rounded-lg p-4">
                    <p className="text-sm text-info mb-1">Commissary Savings</p>
                    <p className="text-xl font-bold text-info">
                      ${data.outputs.totalCommissarySavings?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-1">Exchange Savings</p>
                    <p className="text-xl font-bold text-blue-800">
                      ${data.outputs.totalExchangeSavings?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Generic fallback for other tools */}
            {!['tsp-modeler', 'pcs-planner', 'on-base-savings'].includes(tool) && (
              <div className="bg-info-subtle border border-info rounded-lg p-6">
                <p className="text-info">
                  Calculation results shared successfully. Sign in to create your own personalized analysis.
                </p>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white text-center">
            <Icon name="Calculator" className="h-16 w-16 mx-auto mb-4 text-white" />
            <h2 className="text-3xl font-bold mb-3">
              Want to Calculate Your Own Results?
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Create your free account and access all 6 calculator tools. Get personalized results, 
              AI-powered explanations, and save your work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="btn-primary bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg shadow-lg inline-flex items-center justify-center"
              >
                Create Free Account
              </Link>
              <Link
                href={toolPaths[tool] || '/dashboard'}
                className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 px-8 py-4 rounded-xl font-bold text-lg inline-flex items-center justify-center"
              >
                Try {toolNames[tool]}
              </Link>
            </div>
            <p className="text-sm text-white/70 mt-4">
              Free forever • No credit card required
            </p>
          </div>

          {/* Social Proof */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted mb-4">
              Join thousands of military families using Garrison Ledger
            </p>
            <div className="flex items-center justify-center gap-8 text-primary">
              <div>
                <p className="text-2xl font-bold">410+</p>
                <p className="text-xs text-muted">Expert Articles</p>
              </div>
              <div>
                <p className="text-2xl font-bold">6</p>
                <p className="text-xs text-muted">Free Tools</p>
              </div>
              <div>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-muted">Military-Focused</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

