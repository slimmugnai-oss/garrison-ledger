import { render } from "@react-email/render";
import OnboardingWelcome from "@/emails/OnboardingWelcome";
import OnboardingFeatures from "@/emails/OnboardingFeatures";
import OnboardingPremium from "@/emails/OnboardingPremium";
import WeeklyDigest from "@/emails/WeeklyDigest";
import PCSChecklist from "@/emails/PCSChecklist";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.garrisonledger.com";

/**
 * Email template renderer using React Email
 * 3-email onboarding sequence (Days 0, 3, 7)
 */

// Onboarding Sequence
export async function renderOnboardingWelcome(userName: string): Promise<string> {
  return render(<OnboardingWelcome userName={userName} baseUrl={baseUrl} />);
}

export async function renderOnboardingFeatures(userName: string): Promise<string> {
  return render(<OnboardingFeatures userName={userName} baseUrl={baseUrl} />);
}

export async function renderOnboardingPremium(userName: string): Promise<string> {
  return render(<OnboardingPremium userName={userName} baseUrl={baseUrl} />);
}

// Weekly & Lead Magnets
export async function renderWeeklyDigest(userName: string, weeklyUpdate?: string): Promise<string> {
  return render(<WeeklyDigest userName={userName} weeklyUpdate={weeklyUpdate} baseUrl={baseUrl} />);
}

export async function renderPCSChecklist(): Promise<string> {
  return render(<PCSChecklist baseUrl={baseUrl} />);
}

/**
 * Get email template subject lines
 * Updated for 3-email sequence (Days 0, 3, 7)
 */
export function getEmailSubject(template: string, userName?: string): string {
  const name = userName || "Service Member";

  const subjects: Record<string, string> = {
    // Onboarding sequence (3 emails)
    onboarding_welcome: `Welcome to Garrison Ledger`,
    onboarding_features: `Planning a PCS? Check These 2 Tools`,
    onboarding_premium: `Ready for Full Access? $9.99/month`,

    // Recurring & Lead Magnets
    weekly_digest: `${name}, Your Weekly Military Finance Update`,
    pcs_checklist: "Your PCS Financial Checklist",
  };

  return subjects[template] || "Update from Garrison Ledger";
}
