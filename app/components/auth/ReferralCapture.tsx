'use client';

import { useEffect } from 'react';

import { useUser } from '@clerk/nextjs';

/**
 * REFERRAL CAPTURE COMPONENT
 * Automatically tracks referral when user signs up
 * Place this in layout or sign-up page
 */

export default function ReferralCapture() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isSignedIn || !user) return;

    // Check if we have a stored referral code in cookie
    const refCode = document.cookie
      .split('; ')
      .find(row => row.startsWith('ref_code='))
      ?.split('=')[1];

    if (!refCode) return;

    // Check if we've already tracked this user
    const trackedKey = `ref_tracked_${user.id}`;
    if (localStorage.getItem(trackedKey)) return;

    // Track the referral
    fetch('/api/referrals/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralCode: refCode }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem(trackedKey, 'true');
          // Clear the cookie
          document.cookie = 'ref_code=; path=/; max-age=0';
          
          // Show success message (optional)
          // You could add a toast notification here
        }
      })
      .catch(() => {
      });
  }, [isSignedIn, user]);

  return null; // This component renders nothing
}

