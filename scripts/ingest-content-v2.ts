// @ts-nocheck
// scripts/ingest-content-v2.ts
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
  { file: 'Base_Guide.html', source: 'base-guides' },
  { file: 'Career Guide.html', source: 'career-hub' },
  { file: 'Shopping.html', source: 'on-base-shopping' },
];

function makeSanitizer() {
  const window = new JSDOM('').window as any;
  const DOMPurify = createDOMPurify(window as any);
  return (html: string) => DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

function classifyBlock($: cheerio.CheerioAPI, root: cheerio.Cheerio<unknown>): 'section'|'checklist'|'faq'|'table'|'tip' {
  if (root.find('table').length > 0) return 'table';
  if (root.find('ul,ol').length > 0) {
    const text = root.text().toLowerCase();
    if (/\b(checklist|do this|next steps|action)\b/.test(text)) return 'checklist';
  }
  const raw = root.text().toLowerCase();
  if (/\b(q:|question:|faq)\b/.test(raw) && /\b(a:|answer:)\b/.test(raw)) return 'faq';
  if (/\b(tip|pro[- ]?tip|note:)\b/.test(raw)) return 'tip';
  return 'section';
}

function deriveTags(source: string, title: string): string[] {
  const t = title.toLowerCase();
  const tags = new Set<string>([source]);
  const map: Record<string,string> = {
    pcs: 'pcs', bah: 'bah', tsp: 'tsp', sdp: 'sdp', mycaa: 'mycaa', child: 'kids', kids: 'kids', checklist: 'checklist', timeline: 'timeline'
  };
  for (const k of Object.keys(map)) if (t.includes(k)) tags.add(map[k]);
  return Array.from(tags);
}

function textOnly(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function upsertBlock(row: {
  source_page: string;
  slug: string;
  hlevel: number;
  title: string;
  html: string;
  text_content: string;
  block_type: string;
  tags: string[];
  topics: string[];
  horder: number;
  est_read_min: number;
  summary?: string;
}) {
  let { error } = await SB.from('content_blocks').upsert(row, { onConflict: 'source_page,slug' });
  if (error && /'topics' column/i.test(error.message)) {
    const { topics, ...fallbackRow } = row as any;
    const retry = await SB.from('content_blocks').upsert(fallbackRow, { onConflict: 'source_page,slug' });
    error = retry.error || null as any;
  }
  if (error) throw new Error(error.message);
}

function normalizeLinks($frag: cheerio.CheerioAPI, el: cheerio.Cheerio<unknown>) {
  el.find('a[href^="/"]').each((_, a) => {
    const $a = $frag(a as unknown as any);
    const href = $a.attr('href');
    if (href && href.startsWith('/')) $a.attr('href', `${SITE_URL}${href}`);
  });
}

async function ingestOne({ file, source }: Source) {
  const full = path.join(process.cwd(), 'resource toolkits', file);
  const raw = await fs.readFile(full, 'utf8');
  const $ = cheerio.load(raw);
  const sanitize = makeSanitizer();

  const headings = $('h2, h3, h4');
  let order = 0;
  for (let i = 0; i < headings.length; i += 1) {
    const h = headings[i];
    const level = Number(h.tagName?.slice(1) || 2);
    if (level < 2 || level > 4) continue;

    const $h = $(h);
    const title = $h.text().trim();
    if (!title) continue;
    const slug = slugify(title);

    // collect content until next heading of same or higher level
    const frag: unknown[] = [];
    let sib = $h.next();
    while (sib.length) {
      const tag = sib[0].tagName?.toLowerCase();
      if (tag === 'h2' || tag === 'h3' || tag === 'h4') {
        const nextLevel = Number(tag.slice(1));
        if (nextLevel <= level) break;
      }
      normalizeLinks($, sib);
      frag.push(sib[0] as unknown);
      sib = sib.next();
    }

    const html = sanitize(frag.map(x => $.html(x)).join('\n'));
    const txt = textOnly(html);
    const summary = txt.split('. ').slice(0, 2).join('. ') + (txt ? '.' : '');
    const block_type = classifyBlock($, $(frag as any));
    const tags = deriveTags(source, title);
    const topics = deriveTopics(source, title, txt);
    const est_read_min = Math.max(1, Math.ceil(txt.split(' ').length / 220));

    await upsertBlock({
      source_page: source,
      slug,
      hlevel: level,
      title,
      html,
      text_content: txt,
      block_type,
      tags,
      topics,
      horder: order++,
      est_read_min,
      summary,
    });

    process.stdout.write(`V2 Inserted ${source}/${slug} (h${level})\n`);
  }
}

async function main() {
  for (const s of SOURCES) {
    try {
      await ingestOne(s);
    } catch (e) {
      console.error('V2 ingest failed for', s.file, e);
    }
  }
  console.log('Ingestion V2 complete.');
}

main().catch(e => { console.error(e); process.exit(1); });

// --- Topics derivation (heuristic taxonomy) ---
function deriveTopics(source: string, title: string, text: string): string[] {
  const hay = `${source} ${title} ${text}`.toLowerCase();
  const topics = new Set<string>();

  const addIf = (cond: boolean, t: string) => { if (cond) topics.add(t); };

  // Hubs
  addIf(source.includes('pcs'), 'pcs');
  addIf(source.includes('career'), 'career');
  addIf(source.includes('deployment'), 'deployment');
  addIf(source.includes('shopping'), 'on-base-shopping');

  // PCS & Housing
  addIf(/\bpcs\b|pre-?move|move prep|timeline|orders in hand|first 30 days/.test(hay), 'pcs-prep');
  addIf(/bah|basic allowance for housing|rent|lease|on[- ]base|off[- ]base|housing/.test(hay), 'housing');
  addIf(/va loan|va mortgage|entitlement/.test(hay), 'va-loan');
  addIf(/license transfer|licen[cs]ure|re-?licen[cs]ing|recertification/.test(hay), 'license-transfer');
  addIf(/efmp/.test(hay), 'efmp');
  addIf(/oconus|sofa|host[- ]nation/.test(hay), 'oconus');

  // Career
  addIf(/portable career|remote work|work from home|telework|telecommute/.test(hay), 'remote-work');
  addIf(/resume|interview|ats|cover letter/.test(hay), 'resume');
  addIf(/job search|apply|application|hiring|employer|network/.test(hay), 'job-search');
  addIf(/networking|mentor(ship)?|linkedin/.test(hay), 'networking');
  addIf(/entrepreneur|business plan|llc|sole proprietorship|clients|marketing/.test(hay), 'entrepreneurship');
  addIf(/usajobs|federal resume|military spouse preference|noncompetitive|5 cfr 315\.612/.test(hay), 'federal-employment');
  addIf(/mycaa|seco/.test(hay), 'mycaa');
  addIf(/certificate|certification|upskilling|google career certificates|pmp|comptia|trailhead|salesforce/.test(hay), 'certifications');

  // Finance
  addIf(/tsp|thrift savings plan|brs/.test(hay), 'tsp');
  addIf(/sdp|savings deposit program/.test(hay), 'sdp');
  addIf(/budget|debt|emergency fund|savings/.test(hay), 'personal-finance');
  addIf(/tax/.test(hay), 'taxes');

  // Deployment
  addIf(/pre[- ]deployment|homefront|reintegration/.test(hay), 'deployment-phases');

  // Content styles
  addIf(/faq|q:|question:/.test(hay), 'faq');
  addIf(/checklist|do this now|next steps|action/.test(hay), 'checklist');
  addIf(/tip|pro[- ]?tip/.test(hay), 'tips');

  // Return stable, capped list
  return Array.from(topics).slice(0, 8);
}
