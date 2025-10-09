-- 05_assessments.sql
create table if not exists public.assessments (
  user_id text primary key,
  answers jsonb not null,
  updated_at timestamptz default now()
);

