export type UserContext = {
  stage?: 'pcs_soon' | 'pcs_later' | 'deployment' | 'reintegration';
  dependents?: number;
  bah?: number;
  tspContribution?: number;
  sdpAmount?: number;
  rankCategory?: string;
  timelineMonths?: number; // months to PCS if known
  housingStatus?: 'on_base' | 'off_base' | 'unsure';
  isBuyingLikely?: boolean;
  needsMyCAA?: boolean;
  portableCareerInterestHigh?: boolean;
  candidateTags: Set<string>;
  // Elite tier preferences
  topicInterests?: string[];
  urgency?: 'low' | 'normal' | 'high';
  knowledgeLevel?: 'beginner' | 'intermediate' | 'advanced';
  formatPreference?: string[];
};

type AnyObj = Record<string, unknown>;

function num(obj: AnyObj, path: string[], fallback = 0): number {
  let cur: unknown = obj;
  for (const k of path) {
    if (typeof cur === 'object' && cur !== null && k in (cur as AnyObj)) cur = (cur as AnyObj)[k];
    else return fallback;
  }
  const n = typeof cur === 'number' ? cur : Number(cur);
  return Number.isFinite(n) ? (n as number) : fallback;
}

function str(obj: AnyObj, path: string[], fallback = ''): string {
  let cur: unknown = obj;
  for (const k of path) {
    if (typeof cur === 'object' && cur !== null && k in (cur as AnyObj)) cur = (cur as AnyObj)[k];
    else return fallback;
  }
  return typeof cur === 'string' ? cur : fallback;
}

export function buildUserContext(answers: AnyObj): UserContext {
  const pcs = str(answers, ['timeline', 'pcsDate'], '');
  const timelineMonths = pcs.includes('within_6_months') ? 6 : pcs.includes('within_12_months') ? 12 : pcs.includes('soon') ? 3 : 24;
  const stage: UserContext['stage'] = pcs ? 'pcs_soon' : undefined;
  const dependents = num(answers, ['personal', 'dependents'], NaN);
  const bah = num(answers, ['housing', 'bahAmount'], 0);
  const tspContribution = num(answers, ['financial', 'tspContribution'], 0);
  const sdpAmount = num(answers, ['timeline', 'sdpAmount'], 0);
  const rankCategory = str(answers, ['personal', 'rankCategory'], '');
  const housingStatus = str(answers, ['housing', 'housingStatus'], '') as UserContext['housingStatus'];
  const portableCareerInterest = str(answers, ['career', 'portableCareerInterest'], '').toLowerCase();

  const isBuyingLikely = housingStatus === 'off_base' && timelineMonths <= 12;
  const needsMyCAA = str(answers, ['career', 'educationGoals'], '') === 'true';
  const portableCareerInterestHigh = portableCareerInterest === 'high';

  // Elite tier: extract preferences
  const v21 = (answers as Record<string, unknown>)?.v21 as Record<string, unknown> | undefined || {};
  const prefs = (v21?.preferences as Record<string, unknown> | undefined) || {};
  const topicInterests = Array.isArray(prefs.topicInterests) ? prefs.topicInterests : [];
  const urgency = str(prefs as AnyObj, ['urgency'], 'normal') as UserContext['urgency'];
  const knowledgeLevel = str(prefs as AnyObj, ['knowledgeLevel'], 'intermediate') as UserContext['knowledgeLevel'];
  const formatPreference = Array.isArray(prefs.formatPreference) ? prefs.formatPreference : [];

  const candidateTags = new Set<string>();
  if (stage === 'pcs_soon') candidateTags.add('pcs');
  if (dependents && dependents > 0) candidateTags.add('kids');
  if (bah > 0) candidateTags.add('bah');
  if (tspContribution > 0) candidateTags.add('tsp');
  if (sdpAmount > 0) candidateTags.add('sdp');
  if (portableCareerInterestHigh) candidateTags.add('career');
  if (isBuyingLikely) candidateTags.add('house');

  return {
    stage,
    dependents: Number.isFinite(dependents) ? dependents : undefined,
    bah,
    tspContribution,
    sdpAmount,
    rankCategory,
    timelineMonths,
    housingStatus,
    isBuyingLikely,
    needsMyCAA,
    portableCareerInterestHigh,
    candidateTags,
    topicInterests,
    urgency,
    knowledgeLevel,
    formatPreference,
  };
}

export type V2Block = {
  source_page: string;
  slug: string;
  hlevel: number;
  title: string;
  text_content: string;
  block_type: 'section'|'checklist'|'faq'|'table'|'tip';
  tags: string[];
  topics?: string[];
  horder: number;
};

export function scoreBlock(block: V2Block, ctx: UserContext): number {
  let score = 0;
  
  // Topic overlap (primary signal)
  const userTopics = buildUserTopics(ctx);
  for (const t of block.topics || []) {
    if (userTopics.has(t)) score += 12;
  }
  
  // Elite: explicit topic interests from assessment
  for (const t of ctx.topicInterests || []) {
    if ((block.topics || []).includes(t)) score += 15;
  }
  
  // Tag overlap (legacy support)
  for (const t of block.tags || []) if (ctx.candidateTags.has(t)) score += 8;
  
  // Related keywords
  const text = `${block.title} ${block.text_content}`.toLowerCase();
  for (const kw of ctx.candidateTags) if (text.includes(kw)) score += 4;
  
  // Block type weights (with format preference boost)
  const formatPrefs = ctx.formatPreference || [];
  if (block.block_type === 'checklist') {
    score += 3;
    if (formatPrefs.includes('checklists')) score += 5;
  }
  if (block.block_type === 'table') score += 2;
  if (block.block_type === 'tip') {
    score += 1;
    if (formatPrefs.includes('quick-tips')) score += 4;
  }
  if (block.block_type === 'faq' && formatPrefs.includes('faqs')) score += 5;
  
  // Time relevance
  if (ctx.timelineMonths != null) {
    if (ctx.timelineMonths <= 6 && /pre[- ]?move|first 30 days|timeline/i.test(block.title)) score += 5;
    if (ctx.timelineMonths <= 3 && (block.topics || []).includes('pcs-prep')) score += 8;
  }
  
  // Urgency multiplier
  if (ctx.urgency === 'high') {
    if ((block.topics || []).some(t => ['pcs-prep', 'checklist', 'deployment-phases'].includes(t))) {
      score = Math.floor(score * 1.3);
    }
  }
  
  // Knowledge level adjustments
  if (ctx.knowledgeLevel === 'beginner' && /intro|guide|101|basics|getting started/i.test(block.title)) score += 6;
  if (ctx.knowledgeLevel === 'advanced' && /advanced|deep[- ]dive|master/i.test(block.title)) score += 4;
  
  // Demography boosts
  if ((ctx.dependents || 0) > 0 && /kids|children|school/i.test(text)) score += 3;
  if (ctx.housingStatus === 'on_base' && /on[- ]base|access/i.test(text)) score += 2;
  if (ctx.housingStatus === 'off_base' && /off[- ]base|bah|rent/i.test(text)) score += 2;
  
  // EFMP boost
  const efmp = str(ctx as unknown as AnyObj, ['efmp'], '') === 'true';
  if (efmp && (block.topics || []).includes('efmp')) score += 10;
  
  return score;
}

// Map user context to relevant topics
function buildUserTopics(ctx: UserContext): Set<string> {
  const topics = new Set<string>();
  
  // Inferred from context
  if (ctx.stage === 'pcs_soon') {
    topics.add('pcs');
    topics.add('pcs-prep');
    topics.add('housing');
  }
  if (ctx.isBuyingLikely) topics.add('va-loan');
  if (ctx.needsMyCAA) topics.add('mycaa');
  if (ctx.portableCareerInterestHigh) {
    topics.add('remote-work');
    topics.add('career');
    topics.add('job-search');
  }
  if ((ctx.tspContribution || 0) > 0) topics.add('tsp');
  if ((ctx.sdpAmount || 0) > 0) topics.add('sdp');
  if ((ctx.dependents || 0) > 0) {
    topics.add('kids');
    topics.add('efmp');
  }
  
  // Elite: explicit topic interests from assessment
  for (const t of ctx.topicInterests || []) {
    topics.add(t);
  }
  
  return topics;
}


