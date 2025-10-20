'use client';

import { useState } from 'react';
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
  pcs_orders_date: string;
  departure_date: string;
  arrival_date: string;
  origin_base: string;
  destination_base: string;
  travel_method: string;
  dependents_count: number;
  rank_at_pcs: string;
  branch: string;
  entitlements: {
    total?: number;
  } | null;
  created_at: string;
  updated_at: string;
}

interface PCSClaimClientProps {
  claim: Claim;
  isPremium: boolean;
  tier: string;
  userProfile: {
    rank?: string;
    branch?: string;
    currentBase?: string;
  };
}

export default function PCSClaimClient({ 
  claim, 
  isPremium, 
  tier,
  userProfile 
}: PCSClaimClientProps) {
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_to_submit': return 'success';
      case 'submitted': return 'primary';
      case 'needs_correction': return 'warning';
      case 'draft': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)]" />

        <div className="mobile-container py-12 sm:py-16">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link 
              href="/dashboard/pcs-copilot" 
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              <Icon name="ArrowLeft" className="w-4 h-4" />
              Back to PCS Copilot
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <Badge variant="primary">Premium Feature</Badge>
          </div>
          
          <div className="flex items-start justify-between mb-8">
            <div>
              <PageHeader
                title={claim.claim_name}
                subtitle={`PCS from ${claim.origin_base} to ${claim.destination_base}`}
              />
              <div className="flex items-center gap-4 mt-4">
                <Badge variant={getStatusColor(claim.status)}>
                  {claim.status.replace('_', ' ')}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name="Calendar" className="w-4 h-4" />
                  Created {formatDate(claim.created_at)}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Claim'}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <AnimatedCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Icon name="Shield" className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{claim.readiness_score}/100</div>
                  <div className="text-sm text-slate-600">Readiness Score</div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <Icon name="CheckCircle" className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{claim.completion_percentage}%</div>
                  <div className="text-sm text-slate-600">Completion</div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Icon name="DollarSign" className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    ${claim.entitlements?.total?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-slate-600">Estimated Total</div>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Claim Details */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <AnimatedCard className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Icon name="Info" className="w-5 h-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">PCS Orders Date</label>
                    <p className="text-slate-900">{formatDate(claim.pcs_orders_date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Travel Method</label>
                    <p className="text-slate-900 capitalize">{claim.travel_method}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Departure Date</label>
                    <p className="text-slate-900">{formatDate(claim.departure_date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Arrival Date</label>
                    <p className="text-slate-900">{formatDate(claim.arrival_date)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Origin Base</label>
                    <p className="text-slate-900">{claim.origin_base}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Destination Base</label>
                    <p className="text-slate-900">{claim.destination_base}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Rank at PCS</label>
                    <p className="text-slate-900">{claim.rank_at_pcs}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Branch</label>
                    <p className="text-slate-900">{claim.branch}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Dependents</label>
                  <p className="text-slate-900">{claim.dependents_count}</p>
                </div>
              </div>
            </AnimatedCard>

            {/* Next Steps */}
            <AnimatedCard className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Icon name="CheckCircle" className="w-5 h-5 text-green-600" />
                Next Steps
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Icon name="Upload" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Upload Documents</h4>
                    <p className="text-sm text-slate-600">Upload your PCS orders, receipts, and weigh tickets</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                  <Icon name="Calculator" className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Calculate Entitlements</h4>
                    <p className="text-sm text-slate-600">AI will calculate DLA, TLE, MALT, and other entitlements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Review & Submit</h4>
                    <p className="text-sm text-slate-600">Review calculations and generate your claim package</p>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Progress Bar */}
          <AnimatedCard className="p-6 mt-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Icon name="TrendingUp" className="w-5 h-5 text-blue-600" />
              Claim Progress
            </h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">
                  Overall Completion
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {claim.completion_percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${claim.completion_percentage}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-slate-600">
              {claim.completion_percentage < 25 && "Just getting started! Upload your documents to begin."}
              {claim.completion_percentage >= 25 && claim.completion_percentage < 50 && "Good progress! Keep uploading documents."}
              {claim.completion_percentage >= 50 && claim.completion_percentage < 75 && "Almost there! Review your calculations."}
              {claim.completion_percentage >= 75 && claim.completion_percentage < 100 && "Nearly complete! Final review needed."}
              {claim.completion_percentage === 100 && "Ready to submit! Your claim package is complete."}
            </p>
          </AnimatedCard>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Icon name="Upload" className="w-5 h-5" />
              Upload Documents
            </button>
            <button className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Icon name="Calculator" className="w-5 h-5" />
              Calculate Entitlements
            </button>
            <button className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
              <Icon name="Download" className="w-5 h-5" />
              Download Package
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
