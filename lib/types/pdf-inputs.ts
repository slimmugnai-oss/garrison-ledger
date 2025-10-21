/**
 * PDF REPORT INPUT TYPES
 * 
 * Type definitions for calculator inputs and outputs used in PDF generation
 * Eliminates `any` types in app/lib/pdf-reports.ts
 */

/**
 * TSP Modeler inputs and outputs
 */
export interface TSPInputs {
  currentBalance: number;
  monthlyContribution: number;
  yearsToRetirement: number;
  employerMatch: number;
  cFund: number;
  sFund: number;
  iFund: number;
  fFund: number;
  gFund: number;
}

export interface TSPOutputs {
  futureValue?: number;
  projectedBalance?: number;
  totalContributions?: number;
  employerContributions?: number;
  investmentGains?: number;
  growthAmount?: number;
  expectedReturn?: number;
  monthlyInRetirement?: number;
}

/**
 * House Hack Calculator inputs and outputs
 */
export interface HouseHackInputs {
  purchasePrice?: number;
  price?: number;
  downPayment?: number;
  interestRate?: number;
  rate?: number;
  loanTerm?: number;
  monthlyRent?: number;
  bedrooms?: number;
  roomsToRent?: number;
  rentPerRoom?: number;
  monthlyExpenses?: number;
  propertyType?: string;
  bah?: number;
  rent?: number;
}

export interface HouseHackOutputs {
  monthlyMortgage?: number;
  rentalIncome?: number;
  netCashFlow?: number;
  cashOnCashReturn?: number;
  breakEvenOccupancy?: number;
  annualProfit?: number;
  costs?: number;
  income?: number;
}

/**
 * SDP Strategist inputs and outputs
 */
export interface SDPInputs {
  deploymentMonths: number;
  monthlyDeposit: number;
  startingBalance: number;
  sdpRate: number; // 10% annual
}

export interface SDPOutputs {
  totalDeposits: number;
  interestEarned: number;
  finalBalance: number;
  monthlyInterest: number[];
  runningBalance: number[];
}

/**
 * PCS Financial Planner inputs and outputs
 */
export interface PCSInputs {
  origin?: string;
  destination?: string;
  distance?: number;
  distanceMiles?: number;
  householdGoodsWeight?: number;
  dependents?: number;
  rank?: string;
  dependencyStatus?: string;
  hasDependents?: boolean;
}

export interface PCSOutputs {
  dla?: number;
  dlaAmount?: number;
  maltAmount?: number;
  perDiemAmount?: number;
  ppmEstimate?: number;
  ppmProfit?: number;
  weightAllowance?: number;
  totalEntitlements?: number;
  totalValue?: number;
  confidenceScore?: number;
}

/**
 * On-Base Savings inputs and outputs
 */
export interface OnBaseSavingsInputs {
  monthlyGroceryBudget: number;
  monthlyGasBudget: number;
  commissaryUsagePercent: number;
  exchangeUsagePercent: number;
  averageCommissarySavingsPercent: number;
  averageExchangeSavingsPercent: number;
}

export interface OnBaseSavingsOutputs {
  commissarySavingsMonthly: number;
  commissarySavingsAnnual: number;
  exchangeSavingsMonthly: number;
  exchangeSavingsAnnual: number;
  totalSavingsMonthly: number;
  totalSavingsAnnual: number;
  twentyYearSavings: number;
}

/**
 * Retirement Calculator inputs and outputs
 */
export interface RetirementInputs {
  rank: string;
  yearsOfService: number;
  retirementSystem: 'BRS' | 'High-3' | 'Redux';
  finalBasePay: number;
  tspBalance: number;
  tspContributionPercent: number;
}

export interface RetirementOutputs {
  monthlyPension: number;
  annualPension: number;
  tspProjectedBalance: number;
  tspMonthlyIncome: number;
  totalMonthlyIncome: number;
  replacementRatio: number;
}

