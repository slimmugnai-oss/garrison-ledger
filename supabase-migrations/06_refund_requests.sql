-- 06_refund_requests.sql
create table if not exists public.refund_requests (
  id bigserial primary key,
  created_at timestamptz default now(),
  user_id text not null,
  email text,
  reason text,
  stripe_subscription_id text,
  status text default 'pending'
);

