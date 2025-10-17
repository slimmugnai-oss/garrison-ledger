/**
 * DYNAMIC QUESTION ENGINE
 * Contextual follow-up questions based on user responses
 * 
 * AI Cost: +$0.04 per assessment (2 extra questions × $0.02 each)
 */

export type DynamicQuestion = {
  id: string;
  question: string;
  type: 'select' | 'multiselect' | 'text' | 'number';
  options?: string[];
  context?: string;
  triggeredBy: string; // Parent question ID
  triggerValue: string | string[]; // Parent answer that triggers this
};

/**
 * Dynamic questions triggered by specific answers
 */
export const DYNAMIC_QUESTIONS: Record<string, DynamicQuestion[]> = {
  
  // ============================================
  // DEPLOYMENT-RELATED FOLLOW-UPS
  // ============================================
  'deployment_status': [
    {
      id: 'deployment_timeline',
      question: 'When is your deployment date?',
      type: 'select',
      options: [
        'Within 30 days',
        '1-3 months',
        '3-6 months',
        '6-12 months',
        'Not yet scheduled'
      ],
      context: 'Helps prioritize deployment preparation tasks',
      triggeredBy: 'deployment_status',
      triggerValue: 'Pre-deployment (notified)'
    },
    {
      id: 'deployment_concerns',
      question: 'What\'s your biggest deployment-related financial concern?',
      type: 'select',
      options: [
        'Managing money while deployed',
        'Spouse handling finances alone',
        'Maximizing SDP (Savings Deposit Program)',
        'Maintaining budget with pay changes',
        'Family support and childcare costs'
      ],
      context: 'Focuses your plan on deployment-specific guidance',
      triggeredBy: 'deployment_status',
      triggerValue: 'Pre-deployment (notified)'
    }
  ],
  
  // ============================================
  // DEBT-RELATED FOLLOW-UPS
  // ============================================
  'biggest_concern': [
    {
      id: 'debt_types',
      question: 'What types of debt do you have?',
      type: 'multiselect',
      options: [
        'Credit cards',
        'Auto loan',
        'Student loans',
        'Personal loan',
        'Mortgage',
        'Medical debt'
      ],
      context: 'Helps prioritize which debts to tackle first',
      triggeredBy: 'biggest_concern',
      triggerValue: 'Debt payoff'
    },
    {
      id: 'debt_payoff_timeline',
      question: 'What\'s your target timeline for being debt-free?',
      type: 'select',
      options: [
        '6 months',
        '1 year',
        '2-3 years',
        '5+ years',
        'Just want to reduce it'
      ],
      context: 'Sets realistic goals and action plan',
      triggeredBy: 'biggest_concern',
      triggerValue: 'Debt payoff'
    }
  ],
  
  // ============================================
  // TSP/RETIREMENT FOLLOW-UPS
  // ============================================
  'financial_goals': [
    {
      id: 'tsp_contribution_rate',
      question: 'What percentage of your base pay do you currently contribute to TSP?',
      type: 'select',
      options: [
        '0% (not contributing)',
        '1-4% (below BRS match)',
        '5% (getting full BRS match)',
        '6-10%',
        '11-15%',
        'Maxing out ($23,000/year)'
      ],
      context: 'Helps optimize your TSP strategy',
      triggeredBy: 'financial_goals',
      triggerValue: 'Maximize TSP contributions'
    },
    {
      id: 'retirement_timeline',
      question: 'When do you plan to retire?',
      type: 'select',
      options: [
        'Under 10 years',
        '10-15 years',
        '15-20 years',
        '20+ years (full career)',
        'Already planning to separate soon'
      ],
      context: 'Adjusts retirement planning strategy',
      triggeredBy: 'financial_goals',
      triggerValue: 'Maximize TSP contributions'
    }
  ],
  
  // ============================================
  // HOUSE PURCHASE FOLLOW-UPS
  // ============================================
  'financial_goals_house': [
    {
      id: 'house_purchase_timeline',
      question: 'When are you planning to buy a house?',
      type: 'select',
      options: [
        'Within 6 months',
        '6-12 months',
        '1-2 years',
        '2-3 years',
        'Just researching for now'
      ],
      context: 'Determines urgency of saving strategy',
      triggeredBy: 'financial_goals',
      triggerValue: 'Save for house down payment'
    },
    {
      id: 'house_hacking_interest',
      question: 'Are you interested in house hacking (using BAH to cover mortgage + rental income)?',
      type: 'select',
      options: [
        'Very interested - want to learn more',
        'Maybe - need more information',
        'Not interested - just want primary residence',
        'Already house hacking'
      ],
      context: 'Customizes housing strategy recommendations',
      triggeredBy: 'financial_goals',
      triggerValue: 'Save for house down payment'
    }
  ],
  
  // ============================================
  // CAREER TRANSITION FOLLOW-UPS
  // ============================================
  'financial_goals_career': [
    {
      id: 'transition_timeline',
      question: 'When are you planning to transition out of the military?',
      type: 'select',
      options: [
        'Within 6 months',
        '6-12 months',
        '1-2 years',
        '2-3 years',
        'Just exploring options'
      ],
      context: 'Prioritizes transition preparation tasks',
      triggeredBy: 'financial_goals',
      triggerValue: 'Prepare for career transition'
    },
    {
      id: 'civilian_career_direction',
      question: 'What\'s your post-military career direction?',
      type: 'select',
      options: [
        'Similar field (defense contractor, etc.)',
        'New career (need retraining)',
        'Entrepreneurship',
        'Government/federal civilian',
        'Still deciding'
      ],
      context: 'Tailors career guidance and benefit usage',
      triggeredBy: 'financial_goals',
      triggerValue: 'Prepare for career transition'
    }
  ],
  
  // ============================================
  // EMERGENCY FUND FOLLOW-UPS
  // ============================================
  'financial_goals_emergency': [
    {
      id: 'emergency_fund_target',
      question: 'What\'s your target emergency fund amount?',
      type: 'select',
      options: [
        '$1,000 (starter emergency fund)',
        '$3,000-$5,000 (1-2 months expenses)',
        '$10,000-$15,000 (3-6 months expenses)',
        '$20,000+ (6+ months expenses)',
        'Not sure - need help calculating'
      ],
      context: 'Sets specific savings goals',
      triggeredBy: 'financial_goals',
      triggerValue: 'Build emergency fund'
    }
  ]
};

/**
 * Get dynamic questions based on user's answers
 */
export function getDynamicQuestions(
  answers: Record<string, string | string[]>
): DynamicQuestion[] {
  const dynamicQuestions: DynamicQuestion[] = [];
  
  // Check each answer to see if it triggers dynamic questions
  for (const [questionId, answer] of Object.entries(answers)) {
    const questionsForThis = DYNAMIC_QUESTIONS[questionId] || [];
    
    for (const dynamicQ of questionsForThis) {
      // Check if answer matches trigger value
      if (Array.isArray(dynamicQ.triggerValue)) {
        // Trigger value is array - check if answer is in array
        if (Array.isArray(answer)) {
          // Both are arrays - check intersection
          if (dynamicQ.triggerValue.some(v => answer.includes(v))) {
            dynamicQuestions.push(dynamicQ);
          }
        } else {
          // Answer is string, trigger is array
          if (dynamicQ.triggerValue.includes(answer)) {
            dynamicQuestions.push(dynamicQ);
          }
        }
      } else {
        // Trigger value is string - simple match
        if (answer === dynamicQ.triggerValue) {
          dynamicQuestions.push(dynamicQ);
        }
      }
    }
  }
  
  return dynamicQuestions;
}

/**
 * Check if a dynamic question should be asked based on user's answers
 */
export function shouldAskDynamicQuestion(
  questionId: string,
  answers: Record<string, string | string[]>,
  questionsAsked: string[]
): boolean {
  // Don't ask if already asked
  if (questionsAsked.includes(questionId)) {
    return false;
  }
  
  // Find this question in the dynamic questions registry
  for (const questions of Object.values(DYNAMIC_QUESTIONS)) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      // Check if trigger condition is met
      const triggerAnswer = answers[question.triggeredBy];
      if (!triggerAnswer) return false;
      
      if (Array.isArray(question.triggerValue)) {
        if (Array.isArray(triggerAnswer)) {
          return question.triggerValue.some(v => triggerAnswer.includes(v));
        } else {
          return question.triggerValue.includes(triggerAnswer);
        }
      } else {
        return triggerAnswer === question.triggerValue;
      }
    }
  }
  
  return false;
}

