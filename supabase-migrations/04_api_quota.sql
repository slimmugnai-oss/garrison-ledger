-- 04_api_quota.sql
create table if not exists public.api_quota (
  user_id text not null,
  route text not null,
  day date not null default (now()::date),
  count integer not null default 0,
  primary key (user_id, route, day)
);

