/**
 * Enhanced Analytics Tracking System
 * Tracks user engagement, conversions, and feature usage
 */

// Event types for type safety
export type AnalyticsEvent =
  | 'calculator_started'
  | 'calculator_completed'
  | 'calculator_exported'
  | 'calculator_compared'
  | 'assessment_started'
  | 'assessment_completed'
  | 'plan_generated'
  | 'plan_viewed'
  | 'premium_upgrade_clicked'
  | 'premium_upgraded'
  | 'collaboration_invited'
  | 'collaboration_connected'
  | 'recommendation_viewed'
  | 'recommendation_clicked'
  | 'keyboard_shortcut_used';

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track an analytics event
 */
export function trackEvent(event: AnalyticsEvent, properties?: EventProperties) {
  // Send to Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, properties);
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${event}`, properties);
  }

  // Send to our backend for custom analytics
  if (typeof window !== 'undefined') {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties, timestamp: new Date().toISOString() })
    }).catch(console.error);
  }
}

/**
 * Track calculator completion
 */
export function trackCalculatorCompletion(calculator: string, timeSpent: number) {
  trackEvent('calculator_completed', {
    calculator_name: calculator,
    time_spent_seconds: timeSpent
  });
}

/**
 * Track premium conversion
 */
export function trackPremiumConversion(source: string) {
  trackEvent('premium_upgraded', {
    conversion_source: source
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(feature: string, action: string) {
  trackEvent('recommendation_clicked', {
    feature_name: feature,
    action_taken: action
  });
}

/**
 * Calculate completion rate for a funnel
 */
export function calculateCompletionRate(started: number, completed: number): number {
  if (started === 0) return 0;
  return Math.round((completed / started) * 100);
}

/**
 * Time tracking helper
 */
export class TimeTracker {
  private startTime: number;
  private eventName: string;

  constructor(eventName: string) {
    this.eventName = eventName;
    this.startTime = Date.now();
  }

  complete(properties?: EventProperties) {
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    trackEvent(this.eventName as AnalyticsEvent, {
      ...properties,
      duration_seconds: duration
    });
  }
}

