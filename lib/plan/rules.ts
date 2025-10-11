export type AssessmentFacts = { v21?: {
  foundation?: { serviceYears?: string; familySnapshot?: string; efmp?: boolean };
  move?: { pcsSituation?: string; oconus?: 'yes'|'no'|'unsure' };
  deployment?: { status?: string };
  career?: { ambitions?: string[] };
  finance?: { priority?: string };
} };

export type PlanBuckets = {
  pcs: string[];
  career: string[];
  finance: string[];
  deployment: string[];
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
  if (stage && stage !== 'none') buckets.pcs.push('pcs-intelligence-briefing-the-post-ghc-reality-critical-update');
  if (stage === 'orders' || stage === 'window') buckets.pcs.push('pre-move-prep-3-6-months-out');
  if (efmp) buckets.pcs.push('specialized-support-for-efmp-families');

  // Career
  if (ambitions.includes('job') || ambitions.includes('portable')) buckets.career.push('career-exploration-and-portable-fields');
  if (ambitions.includes('education')) buckets.career.push('the-education-hub-my-caa-and-beyond');
  if (ambitions.includes('business')) buckets.career.push('the-spouse-preneur-toolkit-be-your-own-boss');

  // Finance
  if (finPriority === 'budget') buckets.finance.push('building-your-financial-foundation');
  if (finPriority === 'tsp') buckets.finance.push('planning-for-the-future-the-brs-and-thrift-savings-plan-tsp');
  if (finPriority === 'va') buckets.finance.push('your-pcs-shopping-toolkit');

  // Deployment
  if (dep === 'pre') buckets.deployment.push('phase-1-pre-deployment-readiness');
  if (dep === 'current') buckets.deployment.push('phase-2-the-homefront');
  if (dep === 'reintegration') buckets.deployment.push('phase-3-reintegration-and-homecoming');

  // De-duplicate
  (Object.keys(buckets) as Array<keyof PlanBuckets>).forEach(k => {
    buckets[k] = Array.from(new Set(buckets[k]));
  });

  return buckets;
}

