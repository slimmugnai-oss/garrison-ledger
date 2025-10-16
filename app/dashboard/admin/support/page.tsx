import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Icon from '@/app/components/ui/Icon';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Badge from '@/app/components/ui/Badge';
import PageHeader from '@/app/components/ui/PageHeader';

export const metadata: Metadata = {
  title: "Support Tickets - Admin Dashboard",
  description: "Manage contact submissions and user support",
  robots: { index: false, follow: false },
};

const ADMIN_USER_IDS = ['user_2r5JqYQZ8kX9wL2mN3pT4vU6'];

interface Ticket {
  id: string;
  ticket_id: string;
  name: string;
  email: string;
  subject: string;
  urgency: string;
  message: string;
  status: string;
  variant: string;
  created_at: string;
}

async function getTickets(): Promise<Ticket[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: tickets } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (tickets as Ticket[]) || [];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'new':
      return <Badge variant="warning">New</Badge>;
    case 'in_progress':
      return <Badge variant="primary">In Progress</Badge>;
    case 'resolved':
      return <Badge variant="success">Resolved</Badge>;
    case 'closed':
      return <Badge variant="secondary">Closed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getUrgencyBadge = (urgency: string) => {
  switch (urgency) {
    case 'high':
      return <span className="px-2 py-1 bg-red-100 text-red-800 border border-red-200 rounded text-xs font-bold">HIGH</span>;
    case 'medium':
      return <span className="px-2 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded text-xs font-bold">MEDIUM</span>;
    case 'low':
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded text-xs font-bold">LOW</span>;
    default:
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded text-xs font-bold">{urgency}</span>;
  }
};

export default async function SupportTicketsPage() {
  const user = await currentUser();
  
  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    redirect('/dashboard');
  }

  const tickets = await getTickets();
  const newTickets = tickets.filter(t => t.status === 'new');
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress');

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <Link href="/dashboard/admin" className="text-text-muted hover:text-text-body">
              <Icon name="ArrowLeft" className="h-6 w-6" />
            </Link>
            <PageHeader 
              title="Support Tickets" 
              subtitle="Manage contact submissions and user support requests"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <AnimatedCard className="bg-card border border-border p-6">
              <div className="text-text-muted text-sm font-semibold mb-2">Total Tickets</div>
              <div className="text-3xl font-black text-text-headings">{tickets.length}</div>
            </AnimatedCard>

            <AnimatedCard className="bg-card border-2 border-amber-200 bg-amber-50 p-6" delay={25}>
              <div className="text-amber-700 text-sm font-semibold mb-2">New</div>
              <div className="text-3xl font-black text-amber-600">{newTickets.length}</div>
              <div className="text-xs text-amber-600 mt-1">Requires attention</div>
            </AnimatedCard>

            <AnimatedCard className="bg-card border border-border p-6" delay={50}>
              <div className="text-text-muted text-sm font-semibold mb-2">In Progress</div>
              <div className="text-3xl font-black text-blue-600">{inProgressTickets.length}</div>
            </AnimatedCard>

            <AnimatedCard className="bg-card border border-border p-6" delay={75}>
              <div className="text-text-muted text-sm font-semibold mb-2">Avg Response</div>
              <div className="text-3xl font-black text-green-600">&lt; 24h</div>
            </AnimatedCard>
          </div>

          {/* Tickets List */}
          <AnimatedCard className="bg-card border border-border p-6" delay={100}>
            <h2 className="text-2xl font-serif font-black text-text-headings mb-6">All Tickets</h2>
            {tickets.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <Icon name="MessageSquare" className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No support tickets yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm font-bold text-primary">
                            {ticket.ticket_id}
                          </span>
                          {getStatusBadge(ticket.status)}
                          {getUrgencyBadge(ticket.urgency)}
                          {ticket.variant === 'dashboard' && (
                            <Badge variant="primary">Premium</Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-text-headings mb-1">
                          {ticket.subject ? ticket.subject.charAt(0).toUpperCase() + ticket.subject.slice(1) : 'General Inquiry'}
                        </h3>
                        <div className="text-sm text-text-muted mb-2">
                          From: <span className="font-semibold">{ticket.name}</span> ({ticket.email})
                        </div>
                        <p className="text-text-body">{ticket.message}</p>
                      </div>
                      <div className="text-right text-sm text-text-muted ml-4">
                        {new Date(ticket.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <a
                        href={`mailto:${ticket.email}?subject=Re: ${ticket.ticket_id} - ${ticket.subject}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Icon name="Mail" className="h-4 w-4" />
                        Reply via Email
                      </a>
                      <button className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-text-body hover:bg-gray-50 transition-colors">
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnimatedCard>

          {/* Help Resources */}
          <AnimatedCard className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 mt-8" delay={150}>
            <h3 className="text-xl font-bold text-text-headings mb-4">Support Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-text-body mb-2">Common Issues & Solutions:</h4>
                <ul className="text-sm text-text-muted space-y-1">
                  <li>• <strong>Can&apos;t generate plan:</strong> Check profile completion</li>
                  <li>• <strong>Premium not working:</strong> Verify Stripe subscription</li>
                  <li>• <strong>Binder upload fails:</strong> Check file size limits</li>
                  <li>• <strong>Assessment broken:</strong> Check browser console</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-text-body mb-2">Response Time Targets:</h4>
                <ul className="text-sm text-text-muted space-y-1">
                  <li>• <strong>High Priority:</strong> &lt; 4 hours</li>
                  <li>• <strong>Medium Priority:</strong> &lt; 24 hours</li>
                  <li>• <strong>Low Priority:</strong> &lt; 48 hours</li>
                  <li>• <strong>Weekend/Holiday:</strong> Next business day</li>
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

