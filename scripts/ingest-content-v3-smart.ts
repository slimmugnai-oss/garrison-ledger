// @ts-nocheck
// Smart Semantic Ingestion V3 - Extract only meaningful, coherent content blocks
import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'isomorphic-dompurify';
import slugify from '@sindresorhus/slugify';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase envs');
  process.exit(1);
}
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://garrison-ledger.vercel.app';

const SB = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type Source = { file: string; source: string };
const SOURCES: Source[] = [
  { file: 'PCS Hub.html', source: 'pcs-hub' },
  { file: 'Deployment.html', source: 'deployment' },
  { file: 'Career Guide.html', source: 'career-hub' },
  { file: 'Shopping.html', source: 'on-base-shopping' },
];

function makeSanitizer() {
  const window = new JSDOM('').window as any;
  const DOMPurify = createDOMPurify(window as any);
  return (html: string) => DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    KEEP_CONTENT: true,
    ALLOWED_TAGS: ['h2', 'h3', 'h4', 'h5', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'blockquote', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'td', 'th'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}

// Semantic filter: return true if this heading represents meaningful content
function isMeaningfulSection(title: string, html: string): boolean {
  const t = title.toLowerCase();
  const text = html.replace(/<[^>]+>/g, ' ').toLowerCase();
  
  // Filter out navigation, metadata, sponsors
  const skipPatterns = [
    /jump to (section|phase)/i,
    /breadcrumb/i,
    /welcome to your/i,
    /presented by/i,
    /empowering military families/i,
    /our members are the mission/i,
    /family media/i,
    /stay connected/i,
    /newsletter/i,
    /sponsor/i,
    /follow us/i,
    /tl;?dr/i,
    /^pro-?tip/i,
  ];
  
  for (const pattern of skipPatterns) {
    if (pattern.test(t)) return false;
  }
  
  // Must have substantive body text (not just a heading or short snippet)
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 50) return false;
  
  // Must have actionable or educational content indicators
  const hasValue = /\b(how to|step|guide|checklist|important|essential|key|strategy|tip|resource|eligibility|benefit|save|plan|prepare)\b/i.test(text);
  
  return hasValue;
}

function classifyBlock(html: string): 'guide'|'checklist'|'faq'|'tips' {
  const text = html.toLowerCase();
  if (/checklist|task|action|step-by-step/i.test(text) && /<(ul|ol)/i.test(html)) return 'checklist';
  if (/\b(q:|question:|faq|answer:)\b/i.test(text)) return 'faq';
  if (/💡|pro[- ]?tip|from the trenches/i.test(text)) return 'tips';
  return 'guide';
}

function deriveTopics(source: string, title: string, text: string): string[] {
  const hay = `${source} ${title} ${text}`.toLowerCase();
  const topics = new Set<string>();

  // Core hubs
  if (source.includes('pcs')) topics.add('pcs');
  if (source.includes('career')) topics.add('career');
  if (source.includes('deployment')) topics.add('deployment');
  if (source.includes('shopping')) topics.add('finance');

  // PCS topics
  if (/\bpcs\b|timeline|orders|move|relocation/i.test(hay)) topics.add('pcs-prep');
  if (/bah|housing|rent|lease/i.test(hay)) topics.add('housing');
  if (/efmp/i.test(hay)) topics.add('efmp');
  if (/oconus|overseas/i.test(hay)) topics.add('oconus');
  if (/ppm|dity|personally procured/i.test(hay)) topics.add('ppm');

  // Career topics
  if (/remote work|portable career|telework/i.test(hay)) topics.add('remote-work');
  if (/mycaa/i.test(hay)) topics.add('mycaa');
  if (/resume|interview|job search/i.test(hay)) topics.add('job-search');
  if (/usajobs|federal/i.test(hay)) topics.add('federal-employment');
  if (/business|entrepreneur/i.test(hay)) topics.add('entrepreneurship');
  if (/license|certification/i.test(hay)) topics.add('licensing');

  // Finance topics
  if (/tsp|thrift savings/i.test(hay)) topics.add('tsp');
  if (/sdp|savings deposit/i.test(hay)) topics.add('sdp');
  if (/budget|debt|emergency fund/i.test(hay)) topics.add('budgeting');
  if (/scra/i.test(hay)) topics.add('scra');

  // Deployment topics
  if (/pre[- ]deployment/i.test(hay)) topics.add('pre-deployment');
  if (/reintegration|homecoming/i.test(hay)) topics.add('reintegration');
  if (/children|kids|parenting/i.test(hay)) topics.add('family');

  return Array.from(topics).slice(0, 6);
}

function textOnly(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function upsertBlock(row: {
  source_page: string;
  slug: string;
  title: string;
  html: string;
  text_content: string;
  summary: string;
  block_type: string;
  tags: string[];
  topics: string[];
  horder: number;
}) {
  const { error } = await SB.from('content_blocks').upsert(row, { onConflict: 'source_page,slug' });
  if (error) throw new Error(error.message);
}

function normalizeLinks($: cheerio.CheerioAPI, el: cheerio.Cheerio<unknown>) {
  el.find('a[href^="/"]').each((_, a) => {
    const $a = $(a as unknown as any);
    const href = $a.attr('href');
    if (href && href.startsWith('/')) $a.attr('href', `${SITE_URL}${href}`);
  });
  // Also ensure external links have proper rel attributes
  el.find('a[href^="http"]').each((_, a) => {
    const $a = $(a as unknown as any);
    const rel = $a.attr('rel') || '';
    if (!rel.includes('noopener')) $a.attr('rel', rel ? `${rel} noopener` : 'noopener');
  });
}

async function ingestOne({ file, source }: Source) {
  const full = path.join(process.cwd(), 'resource toolkits', file);
  const raw = await fs.readFile(full, 'utf8');
  const $ = cheerio.load(raw);
  const sanitize = makeSanitizer();

  let order = 0;
  const blocks: any[] = [];

  // Find all H2 sections (major content sections)
  const h2Sections = $('section[id], h2').filter((_, el) => {
    const tag = el.tagName?.toLowerCase();
    if (tag === 'section') return true;
    if (tag === 'h2') {
      // Only H2s that aren't inside sections we'll process separately
      const $h2 = $(el);
      return $h2.closest('section').length === 0;
    }
    return false;
  });

  for (let i = 0; i < h2Sections.length; i++) {
    const section = h2Sections[i];
    const $section = $(section);
    
    let title = '';
    let $contentRoot = $section;
    
    if (section.tagName?.toLowerCase() === 'section') {
      // Extract title from first H2/H3 in section
      const $heading = $section.find('h2, h3').first();
      title = $heading.text().trim();
      if (!title) continue;
    } else {
      // It's an H2
      title = $section.text().trim();
      if (!title) continue;
      
      // Collect content until next H2
      const wrapper = $('<div></div>');
      let next = $section.next();
      while (next.length && next[0].tagName?.toLowerCase() !== 'h2') {
        wrapper.append(next.clone());
        next = next.next();
      }
      $contentRoot = wrapper;
    }

    // Normalize all links
    normalizeLinks($, $contentRoot);
    
    // Get HTML and text
    const html = sanitize($contentRoot.html() || '');
    const text = textOnly(html);
    
    // Semantic filtering
    if (!isMeaningfulSection(title, html)) {
      continue;
    }

    const slug = slugify(title);
    const summary = text.split('. ').slice(0, 2).join('. ') + (text ? '.' : '');
    const block_type = classifyBlock(html);
    const topics = deriveTopics(source, title, text);
    const tags = [source]; // Simple tags

    blocks.push({
      source_page: source,
      slug,
      title,
      html,
      text_content: text,
      summary,
      block_type,
      tags,
      topics,
      horder: order++,
    });

    console.log(`✓ Curated: ${source}/${slug} (${text.split(' ').length} words, type: ${block_type})`);
  }

  // Upsert all blocks
  for (const block of blocks) {
    await upsertBlock(block);
  }
  
  console.log(`\n📊 ${source}: Extracted ${blocks.length} high-quality blocks\n`);
}

async function main() {
  console.log('🚀 Smart Semantic Ingestion V3\n');
  console.log('Extracting only meaningful, coherent content blocks...\n');
  
  for (const s of SOURCES) {
    try {
      await ingestOne(s);
    } catch (e) {
      console.error('❌ Ingestion failed for', s.file, e);
    }
  }
  
  console.log('\n✅ Smart Ingestion Complete!');
}

main().catch(e => { console.error(e); process.exit(1); });

