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

interface WeeklyDigestProps {
  userName?: string;
  weeklyUpdate?: string;
  baseUrl?: string;
}

export const WeeklyDigest = ({
  userName = "Service Member",
  weeklyUpdate = "2025 TSP contribution limits updated in all calculators",
  baseUrl = "https://www.garrisonledger.com",
}: WeeklyDigestProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Weekly Military Finance Update</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Heading style={h1}>Your Weekly Update</Heading>

            <Text style={text}>Hi {userName}, this week at Garrison Ledger:</Text>

            {/* Weekly Update Highlight */}
            <Section style={highlightBox}>
              <Heading style={boxHeading}>New This Week</Heading>
              <Text style={boxText}>{weeklyUpdate}</Text>
            </Section>

            {/* Quick Wins */}
            <Heading style={h3}>Quick Wins:</Heading>
            <Text style={text}>
              • Check your LES for pay errors (LES Auditor)
              <br />
              • Compare duty stations (Base Navigator has 203 bases)
              <br />• Project retirement growth (TSP Calculator)
            </Text>

            {/* CTA Button */}
            <Button style={button} href={`${baseUrl}/dashboard`}>
              Open Dashboard →
            </Button>

            {/* Sign-off */}
            <Text style={footer}>See you next week.</Text>
            <Text style={signature}>- The Garrison Ledger Team</Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Text style={unsubscribe}>
            Don't want weekly emails?{" "}
            <Link href={`${baseUrl}/dashboard/settings`} style={link}>
              Update preferences
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WeeklyDigest;

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

const content = {
  padding: "40px 20px",
};

const h1 = {
  color: "#2563eb",
  fontSize: "28px",
  fontWeight: "bold",
  marginBottom: "16px",
  marginTop: "0",
};

const h3 = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "24px 0 12px 0",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const highlightBox = {
  backgroundColor: "#dbeafe",
  borderLeft: "4px solid #2563eb",
  padding: "20px",
  margin: "24px 0",
  borderRadius: "8px",
};

const boxHeading = {
  color: "#1e40af",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
};

const boxText = {
  color: "#1e40af",
  fontSize: "14px",
  margin: "0",
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
