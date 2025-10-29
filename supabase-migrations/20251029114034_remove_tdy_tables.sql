-- Migration: Remove TDY Tables
-- Date: 2025-10-29
-- Reason: Strategic pivot - removing TDY Copilot from premium tools
-- Impact: Drops all TDY-related tables and data

-- Drop tables in correct order (items first due to foreign key)
DROP TABLE IF EXISTS tdy_items CASCADE;
DROP TABLE IF EXISTS tdy_trips CASCADE;

-- Note: This migration is destructive and will delete all TDY data
-- Ensure you have backups if needed before applying
