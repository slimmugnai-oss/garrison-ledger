/**
 * Utility functions for injecting Binder CTAs into plan content
 */

interface BinderCTAConfig {
  keywords: string[];
  folder: string;
  docType: string;
  ctaText: string;
}

const CTA_CONFIGS: BinderCTAConfig[] = [
  {
    keywords: ["orders", "pcs orders", "reassignment orders", "deployment orders"],
    folder: "PCS Documents",
    docType: "orders",
    ctaText: "Upload your orders to your Binder →"
  },
  {
    keywords: ["power of attorney", "poa", "legal documents"],
    folder: "Legal",
    docType: "poa",
    ctaText: "Upload your Power of Attorney →"
  },
  {
    keywords: ["lease", "rental agreement", "housing contract"],
    folder: "Housing Records",
    docType: "lease",
    ctaText: "Upload your lease to your Binder →"
  },
  {
    keywords: ["deed", "property deed", "home ownership"],
    folder: "Housing Records",
    docType: "deed",
    ctaText: "Upload your deed to your Binder →"
  },
  {
    keywords: ["tax return", "taxes", "w-2", "1099"],
    folder: "Financial Records",
    docType: "tax_return",
    ctaText: "Upload your tax documents →"
  },
  {
    keywords: ["insurance", "insurance policy", "coverage"],
    folder: "Financial Records",
    docType: "insurance",
    ctaText: "Upload your insurance documents →"
  },
  {
    keywords: ["birth certificate", "passport", "id card", "identification"],
    folder: "Personal Records",
    docType: "birth_cert",
    ctaText: "Upload your personal documents →"
  },
  {
    keywords: ["household goods", "household inventory", "hhg", "shipment"],
    folder: "PCS Documents",
    docType: "other",
    ctaText: "Upload your household inventory →"
  }
];

/**
 * Inject Binder CTAs into HTML content based on keyword matches
 */
export function injectBinderCTAs(html: string, blockTitle: string, blockSlug: string): string {
  const lowerHtml = html.toLowerCase();
  const lowerTitle = blockTitle.toLowerCase();
  const combinedText = lowerHtml + " " + lowerTitle;

  const matches: BinderCTAConfig[] = [];

  // Find all matching CTAs
  for (const config of CTA_CONFIGS) {
    for (const keyword of config.keywords) {
      if (combinedText.includes(keyword.toLowerCase())) {
        // Avoid duplicates
        if (!matches.find(m => m.folder === config.folder && m.docType === config.docType)) {
          matches.push(config);
        }
        break;
      }
    }
  }

  if (matches.length === 0) {
    return html;
  }

  // Generate CTA HTML
  const ctasHtml = matches.map(config => {
    const binderUrl = `/dashboard/binder?target=${encodeURIComponent(config.folder)}`;
    return `
      <div class="binder-cta" style="margin: 1.5rem 0; padding: 1rem 1.25rem; background: linear-gradient(135deg, #00E5A0 0%, #00CC8E 100%); border-radius: 12px; display: flex; align-items: center; gap: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0, 229, 160, 0.1), 0 2px 4px -1px rgba(0, 229, 160, 0.06);">
        <svg style="width: 20px; height: 20px; flex-shrink: 0; color: #0A0F1E;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <a href="${binderUrl}" class="binder-cta-link" style="color: #0A0F1E; text-decoration: none; font-weight: 600; font-size: 0.938rem; flex: 1;" data-track-event="binder_cta_click" data-track-props='{"slug":"${blockSlug}","folder":"${config.folder}","docType":"${config.docType}"}'>
          ${config.ctaText}
        </a>
        <svg style="width: 16px; height: 16px; flex-shrink: 0; color: #0A0F1E;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    `;
  }).join('\n');

  // Try to inject after the first paragraph or heading
  const insertPoints = [
    /<\/p>/i,
    /<\/h3>/i,
    /<\/h4>/i,
    /<\/ul>/i,
    /<\/ol>/i
  ];

  for (const pattern of insertPoints) {
    const match = html.match(pattern);
    if (match && match.index !== undefined) {
      const insertPos = match.index + match[0].length;
      return html.slice(0, insertPos) + ctasHtml + html.slice(insertPos);
    }
  }

  // Fallback: prepend to content
  return ctasHtml + html;
}

/**
 * Check if a block should have Binder CTAs based on its content
 */
export function shouldHaveBinderCTA(blockTitle: string, blockSlug: string, blockHtml: string): boolean {
  const combinedText = (blockTitle + " " + blockSlug + " " + blockHtml).toLowerCase();
  
  return CTA_CONFIGS.some(config => 
    config.keywords.some(keyword => combinedText.includes(keyword.toLowerCase()))
  );
}

