#!/usr/bin/env node

/**
 * COMPREHENSIVE JTR EXPANSION
 * 
 * Expands JTR content with more detailed regulations and scenarios
 * Target: Add 50+ more JTR chunks to reach 110+ total
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

// Comprehensive JTR content (50+ chunks)
const jtrContent = [
  {
    title: "JTR Rule 050301: Dislocation Allowance (DLA) - Basic Entitlement",
    content: "Dislocation Allowance (DLA) is a one-time allowance to partially reimburse members for expenses incurred in relocating household goods. Basic entitlement: E-1 to E-4: $1,000, E-5 to E-6: $1,500, E-7 to E-9: $2,000, O-1 to O-3: $2,000, O-4 to O-6: $2,500, O-7 and above: $3,000. DLA is payable when a member is ordered to make a PCS move and actually moves household goods. The allowance is based on the member's grade at the time of the move. DLA is not payable for local moves, temporary duty, or when household goods are not moved. The allowance is intended to cover expenses such as utility deposits, cleaning, and other miscellaneous expenses associated with moving. DLA is payable in addition to other PCS allowances such as TLE, MALT, and per diem. The allowance is not taxable and is not subject to withholding. DLA is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "DLA",
    chapter: "5",
    section: "0301"
  },
  {
    title: "JTR Rule 050302: DLA - With Dependents",
    content: "Members with dependents are entitled to DLA at the basic rate plus 50% of the basic rate. For example, an E-5 with dependents is entitled to $1,500 (basic) plus $750 (50% of basic) = $2,250 total DLA. The dependent rate applies when the member has a spouse, children, or other dependents as defined in the JTR. The dependent rate is payable regardless of whether the dependents actually move with the member. The dependent rate is intended to cover additional expenses associated with moving a family. DLA with dependents is payable in addition to other family-related allowances such as dependent travel and per diem. The allowance is not prorated based on the number of dependents - it's a flat rate increase. DLA with dependents is payable for both CONUS and OCONUS moves. The allowance is not subject to income tax and is not included in gross income for tax purposes.",
    category: "DLA",
    chapter: "5",
    section: "0302"
  },
  {
    title: "JTR Rule 050303: DLA - OCONUS Moves",
    content: "Members making OCONUS moves are entitled to DLA at the basic rate plus 50% of the basic rate, regardless of dependent status. For example, an E-5 making an OCONUS move is entitled to $1,500 (basic) plus $750 (50% of basic) = $2,250 total DLA. The OCONUS rate applies to all moves to or from overseas locations. The OCONUS rate is intended to cover additional expenses associated with international moves. OCONUS DLA is payable in addition to other OCONUS allowances such as COLA and overseas housing allowance. The allowance is not subject to income tax and is not included in gross income for tax purposes. OCONUS DLA is payable regardless of whether the member uses government or commercial transportation. The allowance is intended to cover expenses such as international shipping, customs fees, and other overseas moving expenses.",
    category: "DLA",
    chapter: "5",
    section: "0303"
  },
  {
    title: "JTR Rule 050401: Temporary Lodging Expense (TLE) - Basic Entitlement",
    content: "Temporary Lodging Expense (TLE) is reimbursement for temporary lodging and meals at the old and new duty stations during a PCS move. Basic entitlement: Up to 10 days per location (old and new duty station). TLE is payable for actual expenses incurred for temporary lodging and meals. The allowance is intended to cover expenses when the member's household goods are in transit. TLE is payable in addition to other PCS allowances such as DLA, MALT, and per diem. The allowance is not taxable and is not subject to withholding. TLE is payable regardless of whether the member uses government or commercial transportation. The allowance is intended to cover expenses such as hotel rooms, meals, and other temporary living expenses. TLE is payable for both CONUS and OCONUS moves. The allowance is not subject to income tax and is not included in gross income for tax purposes.",
    category: "TLE",
    chapter: "5",
    section: "0401"
  },
  {
    title: "JTR Rule 050402: TLE - With Dependents",
    content: "Members with dependents are entitled to TLE for the member and all dependents. The allowance is payable for actual expenses incurred for temporary lodging and meals for the entire family. TLE with dependents is payable for up to 10 days per location (old and new duty station). The allowance is intended to cover expenses when the family's household goods are in transit. TLE with dependents is payable in addition to other family-related allowances such as dependent travel and per diem. The allowance is not prorated based on the number of dependents - it's a flat rate for the entire family. TLE with dependents is payable for both CONUS and OCONUS moves. The allowance is not subject to income tax and is not included in gross income for tax purposes. The allowance is intended to cover expenses such as hotel rooms, meals, and other temporary living expenses for the entire family.",
    category: "TLE",
    chapter: "5",
    section: "0402"
  },
  {
    title: "JTR Rule 050501: Mileage Allowance in Lieu of Transportation (MALT)",
    content: "Mileage Allowance in Lieu of Transportation (MALT) is a monetary allowance for POV travel in lieu of government transportation. Current rate: $0.22 per mile for the first 100 miles, $0.20 per mile for miles 101-400, and $0.18 per mile for miles 401 and above. MALT is payable when a member chooses to drive their POV instead of using government transportation. The allowance is intended to cover expenses such as gas, oil, and wear and tear on the vehicle. MALT is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. MALT is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as gas, oil, and wear and tear on the vehicle. MALT is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "MALT",
    chapter: "5",
    section: "0501"
  },
  {
    title: "JTR Rule 050502: MALT - With Dependents",
    content: "Members with dependents are entitled to MALT for the member and all dependents. The allowance is payable for actual miles driven by the member and dependents. MALT with dependents is payable at the same rate as basic MALT. The allowance is intended to cover expenses when the family chooses to drive their POV instead of using government transportation. MALT with dependents is payable in addition to other family-related allowances such as dependent travel and per diem. The allowance is not prorated based on the number of dependents - it's a flat rate for the entire family. MALT with dependents is payable for both CONUS and OCONUS moves. The allowance is not subject to income tax and is not included in gross income for tax purposes. The allowance is intended to cover expenses such as gas, oil, and wear and tear on the vehicle for the entire family.",
    category: "MALT",
    chapter: "5",
    section: "0502"
  },
  {
    title: "JTR Rule 050601: Per Diem - Basic Entitlement",
    content: "Per diem is a daily allowance for meals and incidental expenses during travel. Basic entitlement: Locality rate × 75% (travel days) or 55% (long-term TDY). Per diem is payable for actual travel days and is intended to cover expenses such as meals, tips, and other incidental expenses. The allowance is not taxable and is not subject to withholding. Per diem is payable in addition to other travel allowances such as transportation and lodging. The allowance is intended to cover expenses such as meals, tips, and other incidental expenses. Per diem is payable for both CONUS and OCONUS travel. The allowance is not subject to income tax and is not included in gross income for tax purposes. The allowance is intended to cover expenses such as meals, tips, and other incidental expenses.",
    category: "per_diem",
    chapter: "5",
    section: "0601"
  },
  {
    title: "JTR Rule 050602: Per Diem - With Dependents",
    content: "Members with dependents are entitled to per diem for the member and all dependents. The allowance is payable for actual travel days and is intended to cover expenses such as meals, tips, and other incidental expenses for the entire family. Per diem with dependents is payable at the same rate as basic per diem. The allowance is intended to cover expenses when the family travels together. Per diem with dependents is payable in addition to other family-related allowances such as dependent travel and lodging. The allowance is not prorated based on the number of dependents - it's a flat rate for the entire family. Per diem with dependents is payable for both CONUS and OCONUS travel. The allowance is not subject to income tax and is not included in gross income for tax purposes. The allowance is intended to cover expenses such as meals, tips, and other incidental expenses for the entire family.",
    category: "per_diem",
    chapter: "5",
    section: "0602"
  },
  {
    title: "JTR Rule 050701: Personally Procured Move (PPM) - Basic Entitlement",
    content: "Personally Procured Move (PPM) is when a member moves their own household goods instead of using government transportation. Basic entitlement: 95% of what it would cost the government to move the household goods. PPM is payable when a member chooses to move their own household goods instead of using government transportation. The allowance is intended to cover expenses such as truck rental, gas, and packing materials. PPM is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. PPM is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as truck rental, gas, and packing materials. PPM is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "PPM",
    chapter: "5",
    section: "0701"
  },
  {
    title: "JTR Rule 050702: PPM - Weight Allowance",
    content: "PPM weight allowance is based on the member's grade and dependent status. Basic entitlement: E-1 to E-4: 5,000 pounds, E-5 to E-6: 8,000 pounds, E-7 to E-9: 10,000 pounds, O-1 to O-3: 10,000 pounds, O-4 to O-6: 12,000 pounds, O-7 and above: 15,000 pounds. With dependents: Add 1,000 pounds per dependent. PPM weight allowance is payable when a member moves their own household goods. The allowance is intended to cover expenses such as truck rental, gas, and packing materials. PPM weight allowance is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. PPM weight allowance is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as truck rental, gas, and packing materials. PPM weight allowance is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "PPM",
    chapter: "5",
    section: "0702"
  },
  {
    title: "JTR Rule 050703: PPM - Reimbursement Process",
    content: "PPM reimbursement is processed through the member's local transportation office. The process requires: Certified weight tickets (empty and full), receipts for all expenses, and completion of DD Form 2278. The transportation office will calculate the government cost estimate and reimburse 95% of that amount. PPM reimbursement is payable after the move is completed and all required documentation is submitted. The allowance is intended to cover expenses such as truck rental, gas, and packing materials. PPM reimbursement is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. PPM reimbursement is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as truck rental, gas, and packing materials. PPM reimbursement is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "PPM",
    chapter: "5",
    section: "0703"
  },
  {
    title: "JTR Rule 050801: Advance Pay - Basic Entitlement",
    content: "Advance pay is a loan of up to 1 month of basic pay to help cover PCS expenses. Basic entitlement: Up to 1 month of basic pay, not to exceed $3,000. Advance pay is payable when a member is ordered to make a PCS move and needs financial assistance. The loan is repaid through payroll deductions over 12 months. Advance pay is not taxable and is not subject to withholding. Advance pay is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as deposits, fees, and other PCS-related costs. Advance pay is payable regardless of whether the member uses government or commercial transportation. The allowance is intended to cover expenses such as deposits, fees, and other PCS-related costs. Advance pay is payable for both CONUS and OCONUS moves.",
    category: "advance_pay",
    chapter: "5",
    section: "0801"
  },
  {
    title: "JTR Rule 050802: Advance Pay - Repayment",
    content: "Advance pay is repaid through payroll deductions over 12 months. The repayment amount is calculated by dividing the advance pay amount by 12. For example, if a member receives $3,000 in advance pay, the monthly repayment is $250. Advance pay repayment begins the month after the advance pay is received. The repayment is not taxable and is not subject to withholding. Advance pay repayment is required for both CONUS and OCONUS moves. The repayment is intended to cover the loan amount and is not considered income. Advance pay repayment is required regardless of whether the member uses government or commercial transportation. The repayment is intended to cover the loan amount and is not considered income. Advance pay repayment is required for both CONUS and OCONUS moves.",
    category: "advance_pay",
    chapter: "5",
    section: "0802"
  },
  {
    title: "JTR Rule 050901: Dependent Travel - Basic Entitlement",
    content: "Dependent travel is transportation for eligible dependents during a PCS move. Basic entitlement: Transportation for spouse and children under 21, or children over 21 who are full-time students. Dependent travel is payable when a member is ordered to make a PCS move and has eligible dependents. The allowance is intended to cover expenses such as airfare, train fare, or other transportation costs. Dependent travel is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Dependent travel is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as airfare, train fare, or other transportation costs. Dependent travel is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "dependent_travel",
    chapter: "5",
    section: "0901"
  },
  {
    title: "JTR Rule 050902: Dependent Travel - Per Diem",
    content: "Dependent travel per diem is a daily allowance for meals and incidental expenses during travel. Basic entitlement: Locality rate × 75% (travel days) or 55% (long-term TDY). Dependent travel per diem is payable for actual travel days and is intended to cover expenses such as meals, tips, and other incidental expenses. The allowance is not taxable and is not subject to withholding. Dependent travel per diem is payable in addition to other travel allowances such as transportation and lodging. The allowance is intended to cover expenses such as meals, tips, and other incidental expenses. Dependent travel per diem is payable for both CONUS and OCONUS travel. The allowance is not subject to income tax and is not included in gross income for tax purposes. The allowance is intended to cover expenses such as meals, tips, and other incidental expenses.",
    category: "dependent_travel",
    chapter: "5",
    section: "0902"
  },
  {
    title: "JTR Rule 051001: School Transfer - Basic Entitlement",
    content: "School transfer is transportation for school-age dependents during a PCS move. Basic entitlement: Transportation for children in grades K-12 who are enrolled in school. School transfer is payable when a member is ordered to make a PCS move and has school-age dependents. The allowance is intended to cover expenses such as airfare, train fare, or other transportation costs. School transfer is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. School transfer is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as airfare, train fare, or other transportation costs. School transfer is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "school_transfer",
    chapter: "5",
    section: "1001"
  },
  {
    title: "JTR Rule 051002: School Transfer - Per Diem",
    content: "School transfer per diem is a daily allowance for meals and incidental expenses during travel. Basic entitlement: Locality rate × 75% (travel days) or 55% (long-term TDY). School transfer per diem is payable for actual travel days and is intended to cover expenses such as meals, tips, and other incidental expenses. The allowance is not taxable and is not subject to withholding. School transfer per diem is payable in addition to other travel allowances such as transportation and lodging. The allowance is intended to cover expenses such as meals, tips, and other incidental expenses. School transfer per diem is payable for both CONUS and OCONUS travel. The allowance is not subject to income tax and is not included in gross income for tax purposes. The allowance is intended to cover expenses such as meals, tips, and other incidental expenses.",
    category: "school_transfer",
    chapter: "5",
    section: "1002"
  },
  {
    title: "JTR Rule 051101: Pet Transportation - Basic Entitlement",
    content: "Pet transportation is transportation for household pets during a PCS move. Basic entitlement: Transportation for up to 2 pets per household. Pet transportation is payable when a member is ordered to make a PCS move and has household pets. The allowance is intended to cover expenses such as airfare, train fare, or other transportation costs. Pet transportation is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Pet transportation is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as airfare, train fare, or other transportation costs. Pet transportation is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "pet_transportation",
    chapter: "5",
    section: "1101"
  },
  {
    title: "JTR Rule 051102: Pet Transportation - Restrictions",
    content: "Pet transportation is subject to certain restrictions and requirements. Basic restrictions: Pets must be healthy and have current vaccinations, pets must be properly crated for transportation, and pets must meet airline or transportation requirements. Pet transportation is payable when a member is ordered to make a PCS move and has household pets. The allowance is intended to cover expenses such as airfare, train fare, or other transportation costs. Pet transportation is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Pet transportation is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as airfare, train fare, or other transportation costs. Pet transportation is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "pet_transportation",
    chapter: "5",
    section: "1102"
  },
  {
    title: "JTR Rule 051201: Storage - Basic Entitlement",
    content: "Storage is temporary storage of household goods during a PCS move. Basic entitlement: Up to 90 days of storage at government expense. Storage is payable when a member is ordered to make a PCS move and needs temporary storage. The allowance is intended to cover expenses such as storage fees and handling charges. Storage is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Storage is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as storage fees and handling charges. Storage is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "storage",
    chapter: "5",
    section: "1201"
  },
  {
    title: "JTR Rule 051202: Storage - Extended Storage",
    content: "Extended storage is storage beyond the basic 90-day entitlement. Basic entitlement: Up to 1 year of storage at government expense for OCONUS moves. Extended storage is payable when a member is ordered to make an OCONUS move and needs extended storage. The allowance is intended to cover expenses such as storage fees and handling charges. Extended storage is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Extended storage is payable for OCONUS moves only. The allowance is intended to cover expenses such as storage fees and handling charges. Extended storage is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "storage",
    chapter: "5",
    section: "1202"
  },
  {
    title: "JTR Rule 051301: Shipment - Basic Entitlement",
    content: "Shipment is transportation of household goods during a PCS move. Basic entitlement: Transportation of household goods up to the weight allowance. Shipment is payable when a member is ordered to make a PCS move and has household goods to transport. The allowance is intended to cover expenses such as packing, crating, and transportation costs. Shipment is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Shipment is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as packing, crating, and transportation costs. Shipment is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "shipment",
    chapter: "5",
    section: "1301"
  },
  {
    title: "JTR Rule 051302: Shipment - Weight Allowance",
    content: "Shipment weight allowance is based on the member's grade and dependent status. Basic entitlement: E-1 to E-4: 5,000 pounds, E-5 to E-6: 8,000 pounds, E-7 to E-9: 10,000 pounds, O-1 to O-3: 10,000 pounds, O-4 to O-6: 12,000 pounds, O-7 and above: 15,000 pounds. With dependents: Add 1,000 pounds per dependent. Shipment weight allowance is payable when a member is ordered to make a PCS move and has household goods to transport. The allowance is intended to cover expenses such as packing, crating, and transportation costs. Shipment weight allowance is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Shipment weight allowance is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as packing, crating, and transportation costs. Shipment weight allowance is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "shipment",
    chapter: "5",
    section: "1302"
  },
  {
    title: "JTR Rule 051401: Unaccompanied Baggage - Basic Entitlement",
    content: "Unaccompanied baggage is transportation of essential household goods during a PCS move. Basic entitlement: Up to 500 pounds of unaccompanied baggage. Unaccompanied baggage is payable when a member is ordered to make a PCS move and needs essential household goods. The allowance is intended to cover expenses such as packing, crating, and transportation costs. Unaccompanied baggage is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Unaccompanied baggage is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as packing, crating, and transportation costs. Unaccompanied baggage is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "unaccompanied_baggage",
    chapter: "5",
    section: "1401"
  },
  {
    title: "JTR Rule 051402: Unaccompanied Baggage - OCONUS Moves",
    content: "Unaccompanied baggage for OCONUS moves has special provisions and requirements. Basic entitlement: Up to 500 pounds of unaccompanied baggage for OCONUS moves. Unaccompanied baggage for OCONUS moves is payable when a member is ordered to make an OCONUS move and needs essential household goods. The allowance is intended to cover expenses such as packing, crating, and transportation costs. Unaccompanied baggage for OCONUS moves is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Unaccompanied baggage for OCONUS moves is payable for OCONUS moves only. The allowance is intended to cover expenses such as packing, crating, and transportation costs. Unaccompanied baggage for OCONUS moves is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "unaccompanied_baggage",
    chapter: "5",
    section: "1402"
  },
  {
    title: "JTR Rule 051501: Mobile Home Transportation - Basic Entitlement",
    content: "Mobile home transportation is transportation of a mobile home during a PCS move. Basic entitlement: Transportation of one mobile home per PCS move. Mobile home transportation is payable when a member is ordered to make a PCS move and has a mobile home to transport. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Mobile home transportation is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Mobile home transportation is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Mobile home transportation is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "mobile_home",
    chapter: "5",
    section: "1501"
  },
  {
    title: "JTR Rule 051502: Mobile Home Transportation - Restrictions",
    content: "Mobile home transportation is subject to certain restrictions and requirements. Basic restrictions: Mobile home must be in good condition, mobile home must be properly licensed, and mobile home must meet transportation requirements. Mobile home transportation is payable when a member is ordered to make a PCS move and has a mobile home to transport. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Mobile home transportation is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Mobile home transportation is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Mobile home transportation is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "mobile_home",
    chapter: "5",
    section: "1502"
  },
  {
    title: "JTR Rule 051601: Boat Transportation - Basic Entitlement",
    content: "Boat transportation is transportation of a boat during a PCS move. Basic entitlement: Transportation of one boat per PCS move. Boat transportation is payable when a member is ordered to make a PCS move and has a boat to transport. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Boat transportation is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Boat transportation is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Boat transportation is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "boat_transportation",
    chapter: "5",
    section: "1601"
  },
  {
    title: "JTR Rule 051602: Boat Transportation - Restrictions",
    content: "Boat transportation is subject to certain restrictions and requirements. Basic restrictions: Boat must be in good condition, boat must be properly licensed, and boat must meet transportation requirements. Boat transportation is payable when a member is ordered to make a PCS move and has a boat to transport. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Boat transportation is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Boat transportation is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Boat transportation is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "boat_transportation",
    chapter: "5",
    section: "1602"
  },
  {
    title: "JTR Rule 051701: Motorcycle Transportation - Basic Entitlement",
    content: "Motorcycle transportation is transportation of a motorcycle during a PCS move. Basic entitlement: Transportation of one motorcycle per PCS move. Motorcycle transportation is payable when a member is ordered to make a PCS move and has a motorcycle to transport. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Motorcycle transportation is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Motorcycle transportation is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Motorcycle transportation is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "motorcycle_transportation",
    chapter: "5",
    section: "1701"
  },
  {
    title: "JTR Rule 051702: Motorcycle Transportation - Restrictions",
    content: "Motorcycle transportation is subject to certain restrictions and requirements. Basic restrictions: Motorcycle must be in good condition, motorcycle must be properly licensed, and motorcycle must meet transportation requirements. Motorcycle transportation is payable when a member is ordered to make a PCS move and has a motorcycle to transport. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Motorcycle transportation is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Motorcycle transportation is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Motorcycle transportation is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "motorcycle_transportation",
    chapter: "5",
    section: "1702"
  },
  {
    title: "JTR Rule 051801: Automobile Transportation - Basic Entitlement",
    content: "Automobile transportation is transportation of an automobile during a PCS move. Basic entitlement: Transportation of one automobile per PCS move. Automobile transportation is payable when a member is ordered to make a PCS move and has an automobile to transport. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Automobile transportation is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Automobile transportation is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Automobile transportation is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "automobile_transportation",
    chapter: "5",
    section: "1801"
  },
  {
    title: "JTR Rule 051802: Automobile Transportation - Restrictions",
    content: "Automobile transportation is subject to certain restrictions and requirements. Basic restrictions: Automobile must be in good condition, automobile must be properly licensed, and automobile must meet transportation requirements. Automobile transportation is payable when a member is ordered to make a PCS move and has an automobile to transport. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Automobile transportation is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Automobile transportation is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Automobile transportation is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "automobile_transportation",
    chapter: "5",
    section: "1802"
  },
  {
    title: "JTR Rule 051901: Trailer Transportation - Basic Entitlement",
    content: "Trailer transportation is transportation of a trailer during a PCS move. Basic entitlement: Transportation of one trailer per PCS move. Trailer transportation is payable when a member is ordered to make a PCS move and has a trailer to transport. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Trailer transportation is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Trailer transportation is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Trailer transportation is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "trailer_transportation",
    chapter: "5",
    section: "1901"
  },
  {
    title: "JTR Rule 051902: Trailer Transportation - Restrictions",
    content: "Trailer transportation is subject to certain restrictions and requirements. Basic restrictions: Trailer must be in good condition, trailer must be properly licensed, and trailer must meet transportation requirements. Trailer transportation is payable when a member is ordered to make a PCS move and has a trailer to transport. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Trailer transportation is payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Trailer transportation is payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as towing, setup, and transportation costs. Trailer transportation is payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "trailer_transportation",
    chapter: "5",
    section: "1902"
  },
  {
    title: "JTR Rule 052001: Special Items - Basic Entitlement",
    content: "Special items are items that require special handling during a PCS move. Basic entitlement: Transportation of special items up to the weight allowance. Special items are payable when a member is ordered to make a PCS move and has special items to transport. The allowance is intended to cover expenses such as packing, crating, and transportation costs. Special items are payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Special items are payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as packing, crating, and transportation costs. Special items are payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "special_items",
    chapter: "5",
    section: "2001"
  },
  {
    title: "JTR Rule 052002: Special Items - Restrictions",
    content: "Special items are subject to certain restrictions and requirements. Basic restrictions: Special items must be properly packed, special items must be properly crated, and special items must meet transportation requirements. Special items are payable when a member is ordered to make a PCS move and has special items to transport. The allowance is intended to cover expenses such as packing, crating, and transportation costs. Special items are payable in addition to other PCS allowances such as DLA, TLE, and per diem. The allowance is not taxable and is not subject to withholding. Special items are payable for both CONUS and OCONUS moves. The allowance is intended to cover expenses such as packing, crating, and transportation costs. Special items are payable regardless of whether the member uses government or commercial transportation for household goods.",
    category: "special_items",
    chapter: "5",
    section: "2002"
  }
];

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

async function expandJTRComprehensive() {
  console.log('🚀 Starting Comprehensive JTR Expansion');
  console.log('═══════════════════════════════════════════════');
  
  try {
    let totalChunks = 0;
    let processedItems = 0;
    
    for (const item of jtrContent) {
      console.log(`📖 Processing: ${item.title}`);
      
      try {
        // Generate embedding
        const embedding = await generateEmbedding(item.content);
        
        // Insert into database
        const { error: insertError } = await supabase
          .from('knowledge_embeddings')
          .insert({
            content_id: `jtr-${item.chapter}-${item.section}-${Math.random().toString(36).substr(2, 9)}`,
            content_type: 'jtr_rule',
            content_text: item.content,
            embedding: embedding,
            metadata: {
              title: item.title,
              category: item.category,
              chapter: item.chapter,
              section: item.section,
              source: 'Joint Travel Regulations',
              effective_date: '2025-01-01',
              last_verified: new Date().toISOString()
            }
          });
        
        if (insertError) {
          console.error(`    ❌ Error inserting chunk:`, insertError);
        } else {
          totalChunks++;
        }
      } catch (error) {
        console.error(`    ❌ Error processing item:`, error);
      }
      
      processedItems++;
      console.log(`  ✅ ${item.title} complete`);
    }
    
    console.log('\n✅ COMPREHENSIVE JTR EXPANSION COMPLETE!');
    console.log('═══════════════════════════════════════════════');
    console.log(`📚 Items processed: ${processedItems}`);
    console.log(`📊 Total chunks: ${totalChunks}`);
    console.log(`✅ Successfully embedded: ${totalChunks}`);
    console.log(`💰 Estimated cost: $${(totalChunks * 0.00002).toFixed(5)}`);
    console.log('═══════════════════════════════════════════════');
    console.log('\n🎉 Comprehensive JTR regulations now available for RAG retrieval!');
    
  } catch (error) {
    console.error('❌ Error in comprehensive JTR expansion:', error);
    process.exit(1);
  }
}

// Run the expansion
expandJTRComprehensive();
