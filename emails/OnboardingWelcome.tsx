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

interface OnboardingWelcomeProps {
  userName?: string;
  baseUrl?: string;
}

export const OnboardingWelcome = ({
  userName = "there",
  baseUrl = "https://www.garrisonledger.com",
}: OnboardingWelcomeProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Garrison Ledger - Get value in 2 minutes</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Gradient Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Hi {userName},</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={text}>
              Welcome to Garrison Ledger. Here's how to get value in 2 minutes:
            </Text>

            {/* Profile Completion Section */}
            <Section style={actionSection}>
              <Text style={sectionTitle}>
                <strong>1. Complete your profile</strong>
              </Text>
              <Text style={text}>
                Enter rank, years of service, zip/MHA, and dependents to unlock personalized calculations.
              </Text>
              <Button style={button} href={`${baseUrl}/dashboard/profile/setup`}>
                Complete Your Profile →
              </Button>
            </Section>

            {/* LES Auditor Section */}
            <Section style={actionSection}>
              <Text style={sectionTitle}>
                <strong>2. Run your first LES audit</strong>
              </Text>
              <Text style={text}>
                We auto-fill official tables (BAH/BAS/Base Pay/COLA/SGLI). You enter your actual taxes from the LES; we validate the math and flag issues.
              </Text>
              <Button style={buttonSecondary} href={`${baseUrl}/dashboard/les-auditor`}>
                Try LES Auditor →
              </Button>
            </Section>

            {/* Premium Tools Section */}
            <Section style={actionSection}>
              <Text style={sectionTitle}>
                <strong>3. Try a premium tool:</strong>
              </Text>
              <Text style={text}>
                • <Link href={`${baseUrl}/dashboard/tdy`} style={linkBold}>TDY / Travel Voucher Copilot</Link>
              </Text>
              <Text style={text}>
                • <Link href={`${baseUrl}/dashboard/navigator`} style={linkBold}>Base / Area Navigator</Link>
              </Text>
            </Section>

            {/* Free Access */}
            <Text style={text}>
              You also have access to our <strong>6 free calculators</strong> and <strong>"Ask a Military Expert"</strong>.
            </Text>

            {/* Premium Upgrade Section */}
            <Section style={premiumSection}>
              <Text style={premiumTitle}>
                If you find value, Premium is $9.99/month:
              </Text>
              <Text style={bulletText}>
                • Unlimited audits + full detail and history
              </Text>
              <Text style={bulletText}>
                • Full TDY flow (unlimited docs)
              </Text>
              <Text style={bulletText}>
                • Complete Base Navigator rankings and watchlists
              </Text>
              <Text style={bulletText}>
                • More "Ask a Military Expert" questions
              </Text>
              <Button style={button} href={`${baseUrl}/dashboard/upgrade`}>
                Upgrade to Premium →
              </Button>
            </Section>

            {/* Sign-off */}
            <Text style={footer}>
              Questions or feedback? Reply to this email or contact{" "}
              <Link href="mailto:support@garrisonledger.com" style={link}>
                support@garrisonledger.com
              </Link>
            </Text>
            <Text style={signature}>— The Garrison Ledger Team</Text>
          </Section>

          {/* Unsubscribe Footer */}
          <Hr style={hr} />
          <Text style={unsubscribe}>
            You're receiving this as part of your welcome to Garrison Ledger.
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

export default OnboardingWelcome;

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
  background: "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)",
  padding: "40px 20px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  margin: "0",
  fontSize: "28px",
  fontWeight: "bold",
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

const actionSection = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const sectionTitle = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
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

const buttonSecondary = {
  background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
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

const linkBold = {
  color: "#2563eb",
  textDecoration: "underline",
  fontWeight: "600",
};

const premiumSection = {
  backgroundColor: "#fef3c7",
  border: "2px solid #f59e0b",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const premiumTitle = {
  color: "#92400e",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
};

const bulletText = {
  color: "#92400e",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 8px 0",
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
