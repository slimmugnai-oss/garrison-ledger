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

interface PCSChecklistProps {
  baseUrl?: string;
}

export const PCSChecklist = ({ baseUrl = "https://www.garrisonledger.com" }: PCSChecklistProps) => {
  const checklistItems = [
    { text: "Review orders (dates, dependents, entitlements)" },
    { text: "Calculate DITY/PPM profit potential" },
    { text: "Request advance pay (up to 1 month)" },
    { text: "Research new BAH rate" },
    { text: "Track ALL receipts (DLA, mileage, lodging, per diem)" },
    { text: "Update TSP address and maintain contributions" },
  ];

  return (
    <Html>
      <Head />
      <Preview>Your PCS Financial Checklist - Mission brief for a successful move</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Your PCS Financial Checklist</Heading>
            <Text style={headerSubtitle}>Mission brief: Execute a financially successful move</Text>
          </Section>

          {/* Main Content */}
          <Heading style={h2}>Mission Brief: PCS Financial Preparation</Heading>

          <Text style={text}>
            You're about to execute one of the most financially complex operations in military life.
            This checklist will help you maximize your entitlements and avoid costly mistakes.
          </Text>

          {/* Checklist */}
          <Section style={checklistBox}>
            <Heading style={checklistHeading}>Critical Financial Actions</Heading>

            <Section style={checklistItem}>
              <Text style={checkmarkText}>✓</Text>
              <Text style={itemText}>
                <strong>Review Your Orders:</strong> Verify reporting date, authorized travel days,
                and dependent authorization
              </Text>
            </Section>

            <Section style={checklistItem}>
              <Text style={checkmarkText}>✓</Text>
              <Text style={itemText}>
                <strong>Calculate DITY/PPM Potential:</strong> Compare government contracted move
                vs. do-it-yourself profit opportunity
              </Text>
            </Section>

            <Section style={checklistItem}>
              <Text style={checkmarkText}>✓</Text>
              <Text style={itemText}>
                <strong>Request Advance Pay:</strong> Get up to 1 month's pay + allowances to cover
                upfront costs
              </Text>
            </Section>

            <Section style={checklistItem}>
              <Text style={checkmarkText}>✓</Text>
              <Text style={itemText}>
                <strong>Research New BAH Rate:</strong> Understand housing cost changes and budget
                accordingly
              </Text>
            </Section>

            <Section style={checklistItem}>
              <Text style={checkmarkText}>✓</Text>
              <Text style={itemText}>
                <strong>Track All Receipts:</strong> Keep every receipt for DLA, mileage, lodging,
                and per diem claims
              </Text>
            </Section>

            <Section style={checklistItem}>
              <Text style={checkmarkText}>✓</Text>
              <Text style={itemText}>
                <strong>Update Your TSP:</strong> Maintain contributions during PCS and update
                address
              </Text>
            </Section>
          </Section>

          {/* CTA */}
          <Button style={button} href={`${baseUrl}/dashboard/tools/pcs-planner`}>
            Use PCS Financial Planner
          </Button>

          {/* Additional Resources */}
          <Section style={resourcesBox}>
            <Heading style={resourcesHeading}>Free Tools Available Now</Heading>
            <Text style={resourcesList}>
              • PCS Financial Planner - Budget your entire move
              <br />
              • House Hacking Calculator - Analyze property investment potential
              <br />
              • TSP Calculator - Project retirement growth
              <br />• Base Navigator - Compare 203 installations worldwide
            </Text>
          </Section>

          {/* Sign-off */}
          <Text style={footer}>Questions? Reply to this email - we read every message.</Text>
          <Text style={signature}>- The Garrison Ledger Team</Text>

          {/* Footer */}
          <Hr style={hr} />
          <Text style={unsubscribe}>
            You received this email because you requested the PCS Financial Checklist from Garrison
            Ledger.
            <br />
            Garrison Ledger | Military Financial Intelligence Platform
            <br />
            <Link href={`${baseUrl}/unsubscribe`} style={link}>
              Unsubscribe
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PCSChecklist;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
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

const headerSubtitle = {
  color: "#e0e7ff",
  margin: "12px 0 0 0",
  fontSize: "16px",
};

const h2 = {
  color: "#1f2937",
  fontSize: "22px",
  margin: "40px 20px 16px 20px",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 20px 24px 20px",
};

const checklistBox = {
  backgroundColor: "#f9fafb",
  borderLeft: "4px solid #2563eb",
  padding: "24px",
  margin: "24px 20px",
  borderRadius: "8px",
};

const checklistHeading = {
  color: "#1f2937",
  fontSize: "18px",
  margin: "0 0 16px 0",
};

const checklistItem = {
  display: "flex" as const,
  marginBottom: "12px",
  alignItems: "flex-start" as const,
};

const checkmarkText = {
  color: "#2563eb",
  fontSize: "20px",
  marginRight: "12px",
  lineHeight: "1.4",
};

const itemText = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "16px 32px",
  margin: "32px 20px",
  boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)",
};

const resourcesBox = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #86efac",
  padding: "20px",
  borderRadius: "8px",
  margin: "24px 20px",
};

const resourcesHeading = {
  color: "#166534",
  margin: "0 0 12px 0",
  fontSize: "16px",
};

const resourcesList = {
  color: "#15803d",
  margin: "0",
  fontSize: "14px",
  lineHeight: "1.8",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "32px 20px 0 20px",
};

const signature = {
  color: "#2563eb",
  fontWeight: "bold",
  margin: "8px 20px 0 20px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "40px 20px 20px 20px",
};

const unsubscribe = {
  color: "#6b7280",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0 20px 40px 20px",
  lineHeight: "1.5",
};

const link = {
  color: "#6b7280",
  textDecoration: "underline",
};
