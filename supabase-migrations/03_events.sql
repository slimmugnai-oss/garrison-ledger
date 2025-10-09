-- 03_events.sql
create table if not exists public.events (
  id bigserial primary key,
  created_at timestamptz default now(),
  user_id text,                  -- Clerk user id or null
  name text not null,            -- e.g., 'sdp_view'
  path text,                     -- window.location.pathname
  props jsonb,                   -- arbitrary payload
  ua text                        -- user-agent
);
-- optional index
create index if not exists events_name_created_idx on public.events(name, created_at desc);

