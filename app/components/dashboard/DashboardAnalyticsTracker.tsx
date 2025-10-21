'use client';

import { useEffect } from 'react';

export function useDashboardAnalytics() {
  const trackWidgetView = (widgetName: string) => {
    if (typeof window === 'undefined') return;
    
    fetch('/api/analytics/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        widgetName,
        action: 'view',
        timestamp: Date.now()
      })
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trackWidgetClick = (widgetName: string, action: string, metadata?: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    
    fetch('/api/analytics/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        widgetName,
        action: 'click',
        clickAction: action,
        metadata,
        timestamp: Date.now()
      })
    });
  };

  return { trackWidgetView, trackWidgetClick };
}

// HOC for widget analytics
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  widgetName: string
) {
  return function AnalyticsWrappedComponent(props: P) {
    const { trackWidgetView } = useDashboardAnalytics();

    useEffect(() => {
      // Track view when component mounts
      trackWidgetView(widgetName);
    }, []);

    return <Component {...props} />;
  };
}

// Intersection Observer for view tracking
export function DashboardAnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const widgetName = entry.target.getAttribute('data-widget');
            if (widgetName) {
              fetch('/api/analytics/dashboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  widgetName,
                  action: 'view',
                  timestamp: Date.now()
                })
              });
            }
          }
        });
      },
      {
        threshold: 0.5, // Track when 50% visible
        rootMargin: '0px'
      }
    );

    // Observe all widgets
    const widgets = document.querySelectorAll('[data-widget]');
    widgets.forEach((widget) => observer.observe(widget));

    return () => {
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}

export default function DashboardAnalyticsTracker() {
  return null; // This is a utility component
}

