import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Icon from '@/app/components/ui/Icon';
import PageHeader from '@/app/components/ui/PageHeader';
import AnimatedCard from '@/app/components/ui/AnimatedCard';

export const metadata: Metadata = {
  title: "Email Campaigns - Admin Dashboard",
  description: "Manage email automation, sequences, and manual campaigns",
  robots: { index: false, follow: false },
};

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q']; // slimmugnai@gmail.com

export default async function AdminCampaignsPage() {
  const user = await currentUser();
  
  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    redirect('/dashboard');
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <Link href="/dashboard/admin" className="text-text-muted hover:text-text-body">
              <Icon name="ChevronLeft" className="h-6 w-6" />
            </Link>
            <PageHeader 
              title="Email Campaign Manager" 
              subtitle="Manage automated sequences and send manual campaigns"
            />
          </div>

          {/* Automated Sequences Status */}
          <AnimatedCard delay={0} className="mb-8">
            <h2 className="text-2xl font-bold text-text-headings mb-6">Automated Email Sequences</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* 7-Day Onboarding */}
              <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon name="Mail" className="h-8 w-8 text-info" />
                    <div>
                      <h3 className="text-lg font-bold text-primary">7-Day Onboarding</h3>
                      <p className="text-sm text-body">New user welcome sequence</p>
                    </div>
                  </div>
                  <div className="bg-success-subtle text-success px-3 py-1 rounded-full text-xs font-bold">
                    READY
                  </div>
                </div>
                <div className="space-y-2 text-sm text-body">
                  <div className="flex justify-between">
                    <span>Day 1: Welcome + Profile CTA</span>
                    <Icon name="Check" className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex justify-between">
                    <span>Day 2: Assessment Preview</span>
                    <Icon name="Check" className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex justify-between">
                    <span>Day 3: Success Story</span>
                    <Icon name="Check" className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex justify-between">
                    <span>Day 5: Free Tools Showcase</span>
                    <Icon name="Check" className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex justify-between">
                    <span>Day 7: Premium Upgrade</span>
                    <Icon name="Check" className="h-4 w-4 text-success" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-info">
                  <p className="text-xs text-body">
                    <strong>Status:</strong> Templates ready. Requires cron job or manual triggering.
                  </p>
                </div>
              </div>

              {/* Weekly Digest */}
              <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon name="Calendar" className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="text-lg font-bold text-primary">Weekly Digest</h3>
                      <p className="text-sm text-body">Every Sunday at 7pm UTC</p>
                    </div>
                  </div>
                  <div className="bg-success-subtle text-success px-3 py-1 rounded-full text-xs font-bold">
                    ACTIVE
                  </div>
                </div>
                <div className="space-y-2 text-sm text-body mb-4">
                  <div className="flex items-start gap-2">
                    <Icon name="Check" className="h-4 w-4 text-purple-600 mt-0.5" />
                    <span>Plan update notifications</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="Check" className="h-4 w-4 text-purple-600 mt-0.5" />
                    <span>New content highlights</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="Check" className="h-4 w-4 text-purple-600 mt-0.5" />
                    <span>Personalized recommendations</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <p className="text-xs text-body">
                    <strong>Status:</strong> Configured in vercel.json. Runs automatically.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Manual Campaign Tools */}
          <AnimatedCard delay={200} className="mb-8">
            <h2 className="text-2xl font-bold text-text-headings mb-6">Manual Campaign Tools</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button className="p-6 bg-surface border-2 border-info rounded-xl hover:shadow-lg transition-all text-left">
                <Icon name="Send" className="h-8 w-8 text-info mb-3" />
                <h3 className="font-bold text-primary mb-2">Send Test Email</h3>
                <p className="text-sm text-body">Preview email templates</p>
              </button>

              <button className="p-6 bg-surface border-2 border-success rounded-xl hover:shadow-lg transition-all text-left">
                <Icon name="Users" className="h-8 w-8 text-success mb-3" />
                <h3 className="font-bold text-primary mb-2">Bulk Announcement</h3>
                <p className="text-sm text-body">Email all subscribers</p>
              </button>

              <button className="p-6 bg-surface border-2 border-purple-200 rounded-xl hover:shadow-lg transition-all text-left">
                <Icon name="Target" className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="font-bold text-primary mb-2">Targeted Campaign</h3>
                <p className="text-sm text-body">Segment and send</p>
              </button>
            </div>
          </AnimatedCard>

          {/* Email Templates Library */}
          <AnimatedCard delay={300}>
            <h2 className="text-2xl font-bold text-text-headings mb-6">Available Email Templates</h2>
            <div className="space-y-4">
              <div className="p-4 bg-surface-hover border border-subtle rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-primary">onboarding_day_1</h4>
                    <p className="text-sm text-body">Welcome email + profile completion CTA</p>
                  </div>
                  <Link
                    href="/api/emails/onboarding"
                    className="px-4 py-2 bg-info hover:bg-info text-white rounded-lg text-sm font-semibold"
                  >
                    View Template
                  </Link>
                </div>
              </div>

              <div className="p-4 bg-surface-hover border border-subtle rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-primary">weekly_digest</h4>
                    <p className="text-sm text-body">Weekly plan updates and new content</p>
                  </div>
                  <Link
                    href="/api/emails/weekly-digest"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold"
                  >
                    View Template
                  </Link>
                </div>
              </div>

              <div className="p-4 bg-surface-hover border border-subtle rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-primary">pcs_checklist_delivery</h4>
                    <p className="text-sm text-body">Free PCS checklist lead magnet</p>
                  </div>
                  <Link
                    href="/api/lead-magnets/pcs-checklist"
                    className="px-4 py-2 bg-success hover:bg-success text-white rounded-lg text-sm font-semibold"
                  >
                    View Checklist
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Setup Instructions */}
          <AnimatedCard delay={400} className="mt-8 bg-amber-50 border-2 border-amber-200">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="Lightbulb" className="h-6 w-6 text-amber-600" />
              <h3 className="text-xl font-bold text-primary">Email Automation Setup</h3>
            </div>
            <div className="space-y-4 text-sm text-body">
              <div>
                <h4 className="font-semibold text-primary mb-2">Automated Sequences:</h4>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span><strong>Weekly Digest:</strong> Configured in vercel.json (runs automatically)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">⚠</span>
                    <span><strong>Onboarding Sequence:</strong> Requires external cron or manual triggering</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Manual Campaign Options:</h4>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-info">•</span>
                    <span>Use Resend Dashboard to send one-off campaigns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-info">•</span>
                    <span>Export leads from /admin/leads and import to email service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-info">•</span>
                    <span>Future enhancement: In-app email composer</span>
                  </li>
                </ul>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
      <Footer />
    </>
  );
}

