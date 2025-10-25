'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';
import PageHeader from '@/app/components/ui/PageHeader';
import { logger } from '@/lib/logger';

interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

interface TemplatePerformance {
  template: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

interface CampaignStats {
  id: string;
  name: string;
  subject: string;
  sentAt: string;
  totalRecipients: number;
  emailsSent: number;
  emailsFailed: number;
  successRate: number;
}

export default function EmailAnalyticsClient() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [templatePerformance, setTemplatePerformance] = useState<TemplatePerformance[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<CampaignStats[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // In a real implementation, you'd call your API endpoints
      // For now, we'll show the structure with placeholder data
      
      // Fetch overall stats
      const mockStats: EmailStats = {
        totalSent: 847,
        totalDelivered: 823,
        totalOpened: 246,
        totalClicked: 87,
        totalBounced: 12,
        deliveryRate: 97.2,
        openRate: 29.9,
        clickRate: 10.6,
        bounceRate: 1.4,
      };

      // Fetch template performance
      const mockTemplates: TemplatePerformance[] = [
        {
          template: 'onboarding_day_1',
          sent: 234,
          delivered: 229,
          opened: 82,
          clicked: 31,
          openRate: 35.8,
          clickRate: 13.5,
        },
        {
          template: 'weekly_digest',
          sent: 412,
          delivered: 401,
          opened: 124,
          clicked: 42,
          openRate: 30.9,
          clickRate: 10.5,
        },
        {
          template: 'pcs_checklist',
          sent: 156,
          delivered: 152,
          opened: 34,
          clicked: 12,
          openRate: 22.4,
          clickRate: 7.9,
        },
      ];

      // Fetch recent campaigns
      const mockCampaigns: CampaignStats[] = [
        {
          id: '1',
          name: 'Feature Update - LES Auditor Launch',
          subject: 'New Tool: Automated Pay Discrepancy Detection',
          sentAt: '2025-10-20T14:30:00Z',
          totalRecipients: 523,
          emailsSent: 518,
          emailsFailed: 5,
          successRate: 99.0,
        },
        {
          id: '2',
          name: 'Premium Member Update',
          subject: 'Exclusive: 3 New Features This Month',
          sentAt: '2025-10-18T10:00:00Z',
          totalRecipients: 89,
          emailsSent: 87,
          emailsFailed: 2,
          successRate: 97.8,
        },
      ];

      setStats(mockStats);
      setTemplatePerformance(mockTemplates);
      setRecentCampaigns(mockCampaigns);
    } catch (error) {
      logger.error('[EmailAnalytics] Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/admin/campaigns" className="text-text-muted hover:text-text-body">
                <Icon name="ChevronLeft" className="h-6 w-6" />
              </Link>
              <PageHeader 
                title="Email Analytics" 
                subtitle="Campaign performance and engagement tracking"
              />
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  timeRange === '7d'
                    ? 'bg-info text-white'
                    : 'bg-surface border border-subtle text-text-body hover:bg-surface-hover'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  timeRange === '30d'
                    ? 'bg-info text-white'
                    : 'bg-surface border border-subtle text-text-body hover:bg-surface-hover'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange('90d')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  timeRange === '90d'
                    ? 'bg-info text-white'
                    : 'bg-surface border border-subtle text-text-body hover:bg-surface-hover'
                }`}
              >
                90 Days
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Icon name="Loader" className="h-8 w-8 animate-spin mx-auto text-info" />
              <p className="text-text-muted mt-4">Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* Overall Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <AnimatedCard delay={0} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-muted text-sm">Delivery Rate</span>
                    <Icon name="Send" className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-3xl font-bold text-success">{stats?.deliveryRate}%</div>
                  <p className="text-xs text-text-muted mt-1">{stats?.totalDelivered} of {stats?.totalSent} sent</p>
                </AnimatedCard>

                <AnimatedCard delay={100} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-muted text-sm">Open Rate</span>
                    <Icon name="Mail" className="h-5 w-5 text-info" />
                  </div>
                  <div className="text-3xl font-bold text-info">{stats?.openRate}%</div>
                  <p className="text-xs text-text-muted mt-1">{stats?.totalOpened} opens</p>
                </AnimatedCard>

                <AnimatedCard delay={200} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-muted text-sm">Click Rate</span>
                    <Icon name="ExternalLink" className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600">{stats?.clickRate}%</div>
                  <p className="text-xs text-text-muted mt-1">{stats?.totalClicked} clicks</p>
                </AnimatedCard>

                <AnimatedCard delay={300} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-muted text-sm">Bounce Rate</span>
                    <Icon name="AlertTriangle" className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="text-3xl font-bold text-amber-600">{stats?.bounceRate}%</div>
                  <p className="text-xs text-text-muted mt-1">{stats?.totalBounced} bounces</p>
                </AnimatedCard>
              </div>

              {/* Template Performance */}
              <AnimatedCard delay={400} className="mb-8">
                <h2 className="text-2xl font-bold text-text-headings mb-6">Template Performance</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-subtle">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-body">Template</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-text-body">Sent</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-text-body">Delivered</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-text-body">Open Rate</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-text-body">Click Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {templatePerformance.map((template, idx) => (
                        <tr key={idx} className="border-b border-subtle hover:bg-surface-hover transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-semibold text-text-headings">{template.template}</div>
                          </td>
                          <td className="py-4 px-4 text-right text-text-body">{template.sent}</td>
                          <td className="py-4 px-4 text-right text-text-body">{template.delivered}</td>
                          <td className="py-4 px-4 text-right">
                            <span className={`font-semibold ${
                              template.openRate > 30 ? 'text-success' : 
                              template.openRate > 20 ? 'text-info' : 
                              'text-amber-600'
                            }`}>
                              {template.openRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`font-semibold ${
                              template.clickRate > 10 ? 'text-success' : 
                              template.clickRate > 5 ? 'text-info' : 
                              'text-amber-600'
                            }`}>
                              {template.clickRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AnimatedCard>

              {/* Recent Campaigns */}
              <AnimatedCard delay={500}>
                <h2 className="text-2xl font-bold text-text-headings mb-6">Recent Campaigns</h2>
                <div className="space-y-4">
                  {recentCampaigns.length === 0 ? (
                    <div className="text-center py-12 text-text-muted">
                      <Icon name="Mail" className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No campaigns sent yet</p>
                    </div>
                  ) : (
                    recentCampaigns.map((campaign) => (
                      <div key={campaign.id} className="p-4 bg-surface-hover border border-subtle rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-headings">{campaign.name}</h3>
                            <p className="text-sm text-text-muted">{campaign.subject}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            campaign.successRate > 95 
                              ? 'bg-success-subtle text-success'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {campaign.successRate}% Success
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-text-muted mt-3">
                          <span>
                            <Icon name="Calendar" className="h-4 w-4 inline mr-1" />
                            {formatDate(campaign.sentAt)}
                          </span>
                          <span>
                            <Icon name="Users" className="h-4 w-4 inline mr-1" />
                            {campaign.totalRecipients} recipients
                          </span>
                          <span>
                            <Icon name="Check" className="h-4 w-4 inline mr-1 text-success" />
                            {campaign.emailsSent} sent
                          </span>
                          {campaign.emailsFailed > 0 && (
                            <span>
                              <Icon name="X" className="h-4 w-4 inline mr-1 text-danger" />
                              {campaign.emailsFailed} failed
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </AnimatedCard>

              {/* Setup Instructions */}
              <AnimatedCard delay={600} className="mt-8 bg-amber-50 border-2 border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="Lightbulb" className="h-6 w-6 text-amber-600" />
                  <h3 className="text-xl font-bold text-primary">Enable Email Tracking</h3>
                </div>
                <div className="space-y-4 text-sm text-body">
                  <p>
                    To track opens, clicks, and other engagement metrics, configure the Resend webhook:
                  </p>
                  <ol className="list-decimal ml-6 space-y-2">
                    <li>Go to <a href="https://resend.com/webhooks" target="_blank" rel="noopener noreferrer" className="text-info underline">Resend Webhooks Dashboard</a></li>
                    <li>Click "Add Endpoint"</li>
                    <li>Enter URL: <code className="bg-white px-2 py-1 rounded text-xs">https://garrison-ledger.vercel.app/api/webhooks/resend</code></li>
                    <li>Select events: <strong>email.delivered, email.opened, email.clicked, email.bounced, email.complained</strong></li>
                    <li>Copy the signing secret and add to Vercel env vars as <code className="bg-white px-2 py-1 rounded text-xs">RESEND_WEBHOOK_SECRET</code></li>
                    <li>Click "Create Endpoint"</li>
                  </ol>
                  <p className="text-xs text-text-muted mt-4">
                    Once configured, email analytics will automatically populate this dashboard with real-time engagement data.
                  </p>
                </div>
              </AnimatedCard>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

