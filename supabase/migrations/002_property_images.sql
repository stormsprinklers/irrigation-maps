-- Add stylized property image columns and storage bucket

alter table public.properties
  add column if not exists stylized_image_url text,
  add column if not exists source_image_url text;

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload own property images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Authenticated users can update own property images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Authenticated users can delete own property images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Public read property images"
  on storage.objects for select
  to public
  using (bucket_id = 'property-images');
