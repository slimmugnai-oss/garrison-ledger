import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ContactForm from '@/app/components/contact/ContactForm';
import PageHeader from '@/app/components/ui/PageHeader';
import Icon from '@/app/components/ui/Icon';
import Link from 'next/link';

export default async function DashboardSupportPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress || '';
  const userName = user?.fullName || user?.firstName || '';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0A0F1E] text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Support Center"
            subtitle="Get help with your account, billing, or technical issues"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Priority Support Badge */}
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-indigo-500/20 p-2 rounded-lg">
                    <Icon name="Crown" className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Priority Support</h3>
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  As a registered user, your support requests receive priority handling.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Timer" className="w-4 h-4 text-indigo-400" />
                  <span className="text-indigo-400 font-semibold">Faster response times</span>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-gradient-to-br from-[#1A1F2E] to-[#141824] rounded-2xl border border-[#2A2F3E] p-6 shadow-lg">
                <h3 className="text-lg font-bold mb-4 text-white">Quick Links</h3>
                <div className="space-y-3">
                  <Link
                    href="/dashboard/library"
                    className="flex items-center gap-3 p-3 bg-[#0A0F1E] rounded-lg hover:bg-[#15192A] transition-colors group"
                  >
                    <Icon name="Library" className="w-5 h-5 text-[#00E5A0] group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-sm font-semibold text-white">Intelligence Library</p>
                      <p className="text-xs text-gray-400">Browse help articles</p>
                    </div>
                  </Link>
                  <Link
                    href="/resources"
                    className="flex items-center gap-3 p-3 bg-[#0A0F1E] rounded-lg hover:bg-[#15192A] transition-colors group"
                  >
                    <Icon name="BookOpen" className="w-5 h-5 text-[#00E5A0] group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-sm font-semibold text-white">Resource Hubs</p>
                      <p className="text-xs text-gray-400">Guides and tutorials</p>
                    </div>
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 p-3 bg-[#0A0F1E] rounded-lg hover:bg-[#15192A] transition-colors group"
                  >
                    <Icon name="Settings" className="w-5 h-5 text-[#00E5A0] group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-sm font-semibold text-white">Account Settings</p>
                      <p className="text-xs text-gray-400">Manage your account</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Common Topics */}
              <div className="bg-gradient-to-br from-[#1A1F2E] to-[#141824] rounded-2xl border border-[#2A2F3E] p-6 shadow-lg">
                <h3 className="text-lg font-bold mb-4 text-white">Common Topics</h3>
                <div className="space-y-2 text-sm">
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#0A0F1E] transition-colors text-gray-300 hover:text-white">
                    • How to retake my assessment
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#0A0F1E] transition-colors text-gray-300 hover:text-white">
                    • Understanding my plan
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#0A0F1E] transition-colors text-gray-300 hover:text-white">
                    • Billing and subscriptions
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#0A0F1E] transition-colors text-gray-300 hover:text-white">
                    • Calculator tool help
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#0A0F1E] transition-colors text-gray-300 hover:text-white">
                    • Data privacy & security
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-[#1A1F2E] to-[#141824] rounded-2xl border border-[#2A2F3E] p-8 shadow-lg">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Submit a Support Request</h2>
                  <p className="text-gray-400">
                    Describe your issue or question and we&apos;ll get back to you as soon as possible.
                  </p>
                </div>

                <ContactForm
                  variant="dashboard"
                  userEmail={userEmail}
                  userName={userName}
                  userId={userId}
                />
              </div>

              {/* Support Tips */}
              <div className="mt-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Icon name="Lightbulb" className="w-5 h-5 text-blue-400" />
                  Tips for Better Support
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="w-4 h-4 text-[#00E5A0] flex-shrink-0 mt-0.5" />
                    <span>Be specific about what you were trying to do when the issue occurred</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="w-4 h-4 text-[#00E5A0] flex-shrink-0 mt-0.5" />
                    <span>Include any error messages you see (screenshots help!)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="w-4 h-4 text-[#00E5A0] flex-shrink-0 mt-0.5" />
                    <span>Let us know what device/browser you&apos;re using</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="w-4 h-4 text-[#00E5A0] flex-shrink-0 mt-0.5" />
                    <span>Set the priority level appropriately for faster triage</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

