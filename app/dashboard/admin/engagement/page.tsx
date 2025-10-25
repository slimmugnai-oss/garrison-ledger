import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from "next";
import Link from 'next/link';
import { redirect } from 'next/navigation';

import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';
import PageHeader from '@/app/components/ui/PageHeader';

export const metadata: Metadata = {
  title: "User Engagement - Admin Dashboard",
  description: "Gamification analytics, streaks, and engagement metrics",
  robots: { index: false, follow: false },
};

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q']; // slimmugnai@gmail.com

async function getEngagementMetrics() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Total gamification records
  const { count: totalActiveUsers } = await supabase
    .from('user_gamification')
    .select('*', { count: 'exact', head: true })
    .gt('current_streak', 0);

  // Average streak
  const { data: gamificationData } = await supabase
    .from('user_gamification')
    .select('current_streak, longest_streak, total_logins, badges');

  const avgStreak = gamificationData && gamificationData.length > 0
    ? Math.round(gamificationData.reduce((sum, user) => sum + (user.current_streak || 0), 0) / gamificationData.length)
    : 0;

  const maxStreak = gamificationData && gamificationData.length > 0
    ? Math.max(...gamificationData.map(user => user.current_streak || 0))
    : 0;

  // Badge distribution
  const badgeCounts = {
    week_warrior: 0,
    month_master: 0,
    quarter_champion: 0,
    year_legend: 0
  };

  gamificationData?.forEach(user => {
    user.badges?.forEach((badge: string) => {
      if (badge in badgeCounts) {
        badgeCounts[badge as keyof typeof badgeCounts]++;
      }
    });
  });

  // Top streakers
  const topStreakers = await supabase
    .from('user_gamification')
    .select('user_id, current_streak, longest_streak, badges, total_logins')
    .order('current_streak', { ascending: false })
    .limit(10);

  return {
    totalActiveUsers: totalActiveUsers || 0,
    avgStreak,
    maxStreak,
    badgeCounts,
    topStreakers: topStreakers.data || [],
    totalUsers: gamificationData?.length || 0
  };
}

export default async function AdminEngagementPage() {
  const user = await currentUser();
  
  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    redirect('/dashboard');
  }

  const metrics = await getEngagementMetrics();

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
              title="User Engagement Analytics" 
              subtitle="Gamification metrics, streaks, badges, and activity tracking"
            />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <AnimatedCard delay={0} className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6">
              <Icon name="TrendingUp" className="h-8 w-8 mb-3" />
              <div className="text-3xl font-black mb-1">{metrics.totalActiveUsers}</div>
              <div className="text-sm opacity-90">Active Streakers</div>
            </AnimatedCard>

            <AnimatedCard delay={100} className="bg-gradient-to-br from-slate-700 to-slate-900 text-white p-6">
              <Icon name="Target" className="h-8 w-8 mb-3" />
              <div className="text-3xl font-black mb-1">{metrics.avgStreak}</div>
              <div className="text-sm opacity-90">Avg Streak (Days)</div>
            </AnimatedCard>

            <AnimatedCard delay={200} className="bg-gradient-to-br from-slate-700 to-slate-900 text-white p-6">
              <Icon name="Star" className="h-8 w-8 mb-3" />
              <div className="text-3xl font-black mb-1">{metrics.maxStreak}</div>
              <div className="text-sm opacity-90">Longest Streak</div>
            </AnimatedCard>

            <AnimatedCard delay={300} className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6">
              <Icon name="Users" className="h-8 w-8 mb-3" />
              <div className="text-3xl font-black mb-1">
                {metrics.totalActiveUsers > 0 ? Math.round((metrics.totalActiveUsers / metrics.totalUsers) * 100) : 0}%
              </div>
              <div className="text-sm opacity-90">Engagement Rate</div>
            </AnimatedCard>
          </div>

          {/* Badge Distribution */}
          <AnimatedCard delay={400} className="mb-8">
            <h2 className="text-2xl font-bold text-text-headings mb-6">Achievement Badges Earned</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-success rounded-xl">
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-2xl font-black text-primary mb-1">{metrics.badgeCounts.week_warrior}</div>
                <div className="text-sm font-semibold text-body">Week Warriors</div>
                <div className="text-xs text-muted">7+ day streaks</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl">
                <div className="text-4xl mb-2">⭐</div>
                <div className="text-2xl font-black text-primary mb-1">{metrics.badgeCounts.month_master}</div>
                <div className="text-sm font-semibold text-body">Month Masters</div>
                <div className="text-xs text-muted">30+ day streaks</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                <div className="text-4xl mb-2">👑</div>
                <div className="text-2xl font-black text-primary mb-1">{metrics.badgeCounts.quarter_champion}</div>
                <div className="text-sm font-semibold text-body">Quarter Champions</div>
                <div className="text-xs text-muted">90+ day streaks</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-2xl font-black text-primary mb-1">{metrics.badgeCounts.year_legend}</div>
                <div className="text-sm font-semibold text-body">Year Legends</div>
                <div className="text-xs text-muted">365+ day streaks</div>
              </div>
            </div>
          </AnimatedCard>

          {/* Top Streakers Leaderboard */}
          <AnimatedCard delay={500}>
            <h2 className="text-2xl font-bold text-text-headings mb-6">🔥 Top Streakers Leaderboard</h2>
            
            {metrics.topStreakers.length > 0 ? (
              <div className="space-y-3">
                {metrics.topStreakers.map((streaker: { user_id: string; current_streak: number; longest_streak: number; total_logins: number; badges?: string[] }, idx: number) => (
                  <div key={streaker.user_id} className="flex items-center justify-between p-4 bg-surface-hover border border-subtle rounded-lg hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                        idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                        idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                        idx === 2 ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-primary">
                          User {streaker.user_id.substring(0, 12)}...
                        </div>
                        <div className="text-xs text-body">
                          {streaker.total_logins || 0} total logins
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-black text-orange-600">
                          {streaker.current_streak} 🔥
                        </div>
                        <div className="text-xs text-muted">Current</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-body">
                          {streaker.longest_streak}
                        </div>
                        <div className="text-xs text-muted">Best</div>
                      </div>
                      {streaker.badges && streaker.badges.length > 0 && (
                        <div className="flex gap-1">
                          {streaker.badges.includes('week_warrior') && <span title="Week Warrior">🎯</span>}
                          {streaker.badges.includes('month_master') && <span title="Month Master">⭐</span>}
                          {streaker.badges.includes('quarter_champion') && <span title="Quarter Champion">👑</span>}
                          {streaker.badges.includes('year_legend') && <span title="Year Legend">🏆</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔥</div>
                <p className="text-body">No active streaks yet</p>
                <p className="text-sm text-muted mt-2">Users will start building streaks as they return daily</p>
              </div>
            )}
          </AnimatedCard>
        </div>
      </div>
      <Footer />
    </>
  );
}

