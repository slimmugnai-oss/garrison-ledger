-- Create task_statuses to persist user checklist progress
create table if not exists public.task_statuses (
  user_id text not null,
  content_block_slug text not null,
  status text not null check (status in ('incomplete','complete')),
  updated_at timestamptz not null default now(),
  primary key (user_id, content_block_slug)
);

create index if not exists task_statuses_user_idx on public.task_statuses(user_id);


