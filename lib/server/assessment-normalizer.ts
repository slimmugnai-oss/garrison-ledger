import 'server-only';

/**
 * ASSESSMENT NORMALIZER
 * Converts any assessment format (strategic/comprehensive/adaptive) into a unified format
 * This eliminates the need for complex fallback logic in AI context building
 */

export type NormalizedAssessment = {
  // Demographics
  age?: number;
  gender?: string;
  yearsOfService?: number;
  rank?: string;
  branch?: string;
  
  // Timeline
  pcsSituation?: string;
  deploymentStatus?: string;
  
  // Family
  familyStatus?: string;
  numChildren?: number;
  efmpEnrolled?: boolean;
  
  // Financial
  biggestConcern?: string;
  tspRange?: string;
  debtRange?: string;
  emergencyFundRange?: string;
  
  // Goals
  careerGoals?: string[];
  financialPriorities?: string[];
};

export function normalizeAssessment(
  answers: Record<string, any>,
  profile: Record<string, any> | null
): NormalizedAssessment {
  const s = answers?.strategic || {};
  const c = answers?.comprehensive || {};
  const a = answers?.adaptive || {};
  const foundation = (c?.foundation || {}) as any;
  const move = (c?.move || {}) as any;
  const deployment = (c?.deployment || {}) as any;
  const career = (c?.career || {}) as any;
  const finance = (c?.finance || {}) as any;

  // Profile data ALWAYS takes precedence
  return {
    // Demographics - prefer profile, fallback to assessment
    age: profile?.age || profile?.birth_year ? new Date().getFullYear() - profile.birth_year : undefined,
    gender: profile?.gender,
    yearsOfService: profile?.years_of_service || profile?.time_in_service_months ? Math.floor(profile.time_in_service_months / 12) : undefined,
    rank: profile?.rank || a.rank,
    branch: profile?.branch || a.branch,
    
    // Timeline - prefer profile, fallback to assessment
    pcsSituation: profile?.pcs_date ? 'orders' : (move?.pcsSituation || a.pcs_situation || s?.pcsTimeline),
    deploymentStatus: profile?.deployment_status || deployment?.status || a.deployment_status,
    
    // Family - prefer profile
    familyStatus: profile?.marital_status || a.family_status || foundation?.familySnapshot,
    numChildren: profile?.num_children ?? undefined,
    efmpEnrolled: profile?.has_efmp ?? foundation?.efmpEnrolled ?? s?.efmpEnrolled,
    
    // Financial - prefer profile
    biggestConcern: a.biggest_concern || finance?.priority || s?.financialWorry,
    tspRange: profile?.tsp_balance_range,
    debtRange: profile?.debt_amount_range,
    emergencyFundRange: profile?.emergency_fund_range,
    
    // Goals - prefer profile
    careerGoals: profile?.career_interests || career?.ambitions || [],
    financialPriorities: profile?.financial_priorities || []
  };
}

/**
 * Build user context string for AI prompts
 */
export function buildAIContext(normalized: NormalizedAssessment, profile: Record<string, any> | null): string {
  const parts: string[] = [];
  
  // Demographics
  if (normalized.rank) parts.push(`Rank: ${normalized.rank}`);
  if (normalized.branch) parts.push(`Branch: ${normalized.branch}`);
  if (normalized.age) parts.push(`Age: ${normalized.age}`);
  if (normalized.yearsOfService) parts.push(`Years of Service: ${normalized.yearsOfService}`);
  
  // Location
  if (profile?.current_base) parts.push(`Current Base: ${profile.current_base}`);
  if (profile?.next_base) parts.push(`Next Base: ${profile.next_base}`);
  if (profile?.pcs_date) parts.push(`PCS Date: ${profile.pcs_date}`);
  if (normalized.pcsSituation) parts.push(`PCS Status: ${normalized.pcsSituation}`);
  
  // Deployment
  if (normalized.deploymentStatus) parts.push(`Deployment: ${normalized.deploymentStatus}`);
  if (profile?.deployment_count) parts.push(`Deployments Completed: ${profile.deployment_count}`);
  
  // Family
  if (normalized.familyStatus) parts.push(`Family: ${normalized.familyStatus}`);
  if (normalized.numChildren) parts.push(`Children: ${normalized.numChildren}`);
  if (normalized.efmpEnrolled) parts.push(`EFMP: Yes`);
  if (profile?.spouse_age) parts.push(`Spouse Age: ${profile.spouse_age}`);
  
  // Financial
  if (normalized.tspRange) parts.push(`TSP Balance: ${normalized.tspRange}`);
  if (normalized.debtRange) parts.push(`Debt: ${normalized.debtRange}`);
  if (normalized.emergencyFundRange) parts.push(`Emergency Fund: ${normalized.emergencyFundRange}`);
  if (normalized.biggestConcern) parts.push(`Biggest Concern: ${normalized.biggestConcern}`);
  
  // Goals
  if (normalized.careerGoals?.length) parts.push(`Career Interests: ${normalized.careerGoals.join(', ')}`);
  if (normalized.financialPriorities?.length) parts.push(`Financial Priorities: ${normalized.financialPriorities.join(', ')}`);
  
  // Education
  if (profile?.education_level) parts.push(`Education: ${profile.education_level}`);
  
  return parts.join('\n- ');
}

