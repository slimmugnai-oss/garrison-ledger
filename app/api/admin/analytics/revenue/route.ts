import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q'];

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get revenue data for last 12 months
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1);

    // Get user profiles created in last 12 months
    const { data: users } = await supabase
      .from('user_profiles')
      .select('created_at')
      .gte('created_at', twelveMonthsAgo.toISOString());

    // Get entitlements for revenue tracking
    const { data: entitlements } = await supabase
      .from('entitlements')
      .select('created_at, tier, status')
      .eq('status', 'active')
      .gte('created_at', twelveMonthsAgo.toISOString());

    // Group by month
    const monthlyData: Record<string, { signups: number; premium: number; mrr: number }> = {};

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toISOString().substring(0, 7); // YYYY-MM
      monthlyData[key] = { signups: 0, premium: 0, mrr: 0 };
    }

    // Count signups by month
    users?.forEach(user => {
      const month = user.created_at.substring(0, 7);
      if (monthlyData[month]) {
        monthlyData[month].signups++;
      }
    });

    // Count premium conversions and calculate MRR by month
    entitlements?.forEach(ent => {
      const month = ent.created_at.substring(0, 7);
      if (monthlyData[month]) {
        monthlyData[month].premium++;
      }
    });

    // Calculate cumulative MRR for each month
    let cumulativePremium = 0;
    Object.keys(monthlyData).sort().forEach(month => {
      cumulativePremium += monthlyData[month].premium;
      monthlyData[month].mrr = cumulativePremium * 9.99;
    });

    // Convert to array format for charts
    const chartData = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        signups: data.signups,
        premium: data.premium,
        mrr: parseFloat(data.mrr.toFixed(2)),
      }));

    // Get current metrics
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    const { count: premiumUsers } = await supabase
      .from('entitlements')
      .select('*', { count: 'exact', head: true })
      .eq('tier', 'premium')
      .eq('status', 'active');

    const currentMRR = (premiumUsers || 0) * 9.99;
    const currentARR = currentMRR * 12;
    const conversionRate = totalUsers && totalUsers > 0 ? (premiumUsers || 0) / totalUsers : 0;

    // Conversion funnel data
    const { count: profilesCompleted } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .not('rank', 'is', null);

    const funnelData = [
      { stage: 'Signups', count: totalUsers || 0, percentage: 100 },
      { stage: 'Profile Complete', count: profilesCompleted || 0, percentage: totalUsers ? (profilesCompleted || 0) / totalUsers * 100 : 0 },
      { stage: 'Premium', count: premiumUsers || 0, percentage: totalUsers ? (premiumUsers || 0) / totalUsers * 100 : 0 },
    ];

    return NextResponse.json({
      chartData,
      currentMetrics: {
        mrr: currentMRR,
        arr: currentARR,
        premiumUsers: premiumUsers || 0,
        conversionRate: (conversionRate * 100).toFixed(2),
      },
      funnelData,
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

