// Intelligent Rules Engine - Multi-conditional logic for curated content
export type StrategicAnswers = {
  strategic?: {
    biggestFocus?: string;
    pcsTimeline?: string;
    efmpEnrolled?: boolean;
    careerGoal?: string;
    financialWorry?: string;
  };
};

export type CuratedBlock = {
  slug: string;
  why: string; // Dynamic, situation-specific explanation
};

export type StrategicPlan = {
  primarySituation: string;
  priorityAction: string;
  blocks: CuratedBlock[];
};

export function generateStrategicPlan(answers: StrategicAnswers): StrategicPlan {
  const s = answers?.strategic || {};
  const focus = s.biggestFocus || '';
  const pcs = s.pcsTimeline || '';
  const efmp = s.efmpEnrolled || false;
  const career = s.careerGoal || '';
  const finance = s.financialWorry || '';

  // Rule #1: Urgent EFMP Relocation
  if (focus === 'pcs' && pcs === 'orders' && efmp) {
    return {
      primarySituation: "Urgent EFMP Relocation",
      priorityAction: "Your #1 priority is to immediately contact your EFMP Family Support Coordinator to begin the medical and educational screening for your new location. This is the most time-sensitive part of your entire PCS process.",
      blocks: [
        { 
          slug: 'specialized-support-for-efmp-families', 
          why: "Because you have orders in hand and your family is enrolled in EFMP, coordinating medical and educational support is the most critical and time-sensitive task. Missing deadlines here can delay your entire move." 
        },
        { 
          slug: 'pre-move-prep-3-6-months-out', 
          why: "Because you're in the final months before your move, this comprehensive checklist ensures you don't miss any critical administrative or logistical steps." 
        },
      ],
    };
  }

  // Rule #2: Imminent PCS (Non-EFMP)
  if (focus === 'pcs' && pcs === 'orders') {
    return {
      primarySituation: "Imminent PCS Move",
      priorityAction: "Your #1 priority is to schedule your household goods shipment with TMO and create your PCS binder with all essential documents. Time is of the essence.",
      blocks: [
        { 
          slug: 'pre-move-prep-3-6-months-out', 
          why: "Because you have orders in hand, this checklist breaks down every time-sensitive task you need to complete before your move date." 
        },
        { 
          slug: 'the-move-the-main-event', 
          why: "Because your move is imminent, understanding the logistics of pack-out, travel, and claims will save you thousands of dollars and countless headaches." 
        },
      ],
    };
  }

  // Rule #3: PCS Window Planning
  if (focus === 'pcs' && pcs === 'window') {
    return {
      primarySituation: "Strategic PCS Planning",
      priorityAction: "Your #1 priority is to use this planning window to organize your finances, research your new location, and prepare emotionally for the transition.",
      blocks: [
        { 
          slug: 'pre-move-prep-3-6-months-out', 
          why: "Because you're in the PCS window, starting early with this comprehensive prep checklist gives you maximum control and minimum stress." 
        },
        { 
          slug: 'mental-and-emotional-readiness', 
          why: "Because you have time to plan, addressing the emotional and psychological aspects of relocation now will make the transition smoother for your entire family." 
        },
        { 
          slug: 'pcs-move-questions-answered', 
          why: "Because you're planning ahead, these FAQs answer the most common questions about DLA, TLE, PPM, and other entitlements so you can budget accurately." 
        },
      ],
    };
  }

  // Rule #4: Settled - Future PCS Prep
  if (focus === 'pcs' && pcs === 'settled') {
    return {
      primarySituation: "Long-Term PCS Preparation",
      priorityAction: "Your #1 priority is to use this stability to build financial reserves and emotional readiness for your next move, whenever it comes.",
      blocks: [
        { 
          slug: 'mental-and-emotional-readiness', 
          why: "Because you have stability now, using this time to build emotional resilience and coping strategies will pay dividends when your next PCS orders arrive." 
        },
        { 
          slug: 'building-your-financial-foundation', 
          why: "Because you have time before your next move, building a robust emergency fund and budgeting system now makes the next PCS financially smooth." 
        },
      ],
    };
  }

  // Rule #5: Pre-Deployment Focus
  if (focus === 'deployment') {
    return {
      primarySituation: "Deployment Preparation",
      priorityAction: "Your #1 priority is to complete all legal and financial preparations—Power of Attorney, wills, and allotments—before deployment begins.",
      blocks: [
        { 
          slug: 'phase-1-pre-deployment-readiness', 
          why: "Because deployment is on the horizon, this comprehensive pre-deployment checklist covers every legal, financial, and household task you must complete before they leave." 
        },
        { 
          slug: 'phase-2-the-homefront', 
          why: "Because you'll be managing everything solo, understanding the emotional phases and practical resources for the homefront prepares you for the reality ahead." 
        },
      ],
    };
  }

  // Rule #6: Career - Job Search NOW
  if (focus === 'career' && career === 'find-job') {
    return {
      primarySituation: "Active Job Search",
      priorityAction: "Your #1 priority is to translate your military life experience into a powerful resume and connect with MSEP (Military Spouse Employment Partnership) employers who value your skills.",
      blocks: [
        { 
          slug: 'the-job-search-and-resume-toolkit', 
          why: "Because you need a job now, this guide shows you exactly how to frame deployments, PCS moves, and volunteer work as professional achievements that resonate with hiring managers." 
        },
        { 
          slug: 'career-exploration-and-portable-fields', 
          why: "Because you're job searching, understanding which fields offer the best remote and portable opportunities helps you target roles that will survive your next PCS." 
        },
      ],
    };
  }

  // Rule #7: Career - Portable Future Planning
  if (focus === 'career' && career === 'portable-career') {
    return {
      primarySituation: "Portable Career Development",
      priorityAction: "Your #1 priority is to identify a career field that offers remote work and transferable skills, then create a roadmap to transition into it.",
      blocks: [
        { 
          slug: 'career-exploration-and-portable-fields', 
          why: "Because your goal is career portability, this deep-dive into tech, healthcare, business, and creative fields shows you what's possible and how to get there." 
        },
        { 
          slug: 'the-education-hub-my-caa-and-beyond', 
          why: "Because changing careers often requires new credentials, understanding MyCAA's $4,000 benefit can fund the certifications you need for a portable career." 
        },
      ],
    };
  }

  // Rule #8: Career - Entrepreneurship
  if (focus === 'career' && career === 'business') {
    return {
      primarySituation: "Aspiring Entrepreneur",
      priorityAction: "Your #1 priority is to validate your business idea, choose the correct legal structure (likely an LLC), and understand the tax implications of operating across state lines.",
      blocks: [
        { 
          slug: 'the-spouse-preneur-toolkit-be-your-own-boss', 
          why: "Because your goal is to grow your business, this toolkit walks you through creating a simple business plan, choosing a legal structure, and finding your first customers within the military community." 
        },
        { 
          slug: 'mastering-federal-employment-navigate-usajobs', 
          why: "Because federal employment offers an alternative stable, portable income stream, understanding how Military Spouse Preference works can complement your entrepreneurial income." 
        },
      ],
    };
  }

  // Rule #9: Career - Education/Certification
  if (focus === 'career' && career === 'education') {
    return {
      primarySituation: "Education & Upskilling",
      priorityAction: "Your #1 priority is to check your MyCAA eligibility and choose a portable, high-demand certification that will pay off across multiple duty stations.",
      blocks: [
        { 
          slug: 'the-education-hub-my-caa-and-beyond', 
          why: "Because you want to upskill, understanding MyCAA's full eligibility requirements and application process is essential. This $4,000 benefit can fund certifications in fields like project management, healthcare IT, or digital marketing." 
        },
        { 
          slug: 'career-exploration-and-portable-fields', 
          why: "Because you're investing in education, choosing a field with strong remote work opportunities and nationwide demand ensures your new credential travels well." 
        },
      ],
    };
  }

  // Rule #10: Finances - Budget & Debt Stress
  if (focus === 'finances' && finance === 'budget-debt') {
    return {
      primarySituation: "Financial Stabilization Priority",
      priorityAction: "Your #1 priority is to create a zero-based budget using your Leave and Earnings Statement (LES) and leverage the SCRA to reduce interest rates on existing debt to 6%.",
      blocks: [
        { 
          slug: 'building-your-financial-foundation', 
          why: "Because monthly budgeting stress is your biggest concern, this guide provides actionable steps to build an emergency fund, tackle debt, and access free financial counseling through your installation." 
        },
        { 
          slug: 'decoding-your-paycheck-the-leave-and-earnings-statement-les', 
          why: "Because understanding your LES is the foundation of budgeting, this guide breaks down Base Pay, BAH, BAS, and all deductions so you can accurately plan your monthly cash flow." 
        },
      ],
    };
  }

  // Rule #11: Finances - Emergency Savings Fear
  if (focus === 'finances' && finance === 'emergency-savings') {
    return {
      primarySituation: "Emergency Fund Priority",
      priorityAction: "Your #1 priority is to automate savings via allotments and build a 3-6 month emergency fund in a high-yield savings account. This is your financial shock absorber.",
      blocks: [
        { 
          slug: 'building-your-financial-foundation', 
          why: "Because emergency savings is your focus, this section specifically addresses how to calculate your target fund amount and the strategies military families use to build it systematically." 
        },
        { 
          slug: 'planning-for-the-future-the-brs-and-thrift-savings-plan-tsp', 
          why: "Because building savings is a habit, understanding how to automate TSP contributions alongside emergency fund deposits creates a powerful dual-savings system." 
        },
      ],
    };
  }

  // Rule #12: Finances - Retirement/TSP Uncertainty
  if (focus === 'finances' && finance === 'retirement-tsp') {
    return {
      primarySituation: "Retirement Readiness Focus",
      priorityAction: "Your #1 priority is to log into TSP.gov, verify you're contributing at least 5% to capture the full government match, and ensure your funds are allocated appropriately for your age and risk tolerance.",
      blocks: [
        { 
          slug: 'planning-for-the-future-the-brs-and-thrift-savings-plan-tsp', 
          why: "Because your goal is retirement security, understanding the two pillars of the BRS (pension + TSP) and how the government match works is essential. Small changes to your TSP today can result in hundreds of thousands of dollars over a 20-year career." 
        },
        { 
          slug: 'building-your-financial-foundation', 
          why: "Because retirement planning works best when paired with emergency savings, this guide shows you how to balance short-term financial security with long-term wealth building." 
        },
      ],
    };
  }

  // Rule #13: PCS + Career Combo
  if (focus === 'pcs' && career === 'find-job') {
    return {
      primarySituation: "PCS + Job Search",
      priorityAction: "Your #1 priority is to use your PCS as an opportunity to find remote work that will travel with you to your next duty station and beyond.",
      blocks: [
        { 
          slug: 'the-job-search-and-resume-toolkit', 
          why: "Because you're moving AND job searching, framing your PCS management skills as logistics and project management experience makes you a compelling candidate for remote roles." 
        },
        { 
          slug: 'pre-move-prep-3-6-months-out', 
          why: "Because you're juggling a move and a job search, staying organized with this PCS checklist ensures your job search doesn't derail your move logistics." 
        },
      ],
    };
  }

  // Rule #14: EFMP + Career
  if (efmp && career === 'portable-career') {
    return {
      primarySituation: "EFMP Family Seeking Portable Career",
      priorityAction: "Your #1 priority is to pursue a fully remote career that allows you to maintain employment while managing your family member's specialized care needs across moves.",
      blocks: [
        { 
          slug: 'career-exploration-and-portable-fields', 
          why: "Because your family has EFMP needs, a fully remote career gives you the flexibility to attend appointments and coordinate care without sacrificing your professional growth." 
        },
        { 
          slug: 'the-education-hub-my-caa-and-beyond', 
          why: "Because EFMP families face unique scheduling challenges, online certifications funded by MyCAA allow you to upskill on your own timeline without commuting." 
        },
      ],
    };
  }

  // Rule #15: Deployment + Finances
  if (focus === 'deployment' && finance === 'budget-debt') {
    return {
      primarySituation: "Deployment Financial Preparation",
      priorityAction: "Your #1 priority is to set up allotments for all bills and leverage deployment special pays (FSA, HDP, IDP) plus SCRA protections to pay down debt aggressively during this deployment.",
      blocks: [
        { 
          slug: 'phase-1-pre-deployment-readiness', 
          why: "Because you're preparing for deployment AND focused on finances, this checklist ensures you set up foolproof automatic payments and understand all your deployment pay entitlements." 
        },
        { 
          slug: 'building-your-financial-foundation', 
          why: "Because deployment is a financial opportunity, using the tax-free income and special pays to crush debt and build savings can transform your financial situation in 6-12 months." 
        },
      ],
    };
  }

  // Fallback Rule #16: PCS General (no specific timeline selected)
  if (focus === 'pcs') {
    return {
      primarySituation: "PCS Planning Mode",
      priorityAction: "Your #1 priority is to familiarize yourself with the PCS process, understand your entitlements, and create a financial plan for your move.",
      blocks: [
        { 
          slug: 'pre-move-prep-3-6-months-out', 
          why: "Because a PCS is on your mind, this comprehensive checklist covers everything from TMO scheduling to DEERS updates, giving you a complete roadmap." 
        },
        { 
          slug: 'pcs-move-questions-answered', 
          why: "Because you're planning a move, these FAQs answer the most common questions about DLA, TLE, PPM, weight allowances, and reimbursements." 
        },
      ],
    };
  }

  // Fallback Rule #17: Career General
  if (focus === 'career') {
    return {
      primarySituation: "Career Development Focus",
      priorityAction: "Your #1 priority is to identify portable career paths that align with your skills and explore education/certification opportunities to make yourself more marketable.",
      blocks: [
        { 
          slug: 'career-exploration-and-portable-fields', 
          why: "Because career development is your focus, understanding which fields (tech, healthcare, business, creative) offer the best remote opportunities helps you chart a resilient path." 
        },
        { 
          slug: 'the-job-search-and-resume-toolkit', 
          why: "Because building a strong career requires marketing yourself effectively, learning to translate military life into resume gold is essential for landing opportunities." 
        },
      ],
    };
  }

  // Fallback Rule #18: Deployment General
  if (focus === 'deployment') {
    return {
      primarySituation: "Deployment Readiness",
      priorityAction: "Your #1 priority is to complete all legal and financial preparations and establish a family communication plan before deployment begins.",
      blocks: [
        { 
          slug: 'phase-1-pre-deployment-readiness', 
          why: "Because deployment is your focus, this comprehensive readiness guide covers legal documents (POA, wills), financial setup (allotments, SCRA), and family preparation." 
        },
        { 
          slug: 'deployment-and-reintegration-questions-answered', 
          why: "Because you want to be prepared, these FAQs address the most common questions about deployment pay, OPSEC, childcare, and reintegration." 
        },
      ],
    };
  }

  // Fallback Rule #19: Finances General
  if (focus === 'finances') {
    return {
      primarySituation: "Financial Wellness Priority",
      priorityAction: "Your #1 priority is to understand your military pay structure and create a sustainable budget that balances immediate needs with long-term goals.",
      blocks: [
        { 
          slug: 'building-your-financial-foundation', 
          why: "Because financial wellness is your goal, this guide covers emergency funds, debt management, and accessing free financial counseling through your installation." 
        },
        { 
          slug: 'decoding-your-paycheck-the-leave-and-earnings-statement-les', 
          why: "Because understanding your income is foundational, this breakdown of your LES helps you accurately budget and identify opportunities to optimize your pay." 
        },
      ],
    };
  }

  // Ultimate Fallback Rule #20: No Focus Selected
  return {
    primarySituation: "Getting Started",
    priorityAction: "Complete the strategic assessment to receive your personalized action plan with curated content from our toolkit hubs.",
    blocks: [
      { 
        slug: 'pre-move-prep-3-6-months-out', 
        why: "Understanding the PCS process is fundamental to military financial planning." 
      },
      { 
        slug: 'building-your-financial-foundation', 
        why: "Building financial wellness creates stability across all areas of military life." 
        },
    ],
  };
}

