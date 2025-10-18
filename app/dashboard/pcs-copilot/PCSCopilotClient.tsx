'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import PageHeader from '@/app/components/ui/PageHeader';
import Badge from '@/app/components/ui/Badge';
import Icon from '@/app/components/ui/Icon';

interface Claim {
  id: string;
  claim_name: string;
  status: string;
  readiness_score: number;
  completion_percentage: number;
  entitlements: {
    total?: number;
  } | null;
  created_at: string;
}

interface PCSCopilotClientProps {
  initialClaims: Claim[];
  isPremium: boolean;
  tier: string;
  userProfile: {
    rank?: string;
    branch?: string;
    currentBase?: string;
  };
}

export default function PCSCopilotClient({ 
  initialClaims, 
  isPremium, 
  tier,
  userProfile 
}: PCSCopilotClientProps) {
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)]" />

        <div className="mobile-container py-12 sm:py-16">
          {/* Header */}
          <div className="mb-8">
            <Badge variant="primary">Premium Feature</Badge>
          </div>
          <PageHeader
            title="PCS Money Copilot"
            subtitle="AI-powered reimbursement assistant that turns receipts into ready-to-submit claim packages"
          />

          {/* Free User Gate */}
          {!isPremium && (
            <AnimatedCard className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Icon name="Lock" className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">
                  Premium Feature
                </h3>
                <p className="text-lg text-slate-700 mb-6 max-w-2xl mx-auto">
                  PCS Money Copilot helps you recover $1,000-$5,000+ per PCS by catching errors, finding missed entitlements, and building compliant claim packages.
                </p>
                <div className="bg-white rounded-xl p-6 mb-6 max-w-xl mx-auto">
                  <h4 className="font-bold text-slate-900 mb-4">What You Get:</h4>
                  <div className="space-y-3 text-left">
                    <div className="flex items-start gap-3">
                      <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">AI OCR extracts data from receipts, orders, and weigh tickets</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">Automatic entitlement calculation (DLA, TLE, MALT, Per Diem, PPM)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">Error detection (duplicates, date mismatches, missing docs)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">Ready-to-submit package with JTR citations</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/dashboard/upgrade"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                >
                  Upgrade to Premium - $9.99/month
                </Link>
              </div>
            </AnimatedCard>
          )}

          {/* Premium User - Main Interface */}
          {isPremium && (
            <>
              {/* Stats Bar */}
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <AnimatedCard className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Icon name="FolderOpen" className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900">{claims.length}</div>
                      <div className="text-sm text-slate-600">Active Claims</div>
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-xl">
                      <Icon name="DollarSign" className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900">
                        ${claims.reduce((sum, c) => sum + (c.entitlements?.total || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-600">Total Estimated</div>
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <Icon name="CheckCircle" className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900">
                        {claims.filter(c => c.status === 'ready_to_submit').length}
                      </div>
                      <div className="text-sm text-slate-600">Ready to Submit</div>
                    </div>
                  </div>
                </AnimatedCard>
              </div>

              {/* New Claim Button */}
              <div className="mb-8">
                <button
                  onClick={() => setShowNewClaimModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-2"
                >
                  <Icon name="Plus" className="w-5 h-5" />
                  Start New PCS Claim
                </button>
              </div>

              {/* Claims List */}
              {claims.length === 0 ? (
                <AnimatedCard className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <Icon name="FolderOpen" className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">
                    No Claims Yet
                  </h3>
                  <p className="text-lg text-slate-600 mb-6">
                    Start your first PCS claim to get AI-powered assistance with reimbursements
                  </p>
                  <button
                    onClick={() => setShowNewClaimModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Claim
                  </button>
                </AnimatedCard>
              ) : (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <AnimatedCard key={claim.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-slate-900">{claim.claim_name}</h3>
                            <Badge variant={
                              claim.status === 'ready_to_submit' ? 'success' :
                              claim.status === 'submitted' ? 'primary' :
                              claim.status === 'needs_correction' ? 'warning' :
                              'secondary'
                            }>
                              {claim.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-slate-700">
                                Completion
                              </span>
                              <span className="text-sm font-bold text-blue-600">
                                {claim.completion_percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${claim.completion_percentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Readiness Score */}
                          <div className="flex items-center gap-6 mb-4">
                            <div className="flex items-center gap-2">
                              <Icon name="Shield" className="w-4 h-4 text-slate-600" />
                              <span className="text-sm text-slate-600">Readiness Score:</span>
                              <span className={`font-bold ${
                                claim.readiness_score >= 90 ? 'text-green-600' :
                                claim.readiness_score >= 70 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {claim.readiness_score}/100
                              </span>
                            </div>
                            {claim.entitlements?.total && (
                              <div className="flex items-center gap-2">
                                <Icon name="DollarSign" className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-slate-600">Estimated:</span>
                                <span className="font-bold text-green-600">
                                  ${claim.entitlements.total.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/pcs-copilot/${claim.id}`}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Open Claim
                          </Link>
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Feature Explainer */}
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatedCard className="p-6">
              <div className="p-3 bg-blue-50 rounded-xl w-fit mb-4">
                <Icon name="Upload" className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Smart Upload</h4>
              <p className="text-sm text-slate-600">
                Snap photos of receipts, orders, and weigh tickets. AI extracts all the data.
              </p>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <div className="p-3 bg-green-50 rounded-xl w-fit mb-4">
                <Icon name="Calculator" className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Auto Calculate</h4>
              <p className="text-sm text-slate-600">
                Instant estimates for DLA, TLE, MALT, Per Diem, and PPM based on JTR rules.
              </p>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <div className="p-3 bg-orange-50 rounded-xl w-fit mb-4">
                <Icon name="AlertTriangle" className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Catch Errors</h4>
              <p className="text-sm text-slate-600">
                Detects duplicates, date mismatches, and missing docs before finance does.
              </p>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <div className="p-3 bg-purple-50 rounded-xl w-fit mb-4">
                <Icon name="CheckCircle" className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Submit Ready</h4>
              <p className="text-sm text-slate-600">
                Get organized claim packages with JTR citations and step-by-step checklists.
              </p>
            </AnimatedCard>
          </div>

          {/* How It Works */}
          {isPremium && (
            <div className="mt-12">
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">How It Works</h2>
              <div className="grid sm:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-black text-lg mb-3">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Create Claim</h4>
                  <p className="text-sm text-slate-600">
                    Enter basic PCS details (dates, bases, dependents)
                  </p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-black text-lg mb-3">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Upload Docs</h4>
                  <p className="text-sm text-slate-600">
                    Snap or upload orders, receipts, weigh tickets
                  </p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-black text-lg mb-3">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Review & Fix</h4>
                  <p className="text-sm text-slate-600">
                    AI flags errors and shows what you're leaving on the table
                  </p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-black text-lg mb-3">
                    ✓
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Submit</h4>
                  <p className="text-sm text-slate-600">
                    Get organized package with totals and citations
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* New Claim Modal - Would implement with form */}
      {showNewClaimModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Create New PCS Claim</h3>
            <p className="text-slate-600 mb-6">
              Coming soon: Quick form to create your claim package
            </p>
            <button
              onClick={() => setShowNewClaimModal(false)}
              className="px-6 py-3 bg-gray-200 text-slate-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

