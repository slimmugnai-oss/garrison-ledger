/**
 * ASK TIMELINE PLANNER
 *
 * Generates personalized timelines for:
 * - PCS moves (12-month countdown with task breakdown)
 * - Deployments (pre, during, post)
 * - Military transitions (separation, retirement)
 * - Career milestones (commissioning, promotion prep)
 */

import { logger } from "@/lib/logger";

export type TimelineType = "pcs" | "deployment" | "separation" | "commissioning" | "retirement";

export interface TimelineTask {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO date or "X months before event"
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  completed: boolean;
  estimatedTime: string; // "30 minutes", "2 hours", "1 week"
  relatedGuide?: string;
  relatedTool?: string;
}

export interface Timeline {
  type: TimelineType;
  eventDate: string;
  eventName: string;
  tasks: TimelineTask[];
  milestones: Array<{
    date: string;
    title: string;
    description: string;
  }>;
  criticalDates: Array<{
    date: string;
    deadline: string;
    consequence: string;
  }>;
}

// ============================================================================
// PCS TIMELINE
// ============================================================================

export function generatePCSTimeline(
  pcsDate: Date,
  isOCONUS: boolean = false,
  hasDependents: boolean = false
): Timeline {
  const tasks: TimelineTask[] = [];
  const now = new Date();

  // Calculate months until PCS
  const monthsUntilPCS = Math.floor(
    (pcsDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  // 12 Months Out
  if (monthsUntilPCS >= 12) {
    tasks.push({
      id: "research-location",
      title: "Research New Duty Station",
      description: "Learn about base, housing market, school districts, cost of living",
      dueDate: addMonths(pcsDate, -12).toISOString(),
      priority: "medium",
      category: "Planning",
      completed: false,
      estimatedTime: "2-3 hours",
      relatedGuide: "OCONUS PCS Complete Guide",
      relatedTool: "/dashboard/base-navigator",
    });
  }

  // 9 Months Out (OCONUS only)
  if (isOCONUS && monthsUntilPCS >= 9) {
    tasks.push({
      id: "start-passports",
      title: "Start Passport Process for All Family Members",
      description: "Apply for passports (takes 8-12 weeks). Get SOFA stamp if Europe.",
      dueDate: addMonths(pcsDate, -9).toISOString(),
      priority: "critical",
      category: "Documents",
      completed: false,
      estimatedTime: "2 hours + waiting",
      relatedGuide: "OCONUS PCS Complete Guide",
    });

    tasks.push({
      id: "research-pet-requirements",
      title: "Research Pet Import Requirements",
      description: "Check destination country pet rules (rabies vaccine, blood tests, quarantine)",
      dueDate: addMonths(pcsDate, -9).toISOString(),
      priority: "high",
      category: "Pets",
      completed: false,
      estimatedTime: "1 hour",
      relatedGuide: "Moving Pets PCS Complete Guide",
    });
  }

  // 6 Months Out
  if (monthsUntilPCS >= 6) {
    tasks.push({
      id: "save-pcs-funds",
      title: "Save $5,000-$10,000 for PCS Upfront Costs",
      description: "Security deposits, furniture, pet shipping, unexpected expenses",
      dueDate: addMonths(pcsDate, -6).toISOString(),
      priority: "high",
      category: "Finances",
      completed: false,
      estimatedTime: "Ongoing",
      relatedGuide: "TLE & DLA PCS Allowances Guide",
    });

    if (hasDependents) {
      tasks.push({
        id: "research-schools",
        title: "Research Schools at New Location",
        description: "Check DoDEA waitlists, public school ratings (GreatSchools.org), private school options",
        dueDate: addMonths(pcsDate, -6).toISOString(),
        priority: "high",
        category: "Family",
        completed: false,
        estimatedTime: "3-4 hours",
        relatedGuide: "Military School Transfers PCS Guide",
      });
    }
  }

  // 4 Months Out
  if (monthsUntilPCS >= 4) {
    tasks.push({
      id: "schedule-hhg",
      title: "Schedule Household Goods (HHG) Pack-Out",
      description: "Contact TMO, schedule movers. Allow 60-90 days for OCONUS delivery.",
      dueDate: addMonths(pcsDate, -4).toISOString(),
      priority: "critical",
      category: "Moving",
      completed: false,
      estimatedTime: "1-2 hours",
    });
  }

  // 3 Months Out
  if (monthsUntilPCS >= 3) {
    tasks.push({
      id: "housing-search",
      title: "Start Housing Search",
      description: "Join Facebook groups, contact housing office, research neighborhoods",
      dueDate: addMonths(pcsDate, -3).toISOString(),
      priority: "high",
      category: "Housing",
      completed: false,
      estimatedTime: "Ongoing",
      relatedGuide: "On-Base vs Off-Base Housing Complete Analysis",
    });

    tasks.push({
      id: "notify-school",
      title: "Notify Current School of PCS",
      description: "Request transcripts, get IEP copies, plan withdrawal date",
      dueDate: addMonths(pcsDate, -3).toISOString(),
      priority: "medium",
      category: "Family",
      completed: false,
      estimatedTime: "30 minutes",
    });
  }

  // 2 Months Out
  if (monthsUntilPCS >= 2) {
    tasks.push({
      id: "schedule-hht",
      title: "Schedule House-Hunting Trip (if authorized)",
      description: "Book travel 30-60 days before PCS. Find housing in person.",
      dueDate: addMonths(pcsDate, -2).toISOString(),
      priority: "high",
      category: "Housing",
      completed: false,
      estimatedTime: "5-10 days",
      relatedGuide: "House-Hunting Trip PCS Guide",
    });

    if (isOCONUS) {
      tasks.push({
        id: "ship-pov",
        title: "Submit Vehicle for Shipping (if applicable)",
        description: "VPC inspection, book shipping slot. Takes 30-60 days.",
        dueDate: addMonths(pcsDate, -2).toISOString(),
        priority: "high",
        category: "Vehicles",
        completed: false,
        estimatedTime: "2 hours",
      });
    }
  }

  // 1 Month Out
  if (monthsUntilPCS >= 1) {
    tasks.push({
      id: "finalize-housing",
      title: "Secure Housing (Lease Signed)",
      description: "Sign lease with military clause, pay deposit, schedule move-in",
      dueDate: addMonths(pcsDate, -1).toISOString(),
      priority: "critical",
      category: "Housing",
      completed: false,
      estimatedTime: "2-3 hours",
    });

    tasks.push({
      id: "out-processing",
      title: "Begin Out-Processing",
      description: "Clear medical, dental, CIF, finance, housing",
      dueDate: addMonths(pcsDate, -1).toISOString(),
      priority: "critical",
      category: "Administrative",
      completed: false,
      estimatedTime: "1-2 weeks",
    });

    tasks.push({
      id: "notify-utilities",
      title: "Notify Utilities, Banks, Insurance of Move",
      description: "Update addresses, schedule service disconnections/connections",
      dueDate: addMonths(pcsDate, -1).toISOString(),
      priority: "medium",
      category: "Administrative",
      completed: false,
      estimatedTime: "1-2 hours",
    });
  }

  // Milestones
  const milestones = [
    {
      date: addMonths(pcsDate, isOCONUS ? -6 : -3).toISOString(),
      title: isOCONUS ? "OCONUS Prep Begins" : "Housing Search Begins",
      description: isOCONUS
        ? "Start passports, pet prep, vehicle decisions"
        : "Research neighborhoods, join Facebook groups",
    },
    {
      date: addMonths(pcsDate, -2).toISOString(),
      title: "House-Hunting Trip Window",
      description: "Optimal time for HHT (if authorized)",
    },
    {
      date: addMonths(pcsDate, -1).toISOString(),
      title: "Final Month - Critical Tasks",
      description: "Out-processing, housing finalized, HHG packed",
    },
    {
      date: pcsDate.toISOString(),
      title: "PCS Report Date",
      description: "Arrive at new duty station, in-process within 48 hours",
    },
  ];

  // Critical Dates
  const criticalDates = [
    {
      date: addMonths(pcsDate, -4).toISOString(),
      deadline: "Schedule HHG Pack-Out",
      consequence: "Late scheduling = delayed delivery (may wait 60-90 days for household goods)",
    },
    {
      date: addMonths(pcsDate, -1).toISOString(),
      deadline: "Secure Housing",
      consequence: "No housing = extended TLE (expensive, 10-day limit)",
    },
  ];

  if (isOCONUS) {
    criticalDates.push({
      date: addMonths(pcsDate, -6).toISOString(),
      deadline: "Start Pet Blood Test (if going to Japan/Hawaii)",
      consequence: "Blood test takes 6+ months. Missing this = pet can't travel with you.",
    });
  }

  return {
    type: "pcs",
    eventDate: pcsDate.toISOString(),
    eventName: `PCS to New Duty Station`,
    tasks: tasks.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }),
    milestones,
    criticalDates,
  };
}

// ============================================================================
// DEPLOYMENT TIMELINE
// ============================================================================

export function generateDeploymentTimeline(
  deploymentDate: Date,
  duration: number, // months
  hasDependents: boolean = false
): Timeline {
  const tasks: TimelineTask[] = [];

  // Pre-Deployment (30-90 days before)
  tasks.push({
    id: "family-care-plan",
    title: "Create/Update Family Care Plan",
    description: hasDependents
      ? "Required if you have kids - designate caregiver, get POA"
      : "Not required if no dependents",
    dueDate: addMonths(deploymentDate, -2).toISOString(),
    priority: hasDependents ? "critical" : "low",
    category: "Legal",
    completed: false,
    estimatedTime: "2-3 hours",
    relatedGuide: "Deployment Financial Preparation Guide",
  });

  tasks.push({
    id: "financial-poa",
    title: "Get Financial Power of Attorney for Spouse",
    description: "Free at JAG - allows spouse to manage finances while you're deployed",
    dueDate: addMonths(deploymentDate, -1).toISOString(),
    priority: "critical",
    category: "Legal",
    completed: false,
    estimatedTime: "1 hour",
    relatedGuide: "Power of Attorney for Military Guide",
  });

  tasks.push({
    id: "switch-to-roth-tsp",
    title: "Switch TSP to 100% Roth",
    description: "Combat pay is tax-free. Roth TSP = never pay taxes on this money!",
    dueDate: addMonths(deploymentDate, -1).toISOString(),
    priority: "high",
    category: "Finances",
    completed: false,
    estimatedTime: "10 minutes (myPay)",
    relatedGuide: "Deployment Financial Preparation Guide",
  });

  tasks.push({
    id: "setup-autopay",
    title: "Set Up Auto-Pay for All Bills",
    description: "Prevent late payments while deployed",
    dueDate: addMonths(deploymentDate, -1).toISOString(),
    priority: "high",
    category: "Finances",
    completed: false,
    estimatedTime: "1-2 hours",
  });

  tasks.push({
    id: "deployment-budget",
    title: "Create Deployment Budget with Spouse",
    description: "Agree on spending limits, savings goals",
    dueDate: addMonths(deploymentDate, -1).toISOString(),
    priority: "high",
    category: "Finances",
    completed: false,
    estimatedTime: "1 hour",
  });

  // During Deployment
  const deploymentEndDate = addMonths(deploymentDate, duration);

  tasks.push({
    id: "max-sdp",
    title: "Max Out SDP (Savings Deposit Program)",
    description: "Deposit $10,000 for guaranteed 10% annual return",
    dueDate: addMonths(deploymentDate, 1).toISOString(),
    priority: "critical",
    category: "Deployment Savings",
    completed: false,
    estimatedTime: "10 minutes (myPay)",
    relatedGuide: "Deployment Financial Preparation Guide",
  });

  tasks.push({
    id: "weekly-calls",
    title: "Maintain Weekly Communication Schedule",
    description: "Video calls, daily texts - stay connected with family",
    dueDate: deploymentDate.toISOString(),
    priority: "high",
    category: "Communication",
    completed: false,
    estimatedTime: "Ongoing",
    relatedGuide: "Deployment Communication Strategy",
  });

  // Post-Deployment
  tasks.push({
    id: "reintegration-counseling",
    title: "Attend Post-Deployment Reintegration Brief",
    description: "Required briefing - actually helpful for homecoming",
    dueDate: deploymentEndDate.toISOString(),
    priority: "high",
    category: "Reintegration",
    completed: false,
    estimatedTime: "4 hours",
    relatedGuide: "Homecoming & Reintegration After Deployment",
  });

  tasks.push({
    id: "withdraw-sdp",
    title: "Withdraw SDP (After 90 Days Post-Deployment)",
    description: "Maximize interest by waiting 90 days after return",
    dueDate: addMonths(deploymentEndDate, 3).toISOString(),
    priority: "medium",
    category: "Finances",
    completed: false,
    estimatedTime: "10 minutes",
  });

  const milestones = [
    {
      date: addMonths(deploymentDate, -1).toISOString(),
      title: "Pre-Deployment Month",
      description: "Final preparations, family time, legal/financial setup",
    },
    {
      date: deploymentDate.toISOString(),
      title: "Deployment Begins",
      description: "Deploy to theater, establish communication routine",
    },
    {
      date: addMonths(deploymentDate, Math.floor(duration / 2)).toISOString(),
      title: "Mid-Deployment",
      description: "R&R opportunity (if authorized), morale check",
    },
    {
      date: deploymentEndDate.toISOString(),
      title: "Homecoming",
      description: "Return home, reintegration begins (allow 3-6 months adjustment)",
    },
  ];

  const criticalDates = [
    {
      date: addMonths(deploymentDate, -1).toISOString(),
      deadline: "Get POA before deployment",
      consequence: "Without POA, spouse can't access accounts or handle emergencies",
    },
    {
      date: addMonths(deploymentDate, 1).toISOString(),
      deadline: "Max SDP within first month",
      consequence: "Delayed SDP deposit = less interest earned (10% annual return)",
    },
  ];

  return {
    type: "deployment",
    eventDate: deploymentDate.toISOString(),
    eventName: `${duration}-Month Deployment`,
    tasks: tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    milestones,
    criticalDates,
  };
}

// ============================================================================
// SEPARATION/TRANSITION TIMELINE
// ============================================================================

export function generateSeparationTimeline(separationDate: Date): Timeline {
  const tasks: TimelineTask[] = [];

  // 12 Months Out
  tasks.push({
    id: "career-planning",
    title: "Decide Post-Military Career Path",
    description: "Civilian, federal employment, or entrepreneurship?",
    dueDate: addMonths(separationDate, -12).toISOString(),
    priority: "high",
    category: "Career",
    completed: false,
    estimatedTime: "Several weeks",
    relatedGuide: "Separation Transition Checklist Complete",
  });

  tasks.push({
    id: "build-resume",
    title: "Create Civilian Resume",
    description: "1-2 pages, no jargon, STAR method achievements",
    dueDate: addMonths(separationDate, -9).toISOString(),
    priority: "high",
    category: "Career",
    completed: false,
    estimatedTime: "5-10 hours",
    relatedGuide: "Civilian Resume Writing for Military Veterans",
  });

  tasks.push({
    id: "linkedin-setup",
    title: "Optimize LinkedIn Profile",
    description: "Professional photo, civilian job title, keyword optimization",
    dueDate: addMonths(separationDate, -9).toISOString(),
    priority: "high",
    category: "Career",
    completed: false,
    estimatedTime: "3-5 hours",
    relatedGuide: "LinkedIn Profile Optimization for Veterans",
  });

  // 6 Months Out - CRITICAL VA CLAIM
  tasks.push({
    id: "file-va-claim-bdd",
    title: "File VA Disability Claim (BDD Program)",
    description: "CRITICAL: File 90-180 days before separation for immediate benefits",
    dueDate: addMonths(separationDate, -6).toISOString(),
    priority: "critical",
    category: "VA Benefits",
    completed: false,
    estimatedTime: "2-3 hours + C&P exam",
    relatedGuide: "VA Disability Claims Step-by-Step Guide",
  });

  tasks.push({
    id: "save-emergency-fund",
    title: "Save 6-12 Months Emergency Fund",
    description: "$15,000-$40,000 buffer for job search period",
    dueDate: addMonths(separationDate, -6).toISOString(),
    priority: "critical",
    category: "Finances",
    completed: false,
    estimatedTime: "Ongoing",
    relatedGuide: "Emergency Fund Sizing Military",
  });

  tasks.push({
    id: "start-job-search",
    title: "Start Applying to Jobs (20-30 applications)",
    description: "Federal hiring takes 6-12 months - start EARLY",
    dueDate: addMonths(separationDate, -6).toISOString(),
    priority: "critical",
    category: "Career",
    completed: false,
    estimatedTime: "Ongoing (3-5 hours/week)",
    relatedGuide: "Military to Federal Job Conversion Guide",
  });

  // 4 Months Out
  tasks.push({
    id: "attend-tap",
    title: "Attend TAP (Transition Assistance Program)",
    description: "Required 1-week course. Resume, interview, VA benefits training.",
    dueDate: addMonths(separationDate, -4).toISOString(),
    priority: "critical",
    category: "Transition",
    completed: false,
    estimatedTime: "1 week (full-time)",
  });

  // 3 Months Out
  tasks.push({
    id: "get-medical-records",
    title: "Get Full Copies of Medical & Dental Records",
    description: "You'll need these for VA claims and civilian healthcare",
    dueDate: addMonths(separationDate, -3).toISOString(),
    priority: "critical",
    category: "Medical",
    completed: false,
    estimatedTime: "1 hour request, 2 weeks delivery",
  });

  tasks.push({
    id: "benefits-decisions",
    title: "Decide: SGLI to VGLI? TSP Rollover? TRICARE?",
    description: "Make healthcare, insurance, and retirement decisions",
    dueDate: addMonths(separationDate, -2).toISOString(),
    priority: "high",
    category: "Benefits",
    completed: false,
    estimatedTime: "2-3 hours research",
  });

  // Separation Day
  tasks.push({
    id: "review-dd214",
    title: "Review DD-214 for Errors BEFORE Signing",
    description: "Check dates, character of service, awards. Get 5-10 certified copies.",
    dueDate: separationDate.toISOString(),
    priority: "critical",
    category: "Administrative",
    completed: false,
    estimatedTime: "30 minutes",
  });

  const milestones = [
    {
      date: addMonths(separationDate, -12).toISOString(),
      title: "12-Month Mark: Planning Phase",
      description: "Career planning, skills assessment, financial preparation",
    },
    {
      date: addMonths(separationDate, -6).toISOString(),
      title: "6-Month Mark: Action Phase",
      description: "VA claim filed, job search active, TAP scheduled",
    },
    {
      date: addMonths(separationDate, -3).toISOString(),
      title: "3-Month Mark: Final Preparations",
      description: "Out-processing, records collection, final decisions",
    },
    {
      date: separationDate.toISOString(),
      title: "Separation Day",
      description: "Receive DD-214, transition to veteran status",
    },
    {
      date: addMonths(separationDate, 3).toISOString(),
      title: "90-Day Post-Separation",
      description: "Reintegration into civilian life, first job (ideally)",
    },
  ];

  const criticalDates = [
    {
      date: addMonths(separationDate, -6).toISOString(),
      deadline: "File VA BDD Claim (90-180 days before separation)",
      consequence: "File late = 6-12 month wait for VA benefits (no income gap coverage)",
    },
    {
      date: addMonths(separationDate, 8).toISOString(),
      deadline: "Convert SGLI to VGLI (within 240 days)",
      consequence: "Miss deadline = lose life insurance (if health issues prevent new policy)",
    },
  ];

  return {
    type: "separation",
    eventDate: separationDate.toISOString(),
    eventName: "Military Separation",
    tasks: tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    milestones,
    criticalDates,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Main timeline generator - routes to specific timeline type
 */
export function generateTimeline(
  type: TimelineType,
  eventDate: Date,
  options?: {
    isOCONUS?: boolean;
    hasDependents?: boolean;
    deploymentDuration?: number;
  }
): Timeline {
  logger.info(`[TimelinePlanner] Generating ${type} timeline`);

  switch (type) {
    case "pcs":
      return generatePCSTimeline(
        eventDate,
        options?.isOCONUS || false,
        options?.hasDependents || false
      );

    case "deployment":
      return generateDeploymentTimeline(
        eventDate,
        options?.deploymentDuration || 9,
        options?.hasDependents || false
      );

    case "separation":
    case "retirement":
      return generateSeparationTimeline(eventDate);

    case "commissioning":
    default:
      return {
        type,
        eventDate: eventDate.toISOString(),
        eventName: "Military Milestone",
        tasks: [],
        milestones: [],
        criticalDates: [],
      };
  }
}

