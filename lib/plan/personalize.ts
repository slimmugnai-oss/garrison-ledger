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
  horder: number;
};

export function scoreBlock(block: V2Block, ctx: UserContext): number {
  let score = 0;
  // tag overlap
  for (const t of block.tags || []) if (ctx.candidateTags.has(t)) score += 8;
  // related keywords
  const text = `${block.title} ${block.text_content}`.toLowerCase();
  for (const kw of ctx.candidateTags) if (text.includes(kw)) score += 4;
  // block type weights
  if (block.block_type === 'checklist') score += 3;
  if (block.block_type === 'table') score += 2;
  // time relevance
  if (ctx.timelineMonths != null) {
    if (ctx.timelineMonths <= 6 && /pre[- ]?move|first 30 days|timeline/i.test(block.title)) score += 3;
  }
  // demography boosts
  if ((ctx.dependents || 0) > 0 && /kids|children|school/i.test(text)) score += 3;
  if (ctx.housingStatus === 'on_base' && /on[- ]base|access/i.test(text)) score += 2;
  if (ctx.housingStatus === 'off_base' && /off[- ]base|bah|rent/i.test(text)) score += 2;
  return score;
}


