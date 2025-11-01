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

interface ReferralReceivedProps {
  userName?: string;
  creditsReceived?: number;
  referrerName?: string;
  baseUrl?: string;
}

export const ReferralReceived = ({
  userName = "Service Member",
  creditsReceived = 10,
  referrerName = "a friend",
  baseUrl = "https://www.garrisonledger.com",
}: ReferralReceivedProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome gift: ${creditsReceived} credit added to your account</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Welcome Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Welcome to Premium!</Heading>
            <Text style={headerSubtitle}>You just earned ${creditsReceived} credit</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={text}>
              Welcome aboard, {userName}!
            </Text>

            <Text style={text}>
              Thanks for upgrading to premium! Since you joined using {referrerName}'s referral
              code, we've added <strong>${creditsReceived}.00</strong> to your account as a welcome
              gift.
            </Text>

            {/* Credit Balance Card */}
            <Section style={creditCard}>
              <Text style={creditLabel}>Your Welcome Credit</Text>
              <Heading style={creditAmount}>${creditsReceived}.00</Heading>
              <Text style={creditSubtext}>
                This credit is automatically applied to your subscription
              </Text>
            </Section>

            {/* Premium Features Section */}
            <Section style={premiumSection}>
              <Text style={sectionTitle}>
                <strong>You now have unlimited access to:</strong>
              </Text>
              <Text style={bulletText}>
                ✓ <strong>LES Auditor</strong> - Catch pay errors before they compound
              </Text>
              <Text style={bulletText}>
                ✓ <strong>PCS Copilot</strong> - Calculate official entitlements in 15 minutes
              </Text>
              <Text style={bulletText}>
                ✓ <strong>Base Navigator</strong> - Data-driven PCS assignment decisions
              </Text>
              <Text style={bulletText}>
                ✓ <strong>Ask Military Expert</strong> - Unlimited questions with RAG-powered answers
              </Text>
              
              <Button style={button} href={`${baseUrl}/dashboard`}>
                Start Using Premium Tools →
              </Button>
            </Section>

            {/* Pay It Forward */}
            <Section style={referSection}>
              <Text style={sectionTitle}>
                <strong>Help another battle buddy</strong>
              </Text>
              <Text style={text}>
                You can earn $10 for every friend who upgrades with your code. They'll get $10 too!
              </Text>
              <Button style={buttonSecondary} href={`${baseUrl}/dashboard/referrals`}>
                Get Your Referral Code →
              </Button>
            </Section>

            {/* Sign-off */}
            <Text style={footer}>
              Need help getting started? Reply to this email or contact{" "}
              <Link href="mailto:support@garrisonledger.com" style={link}>
                support@garrisonledger.com
              </Link>
            </Text>
            <Text style={signature}>— The Garrison Ledger Team</Text>
          </Section>

          {/* Unsubscribe Footer */}
          <Hr style={hr} />
          <Text style={unsubscribe}>
            You're receiving this as a premium member of Garrison Ledger.
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

export default ReferralReceived;

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
  background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
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
  color: "#e9d5ff",
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
  background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
  borderRadius: "12px",
  padding: "32px",
  textAlign: "center" as const,
  margin: "32px 0",
};

const creditLabel = {
  color: "#e9d5ff",
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
  color: "#e9d5ff",
  fontSize: "14px",
  margin: "0",
};

const premiumSection = {
  backgroundColor: "#faf5ff",
  border: "1px solid #d8b4fe",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const sectionTitle = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
};

const bulletText = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.8",
  margin: "0 0 8px 0",
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

const referSection = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #86efac",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
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

