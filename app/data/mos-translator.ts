/**
 * Military Occupational Specialty (MOS) to Civilian Job Translator
 * Helps transitioning service members find relevant civilian careers
 * Source: DOL Military Skills Translator & O*NET data
 */

export interface MOSMapping {
  mos: string;
  branch: string;
  militaryTitle: string;
  civilianJobs: {
    title: string;
    salary: number; // Median annual salary
    growth: string; // Job growth outlook
    certifications?: string[]; // Recommended certifications
  }[];
}

export const mosTranslations: MOSMapping[] = [
  // Army - Combat Arms
  {
    mos: '11B',
    branch: 'Army',
    militaryTitle: 'Infantryman',
    civilianJobs: [
      { title: 'Law Enforcement Officer', salary: 67000, growth: 'Average', certifications: ['POST Certification', 'Academy Training'] },
      { title: 'Security Manager', salary: 72000, growth: 'Fast', certifications: ['CPP', 'PSP'] },
      { title: 'Emergency Management Director', salary: 76000, growth: 'Fast' }
    ]
  },
  // Army - Intelligence
  {
    mos: '35F',
    branch: 'Army',
    militaryTitle: 'Intelligence Analyst',
    civilianJobs: [
      { title: 'Intelligence Analyst (Civilian)', salary: 88000, growth: 'Very Fast', certifications: ['Security Clearance'] },
      { title: 'Data Analyst', salary: 75000, growth: 'Very Fast', certifications: ['SQL', 'Python'] },
      { title: 'Business Intelligence Analyst', salary: 82000, growth: 'Fast' }
    ]
  },
  // Army - Medical
  {
    mos: '68W',
    branch: 'Army',
    militaryTitle: 'Combat Medic',
    civilianJobs: [
      { title: 'Paramedic/EMT', salary: 52000, growth: 'Fast', certifications: ['NREMT', 'State License'] },
      { title: 'Registered Nurse', salary: 81000, growth: 'Fast', certifications: ['RN License', 'BSN'] },
      { title: 'Physician Assistant', salary: 121000, growth: 'Very Fast', certifications: ['PA License', 'Masters'] }
    ]
  },
  // Army - IT
  {
    mos: '25B',
    branch: 'Army',
    militaryTitle: 'IT Specialist',
    civilianJobs: [
      { title: 'Network Administrator', salary: 78000, growth: 'Fast', certifications: ['CompTIA Network+', 'CCNA'] },
      { title: 'Systems Administrator', salary: 85000, growth: 'Fast', certifications: ['Security+', 'AWS'] },
      { title: 'Cybersecurity Analyst', salary: 102000, growth: 'Very Fast', certifications: ['Security+', 'CISSP'] }
    ]
  },
  // Navy - Aviation
  {
    mos: 'AD',
    branch: 'Navy',
    militaryTitle: 'Aviation Machinist Mate',
    civilianJobs: [
      { title: 'Aircraft Mechanic', salary: 68000, growth: 'Average', certifications: ['A&P License'] },
      { title: 'Aviation Maintenance Manager', salary: 92000, growth: 'Average' },
      { title: 'Quality Control Inspector', salary: 62000, growth: 'Average' }
    ]
  },
  // Air Force - Cyber
  {
    mos: '1B4',
    branch: 'Air Force',
    militaryTitle: 'Cyber Warfare Operations',
    civilianJobs: [
      { title: 'Cybersecurity Engineer', salary: 110000, growth: 'Very Fast', certifications: ['CISSP', 'CEH'] },
      { title: 'Penetration Tester', salary: 105000, growth: 'Very Fast', certifications: ['OSCP', 'CEH'] },
      { title: 'Security Operations Center Analyst', salary: 87000, growth: 'Very Fast' }
    ]
  },
  // Marines - Logistics
  {
    mos: '0411',
    branch: 'Marines',
    militaryTitle: 'Maintenance Management Specialist',
    civilianJobs: [
      { title: 'Supply Chain Manager', salary: 82000, growth: 'Fast', certifications: ['CSCP', 'CPIM'] },
      { title: 'Operations Manager', salary: 88000, growth: 'Average' },
      { title: 'Logistics Coordinator', salary: 61000, growth: 'Average' }
    ]
  }
];

// Find matching civilian jobs for a MOS
export function getCivilianJobs(mos: string) {
  const match = mosTranslations.find(m => m.mos === mos);
  return match || null;
}

// Remote work premium data (how much more remote jobs pay)
export const remoteWorkPremiums = {
  softwareEngineer: 1.15, // 15% premium for remote
  dataAnalyst: 1.10,
  projectManager: 1.08,
  customerService: 0.95, // 5% discount for remote
  salesRep: 1.12,
  accountant: 1.05,
  average: 1.08 // 8% average premium
};

// Skills gap recommendations
export function getSkillsGap(currentSalary: number, targetSalary: number) {
  const gap = targetSalary - currentSalary;
  const percentGap = (gap / currentSalary) * 100;
  
  if (percentGap < 10) {
    return {
      level: 'Small Gap',
      recommendations: [
        'Focus on soft skills and leadership training',
        'Consider lateral move with growth potential',
        'Network within target company/industry'
      ],
      timeline: '3-6 months',
      certifications: 'Optional but helpful'
    };
  } else if (percentGap < 30) {
    return {
      level: 'Moderate Gap',
      recommendations: [
        'Pursue relevant certifications (CompTIA, AWS, PMP)',
        'Consider bootcamp or short-term training program',
        'Build portfolio demonstrating skills',
        'Target companies with veteran hiring programs'
      ],
      timeline: '6-12 months',
      certifications: 'Highly recommended'
    };
  } else {
    return {
      level: 'Significant Gap',
      recommendations: [
        'Consider using GI Bill for degree/certification',
        'Start with entry-level role and advance quickly',
        'Leverage military experience for management track',
        'Look for apprenticeship or trainee programs',
        'Use SkillBridge for hands-on experience before separation'
      ],
      timeline: '12-24 months',
      certifications: 'Essential'
    };
  }
}

