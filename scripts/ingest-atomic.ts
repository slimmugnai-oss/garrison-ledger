// @ts-nocheck
// Atomic Content Ingestion - Uses manifest to extract precise, curated blocks
import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'isomorphic-dompurify';
import { createClient } from '@supabase/supabase-js';
import { ATOMIC_MANIFEST, type AtomicBlock } from '../lib/content/atomic-manifest';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://garrison-ledger.vercel.app';

const SB = createClient(SUPABASE_URL, SUPABASE_KEY);

const SOURCE_FILES: Record<string, string> = {
  'pcs-hub': 'PCS Hub.html',
  'career-hub': 'Career Guide.html',
  'deployment': 'Deployment.html',
  'on-base-shopping': 'Shopping.html',
};

function makeSanitizer() {
  const window = new JSDOM('').window;
  const DOMPurify = createDOMPurify(window);
  return (html: string) => DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h2', 'h3', 'h4', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'blockquote', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'input', 'button', 'label', 'select', 'option'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'type', 'placeholder', 'for'],
  });
}

function normalizeLinks($: cheerio.CheerioAPI, el: cheerio.Cheerio) {
  el.find('a[href^="/"]').each((_, a) => {
    const $a = $(a);
    const href = $a.attr('href');
    if (href?.startsWith('/')) $a.attr('href', `${SITE_URL}${href}`);
  });
  el.find('a[href^="http"]').each((_, a) => {
    const $a = $(a);
    if (!$a.attr('rel')?.includes('noopener')) {
      $a.attr('rel', ($a.attr('rel') || '') + ' noopener');
    }
  });
}

function extractAtomContent($: cheerio.CheerioAPI, atom: AtomicBlock): string | null {
  const sanitize = makeSanitizer();
  
  // Strategy: Find the section by hint, extract all content
  // For each atom type, we have specific extraction logic
  
  if (atom.id === 'pcs-timeline-tool') {
    const section = $('section#phase1');
    const card = section.find('.card').filter((_, el) => {
      return $(el).find('h3').text().includes('Timeline Generator');
    });
    if (card.length) {
      normalizeLinks($, card);
      return sanitize(card.html() || '');
    }
  }
  
  if (atom.id === 'pcs-master-checklist') {
    // Extract the checklist content
    const section = $('section#phase1');
    const checklistDiv = section.find('div#checklist').parent();
    if (checklistDiv.length) {
      normalizeLinks($, checklistDiv);
      return sanitize(checklistDiv.html() || '');
    }
  }
  
  if (atom.id === 'pcs-budget-calculator') {
    const calc = $('.card:has(h3:contains("Financial Command Center"))');
    if (calc.length) {
      normalizeLinks($, calc);
      return sanitize(calc.html() || '');
    }
  }
  
  if (atom.id === 'efmp-pcs-support') {
    const efmp = $('.card:has(h3:contains("Specialized Support for EFMP"))');
    if (efmp.length) {
      normalizeLinks($, efmp);
      return sanitize(efmp.html() || '');
    }
  }
  
  if (atom.id === 'pcs-emotional-readiness') {
    const section = $('section#mental-emotional');
    if (section.length) {
      // Get the intro + first few cards, exclude EFMP card
      const content = $('<div></div>');
      content.append(section.find('.text-center').first().clone());
      section.find('.card').slice(0, 3).each((_, card) => {
        const $card = $(card);
        if (!$card.text().includes('EFMP')) {
          content.append($card.clone());
        }
      });
      normalizeLinks($, content);
      return sanitize(content.html() || '');
    }
  }
  
  if (atom.id === 'ppm-profit-guide') {
    const ppmSection = $('#ppm-move');
    if (ppmSection.length) {
      normalizeLinks($, ppmSection);
      return sanitize(ppmSection.html() || '');
    }
  }
  
  if (atom.id === 'oconus-pcs-guide') {
    const oconus = $('#oconus-move');
    if (oconus.length) {
      normalizeLinks($, oconus);
      return sanitize(oconus.html() || '');
    }
  }
  
  if (atom.id === 'pcs-faq') {
    const faq = $('section#faq');
    if (faq.length) {
      normalizeLinks($, faq);
      return sanitize(faq.html() || '');
    }
  }
  
  // Career atoms
  if (atom.id === 'portable-careers-guide') {
    const section = $('section#exploration');
    if (section.length) {
      normalizeLinks($, section);
      return sanitize(section.html() || '');
    }
  }
  
  if (atom.id === 'mycaa-complete-guide') {
    const section = $('section#education');
    const mycaaCard = section.find('.card:has(h3:contains("MyCAA"))');
    if (mycaaCard.length) {
      normalizeLinks($, mycaaCard);
      return sanitize(mycaaCard.html() || '');
    }
  }
  
  if (atom.id === 'resume-power-up') {
    const section = $('section#jobsearch');
    const resumeCard = section.find('.card:has(h3:contains("Resume Power-Up"))');
    if (resumeCard.length) {
      normalizeLinks($, resumeCard);
      return sanitize(resumeCard.html() || '');
    }
  }
  
  if (atom.id === 'federal-employment-guide') {
    const section = $('section#federal-employment');
    if (section.length) {
      normalizeLinks($, section);
      return sanitize(section.html() || '');
    }
  }
  
  if (atom.id === 'entrepreneur-toolkit') {
    const section = $('section#entrepreneurship').first();
    if (section.length) {
      normalizeLinks($, section);
      return sanitize(section.html() || '');
    }
  }
  
  if (atom.id === 'license-transfer-guide') {
    const section = $('section#licensing');
    if (section.length) {
      normalizeLinks($, section);
      return sanitize(section.html() || '');
    }
  }
  
  if (atom.id === 'high-impact-certs') {
    const section = $('section#upskilling');
    if (section.length) {
      normalizeLinks($, section);
      return sanitize(section.html() || '');
    }
  }
  
  // Deployment atoms
  if (atom.id === 'pre-deployment-checklist') {
    const section = $('section#pre-deployment');
    if (section.length) {
      normalizeLinks($, section);
      return sanitize(section.html() || '');
    }
  }
  
  if (atom.id === 'deployment-family-pact') {
    const pact = $('.card:has(h3:contains("Deployment Pact"))');
    if (pact.length) {
      normalizeLinks($, pact);
      return sanitize(pact.html() || '');
    }
  }
  
  if (atom.id === 'homefront-survival') {
    const section = $('section#homefront');
    if (section.length) {
      normalizeLinks($, section);
      return sanitize(section.html() || '');
    }
  }
  
  if (atom.id === 'reintegration-roadmap') {
    const section = $('section#reintegration');
    if (section.length) {
      normalizeLinks($, section);
      return sanitize(section.html() || '');
    }
  }
  
  if (atom.id === 'deployment-faq') {
    const faq = $('section#faq');
    if (faq.length) {
      normalizeLinks($, faq);
      return sanitize(faq.html() || '');
    }
  }
  
  // Finance atoms
  if (atom.id === 'les-decoder') {
    const section = $('section#military-pay');
    if (section.length) {
      normalizeLinks($, section);
      return sanitize(section.html() || '');
    }
  }
  
  if (atom.id === 'tsp-brs-essentials') {
    const section = $('section#retirement');
    if (section.length) {
      normalizeLinks($, section);
      return sanitize(section.html() || '');
    }
  }
  
  if (atom.id === 'emergency-fund-builder') {
    const section = $('section#financial-security');
    if (section.length) {
      normalizeLinks($, section);
      return sanitize(section.html() || '');
    }
  }
  
  if (atom.id === 'commissary-savings-calculator') {
    const section = $('section#savings');
    if (section.length) {
      normalizeLinks($, section);
      return sanitize(section.html() || '');
    }
  }
  
  if (atom.id === 'commissary-exchange-basics') {
    const commissary = $('section#commissary');
    const exchange = $('section#exchange');
    const combined = $('<div></div>');
    if (commissary.length) combined.append(commissary.clone());
    if (exchange.length) combined.append(exchange.clone());
    if (combined.children().length) {
      normalizeLinks($, combined);
      return sanitize(combined.html() || '');
    }
  }
  
  if (atom.id === 'oconus-shopping-guide') {
    const section = $('section#oconus');
    if (section.length) {
      normalizeLinks($, section);
      return sanitize(section.html() || '');
    }
  }
  
  if (atom.id === 'shopping-pro-tips') {
    const section = $('section#tips');
    if (section.length) {
      normalizeLinks($, section);
      return sanitize(section.html() || '');
    }
  }
  
  return null;
}

function textOnly(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function ingestAtomicBlocks() {
  console.log('🚀 Atomic Content Ingestion\n');
  console.log(`Processing ${ATOMIC_MANIFEST.length} curated atomic blocks...\n`);
  
  let successCount = 0;
  let skipCount = 0;
  
  for (const atom of ATOMIC_MANIFEST) {
    const fileName = SOURCE_FILES[atom.source];
    if (!fileName) {
      console.log(`⚠️  Skipping ${atom.id}: no source file mapped`);
      skipCount++;
      continue;
    }
    
    const filePath = path.join(process.cwd(), 'resource toolkits', fileName);
    const raw = await fs.readFile(filePath, 'utf8');
    const $ = cheerio.load(raw);
    
    const html = extractAtomContent($, atom);
    
    if (!html) {
      console.log(`⚠️  Could not extract ${atom.id} from ${fileName}`);
      skipCount++;
      continue;
    }
    
    const text = textOnly(html);
    const summary = text.split('. ').slice(0, 2).join('. ') + '.';
    
    await SB.from('content_blocks').upsert({
      source_page: atom.source,
      slug: atom.id,
      title: atom.title,
      html,
      text_content: text,
      summary,
      block_type: atom.type, // Legacy compatibility
      type: atom.type,
      tags: atom.tags,
      topics: atom.tags,
      horder: 0,
      est_read_min: Math.max(1, Math.ceil(text.split(' ').length / 220)),
    }, { onConflict: 'source_page,slug' });
    
    console.log(`✅ ${atom.id} (${atom.type}) - ${text.split(' ').length} words`);
    successCount++;
  }
  
  console.log(`\n📊 Summary: ${successCount} blocks ingested, ${skipCount} skipped\n`);
  console.log('✅ Atomic Ingestion Complete!');
}

ingestAtomicBlocks().catch(console.error);

