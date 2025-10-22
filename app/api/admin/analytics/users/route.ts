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

    // Get all users with branch and rank data
    const { data: users } = await supabase
      .from('user_profiles')
      .select('branch, rank, created_at, rank_category');

    // Branch distribution
    const branchCounts: Record<string, number> = {
      'Army': 0,
      'Navy': 0,
      'Air Force': 0,
      'Marine Corps': 0,
      'Coast Guard': 0,
      'Space Force': 0,
      'Unknown': 0,
    };

    // Rank category distribution
    const rankCategoryCounts: Record<string, number> = {
      'enlisted': 0,
      'officer': 0,
      'warrant': 0,
      'unknown': 0,
    };

    // Growth by month (last 12 months)
    const now = new Date();
    const monthlyGrowth: Record<string, number> = {};

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toISOString().substring(0, 7);
      monthlyGrowth[key] = 0;
    }

    users?.forEach(user => {
      // Count by branch
      const branch = user.branch || 'Unknown';
      if (branchCounts[branch] !== undefined) {
        branchCounts[branch]++;
      } else {
        branchCounts['Unknown']++;
      }

      // Count by rank category
      const rankCat = user.rank_category || 'unknown';
      rankCategoryCounts[rankCat]++;

      // Count by month
      const month = user.created_at?.substring(0, 7);
      if (month && monthlyGrowth[month] !== undefined) {
        monthlyGrowth[month]++;
      }
    });

    // Convert to chart format
    const branchData = Object.entries(branchCounts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));

    const rankData = Object.entries(rankCategoryCounts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));

    // Calculate cumulative growth
    let cumulative = 0;
    const growthData = Object.entries(monthlyGrowth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, signups]) => {
        cumulative += signups;
        return {
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          signups,
          total: cumulative,
        };
      });

    return NextResponse.json({
      branchData,
      rankData,
      growthData,
      totalUsers: users?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

