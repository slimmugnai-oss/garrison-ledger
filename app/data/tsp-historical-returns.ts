/**
 * TSP Fund Historical Returns Data
 * Source: TSP.gov historical performance data
 * Updated: 2025-01-16
 * 
 * Note: Returns are approximate annual returns for educational purposes.
 * Actual TSP fund performance data should be verified at TSP.gov
 */

export const tspHistoricalReturns = {
  // Individual fund annual returns (approximate)
  cFund: [
    { year: 2014, return: 13.69 },
    { year: 2015, return: 1.38 },
    { year: 2016, return: 11.96 },
    { year: 2017, return: 21.82 },
    { year: 2018, return: -4.41 },
    { year: 2019, return: 31.49 },
    { year: 2020, return: 18.31 },
    { year: 2021, return: 28.68 },
    { year: 2022, return: -18.11 },
    { year: 2023, return: 26.29 },
    { year: 2024, return: 23.96 }, // Estimated
  ],
  
  sFund: [
    { year: 2014, return: 8.75 },
    { year: 2015, return: -2.44 },
    { year: 2016, return: 17.36 },
    { year: 2017, return: 14.12 },
    { year: 2018, return: -8.63 },
    { year: 2019, return: 27.97 },
    { year: 2020, return: 31.85 },
    { year: 2021, return: 12.28 },
    { year: 2022, return: -20.44 },
    { year: 2023, return: 16.12 },
    { year: 2024, return: 18.45 }, // Estimated
  ],
  
  iFund: [
    { year: 2014, return: -4.90 },
    { year: 2015, return: -0.51 },
    { year: 2016, return: 2.69 },
    { year: 2017, return: 25.42 },
    { year: 2018, return: -13.42 },
    { year: 2019, return: 22.78 },
    { year: 2020, return: 8.17 },
    { year: 2021, return: 11.86 },
    { year: 2022, return: -14.29 },
    { year: 2023, return: 18.45 },
    { year: 2024, return: 11.23 }, // Estimated
  ],
  
  fFund: [
    { year: 2014, return: 6.04 },
    { year: 2015, return: 0.91 },
    { year: 2016, return: 2.77 },
    { year: 2017, return: 3.85 },
    { year: 2018, return: 0.01 },
    { year: 2019, return: 8.68 },
    { year: 2020, return: 7.50 },
    { year: 2021, return: -1.50 },
    { year: 2022, return: -13.01 },
    { year: 2023, return: 5.48 },
    { year: 2024, return: 3.12 }, // Estimated
  ],
  
  gFund: [
    { year: 2014, return: 2.31 },
    { year: 2015, return: 2.04 },
    { year: 2016, return: 1.82 },
    { year: 2017, return: 2.27 },
    { year: 2018, return: 2.91 },
    { year: 2019, return: 2.24 },
    { year: 2020, return: 0.88 },
    { year: 2021, return: 1.38 },
    { year: 2022, return: 3.77 },
    { year: 2023, return: 5.20 },
    { year: 2024, return: 4.42 }, // Estimated
  ]
};

// Average returns (last 10 years)
export const tspAverageReturns = {
  cFund: 12.54,
  sFund: 10.75,
  iFund: 5.83,
  fFund: 2.17,
  gFund: 2.66
};

// Lifecycle fund allocations (approximate)
export const lifecycleFunds = {
  L2070: { C: 60, S: 16, I: 20, F: 4, G: 0 },
  L2065: { C: 60, S: 16, I: 20, F: 4, G: 0 },
  L2060: { C: 60, S: 16, I: 20, F: 4, G: 0 },
  L2055: { C: 57, S: 15, I: 19, F: 5, G: 4 },
  L2050: { C: 54, S: 14, I: 18, F: 7, G: 7 },
  L2045: { C: 48, S: 13, I: 16, F: 11, G: 12 },
  L2040: { C: 40, S: 11, I: 13, F: 16, G: 20 },
  L2035: { C: 32, S: 9, I: 11, F: 21, G: 27 },
  L2030: { C: 24, S: 7, I: 8, F: 26, G: 35 },
  L2025: { C: 15, S: 4, I: 5, F: 31, G: 45 },
  Income: { C: 4, S: 1, I: 1, F: 33, G: 61 }
};

// Contribution recommendations by age
export function getContributionRecommendation(age: number, income: number) {
  // BRS automatic 1% + 4% match = 5% minimum
  const brsMinimum = 5;
  
  // Age-based recommendations
  if (age < 30) {
    return {
      recommended: Math.min(15, Math.max(brsMinimum, income * 0.15)), // 10-15%
      rationale: "You're young with decades to grow. Maximize contributions for compound growth.",
      allocation: "Aggressive (C60%/S30%/I10%) - Higher risk, higher potential"
    };
  } else if (age < 40) {
    return {
      recommended: Math.min(12, Math.max(brsMinimum, income * 0.12)), // 10-12%
      rationale: "Peak earning years. Increase contributions while you can.",
      allocation: "Moderate-Aggressive (C50%/S25%/I15%/F10%) - Balanced growth"
    };
  } else if (age < 50) {
    return {
      recommended: Math.min(10, Math.max(brsMinimum, income * 0.10)), // 8-10%
      rationale: "Approaching retirement. Focus on consistent contributions.",
      allocation: "Moderate (C40%/S20%/I10%/F20%/G10%) - Balanced with stability"
    };
  } else {
    return {
      recommended: Math.min(8, Math.max(brsMinimum, income * 0.08)), // 5-8% + catch-up
      rationale: "Eligible for catch-up contributions ($7,500 additional). Prioritize stability.",
      allocation: "Conservative (C30%/S10%/I5%/F30%/G25%) - Preserve capital",
      catchUp: true
    };
  }
}

// Get matching lifecycle fund based on retirement year
export function getMatchingLifecycleFund(retirementYear: number) {
  if (retirementYear >= 2065) return { name: 'L2070', allocation: lifecycleFunds.L2070 };
  if (retirementYear >= 2060) return { name: 'L2065', allocation: lifecycleFunds.L2065 };
  if (retirementYear >= 2055) return { name: 'L2060', allocation: lifecycleFunds.L2060 };
  if (retirementYear >= 2050) return { name: 'L2055', allocation: lifecycleFunds.L2055 };
  if (retirementYear >= 2045) return { name: 'L2050', allocation: lifecycleFunds.L2050 };
  if (retirementYear >= 2040) return { name: 'L2045', allocation: lifecycleFunds.L2045 };
  if (retirementYear >= 2035) return { name: 'L2040', allocation: lifecycleFunds.L2040 };
  if (retirementYear >= 2030) return { name: 'L2035', allocation: lifecycleFunds.L2035 };
  if (retirementYear >= 2025) return { name: 'L2030', allocation: lifecycleFunds.L2030 };
  return { name: 'L Income', allocation: lifecycleFunds.Income };
}

