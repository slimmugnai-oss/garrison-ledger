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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('orders');

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

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    setUploadedFiles(fileArray);
    
    for (const file of fileArray) {
      try {
        const base64 = await fileToBase64(file);
        
        const response = await fetch('/api/pcs/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            claimId: claim.id,
            documentType: selectedDocumentType,
            fileName: file.name,
            fileData: base64,
            contentType: file.type
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('Upload successful:', result.document);
        } else {
          console.error('Upload failed:', result.error);
          alert(`Upload failed: ${result.error}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed. Please try again.');
      }
    }
    
    setShowUploadModal(false);
    setUploadedFiles([]);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleCalculateEntitlements = async () => {
    setIsCalculating(true);
    
    try {
      const response = await fetch('/api/pcs/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claimId: claim.id
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Entitlements calculated successfully! Check your claim details.');
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        console.error('Calculation failed:', result.error);
        alert(`Calculation failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Calculation failed. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDownloadPackage = async () => {
    setIsDownloading(true);
    
    try {
      const response = await fetch('/api/pcs/package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claimId: claim.id,
          includeDocuments: true
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Download failed');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PCS_Claim_${claim.claim_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Download error:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
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
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Icon name="Upload" className="w-5 h-5" />
              Upload Documents
            </button>
            <button 
              onClick={handleCalculateEntitlements}
              disabled={isCalculating}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="Calculator" className="w-5 h-5" />
              {isCalculating ? 'Calculating...' : 'Calculate Entitlements'}
            </button>
            <button 
              onClick={handleDownloadPackage}
              disabled={isDownloading}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="Download" className="w-5 h-5" />
              {isDownloading ? 'Generating...' : 'Download Package'}
            </button>
          </div>
        </div>
      </div>

      {/* Upload Documents Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Upload PCS Documents</h3>
            
            <div className="space-y-6">
              {/* Document Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Document Type
                </label>
                <select
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="orders">PCS Orders</option>
                  <option value="weigh_ticket">Weigh Ticket</option>
                  <option value="lodging_receipt">Lodging Receipt</option>
                  <option value="fuel_receipt">Fuel Receipt</option>
                  <option value="meal_receipt">Meal Receipt</option>
                  <option value="other">Other Document</option>
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Files
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.tiff"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <Icon name="Upload" className="w-12 h-12 text-gray-400" />
                    <div>
                      <p className="text-lg font-semibold text-slate-700">
                        Click to upload files
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, JPG, PNG, TIFF files accepted
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Selected Files:</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Icon name="File" className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-slate-700">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-slate-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
