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
  userName = "Service Member",
  baseUrl = "https://www.garrisonledger.com",
}: OnboardingWelcomeProps) => {
  const calculators = [
    { emoji: "💰", name: "TSP Calculator", desc: "Project retirement growth" },
    { emoji: "📦", name: "PCS Planner", desc: "Budget move + DITY profit" },
    { emoji: "🏠", name: "House Hacking", desc: "Multi-unit property ROI" },
    { emoji: "🎯", name: "SDP Strategist", desc: "Deployment savings" },
    { emoji: "🎓", name: "Career Analyzer", desc: "Transition planning" },
    { emoji: "🛒", name: "On-Base Savings", desc: "Commissary benefits" },
  ];

  return (
    <Html>
      <Head />
      <Preview>Welcome to Garrison Ledger - 6 Free Tools Ready to Use</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Gradient Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Welcome Aboard, {userName}</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={text}>
              You just joined <strong>500+ military families</strong> using Garrison Ledger.
            </Text>

            <Text style={text}>
              You have immediate access to{" "}
              <strong>6 free military-specific financial calculators:</strong>
            </Text>

            {/* Calculator List */}
            <Section style={calculatorList}>
              {calculators.map((calc, idx) => (
                <Section key={idx} style={calculatorItem}>
                  <Text style={calculatorEmoji}>{calc.emoji}</Text>
                  <Section style={calculatorInfo}>
                    <Text style={calculatorName}>{calc.name}</Text>
                    <Text style={calculatorDesc}>{calc.desc}</Text>
                  </Section>
                </Section>
              ))}
            </Section>

            <Text style={highlight}>
              <strong>Best part?</strong> No paywall. Use them right now.
            </Text>

            {/* CTA Button */}
            <Button style={button} href={`${baseUrl}/dashboard`}>
              Explore Free Calculators →
            </Button>

            {/* Sign-off */}
            <Text style={footer}>Questions? Just reply to this email - we read every message.</Text>
            <Text style={signature}>- The Garrison Ledger Team</Text>
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

const calculatorList = {
  margin: "24px 0",
};

const calculatorItem = {
  display: "flex" as const,
  alignItems: "flex-start" as const,
  marginBottom: "12px",
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "12px",
};

const calculatorEmoji = {
  fontSize: "24px",
  margin: "0 12px 0 0",
  lineHeight: "1",
};

const calculatorInfo = {
  flex: "1",
};

const calculatorName = {
  color: "#1f2937",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 2px 0",
};

const calculatorDesc = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "0",
};

const highlight = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "24px 0 16px 0",
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
