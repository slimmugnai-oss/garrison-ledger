// Manual Atomic Content Manifest - Gold Standard Curation
// Each atom is precisely defined with exact extraction boundaries

export type AtomicBlock = {
  id: string;
  source: 'pcs-hub' | 'career-hub' | 'deployment' | 'on-base-shopping';
  type: 'tool' | 'checklist' | 'pro_tip_list' | 'faq_section' | 'guide' | 'calculator';
  title: string;
  // Extraction strategy: CSS selector or section ID from source HTML
  extractionHint: string;
  tags: string[];
  description: string; // What this atom provides
};

export const ATOMIC_MANIFEST: AtomicBlock[] = [
  // ==================== PCS HUB ATOMS ====================
  {
    id: 'pcs-timeline-tool',
    source: 'pcs-hub',
    type: 'tool',
    title: 'Interactive PCS Timeline Generator',
    extractionHint: 'section#phase1 .card:has(h3:contains("Timeline Generator"))',
    tags: ['pcs', 'timeline', 'planning'],
    description: 'Interactive tool that generates personalized PCS timeline based on report date'
  },
  {
    id: 'pcs-master-checklist',
    source: 'pcs-hub',
    type: 'checklist',
    title: 'Complete PCS Checklist',
    extractionHint: 'section#phase1 div#checklist parent content',
    tags: ['pcs', 'checklist', 'tasks'],
    description: 'Comprehensive task checklist covering legal, financial, and household readiness'
  },
  {
    id: 'pcs-budget-calculator',
    source: 'pcs-hub',
    type: 'calculator',
    title: 'PCS Financial Calculator',
    extractionHint: 'Financial Command Center section with calculators',
    tags: ['pcs', 'budget', 'dla', 'tle'],
    description: 'Calculator for DLA, TLE, per diem, and expense tracking'
  },
  {
    id: 'efmp-pcs-support',
    source: 'pcs-hub',
    type: 'guide',
    title: 'EFMP Family PCS Support Guide',
    extractionHint: 'section#mental-emotional div:contains("Specialized Support for EFMP")',
    tags: ['pcs', 'efmp', 'special-needs'],
    description: 'Specialized guidance for EFMP families during PCS including coordinator contact and medical screening'
  },
  {
    id: 'pcs-emotional-readiness',
    source: 'pcs-hub',
    type: 'guide',
    title: 'Mental & Emotional PCS Preparation',
    extractionHint: 'section#mental-emotional main content without EFMP subsection',
    tags: ['pcs', 'mental-health', 'family'],
    description: 'Coping strategies, counseling resources, and helping children through relocation'
  },
  {
    id: 'ppm-profit-guide',
    source: 'pcs-hub',
    type: 'guide',
    title: 'PPM (Do-It-Yourself Move) Guide',
    extractionHint: 'PPM Pro Guide section',
    tags: ['pcs', 'ppm', 'dity', 'money'],
    description: 'Complete guide to personally procured moves including profit estimation and documentation'
  },
  {
    id: 'oconus-pcs-guide',
    source: 'pcs-hub',
    type: 'guide',
    title: 'OCONUS PCS Navigator',
    extractionHint: 'OCONUS Navigator accordion section',
    tags: ['pcs', 'oconus', 'overseas'],
    description: 'Country-specific guides for Germany, Japan, Korea with VAT, pets, driving'
  },
  {
    id: 'pcs-faq',
    source: 'pcs-hub',
    type: 'faq_section',
    title: 'PCS Questions Answered',
    extractionHint: 'FAQ section grid layout',
    tags: ['pcs', 'faq', 'dla', 'tle', 'ppm'],
    description: 'Common questions about DLA, TLE, PPM, weight allowances, and entitlements'
  },

  // ==================== CAREER HUB ATOMS ====================
  {
    id: 'portable-careers-guide',
    source: 'career-hub',
    type: 'guide',
    title: 'Portable Career Fields Explorer',
    extractionHint: 'Career Exploration section with tabbed sectors',
    tags: ['career', 'remote', 'portable'],
    description: 'Tech, healthcare, business, creative, and education career sectors with remote opportunities'
  },
  {
    id: 'mycaa-complete-guide',
    source: 'career-hub',
    type: 'checklist',
    title: 'MyCAA Scholarship Complete Guide',
    extractionHint: 'Education Hub section with eligibility and steps',
    tags: ['career', 'education', 'mycaa', 'funding'],
    description: 'Eligibility requirements, step-by-step application process, and approved programs for $4,000 benefit'
  },
  {
    id: 'resume-power-up',
    source: 'career-hub',
    type: 'guide',
    title: 'Military Spouse Resume Translator',
    extractionHint: 'Resume Power-Up section with before/after examples',
    tags: ['career', 'resume', 'job-search'],
    description: 'How to translate deployments, PCS moves, and volunteer work into professional achievements'
  },
  {
    id: 'federal-employment-guide',
    source: 'career-hub',
    type: 'guide',
    title: 'Federal Employment & USAJOBS Mastery',
    extractionHint: 'Mastering Federal Employment section',
    tags: ['career', 'federal', 'usajobs', 'msp'],
    description: 'Federal resume requirements, Military Spouse Preference, and USAJOBS navigation'
  },
  {
    id: 'entrepreneur-toolkit',
    source: 'career-hub',
    type: 'checklist',
    title: 'Spouse Entrepreneur Toolkit',
    extractionHint: 'Spouse-Preneur section with 3-step framework',
    tags: ['career', 'business', 'entrepreneur'],
    description: 'Business plan creation, legal structure selection, and first customer acquisition'
  },
  {
    id: 'license-transfer-guide',
    source: 'career-hub',
    type: 'guide',
    title: 'Professional License Transfer Guide',
    extractionHint: 'Navigating State License Transfers section',
    tags: ['career', 'licensing', 'pcs'],
    description: 'Interstate license recognition and $1,000 reimbursement process'
  },
  {
    id: 'high-impact-certs',
    source: 'career-hub',
    type: 'pro_tip_list',
    title: 'High-Impact Certifications',
    extractionHint: 'Upskilling section with PMP, Salesforce, Google certs',
    tags: ['career', 'certification', 'upskilling'],
    description: 'PMP, Salesforce Admin, and Google Career Certificates with learning paths'
  },

  // ==================== DEPLOYMENT ATOMS ====================
  {
    id: 'pre-deployment-checklist',
    source: 'deployment',
    type: 'checklist',
    title: 'Pre-Deployment Readiness Checklist',
    extractionHint: 'Phase 1 section with legal, financial, household checklists',
    tags: ['deployment', 'preparation', 'legal', 'financial'],
    description: 'Legal (POA, wills), financial (allotments, SCRA), and household readiness tasks'
  },
  {
    id: 'deployment-family-pact',
    source: 'deployment',
    type: 'tool',
    title: 'Family Deployment Communication Planner',
    extractionHint: 'Our Family Deployment Pact interactive section',
    tags: ['deployment', 'family', 'communication'],
    description: 'Interactive planner for family goals, communication plan, and support strategies'
  },
  {
    id: 'homefront-survival',
    source: 'deployment',
    type: 'guide',
    title: 'Homefront Survival Guide',
    extractionHint: 'Phase 2 section with emotional phases, childcare, OPSEC',
    tags: ['deployment', 'homefront', 'solo-parenting'],
    description: 'Emotional phases timeline, childcare crisis resources, OPSEC rules, self-care toolkit'
  },
  {
    id: 'reintegration-roadmap',
    source: 'deployment',
    type: 'guide',
    title: 'Reintegration & Homecoming Roadmap',
    extractionHint: 'Phase 3 section with 72-hour guide and challenges',
    tags: ['deployment', 'reintegration', 'homecoming'],
    description: '72-hour expectations, communication challenges, parenting together, building new normal'
  },
  {
    id: 'deployment-faq',
    source: 'deployment',
    type: 'faq_section',
    title: 'Deployment Questions Answered',
    extractionHint: 'FAQ grid section',
    tags: ['deployment', 'faq', 'poa', 'pay'],
    description: 'POA types, deployment pay, OPSEC, childcare, counseling resources'
  },

  // ==================== FINANCE/SHOPPING ATOMS ====================
  {
    id: 'les-decoder',
    source: 'on-base-shopping',
    type: 'guide',
    title: 'LES (Leave & Earnings Statement) Decoder',
    extractionHint: 'Decoding Your Paycheck section',
    tags: ['finance', 'les', 'pay', 'budget'],
    description: 'Base Pay, BAH, BAS breakdown with DFAS official guide link'
  },
  {
    id: 'tsp-brs-essentials',
    source: 'on-base-shopping',
    type: 'guide',
    title: 'TSP & BRS Essentials',
    extractionHint: 'Planning for the Future section',
    tags: ['finance', 'tsp', 'retirement', 'brs'],
    description: 'Two pillars (pension + TSP), government match explanation, fund allocation basics'
  },
  {
    id: 'emergency-fund-builder',
    source: 'on-base-shopping',
    type: 'guide',
    title: 'Emergency Fund & Financial Foundation',
    extractionHint: 'Building Your Financial Foundation section',
    tags: ['finance', 'emergency-fund', 'budget', 'debt'],
    description: '3-6 month emergency fund strategy, SCRA benefits, free financial counseling access'
  },
  {
    id: 'commissary-savings-calculator',
    source: 'on-base-shopping',
    type: 'calculator',
    title: 'Commissary & Exchange Savings Calculator',
    extractionHint: 'Visualize Your Savings section with interactive calculators',
    tags: ['finance', 'commissary', 'exchange', 'savings'],
    description: 'Interactive calculators for commissary and exchange annual savings estimation'
  },
  {
    id: 'commissary-exchange-basics',
    source: 'on-base-shopping',
    type: 'guide',
    title: 'Commissary & Exchange Shopping Guide',
    extractionHint: 'Commissary and Exchange sections combined',
    tags: ['finance', 'shopping', 'commissary', 'exchange'],
    description: 'How commissary pricing works, 5% surcharge, MILITARY STAR card, MWR funding'
  },
  {
    id: 'oconus-shopping-guide',
    source: 'on-base-shopping',
    type: 'guide',
    title: 'OCONUS Shopping Navigator',
    extractionHint: 'Shopping Overseas section with country tabs',
    tags: ['finance', 'oconus', 'vat', 'cola'],
    description: 'Country-specific shopping guides for Germany, Japan, Korea, Italy with VAT/currency info'
  },
  {
    id: 'shopping-pro-tips',
    source: 'on-base-shopping',
    type: 'pro_tip_list',
    title: 'On-Base Shopping Pro-Tips',
    extractionHint: 'Shop Like a Pro and From the Trenches sections',
    tags: ['finance', 'shopping', 'tips'],
    description: 'PCS stock-up strategies, case lot sales, when to shop, tipping baggers'
  },
];

// Quick lookup helpers
export const getAtomById = (id: string) => ATOMIC_MANIFEST.find(a => a.id === id);
export const getAtomsBySource = (source: string) => ATOMIC_MANIFEST.filter(a => a.source === source);
export const getAtomsByType = (type: string) => ATOMIC_MANIFEST.filter(a => a.type === type);
export const getAtomsByTag = (tag: string) => ATOMIC_MANIFEST.filter(a => a.tags.includes(tag));

