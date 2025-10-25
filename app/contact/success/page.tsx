"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import Icon from "@/app/components/ui/Icon";

// Note: metadata cannot be exported from client components
// This page needs to be a client component due to the onClick handler for copying ticket ID

function ContactSuccessContent() {
  const searchParams = useSearchParams();
  const ticketId = searchParams?.get("ref") || "N/A";

  return (
    <>
      <div className="min-h-screen bg-[#0A0F1E] pb-16 pt-24 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Success Animation */}
          <div className="mb-8 text-center">
            <div className="mb-6 inline-block animate-fadeIn rounded-full bg-gradient-to-br from-[#00E5A0]/20 to-[#00CC8E]/20 p-6">
              <Icon name="CheckCircle" className="h-20 w-20 text-[#00E5A0]" />
            </div>

            <h1 className="mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-4xl font-bold text-transparent">
              Message Sent Successfully!
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-muted">
              Thank you for contacting us. We&apos;ve received your message and will respond as soon
              as possible.
            </p>
          </div>

          {/* Ticket Information */}
          <div className="mb-8 rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-lg">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-[#00E5A0]/10 p-3">
                <Icon name="ClipboardCheck" className="h-6 w-6 text-[#00E5A0]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Your Reference Number</h2>
                <p className="text-sm text-muted">Save this for your records</p>
              </div>
            </div>

            <div className="rounded-lg border border-[#2A2F3E] bg-[#0A0F1E] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-xs text-muted">Ticket ID</p>
                  <p className="font-mono text-2xl font-bold text-[#00E5A0]">{ticketId}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ticketId);
                    alert("Ticket ID copied to clipboard!");
                  }}
                  className="flex items-center gap-2 rounded-lg bg-[#2A2F3E] px-4 py-2 text-white transition-colors hover:bg-[#3A3F4E]"
                >
                  <Icon name="File" className="h-4 w-4" />
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-info/10 border-info/30 mt-6 rounded-lg border p-4">
              <p className="flex items-start gap-2 text-sm text-white/80">
                <Icon name="HelpCircle" className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  You&apos;ll receive a confirmation email shortly. Please check your spam folder if
                  you don&apos;t see it in your inbox.
                </span>
              </p>
            </div>
          </div>

          {/* What's Next */}
          <div className="mb-8 rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-lg">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
              <Icon name="Timer" className="h-6 w-6 text-[#00E5A0]" />
              What Happens Next?
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-lg bg-[#00E5A0]/10 p-2">
                  <span className="font-bold text-[#00E5A0]">1</span>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-white">We Review Your Message</h3>
                  <p className="text-sm text-muted">
                    Our team will review your inquiry and determine the best way to help.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-lg bg-[#00E5A0]/10 p-2">
                  <span className="font-bold text-[#00E5A0]">2</span>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-white">You&apos;ll Receive a Response</h3>
                  <p className="text-sm text-muted">
                    We&apos;ll email you directly with our response or ask for more information if
                    needed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-lg bg-[#00E5A0]/10 p-2">
                  <span className="font-bold text-[#00E5A0]">3</span>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-white">Issue Resolved</h3>
                  <p className="text-sm text-muted">
                    We&apos;ll work with you until your question is answered or issue is resolved.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[#2A2F3E] pt-6">
              <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
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
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="rounded-lg bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] px-6 py-3 text-center font-semibold text-[#0A0F1E] transition-all hover:scale-105 hover:shadow-lg"
            >
              Return to Homepage
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-[#2A2F3E] px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-[#3A3F4E]"
            >
              Go to Dashboard
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <p className="mb-4 text-sm text-muted">Need immediate assistance while you wait?</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link
                href="/dashboard/library"
                className="flex items-center gap-1 text-[#00E5A0] hover:underline"
              >
                <Icon name="Library" className="h-4 w-4" />
                Browse Help Articles
              </Link>
              <span className="text-body">•</span>
              <Link
                href="/pcs-hub"
                className="flex items-center gap-1 text-[#00E5A0] hover:underline"
              >
                <Icon name="BookOpen" className="h-4 w-4" />
                Resource Hubs
              </Link>
              <span className="text-body">•</span>
              <Link
                href="/dashboard/tools"
                className="flex items-center gap-1 text-[#00E5A0] hover:underline"
              >
                <Icon name="Calculator" className="h-4 w-4" />
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
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#0A0F1E] pb-16 pt-24 text-white">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#00E5A0]"></div>
          </div>
        }
      >
        <ContactSuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}
