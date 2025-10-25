/**
 * LES AUDIT SEARCH API
 * 
 * POST /api/les/audit/search
 * Returns filtered and sorted list of user's audits
 * 
 * Security: User can only search their own audits
 */

import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SearchParams {
  startDate?: string;
  endDate?: string;
  flagType?: 'red' | 'yellow' | 'green' | 'any-issues';
  sortBy?: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
  limit?: number;
}

export async function POST(request: Request) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json() as SearchParams;
  const { startDate, endDate, flagType, sortBy = 'date-desc', limit = 50 } = body;

  // Build query
  let query = supabase
    .from('les_uploads')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null);

  // Date range filter
  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  // Flag type filter
  if (flagType) {
    if (flagType === 'red') {
      query = query.gt('red_flags_count', 0);
    } else if (flagType === 'yellow') {
      query = query.gt('yellow_flags_count', 0);
    } else if (flagType === 'green') {
      query = query.gt('green_flags_count', 0);
    } else if (flagType === 'any-issues') {
      query = query.or('red_flags_count.gt.0,yellow_flags_count.gt.0');
    }
  }

  // Sorting
  if (sortBy === 'date-desc') {
    query = query.order('year', { ascending: false }).order('month', { ascending: false });
  } else if (sortBy === 'date-asc') {
    query = query.order('year', { ascending: true }).order('month', { ascending: true });
  } else if (sortBy === 'amount-desc') {
    query = query.order('total_delta_cents', { ascending: false, nullsFirst: false });
  } else if (sortBy === 'amount-asc') {
    query = query.order('total_delta_cents', { ascending: true, nullsFirst: true });
  }

  // Limit
  query = query.limit(limit);

  const { data: audits, error } = await query;

  if (error) {
    console.error('[SEARCH AUDITS] Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }

  return NextResponse.json({
    audits: audits || [],
    count: audits?.length || 0,
    filters: {
      startDate,
      endDate,
      flagType,
      sortBy
    }
  });
}

