-- Create life_binder storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'life_binder',
  'life_binder',
  false,
  10737418240, -- 10 GB max
  array[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
on conflict (id) do nothing;

-- RLS policies for life_binder bucket
-- Users can only access their own files (path must start with their user_id)

create policy "binder_select_own"
on storage.objects for select
using (
  bucket_id = 'life_binder'
  and (
    owner = auth.uid()
    or (split_part(name, '/', 1) = auth.uid()::text)
  )
);

create policy "binder_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'life_binder'
  and (split_part(name, '/', 1) = auth.uid()::text)
);

create policy "binder_update_own"
on storage.objects for update
using (
  bucket_id = 'life_binder'
  and (
    owner = auth.uid()
    or (split_part(name, '/', 1) = auth.uid()::text)
  )
)
with check (
  bucket_id = 'life_binder'
  and (split_part(name, '/', 1) = auth.uid()::text)
);

create policy "binder_delete_own"
on storage.objects for delete
using (
  bucket_id = 'life_binder'
  and (
    owner = auth.uid()
    or (split_part(name, '/', 1) = auth.uid()::text)
  )
);
