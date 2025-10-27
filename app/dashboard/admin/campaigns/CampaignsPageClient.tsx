"use client";

import Link from "next/link";
import { useState } from "react";

import BulkAnnouncementModal from "@/app/components/admin/campaigns/BulkAnnouncementModal";
import TargetedCampaignModal from "@/app/components/admin/campaigns/TargetedCampaignModal";
import TestEmailModal from "@/app/components/admin/campaigns/TestEmailModal";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Icon from "@/app/components/ui/Icon";
import PageHeader from "@/app/components/ui/PageHeader";

export default function CampaignsPageClient() {
  const [showTestModal, setShowTestModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showTargetedModal, setShowTargetedModal] = useState(false);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/admin" className="text-text-muted hover:text-text-body">
                <Icon name="ChevronLeft" className="h-6 w-6" />
              </Link>
              <PageHeader
                title="Email Campaign Manager"
                subtitle="Manage automated sequences and send manual campaigns"
              />
            </div>
          </div>

          {/* Automated Sequences Status */}
          <AnimatedCard delay={0} className="mb-8">
            <h2 className="text-text-headings mb-6 text-2xl font-bold">
              Automated Email Sequences
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* 7-Day Onboarding */}
              <div className="rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="Mail" className="text-info h-8 w-8" />
                    <div>
                      <h3 className="text-lg font-bold text-primary">3-Email Onboarding</h3>
                      <p className="text-body text-sm">New user welcome sequence (over 7 days)</p>
                    </div>
                  </div>
                  <div className="bg-success-subtle rounded-full px-3 py-1 text-xs font-bold text-success">
                    ACTIVE
                  </div>
                </div>
                <div className="text-body space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Day 0: Welcome + 6 Free Calculators</span>
                    <Icon name="Check" className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex justify-between">
                    <span>Day 3: Base Navigator + LES Auditor</span>
                    <Icon name="Check" className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex justify-between">
                    <span>Day 7: Premium Upgrade (Soft Sell)</span>
                    <Icon name="Check" className="h-4 w-4 text-success" />
                  </div>
                </div>
                <div className="border-info mt-4 border-t pt-4">
                  <p className="text-body text-xs">
                    <strong>Status:</strong> Automated via cron (daily at 6am UTC)
                  </p>
                </div>
              </div>

              {/* Weekly Digest */}
              <div className="rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="Calendar" className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="text-lg font-bold text-primary">Weekly Digest</h3>
                      <p className="text-body text-sm">Every Sunday at 7pm UTC</p>
                    </div>
                  </div>
                  <div className="bg-success-subtle rounded-full px-3 py-1 text-xs font-bold text-success">
                    ACTIVE
                  </div>
                </div>
                <div className="text-body mb-4 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Icon name="Check" className="mt-0.5 h-4 w-4 text-purple-600" />
                    <span>Plan update notifications</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="Check" className="mt-0.5 h-4 w-4 text-purple-600" />
                    <span>New content highlights</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="Check" className="mt-0.5 h-4 w-4 text-purple-600" />
                    <span>Personalized recommendations</span>
                  </div>
                </div>
                <div className="mt-4 border-t border-purple-200 pt-4">
                  <p className="text-body text-xs">
                    <strong>Status:</strong> Configured in vercel.json. Runs automatically.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Manual Campaign Tools */}
          <AnimatedCard delay={200} className="mb-8">
            <h2 className="text-text-headings mb-6 text-2xl font-bold">Manual Campaign Tools</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <button
                onClick={() => setShowTestModal(true)}
                className="bg-surface border-info rounded-xl border-2 p-6 text-left transition-all hover:shadow-lg"
              >
                <Icon name="Send" className="text-info mb-3 h-8 w-8" />
                <h3 className="mb-2 font-bold text-primary">Send Test Email</h3>
                <p className="text-body text-sm">Preview email templates</p>
              </button>

              <button
                onClick={() => setShowBulkModal(true)}
                className="bg-surface rounded-xl border-2 border-success p-6 text-left transition-all hover:shadow-lg"
              >
                <Icon name="Users" className="mb-3 h-8 w-8 text-success" />
                <h3 className="mb-2 font-bold text-primary">Bulk Announcement</h3>
                <p className="text-body text-sm">Email all subscribers</p>
              </button>

              <button
                onClick={() => setShowTargetedModal(true)}
                className="bg-surface rounded-xl border-2 border-purple-200 p-6 text-left transition-all hover:shadow-lg"
              >
                <Icon name="Target" className="mb-3 h-8 w-8 text-purple-600" />
                <h3 className="mb-2 font-bold text-primary">Targeted Campaign</h3>
                <p className="text-body text-sm">Segment and send</p>
              </button>
            </div>
          </AnimatedCard>

          {/* Email Templates Library */}
          <AnimatedCard delay={300}>
            <h2 className="text-text-headings mb-6 text-2xl font-bold">
              Available Email Templates
            </h2>
            <div className="space-y-4">
              <div className="bg-surface-hover border-subtle rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-primary">onboarding_day_1</h4>
                    <p className="text-body text-sm">Welcome email + profile completion CTA</p>
                  </div>
                  <button
                    onClick={() => setShowTestModal(true)}
                    className="bg-info hover:bg-info rounded-lg px-4 py-2 text-sm font-semibold text-white"
                  >
                    Send Test
                  </button>
                </div>
              </div>

              <div className="bg-surface-hover border-subtle rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-primary">weekly_digest</h4>
                    <p className="text-body text-sm">Weekly plan updates and new content</p>
                  </div>
                  <button
                    onClick={() => setShowTestModal(true)}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                  >
                    Send Test
                  </button>
                </div>
              </div>

              <div className="bg-surface-hover border-subtle rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-primary">pcs_checklist_delivery</h4>
                    <p className="text-body text-sm">Free PCS checklist lead magnet</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-success-subtle rounded-full px-3 py-1 text-xs font-bold text-success">
                      NOW SENDING
                    </span>
                    <button
                      onClick={() => setShowTestModal(true)}
                      className="rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white hover:bg-success"
                    >
                      Send Test
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Setup Instructions */}
          <AnimatedCard delay={400} className="mt-8 border-2 border-green-200 bg-green-50">
            <div className="mb-4 flex items-center gap-3">
              <Icon name="CheckCircle" className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-bold text-primary">Email System Status: OPERATIONAL</h3>
            </div>
            <div className="text-body space-y-4 text-sm">
              <div>
                <h4 className="mb-2 font-semibold text-primary">Automated Sequences:</h4>
                <ul className="ml-4 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>
                      <strong>Weekly Digest:</strong> Configured in vercel.json (Sundays at 7pm UTC)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>
                      <strong>Onboarding Sequence:</strong> Automated via cron (daily at 6am UTC)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>
                      <strong>Lead Magnets:</strong> PCS Checklist now sends automatically
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-primary">Manual Campaign Options:</h4>
                <ul className="ml-4 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Test Email: Preview templates before sending</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Bulk Announcement: Email all subscribers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span>Targeted Campaigns: Segment by premium status, plan status</span>
                  </li>
                </ul>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
      <Footer />

      {/* Modals */}
      <TestEmailModal isOpen={showTestModal} onClose={() => setShowTestModal(false)} />
      <BulkAnnouncementModal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} />
      <TargetedCampaignModal
        isOpen={showTargetedModal}
        onClose={() => setShowTargetedModal(false)}
      />
    </>
  );
}
