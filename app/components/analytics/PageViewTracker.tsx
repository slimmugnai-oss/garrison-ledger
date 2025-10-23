'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * PAGE VIEW TRACKER
 * Automatically tracks page views for sitemap analytics
 * 
 * Sends page_view events to analytics_events table
 * Used by sitemap analytics for 7d/30d view counts and bounce rates
 */

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view
    const trackPageView = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'page_view',
            properties: {
              path: pathname,
              sessionId: getSessionId(),
              referrer: document.referrer || 'direct',
              viewport: `${window.innerWidth}x${window.innerHeight}`,
              userAgent: navigator.userAgent,
            },
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        // Silent fail - analytics shouldn't break UX
        console.debug('Page view tracking failed:', error);
      }
    };

    trackPageView();
  }, [pathname]); // Re-run when route changes

  return null; // This component doesn't render anything
}

