-- Add topics taxonomy to content_blocks for richer personalization and filters
alter table if exists public.content_blocks
add column if not exists topics text[] default '{}'::text[];

create index if not exists content_blocks_topics_gin on public.content_blocks using gin(topics);


