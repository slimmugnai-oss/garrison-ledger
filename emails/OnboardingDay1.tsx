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

interface OnboardingDay1Props {
  userName?: string;
  baseUrl?: string;
}

export const OnboardingDay1 = ({
  userName = 'Service Member',
  baseUrl = 'https://garrison-ledger.vercel.app',
}: OnboardingDay1Props) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Garrison Ledger - Your Mission Briefing</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Heading style={h1}>Welcome Aboard, {userName}</Heading>
          
          <Text style={text}>
            You just joined <strong>500+ military families</strong> who are taking control of their finances with AI-powered planning.
          </Text>

          {/* CTA Box */}
          <Section style={ctaBox}>
            <Heading style={ctaHeading}>Your Next Step (2 Minutes)</Heading>
            <Text style={ctaText}>
              Complete your profile so AI can curate the perfect financial plan for your unique military situation.
            </Text>
          </Section>

          {/* Button */}
          <Button style={button} href={`${baseUrl}/dashboard/profile/setup`}>
            Complete Your Profile →
          </Button>

          {/* Benefits List */}
          <Heading style={h3}>What You Get (100% Free)</Heading>
          <Text style={text}>
            • 6 Military-Specific Financial Calculators<br />
            • 410+ Expert Content Blocks<br />
            • AI-Curated Personalized Plan<br />
            • 5 Resource Hub Pages
          </Text>

          {/* Sign-off */}
          <Text style={footer}>
            Questions? Just reply to this email - we read every message.<br />
            <strong style={{ color: '#2563eb' }}>- The Garrison Ledger Team</strong>
          </Text>

          {/* Unsubscribe Footer */}
          <Hr style={hr} />
          <Text style={unsubscribe}>
            You're receiving this as part of your 7-day onboarding sequence.<br />
            <Link href={`${baseUrl}/dashboard/settings`} style={link}>
              Update email preferences
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OnboardingDay1;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#2563eb',
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '16px',
  marginTop: '0',
};

const h3 = {
  color: '#111827',
  fontSize: '18px',
  fontWeight: 'bold',
  marginTop: '32px',
  marginBottom: '16px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const ctaBox = {
  backgroundColor: '#dbeafe',
  borderLeft: '4px solid #2563eb',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '8px',
};

const ctaHeading = {
  color: '#1e40af',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const ctaText = {
  color: '#1e40af',
  fontSize: '14px',
  margin: '0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '16px 32px',
  margin: '24px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
  marginTop: '32px',
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
};

const link = {
  color: '#6b7280',
  textDecoration: 'underline',
};

