import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Get user's spouse connection and shared data
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    return NextResponse.json({
      hasConnection: true,
      connection: conn,
      sharedData: sharedData || [],
      settings: settings || null
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch collaboration data' },
      { status: 500 }
    );
  }
}

// POST: Create spouse invitation or share calculator data
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create_invitation') {
      // Generate connection code
      const { data: code } = await supabaseAdmin.rpc('generate_connection_code');
      
      if (!code) {
        return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
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
        return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        code,
        connection 
      });
    }

    if (action === 'use_code') {
      const { code } = data;

      // Find connection by code
      const { data: connection, error } = await supabaseAdmin
        .from('spouse_connections')
        .select('*')
        .eq('connection_code', code)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !connection) {
        return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
      }

      // Can't connect to yourself
      if (connection.user_id_1 === userId) {
        return NextResponse.json({ error: 'Cannot connect to yourself' }, { status: 400 });
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
        return NextResponse.json({ error: 'Failed to connect' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true,
        message: 'Successfully connected!' 
      });
    }

    if (action === 'share_calculator') {
      const { connectionId, calculatorName, inputs, outputs, notes } = data;

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
        return NextResponse.json({ error: 'Failed to share' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// DELETE: Disconnect spouses
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update connection status to disconnected
    const { error } = await supabaseAdmin
      .from('spouse_connections')
      .update({ status: 'disconnected', updated_at: new Date().toISOString() })
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .eq('status', 'active');

    if (error) {
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}

