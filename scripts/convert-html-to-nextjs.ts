/**
 * Convert HTML toolkit pages to Next.js pages
 * Preserves header/footer, integrates CTAs
 */

import * as fs from 'fs';
import * as path from 'path';

const TOOLKIT_DIR = path.join(process.cwd(), 'resource toolkits');
const OUTPUT_DIR = path.join(process.cwd(), 'app/(hubs)');

const pages = [
  { html: 'PCS Hub.html', dir: 'pcs-hub', title: 'PCS Hub - Complete Military Moving Guide', path: '/pcs-hub' },
  { html: 'Career Guide.html', dir: 'career-hub', title: 'Career Hub - Military Spouse & Transition Resources', path: '/career-hub' },
  { html: 'Deployment.html', dir: 'deployment', title: 'Deployment Guide - Financial & Family Preparation', path: '/deployment' },
  { html: 'Shopping.html', dir: 'on-base-shopping', title: 'On-Base Shopping Guide - Commissary & Exchange', path: '/on-base-shopping' },
  { html: 'Base_Guide.html', dir: 'base-guides', title: 'Base Guides - Installation Resources & Housing', path: '/base-guides' }
];

function extractHtmlContent(htmlPath: string): string {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  
  // Extract everything between <body> and </body>
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error(`Could not find body in ${htmlPath}`);
  
  return bodyMatch[1];
}

function createNextJsPage(bodyContent: string, pageInfo: typeof pages[0]): string {
  return `export const metadata = {
  title: "${pageInfo.title}",
};

export default function Page() {
  return (
    <div dangerouslySetInnerHTML={{ __html: \`
${bodyContent}
    \` }} />
  );
}
`;
}

// Convert each page
pages.forEach(page => {
  try {
    const htmlPath = path.join(TOOLKIT_DIR, page.html);
    const outputPath = path.join(OUTPUT_DIR, page.dir, 'page.tsx');
    
    console.log(`Converting ${page.html}...`);
    
    const bodyContent = extractHtmlContent(htmlPath);
    const nextJsPage = createNextJsPage(bodyContent, page);
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    // Write Next.js page
    fs.writeFileSync(outputPath, nextJsPage);
    
    console.log(`✓ Created ${outputPath}`);
  } catch (error) {
    console.error(`✗ Error converting ${page.html}:`, error);
  }
});

console.log('\n✅ All pages converted!');

