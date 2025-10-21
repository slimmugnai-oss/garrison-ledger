import { render } from '@react-email/render';
import OnboardingDay1 from '@/emails/OnboardingDay1';
import WeeklyDigest from '@/emails/WeeklyDigest';
import PCSChecklist from '@/emails/PCSChecklist';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://garrison-ledger.vercel.app';

/**
 * Email template renderer using React Email
 * Provides professional, responsive email templates
 */

export async function renderOnboardingDay1(userName: string): Promise<string> {
  return render(<OnboardingDay1 userName={userName} baseUrl={baseUrl} />);
}

export async function renderWeeklyDigest(userName: string, hasPlan: boolean, planUpdated: boolean): Promise<string> {
  return render(<WeeklyDigest userName={userName} hasPlan={hasPlan} planUpdated={planUpdated} baseUrl={baseUrl} />);
}

export async function renderPCSChecklist(): Promise<string> {
  return render(<PCSChecklist baseUrl={baseUrl} />);
}

/**
 * Get email template subject lines
 */
export function getEmailSubject(template: string, userName?: string): string {
  const subjects: Record<string, string> = {
    'onboarding_day_1': `Welcome to Garrison Ledger, ${userName || 'Service Member'} - Mission Briefing`,
    'onboarding_day_2': `${userName || 'Service Member'}, Your AI-Curated Financial Plan is Ready`,
    'onboarding_day_3': `${userName || 'Service Member'}, Real Success: How Sarah Saved $9,600/Year`,
    'onboarding_day_5': `${userName || 'Service Member'}, 6 Free Financial Tools at Your Command`,
    'onboarding_day_7': `${userName || 'Service Member'}, Upgrade to Premium - Just $0.33/Day`,
    'weekly_digest': `${userName || 'Service Member'}, Your Weekly Military Finance Update`,
    'pcs_checklist': 'Your PCS Financial Checklist - Garrison Ledger',
  };

  return subjects[template] || 'Update from Garrison Ledger';
}

