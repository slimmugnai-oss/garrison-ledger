-- LES AUDITOR v1.2 - MANUAL ENTRY SUPPORT
-- Created: 2025-01-19
-- Purpose: Add support for manual entry (no PDF upload required)

-- Add entry_type field to track how data was entered
alter table les_uploads 
  add column if not exists entry_type text not null default 'pdf' 
  check (entry_type in ('pdf', 'manual'));

-- Add comment
comment on column les_uploads.entry_type is 'How the LES data was entered: pdf (parsed from file) or manual (user-entered values)';

-- For manual entries, some fields are optional (no file stored)
alter table les_uploads alter column original_filename drop not null;
alter table les_uploads alter column storage_path drop not null;
alter table les_uploads alter column size_bytes drop not null;

-- Add defaults for manual entries
alter table les_uploads alter column original_filename set default 'manual-entry';
alter table les_uploads alter column storage_path set default '';
alter table les_uploads alter column size_bytes set default 0;

-- Manual entries are automatically "parsed" (no parsing needed)
-- When entry_type='manual', parsed_ok should be true

-- Verify
do $$
begin
  assert (select count(*) from information_schema.columns 
          where table_name = 'les_uploads' and column_name = 'entry_type') = 1,
    'entry_type column not added';
  raise notice 'Manual entry support added successfully';
end $$;

