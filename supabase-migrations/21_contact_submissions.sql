-- Contact form submissions table
create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  ticket_id text not null unique,
  user_id text references profiles(id) on delete set null,
  name text not null,
  email text not null,
  subject text not null,                -- general | technical | billing | feature | bug | feedback | other
  urgency text not null default 'low',  -- low | medium | high
  message text not null,
  variant text not null default 'public', -- public | dashboard
  status text not null default 'new',   -- new | in_progress | resolved | closed
  admin_notes text,
  resolved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_contact_submissions_ticket on contact_submissions (ticket_id);
create index if not exists idx_contact_submissions_user on contact_submissions (user_id);
create index if not exists idx_contact_submissions_status on contact_submissions (status);
create index if not exists idx_contact_submissions_created on contact_submissions (created_at desc);
create index if not exists idx_contact_submissions_urgency on contact_submissions (urgency) where status != 'resolved' and status != 'closed';

-- RLS policies for contact_submissions
alter table contact_submissions enable row level security;

-- Users can view their own submissions
create policy "contact_submissions_select_own"
on contact_submissions for select
using (user_id = auth.uid()::text or user_id is null);

-- Anyone can insert (for public contact form)
create policy "contact_submissions_insert_any"
on contact_submissions for insert
with check (true);

-- Only authenticated users can update their own submissions (for additional info)
create policy "contact_submissions_update_own"
on contact_submissions for update
using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);

-- Function to automatically update updated_at timestamp
create or replace function update_contact_submissions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_contact_submissions_timestamp
before update on contact_submissions
for each row
execute function update_contact_submissions_updated_at();

