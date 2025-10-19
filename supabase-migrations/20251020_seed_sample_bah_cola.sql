-- =====================================================================
-- SEED SAMPLE BAH/COLA RATES (2025)
-- Created: 2025-10-20
-- Purpose: Initial seed data for testing - replace with official DFAS import
-- Source: Representative sample rates from DFAS 2025 BAH tables
-- =====================================================================

-- =====================================================================
-- SAMPLE BAH RATES (Major Military Housing Areas)
-- =====================================================================
-- These are SAMPLE rates for common bases - full import required from DFAS
-- Real import: https://www.defensetravel.dod.mil/site/bahCalc.cfm

INSERT INTO bah_rates (paygrade, mha, with_dependents, effective_date, rate_cents, zip_code, location_name) VALUES
  -- Fort Liberty (Fayetteville, NC) - MHA NC228
  ('E05', 'NC228', true, '2025-01-01', 166200, '28310', 'Fort Liberty, NC'),
  ('E05', 'NC228', false, '2025-01-01', 145800, '28310', 'Fort Liberty, NC'),
  ('E06', 'NC228', true, '2025-01-01', 178500, '28310', 'Fort Liberty, NC'),
  ('E06', 'NC228', false, '2025-01-01', 157500, '28310', 'Fort Liberty, NC'),
  ('O03', 'NC228', true, '2025-01-01', 195300, '28310', 'Fort Liberty, NC'),
  ('O03', 'NC228', false, '2025-01-01', 172200, '28310', 'Fort Liberty, NC'),

  -- San Diego, CA - MHA CA917
  ('E05', 'CA917', true, '2025-01-01', 312000, '92101', 'San Diego, CA'),
  ('E05', 'CA917', false, '2025-01-01', 267300, '92101', 'San Diego, CA'),
  ('E06', 'CA917', true, '2025-01-01', 336600, '92101', 'San Diego, CA'),
  ('E06', 'CA917', false, '2025-01-01', 289800, '92101', 'San Diego, CA'),
  ('O03', 'CA917', true, '2025-01-01', 372600, '92101', 'San Diego, CA'),
  ('O03', 'CA917', false, '2025-01-01', 319800, '92101', 'San Diego, CA'),

  -- Norfolk, VA - MHA VA544
  ('E05', 'VA544', true, '2025-01-01', 196200, '23511', 'Norfolk, VA'),
  ('E05', 'VA544', false, '2025-01-01', 168900, '23511', 'Norfolk, VA'),
  ('E06', 'VA544', true, '2025-01-01', 210900, '23511', 'Norfolk, VA'),
  ('E06', 'VA544', false, '2025-01-01', 181800, '23511', 'Norfolk, VA'),
  ('O03', 'VA544', true, '2025-01-01', 235200, '23511', 'Norfolk, VA'),
  ('O03', 'VA544', false, '2025-01-01', 202500, '23511', 'Norfolk, VA'),

  -- Joint Base Lewis-McChord, WA - MHA WA408
  ('E05', 'WA408', true, '2025-01-01', 240600, '98433', 'Joint Base Lewis-McChord, WA'),
  ('E05', 'WA408', false, '2025-01-01', 205800, '98433', 'Joint Base Lewis-McChord, WA'),
  ('E06', 'WA408', true, '2025-01-01', 259800, '98433', 'Joint Base Lewis-McChord, WA'),
  ('E06', 'WA408', false, '2025-01-01', 222600, '98433', 'Joint Base Lewis-McChord, WA'),
  ('O03', 'WA408', true, '2025-01-01', 288300, '98433', 'Joint Base Lewis-McChord, WA'),
  ('O03', 'WA408', false, '2025-01-01', 247200, '98433', 'Joint Base Lewis-McChord, WA'),

  -- Fort Hood (Fort Cavazos), TX - MHA TX243
  ('E05', 'TX243', true, '2025-01-01', 154800, '76544', 'Fort Cavazos (Hood), TX'),
  ('E05', 'TX243', false, '2025-01-01', 133500, '76544', 'Fort Cavazos (Hood), TX'),
  ('E06', 'TX243', true, '2025-01-01', 166200, '76544', 'Fort Cavazos (Hood), TX'),
  ('E06', 'TX243', false, '2025-01-01', 143100, '76544', 'Fort Cavazos (Hood), TX'),
  ('O03', 'TX243', true, '2025-01-01', 183600, '76544', 'Fort Cavazos (Hood), TX'),
  ('O03', 'TX243', false, '2025-01-01', 157800, '76544', 'Fort Cavazos (Hood), TX')
ON CONFLICT (paygrade, mha, with_dependents, effective_date) DO NOTHING;

-- =====================================================================
-- SAMPLE CONUS COLA RATES
-- =====================================================================
-- CONUS COLA only applies to high-cost areas
-- Sample rates for demonstration

INSERT INTO conus_cola_rates (mha, paygrade, with_dependents, effective_date, monthly_amount_cents, location_name, cola_index) VALUES
  -- San Diego (high COLA area)
  ('CA917', 'E05', true, '2025-01-01', 18500, 'San Diego, CA', 8.5),
  ('CA917', 'E05', false, '2025-01-01', 14200, 'San Diego, CA', 8.5),
  ('CA917', 'E06', true, '2025-01-01', 20100, 'San Diego, CA', 8.5),
  ('CA917', 'E06', false, '2025-01-01', 15800, 'San Diego, CA', 8.5),
  ('CA917', 'O03', true, '2025-01-01', 24300, 'San Diego, CA', 8.5),
  ('CA917', 'O03', false, '2025-01-01', 18900, 'San Diego, CA', 8.5)
ON CONFLICT (mha, paygrade, with_dependents, effective_date) DO NOTHING;

-- =====================================================================
-- SAMPLE OCONUS COLA RATES
-- =====================================================================
-- Overseas COLA rates (examples)

INSERT INTO oconus_cola_rates (location_code, paygrade, with_dependents, effective_date, monthly_amount_cents, location_name, cola_index) VALUES
  -- Hawaii (Oahu)
  ('HAWAII_OAHU', 'E05', true, '2025-01-01', 42500, 'Oahu, Hawaii', 15.2),
  ('HAWAII_OAHU', 'E05', false, '2025-01-01', 31800, 'Oahu, Hawaii', 15.2),
  ('HAWAII_OAHU', 'E06', true, '2025-01-01', 46200, 'Oahu, Hawaii', 15.2),
  ('HAWAII_OAHU', 'E06', false, '2025-01-01', 34900, 'Oahu, Hawaii', 15.2),
  ('HAWAII_OAHU', 'O03', true, '2025-01-01', 52800, 'Oahu, Hawaii', 15.2),
  ('HAWAII_OAHU', 'O03', false, '2025-01-01', 39600, 'Oahu, Hawaii', 15.2),

  -- Germany (Ramstein)
  ('GERMANY_RAMSTEIN', 'E05', true, '2025-01-01', 38700, 'Ramstein AB, Germany', 12.5),
  ('GERMANY_RAMSTEIN', 'E05', false, '2025-01-01', 28900, 'Ramstein AB, Germany', 12.5),
  ('GERMANY_RAMSTEIN', 'E06', true, '2025-01-01', 41900, 'Ramstein AB, Germany', 12.5),
  ('GERMANY_RAMSTEIN', 'E06', false, '2025-01-01', 31400, 'Ramstein AB, Germany', 12.5),
  ('GERMANY_RAMSTEIN', 'O03', true, '2025-01-01', 47800, 'Ramstein AB, Germany', 12.5),
  ('GERMANY_RAMSTEIN', 'O03', false, '2025-01-01', 35800, 'Ramstein AB, Germany', 12.5),

  -- Japan (Yokosuka)
  ('JAPAN_YOKOSUKA', 'E05', true, '2025-01-01', 51200, 'Yokosuka, Japan', 18.7),
  ('JAPAN_YOKOSUKA', 'E05', false, '2025-01-01', 38400, 'Yokosuka, Japan', 18.7),
  ('JAPAN_YOKOSUKA', 'E06', true, '2025-01-01', 55600, 'Yokosuka, Japan', 18.7),
  ('JAPAN_YOKOSUKA', 'E06', false, '2025-01-01', 41700, 'Yokosuka, Japan', 18.7),
  ('JAPAN_YOKOSUKA', 'O03', true, '2025-01-01', 63400, 'Yokosuka, Japan', 18.7),
  ('JAPAN_YOKOSUKA', 'O03', false, '2025-01-01', 47600, 'Yokosuka, Japan', 18.7)
ON CONFLICT (location_code, paygrade, with_dependents, effective_date) DO NOTHING;

-- =====================================================================
-- NOTES FOR PRODUCTION
-- =====================================================================
-- This is SAMPLE DATA for testing purposes only.
-- 
-- For production, import official DFAS BAH tables:
-- 1. Download CSV from https://www.defensetravel.dod.mil/site/bahCalc.cfm
-- 2. Use admin UI to bulk import (see app/admin/feeds)
-- 3. Verify all MHA codes, paygrades E01-E09, O01-O10, W01-W05
-- 
-- For COLA rates:
-- 1. Download from https://www.travel.dod.mil/Travel-Transportation-Rates/
-- 2. Import quarterly updates (COLA changes every quarter)
-- 
-- These sample rates represent approximately 5% of actual data.
-- Full dataset requires ~15,000+ BAH rate records.

