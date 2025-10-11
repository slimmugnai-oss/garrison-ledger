export type AssessmentFacts = { v21?: {
  foundation?: { serviceYears?: string; familySnapshot?: string; efmp?: boolean };
  move?: { pcsSituation?: string; oconus?: 'yes'|'no'|'unsure' };
  deployment?: { status?: string };
  career?: { ambitions?: string[] };
  finance?: { priority?: string };
} };

export type BucketItem = { slug: string; why?: string };
export type PlanBuckets<T = BucketItem[]> = {
  pcs: T;
  career: T;
  finance: T;
  deployment: T;
};

export function runPlanBuckets(facts: AssessmentFacts): PlanBuckets {
  const buckets: PlanBuckets = { pcs: [], career: [], finance: [], deployment: [] };
  const v21 = facts?.v21 || {};
  const stage = String(v21?.move?.pcsSituation || '');
  const dep = String(v21?.deployment?.status || '');
  const efmp = Boolean(v21?.foundation?.efmp);
  const ambitions = Array.isArray(v21?.career?.ambitions) ? v21.career!.ambitions! : [];
  const finPriority = String(v21?.finance?.priority || '');

  // PCS
  if (stage && stage !== 'none') buckets.pcs.push({ slug: 'pcs-intelligence-briefing-the-post-ghc-reality-critical-update', why: 'Because your next move is on the horizon, you need the latest PCS intel to avoid costly mistakes.' });
  if (stage === 'orders' || stage === 'window') buckets.pcs.push({ slug: 'pre-move-prep-3-6-months-out', why: 'Because you are in your PCS window or have orders in hand, time-sensitive prep belongs at the top of your list.' });
  if (efmp) buckets.pcs.push({ slug: 'specialized-support-for-efmp-families', why: 'Because your family is enrolled in EFMP, coordinating medical and educational support during the move is your top logistical priority.' });

  // Career
  if (ambitions.includes('job') || ambitions.includes('portable')) buckets.career.push({ slug: 'career-exploration-and-portable-fields', why: 'Because your goal is a portable, resilient career, these fields travel well across moves.' });
  if (ambitions.includes('education')) buckets.career.push({ slug: 'the-education-hub-my-caa-and-beyond', why: 'Because you plan to upskill, MyCAA and other pathways can cut time and cost.' });
  if (ambitions.includes('business')) buckets.career.push({ slug: 'the-spouse-preneur-toolkit-be-your-own-boss', why: 'Because you want to grow your business, these steps accelerate revenue and portability.' });

  // Finance
  if (finPriority === 'budget') buckets.finance.push({ slug: 'building-your-financial-foundation', why: 'Because stabilizing cash flow first makes every other decision easier and safer.' });
  if (finPriority === 'maximize_tsp' || finPriority === 'tsp') buckets.finance.push({ slug: 'planning-for-the-future-the-brs-and-thrift-savings-plan-tsp', why: 'Because investing for retirement now compounds across moves and deployments.' });
  if (finPriority === 'use_va_loan' || finPriority === 'va') buckets.finance.push({ slug: 'your-pcs-shopping-toolkit', why: 'Because using your VA benefit smartly at PCS can protect your budget long-term.' });
  if (finPriority === 'pay_debt') buckets.finance.push({ slug: 'financial-wellness-debt-management', why: 'Because reducing high-interest debt lifts monthly cash flow and lowers risk.' });
  if (finPriority === 'emergency_savings') buckets.finance.push({ slug: 'financial-wellness-emergency-fund', why: 'Because a 1–3 month buffer keeps PCS surprises from becoming crises.' });

  // Deployment
  if (dep === 'pre') buckets.deployment.push({ slug: 'phase-1-pre-deployment-readiness', why: 'Because pre-deployment checklists prevent last-minute scrambles and missed benefits.' });
  if (dep === 'current') buckets.deployment.push({ slug: 'phase-2-the-homefront', why: 'Because you are currently deployed, the homefront plan keeps bills, childcare, and support stable.' });
  if (dep === 'reintegration') buckets.deployment.push({ slug: 'phase-3-reintegration-and-homecoming', why: 'Because reintegration is its own mission, this guide smooths the transition home.' });

  // De-duplicate
  (Object.keys(buckets) as Array<keyof PlanBuckets>).forEach(k => {
    const seen = new Set<string>();
    buckets[k] = (buckets[k] as BucketItem[]).filter(it => {
      if (seen.has(it.slug)) return false;
      seen.add(it.slug);
      return true;
    });
  });

  return buckets;
}

