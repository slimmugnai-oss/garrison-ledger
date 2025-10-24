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

interface OnboardingPremiumProps {
  userName?: string;
  baseUrl?: string;
}

export const OnboardingPremium = ({
  userName = "Service Member",
  baseUrl = "https://www.garrisonledger.com",
}: OnboardingPremiumProps) => {
  const premiumFeatures = [
    { emoji: "🔍", name: "Unlimited LES Audits", desc: "vs 1/month free" },
    { emoji: "📦", name: "PCS Copilot", desc: "Full move planning with JTR" },
    { emoji: "✈️", name: "TDY Copilot", desc: "Travel reimbursement optimizer" },
    { emoji: "🗺️", name: "Full Base Navigator", desc: "School ratings for 203 bases" },
    { emoji: "📁", name: "Document Binder", desc: "Secure LES/orders storage" },
  ];

  return (
    <Html>
      <Head />
      <Preview>Ready for full access? Unlock all premium features for $9.99/month</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Premium Badge Header */}
          <Section style={header}>
            <Text style={badge}>PREMIUM</Text>
            <Heading style={headerTitle}>Ready for Full Access?</Heading>
          </Section>

          <Section style={content}>
            <Text style={text}>You've explored the free tools. Ready to unlock everything?</Text>

            {/* Premium Features */}
            <Heading style={h2}>Premium Includes:</Heading>

            <Section style={featureList}>
              {premiumFeatures.map((feature, idx) => (
                <Section key={idx} style={featureItem}>
                  <Text style={featureEmoji}>{feature.emoji}</Text>
                  <Section style={featureInfo}>
                    <Text style={featureName}>{feature.name}</Text>
                    <Text style={featureDesc}>{feature.desc}</Text>
                  </Section>
                </Section>
              ))}
            </Section>

            {/* Pricing Box */}
            <Section style={pricingBox}>
              <Heading style={price}>$9.99/month</Heading>
              <Text style={priceSubtext}>
                Less than lunch. Could save you <strong>$5,000+/year</strong> in found pay errors
                and optimized moves.
              </Text>
            </Section>

            {/* CTA */}
            <Button style={button} href={`${baseUrl}/dashboard/upgrade`}>
              Try Premium Free for 7 Days →
            </Button>

            {/* Guarantee */}
            <Section style={guaranteeBox}>
              <Text style={guaranteeText}>
                <strong>100% refund guarantee.</strong> Cancel anytime, no questions asked.
              </Text>
            </Section>

            {/* Sign-off */}
            <Text style={footer}>Questions? Reply to this email.</Text>
            <Text style={signature}>- The Garrison Ledger Team</Text>
          </Section>

          {/* Unsubscribe Footer */}
          <Hr style={hr} />
          <Text style={unsubscribe}>
            <Link href={`${baseUrl}/dashboard/settings`} style={link}>
              Update email preferences
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OnboardingPremium;

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
  background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
  padding: "40px 20px",
  textAlign: "center" as const,
};

const badge = {
  color: "#ffffff",
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: "bold",
  letterSpacing: "1px",
  padding: "6px 12px",
  display: "inline-block",
  margin: "0 0 12px 0",
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

const h2 = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "24px 0 16px 0",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px 0",
};

const featureList = {
  margin: "0 0 24px 0",
};

const featureItem = {
  display: "flex" as const,
  alignItems: "flex-start" as const,
  marginBottom: "16px",
  padding: "16px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
};

const featureEmoji = {
  fontSize: "24px",
  margin: "0 12px 0 0",
  lineHeight: "1",
};

const featureInfo = {
  flex: "1",
};

const featureName = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 4px 0",
};

const featureDesc = {
  color: "#6b7280",
  fontSize: "13px",
  margin: "0",
};

const pricingBox = {
  background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const price = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
};

const priceSubtext = {
  color: "#fae8ff",
  fontSize: "14px",
  margin: "0",
  lineHeight: "1.5",
};

const button = {
  background: "#ffffff",
  border: "none",
  borderRadius: "8px",
  color: "#7c3aed",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "16px 32px",
  margin: "24px 0",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const guaranteeBox = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #86efac",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const guaranteeText = {
  color: "#166534",
  fontSize: "14px",
  margin: "0",
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
