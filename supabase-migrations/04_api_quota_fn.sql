-- 04_api_quota_fn.sql
create or replace function public.api_quota_inc(p_user_id text, p_route text, p_day date)
returns table(count integer)
language plpgsql
as $$
begin
  insert into public.api_quota(user_id, route, day, count)
  values (p_user_id, p_route, p_day, 1)
  on conflict (user_id, route, day)
  do update set count = public.api_quota.count + 1
  returning public.api_quota.count into count;
  return next;
end;
$$;

