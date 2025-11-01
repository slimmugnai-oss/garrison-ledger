import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SitePage {
  path: string;
  title: string;
  category: string;
  tier_required: string | null;
  description: string;
  status: 'active' | 'deprecated' | 'beta';
  dependencies?: Record<string, unknown>;
}

const sitePages: SitePage[] = [
  // Home & Core (2)
  {
    path: '/',
    title: 'Home',
    category: 'Home & Core',
    tier_required: null,
    description: 'Landing page with platform overview and features',
    status: 'active',
    dependencies: { apis: [], external: [] }
  },
  {
    path: '/dashboard',
    title: 'Dashboard',
    category: 'Home & Core',
    tier_required: 'free',
    description: 'Main user dashboard with personalized overview',
    status: 'active',
    dependencies: { apis: ['/api/user-profile'], external: [] }
  },

  // Dashboard Pages (2)
  {
    path: '/dashboard/binder',
    title: 'Document Binder',
    category: 'Dashboard',
    tier_required: 'premium',
    description: 'Secure document storage for military records',
    status: 'active',
    dependencies: { apis: ['/api/binder'], storage: 'supabase' }
  },
  {
    path: '/dashboard/settings',
    title: 'Settings',
    category: 'Dashboard',
    tier_required: 'free',
    description: 'Account settings and preferences',
    status: 'active',
    dependencies: { apis: ['/api/user-profile'] }
  },

  // Profile (1)
  {
    path: '/dashboard/profile/setup',
    title: 'Profile Setup',
    category: 'Profile',
    tier_required: 'free',
    description: 'Complete military profile for personalized experience',
    status: 'active',
    dependencies: { apis: ['/api/user-profile'] }
  },

  // Premium Tools (4)
  {
    path: '/dashboard/paycheck-audit',
    title: 'LES Auditor',
    category: 'Premium Tools',
    tier_required: 'premium',
    description: 'Upload and audit your Leave and Earnings Statement',
    status: 'active',
    dependencies: { apis: ['/api/les'], storage: 'supabase', data: ['military_pay_tables', 'bah_rates'] }
  },
  {
    path: '/dashboard/pcs-copilot',
    title: 'PCS Copilot',
    category: 'Premium Tools',
    tier_required: 'premium',
    description: 'Comprehensive PCS planning and DITY move calculator',
    status: 'active',
    dependencies: { apis: ['/api/pcs'], data: ['entitlements_data'] }
  },
  {
    path: '/dashboard/navigator',
    title: 'Base Navigator',
    category: 'Premium Tools',
    tier_required: 'premium',
    description: 'Explore military bases with housing, schools, and weather data',
    status: 'active',
    dependencies: { apis: ['/api/external/weather', '/api/external/housing', '/api/external/schools'], external: ['OpenWeatherMap', 'Zillow', 'GreatSchools'] }
  },
  {
    path: '/dashboard/tdy-voucher',
    title: 'TDY Copilot',
    category: 'Premium Tools',
    tier_required: 'premium',
    description: 'TDY travel voucher and per diem calculator',
    status: 'active',
    dependencies: { apis: ['/api/tdy'], data: ['jtr_rules'] }
  },
  {
    path: '/dashboard/intel',
    title: 'Intel Library',
    category: 'Premium Tools',
    tier_required: 'premium',
    description: 'Curated military financial intelligence and resources',
    status: 'active',
    dependencies: { apis: ['/api/intel'], data: ['content_blocks'] }
  },

  // Calculators (6)
  {
    path: '/dashboard/tools/tsp-modeler',
    title: 'TSP Calculator',
    category: 'Calculators',
    tier_required: 'free',
    description: 'Model your TSP contributions and retirement projections',
    status: 'active',
    dependencies: {}
  },
  {
    path: '/dashboard/tools/sdp-strategist',
    title: 'SDP Strategist',
    category: 'Calculators',
    tier_required: 'free',
    description: 'Calculate Savings Deposit Program returns (10% guaranteed)',
    status: 'active',
    dependencies: {}
  },
  {
    path: '/dashboard/tools/house-hacking',
    title: 'House Hacking Calculator',
    category: 'Calculators',
    tier_required: 'free',
    description: 'Calculate BAH house hacking potential',
    status: 'active',
    dependencies: { data: ['bah_rates'] }
  },
  {
    path: '/dashboard/tools/pcs-planner',
    title: 'PCS Planner',
    category: 'Calculators',
    tier_required: 'free',
    description: 'Estimate PCS costs and entitlements',
    status: 'active',
    dependencies: { data: ['entitlements_data'] }
  },
  {
    path: '/dashboard/tools/on-base-savings',
    title: 'On-Base Savings Calculator',
    category: 'Calculators',
    tier_required: 'free',
    description: 'Calculate savings from commissary and exchange shopping',
    status: 'active',
    dependencies: {}
  },
  {
    path: '/dashboard/tools/salary-calculator',
    title: 'Military Salary Calculator',
    category: 'Calculators',
    tier_required: 'free',
    description: 'Calculate total military compensation including allowances',
    status: 'active',
    dependencies: { data: ['military_pay_tables', 'bah_rates'] }
  },

  // Resources (3)
  {
    path: '/dashboard/listening-post',
    title: 'Listening Post',
    category: 'Resources',
    tier_required: 'free',
    description: 'Curated content library and learning resources',
    status: 'active',
    dependencies: { data: ['content_blocks', 'feed_items'] }
  },
  {
    path: '/dashboard/directory',
    title: 'Base Directory',
    category: 'Resources',
    tier_required: 'free',
    description: 'Comprehensive directory of all military bases',
    status: 'active',
    dependencies: { data: ['military_bases'] }
  },
  {
    path: '/dashboard/referrals',
    title: 'Referral Program',
    category: 'Resources',
    tier_required: 'free',
    description: 'Earn rewards by referring military friends',
    status: 'active',
    dependencies: { apis: ['/api/referrals'] }
  },

  // Toolkits (4)
  {
    path: '/pcs-hub',
    title: 'PCS Hub',
    category: 'Toolkits',
    tier_required: null,
    description: 'Complete PCS planning toolkit and resources',
    status: 'active',
    dependencies: { content: ['pcs'] }
  },
  {
    path: '/career-hub',
    title: 'Career Hub',
    category: 'Toolkits',
    tier_required: null,
    description: 'Military career progression and transition resources',
    status: 'active',
    dependencies: { content: ['career'] }
  },
  {
    path: '/deployment',
    title: 'Deployment Toolkit',
    category: 'Toolkits',
    tier_required: null,
    description: 'Deployment financial planning and checklists',
    status: 'active',
    dependencies: { content: ['deployment'] }
  },
  {
    path: '/on-base-shopping',
    title: 'On-Base Shopping Guide',
    category: 'Toolkits',
    tier_required: null,
    description: 'Maximize savings at commissary and exchange',
    status: 'active',
    dependencies: {}
  },

  // Upgrade & Contact (3)
  {
    path: '/dashboard/upgrade',
    title: 'Upgrade to Premium',
    category: 'Upgrade & Contact',
    tier_required: 'free',
    description: 'Unlock all premium tools and features',
    status: 'active',
    dependencies: { apis: ['/api/stripe/checkout'] }
  },
  {
    path: '/contact',
    title: 'Contact Us',
    category: 'Upgrade & Contact',
    tier_required: null,
    description: 'Get in touch with the Garrison Ledger team',
    status: 'active',
    dependencies: {}
  },
  {
    path: '/dashboard/support',
    title: 'Support',
    category: 'Upgrade & Contact',
    tier_required: 'free',
    description: 'Help center and support resources',
    status: 'active',
    dependencies: {}
  },

  // Legal (4)
  {
    path: '/disclosures',
    title: 'Disclosures',
    category: 'Legal',
    tier_required: null,
    description: 'Financial and legal disclosures',
    status: 'active',
    dependencies: {}
  },
  {
    path: '/privacy',
    title: 'Privacy Policy',
    category: 'Legal',
    tier_required: null,
    description: 'How we protect and use your data',
    status: 'active',
    dependencies: {}
  },
  {
    path: '/privacy/cookies',
    title: 'Cookie Policy',
    category: 'Legal',
    tier_required: null,
    description: 'How we use cookies and tracking',
    status: 'active',
    dependencies: {}
  },
  {
    path: '/privacy/do-not-sell',
    title: 'Do Not Sell My Information',
    category: 'Legal',
    tier_required: null,
    description: 'CCPA opt-out for California residents',
    status: 'active',
    dependencies: {}
  },

  // Admin (2)
  {
    path: '/dashboard/admin',
    title: 'Admin Dashboard',
    category: 'Admin',
    tier_required: 'admin',
    description: 'Platform administration and management',
    status: 'active',
    dependencies: { apis: ['/api/admin/*'] }
  },
  {
    path: '/dashboard/admin/briefing',
    title: 'Admin Briefing',
    category: 'Admin',
    tier_required: 'admin',
    description: 'Daily briefing and platform metrics',
    status: 'active',
    dependencies: { apis: ['/api/admin/data'] }
  }
];

async function seedSitemap() {
  console.log('🌱 Seeding sitemap with', sitePages.length, 'pages...');

  for (const page of sitePages) {
    const { error } = await supabase
      .from('site_pages')
      .upsert({
        ...page,
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'path'
      });

    if (error) {
      console.error(`❌ Error seeding ${page.path}:`, error);
    } else {
      console.log(`✅ Seeded: ${page.path}`);
    }
  }

  console.log('🎉 Sitemap seeding complete!');
  console.log(`📊 Total pages: ${sitePages.length}`);
  console.log(`📂 Categories:`, [...new Set(sitePages.map(p => p.category))].join(', '));
}

seedSitemap().catch(console.error);

