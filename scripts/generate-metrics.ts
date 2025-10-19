#!/usr/bin/env ts-node
/**
 * METRICS GENERATOR
 * 
 * Generates build-time metrics for SSOT and documentation.
 * Counts pages, API routes, bases, and other system statistics.
 * Outputs to generated/metrics.json for consumption by docs.
 * 
 * Usage:
 *   npm run generate-metrics
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface Metrics {
  generatedAt: string;
  version: string;
  counts: {
    pages: number;
    apiRoutes: number;
    bases: {
      conus: number;
      oconus: number;
      total: number;
    };
    components: number;
    calculators: number;
  };
  build: {
    typescript: {
      files: number;
      errors: number;
    };
    eslint: {
      errors: number;
      warnings: number;
    };
  };
}

async function countPages(): Promise<number> {
  const pages = await glob('app/**/page.tsx', {
    ignore: ['node_modules/**', '.next/**']
  });
  return pages.length;
}

async function countAPIRoutes(): Promise<number> {
  const routes = await glob('app/api/**/route.ts', {
    ignore: ['node_modules/**', '.next/**']
  });
  return routes.length;
}

async function countBases(): Promise<{ conus: number; oconus: number; total: number }> {
  try {
    // Import bases data dynamically
    const basesPath = path.join(process.cwd(), 'app/data/bases-clean.ts');
    const basesContent = fs.readFileSync(basesPath, 'utf-8');
    
    // Count CONUS bases (region: "CONUS")
    const conusMatches = basesContent.match(/region:\s*["']CONUS["']/g) || [];
    const conus = conusMatches.length;
    
    // Count OCONUS bases (region: "OCONUS")
    const oconusMatches = basesContent.match(/region:\s*["']OCONUS["']/g) || [];
    const oconus = oconusMatches.length;
    
    return {
      conus,
      oconus,
      total: conus + oconus
    };
  } catch (error) {
    console.error('Error counting bases:', error);
    return { conus: 0, oconus: 0, total: 0 };
  }
}

async function countComponents(): Promise<number> {
  const components = await glob('app/components/**/*.tsx', {
    ignore: ['node_modules/**', '.next/**']
  });
  return components.length;
}

async function countCalculators(): Promise<number> {
  try {
    // Count calculator pages in dashboard
    const calculators = await glob('app/dashboard/calculators/**/page.tsx', {
      ignore: ['node_modules/**', '.next/**']
    });
    return calculators.length;
  } catch (error) {
    console.error('Error counting calculators:', error);
    return 0;
  }
}

async function countTypeScriptFiles(): Promise<number> {
  const files = await glob('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', '.next/**', 'dist/**']
  });
  return files.length;
}

async function generateMetrics(): Promise<Metrics> {
  console.log('📊 Generating metrics...\n');

  const pages = await countPages();
  console.log(`  Pages: ${pages}`);

  const apiRoutes = await countAPIRoutes();
  console.log(`  API Routes: ${apiRoutes}`);

  const bases = await countBases();
  console.log(`  Bases: ${bases.total} (${bases.conus} CONUS, ${bases.oconus} OCONUS)`);

  const components = await countComponents();
  console.log(`  Components: ${components}`);

  const calculators = await countCalculators();
  console.log(`  Calculators: ${calculators}`);

  const typeScriptFiles = await countTypeScriptFiles();
  console.log(`  TypeScript Files: ${typeScriptFiles}`);

  // Read package.json for version
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
  );

  const metrics: Metrics = {
    generatedAt: new Date().toISOString(),
    version: packageJson.version || '0.1.0',
    counts: {
      pages,
      apiRoutes,
      bases,
      components,
      calculators
    },
    build: {
      typescript: {
        files: typeScriptFiles,
        errors: 0 // TODO: Parse tsc output
      },
      eslint: {
        errors: 0, // TODO: Parse eslint output
        warnings: 0
      }
    }
  };

  return metrics;
}

async function main() {
  console.log('🎯 Garrison Ledger Metrics Generator\n');

  const metrics = await generateMetrics();

  // Create generated directory if it doesn't exist
  const generatedDir = path.join(process.cwd(), 'generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  // Write metrics.json
  const metricsPath = path.join(generatedDir, 'metrics.json');
  fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2), 'utf-8');

  console.log(`\n✅ Metrics generated: ${metricsPath}\n`);
  console.log('Summary:');
  console.log(`  - ${metrics.counts.pages} pages`);
  console.log(`  - ${metrics.counts.apiRoutes} API routes`);
  console.log(`  - ${metrics.counts.bases.total} military bases`);
  console.log(`  - ${metrics.counts.components} components`);
  console.log(`  - ${metrics.counts.calculators} calculators`);
  console.log('');
}

main().catch(error => {
  console.error('Error generating metrics:', error);
  process.exit(1);
});

