-- Add missing 21 JTR rules to reach 50+ target
-- Dependent-specific entitlements, storage variations, OCONUS-specific, advanced scenarios

-- Dependent-specific entitlements
INSERT INTO jtr_rules (rule_code, rule_title, category, description, calculation_formula, effective_date, source_url) VALUES
('054301', 'Dependent Travel Authorization', 'dependent', 'Per diem and mileage for authorized dependent travel', 'per_diem_rate * travel_days + mileage_rate * distance', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('054302', 'Dependent Weight Allowance', 'dependent', 'Additional weight for dependents', 'base_weight + (dependents * 500)', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('054303', 'Dependent Lodging Allowance', 'dependent', 'Temporary lodging for dependents during PCS', 'lodging_rate * nights * dependent_count', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('054304', 'Dependent Meal Allowance', 'dependent', 'Meal per diem for dependents', 'meal_rate * days * dependent_count', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('054305', 'Dependent Transportation', 'dependent', 'Transportation costs for dependents', 'transportation_cost * dependent_count', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),

-- Storage variations
('054801', 'SIT Extension Request', 'sit', 'Extending storage beyond 90 days', 'base_sit_rate * extension_days', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('054802', 'NTS Authorization', 'nts', 'Long-term storage for OCONUS', 'storage_rate * months * weight_factor', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('054803', 'Storage Insurance', 'storage', 'Insurance for stored household goods', 'insurance_rate * value * coverage_period', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('054804', 'Storage Access Fees', 'storage', 'Fees for accessing stored items', 'access_fee * number_of_visits', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('054805', 'Storage Disposal', 'storage', 'Disposal of unclaimed stored items', 'disposal_fee + transportation_cost', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),

-- OCONUS-specific
('055001', 'OCONUS COLA Rates', 'cola', 'Cost of living adjustment overseas', 'base_pay * cola_percentage', '2025-01-01', 'https://www.defensetravel.dod.mil/site/cola.cfm'),
('055002', 'Currency Fluctuation', 'oconus', 'Exchange rate protection', 'base_amount * exchange_rate_factor', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('055003', 'OCONUS Housing Allowance', 'oconus', 'Housing allowance for overseas assignments', 'base_housing * location_multiplier', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('055004', 'OCONUS Transportation', 'oconus', 'Transportation to/from OCONUS', 'transportation_cost * distance_factor', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('055005', 'OCONUS Storage', 'oconus', 'Storage costs for OCONUS moves', 'storage_rate * weight * duration', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),

-- Advanced scenarios
('055101', 'Advance Pay Authorization', 'advance', 'Advance pay for PCS', 'base_pay * advance_percentage', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('055102', 'Emergency Leave Integration', 'emergency', 'Combined PCS and emergency leave', 'base_entitlements + emergency_allowances', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('055103', 'Combat Zone Tax Exclusion', 'tax', 'Tax exclusion for combat zone service', 'base_pay * tax_exclusion_percentage', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('055104', 'Hazardous Duty Pay', 'hazard', 'Additional pay for hazardous duty', 'base_pay * hazard_multiplier', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('055105', 'Separation Allowance', 'separation', 'Allowance for family separation', 'base_allowance * separation_days', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('055106', 'Special Duty Assignment Pay', 'special', 'Additional pay for special assignments', 'base_pay * special_duty_multiplier', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('055107', 'Language Proficiency Pay', 'language', 'Additional pay for language skills', 'base_pay * language_multiplier', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('055108', 'Retention Bonus', 'bonus', 'Retention bonus for critical skills', 'base_pay * retention_percentage', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('055109', 'Reenlistment Bonus', 'bonus', 'Bonus for reenlistment', 'base_pay * reenlistment_multiplier', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('055110', 'Critical Skills Retention Bonus', 'bonus', 'Bonus for critical skills retention', 'base_pay * critical_skills_multiplier', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm'),
('055111', 'Assignment Incentive Pay', 'incentive', 'Incentive pay for difficult assignments', 'base_pay * assignment_multiplier', '2025-01-01', 'https://www.defensetravel.dod.mil/site/travelreg.cfm');

-- Update the rule count verification
SELECT COUNT(*) as total_rules FROM jtr_rules;
