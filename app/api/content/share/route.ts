import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Content Sharing & Collaboration API
 * 
 * Features:
 * - Share content via unique link
 * - Share with specific users (spouse, unit members)
 * - Create shared collections
 * - Track who viewed shared content
 * - Add notes and recommendations to shared content
 */

// GET - Retrieve shared content or sharing stats
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const shareId = searchParams.get('shareId');
    const myShares = searchParams.get('myShares') === 'true';

    if (shareId) {
      // Get specific shared content
      return await getSharedContent(shareId, userId);
    }

    if (myShares) {
      // Get user's shared content
      return await getMyShares(userId);
    }

    // Get content shared with user
    return await getSharedWithMe(userId);

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch shared content' },
      { status: 500 }
    );
  }
}

// POST - Create a share
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      contentId,
      shareType, // 'public', 'private', 'unit'
      recipientIds, // Array of user IDs for private shares
      message, // Optional message from sharer
      expiresIn // Optional expiration in days
    } = body;

    if (!contentId || !shareType) {
      return NextResponse.json(
        { error: 'contentId and shareType are required' },
        { status: 400 }
      );
    }

    // Get content details
    const { data: content, error: contentError } = await supabaseAdmin
      .from('content_blocks')
      .select('id, title, domain, type')
      .eq('id', contentId)
      .single();

    if (contentError || !content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Calculate expiration
    let expiresAt = null;
    if (expiresIn) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + expiresIn);
      expiresAt = expDate.toISOString();
    }

    // Create share record
    const shareData = {
      content_id: contentId,
      shared_by: userId,
      share_type: shareType,
      message: message || null,
      expires_at: expiresAt,
      share_token: generateShareToken()
    };

    const { data: share, error: shareError } = await supabaseAdmin
      .from('content_shares')
      .insert(shareData)
      .select()
      .single();

    if (shareError) {
      return NextResponse.json(
        { error: 'Failed to create share' },
        { status: 500 }
      );
    }

    // If private share, create recipient records
    if (shareType === 'private' && recipientIds && recipientIds.length > 0) {
      const recipientRecords = recipientIds.map((recipientId: string) => ({
        share_id: share.id,
        recipient_id: recipientId,
        status: 'pending'
      }));

      const { error: recipientError } = await supabaseAdmin
        .from('share_recipients')
        .insert(recipientRecords);

      if (recipientError) {
      }
    }

    // Track share action
    await supabaseAdmin
      .from('content_interactions')
      .insert({
        user_id: userId,
        content_id: contentId,
        action: 'share',
        metadata: { shareType, recipientCount: recipientIds?.length || 0 }
      });

    // Generate share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/library/shared/${share.share_token}`;

    return NextResponse.json({
      success: true,
      share: {
        id: share.id,
        token: share.share_token,
        url: shareUrl,
        content: {
          id: content.id,
          title: content.title,
          domain: content.domain
        },
        shareType,
        message,
        expiresAt,
        createdAt: share.created_at
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create share' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a share
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json(
        { error: 'shareId is required' },
        { status: 400 }
      );
    }

    // Verify user owns this share
    const { data: share, error: fetchError } = await supabaseAdmin
      .from('content_shares')
      .select('shared_by')
      .eq('id', shareId)
      .single();

    if (fetchError || !share) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    if (share.shared_by !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this share' },
        { status: 403 }
      );
    }

    // Delete share (cascade will delete recipients)
    const { error: deleteError } = await supabaseAdmin
      .from('content_shares')
      .delete()
      .eq('id', shareId);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete share' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete share' },
      { status: 500 }
    );
  }
}

// Helper functions

async function getSharedContent(shareToken: string, userId: string) {
  // Get share details
  const { data: share, error: shareError } = await supabaseAdmin
    .from('content_shares')
    .select(`
      *,
      content_blocks(*),
      profiles!content_shares_shared_by_fkey(user_id, first_name, last_name, rank, branch)
    `)
    .eq('share_token', shareToken)
    .single();

  if (shareError || !share) {
    return NextResponse.json(
      { error: 'Share not found' },
      { status: 404 }
    );
  }

  // Check if expired
  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    return NextResponse.json(
      { error: 'Share has expired' },
      { status: 410 }
    );
  }

  // If private share, verify access
  if (share.share_type === 'private') {
    const { data: recipient } = await supabaseAdmin
      .from('share_recipients')
      .select('*')
      .eq('share_id', share.id)
      .eq('recipient_id', userId)
      .single();

    if (!recipient && share.shared_by !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Mark as viewed
    if (recipient && recipient.status === 'pending') {
      await supabaseAdmin
        .from('share_recipients')
        .update({ status: 'viewed', viewed_at: new Date().toISOString() })
        .eq('id', recipient.id);
    }
  }

  // Track view
  await supabaseAdmin
    .from('share_views')
    .insert({
      share_id: share.id,
      viewer_id: userId,
      viewed_at: new Date().toISOString()
    });

  return NextResponse.json({
    share: {
      id: share.id,
      message: share.message,
      sharedBy: share.profiles,
      createdAt: share.created_at,
      expiresAt: share.expires_at
    },
    content: share.content_blocks
  });
}

async function getMyShares(userId: string) {
  const { data: shares, error } = await supabaseAdmin
    .from('content_shares')
    .select(`
      *,
      content_blocks(id, title, domain),
      share_views(count)
    `)
    .eq('shared_by', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch shares' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    shares: shares?.map(share => ({
      id: share.id,
      token: share.share_token,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/library/shared/${share.share_token}`,
      content: share.content_blocks,
      shareType: share.share_type,
      message: share.message,
      viewCount: share.share_views?.length || 0,
      createdAt: share.created_at,
      expiresAt: share.expires_at
    })) || []
  });
}

async function getSharedWithMe(userId: string) {
  // Get shares where user is a recipient
  const { data: recipientShares, error } = await supabaseAdmin
    .from('share_recipients')
    .select(`
      *,
      content_shares(
        *,
        content_blocks(id, title, domain, summary),
        profiles!content_shares_shared_by_fkey(first_name, last_name, rank, branch)
      )
    `)
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch shared content' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    shares: recipientShares?.map(recipient => ({
      id: recipient.content_shares.id,
      content: recipient.content_shares.content_blocks,
      sharedBy: recipient.content_shares.profiles,
      message: recipient.content_shares.message,
      status: recipient.status,
      receivedAt: recipient.created_at,
      viewedAt: recipient.viewed_at,
      expiresAt: recipient.content_shares.expires_at
    })) || []
  });
}

function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

