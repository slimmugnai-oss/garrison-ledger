-- Binder files metadata table
create table if not exists binder_files (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  object_path text not null,         -- e.g. userId/PCS Documents/uuid.pdf
  folder text not null,              -- Personal Records | PCS Documents | Financial Records | Housing Records | Legal
  doc_type text,                     -- orders | poa | birth_cert | lease | deed | tax_return | insurance | other
  display_name text not null,        -- user-facing file name
  size_bytes bigint,
  content_type text,
  expires_on date,                   -- for reminders (optional)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_binder_files_user_folder on binder_files (user_id, folder);
create index if not exists idx_binder_files_user_doctype on binder_files (user_id, doc_type);
create index if not exists idx_binder_files_expires on binder_files (user_id, expires_on) where expires_on is not null;

-- RLS policies for binder_files
alter table binder_files enable row level security;

create policy "binder_files_select_own"
on binder_files for select
using (user_id = auth.uid()::text);

create policy "binder_files_insert_own"
on binder_files for insert
with check (user_id = auth.uid()::text);

create policy "binder_files_update_own"
on binder_files for update
using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);

create policy "binder_files_delete_own"
on binder_files for delete
using (user_id = auth.uid()::text);

-- Binder shares table (for V2, but structure now)
create table if not exists binder_shares (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  file_id uuid not null references binder_files(id) on delete cascade,
  token text not null unique,        -- random slug
  can_download boolean default true,
  expires_at timestamptz,            -- null = manual revoke only
  created_at timestamptz default now(),
  revoked_at timestamptz             -- soft delete
);

create index if not exists idx_binder_shares_token on binder_shares (token);
create index if not exists idx_binder_shares_user on binder_shares (user_id);

-- RLS policies for binder_shares
alter table binder_shares enable row level security;

create policy "binder_shares_select_own"
on binder_shares for select
using (user_id = auth.uid()::text);

create policy "binder_shares_insert_own"
on binder_shares for insert
with check (user_id = auth.uid()::text);

create policy "binder_shares_update_own"
on binder_shares for update
using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);

create policy "binder_shares_delete_own"
on binder_shares for delete
using (user_id = auth.uid()::text);

-- Function to automatically update updated_at timestamp
create or replace function update_binder_files_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_binder_files_timestamp
before update on binder_files
for each row
execute function update_binder_files_updated_at();

