import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import PageHeader from '@/app/components/ui/PageHeader';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import BillingPortalButton from '@/app/components/BillingPortalButton';
import { createClient } from '@supabase/supabase-js';

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  // Check premium status
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: ent } = await supabase.from("entitlements").select("tier, status").eq("user_id", user.id).maybeSingle();
  const isPremium = ent?.tier === 'premium' && ent?.status === 'active';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <PageHeader 
            title="Account Settings"
            subtitle="Manage your profile, billing, and preferences"
          />

          {/* Profile Section */}
          <AnimatedCard className="mb-8 p-8" delay={0}>
            <h2 className="text-2xl font-serif font-bold text-text mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Name</label>
                <div className="px-4 py-3 bg-gray-50 border border-border rounded-lg text-text">
                  {user.firstName} {user.lastName}
                </div>
                <p className="text-xs text-muted mt-1">Managed by your Clerk account</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted mb-2">Email</label>
                <div className="px-4 py-3 bg-gray-50 border border-border rounded-lg text-text">
                  {user.emailAddresses[0]?.emailAddress}
                </div>
                <p className="text-xs text-muted mt-1">Primary email for account notifications</p>
              </div>
            </div>
          </AnimatedCard>

          {/* Billing Section */}
          <AnimatedCard className="mb-8 p-8" delay={100}>
            <h2 className="text-2xl font-serif font-bold text-text mb-6">Billing & Subscription</h2>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold text-muted">Current Plan</div>
                  <div className="text-xl font-bold text-text mt-1">
                    {isPremium ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-amber-600">⭐ Premium</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">Active</span>
                      </span>
                    ) : (
                      'Free'
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {isPremium ? (
                <>
                  <BillingPortalButton />
                  <p className="text-sm text-muted">
                    Manage your subscription, update payment method, view invoices, or cancel anytime.
                  </p>
                </>
              ) : (
                <>
                  <a 
                    href="/dashboard/upgrade"
                    className="inline-flex items-center bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-[2px]"
                  >
                    Upgrade to Premium →
                  </a>
                  <p className="text-sm text-muted">
                    Unlock advanced features, detailed analytics, and priority support.
                  </p>
                </>
              )}
            </div>
          </AnimatedCard>

          {/* Preferences Section */}
          <AnimatedCard className="mb-8 p-8" delay={200}>
            <h2 className="text-2xl font-serif font-bold text-text mb-6">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-border">
                <div>
                  <div className="font-semibold text-text">Email Notifications</div>
                  <div className="text-sm text-muted mt-1">Receive updates about new features and tips</div>
                </div>
                <button className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-semibold text-text hover:bg-gray-50 transition-colors">
                  Manage
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-border">
                <div>
                  <div className="font-semibold text-text">Assessment Data</div>
                  <div className="text-sm text-muted mt-1">Your saved assessment answers and preferences</div>
                </div>
                <a 
                  href="/dashboard/assessment"
                  className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-semibold text-text hover:bg-gray-50 transition-colors"
                >
                  Retake
                </a>
              </div>
            </div>
          </AnimatedCard>

          {/* Danger Zone */}
          <AnimatedCard className="p-8 border-2 border-red-200 bg-red-50" delay={300}>
            <h2 className="text-2xl font-serif font-bold text-red-900 mb-4">Danger Zone</h2>
            <p className="text-red-800 mb-6">
              Deleting your account will permanently remove all your data, including saved assessments, tool models, and subscription information. This action cannot be undone.
            </p>
            <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">
              Delete Account
            </button>
          </AnimatedCard>
        </div>
      </div>
      <Footer />
    </>
  );
}

