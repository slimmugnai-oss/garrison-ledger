-- Content blocks table for rendering full sections from toolkit HTML
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists unaccent;

create table if not exists public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  source_page text not null,              -- e.g., pcs-hub, deployment
  slug text not null,                     -- kebab-case of section header
  title text not null,
  html text not null,                     -- sanitized HTML
  tags text[] not null default '{}',
  horder int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists content_blocks_source_slug_idx
  on public.content_blocks(source_page, slug);

alter table public.content_blocks add column if not exists search_tsv tsvector;

update public.content_blocks
set search_tsv = to_tsvector('simple', unaccent(coalesce(title,'') || ' ' || coalesce(html,'')));

create index if not exists content_blocks_tsv_idx on public.content_blocks using gin (search_tsv);
create index if not exists content_blocks_tags_idx on public.content_blocks using gin (tags);

create or replace function public.content_blocks_tsv_trigger()
returns trigger language plpgsql as $$
begin
  new.search_tsv := to_tsvector('simple', unaccent(coalesce(new.title,'') || ' ' || coalesce(new.html,'')));
  return new;
end; $$;

drop trigger if exists content_blocks_tsv_trg on public.content_blocks;
create trigger content_blocks_tsv_trg
before insert or update on public.content_blocks
for each row execute function public.content_blocks_tsv_trigger();

