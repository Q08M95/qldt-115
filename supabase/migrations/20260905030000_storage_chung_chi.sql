-- =====================================================================
-- QLĐT 115 — Migration Giai đoạn 3: Storage bucket cho chứng chỉ
-- Quy uoc duong dan file: {profile_id}/{ten_file}
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('chung-chi', 'chung-chi', false)
on conflict (id) do nothing;

-- SELECT: is_quan_ly() (admin+quan_ly_dao_tao doc tat ca) hoac chinh chu cua thu muc.
create policy chung_chi_storage_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'chung-chi'
    and (public.is_quan_ly() or (storage.foldername(name))[1] = auth.uid()::text)
  );

-- INSERT: admin hoac chinh chu (khop dung ma tran chung_chi: giang_vien/tro_giang CRUD cua chinh minh).
create policy chung_chi_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'chung-chi'
    and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  );

create policy chung_chi_storage_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'chung-chi'
    and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  )
  with check (
    bucket_id = 'chung-chi'
    and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  );

create policy chung_chi_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'chung-chi'
    and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  );
