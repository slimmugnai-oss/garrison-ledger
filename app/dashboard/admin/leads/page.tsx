import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Icon from '@/app/components/ui/Icon';
import PageHeader from '@/app/components/ui/PageHeader';
import AnimatedCard from '@/app/components/ui/AnimatedCard';

export const metadata: Metadata = {
  title: "Email Leads - Admin Dashboard",
  description: "Manage captured email leads and conversion tracking",
  robots: { index: false, follow: false },
};

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q']; // slimmugnai@gmail.com

async function getLeadMetrics() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Total leads
  const { count: totalLeads } = await supabase
    .from('email_leads')
    .select('*', { count: 'exact', head: true });

  // Leads this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const { count: leadsThisWeek } = await supabase
    .from('email_leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString());

  // Leads by source
  const { data: leadsBySource } = await supabase
    .from('email_leads')
    .select('source')
    .eq('status', 'subscribed');

  const sourceCounts = (leadsBySource || []).reduce((acc: Record<string, number>, lead) => {
    const source = lead.source || 'unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  // Recent leads
  const { data: recentLeads } = await supabase
    .from('email_leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  return {
    totalLeads: totalLeads || 0,
    leadsThisWeek: leadsThisWeek || 0,
    sourceCounts,
    recentLeads: recentLeads || []
  };
}

export default async function AdminLeadsPage() {
  const user = await currentUser();
  
  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    redirect('/dashboard');
  }

  const metrics = await getLeadMetrics();

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
              title="Email Leads Manager" 
              subtitle="Track and manage captured email leads from exit-intent and lead magnets"
            />
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <AnimatedCard delay={0} className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="Mail" className="h-8 w-8" />
                <div className="text-right">
                  <div className="text-3xl font-black">{metrics.totalLeads}</div>
                  <div className="text-sm opacity-90">Total Leads</div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={100} className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="TrendingUp" className="h-8 w-8" />
                <div className="text-right">
                  <div className="text-3xl font-black">{metrics.leadsThisWeek}</div>
                  <div className="text-sm opacity-90">This Week</div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={200} className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="Target" className="h-8 w-8" />
                <div className="text-right">
                  <div className="text-3xl font-black">
                    {metrics.totalLeads > 0 ? Math.round((metrics.leadsThisWeek / 7) * 30) : 0}
                  </div>
                  <div className="text-sm opacity-90">Projected Monthly</div>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Leads by Source */}
          <AnimatedCard delay={300} className="mb-8">
            <h2 className="text-2xl font-bold text-text-headings mb-6">Leads by Source</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(metrics.sourceCounts).map(([source, count]) => (
                <div key={source} className="bg-surface-hover border border-subtle rounded-lg p-4">
                  <div className="text-sm font-semibold text-body capitalize mb-1">
                    {source.replace('_', ' ')}
                  </div>
                  <div className="text-2xl font-black text-primary">{count as number}</div>
                </div>
              ))}
            </div>
          </AnimatedCard>

          {/* Recent Leads Table */}
          <AnimatedCard delay={400}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-headings">Recent Leads</h2>
              <Link
                href="/api/admin/export-leads"
                className="inline-flex items-center gap-2 px-4 py-2 bg-info hover:bg-info text-white rounded-lg font-semibold transition-all"
              >
                <Icon name="Download" className="w-4 h-4" />
                Export CSV
              </Link>
            </div>

            {metrics.recentLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-subtle">
                      <th className="text-left py-3 px-4 text-sm font-bold text-body">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-body">Source</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-body">Lead Magnet</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-body">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-body">Captured</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recentLeads.map((lead: { id: string; email: string; source: string; lead_magnet: string | null; status: string; created_at: string }) => (
                      <tr key={lead.id} className="border-b border-subtle hover:bg-surface-hover">
                        <td className="py-3 px-4 text-sm font-medium text-primary">
                          {lead.email}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 bg-info-subtle text-info text-xs font-semibold rounded-full capitalize">
                            {(lead.source || 'unknown').replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-body capitalize">
                          {lead.lead_magnet ? lead.lead_magnet.replace('_', ' ') : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            lead.status === 'subscribed' ? 'bg-green-100 text-green-700' :
                            lead.status === 'unsubscribed' ? 'bg-gray-100 text-gray-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-body">
                          {new Date(lead.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="Mail" className="h-16 w-16 text-muted mx-auto mb-4" />
                <p className="text-body">No email leads captured yet</p>
                <p className="text-sm text-muted mt-2">Exit-intent popup will start capturing leads once deployed</p>
              </div>
            )}
          </AnimatedCard>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatedCard delay={500} className="bg-info-subtle border-2 border-info p-6">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Icon name="Lightbulb" className="h-5 w-5 text-info" />
                Lead Capture Tips
              </h3>
              <ul className="space-y-2 text-sm text-body">
                <li className="flex items-start gap-2">
                  <span className="text-info mt-0.5">•</span>
                  <span>Exit-intent popup triggers after 3 seconds on homepage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-info mt-0.5">•</span>
                  <span>Each visitor only sees popup once (localStorage)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-info mt-0.5">•</span>
                  <span>Test in incognito mode to see it again</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-info mt-0.5">•</span>
                  <span>Leads auto-receive PCS checklist via email</span>
                </li>
              </ul>
            </AnimatedCard>

            <AnimatedCard delay={600} className="bg-success-subtle border-2 border-success p-6">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Icon name="Target" className="h-5 w-5 text-success" />
                Conversion Goals
              </h3>
              <ul className="space-y-2 text-sm text-body">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">•</span>
                  <span><strong>Target:</strong> 5-10% of visitors capture</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">•</span>
                  <span><strong>Goal:</strong> 300-600 leads/month (1,000 visitors)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">•</span>
                  <span><strong>Email → Signup:</strong> Target 10-15% conversion</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">•</span>
                  <span><strong>ROI:</strong> Each lead worth ~$5-10 LTV</span>
                </li>
              </ul>
            </AnimatedCard>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

