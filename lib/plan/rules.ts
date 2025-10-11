export type AssessmentFacts = { v21?: {
  foundation?: { serviceYears?: string; familySnapshot?: string; efmp?: boolean };
  move?: { pcsSituation?: string; oconus?: 'yes'|'no'|'unsure' };
  deployment?: { status?: string };
  career?: { ambitions?: string[] };
  finance?: { priority?: string };
  preferences?: {
    topicInterests?: string[];
    urgency?: string;
    knowledgeLevel?: string;
    formatPreference?: string[];
  };
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
  
  // Elite tier: preferences-based recommendations
  const prefs = v21?.preferences || {};
  const topicInterests = Array.isArray(prefs.topicInterests) ? prefs.topicInterests : [];
  const urgency = String(prefs.urgency || 'normal');
  const knowledgeLevel = String(prefs.knowledgeLevel || 'intermediate');
  const formatPrefs = Array.isArray(prefs.formatPreference) ? prefs.formatPreference : [];

  // PCS - always show something relevant
  if (stage && stage !== 'none') {
    buckets.pcs.push({ slug: 'pcs-intelligence-briefing-the-post-ghc-reality-critical-update', why: 'Because your next move is on the horizon, you need the latest PCS intel to avoid costly mistakes.' });
  }
  if (stage === 'orders' || stage === 'window') {
    buckets.pcs.push({ slug: 'pre-move-prep-3-6-months-out', why: 'Because you are in your PCS window or have orders in hand, time-sensitive prep belongs at the top of your list.' });
  }
  if (stage === 'dwell' || stage === 'arrived') {
    buckets.pcs.push({ slug: 'mental-and-emotional-readiness', why: 'Because you have time to plan, use this dwell period to prepare emotionally and logistically for your next move.' });
    buckets.pcs.push({ slug: 'financial-command-center', why: 'Because you have stability now, building your financial foundation makes the next PCS smoother.' });
  }
  if (efmp) {
    buckets.pcs.push({ slug: 'specialized-support-for-efmp-families', why: 'Because your family is enrolled in EFMP, coordinating medical and educational support during the move is your top logistical priority.' });
  }
  
  // Topic-driven PCS additions
  if (topicInterests.includes('pcs-prep')) buckets.pcs.push({ slug: 'interactive-pcs-timeline-generator', why: 'Because you expressed interest in PCS planning, this timeline tool organizes every deadline.' });
  if (topicInterests.includes('housing')) buckets.pcs.push({ slug: 'new-base-quick-start', why: 'Because housing is a priority, these resources help you settle in fast.' });
  if (topicInterests.includes('oconus') && v21?.move?.oconus === 'yes') buckets.pcs.push({ slug: 'oconus-navigator', why: "Because you're moving overseas, these country-specific guides prevent costly surprises." });

  // Career
  if (ambitions.includes('job') || ambitions.includes('portable')) buckets.career.push({ slug: 'career-exploration-and-portable-fields', why: 'Because your goal is a portable, resilient career, these fields travel well across moves.' });
  if (ambitions.includes('education')) buckets.career.push({ slug: 'the-education-hub-my-caa-and-beyond', why: 'Because you plan to upskill, MyCAA and other pathways can cut time and cost.' });
  if (ambitions.includes('business')) buckets.career.push({ slug: 'the-spouse-preneur-toolkit-be-your-own-boss', why: 'Because you want to grow your business, these steps accelerate revenue and portability.' });
  
  // Topic-driven career additions
  if (topicInterests.includes('remote-work')) buckets.career.push({ slug: 'resume-power-up-translate-your-life', why: 'Because you want remote work, translating military life into resume gold is essential.' });
  if (topicInterests.includes('federal-employment')) buckets.career.push({ slug: 'mastering-federal-employment-navigate-usajobs', why: 'Because federal jobs offer stability and PCS portability, mastering USAJOBS opens powerful doors.' });
  if (topicInterests.includes('mycaa') && knowledgeLevel === 'beginner') buckets.career.push({ slug: 'deep-dive-my-caa-scholarship', why: "Because you're new to MyCAA, this deep-dive walks you through every step of the $4,000 benefit." });
  if (topicInterests.includes('entrepreneurship')) buckets.career.push({ slug: 'step-1-create-a-simple-business-plan', why: 'Because you want to start a business, this 1-page plan framework gets you moving fast.' });
  
  // Urgency boost for checklists
  if (urgency === 'high' && formatPrefs.includes('checklists') && stage === 'orders') {
    buckets.pcs.unshift({ slug: 'detailed-task-checklist', why: 'Because you need immediate action steps, this checklist breaks down your move into daily tasks.' });
  }

  // Finance - always show something
  if (finPriority === 'budget' || !finPriority) {
    buckets.finance.push({ slug: 'building-your-financial-foundation', why: 'Because stabilizing cash flow first makes every other decision easier and safer.' });
  }
  if (finPriority === 'tsp') {
    buckets.finance.push({ slug: 'planning-for-the-future-the-brs-and-thrift-savings-plan-tsp', why: 'Because investing for retirement now compounds across moves and deployments.' });
  }
  if (finPriority === 'va') {
    buckets.finance.push({ slug: 'your-pcs-shopping-toolkit', why: 'Because using your VA benefit smartly at PCS can protect your budget long-term.' });
  }
  if (finPriority === 'debt') {
    buckets.finance.push({ slug: 'debt-management-and-the-scra', why: 'Because reducing high-interest debt lifts monthly cash flow and lowers risk.' });
  }
  if (finPriority === 'emergency') {
    buckets.finance.push({ slug: 'the-emergency-fund', why: 'Because a 1–3 month buffer keeps PCS surprises from becoming crises.' });
  }
  
  // Topic-driven finance additions
  if (topicInterests.includes('tsp')) {
    buckets.finance.push({ slug: 'the-two-pillars-pension-and-tsp', why: 'Because you want to understand TSP, this breaks down the BRS in plain language.' });
  }
  if (topicInterests.includes('sdp')) {
    buckets.finance.push({ slug: 'lower-your-interest-rates-with-scra', why: 'Because SDP and SCRA both maximize deployment pay, pairing them protects your financial future.' });
  }

  // Deployment
  if (dep === 'pre') buckets.deployment.push({ slug: 'phase-1-pre-deployment-readiness', why: 'Because pre-deployment checklists prevent last-minute scrambles and missed benefits.' });
  if (dep === 'current') buckets.deployment.push({ slug: 'phase-2-the-homefront', why: 'Because you are currently deployed, the homefront plan keeps bills, childcare, and support stable.' });
  if (dep === 'reintegration') buckets.deployment.push({ slug: 'phase-3-reintegration-and-homecoming', why: 'Because reintegration is its own mission, this guide smooths the transition home.' });
  
  // Topic-driven deployment additions
  if (topicInterests.includes('deployment-phases') && formatPrefs.includes('faqs')) buckets.deployment.push({ slug: 'legal-and-financial-preparation', why: 'Because you want quick answers, these FAQs address POA, pay, and admin in plain language.' });

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

