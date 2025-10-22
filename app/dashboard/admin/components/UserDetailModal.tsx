'use client';

import { useState, useEffect } from 'react';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';
import AnimatedCard from '@/app/components/ui/AnimatedCard';

interface UserDetails {
  profile: {
    user_id: string;
    rank: string | null;
    branch: string | null;
    current_base: string | null;
    marital_status: string | null;
    num_children: number;
    created_at: string;
    profile_completed: boolean;
  };
  entitlement: {
    tier: string;
    status: string;
    current_period_end: string | null;
    stripe_subscription_id: string | null;
  };
  gamification: {
    current_streak: number;
    longest_streak: number;
    total_logins: number;
    badges: string[];
  };
  activity: Array<{
    event_name: string;
    properties: Record<string, unknown>;
    created_at: string;
  }>;
  tickets: Array<{
    id: string;
    ticket_id: string;
    subject: string;
    status: string;
    created_at: string;
  }>;
  lesAudits: Array<{
    id: string;
    month: number;
    year: number;
    uploaded_at: string;
    parsed_ok: boolean;
  }>;
}

interface UserDetailModalProps {
  userId: string;
  onClose: () => void;
}

export default function UserDetailModal({ userId, onClose }: UserDetailModalProps) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error('Failed to load user');
      const data = await res.json();
      setUserDetails(data);
    } catch (error) {
      console.error('Error loading user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustTier = async (tier: string, duration?: number) => {
    if (!confirm(`Change user tier to ${tier.toUpperCase()}?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/entitlement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, reason: 'Admin adjustment', duration }),
      });

      if (!res.ok) throw new Error('Failed to adjust tier');

      alert(`✅ User tier adjusted to ${tier.toUpperCase()}`);
      await loadUserDetails();
    } catch (error) {
      alert('Failed to adjust tier');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (suspended: boolean) => {
    if (!confirm(suspended ? 'Suspend this user?' : 'Unsuspend this user?')) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended, reason: 'Admin action' }),
      });

      if (!res.ok) throw new Error('Failed to suspend user');

      alert(suspended ? '✅ User suspended' : '✅ User unsuspended');
      await loadUserDetails();
    } catch (error) {
      alert('Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !userDetails) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-xl p-12 text-center">
          <div className="animate-spin mb-4">
            <Icon name="Activity" className="h-8 w-8 text-primary mx-auto" />
          </div>
          <p className="text-text-muted">Loading user details...</p>
        </div>
      </div>
    );
  }

  const { profile, entitlement, gamification, activity, tickets, lesAudits } = userDetails;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-headings mb-1">User Details</h2>
            <p className="text-sm text-text-muted font-mono">{userId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-body transition-colors"
          >
            <Icon name="X" className="h-6 w-6" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-6 border-b border-border bg-surface-hover">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleAdjustTier('premium', 30)}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Icon name="Crown" className="h-4 w-4" />
              Grant 30-Day Premium
            </button>
            <button
              onClick={() => handleAdjustTier('free')}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              <Icon name="ChevronDown" className="h-4 w-4" />
              Downgrade to Free
            </button>
            <button
              onClick={() => handleSuspend(entitlement.status !== 'canceled')}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Icon name="Ban" className="h-4 w-4" />
              {entitlement.status === 'canceled' ? 'Unsuspend' : 'Suspend'}
            </button>
            <button
              onClick={() => window.open(`mailto:${profile.user_id}@example.com`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Icon name="Mail" className="h-4 w-4" />
              Send Email
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex px-6 space-x-4">
            {[
              { id: 'profile', label: 'Profile', icon: 'User' as const },
              { id: 'activity', label: 'Activity', icon: 'Activity' as const },
              { id: 'payments', label: 'Payments', icon: 'DollarSign' as const },
              { id: 'support', label: 'Support', icon: 'MessageSquare' as const },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-body'
                  }
                `}
              >
                <Icon name={tab.icon} className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <AnimatedCard className="p-4">
                  <h3 className="font-semibold text-text-headings mb-3">Basic Info</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Rank:</dt>
                      <dd className="font-semibold">{profile.rank || 'Not set'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Branch:</dt>
                      <dd className="font-semibold">{profile.branch || 'Not set'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Base:</dt>
                      <dd className="font-semibold">{profile.current_base || 'Not set'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Marital Status:</dt>
                      <dd className="font-semibold">{profile.marital_status || 'Not set'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Children:</dt>
                      <dd className="font-semibold">{profile.num_children || 0}</dd>
                    </div>
                  </dl>
                </AnimatedCard>

                <AnimatedCard className="p-4" delay={50}>
                  <h3 className="font-semibold text-text-headings mb-3">Account</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Tier:</dt>
                      <dd>
                        <Badge variant={entitlement.tier === 'premium' ? 'success' : 'secondary'}>
                          {entitlement.tier.toUpperCase()}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Status:</dt>
                      <dd>
                        <Badge variant={entitlement.status === 'active' ? 'success' : 'secondary'}>
                          {entitlement.status.toUpperCase()}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Joined:</dt>
                      <dd className="font-semibold">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Profile:</dt>
                      <dd>
                        <Badge variant={profile.profile_completed ? 'success' : 'warning'}>
                          {profile.profile_completed ? 'Complete' : 'Incomplete'}
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                </AnimatedCard>
              </div>

              <AnimatedCard className="p-4" delay={100}>
                <h3 className="font-semibold text-text-headings mb-3">Engagement</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-black text-orange-600">{gamification.current_streak}</div>
                    <div className="text-xs text-text-muted">Current Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-primary">{gamification.longest_streak}</div>
                    <div className="text-xs text-text-muted">Longest Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-info">{gamification.total_logins}</div>
                    <div className="text-xs text-text-muted">Total Logins</div>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="p-4" delay={150}>
                <h3 className="font-semibold text-text-headings mb-3">LES Auditor Usage</h3>
                {lesAudits.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-4">No LES audits yet</p>
                ) : (
                  <div className="space-y-2">
                    {lesAudits.map((audit) => (
                      <div key={audit.id} className="flex items-center justify-between p-3 bg-surface-hover rounded-lg border border-border">
                        <div>
                          <p className="text-sm font-semibold">
                            {new Date(2000, audit.month - 1).toLocaleDateString('en-US', { month: 'short' })} {audit.year}
                          </p>
                          <p className="text-xs text-text-muted">
                            {new Date(audit.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={audit.parsed_ok ? 'success' : 'warning'}>
                          {audit.parsed_ok ? 'Parsed' : 'Failed'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </AnimatedCard>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-3">
              {activity.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <Icon name="Activity" className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                activity.map((event, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-surface-hover rounded-lg border border-border">
                    <Icon name="Activity" className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-body">{event.event_name}</p>
                      <p className="text-xs text-text-muted mt-1">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <AnimatedCard className="p-4">
                <h3 className="font-semibold text-text-headings mb-3">Subscription</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Current Tier:</dt>
                    <dd>
                      <Badge variant={entitlement.tier === 'premium' ? 'success' : 'secondary'}>
                        {entitlement.tier.toUpperCase()}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Status:</dt>
                    <dd>
                      <Badge variant={entitlement.status === 'active' ? 'success' : 'warning'}>
                        {entitlement.status.toUpperCase()}
                      </Badge>
                    </dd>
                  </div>
                  {entitlement.current_period_end && (
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Renews:</dt>
                      <dd className="font-semibold">
                        {new Date(entitlement.current_period_end).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {entitlement.stripe_subscription_id && (
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Stripe ID:</dt>
                      <dd className="font-mono text-xs">{entitlement.stripe_subscription_id.substring(0, 20)}...</dd>
                    </div>
                  )}
                </dl>
              </AnimatedCard>

              {entitlement.tier === 'free' && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-success rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Upgrade Options</h4>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAdjustTier('premium', 7)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-success text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-semibold"
                    >
                      7-Day Trial
                    </button>
                    <button
                      onClick={() => handleAdjustTier('premium', 30)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-success text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-semibold"
                    >
                      30-Day Trial
                    </button>
                    <button
                      onClick={() => handleAdjustTier('premium')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 text-sm font-semibold"
                    >
                      Grant Premium (Permanent)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-3">
              {tickets.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <Icon name="MessageSquare" className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No support tickets</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 bg-surface-hover rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-mono text-sm font-bold text-primary">{ticket.ticket_id}</p>
                        <p className="text-sm font-semibold text-text-body mt-1">{ticket.subject}</p>
                      </div>
                      <Badge variant={ticket.status === 'resolved' ? 'success' : 'warning'}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted">
                      {new Date(ticket.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

