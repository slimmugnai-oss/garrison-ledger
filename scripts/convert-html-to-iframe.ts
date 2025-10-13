/**
 * Convert HTML toolkit pages to Next.js pages using iframe approach
 * This avoids JavaScript parsing issues while keeping full functionality
 */

import * as fs from 'fs';
import * as path from 'path';

const TOOLKIT_DIR = path.join(process.cwd(), 'resource toolkits');
const OUTPUT_DIR = path.join(process.cwd(), 'app/(hubs)');
const PUBLIC_DIR = path.join(process.cwd(), 'public/hubs');

const pages = [
  { html: 'PCS Hub.html', dir: 'pcs-hub', publicFile: 'pcs-hub.html', title: 'PCS Hub', path: '/pcs-hub' },
  { html: 'Career Guide.html', dir: 'career-hub', publicFile: 'career-hub.html', title: 'Career Hub', path: '/career-hub' },
  { html: 'Deployment.html', dir: 'deployment', publicFile: 'deployment.html', title: 'Deployment Guide', path: '/deployment' },
  { html: 'Shopping.html', dir: 'on-base-shopping', publicFile: 'on-base-shopping.html', title: 'On-Base Shopping', path: '/on-base-shopping' },
  { html: 'Base_Guide.html', dir: 'base-guides', publicFile: 'base-guides.html', title: 'Base Guides', path: '/base-guides' }
];

// Ensure public/hubs directory exists
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

function createNextJsPage(publicFile: string, pageInfo: typeof pages[0]): string {
  return `'use client';

import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    // Adjust iframe height to content
    const iframe = document.getElementById('hub-content') as HTMLIFrameElement | null;
    if (iframe) {
      iframe.onload = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframe.style.height = iframeDoc.documentElement.scrollHeight + 'px';
          }
        } catch {
          // Cross-origin restriction, use default height
          iframe.style.height = '100vh';
        }
      };
    }
  }, []);

  return (
    <iframe 
      id="hub-content"
      src="/hubs/${publicFile}"
      className="w-full border-0"
      style={{ minHeight: '100vh' }}
      title="${pageInfo.title}"
    />
  );
}
`;
}

// Convert each page
pages.forEach(page => {
  try {
    const htmlPath = path.join(TOOLKIT_DIR, page.html);
    const outputPath = path.join(OUTPUT_DIR, page.dir, 'page.tsx');
    const publicPath = path.join(PUBLIC_DIR, page.publicFile);
    
    console.log(`Converting ${page.html}...`);
    
    // Copy HTML to public folder
    fs.copyFileSync(htmlPath, publicPath);
    console.log(`  ✓ Copied to /public/hubs/${page.publicFile}`);
    
    // Create Next.js page with iframe
    const nextJsPage = createNextJsPage(page.publicFile, page);
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    // Write Next.js page
    fs.writeFileSync(outputPath, nextJsPage);
    console.log(`  ✓ Created ${outputPath}`);
    
  } catch (error) {
    console.error(`✗ Error converting ${page.html}:`, error);
  }
});

console.log('\n✅ All pages converted using iframe approach!');
console.log('\n📁 HTML files copied to /public/hubs/');
console.log('📄 Next.js pages created in /app/(hubs)/');

