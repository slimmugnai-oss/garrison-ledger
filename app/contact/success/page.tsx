'use client';

import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Icon from '@/app/components/ui/Icon';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Note: metadata cannot be exported from client components
// This page needs to be a client component due to the onClick handler for copying ticket ID

function ContactSuccessContent() {
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('ref') || 'N/A';

  return (
    <>
      <div className="min-h-screen bg-[#0A0F1E] text-white pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="inline-block p-6 bg-gradient-to-br from-[#00E5A0]/20 to-[#00CC8E]/20 rounded-full mb-6 animate-fadeIn">
              <Icon name="CheckCircle" className="w-20 h-20 text-[#00E5A0]" />
            </div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Message Sent Successfully!
            </h1>
            
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Thank you for contacting us. We&apos;ve received your message and will respond as soon as possible.
            </p>
          </div>

          {/* Ticket Information */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-8 shadow-lg mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#00E5A0]/10 p-3 rounded-lg">
                <Icon name="ClipboardCheck" className="w-6 h-6 text-[#00E5A0]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Your Reference Number</h2>
                <p className="text-sm text-muted">Save this for your records</p>
              </div>
            </div>

            <div className="bg-[#0A0F1E] rounded-lg p-4 border border-[#2A2F3E]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted mb-1">Ticket ID</p>
                  <p className="text-2xl font-mono font-bold text-[#00E5A0]">{ticketId}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ticketId);
                    alert('Ticket ID copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-[#2A2F3E] hover:bg-[#3A3F4E] rounded-lg transition-colors flex items-center gap-2 text-white"
                >
                  <Icon name="File" className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-info/10 border border-info/30 rounded-lg">
              <p className="text-sm text-white/80 flex items-start gap-2">
                <Icon name="HelpCircle" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  You&apos;ll receive a confirmation email shortly. Please check your spam folder if you don&apos;t see it in your inbox.
                </span>
              </p>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-8 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Icon name="Timer" className="w-6 h-6 text-[#00E5A0]" />
              What Happens Next?
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-[#00E5A0]/10 p-2 rounded-lg flex-shrink-0">
                  <span className="text-[#00E5A0] font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">We Review Your Message</h3>
                  <p className="text-sm text-muted">
                    Our team will review your inquiry and determine the best way to help.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#00E5A0]/10 p-2 rounded-lg flex-shrink-0">
                  <span className="text-[#00E5A0] font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">You&apos;ll Receive a Response</h3>
                  <p className="text-sm text-muted">
                    We&apos;ll email you directly with our response or ask for more information if needed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#00E5A0]/10 p-2 rounded-lg flex-shrink-0">
                  <span className="text-[#00E5A0] font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Issue Resolved</h3>
                  <p className="text-sm text-muted">
                    We&apos;ll work with you until your question is answered or issue is resolved.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#2A2F3E]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-[#00E5A0]">24-48h</p>
                  <p className="text-xs text-muted">General Inquiries</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#00E5A0]">12-24h</p>
                  <p className="text-xs text-muted">Technical Support</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#00E5A0]">4-12h</p>
                  <p className="text-xs text-muted">Urgent Issues</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#0A0F1E] rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all text-center"
            >
              Return to Homepage
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-[#2A2F3E] text-white rounded-lg font-semibold hover:bg-[#3A3F4E] transition-colors text-center"
            >
              Go to Dashboard
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted mb-4">
              Need immediate assistance while you wait?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="/dashboard/library" className="text-[#00E5A0] hover:underline flex items-center gap-1">
                <Icon name="Library" className="w-4 h-4" />
                Browse Help Articles
              </Link>
              <span className="text-body">•</span>
              <Link href="/pcs-hub" className="text-[#00E5A0] hover:underline flex items-center gap-1">
                <Icon name="BookOpen" className="w-4 h-4" />
                Resource Hubs
              </Link>
              <span className="text-body">•</span>
              <Link href="/dashboard/tools" className="text-[#00E5A0] hover:underline flex items-center gap-1">
                <Icon name="Calculator" className="w-4 h-4" />
                Calculator Tools
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ContactSuccessPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="min-h-screen bg-[#0A0F1E] text-white pt-24 pb-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5A0]"></div>
        </div>
      }>
        <ContactSuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}

