import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components";
import * as React from "react";

interface ReferralEarnedProps {
  userName?: string;
  referredUserName?: string;
  creditsEarned?: number;
  totalCredits?: number;
  baseUrl?: string;
}

export const ReferralEarned = ({
  userName = "Service Member",
  referredUserName = "a friend",
  creditsEarned = 10,
  totalCredits = 10,
  baseUrl = "https://www.garrisonledger.com",
}: ReferralEarnedProps) => {
  return (
    <Html>
      <Head />
      <Preview>You earned ${creditsEarned}! Your referral upgraded to premium.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Success Header */}
          <Section style={header}>
            <Heading style={headerTitle}>You Earned ${creditsEarned}!</Heading>
            <Text style={headerSubtitle}>Your battle buddy just upgraded to premium</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={text}>
              Outstanding, {userName}!
            </Text>

            <Text style={text}>
              {referredUserName} just upgraded to premium using your referral code, and we've
              credited your account with <strong>${creditsEarned}.00</strong>.
            </Text>

            {/* Credit Balance Card */}
            <Section style={creditCard}>
              <Text style={creditLabel}>Your Credit Balance</Text>
              <Heading style={creditAmount}>${totalCredits}.00</Heading>
              <Text style={creditSubtext}>
                Use your credits towards premium subscription or keep referring to earn more!
              </Text>
            </Section>

            {/* Keep Going Section */}
            <Section style={encourageSection}>
              <Text style={sectionTitle}>
                <strong>Keep the momentum going</strong>
              </Text>
              <Text style={text}>
                You're helping more military families take control of their finances. Share your
                referral link with:
              </Text>
              <Text style={bulletText}>• Unit members preparing for PCS</Text>
              <Text style={bulletText}>• Friends looking to maximize their TSP</Text>
              <Text style={bulletText}>• Military spouses managing family finances</Text>
              
              <Button style={button} href={`${baseUrl}/dashboard/referrals`}>
                View Your Referral Dashboard →
              </Button>
            </Section>

            {/* Dual Reward Reminder */}
            <Text style={reminderText}>
              Remember: Every person who upgrades with your code earns you both $10. It's a win-win
              for the military community.
            </Text>

            {/* Sign-off */}
            <Text style={footer}>
              Questions? Reply to this email or contact{" "}
              <Link href="mailto:support@garrisonledger.com" style={link}>
                support@garrisonledger.com
              </Link>
            </Text>
            <Text style={signature}>— The Garrison Ledger Team</Text>
          </Section>

          {/* Unsubscribe Footer */}
          <Hr style={hr} />
          <Text style={unsubscribe}>
            You're receiving this because you earned a referral reward.
            <br />
            <Link href={`${baseUrl}/dashboard/settings`} style={link}>
              Update email preferences
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ReferralEarned;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
  padding: "40px 20px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  margin: "0 0 8px 0",
  fontSize: "32px",
  fontWeight: "bold",
};

const headerSubtitle = {
  color: "#d1fae5",
  margin: "0",
  fontSize: "16px",
  fontWeight: "normal",
};

const content = {
  padding: "40px 20px",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const creditCard = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  borderRadius: "12px",
  padding: "32px",
  textAlign: "center" as const,
  margin: "32px 0",
};

const creditLabel = {
  color: "#d1fae5",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 8px 0",
};

const creditAmount = {
  color: "#ffffff",
  fontSize: "48px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
};

const creditSubtext = {
  color: "#d1fae5",
  fontSize: "14px",
  margin: "0",
};

const encourageSection = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #86efac",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const sectionTitle = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
};

const bulletText = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 8px 0",
};

const reminderText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "1.6",
  fontStyle: "italic",
  margin: "24px 0",
  padding: "16px",
  backgroundColor: "#f9fafb",
  borderLeft: "4px solid #10b981",
  borderRadius: "4px",
};

const button = {
  background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "16px 32px",
  margin: "16px 0 0 0",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "1.6",
  marginTop: "32px",
  marginBottom: "8px",
};

const signature = {
  color: "#2563eb",
  fontWeight: "bold",
  margin: "0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "40px 0 20px 0",
};

const unsubscribe = {
  color: "#9ca3af",
  fontSize: "11px",
  textAlign: "center" as const,
  margin: "0",
  lineHeight: "1.5",
};

const link = {
  color: "#6b7280",
  textDecoration: "underline",
};

