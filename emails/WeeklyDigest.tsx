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

interface WeeklyDigestProps {
  userName?: string;
  hasPlan?: boolean;
  planUpdated?: boolean;
  baseUrl?: string;
}

export const WeeklyDigest = ({
  userName = 'Service Member',
  hasPlan = false,
  planUpdated = false,
  baseUrl = 'https://garrison-ledger.vercel.app',
}: WeeklyDigestProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Weekly Military Finance Update</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Weekly Update</Heading>
          
          <Text style={text}>
            Hi {userName}, here's what's new at Garrison Ledger this week:
          </Text>

          {/* Plan Status */}
          {hasPlan ? (
            <Section style={successBox}>
              <Heading style={boxHeading}>
                Your AI Plan {planUpdated ? 'Has Been Updated!' : 'is Ready'}
              </Heading>
              <Text style={boxText}>
                {planUpdated 
                  ? "We've refreshed your plan with new content. Check out the latest recommendations!" 
                  : 'Your personalized financial plan is waiting for you. Take action this week!'}
              </Text>
            </Section>
          ) : (
            <Section style={warningBox}>
              <Heading style={boxHeading}>
                You're Missing Your Personalized Plan
              </Heading>
              <Text style={boxText}>
                Complete your assessment to get AI-curated financial strategies for your unique situation.
              </Text>
            </Section>
          )}

          {/* New Content */}
          <Heading style={h3}>New Content This Week</Heading>
          <Text style={text}>
            • TSP allocation strategies for 2025 market conditions<br />
            • PCS budgeting for OCONUS moves<br />
            • Deployment SDP maximization tactics
          </Text>

          {/* CTA Button */}
          <Button style={button} href={`${baseUrl}/dashboard`}>
            Open Your Dashboard →
          </Button>

          {/* Footer */}
          <Hr style={hr} />
          <Text style={unsubscribe}>
            Don't want weekly emails?{' '}
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
  fontSize: '20px',
  fontWeight: 'bold',
  marginTop: '24px',
  marginBottom: '12px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const successBox = {
  backgroundColor: '#dbeafe',
  borderLeft: '4px solid #2563eb',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '8px',
};

const warningBox = {
  backgroundColor: '#fef3c7',
  borderLeft: '4px solid #f59e0b',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '8px',
};

const boxHeading = {
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const boxText = {
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

const hr = {
  borderColor: '#e5e7eb',
  margin: '40px 0 20px 0',
};

const unsubscribe = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
};

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
};

