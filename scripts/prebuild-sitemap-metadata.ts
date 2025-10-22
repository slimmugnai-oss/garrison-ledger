import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('⚠️  Skipping sitemap metadata extraction (Supabase credentials not found)');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Map routes to file paths
const routeToFilePath: Record<string, string> = {
  '/': 'app/page.tsx',
  '/dashboard': 'app/dashboard/page.tsx',
  '/dashboard/binder': 'app/dashboard/binder/page.tsx',
  '/dashboard/settings': 'app/dashboard/settings/page.tsx',
  '/dashboard/profile/setup': 'app/dashboard/profile/setup/page.tsx',
  '/dashboard/paycheck-audit': 'app/dashboard/paycheck-audit/page.tsx',
  '/dashboard/pcs-copilot': 'app/dashboard/pcs-copilot/page.tsx',
  '/dashboard/navigator': 'app/dashboard/navigator/page.tsx',
  '/dashboard/tdy-voucher': 'app/dashboard/tdy-voucher/page.tsx',
  '/dashboard/intel': 'app/dashboard/intel/page.tsx',
  '/dashboard/tools/tsp-modeler': 'app/dashboard/tools/tsp-modeler/page.tsx',
  '/dashboard/tools/sdp-strategist': 'app/dashboard/tools/sdp-strategist/page.tsx',
  '/dashboard/tools/house-hacking': 'app/dashboard/tools/house-hacking/page.tsx',
  '/dashboard/tools/pcs-planner': 'app/dashboard/tools/pcs-planner/page.tsx',
  '/dashboard/tools/on-base-savings': 'app/dashboard/tools/on-base-savings/page.tsx',
  '/dashboard/tools/salary-calculator': 'app/dashboard/tools/salary-calculator/page.tsx',
  '/dashboard/listening-post': 'app/dashboard/listening-post/page.tsx',
  '/dashboard/directory': 'app/dashboard/directory/page.tsx',
  '/dashboard/referrals': 'app/dashboard/referrals/page.tsx',
  '/pcs-hub': 'app/pcs-hub/page.tsx',
  '/career-hub': 'app/career-hub/page.tsx',
  '/deployment': 'app/deployment/page.tsx',
  '/on-base-shopping': 'app/on-base-shopping/page.tsx',
  '/dashboard/upgrade': 'app/dashboard/upgrade/page.tsx',
  '/contact': 'app/contact/page.tsx',
  '/dashboard/support': 'app/dashboard/support/page.tsx',
  '/disclosures': 'app/disclosures/page.tsx',
  '/privacy': 'app/privacy/page.tsx',
  '/privacy/cookies': 'app/privacy/cookies/page.tsx',
  '/privacy/do-not-sell': 'app/privacy/do-not-sell/page.tsx',
  '/dashboard/admin': 'app/dashboard/admin/page.tsx',
  '/dashboard/admin/briefing': 'app/dashboard/admin/briefing/page.tsx',
};

function extractMetadata(filePath: string) {
  try {
    const fullPath = join(process.cwd(), filePath);
    
    if (!existsSync(fullPath)) {
      return null;
    }

    const content = readFileSync(fullPath, 'utf-8');
    const stats = statSync(fullPath);
    
    // Calculate file hash
    const hash = createHash('sha256').update(content).digest('hex');
    
    // Extract component name
    const componentMatch = content.match(/export default function (\w+)/);
    const componentName = componentMatch ? componentMatch[1] : null;
    
    // Extract API endpoints
    const apiMatches = content.matchAll(/fetch\([`'"](\/api\/[^`'"]+)[`'"]/g);
    const apiEndpoints = [...new Set([...apiMatches].map(m => m[1]))];
    
    // Extract database tables
    const tableMatches = content.matchAll(/\.from\([`'"](\w+)[`'"]\)/g);
    const databaseTables = [...new Set([...tableMatches].map(m => m[1]))];
    
    // Extract external services
    const externalServices: string[] = [];
    if (content.includes('openweathermap') || content.includes('OpenWeather')) {
      externalServices.push('OpenWeatherMap');
    }
    if (content.includes('greatschools') || content.includes('GreatSchools')) {
      externalServices.push('GreatSchools');
    }
    if (content.includes('zillow') || content.includes('Zillow')) {
      externalServices.push('Zillow');
    }
    if (content.includes('gemini') || content.includes('Gemini') || content.includes('google.generativeai') || content.includes('GoogleGenerativeAI')) {
      externalServices.push('Google Gemini AI');
    }
    if (content.includes('stripe') || content.includes('Stripe')) {
      externalServices.push('Stripe');
    }
    if (content.includes('clerk') || content.includes('Clerk') || content.includes('@clerk')) {
      externalServices.push('Clerk');
    }
    
    return {
      fileHash: hash,
      componentName,
      apiEndpoints,
      databaseTables,
      externalServices,
      lastUpdated: stats.mtime,
    };
  } catch (error) {
    return null;
  }
}

async function updateMetadata() {
  console.log('🧠 [Pre-Build] Extracting sitemap metadata...\n');
  
  let updated = 0;
  let skipped = 0;
  
  for (const [route, filePath] of Object.entries(routeToFilePath)) {
    const metadata = extractMetadata(filePath);
    
    if (!metadata) {
      skipped++;
      continue;
    }
    
    try {
      const { error } = await supabase
        .from('site_pages')
        .update({
          file_path: filePath,
          file_hash: metadata.fileHash,
          component_name: metadata.componentName,
          api_endpoints: metadata.apiEndpoints,
          database_tables: metadata.databaseTables,
          external_services: metadata.externalServices,
          last_updated: metadata.lastUpdated.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('path', route);
      
      if (error) {
        console.error(`   ❌ ${route}: ${error.message}`);
        skipped++;
      } else {
        console.log(`   ✅ ${route} → ${metadata.componentName || 'Unknown'} (${metadata.apiEndpoints.length} APIs, ${metadata.databaseTables.length} tables)`);
        updated++;
      }
    } catch (err) {
      skipped++;
    }
  }
  
  console.log(`\n✨ [Pre-Build] Metadata extraction complete!`);
  console.log(`   Updated: ${updated}/${Object.keys(routeToFilePath).length} pages`);
  console.log(`   Skipped: ${skipped} pages\n`);
}

updateMetadata().catch((err) => {
  console.error('❌ [Pre-Build] Metadata extraction failed:', err);
  // Don't fail the build, just log and continue
  process.exit(0);
});

