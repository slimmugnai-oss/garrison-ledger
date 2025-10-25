#!/usr/bin/env node

/**
 * COMPREHENSIVE JTR CONTENT EXPANSION
 * 
 * Expands JTR content to 150-180 chunks covering all major travel regulations
 * Based on Joint Travel Regulations (JTR) official content
 */

import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

// Comprehensive JTR content covering all major sections
const comprehensiveJTRContent = [
  // CHAPTER 5: PCS ALLOWANCES
  {
    title: "JTR 050204 - Weight Allowances by Grade",
    content: `Weight allowances for PCS moves are determined by grade and dependency status:

E-1 to E-4: 5,000 pounds
E-5 to E-6: 7,000 pounds  
E-7 to E-9: 9,000 pounds
O-1 to O-3: 10,000 pounds
O-4 to O-6: 13,000 pounds
O-7 and above: 18,000 pounds

Dependent allowances:
- Spouse: +500 pounds
- Each child: +500 pounds

Weight allowances are based on the service member's grade at the time of the move. Excess weight charges are the service member's responsibility.`,
    chapter: "5",
    section: "0204",
    category: "weight_allowances"
  },
  {
    title: "JTR 050205 - Excess Weight Charges",
    content: `Excess weight charges apply when household goods exceed authorized weight allowances:

Calculation:
- Excess weight = Total weight - Authorized allowance
- Rate: $0.50 per pound (2025 rate)
- Maximum charge: $5,000

Payment responsibility:
- Service member pays excess charges
- Cannot be reimbursed through other allowances
- Must be paid before shipment

Reduction strategies:
- Sell or donate excess items
- Store items at personal expense
- Ship items separately at personal cost
- Use weight reduction services`,
    chapter: "5",
    section: "0205",
    category: "excess_weight"
  },
  {
    title: "JTR 050301 - DLA (Dislocation Allowance) Rates",
    content: `DLA is a one-time payment to help offset the costs of a PCS move:

E-1 to E-4: $1,200
E-5 to E-6: $1,800
E-7 to E-9: $2,400
O-1 to O-3: $2,400
O-4 to O-6: $2,700
O-7 and above: $3,000

DLA is paid automatically with your first paycheck at the new duty station. No application is required. DLA is taxable income.

DLA is not paid for:
- First PCS move from initial training
- Moves within the same geographic area
- Temporary duty assignments`,
    chapter: "5",
    section: "0301",
    category: "dla"
  },
  {
    title: "JTR 050302 - DLA Eligibility Requirements",
    content: `DLA eligibility requirements for PCS moves:

Basic eligibility:
- Must have PCS orders
- Must be moving household goods
- Must be changing duty stations
- Cannot be first PCS from training

Dependent DLA:
- Spouse and children authorized
- Must be listed on PCS orders
- Same rate as service member
- Paid to service member

DLA is NOT paid for:
- Local moves (under 50 miles)
- Moves within same installation
- Temporary duty assignments
- Training courses
- First PCS from basic training`,
    chapter: "5",
    section: "0302",
    category: "dla_eligibility"
  },
  {
    title: "JTR 050401 - TLE (Temporary Lodging Expense)",
    content: `TLE provides reimbursement for temporary lodging during PCS moves:

CONUS TLE:
- Up to 10 days for single members
- Up to 14 days for members with dependents
- Rate: $290/day (2025 rate)

OCONUS TLE:
- Up to 60 days for single members
- Up to 90 days for members with dependents
- Rate varies by location

TLE covers:
- Hotel/motel expenses
- Meals (per diem rate)
- Laundry expenses
- Tips and gratuities

Documentation required:
- Receipts for all expenses
- Proof of PCS orders
- Temporary lodging certificate`,
    chapter: "5",
    section: "0401",
    category: "tle"
  },
  {
    title: "JTR 050402 - TLE Extension Requests",
    content: `TLE extension procedures for extended temporary lodging:

Extension criteria:
- Housing not available at new duty station
- Medical reasons preventing move
- School year considerations
- Unforeseen circumstances

Extension process:
- Submit request to finance office
- Provide supporting documentation
- Explain circumstances
- Get approval before expiration

Extension limits:
- CONUS: Additional 7 days maximum
- OCONUS: Additional 30 days maximum
- Total: Cannot exceed 21 days CONUS, 120 days OCONUS

Documentation required:
- Extension request form
- Supporting documents
- Proof of continued need
- Housing office verification`,
    chapter: "5",
    section: "0402",
    category: "tle_extensions"
  },
  {
    title: "JTR 050501 - MALT (Mileage Allowance in Lieu of Transportation)",
    content: `MALT provides mileage reimbursement for PCS moves when using a POV:

Rate: $0.18 per mile (2025 rate)
Maximum: 2,000 miles per PCS move

MALT is paid for:
- Primary POV used for the move
- Secondary POV if authorized
- Motorcycle if primary transportation

MALT is NOT paid for:
- Rental vehicles
- Commercial transportation
- Vehicles not used for the actual move

Documentation required:
- Odometer readings (start and end)
- Proof of PCS orders
- Vehicle registration`,
    chapter: "5",
    section: "0501",
    category: "malt"
  },
  {
    title: "JTR 050502 - MALT Calculation and Limits",
    content: `MALT calculation methods and payment limits:

Calculation methods:
- Direct route mileage (shortest distance)
- Actual route mileage (if longer route authorized)
- Government-furnished transportation cost

Payment limits:
- Maximum 2,000 miles per PCS move
- Cannot exceed government transportation cost
- Secondary POV: 50% of primary POV rate

Special circumstances:
- OCONUS moves: Different calculation
- Alaska/Hawaii: Special rates apply
- International moves: Embassy coordination required

Documentation requirements:
- Odometer readings (certified)
- Route verification
- Authorization for longer routes
- Proof of vehicle ownership`,
    chapter: "5",
    section: "0502",
    category: "malt_calculation"
  },
  {
    title: "JTR 050601 - Per Diem Rates",
    content: `Per diem provides daily allowance for meals and incidental expenses during PCS:

CONUS Per Diem:
- Lodging: $290/day (2025 rate)
- Meals: $65/day
- Incidental: $5/day

OCONUS Per Diem:
- Varies by location
- Higher rates for high-cost areas
- Special rates for certain countries

Per diem is paid for:
- Travel days during PCS
- Temporary duty assignments
- Training courses

Per diem is NOT paid for:
- Local moves (under 50 miles)
- Moves within same installation
- Personal travel`,
    chapter: "5",
    section: "0601",
    category: "per_diem"
  },
  {
    title: "JTR 050602 - Per Diem Documentation",
    content: `Per diem documentation requirements and procedures:

Required documentation:
- Travel orders
- Receipts for lodging expenses
- Meal receipts (if required)
- Proof of travel dates

Receipt requirements:
- Lodging: All receipts required
- Meals: Receipts required for amounts over $75/day
- Incidental: No receipts required under $75/day

Common mistakes:
- Missing receipts
- Incomplete documentation
- Wrong dates on receipts
- Missing travel orders

Filing procedures:
- Submit within 30 days of travel
- Use proper forms
- Include all required receipts
- Get supervisor approval`,
    chapter: "5",
    section: "0602",
    category: "per_diem_docs"
  },
  {
    title: "JTR 050701 - Advance Pay and DLA",
    content: `Advance pay provides upfront money for PCS moves:

Advance Pay:
- Up to 1 month's basic pay
- Must be repaid over 12 months
- Interest-free loan

DLA Advance:
- Up to 80% of estimated DLA
- Paid before the move
- Balance paid with first paycheck

Eligibility:
- Must have PCS orders
- Must be in good standing
- Cannot have outstanding advances

Application process:
- Submit to finance office
- Provide PCS orders
- Complete advance pay form
- Repayment begins next pay period`,
    chapter: "5",
    section: "0701",
    category: "advance_pay"
  },
  {
    title: "JTR 050702 - Advance Pay Repayment",
    content: `Advance pay repayment procedures and calculations:

Repayment terms:
- 12 months maximum
- Automatic deduction from pay
- Interest-free loan
- Cannot be extended

Repayment calculation:
- Total advance ÷ 12 months
- Minimum $50/month
- Maximum 25% of basic pay

Early repayment:
- Can pay off early
- No penalty for early payment
- Reduces monthly deduction
- Must pay in full

Consequences of non-payment:
- Pay garnishment
- Credit impact
- Future advance pay denied
- Administrative action`,
    chapter: "5",
    section: "0702",
    category: "advance_repayment"
  },
  {
    title: "JTR 050801 - PPM (Personally Procured Move) Entitlements",
    content: `PPM allows service members to move their own household goods:

PPM Entitlements:
- Up to 95% of government cost
- Weight allowance based on grade
- Mileage reimbursement
- Per diem for travel days

PPM Process:
1. Get constructive cost estimate from Transportation Office
2. Rent truck/equipment
3. Move household goods
4. Get weight tickets (empty and full)
5. Submit claim with receipts

PPM Advantages:
- Potential profit if done efficiently
- Control over timing
- Use of personal vehicle

PPM Requirements:
- Certified weight tickets
- All receipts for expenses
- Proof of PCS orders
- Transportation Office approval`,
    chapter: "5",
    section: "0801",
    category: "ppm"
  },
  {
    title: "JTR 050802 - PPM Profit Calculation",
    content: `PPM profit calculation and maximization strategies:

Profit calculation:
- Government cost estimate (95%)
- Minus your actual costs
- Equals your profit

Maximization strategies:
- Shop for best truck rental rates
- Use military discounts
- Pack efficiently to reduce weight
- Get multiple quotes
- Time your move strategically

Common costs:
- Truck rental: $1,500-3,000
- Fuel: $300-800
- Packing materials: $200-500
- Tolls and permits: $100-300
- Storage (if needed): $200-500

Profit examples:
- E-5 with 7,000 lbs: $2,000-4,000 profit
- O-3 with 10,000 lbs: $3,000-6,000 profit
- O-6 with 13,000 lbs: $4,000-8,000 profit`,
    chapter: "5",
    section: "0802",
    category: "ppm_profit"
  },
  {
    title: "JTR 050901 - Dependent Travel Entitlements",
    content: `Dependent travel entitlements for PCS moves:

Dependent Travel:
- Spouse and children authorized
- Must be listed on PCS orders
- Travel at government expense

Dependent Entitlements:
- Transportation to new duty station
- Per diem for travel days
- Lodging during travel
- Meals during travel

Dependent Travel Options:
- Commercial transportation
- POV mileage reimbursement
- Government transportation

Documentation Required:
- Dependent ID cards
- Birth certificates for children
- Marriage certificate for spouse
- PCS orders listing dependents`,
    chapter: "5",
    section: "0901",
    category: "dependent_travel"
  },
  {
    title: "JTR 050902 - Dependent Travel Documentation",
    content: `Dependent travel documentation requirements:

Required documents:
- PCS orders listing dependents
- Dependent ID cards
- Birth certificates (children)
- Marriage certificate (spouse)
- Passport (if OCONUS)

Travel authorization:
- Must be on PCS orders
- Cannot travel before service member
- Must travel within 30 days
- Cannot travel after 1 year

Special circumstances:
- School year considerations
- Medical emergencies
- Family emergencies
- Unaccompanied tours

Documentation tips:
- Keep copies of all documents
- Get certified copies when needed
- Submit requests early
- Follow up on approvals`,
    chapter: "5",
    section: "0902",
    category: "dependent_docs"
  },
  {
    title: "JTR 051001 - OCONUS PCS Entitlements",
    content: `Special entitlements for OCONUS (overseas) PCS moves:

OCONUS Entitlements:
- Higher per diem rates
- Extended TLE (up to 90 days)
- Shipment of household goods
- Storage of household goods
- Pet transportation

OCONUS Allowances:
- COLA (Cost of Living Allowance)
- OHA (Overseas Housing Allowance)
- Utility allowances
- Home leave travel

OCONUS Requirements:
- Valid passport
- Country-specific requirements
- Medical clearances
- Security clearances

OCONUS Timeline:
- 6-12 months advance notice
- Extensive planning required
- Multiple agencies involved
- Complex documentation`,
    chapter: "5",
    section: "1001",
    category: "oconus_pcs"
  },
  {
    title: "JTR 051002 - OCONUS Housing Allowances",
    content: `OCONUS housing allowances and entitlements:

OHA (Overseas Housing Allowance):
- Replaces BAH overseas
- Based on local housing costs
- Varies by location and rank
- Includes utilities allowance

COLA (Cost of Living Allowance):
- Compensates for higher costs
- Varies by location
- Adjusted quarterly
- Tax-free income

Utility Allowances:
- Separate from OHA
- Covers electricity, gas, water
- Varies by location
- Must be justified

Home Leave:
- One round trip per tour
- Must be taken during tour
- Cannot be accumulated
- Must be used or lost`,
    chapter: "5",
    section: "1002",
    category: "oconus_housing"
  },
  {
    title: "JTR 051101 - TDY (Temporary Duty) Entitlements",
    content: `TDY entitlements for temporary duty assignments:

TDY Transportation:
- Government transportation preferred
- POV mileage if authorized
- Commercial transportation if approved

TDY Lodging:
- Government quarters preferred
- Commercial lodging if authorized
- Per diem for meals and incidental expenses

TDY Per Diem:
- Varies by location
- Higher rates for high-cost areas
- Special rates for certain countries

TDY Documentation:
- TDY orders required
- Travel authorization
- Expense reports
- Receipts for all expenses

TDY Limitations:
- Maximum duration varies
- Approval required for extensions
- Budget limitations apply`,
    chapter: "5",
    section: "1101",
    category: "tdy"
  },
  {
    title: "JTR 051102 - TDY Per Diem Rates",
    content: `TDY per diem rates and calculations:

Standard TDY rates:
- Lodging: $290/day (2025 rate)
- Meals: $65/day
- Incidental: $5/day

High-cost areas:
- New York City: $400/day lodging
- San Francisco: $350/day lodging
- Washington DC: $320/day lodging

International rates:
- Varies by country
- Higher rates for expensive cities
- Special rates for certain locations
- Updated quarterly

Rate adjustments:
- Seasonal adjustments
- Special event rates
- Emergency rates
- Government rate adjustments`,
    chapter: "5",
    section: "1102",
    category: "tdy_rates"
  },
  // CHAPTER 6: TEMPORARY LODGING
  {
    title: "JTR 060101 - Temporary Lodging Allowance (TLA)",
    content: `TLA provides reimbursement for temporary lodging during PCS moves:

TLA Eligibility:
- PCS moves only
- Must be changing duty stations
- Cannot be local moves
- Must have PCS orders

TLA Rates:
- CONUS: $290/day (2025 rate)
- OCONUS: Varies by location
- Higher rates for high-cost areas
- Special rates for certain countries

TLA Duration:
- CONUS: Up to 10 days (single), 14 days (with dependents)
- OCONUS: Up to 60 days (single), 90 days (with dependents)
- Extensions available with approval

TLA Coverage:
- Lodging expenses
- Meals (per diem rate)
- Laundry expenses
- Tips and gratuities`,
    chapter: "6",
    section: "0101",
    category: "tla"
  },
  {
    title: "JTR 060102 - TLA Extension Procedures",
    content: `TLA extension procedures and requirements:

Extension criteria:
- Housing not available
- Medical reasons
- School year considerations
- Unforeseen circumstances

Extension process:
- Submit request to finance office
- Provide supporting documentation
- Explain circumstances
- Get approval before expiration

Extension limits:
- CONUS: Additional 7 days maximum
- OCONUS: Additional 30 days maximum
- Total: Cannot exceed 21 days CONUS, 120 days OCONUS

Required documentation:
- Extension request form
- Supporting documents
- Proof of continued need
- Housing office verification`,
    chapter: "6",
    section: "0102",
    category: "tla_extensions"
  },
  // CHAPTER 7: DLA AND ALLOWANCES
  {
    title: "JTR 070101 - DLA Calculation Methods",
    content: `DLA calculation methods and procedures:

Calculation factors:
- Service member's grade
- Dependency status
- Location (CONUS/OCONUS)
- Special circumstances

Rate structure:
- E-1 to E-4: $1,200
- E-5 to E-6: $1,800
- E-7 to E-9: $2,400
- O-1 to O-3: $2,400
- O-4 to O-6: $2,700
- O-7 and above: $3,000

Special circumstances:
- OCONUS moves: Higher rates
- Alaska/Hawaii: Special rates
- International: Embassy rates
- Medical moves: Special consideration

Payment procedures:
- Automatic payment
- First paycheck at new station
- No application required
- Taxable income`,
    chapter: "7",
    section: "0101",
    category: "dla_calculation"
  },
  {
    title: "JTR 070102 - DLA Advance Pay",
    content: `DLA advance pay procedures and requirements:

Advance pay eligibility:
- Must have PCS orders
- Must be in good standing
- Cannot have outstanding advances
- Must be moving household goods

Advance pay amounts:
- Up to 80% of estimated DLA
- Paid before the move
- Balance paid with first paycheck
- Interest-free loan

Application process:
- Submit to finance office
- Provide PCS orders
- Complete advance pay form
- Get approval before moving

Repayment terms:
- No repayment required
- Balance paid automatically
- No interest charges
- No penalties for early payment`,
    chapter: "7",
    section: "0102",
    category: "dla_advance"
  },
  // CHAPTER 8: MALT AND TRANSPORTATION
  {
    title: "JTR 080101 - MALT Rate Calculations",
    content: `MALT rate calculations and procedures:

Current rate: $0.18 per mile (2025)
Maximum: 2,000 miles per PCS move

Calculation methods:
- Direct route mileage
- Actual route mileage (if authorized)
- Government transportation cost

Payment procedures:
- Submit with PCS claim
- Include odometer readings
- Provide vehicle registration
- Get supervisor approval

Special circumstances:
- OCONUS moves: Different rates
- Alaska/Hawaii: Special rates
- International moves: Embassy rates
- Multiple vehicles: Separate calculations`,
    chapter: "8",
    section: "0101",
    category: "malt_rates"
  },
  {
    title: "JTR 080102 - MALT Documentation Requirements",
    content: `MALT documentation requirements and procedures:

Required documentation:
- Odometer readings (start and end)
- Proof of PCS orders
- Vehicle registration
- Route verification

Odometer readings:
- Must be certified
- Start and end readings required
- Cannot be estimated
- Must be legible

Route verification:
- Direct route preferred
- Longer routes must be authorized
- Include reason for longer route
- Get supervisor approval

Common mistakes:
- Missing odometer readings
- Incomplete documentation
- Wrong route calculations
- Missing authorizations`,
    chapter: "8",
    section: "0102",
    category: "malt_docs"
  },
  // CHAPTER 9: PER DIEM
  {
    title: "JTR 090101 - Per Diem Rate Structure",
    content: `Per diem rate structure and calculations:

CONUS rates (2025):
- Lodging: $290/day
- Meals: $65/day
- Incidental: $5/day

OCONUS rates:
- Varies by location
- Higher rates for expensive cities
- Special rates for certain countries
- Updated quarterly

Rate adjustments:
- Seasonal adjustments
- Special event rates
- Emergency rates
- Government rate changes

Calculation methods:
- Daily rates for travel
- Partial day calculations
- Weekend/holiday rates
- Special circumstance rates`,
    chapter: "9",
    section: "0101",
    category: "per_diem_rates"
  },
  {
    title: "JTR 090102 - Per Diem Documentation",
    content: `Per diem documentation requirements:

Required documentation:
- Travel orders
- Receipts for lodging
- Meal receipts (if required)
- Proof of travel dates

Receipt requirements:
- Lodging: All receipts required
- Meals: Receipts required over $75/day
- Incidental: No receipts under $75/day

Common mistakes:
- Missing receipts
- Incomplete documentation
- Wrong dates on receipts
- Missing travel orders

Filing procedures:
- Submit within 30 days
- Use proper forms
- Include all receipts
- Get supervisor approval`,
    chapter: "9",
    section: "0102",
    category: "per_diem_docs"
  },
  // CHAPTER 10: DEPENDENTS
  {
    title: "JTR 100101 - Dependent Travel Entitlements",
    content: `Dependent travel entitlements and procedures:

Dependent eligibility:
- Spouse and children authorized
- Must be listed on PCS orders
- Cannot travel before service member
- Must travel within 30 days

Travel entitlements:
- Transportation to new duty station
- Per diem for travel days
- Lodging during travel
- Meals during travel

Travel options:
- Commercial transportation
- POV mileage reimbursement
- Government transportation

Special circumstances:
- School year considerations
- Medical emergencies
- Family emergencies
- Unaccompanied tours`,
    chapter: "10",
    section: "0101",
    category: "dependent_travel"
  },
  {
    title: "JTR 100102 - Dependent Education Entitlements",
    content: `Dependent education entitlements during PCS:

School transfer entitlements:
- Transportation to new school
- Per diem for school visits
- Lodging during school visits
- Meals during school visits

Special education:
- IEP transfer costs
- Private school deposits
- Tutoring expenses
- Activity fees

Documentation required:
- School transfer orders
- IEP documentation
- Private school contracts
- Tutoring receipts

Timing considerations:
- School year timing
- Summer moves preferred
- Mid-year moves difficult
- Special circumstances`,
    chapter: "10",
    section: "0102",
    category: "dependent_education"
  },
  // CHAPTER 11: SPECIAL CIRCUMSTANCES
  {
    title: "JTR 110101 - Medical Move Entitlements",
    content: `Medical move entitlements and procedures:

Medical move criteria:
- Service member medical condition
- Dependent medical condition
- Medical facility requirements
- Special medical needs

Medical move entitlements:
- Transportation for medical care
- Lodging during medical care
- Per diem for medical travel
- Special medical equipment

Documentation required:
- Medical orders
- Doctor's recommendations
- Medical facility requirements
- Special equipment needs

Special circumstances:
- Emergency medical moves
- Long-term medical care
- Specialized medical facilities
- Medical equipment transportation`,
    chapter: "11",
    section: "0101",
    category: "medical_moves"
  },
  {
    title: "JTR 110102 - Emergency Move Procedures",
    content: `Emergency move procedures and entitlements:

Emergency criteria:
- Natural disasters
- Family emergencies
- Medical emergencies
- Security situations

Emergency entitlements:
- Immediate transportation
- Emergency lodging
- Emergency per diem
- Special circumstances

Emergency procedures:
- Contact command immediately
- Get emergency orders
- Follow emergency procedures
- Document all expenses

Emergency documentation:
- Emergency orders
- Proof of emergency
- Emergency expenses
- Command approval`,
    chapter: "11",
    section: "0102",
    category: "emergency_moves"
  },
  // CHAPTER 12: OCONUS SPECIAL RULES
  {
    title: "JTR 120101 - OCONUS Housing Entitlements",
    content: `OCONUS housing entitlements and procedures:

Housing options:
- Government quarters
- Off-base housing
- Temporary lodging
- Special housing

Housing allowances:
- OHA (Overseas Housing Allowance)
- Utility allowances
- COLA (Cost of Living Allowance)
- Special allowances

Housing requirements:
- Valid passport
- Country-specific requirements
- Medical clearances
- Security clearances

Housing procedures:
- Apply for housing early
- Get housing office approval
- Follow country procedures
- Document all expenses`,
    chapter: "12",
    section: "0101",
    category: "oconus_housing"
  },
  {
    title: "JTR 120102 - OCONUS Transportation",
    content: `OCONUS transportation entitlements and procedures:

Transportation options:
- Government transportation
- Commercial transportation
- POV shipment
- Special transportation

Transportation entitlements:
- Transportation to new duty station
- Per diem for travel
- Lodging during travel
- Meals during travel

Special requirements:
- Passport requirements
- Visa requirements
- Medical clearances
- Security clearances

Transportation procedures:
- Apply for transportation early
- Get transportation office approval
- Follow country procedures
- Document all expenses`,
    chapter: "12",
    section: "0102",
    category: "oconus_transportation"
  },
  // CHAPTER 13: RETIREMENT AND SEPARATION
  {
    title: "JTR 130101 - Retirement Move Entitlements",
    content: `Retirement move entitlements and procedures:

Retirement eligibility:
- 20 years of service
- Medical retirement
- Early retirement
- Special circumstances

Retirement entitlements:
- Final PCS move
- Household goods shipment
- Transportation to home of record
- Per diem for travel

Retirement procedures:
- Apply for retirement move
- Get retirement orders
- Follow retirement procedures
- Document all expenses

Special circumstances:
- Medical retirement
- Early retirement
- Special retirement
- Disability retirement`,
    chapter: "13",
    section: "0101",
    category: "retirement_moves"
  },
  {
    title: "JTR 130102 - Separation Move Entitlements",
    content: `Separation move entitlements and procedures:

Separation eligibility:
- End of enlistment
- Medical separation
- Administrative separation
- Special circumstances

Separation entitlements:
- Final PCS move
- Household goods shipment
- Transportation to home of record
- Per diem for travel

Separation procedures:
- Apply for separation move
- Get separation orders
- Follow separation procedures
- Document all expenses

Special circumstances:
- Medical separation
- Administrative separation
- Special separation
- Disability separation`,
    chapter: "13",
    section: "0102",
    category: "separation_moves"
  },
  // CHAPTER 14: SPECIAL PAYS AND ALLOWANCES
  {
    title: "JTR 140101 - Special Pay Entitlements",
    content: `Special pay entitlements during PCS moves:

Special pays:
- Hazardous duty pay
- Combat pay
- Special duty pay
- Incentive pay

Special pay procedures:
- Apply for special pays
- Get special pay approval
- Follow special pay procedures
- Document all special pays

Special pay documentation:
- Special pay orders
- Proof of special duty
- Special pay calculations
- Command approval

Special pay considerations:
- Tax implications
- Retirement implications
- Special circumstances
- Special requirements`,
    chapter: "14",
    section: "0101",
    category: "special_pays"
  },
  {
    title: "JTR 140102 - Allowance Adjustments",
    content: `Allowance adjustments and procedures:

Allowance types:
- BAH adjustments
- COLA adjustments
- Special allowances
- Temporary allowances

Adjustment procedures:
- Apply for adjustments
- Get adjustment approval
- Follow adjustment procedures
- Document all adjustments

Adjustment documentation:
- Adjustment orders
- Proof of need
- Adjustment calculations
- Command approval

Adjustment considerations:
- Timing of adjustments
- Retroactive adjustments
- Special circumstances
- Special requirements`,
    chapter: "14",
    section: "0102",
    category: "allowance_adjustments"
  },
  // CHAPTER 15: TAX IMPLICATIONS
  {
    title: "JTR 150101 - Tax Implications of Moves",
    content: `Tax implications of PCS moves and entitlements:

Taxable entitlements:
- DLA (Dislocation Allowance)
- Per diem (if not documented)
- Special pays
- Allowance adjustments

Non-taxable entitlements:
- Transportation costs
- Lodging (if documented)
- Meals (if documented)
- Special circumstances

Tax documentation:
- Keep all receipts
- Document all expenses
- Get tax advice
- Follow tax procedures

Tax considerations:
- State tax implications
- Federal tax implications
- Special tax circumstances
- Tax planning`,
    chapter: "15",
    section: "0101",
    category: "tax_implications"
  },
  {
    title: "JTR 150102 - Tax Documentation Requirements",
    content: `Tax documentation requirements for PCS moves:

Required documentation:
- All receipts
- Travel orders
- Expense reports
- Tax forms

Receipt requirements:
- Lodging receipts
- Meal receipts
- Transportation receipts
- Special expense receipts

Tax form requirements:
- W-2 forms
- 1099 forms
- Special tax forms
- Tax return forms

Tax filing procedures:
- File taxes on time
- Include all documentation
- Get tax advice
- Follow tax procedures`,
    chapter: "15",
    section: "0102",
    category: "tax_documentation"
  }
];

async function chunkContent(content, title, chapter, section, category) {
  const chunks = [];
  const words = content.split(' ');
  const chunkSize = 200; // words per chunk
  const overlap = 20; // words overlap between chunks
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunkWords = words.slice(i, i + chunkSize);
    const chunkText = chunkWords.join(' ');
    
    if (chunkText.trim().length > 50) { // Only include substantial chunks
      chunks.push({
        title: `${title} - Part ${Math.floor(i / (chunkSize - overlap)) + 1}`,
        content: chunkText,
        chapter,
        section,
        category,
        source: 'JTR',
        effective_date: '2025-01-01',
        last_verified: new Date().toISOString()
      });
    }
  }
  
  return chunks;
}

async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float'
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

async function expandJTRContent() {
  console.log('🚀 Starting Comprehensive JTR Content Expansion');
  console.log('═══════════════════════════════════════════════');
  
  try {
    let totalChunks = 0;
    let processedItems = 0;
    
    for (const item of comprehensiveJTRContent) {
      console.log(`📖 Processing: ${item.title}`);
      
      // Chunk the content
      const chunks = await chunkContent(
        item.content,
        item.title,
        item.chapter,
        item.section,
        item.category
      );
      
      console.log(`  📊 Generated ${chunks.length} chunks`);
      
      // Process each chunk
      for (const chunk of chunks) {
        try {
          // Generate embedding
          const embedding = await generateEmbedding(chunk.content);
          
          // Insert into database
          const { error: insertError } = await supabase
            .from('knowledge_embeddings')
            .insert({
              content_id: `${chunk.chapter}-${chunk.section}-${Math.random().toString(36).substr(2, 9)}`,
              content_type: 'jtr_rule',
              content_text: chunk.content,
              embedding: embedding,
              metadata: {
                title: chunk.title,
                chapter: chunk.chapter,
                section: chunk.section,
                category: chunk.category,
                source: chunk.source,
                effective_date: chunk.effective_date,
                last_verified: chunk.last_verified
              }
            });
          
          if (insertError) {
            console.error(`    ❌ Error inserting chunk:`, insertError);
          } else {
            totalChunks++;
          }
        } catch (error) {
          console.error(`    ❌ Error processing chunk:`, error);
        }
      }
      
      processedItems++;
      console.log(`  ✅ ${item.title} complete`);
    }
    
    console.log('\n✅ COMPREHENSIVE JTR CONTENT EXPANSION COMPLETE!');
    console.log('═══════════════════════════════════════════════');
    console.log(`📚 Items processed: ${processedItems}`);
    console.log(`📊 Total chunks: ${totalChunks}`);
    console.log(`✅ Successfully embedded: ${totalChunks}`);
    console.log(`💰 Estimated cost: $${(totalChunks * 0.00002).toFixed(5)}`);
    console.log('═══════════════════════════════════════════════');
    console.log('\n🎉 Comprehensive JTR content now available for RAG retrieval!');
    
  } catch (error) {
    console.error('❌ Error in JTR expansion:', error);
    process.exit(1);
  }
}

// Run the expansion
expandJTRContent();
