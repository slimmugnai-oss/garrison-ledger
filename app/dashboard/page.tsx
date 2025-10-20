/**
 * DASHBOARD - TOOLS-FIRST (v5.0)
 * 
 * Clean, focused dashboard highlighting 4 premium tools
 * Removes all assessment/plan clutter
 */

import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import AnimatedCard from '../components/ui/AnimatedCard';
import Icon from '../components/ui/Icon';
import Badge from '../components/ui/Badge';

export const metadata: Metadata = {
  title: "Dashboard - Garrison Ledger",
  description: "Your military financial intelligence command center. Access 4 premium tools: LES Auditor, Base Navigator, TDY Copilot, and Intel Library.",
};

export default async function Dashboard() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check premium status
  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("tier, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

  // Get user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const profileComplete = profile?.profile_completed || false;

  // If profile not complete, redirect to quick-start
  if (!profileComplete) {
    redirect('/dashboard/profile/quick-start');
  }

  // Get usage stats
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  
  const { count: lesUploads } = await supabase
    .from('les_uploads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', firstDayOfMonth.toISOString());

  const { count: tdyTrips } = await supabase
    .from('tdy_trips')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 font-lora mb-2">
              Welcome back, {user.firstName || 'Service Member'}
            </h1>
            <p className="text-lg text-gray-600">
              Your military financial intelligence command center
            </p>
          </div>

          {/* Premium Badge */}
          {isPremium && (
            <div className="mb-8 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Icon name="Star" className="w-6 h-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Premium Member</h3>
                  <p className="text-sm text-yellow-800">Unlimited access to all 4 premium tools</p>
                </div>
              </div>
            </div>
          )}

          {/* 4 Premium Tools - Hero Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Premium Tools</h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* LES Auditor */}
              <AnimatedCard delay={0}>
                <Link href="/dashboard/paycheck-audit" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Icon name="DollarSign" className="w-6 h-6 text-green-600" />
                      </div>
                      {!isPremium && (
                        <Badge variant="warning">
                          <Icon name="Lock" className="w-3 h-3 inline mr-1" />
                          Limited
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      LES Auditor
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 flex-grow">
                      Catch pay errors. Verify BAH, BAS, COLA automatically.
                    </p>
                    
                    <div className="text-sm text-gray-500">
                      {isPremium ? 'Unlimited audits' : `${lesUploads || 0}/1 free this month`}
                    </div>
                  </div>
                </Link>
              </AnimatedCard>

              {/* Base Navigator */}
              <AnimatedCard delay={0.1}>
                <Link href="/base-guides" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon name="MapPin" className="w-6 h-6 text-blue-600" />
                      </div>
                      {!isPremium && (
                        <Badge variant="warning">
                          <Icon name="Lock" className="w-3 h-3 inline mr-1" />
                          Preview
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Base Navigator
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 flex-grow">
                      Find perfect neighborhoods. Schools, rent vs BAH, commute.
                    </p>
                    
                    <div className="text-sm text-gray-500">
                      {isPremium ? 'Full rankings' : 'Top 3 previews'}
                    </div>
                  </div>
                </Link>
              </AnimatedCard>

              {/* TDY Copilot */}
              <AnimatedCard delay={0.2}>
                <Link href="/dashboard/tdy-voucher" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Icon name="File" className="w-6 h-6 text-purple-600" />
                      </div>
                      {!isPremium && (
                        <Badge variant="warning">
                          <Icon name="Lock" className="w-3 h-3 inline mr-1" />
                          Limited
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      TDY Copilot
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 flex-grow">
                      Build travel vouchers. Auto-parse receipts, check compliance.
                    </p>
                    
                    <div className="text-sm text-gray-500">
                      {isPremium ? 'Unlimited receipts' : `${tdyTrips || 0} trips • 3 receipts/trip`}
                    </div>
                  </div>
                </Link>
              </AnimatedCard>

              {/* Intel Library */}
              <AnimatedCard delay={0.3}>
                <Link href="/dashboard/intel" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Icon name="BookOpen" className="w-6 h-6 text-indigo-600" />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Intel Library
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 flex-grow">
                      Reference cards with live BAH/BAS/TSP data. Always current.
                    </p>
                    
                    <div className="text-sm text-gray-500">
                      12 cards • Auto-updating data
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/dashboard/paycheck-audit" className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <Icon name="Upload" className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Upload LES</span>
                </div>
              </Link>

              <Link href="/dashboard/navigator/jblm" className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <Icon name="MapPin" className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Compare Bases</span>
                </div>
              </Link>

              <Link href="/dashboard/tdy-voucher" className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <Icon name="File" className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Create TDY Trip</span>
                </div>
              </Link>

              <Link href="/dashboard/intel" className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <Icon name="Search" className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Browse Intel</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Calculators */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Financial Calculators</h2>
            
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/dashboard/tools/tsp-modeler" className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <Icon name="Calculator" className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">TSP Modeler</h3>
                <p className="text-sm text-gray-600">Project retirement balance</p>
              </Link>

              <Link href="/dashboard/tools/sdp-strategist" className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <Icon name="DollarSign" className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">SDP Strategist</h3>
                <p className="text-sm text-gray-600">10% deployment savings</p>
              </Link>

              <Link href="/dashboard/tools/house-hacking" className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <Icon name="Home" className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">House Hacking</h3>
                <p className="text-sm text-gray-600">BAH arbitrage calculator</p>
              </Link>
            </div>
          </div>

          {/* Upgrade Prompt (Free Users Only) */}
          {!isPremium && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
              <Icon name="Star" className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Unlock Unlimited Access
              </h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Upgrade to Premium for unlimited LES audits, full Base Navigator rankings, unlimited TDY receipts, and more.
              </p>
              <Link
                href="/dashboard/upgrade"
                className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg"
              >
                Upgrade to Premium - $9.99/month →
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

