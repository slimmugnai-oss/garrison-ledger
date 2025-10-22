import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Map file paths to routes
const filePathToRoute: Record<string, string> = {
  'app/page.tsx': '/',
  'app/dashboard/page.tsx': '/dashboard',
  'app/dashboard/binder/page.tsx': '/dashboard/binder',
  'app/dashboard/settings/page.tsx': '/dashboard/settings',
  'app/dashboard/profile/setup/page.tsx': '/dashboard/profile/setup',
  'app/dashboard/paycheck-audit/page.tsx': '/dashboard/paycheck-audit',
  'app/dashboard/pcs-copilot/page.tsx': '/dashboard/pcs-copilot',
  'app/dashboard/navigator/page.tsx': '/dashboard/navigator',
  'app/dashboard/tdy-voucher/page.tsx': '/dashboard/tdy-voucher',
  'app/dashboard/intel/page.tsx': '/dashboard/intel',
  'app/dashboard/tools/tsp-modeler/page.tsx': '/dashboard/tools/tsp-modeler',
  'app/dashboard/tools/sdp-strategist/page.tsx': '/dashboard/tools/sdp-strategist',
  'app/dashboard/tools/house-hacking/page.tsx': '/dashboard/tools/house-hacking',
  'app/dashboard/tools/pcs-planner/page.tsx': '/dashboard/tools/pcs-planner',
  'app/dashboard/tools/on-base-savings/page.tsx': '/dashboard/tools/on-base-savings',
  'app/dashboard/tools/salary-calculator/page.tsx': '/dashboard/tools/salary-calculator',
  'app/dashboard/listening-post/page.tsx': '/dashboard/listening-post',
  'app/dashboard/directory/page.tsx': '/dashboard/directory',
  'app/dashboard/referrals/page.tsx': '/dashboard/referrals',
  'app/pcs-hub/page.tsx': '/pcs-hub',
  'app/career-hub/page.tsx': '/career-hub',
  'app/deployment/page.tsx': '/deployment',
  'app/on-base-shopping/page.tsx': '/on-base-shopping',
  'app/dashboard/upgrade/page.tsx': '/dashboard/upgrade',
  'app/contact/page.tsx': '/contact',
  'app/dashboard/support/page.tsx': '/dashboard/support',
  'app/disclosures/page.tsx': '/disclosures',
  'app/privacy/page.tsx': '/privacy',
  'app/privacy/cookies/page.tsx': '/privacy/cookies',
  'app/privacy/do-not-sell/page.tsx': '/privacy/do-not-sell',
  'app/dashboard/admin/page.tsx': '/dashboard/admin',
  'app/dashboard/admin/briefing/page.tsx': '/dashboard/admin/briefing',
};

async function syncFromGit() {
  try {
    console.log('🔍 Detecting changed files from git...\n');
    
    // Get changed files in last commit
    const changedFiles = execSync('git diff-tree --no-commit-id --name-only -r HEAD', {
      encoding: 'utf-8'
    }).split('\n').filter(Boolean);
    
    // Get latest commit info
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    const commitDate = execSync('git log -1 --format=%cI', { encoding: 'utf-8' }).trim();
    
    console.log(`📝 Latest commit: ${commitHash.substring(0, 7)}`);
    console.log(`📅 Commit date: ${commitDate}`);
    console.log(`📄 Changed files: ${changedFiles.length}\n`);
    
    let updated = 0;
    
    for (const file of changedFiles) {
      // Check if this file is a tracked page
      const route = filePathToRoute[file];
      
      if (!route) {
        continue; // Not a tracked page
      }
      
      console.log(`🔄 Updating: ${route}`);
      console.log(`   File: ${file}`);
      
      try {
        // Read file content
        const content = readFileSync(file, 'utf-8');
        const hash = createHash('sha256').update(content).digest('hex');
        
        // Extract component name
        const componentMatch = content.match(/export default function (\w+)/);
        const componentName = componentMatch ? componentMatch[1] : null;
        
        // Update in database
        const { error } = await supabase
          .from('site_pages')
          .update({
            file_hash: hash,
            component_name: componentName,
            git_last_commit: commitHash,
            git_last_commit_date: commitDate,
            last_updated: commitDate,
            updated_at: new Date().toISOString(),
          })
          .eq('path', route);
        
        if (error) {
          console.error(`   ❌ Error: ${error.message}`);
        } else {
          console.log(`   ✅ Updated`);
          updated++;
        }
      } catch (err) {
        console.error(`   ❌ Error reading file: ${err}`);
      }
      
      console.log('');
    }
    
    console.log('🎉 Git sync complete!');
    console.log(`✅ Updated: ${updated} pages`);
  } catch (error) {
    console.error('❌ Git sync failed:', error);
  }
}

syncFromGit().catch(console.error);

