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

type AssessmentRecord = Record<string, unknown>;
type ProfileRecord = Record<string, unknown> | null;

export function normalizeAssessment(
  answers: AssessmentRecord,
  profile: ProfileRecord
): NormalizedAssessment {
  const s = (answers?.strategic || {}) as AssessmentRecord;
  const c = (answers?.comprehensive || {}) as AssessmentRecord;
  const a = (answers?.adaptive || {}) as AssessmentRecord;
  const foundation = (c?.foundation || {}) as AssessmentRecord;
  const move = (c?.move || {}) as AssessmentRecord;
  const deployment = (c?.deployment || {}) as AssessmentRecord;
  const career = (c?.career || {}) as AssessmentRecord;
  const finance = (c?.finance || {}) as AssessmentRecord;

  // Profile data ALWAYS takes precedence
  return {
    // Demographics - prefer profile, fallback to assessment
    age: (profile?.age as number | undefined) || 
         (typeof profile?.birth_year === 'number' ? new Date().getFullYear() - profile.birth_year : undefined),
    gender: profile?.gender as string | undefined,
    yearsOfService: (profile?.years_of_service as number | undefined) || 
                    (typeof profile?.time_in_service_months === 'number' ? Math.floor(profile.time_in_service_months / 12) : undefined),
    rank: (profile?.rank as string | undefined) || (a.rank as string | undefined),
    branch: (profile?.branch as string | undefined) || (a.branch as string | undefined),
    
    // Timeline - prefer profile, fallback to assessment
    pcsSituation: profile?.pcs_date ? 'orders' : 
                  (move?.pcsSituation as string | undefined) || 
                  (a.pcs_situation as string | undefined) || 
                  (s?.pcsTimeline as string | undefined),
    deploymentStatus: (profile?.deployment_status as string | undefined) || 
                      (deployment?.status as string | undefined) || 
                      (a.deployment_status as string | undefined),
    
    // Family - prefer profile
    familyStatus: (profile?.marital_status as string | undefined) || 
                  (a.family_status as string | undefined) || 
                  (foundation?.familySnapshot as string | undefined),
    numChildren: profile?.num_children as number | undefined,
    efmpEnrolled: (profile?.has_efmp as boolean | undefined) ?? 
                  (foundation?.efmpEnrolled as boolean | undefined) ?? 
                  (s?.efmpEnrolled as boolean | undefined),
    
    // Financial - prefer profile
    biggestConcern: (a.biggest_concern as string | undefined) || 
                    (finance?.priority as string | undefined) || 
                    (s?.financialWorry as string | undefined),
    tspRange: profile?.tsp_balance_range as string | undefined,
    debtRange: profile?.debt_amount_range as string | undefined,
    emergencyFundRange: profile?.emergency_fund_range as string | undefined,
    
    // Goals - prefer profile
    careerGoals: (profile?.career_interests as string[] | undefined) || 
                 (career?.ambitions as string[] | undefined) || [],
    financialPriorities: (profile?.financial_priorities as string[] | undefined) || []
  };
}

/**
 * Build user context string for AI prompts
 */
export function buildAIContext(normalized: NormalizedAssessment, profile: ProfileRecord): string {
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

