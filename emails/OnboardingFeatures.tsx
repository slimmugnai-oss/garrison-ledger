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
} from '@react-email/components';
import * as React from 'react';

interface OnboardingFeaturesProps {
  userName?: string;
  baseUrl?: string;
}

export const OnboardingFeatures = ({
  userName = 'Service Member',
  baseUrl = 'https://app.familymedia.com',
}: OnboardingFeaturesProps) => {
  return (
    <Html>
      <Head />
      <Preview>Planning a PCS or checking your LES? Check these 2 unique tools</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Heading style={h1}>Quick Question, {userName}</Heading>
            
            <Text style={text}>
              Planning a PCS or checking your LES?
            </Text>

            {/* Feature 1: Base Navigator */}
            <Section style={featureCard}>
              <Heading style={featureTitle}>🗺️ Base Navigator</Heading>
              <Text style={featureText}>
                We've mapped <strong>203 worldwide bases</strong> with BAH rates, live weather, housing market data, and school ratings. Compare Fort Bragg vs JBLM vs Ramstein before you choose orders.
              </Text>
              <Button style={featureButton} href={`${baseUrl}/dashboard/navigator`}>
                Explore Base Navigator →
              </Button>
            </Section>

            {/* Feature 2: LES Auditor */}
            <Section style={featureCard}>
              <Heading style={featureTitle}>🔍 LES Auditor</Heading>
              <Text style={featureText}>
                Upload your LES, we automatically detect pay errors. <strong>23% of military pay has discrepancies</strong> (DFAS study). Catch them before Finance does.
              </Text>
              <Button style={featureButton} href={`${baseUrl}/dashboard/tools/les-auditor`}>
                Try Free LES Audit →
              </Button>
            </Section>

            {/* Social Proof */}
            <Section style={testimonialBox}>
              <Text style={testimonialQuote}>
                "Found $847 BAH error I would've missed"
              </Text>
              <Text style={testimonialAuthor}>
                - Real Garrison Ledger User
              </Text>
            </Section>

            <Text style={note}>
              <strong>Try 1 free LES audit this month.</strong> No credit card required.
            </Text>

            {/* Sign-off */}
            <Text style={footer}>
              Questions? Reply to this email.
            </Text>
            <Text style={signature}>
              - The Garrison Ledger Team
            </Text>
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

export default OnboardingFeatures;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginBottom: '64px',
  maxWidth: '600px',
};

const content = {
  padding: '40px 20px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '16px',
  marginTop: '0',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
};

const featureCard = {
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  margin: '0 0 20px 0',
};

const featureTitle = {
  color: '#2563eb',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const featureText = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const featureButton = {
  backgroundColor: '#ffffff',
  border: '2px solid #2563eb',
  borderRadius: '8px',
  color: '#2563eb',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const testimonialBox = {
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #16a34a',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '8px',
};

const testimonialQuote = {
  color: '#166534',
  fontSize: '16px',
  fontStyle: 'italic',
  margin: '0 0 8px 0',
  lineHeight: '1.6',
};

const testimonialAuthor = {
  color: '#15803d',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
};

const note = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
  marginTop: '32px',
  marginBottom: '8px',
};

const signature = {
  color: '#2563eb',
  fontWeight: 'bold',
  margin: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '40px 0 20px 0',
};

const unsubscribe = {
  color: '#9ca3af',
  fontSize: '11px',
  textAlign: 'center' as const,
  margin: '0',
  lineHeight: '1.5',
};

const link = {
  color: '#6b7280',
  textDecoration: 'underline',
};

