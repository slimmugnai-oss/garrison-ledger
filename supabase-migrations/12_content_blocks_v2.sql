-- Content Blocks V2: richer schema + FTS on text_content
create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- Ensure columns exist (migrate from v1 if present)
do $$ begin
  if not exists (
    select 1 from information_schema.tables where table_schema='public' and table_name='content_blocks'
  ) then
    create table public.content_blocks (
      id uuid primary key default gen_random_uuid(),
      source_page text not null,
      slug text not null,
      hlevel int not null,
      title text not null,
      html text not null,
      text_content text not null,
      block_type text not null default 'section',
      tags text[] not null default '{}',
      horder int not null default 0,
      est_read_min int not null default 1,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  else
    perform 1;
  end if;
end $$;

-- Add/align columns for v2
alter table public.content_blocks add column if not exists hlevel int;
alter table public.content_blocks add column if not exists text_content text;
alter table public.content_blocks add column if not exists block_type text not null default 'section';
alter table public.content_blocks add column if not exists est_read_min int not null default 1;

-- Backfill minimal text_content from html if missing
update public.content_blocks
set text_content = coalesce(text_content, regexp_replace(html, '<[^>]*>', ' ', 'g'))
where text_content is null;

-- Backfill minimal hlevel if missing
update public.content_blocks set hlevel = 2 where hlevel is null;

create unique index if not exists content_blocks_source_slug_idx
  on public.content_blocks(source_page, slug);

alter table public.content_blocks add column if not exists search_tsv tsvector;

update public.content_blocks
set search_tsv = to_tsvector('simple', unaccent(coalesce(title,'') || ' ' || coalesce(text_content,'')));

create index if not exists content_blocks_tsv_idx on public.content_blocks using gin (search_tsv);
create index if not exists content_blocks_tags_idx on public.content_blocks using gin (tags);

create or replace function public.content_blocks_tsv_trigger()
returns trigger language plpgsql as $$
begin
  new.search_tsv := to_tsvector('simple', unaccent(coalesce(new.title,'') || ' ' || coalesce(new.text_content,'')));
  return new;
end; $$;

drop trigger if exists content_blocks_tsv_trg on public.content_blocks;
create trigger content_blocks_tsv_trg
before insert or update on public.content_blocks
for each row execute function public.content_blocks_tsv_trigger();

