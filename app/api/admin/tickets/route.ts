import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';

const ADMIN_USER_IDS = ['user_343xVqjkdILtBkaYAJfE5H8Wq0q']; // slimmugnai@gmail.com

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * PATCH /api/admin/tickets - Update ticket status
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    // Check admin authorization
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      logger.warn('[AdminTickets] Unauthorized access attempt', { userId });
      throw Errors.forbidden('Admin access required');
    }

    const body = await request.json();
    const { ticketId, status } = body;

    if (!ticketId || !status) {
      throw Errors.invalidInput('ticketId and status are required');
    }

    // Validate status
    const validStatuses = ['new', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      throw Errors.invalidInput(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Update ticket status
    const { data, error } = await supabaseAdmin
      .from('contact_submissions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      logger.error('[AdminTickets] Failed to update ticket', error, { userId, ticketId, status });
      throw Errors.databaseError('Failed to update ticket status');
    }

    logger.info('[AdminTickets] Ticket updated', { userId, ticketId, newStatus: status });
    return NextResponse.json({
      success: true,
      ticket: data
    });

  } catch (error) {
    return errorResponse(error);
  }
}

