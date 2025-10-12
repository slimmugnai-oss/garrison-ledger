-- Add type column for atomic content architecture
alter table if exists public.content_blocks
add column if not exists type text default 'guide';

-- Add constraint for valid types
alter table if exists public.content_blocks
add constraint valid_content_type check (type in ('tool', 'checklist', 'pro_tip_list', 'faq_section', 'guide', 'calculator'));

-- Index for filtering by type
create index if not exists content_blocks_type_idx on public.content_blocks(type);

comment on column public.content_blocks.type is 'Atomic content type: tool, checklist, pro_tip_list, faq_section, guide, calculator';

