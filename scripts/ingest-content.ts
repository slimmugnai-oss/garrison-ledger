/*
  Ingests local toolkit HTML files into Supabase content_blocks.
  Usage: pnpm content:ingest
*/
import fs from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import { JSDOM } from "jsdom";
import createDOMPurify from "isomorphic-dompurify";
import slugify from "@sindresorhus/slugify";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase envs. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://familymedia.com";

const SB = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type Source = { file: string; source: string };
const SOURCES: Source[] = [
  { file: "PCS Hub.html", source: "pcs-hub" },
  { file: "Deployment.html", source: "deployment" },
  { file: "Base_Guide.html", source: "base-guides" },
  { file: "Career Guide.html", source: "career-hub" },
  { file: "Shopping.html", source: "on-base-shopping" },
];

function sanitize(html: string) {
  const window = new JSDOM("").window as unknown as Window;
  const DOMPurify = createDOMPurify(window);
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });
}

async function upsertBlock(row: {
  source_page: string;
  slug: string;
  title: string;
  html: string;
  tags: string[];
  horder: number;
}) {
  const { error } = await SB.from("content_blocks").upsert(row, {
    onConflict: "source_page,slug",
  });
  if (error) throw new Error(error.message);
}

async function ingestOne(source: Source) {
  const full = path.join(process.cwd(), "resource toolkits", source.file);
  const raw = await fs.readFile(full, "utf8");
  const $ = cheerio.load(raw);

  const h2s = $("h2");
  let order = 0;
  for (let i = 0; i < h2s.length; i += 1) {
    const el = h2s[i];
    const $h2 = $(el);
    const title = $h2.text().trim();
    if (!title) continue;
    const slug = slugify(title);

    // capture all siblings until next h2
    const parts: string[] = [];
    let sib = $h2.next();
    while (sib.length && sib[0].tagName !== "h2") {
      // fix relative links
      sib.find("a[href^='/' ]").each((_, a) => {
        const $a = $(a);
        const href = $a.attr("href");
        if (href && href.startsWith("/")) $a.attr("href", `${SITE_URL}${href}`);
      });
      parts.push($.html(sib));
      sib = sib.next();
    }

    const html = sanitize(parts.join("\n"));
    const tags = Array.from(new Set([source.source]));
    await upsertBlock({
      source_page: source.source,
      slug,
      title,
      html,
      tags,
      horder: order++,
    });
    process.stdout.write(`Inserted ${source.source}/${slug}\n`);
  }
}

async function main() {
  for (const s of SOURCES) {
    try {
      await ingestOne(s);
    } catch (e) {
      console.error(`Ingest failed for ${s.file}:`, e);
    }
  }
  console.log("Ingestion complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


