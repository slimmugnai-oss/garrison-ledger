import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';

import contentSections from './content-sections.json';

// Register fonts if needed (optional - falls back to default)
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    margin: -40,
    padding: 60
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center'
  },
  coverSubtitle: {
    fontSize: 18,
    color: '#E0E7FF',
    textAlign: 'center',
    marginBottom: 40
  },
  coverName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 60
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    borderBottom: '2pt solid #E5E7EB',
    paddingBottom: 8
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12
  },
  text: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#4B5563',
    marginBottom: 8
  },
  bulletPoint: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#6B7280',
    marginLeft: 15,
    marginBottom: 5
  },
  highlight: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 6,
    marginVertical: 10
  },
  highlightText: {
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: 'bold'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#9CA3AF'
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: '#9CA3AF'
  }
});

type AssessmentData = {
  personal?: {
    age?: number;
    yearsOfService?: number;
    rankCategory?: string;
    dependents?: number;
    kidsAges?: string;
  };
  career?: {
    spouseEmployed?: boolean;
    careerField?: string;
    portableCareerInterest?: string;
    educationGoals?: boolean;
    mycaaEligible?: boolean;
  };
  financial?: {
    tspBalance?: number;
    tspContribution?: number;
    emergencyFund?: string;
    monthlyBudgetStress?: string;
    debtLevel?: string;
  };
  housing?: {
    currentBase?: string;
    housingStatus?: string;
    bahAmount?: number;
    buyInterest?: string;
    houseHackingInterest?: boolean;
  };
  timeline?: {
    pcsDate?: string;
    deploymentStatus?: string;
    sdpAvailable?: boolean;
    sdpAmount?: number;
    separationTimeline?: string;
  };
  goals?: {
    investmentComfort?: string;
    financialGoals?: string[];
  };
};

type RelevantSection = {
  hubTitle: string;
  section: {
    id: string;
    title: string;
    summary: string;
    keyPoints: string[];
  };
};

function getRelevantSections(assessment: AssessmentData): RelevantSection[] {
  const sections: RelevantSection[] = [];
  
  // Simple tag matching logic
  const matches = (sectionTags: string[]) => {
    return sectionTags.some(tag => {
      const [key, value] = tag.split(':');
      if (key === 'mycaaEligible' && value === 'true') return assessment.career?.mycaaEligible;
      if (key === 'educationGoals' && value === 'true') return assessment.career?.educationGoals;
      if (key === 'topic') return true; // Always include topic-based
      if (key === 'portableCareerInterest') return assessment.career?.portableCareerInterest === value;
      if (key === 'pcsDate') return assessment.timeline?.pcsDate === value;
      if (key === 'deploymentStatus') return assessment.timeline?.deploymentStatus === value;
      if (key === 'sdpAvailable' && value === 'true') return assessment.timeline?.sdpAvailable;
      if (key === 'housingStatus') return assessment.housing?.housingStatus === value;
      if (key === 'monthlyBudgetStress') return assessment.financial?.monthlyBudgetStress === value;
      return false;
    });
  };

  // Iterate through all hubs and sections
  Object.entries(contentSections).forEach(([, hub]) => {
    const hubData = hub as { title: string; url: string; sections: { id: string; title: string; tags: string[]; summary: string; keyPoints: string[] }[] };
    hubData.sections.forEach(section => {
      if (matches(section.tags)) {
        sections.push({
          hubTitle: hubData.title,
          section: section
        });
      }
    });
  });

  return sections.slice(0, 12); // Limit to top 12 most relevant
}

export function PersonalizedGuide({ userName, assessment }: { userName: string; assessment: AssessmentData }) {
  const relevantSections = getRelevantSections(assessment);
  const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Text style={styles.coverTitle}>Your Military{'\n'}Financial Roadmap</Text>
          <Text style={styles.coverSubtitle}>
            Personalized guide based on your assessment
          </Text>
          <Text style={{ fontSize: 14, color: '#FFFFFF', marginTop: 20 }}>
            Prepared for: {userName}
          </Text>
          <Text style={{ fontSize: 12, color: '#E0E7FF', marginTop: 10 }}>
            {generatedDate}
          </Text>
        </View>
      </Page>

      {/* Profile Summary Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Your Profile</Text>
        
        {assessment.personal && (
          <View style={styles.section}>
            <Text style={styles.subsectionTitle}>Personal & Service</Text>
            {assessment.personal.age && <Text style={styles.text}>• Age: {assessment.personal.age}</Text>}
            {assessment.personal.yearsOfService && <Text style={styles.text}>• Years of Service: {assessment.personal.yearsOfService}</Text>}
            {assessment.personal.dependents !== undefined && <Text style={styles.text}>• Dependents: {assessment.personal.dependents}</Text>}
          </View>
        )}

        {assessment.financial && (
          <View style={styles.section}>
            <Text style={styles.subsectionTitle}>Financial Snapshot</Text>
            {assessment.financial.tspBalance && <Text style={styles.text}>• TSP Balance: ${assessment.financial.tspBalance.toLocaleString()}</Text>}
            {assessment.financial.tspContribution && <Text style={styles.text}>• Monthly TSP Contribution: ${assessment.financial.tspContribution.toLocaleString()}</Text>}
            {assessment.financial.emergencyFund && <Text style={styles.text}>• Emergency Fund: {assessment.financial.emergencyFund} months</Text>}
          </View>
        )}

        {assessment.timeline && (
          <View style={styles.section}>
            <Text style={styles.subsectionTitle}>Timeline & Status</Text>
            {assessment.timeline.pcsDate && <Text style={styles.text}>• Next PCS: {assessment.timeline.pcsDate.replace('_', ' ')}</Text>}
            {assessment.timeline.deploymentStatus !== 'none' && <Text style={styles.text}>• Deployment: {assessment.timeline.deploymentStatus}</Text>}
            {assessment.timeline.sdpAvailable && assessment.timeline.sdpAmount && (
              <Text style={styles.text}>• SDP Payout: ${assessment.timeline.sdpAmount.toLocaleString()}</Text>
            )}
          </View>
        )}
        
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>

      {/* Curated Content Pages */}
      {relevantSections.map((item, idx) => (
        <Page key={idx} size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>{item.section.title}</Text>
          <Text style={{ fontSize: 10, color: '#6B7280', marginBottom: 15, fontStyle: 'italic' }}>
            From: {item.hubTitle}
          </Text>
          
          <Text style={styles.text}>{item.section.summary}</Text>
          
          {item.section.keyPoints && item.section.keyPoints.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.subsectionTitle}>Key Points:</Text>
              {item.section.keyPoints.map((point, i) => (
                <Text key={i} style={styles.bulletPoint}>• {point}</Text>
              ))}
            </View>
          )}
          
          <View style={styles.highlight}>
            <Text style={styles.highlightText}>
              💡 Next Step: Explore the full guide at garrisonledger.com{item.hubTitle.toLowerCase().includes('career') ? '/career-hub.html' : ''}
            </Text>
          </View>
          
          <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
        </Page>
      ))}

      {/* Tool Recommendations Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Your Financial Tools</Text>
        <Text style={styles.text}>
          Based on your assessment, we&apos;ve pre-configured these tools with your specific numbers:
        </Text>

        {assessment.financial?.tspBalance && (
          <View style={styles.section}>
            <Text style={styles.subsectionTitle}>📈 TSP Modeler</Text>
            <Text style={styles.text}>
              We&apos;ve pre-filled your TSP tool with:
            </Text>
            <Text style={styles.bulletPoint}>• Current balance: ${assessment.financial.tspBalance.toLocaleString()}</Text>
            <Text style={styles.bulletPoint}>• Monthly contribution: ${assessment.financial?.tspContribution?.toLocaleString() || 0}</Text>
            <Text style={styles.bulletPoint}>• Age: {assessment.personal?.age || 30}</Text>
            <Text style={styles.highlight}>
              <Text style={styles.highlightText}>
                → Launch tool: garrisonledger.com/dashboard/tools/tsp-modeler
              </Text>
            </Text>
          </View>
        )}

        {assessment.timeline?.sdpAvailable && assessment.timeline.sdpAmount && (
          <View style={styles.section}>
            <Text style={styles.subsectionTitle}>💰 SDP Strategist</Text>
            <Text style={styles.text}>
              Optimize your ${assessment.timeline.sdpAmount.toLocaleString()} SDP payout across three growth scenarios.
            </Text>
            <Text style={styles.highlight}>
              <Text style={styles.highlightText}>
                → Launch tool: garrisonledger.com/dashboard/tools/sdp-strategist
              </Text>
            </Text>
          </View>
        )}

        {assessment.housing?.houseHackingInterest && (
          <View style={styles.section}>
            <Text style={styles.subsectionTitle}>🏡 House Hacking Calculator</Text>
            <Text style={styles.text}>
              Analyze multi-unit investment potential with your BAH: ${assessment.housing.bahAmount?.toLocaleString() || 0}/month
            </Text>
            <Text style={styles.highlight}>
              <Text style={styles.highlightText}>
                → Launch tool: garrisonledger.com/dashboard/tools/house-hacking
              </Text>
            </Text>
          </View>
        )}
        
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>

      {/* Final Page: Next Steps */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Your Action Plan</Text>
        
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Priority Actions (Next 30 Days):</Text>
          {assessment.timeline?.pcsDate?.includes('within') && (
            <Text style={styles.bulletPoint}>✓ Start PCS checklist - review timeline and book movers</Text>
          )}
          {assessment.financial?.emergencyFund === '0' || assessment.financial?.emergencyFund === '1-2' ? (
            <Text style={styles.bulletPoint}>✓ Build emergency fund to 3-6 months expenses (priority #1)</Text>
          ) : null}
          {assessment.timeline?.sdpAvailable && (
            <Text style={styles.bulletPoint}>✓ Plan SDP payout allocation - run scenarios in SDP Strategist</Text>
          )}
          {assessment.career?.mycaaEligible && assessment.career?.educationGoals && (
            <Text style={styles.bulletPoint}>✓ Apply for MyCAA scholarship - up to $4,000 available</Text>
          )}
          {assessment.housing?.buyInterest === 'ready' || assessment.housing?.buyInterest === 'researching' ? (
            <Text style={styles.bulletPoint}>✓ Research VA loan options and run house hacking scenarios</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Resources & Support:</Text>
          <Text style={styles.text}>
            • Full resource hubs: garrisonledger.com (Career, PCS, Base Guides, Shopping, Deployment)
          </Text>
          <Text style={styles.text}>
            • Financial tools: Pre-configured with your numbers
          </Text>
          <Text style={styles.text}>
            • 7-day money-back guarantee on premium membership
          </Text>
          <Text style={styles.text}>
            • Questions? Contact: support@garrisonledger.com
          </Text>
        </View>

        <View style={{ marginTop: 40, padding: 15, backgroundColor: '#F9FAFB', borderRadius: 6 }}>
          <Text style={{ fontSize: 10, color: '#6B7280', textAlign: 'center', marginBottom: 5 }}>
            Educational purposes only. Not investment, tax, or legal advice.
          </Text>
          <Text style={{ fontSize: 9, color: '#9CA3AF', textAlign: 'center' }}>
            Generated by Garrison Ledger • {generatedDate}
          </Text>
        </View>
        
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>
    </Document>
  );
}

export default PersonalizedGuide;

