import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Get user's spouse connection and shared data
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Get spouse connection
    const { data: connection } = await supabaseAdmin.rpc('get_spouse_connection', {
      p_user_id: userId
    });

    if (!connection || connection.length === 0) {
      return NextResponse.json({ 
        hasConnection: false,
        connection: null,
        sharedData: []
      });
    }

    const conn = connection[0];

    // Get shared calculator data
    const { data: sharedData } = await supabaseAdmin.rpc('get_shared_calculators', {
      p_connection_id: conn.connection_id
    });

    // Get collaboration settings
    const { data: settings } = await supabaseAdmin
      .from('collaboration_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    logger.info('[Collaboration] Collaboration data fetched', { 
      userId, 
      hasConnection: true,
      sharedDataCount: sharedData?.length || 0
    });

    return NextResponse.json({
      hasConnection: true,
      connection: conn,
      sharedData: sharedData || [],
      settings: settings || null
    });

  } catch (error) {
    return errorResponse(error);
  }
}

// POST: Create spouse invitation or share calculator data
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const body = await request.json();
    const { action, ...data } = body;

    if (!action) {
      throw Errors.invalidInput("action is required");
    }

    if (action === 'create_invitation') {
      // Generate connection code
      const { data: code, error: codeError } = await supabaseAdmin.rpc('generate_connection_code');
      
      if (codeError || !code) {
        logger.error('[Collaboration] Failed to generate connection code', codeError, { userId });
        throw Errors.databaseError('Failed to generate connection code');
      }

      // Create pending connection
      const { data: connection, error } = await supabaseAdmin
        .from('spouse_connections')
        .insert({
          user_id_1: userId,
          user_id_2: '', // Will be filled when code is used
          invited_by: userId,
          connection_code: code,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        logger.error('[Collaboration] Failed to create invitation', error, { userId });
        throw Errors.databaseError('Failed to create invitation');
      }

      logger.info('[Collaboration] Invitation created', { userId, code });
      return NextResponse.json({ 
        success: true, 
        code,
        connection 
      });
    }

    if (action === 'use_code') {
      const { code } = data;

      if (!code) {
        throw Errors.invalidInput('Connection code is required');
      }

      // Find connection by code
      const { data: connection, error } = await supabaseAdmin
        .from('spouse_connections')
        .select('*')
        .eq('connection_code', code)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !connection) {
        logger.warn('[Collaboration] Invalid or expired code', { userId, code });
        throw Errors.invalidInput('Invalid or expired connection code');
      }

      // Can't connect to yourself
      if (connection.user_id_1 === userId) {
        logger.warn('[Collaboration] User tried to connect to self', { userId });
        throw Errors.invalidInput('Cannot connect to yourself');
      }

      // Update connection with second user
      const { error: updateError } = await supabaseAdmin
        .from('spouse_connections')
        .update({
          user_id_2: userId,
          status: 'active',
          connected_at: new Date().toISOString()
        })
        .eq('id', connection.id);

      if (updateError) {
        logger.error('[Collaboration] Failed to activate connection', updateError, { userId, code });
        throw Errors.databaseError('Failed to connect');
      }

      logger.info('[Collaboration] Connection activated', { userId, code, partnerId: connection.user_id_1 });
      return NextResponse.json({ 
        success: true,
        message: 'Successfully connected!' 
      });
    }

    if (action === 'share_calculator') {
      const { connectionId, calculatorName, inputs, outputs, notes } = data;

      if (!connectionId || !calculatorName) {
        throw Errors.invalidInput('connectionId and calculatorName are required');
      }

      const { error } = await supabaseAdmin
        .from('shared_calculator_data')
        .insert({
          connection_id: connectionId,
          shared_by: userId,
          calculator_name: calculatorName,
          inputs,
          outputs,
          notes
        });

      if (error) {
        logger.error('[Collaboration] Failed to share calculator', error, { userId, connectionId, calculatorName });
        throw Errors.databaseError('Failed to share calculator data');
      }

      logger.info('[Collaboration] Calculator shared', { userId, connectionId, calculatorName });
      return NextResponse.json({ success: true });
    }

    logger.warn('[Collaboration] Invalid action', { userId, action });
    throw Errors.invalidInput(`Invalid action: ${action}`);

  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE: Disconnect spouses
export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    // Update connection status to disconnected
    const { error } = await supabaseAdmin
      .from('spouse_connections')
      .update({ status: 'disconnected', updated_at: new Date().toISOString() })
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .eq('status', 'active');

    if (error) {
      logger.error('[Collaboration] Failed to disconnect', error, { userId });
      throw Errors.databaseError('Failed to disconnect');
    }

    logger.info('[Collaboration] Connection disconnected', { userId });
    return NextResponse.json({ success: true });

  } catch (error) {
    return errorResponse(error);
  }
}

