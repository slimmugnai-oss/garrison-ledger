-- Add summary column to content_blocks for concise previews
alter table if exists public.content_blocks
add column if not exists summary text;


