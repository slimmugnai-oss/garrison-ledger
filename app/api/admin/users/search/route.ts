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

    const clerk = await clerkClient();

    // FETCH ALL CLERK USERS FIRST (not just those with profiles)
    const clerkUsersResponse = await clerk.users.getUserList({
      limit: 500, // Fetch up to 500 users (adjust if needed)
    });

    const allClerkUsers = clerkUsersResponse.data;

    // Filter by search query if provided
    let filteredClerkUsers = allClerkUsers;
    if (query) {
      const queryLower = query.toLowerCase();
      filteredClerkUsers = allClerkUsers.filter(user => {
        const email = user.emailAddresses[0]?.emailAddress?.toLowerCase() || '';
        const firstName = user.firstName?.toLowerCase() || '';
        const lastName = user.lastName?.toLowerCase() || '';
        const userId = user.id.toLowerCase();
        return email.includes(queryLower) || 
               firstName.includes(queryLower) || 
               lastName.includes(queryLower) ||
               userId.includes(queryLower);
      });
    }

    // Get user_profiles for all Clerk users
    const clerkUserIds = filteredClerkUsers.map(u => u.id);
    const { data: profiles } = await supabase
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
      `)
      .in('user_id', clerkUserIds);

    // Get entitlements for all Clerk users
    const { data: entitlements } = await supabase
      .from('entitlements')
      .select('user_id, tier, status, current_period_end, stripe_subscription_id')
      .in('user_id', clerkUserIds);

    // Merge Clerk + Profiles + Entitlements
    let enrichedUsers = filteredClerkUsers.map(clerkUser => {
      const profile = profiles?.find(p => p.user_id === clerkUser.id);
      const entitlement = entitlements?.find(e => e.user_id === clerkUser.id);
      
      return {
        user_id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || null,
        firstName: clerkUser.firstName || null,
        lastName: clerkUser.lastName || null,
        rank: profile?.rank || null,
        branch: profile?.branch || null,
        created_at: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
        profile_completed: profile?.profile_completed || false,
        marital_status: profile?.marital_status || null,
        current_base: profile?.current_base || null,
        paygrade: profile?.paygrade || null,
        rank_category: profile?.rank_category || null,
        tier: entitlement?.tier || 'free',
        subscription_status: entitlement?.status || 'none',
        has_active_subscription: !!entitlement?.stripe_subscription_id,
        current_period_end: entitlement?.current_period_end,
      };
    });

    // Apply filters
    if (tier !== 'all') {
      enrichedUsers = enrichedUsers.filter(u => u.tier === tier);
    }

    if (status !== 'all') {
      enrichedUsers = enrichedUsers.filter(u => u.subscription_status === status);
    }

    if (branch !== 'all') {
      enrichedUsers = enrichedUsers.filter(u => u.branch === branch);
    }

    if (rank !== 'all') {
      enrichedUsers = enrichedUsers.filter(u => u.rank === rank);
    }

    // Paginate
    const totalCount = enrichedUsers.length;
    const paginatedUsers = enrichedUsers.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

    return NextResponse.json({
      users: paginatedUsers,
      total: totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

