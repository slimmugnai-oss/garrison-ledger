import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q'];

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const tier = searchParams.get('tier') || 'all';
    const branch = searchParams.get('branch') || 'all';
    const rank = searchParams.get('rank') || 'all';
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Build query
    let userQuery = supabase
      .from('user_profiles')
      .select(`
        user_id,
        rank,
        branch,
        created_at,
        profile_completed,
        marital_status,
        current_base,
        paygrade,
        rank_category
      `, { count: 'exact' });

    // Apply search filter
    if (query) {
      userQuery = userQuery.or(`user_id.ilike.%${query}%`);
    }

    // Apply filters
    if (branch !== 'all') {
      userQuery = userQuery.eq('branch', branch);
    }

    if (rank !== 'all') {
      userQuery = userQuery.eq('rank', rank);
    }

    // Get users
    const { data: users, count, error: userError } = await userQuery
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (userError) {
      throw userError;
    }

    // Get entitlements for each user
    const userIds = users?.map(u => u.user_id) || [];
    const { data: entitlements } = await supabase
      .from('entitlements')
      .select('user_id, tier, status, current_period_end, stripe_subscription_id')
      .in('user_id', userIds);

    // Fetch Clerk user data for email and names
    const clerk = await clerkClient();
    const clerkUsersPromises = userIds.map(async (id) => {
      try {
        const user = await clerk.users.getUser(id);
        return {
          userId: id,
          email: user.emailAddresses[0]?.emailAddress || null,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
        };
      } catch (error) {
        console.error(`Failed to fetch Clerk user ${id}:`, error);
        return {
          userId: id,
          email: null,
          firstName: null,
          lastName: null,
        };
      }
    });
    const clerkUsers = await Promise.all(clerkUsersPromises);

    // Merge data
    const enrichedUsers = users?.map(user => {
      const entitlement = entitlements?.find(e => e.user_id === user.user_id);
      const clerkData = clerkUsers.find(c => c.userId === user.user_id);
      return {
        ...user,
        email: clerkData?.email || null,
        firstName: clerkData?.firstName || null,
        lastName: clerkData?.lastName || null,
        tier: entitlement?.tier || 'free',
        subscription_status: entitlement?.status || 'none',
        has_active_subscription: !!entitlement?.stripe_subscription_id,
        current_period_end: entitlement?.current_period_end,
      };
    }) || [];

    // Apply tier filter
    let filteredUsers = enrichedUsers;
    if (tier !== 'all') {
      filteredUsers = enrichedUsers.filter(u => u.tier === tier);
    }

    if (status !== 'all') {
      filteredUsers = enrichedUsers.filter(u => u.subscription_status === status);
    }

    return NextResponse.json({
      users: filteredUsers,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

