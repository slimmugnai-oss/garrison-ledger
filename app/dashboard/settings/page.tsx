import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import PageHeader from "@/app/components/ui/PageHeader";
import AnimatedCard from "@/app/components/ui/AnimatedCard";
import BillingPortalButton from "@/app/components/BillingPortalButton";
import { createClient } from "@supabase/supabase-js";
import { calculateProfileCompletion } from "@/lib/profile-recommendations";
import Icon from "@/app/components/ui/Icon";

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Check premium status
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: ent } = await supabase
    .from("entitlements")
    .select("tier, status")
    .eq("user_id", user.id)
    .maybeSingle();
  const isPremium = ent?.tier === "premium" && ent?.status === "active";

  // Get user profile for completion percentage
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  const profileCompletion = profile ? calculateProfileCompletion(profile) : 0;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-bg">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <PageHeader
            title="Account Settings"
            subtitle="Manage your profile, billing, and preferences"
          />

          {/* Profile Section */}
          <AnimatedCard className="mb-8 p-8" delay={0}>
            <h2 className="mb-6 font-serif text-2xl font-bold text-text">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-muted">Name</label>
                <div className="bg-surface-hover rounded-lg border border-border px-4 py-3 text-text">
                  {user.firstName} {user.lastName}
                </div>
                <p className="mt-1 text-xs text-muted">Managed by your Clerk account</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-muted">Email</label>
                <div className="bg-surface-hover rounded-lg border border-border px-4 py-3 text-text">
                  {user.emailAddresses[0]?.emailAddress}
                </div>
                <p className="mt-1 text-xs text-muted">Primary email for account notifications</p>
              </div>
            </div>
          </AnimatedCard>

          {/* Billing Section */}
          <AnimatedCard className="mb-8 p-8" delay={100}>
            <h2 className="mb-6 font-serif text-2xl font-bold text-text">Billing & Subscription</h2>

            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-muted">Current Plan</div>
                  <div className="mt-1 text-xl font-bold text-text">
                    {isPremium ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-amber-600">⭐ Premium</span>
                        <span className="bg-success-subtle rounded-full px-2 py-1 text-xs font-semibold text-success">
                          Active
                        </span>
                      </span>
                    ) : (
                      "Free"
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
                    Manage your subscription, update payment method, view invoices, or cancel
                    anytime.
                  </p>
                </>
              ) : (
                <>
                  <a
                    href="/dashboard/upgrade"
                    className="inline-flex items-center rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-[2px] hover:from-slate-800 hover:to-slate-900 hover:shadow-xl"
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
            <h2 className="mb-6 font-serif text-2xl font-bold text-text">Preferences</h2>
            <div className="space-y-4">
              {/* Profile Mini Preview */}
              {profile && (
                <div className="bg-surface-hover mb-6 rounded-lg border border-border p-4">
                  <div className="mb-3 text-sm font-semibold text-muted">Profile Summary</div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-body">Rank:</span>
                      <span className="font-semibold text-text">
                        {profile.rank || "Not set"} {profile.paygrade && `(${profile.paygrade})`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body">Base:</span>
                      <span className="font-semibold text-text">
                        {profile.current_base || "Not set"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body">Dependents:</span>
                      <span className="font-semibold text-text">
                        {profile.has_dependents === true
                          ? "Yes"
                          : profile.has_dependents === false
                            ? "No"
                            : "Not set"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-surface-hover flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex-1">
                  <div className="font-semibold text-text">User Profile</div>
                  <div className="mt-1 text-sm text-muted">
                    Update your rank, branch, base, family, and goals
                    <span
                      className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        profileCompletion >= 80
                          ? "bg-green-100 text-green-700"
                          : profileCompletion >= 50
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {profileCompletion}% complete
                    </span>
                  </div>
                </div>
                <a
                  href="/dashboard/profile/setup?from=settings"
                  className="bg-surface hover:bg-surface-hover flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text transition-colors"
                >
                  <Icon name="Edit" className="h-4 w-4" />
                  Edit Profile
                </a>
              </div>
              <div className="bg-surface-hover flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <div className="font-semibold text-text">Email Notifications</div>
                  <div className="mt-1 text-sm text-muted">
                    Receive updates about new features and tips
                  </div>
                </div>
                <button className="bg-surface hover:bg-surface-hover rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text transition-colors">
                  Manage
                </button>
              </div>
            </div>
          </AnimatedCard>

          {/* Danger Zone */}
          <AnimatedCard className="bg-danger-subtle border-2 border-danger p-8" delay={300}>
            <h2 className="mb-4 font-serif text-2xl font-bold text-danger">Danger Zone</h2>
            <p className="mb-6 text-danger">
              Deleting your account will permanently remove all your data, including saved
              assessments, tool models, and subscription information. This action cannot be undone.
            </p>
            <button className="rounded-lg bg-danger px-6 py-3 font-semibold text-white transition-colors hover:bg-danger">
              Delete Account
            </button>
          </AnimatedCard>
        </div>
      </div>
      <Footer />
    </>
  );
}
